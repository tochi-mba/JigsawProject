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
  Class,
  DefaultGraph,
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorLabelModel,
  FilteredGraphWrapper,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GroupNodeLabelModel,
  GroupNodeStyle,
  HierarchicLayout,
  IEdge,
  IGraph,
  INode,
  LayoutExecutor,
  License,
  Size,
  UndoUnitBase
} from 'yfiles'

import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import graphData from './graph-data.json'

/**
 * Application Features - Filtering
 *
 * This demo shows how to enable filtering on an {@link IGraph}.
 * Filtering temporarily removes nodes or edges from the graph.
 * @type {GraphComponent}
 */
let graphComponent

/**
 * Bootstraps the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // Initialize the GraphComponent
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // Creates a new GraphEditorInputMode instance and registers it as the main
  // input mode for the graphComponent
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE
  })

  // create the filtered Graph
  const filteredGraph = createFilterGraph()

  // assign the filtered graph to the graph component
  graphComponent.graph = filteredGraph

  // fullGraph is the Original graph wrapped by the filtered Graph
  const fullGraph = filteredGraph.wrappedGraph

  // make sure state tags are on all created items
  fullGraph.addNodeCreatedListener((_, evt) => (evt.item.tag = { filtered: false }))
  fullGraph.addEdgeCreatedListener((_, evt) => (evt.item.tag = { filtered: false }))

  // configures default styles for newly created graph elements
  initializeGraph(fullGraph)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  Class.ensure(LayoutExecutor)
  graphComponent.graph.applyLayout(
    new HierarchicLayout({ orthogonalRouting: true, minimumLayerDistance: 35 })
  )
  graphComponent.fitGraphBounds()

  // enable now the undo engine to prevent undoing of the graph creation
  graphComponent.graph.undoEngineEnabled = true

  // update the reset filter button depending on the current graph state
  graphComponent.graph.undoEngine.addUnitUndoneListener(updateResetButtonState)
  graphComponent.graph.undoEngine.addUnitRedoneListener(updateResetButtonState)

  // bind the buttons to their functionality
  initializeUI()
}

/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
 * @param {!IGraph} graph
 * @param {!JSONGraph} graphData
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({
    data: graphData.nodeList.filter((item) => !item.isGroup),
    id: (item) => item.id,
    parentId: (item) => item.parentId
  })

  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter((item) => item.isGroup),
      id: (item) => item.id
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

/**
 * Creates a filtered graph which wraps the full graph.
 *
 * @returns {!FilteredGraphWrapper} The filtered graph.
 */
function createFilterGraph() {
  // the unfiltered, unfolded master graph
  const fullGraph = new DefaultGraph()

  // set default styles for newly created graph elements
  initializeGraph(fullGraph)

  // we want to hide items whose tag contains the string 'filtered'
  const nodePredicate = (node) => !node.tag || !node.tag.filtered
  const edgePredicate = (edge) => !edge.tag || !edge.tag.filtered

  // create a filtered graph
  return new FilteredGraphWrapper(fullGraph, nodePredicate, edgePredicate)
}

/**
 * Hides the selected items.
 */
function filterItems() {
  // mark the selected items such that the nodePredicate or edgePredicate will filter them
  graphComponent.selection.selectedNodes.forEach((node) => {
    filterItemWithUndoUnit(node, true)
  })
  graphComponent.selection.selectedEdges.forEach((edge) => {
    filterItemWithUndoUnit(edge, true)
  })

  // re-evaluate the filter predicates to actually hide the items
  const filteredGraph = graphComponent.graph
  filteredGraph.nodePredicateChanged()
  filteredGraph.edgePredicateChanged()
}

/**
 * Restores the filtered items.
 */
function restoreItems() {
  // access the unfiltered, unfolded graph to remove the filter mark from all items
  const filteredGraph = graphComponent.graph
  const fullGraph = filteredGraph.wrappedGraph
  fullGraph.nodes.forEach((node) => {
    filterItemWithUndoUnit(node, false)
  })
  fullGraph.edges.forEach((edge) => {
    filterItemWithUndoUnit(edge, false)
  })

  // re-evaluate the filter predicates to actually show the items again
  filteredGraph.nodePredicateChanged()
  filteredGraph.edgePredicateChanged()
}

/**
 * Changes the filtered state of the tag of an edge or node while also adding an undo unit for it.
 * @param {!(INode|IEdge)} item
 * @param {boolean} state
 */
function filterItemWithUndoUnit(item, state) {
  graphComponent.graph.undoEngine.addUnit(
    new ChangeFilterStateUndoUnit(graphComponent.graph, item.tag)
  )
  item.tag.filtered = state
}

/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param {!IGraph} graph The graph.
 */
function initializeGraph(graph) {
  // set styles for this demo
  initDemoStyles(graph)

  // set the style, label and label parameter for group nodes
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: '#242265',
    tabPosition: 'top-trailing',
    stroke: '2px solid #242265',
    cornerRadius: 8,
    tabWidth: 70,
    contentAreaInsets: 8
  })
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'right',
    textFill: '#FFF',
    insets: [0, 10, 0, 0]
  })
  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createDefaultParameter()

  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('south')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

/**
 * Binds the buttons in the toolbar to their functionality.
 */
function initializeUI() {
  const filterItemsButton = document.querySelector('#filter-items')
  filterItemsButton.addEventListener('click', () => {
    // filtering items
    filterItems()
    // enable the reset button
    resetFilterButton.disabled = false
  })

  const resetFilterButton = document.querySelector('#reset-filter')
  resetFilterButton.addEventListener('click', () => {
    // restoring items
    restoreItems()
    // disable the reset button
    resetFilterButton.disabled = true
  })

  // adds a listener for the current selection to enable/disable the filter button
  graphComponent.selection.addItemSelectionChangedListener(() => {
    filterItemsButton.disabled = graphComponent.selection.size === 0
  })
}

/**
 * Updates the 'Reset Filter' button state based on the current graph state.
 */
function updateResetButtonState() {
  const fullGraph = graphComponent.graph.wrappedGraph
  const hasFilteredItems =
    fullGraph.nodes.some((node) => node.tag && node.tag.filtered) ||
    fullGraph.edges.some((edge) => edge.tag && edge.tag.filtered)
  // set the reset button
  document.querySelector('#reset-filter').disabled = !hasFilteredItems
}

/**
 * An undo unit to keep track of the filtered state changes on the graph items.
 */
class ChangeFilterStateUndoUnit extends UndoUnitBase {
  filteredGraph
  tag
  oldState
  newState = false

  /**
   * @param {!FilteredGraphWrapper} filteredGraph
   * @param {!object} tag
   */
  constructor(filteredGraph, tag) {
    super('ChangeFilterState')
    this.filteredGraph = filteredGraph
    // remember the changed object
    this.tag = tag
    // remember the old value
    this.oldState = this.tag.filtered
  }

  undo() {
    // remember the new value for redo
    this.newState = this.tag.filtered
    // set the old value
    this.tag.filtered = this.oldState
    this.filteredGraph.nodePredicateChanged()
    this.filteredGraph.edgePredicateChanged()
  }

  redo() {
    // set the new value
    this.tag.filtered = this.newState
    this.filteredGraph.nodePredicateChanged()
    this.filteredGraph.edgePredicateChanged()
  }
}

run().then(finishLoading)
