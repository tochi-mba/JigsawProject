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
import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Type
} from '@angular/core'
import { NodeStyleBase, HtmlVisual, INode, IRenderContext, Visual, TaggedHtmlVisual } from 'yfiles'

type InputProvider<P extends object> = (context: IRenderContext, node: INode) => P

const defaultInputProvider: InputProvider<any> = (context, node) => ({ tag: node.tag })

type AngularNodeStyleVisual<C> = TaggedHtmlVisual<HTMLDivElement, ComponentRef<C>>
/**
 * An {@link INodeStyle} implementation that renders an Angular component as the visualization for a node.
 */
export class AngularNodeComponentStyle<C> extends NodeStyleBase<AngularNodeStyleVisual<C>> {
  private static readonly COMPONENT_KEY = Symbol('AngularComponentNodeStyle component')

  constructor(
    private component: Type<C>,
    private inputProvider = defaultInputProvider,
    private applicationRef: ApplicationRef,
    private envInj: EnvironmentInjector
  ) {
    super()
  }

  protected createVisual(renderContext: IRenderContext, node: INode): AngularNodeStyleVisual<C> {
    const div = renderContext.canvasComponent!.div.ownerDocument.createElement('div')

    const componentRef = createComponent(this.component, {
      hostElement: div,
      environmentInjector: this.envInj
    })
    // attach its host view to the application, so it's included in the change detection cycle
    this.applicationRef.attachView(componentRef.hostView)
    this.setInputs(componentRef, this.inputProvider(renderContext, node))

    const visual = HtmlVisual.from(div, componentRef)

    HtmlVisual.setLayout(visual.element, node.layout)

    // register a callback that destroys the Angular component when the visual is discarded
    renderContext.setDisposeCallback(
      visual,
      (context: IRenderContext, visual: Visual, dispose: boolean) => {
        const component = (visual as AngularNodeStyleVisual<C>).tag
        if (component) {
          component.destroy()
        }
        return null
      }
    )

    return visual
  }

  protected override updateVisual(
    context: IRenderContext,
    oldVisual: AngularNodeStyleVisual<C>,
    node: INode
  ): AngularNodeStyleVisual<C> {
    const componentRef = oldVisual.tag
    this.setInputs(componentRef, this.inputProvider(context, node))
    HtmlVisual.setLayout(oldVisual.element, node.layout)
    return oldVisual
  }

  private setInputs(componentRef: ComponentRef<C>, inputs: object) {
    for (const [key, value] of Object.entries(inputs)) {
      componentRef.setInput(key, value)
    }
    componentRef.hostView.detectChanges()
  }
}
