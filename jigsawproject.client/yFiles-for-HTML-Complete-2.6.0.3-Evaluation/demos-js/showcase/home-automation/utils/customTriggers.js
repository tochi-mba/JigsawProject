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
import { runLayout } from '../layout/runLayout.js'
import { GraphComponent, GraphEditorInputMode, GridVisualCreator } from 'yfiles'

/**
 * @param {!GraphComponent} graphComponent
 */
export async function runAutoLayout(graphComponent) {
  const layoutButton = document.querySelector('#layoutButton')
  // disable and re-enable the button before and after morphing the layout
  layoutButton.setAttribute('disabled', 'disabled')
  try {
    await runLayout(graphComponent)
  } catch (e) {
    alert(`An error occurred during layout ${e}`)
  } finally {
    layoutButton.removeAttribute('disabled')
  }
}

/**
 * @param {!GraphComponent} graphComponent
 * @param {!GridVisualCreator} grid
 */
export function triggerGridDisplay(graphComponent, grid) {
  const gridButton = document.querySelector('#grid-button')
  const gcInputModeSnapContext = graphComponent.inputMode.snapContext
  grid.visible = gridButton.checked
  if (gcInputModeSnapContext) {
    gcInputModeSnapContext.enabled = gridButton.checked
  }
  graphComponent.invalidate() // triggers repaint
}
