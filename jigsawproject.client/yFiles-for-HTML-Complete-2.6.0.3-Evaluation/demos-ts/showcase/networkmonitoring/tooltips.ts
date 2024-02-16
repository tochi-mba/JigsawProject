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
import { type GraphInputMode, GraphItemTypes, type IEdge, type INode, Point } from 'yfiles'

// Allow ToolTips for nodes and edges, only
const toolTipItems = GraphItemTypes.NODE | GraphItemTypes.EDGE
type ToolTipItemType = INode | IEdge

/**
 * Initializes support for tooltips.
 *
 * For more information on tooltips, please see the
 * {@link https://docs.yworks.com/yfileshtml/#/dguide/interaction-support#interaction-tooltips developer's guide section about tooltips}
 * and the {@link https://www.yworks.com/demos/application-features/tooltips/ tooltips demo}.
 *
 * @param graphInputMode The graph component.
 * @param getToolTip Provides the tooltip content for a graph item.
 */
export function initializeToolTips(
  graphInputMode: GraphInputMode,
  getToolTip: (item: ToolTipItemType) => HTMLElement | string | null
): void {
  graphInputMode.toolTipItems = toolTipItems

  graphInputMode.addQueryItemToolTipListener((_, evt) => {
    if (evt.item) {
      evt.toolTip = getToolTip(evt.item as ToolTipItemType)
    }
  })

  // slightly offset the tooltip so that it does not interfere with the mouse
  graphInputMode.mouseHoverInputMode.toolTipLocationOffset = new Point(2, 14)

  // show the tooltip faster and for a longer time
  graphInputMode.mouseHoverInputMode.duration = '10s'
  graphInputMode.mouseHoverInputMode.delay = '0.5s'
}
