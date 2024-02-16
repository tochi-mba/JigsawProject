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
  EdgeRouter,
  EdgeRouterData,
  type GraphComponent,
  HierarchicLayout,
  HierarchicLayoutData,
  type ILayoutAlgorithm,
  type LayoutData,
  LayoutOrientation,
  PortConstraint,
  PortSide
} from 'yfiles'
import { disableUIElements, enableUIElements } from 'demo-resources/demo-page'

/**
 * Applies the selected layout algorithm.
 * @param graphComponent The GraphComponent where the layout is applied to
 * @param clearUndo True if the undo engine should be cleared, false otherwise
 * @param fitBounds Whether the viewport should be adjusted to fit the graph's bounds
 */
export async function runLayout(
  graphComponent: GraphComponent,
  clearUndo: boolean,
  fitBounds = true
): Promise<void> {
  const algorithmSelect = document.querySelector<HTMLSelectElement>('#algorithm-select-box')!
  const selectedIndex = algorithmSelect.selectedIndex

  let layout: ILayoutAlgorithm
  let layoutData: LayoutData

  if (selectedIndex === 0) {
    layout = new HierarchicLayout({
      layoutOrientation: LayoutOrientation.LEFT_TO_RIGHT,
      orthogonalRouting: true
    })
    layoutData = new HierarchicLayoutData({
      sourcePortConstraints: (_) => PortConstraint.create(PortSide.EAST, true),
      targetPortConstraints: (_) => PortConstraint.create(PortSide.WEST, true)
    })
  } else {
    layout = new EdgeRouter()
    layoutData = new EdgeRouterData({
      sourcePortConstraints: (_) => PortConstraint.create(PortSide.EAST, true),
      targetPortConstraints: (_) => PortConstraint.create(PortSide.WEST, true)
    })
  }

  disableUIElements('#algorithm-select-box', '#layout-button')
  try {
    await graphComponent.morphLayout(layout, '0.5s', layoutData, fitBounds)
    if (fitBounds) {
      graphComponent.fitGraphBounds()
    }
  } finally {
    enableUIElements()
    if (clearUndo) {
      graphComponent.graph.undoEngine!.clear()
    }
  }
}
