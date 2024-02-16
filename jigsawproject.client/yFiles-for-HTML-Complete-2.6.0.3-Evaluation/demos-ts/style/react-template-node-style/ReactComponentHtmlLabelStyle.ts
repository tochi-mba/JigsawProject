/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.0.3.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
import type { ILabel, IRenderContext, TaggedHtmlVisual } from 'yfiles'
import {
  GraphComponent,
  HtmlVisual,
  LabelStyleBase,
  Size,
  type SizeConvertible,
  Visual,
  VisualCachingPolicy
} from 'yfiles'

import { type Root, createRoot } from 'react-dom/client'
import { type FunctionComponent, type ComponentClass, createElement } from 'react'
type RenderType<TTag> = FunctionComponent<TTag> | ComponentClass<TTag>

/**
 * Helper for the ReactComponentHtmlNodeStyle to factor out the props retrieval per node
 */
type TagProvider<P> = (context: IRenderContext, node: ILabel) => P

/**
 * The default implementation just uses the props from the tag of the item to be rendered.
 * @param context
 * @param node
 */
const defaultTagProvider: TagProvider<any> = (context, node) => node.tag

/**
 * The interface of the props passed to the HTML react component for rendering the label contents.
 */
export interface ReactComponentHtmlLabelStyleProps<TTag> {
  selected: boolean
  text: string
  detail: 'low' | 'high'
  tag: TTag
}

type Cache<TTag> = {
  props: ReactComponentHtmlLabelStyleProps<TTag>
  root: Root
}

/**
 * Utility type for type-safe implementation of the Visual that stores the props
 * it has been created for along with the React Root.
 */
type ReactComponentHtmlLabelStyleVisual<TTag> = TaggedHtmlVisual<HTMLDivElement, Cache<TTag>>

/**
 * Helper method that will be used by the below style to release React resources when the
 * label gets removed from the yFiles scene graph.
 */
function unmountReact(
  context: IRenderContext,
  removedVisual: Visual,
  dispose: boolean
): Visual | null {
  const visual = removedVisual as ReactComponentHtmlLabelStyleVisual<any>
  // In React.StrictMode, React warns about unmounting components synchronously during rendering which
  // may happen when React calls the cleanup callback of the component that contains the GraphComponent.
  // To prevent this warning, you can enable visual-caching by setting "graphComponent.visualCaching = 'always'"
  // and when the GraphComponent is cleaned up, asynchronously unmount the visual.
  const visualCaching = context.canvasComponent?.visualCaching === VisualCachingPolicy.ALWAYS
  if (visualCaching && dispose) {
    setTimeout(() => {
      visual.tag.root.unmount()
    }, 0)
  } else {
    visual.tag.root.unmount()
  }
  return null
}

/**
 * A simple ILabelStyle implementation that uses React Components/render functions
 * for rendering the label visualizations as an HtmlVisual
 * Use it like this:
 * ```
 *  declare type TagType = { name: string }
 *
 *  const MyHtmlLabelTemplate = ({ name }: TagType) => (
 *    <>
 *      <span>{name}</span>
 *   </>
 *  )
 *
 *  const style = new ReactComponentLabelStyle(MyHtmlLabelTemplate)
 *
 *  const tag: TagType = { name: 'yFiles' }
 *  graph.createLabel({ style, tag })
 * ```
 */
export class ReactComponentHtmlLabelStyle<TTag> extends LabelStyleBase<
  ReactComponentHtmlLabelStyleVisual<TTag>
> {
  public size: Size
  /**
   * Creates a new instance
   * @param reactComponent the React component rendering the HTML content
   * @param tagProvider the optional provider function that provides the "tag" in the props.
   * By default, this will use the node's tag.
   */
  constructor(
    private readonly reactComponent: RenderType<ReactComponentHtmlLabelStyleProps<TTag>>,
    size: Size | SizeConvertible,
    private readonly tagProvider: TagProvider<TTag> = defaultTagProvider
  ) {
    super()
    this.size = Size.from(size)
  }

  createProps(context: IRenderContext, label: ILabel): ReactComponentHtmlLabelStyleProps<TTag> {
    return {
      selected:
        context.canvasComponent instanceof GraphComponent &&
        context.canvasComponent.selection.selectedLabels.isSelected(label),
      text: label.text,
      detail: context.zoom < 0.5 ? 'low' : 'high',
      tag: this.tagProvider(context, label)
    }
  }

  protected createVisual(
    context: IRenderContext,
    label: ILabel
  ): ReactComponentHtmlLabelStyleVisual<TTag> {
    // obtain the properties from the label
    const props = this.createProps(context, label)

    // create a React root and render the component into
    const div = document.createElement('div')
    const root = createRoot(div)
    root.render(createElement(this.reactComponent, props))

    const cache = { props, root } satisfies Cache<TTag>
    // wrap the Dom element into a HtmlVisual, adding the "root" for later use in updateVisual
    const visual = HtmlVisual.from(div, cache)

    // set the CSS layout for the container
    HtmlVisual.setLayout(visual.element, label.layout.bounds)

    // register a callback that unmounts the React app when the visual is discarded
    context.setDisposeCallback(visual, unmountReact)
    return visual
  }

  protected updateVisual(
    context: IRenderContext,
    oldVisual: ReactComponentHtmlLabelStyleVisual<TTag>,
    label: ILabel
  ): ReactComponentHtmlLabelStyleVisual<TTag> {
    const newProps = this.createProps(context, label)

    const cache = oldVisual.tag
    const oldProps = cache.props
    if (
      oldProps.selected !== newProps.selected ||
      oldProps.detail !== newProps.detail ||
      oldProps.tag !== newProps.tag
    ) {
      const element = createElement<ReactComponentHtmlLabelStyleProps<TTag>>(
        this.reactComponent,
        newProps
      )
      oldVisual.tag.root.render(element)
      cache.props = newProps
    }

    // update the CSS layout of the container element
    HtmlVisual.setLayout(oldVisual.element, label.layout.bounds)

    return oldVisual
  }

  protected getPreferredSize(label: ILabel): Size {
    return Size.from(this.size)
  }
}
