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
  DefaultLabelStyle,
  FreeEdgeLabelModel,
  FreeNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GroupNodeLabelModel,
  GroupNodeStyle,
  HorizontalTextAlignment,
  IArrow,
  License,
  PolylineEdgeStyle,
  Size
} from 'yfiles'
import { FlowchartNodeStyle, FlowchartNodeType } from './style/FlowchartStyle.js'

import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { configureTwoPointerPanning } from 'demo-utils/configure-two-pointer-panning'
import { finishLoading } from 'demo-resources/demo-page'
import {
  enableUI,
  getLayoutOptions,
  getSample,
  initializeOptionPanel
} from './option-panel/option-panel.js'
import { layoutFlowchart } from './layout/layout-flowchart.js'
import { loadFlowchart } from './model/load-flowchart.js'
import { enableGraphmlSupport } from './style/enable-graphml-support.js'
import { initializeSnapping } from './interaction/snapping.js'
import { initializeDnd } from './interaction/drag-and-drop.js'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  initializeOptionPanel(loadSample, runLayout)
  configureUserInteraction()
  initializeGraphDefaults()
  enableGraphmlSupport(graphComponent)

  await loadSample()
}

/**
 * @returns {!Promise}
 */
async function loadSample() {
  const sample = getSample()
  loadFlowchart(graphComponent, sample)
  await runLayout()
}

/**
 * @returns {!Promise}
 */
async function runLayout() {
  enableUI(false)
  const layoutOptions = getLayoutOptions()
  await layoutFlowchart(graphComponent, layoutOptions)
  enableUI(true)
}

/**
 * Configures the input mode for the given graphComponent.
 */
function configureUserInteraction() {
  const graphEditorInputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  initializeSnapping(graphEditorInputMode)
  initializeDnd(graphEditorInputMode)

  graphComponent.inputMode = graphEditorInputMode

  // use two-finger panning to allow easier editing with touch gestures
  configureTwoPointerPanning(graphComponent)
}

/**
 * Initializes defaults for the graph.
 */
function initializeGraphDefaults() {
  const graph = graphComponent.graph

  const nodeDefaults = graph.nodeDefaults
  nodeDefaults.style = new FlowchartNodeStyle(FlowchartNodeType.Start1)
  nodeDefaults.size = new Size(80, 40)
  nodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: HorizontalTextAlignment.CENTER
  })
  nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.INSTANCE.createDefaultParameter()

  const edgeDefaults = graph.edgeDefaults
  edgeDefaults.style = new PolylineEdgeStyle({
    targetArrow: IArrow.DEFAULT,
    smoothingLength: 20
  })
  edgeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: HorizontalTextAlignment.CENTER
  })
  edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createDefaultParameter()

  const groupNodeDefaults = graph.groupNodeDefaults
  groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: 'rgb(214, 229, 248)'
  })
  groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createTabBackgroundParameter()
}

void run().then(finishLoading)
