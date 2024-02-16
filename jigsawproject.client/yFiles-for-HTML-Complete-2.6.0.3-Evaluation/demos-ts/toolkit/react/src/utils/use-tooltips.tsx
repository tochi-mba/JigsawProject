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
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  IEdge,
  IModelItem,
  INode,
  Point,
  QueryItemToolTipEventArgs,
  TimeSpan,
  type ToolTipQueryEventArgs
} from 'yfiles'
import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'

/**
 * The tooltip may either be a plain string or it can also be a rich HTML element. In this case, we
 * show the latter by using a dynamically compiled React component.
 * @param {IModelItem} item
 * @returns {HTMLElement}
 */
function createTooltipContent(item: IModelItem): HTMLDivElement {
  const title =
    item instanceof INode ? 'Node Data' : item instanceof IEdge ? 'Edge Data' : 'Label Data'
  const content = JSON.stringify(item.tag)

  const tooltipContainer = document.createElement('div')
  const root = createRoot(tooltipContainer)
  root.render(
    <div className="tooltip">
      <h4>{title}</h4>
      <p>{content}</p>
    </div>
  )

  return tooltipContainer
}

/**
 * Dynamic tooltips are implemented by adding a tooltip provider as an event handler for
 * the {@link MouseHoverInputMode#addQueryToolTipListener QueryToolTip} event of the
 * {@link GraphViewerInputMode} using the
 * {@link ToolTipQueryEventArgs} parameter.
 * The {@link ToolTipQueryEventArgs} parameter provides three relevant properties:
 * Handled, QueryLocation, and ToolTip. The Handled property is a flag which indicates
 * whether the tooltip was already set by one of possibly several tooltip providers. The
 * QueryLocation property contains the mouse position for the query in world coordinates.
 * The tooltip is set by setting the ToolTip property.
 */
export function useTooltips(graphComponent: GraphComponent) {
  useEffect(() => {
    const inputMode = graphComponent.inputMode as GraphViewerInputMode

    // show tooltips only for nodes, edges and labels
    inputMode.toolTipItems = GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.LABEL

    // Customize the tooltip's behavior to our liking.
    const mouseHoverInputMode = inputMode.mouseHoverInputMode
    mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15)
    mouseHoverInputMode.delay = TimeSpan.fromMilliseconds(500)
    mouseHoverInputMode.duration = TimeSpan.fromSeconds(5)

    // Register a listener for when a tooltip should be shown.
    const queryItemTooltipListener = (
      _: GraphViewerInputMode,
      evt: QueryItemToolTipEventArgs<IModelItem>
    ) => {
      if (evt.handled) {
        // Tooltip content has already been assigned -> nothing to do.
        return
      }

      // Use a rich HTML element as tooltip content. Alternatively, a plain string would do as well.
      evt.toolTip = createTooltipContent(evt.item!)

      // Indicate that the tooltip content has been set.
      evt.handled = true
    }
    inputMode.addQueryItemToolTipListener(queryItemTooltipListener)

    return () => {
      inputMode.removeQueryItemToolTipListener(queryItemTooltipListener)
    }
  }, [graphComponent])
}
