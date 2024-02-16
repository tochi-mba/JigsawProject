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
  DefaultFoldingEdgeConverter,
  EdgeRouter,
  EdgeRouterData,
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLSupport,
  IEdge,
  License,
  OrthogonalEdgeEditingContext,
  RoutingPolicy,
  Size,
  StorageLocation
} from 'yfiles'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

/** @type {GraphComponent} */
let graphComponent

const routingPolicy = document.querySelector('#select-routing-policy')

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // enable undo and folding
  graphComponent.graph.undoEngineEnabled = true
  const manager = new FoldingManager(graphComponent.graph)
  manager.foldingEdgeConverter.reuseMasterPorts = true
  const foldingView = manager.createFoldingView()
  foldingView.enqueueNavigationalUndoUnits = true
  graphComponent.graph = foldingView.graph

  // configure interaction
  graphComponent.inputMode = createInputMode()

  // configures default styles for newly created graph elements
  initDemoStyles(graphComponent.graph, { foldingEnabled: true })
  graphComponent.graph.nodeDefaults.shareStyleInstance = false
  graphComponent.graph.nodeDefaults.size = new Size(125, 100)

  // load the sample graph
  await loadSampleGraph()

  // bind the demo buttons to their functionality
  initializeUI()
}

/**
 * Loads the sample graph.
 * @returns {!Promise}
 */
async function loadSampleGraph() {
  const gs = new GraphMLSupport({
    graphComponent,
    storageLocation: StorageLocation.FILE_SYSTEM
  })

  await gs.graphMLIOHandler.readFromURL(graphComponent.graph, 'resources/sample.graphml')
  // when done - fit the bounds
  graphComponent.fitGraphBounds()
  // the sample graph bootstrapping should not be undoable
  graphComponent.graph.undoEngine.clear()
}

/**
 * Configure interaction.
 */
function createInputMode() {
  const mode = new GraphEditorInputMode()
  mode.allowGroupingOperations = true
  // disable bend handling: the edge path will be routed
  mode.createBendInputMode.enabled = false
  mode.showHandleItems = GraphItemTypes.NODE
  mode.selectableItems = GraphItemTypes.NODE
  mode.marqueeSelectableItems = GraphItemTypes.NODE
  mode.orthogonalEdgeEditingContext = new OrthogonalEdgeEditingContext()

  // register listener which trigger a re-routing after each
  mode.moveInputMode.addDragFinishedListener((_, evt) => reRouteEdges())
  mode.handleInputMode.addDragFinishedListener((_, evt) => reRouteEdges())
  mode.createEdgeInputMode.addEdgeCreatedListener((_, evt) => reRouteEdges())
  mode.addNodeCreatedListener((_, evt) => reRouteEdges())
  mode.addDeletedSelectionListener((_, evt) => reRouteEdges())
  mode.navigationInputMode.addGroupCollapsedListener((_, evt) => reRouteEdges())
  mode.navigationInputMode.addGroupExpandedListener((_, evt) => reRouteEdges())
  mode.addElementsPastedListener((_, evt) => reRouteEdges())
  return mode
}

/**
 * Re-Route the edges.
 *
 * The EdgeRouter will be used with its routingPolicy set to either PATH_AS_NEEDED or SEGMENTS_AS_NEEDED.
 * That way, the EdgeRouter itself will determine which edges need to be re-routed.
 * The different policies are selected with  the RoutingPolicy ComboBox in the tool bar:
 *    RoutingPolicy.PATH_AS_NEEDED: re-routes the entire path of a "dirty" edge.
 *    RoutingPolicy.SEGMENTS_AS_NEEDED: re-routes a dirty edge in a way that the
 *                                      existing path is kept as much as possible.
 * @returns {!Promise}
 */
async function reRouteEdges() {
  const router = new EdgeRouter()
  router.defaultEdgeLayoutDescriptor.routingPolicy =
    routingPolicy.options[routingPolicy.selectedIndex].value === 'path'
      ? RoutingPolicy.PATH_AS_NEEDED
      : RoutingPolicy.SEGMENTS_AS_NEEDED

  // keep existing edge groups
  const data = new EdgeRouterData({
    sourceGroupIds: (e) => `s: ${e.sourceNode.layout.center} - ${e.sourcePort.location}`,
    targetGroupIds: (e) => `t: ${e.targetNode.layout.center} - ${e.targetPort.location}`
  })

  await graphComponent.morphLayout({
    layout: router,
    layoutData: data,
    morphDuration: '0.5s',
    animateViewport: false,
    allowUserInteraction: false
  })
}

function initializeUI() {
  document.querySelector('#reload').addEventListener('click', loadSampleGraph)
}

run().then(finishLoading)
