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
  FilteredGraphWrapper,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphOverviewComponent,
  IEdge,
  INode,
  License,
  MouseEventRecognizers,
  TreeAnalysis
} from 'yfiles'

import { initializeNodePopups } from './node-popup-toolbar.js'
import { MindMapEdgeStyle } from './styles/MindMapEdgeStyle.js'
import { MindMapOverviewGraphVisualCreator } from './styles/MindMapOverviewGraphVisualCreator.js'
import { layoutTree } from './mind-map-layout.js'
import { initializeCommands } from './interaction/commands.js'

import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

import { hobbies } from './resources/hobbies.js'
import { getNodeData, isCollapsed, isCrossReference } from './data-types.js'
import { initializeStyles, updateStyles } from './styles/styles-support.js'
import { adjustNodeBounds, getInEdge, initializeSubtrees } from './subtrees.js'
import { initializeCrossReferences } from './cross-references.js'
import { useSingleSelection } from './interaction/single-selection.js'
import { ContentRectViewportLimiter } from './interaction/ContentRectViewportLimiter.js'
import { EditOneLabelHelper } from './interaction/EditOneLabelHelper.js'
import { MindMapFocusIndicatorManager } from './MindMapFocusIndicatorManager.js'
import { applyDemoTheme } from 'demo-resources/demo-styles'

// This demo shows how to implement a mind map viewer and editor.
//
// The demo provides the following features:
// - Create and delete nodes using a popup menu or keyboard shortcuts
// - Relocate or delete subtrees
// - Save and load the mind map
// - Collapse and expand nodes
// - Decorate nodes with state icons
// - Edit the color of nodes
// - Add cross-reference edges between nodes

/**
 * The GraphComponent
 * @type {GraphComponent}
 */
let graphComponent

/**
 * A filtered graph hiding the collapsed nodes.
 * @type {FilteredGraphWrapper}
 */
let filteredGraph

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // initialize the GraphComponent and GraphOverviewComponent
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  const overviewComponent = new GraphOverviewComponent('overviewComponent', graphComponent)

  initializeGraphComponent()
  initializeStyles()
  initializeGraphFiltering()
  initializeInputModes()
  initializeSubtrees(graphComponent)
  initializeCrossReferences(graphComponent)
  initializeNodePopups(graphComponent)

  const graph = graphComponent.graph

  await buildGraph(graph)

  // configure overview panel
  overviewComponent.graphVisualCreator = new MindMapOverviewGraphVisualCreator(graph)

  // add custom commands to interact with the mind map
  initializeCommands(graphComponent)
}

/**
 * Initializes the graphComponent.
 * Adds a view port limiter to limit panning, when the graph fits in the graphComponent, adds
 * a custom focusIndicatorManager and configures the label editing.
 */
function initializeGraphComponent() {
  graphComponent.viewportLimiter = new ContentRectViewportLimiter()
  // enables undo
  graphComponent.graph.undoEngineEnabled = true

  // set the maximum zoom factor of viewport to 2.0
  graphComponent.maximumZoom = 2.0

  // render the focus for the root in front of the node and for the other nodes behind
  graphComponent.focusIndicatorManager = new MindMapFocusIndicatorManager()

  const nodeDecorator = graphComponent.graph.decorator.nodeDecorator

  // prevent adding more than one label to a cross-reference edge or a node
  graphComponent.graph.decorator.edgeDecorator.editLabelHelperDecorator.setImplementation(
    new EditOneLabelHelper()
  )
  nodeDecorator.editLabelHelperDecorator.setImplementation(new EditOneLabelHelper())

  // hide selection
  nodeDecorator.selectionDecorator.hideImplementation()
}

/**
 * Initializes and customizes the input mode.
 * The mind map demo uses a customized version of the {@link GraphEditorInputMode} to implement
 * interactions. Various options must be set to custom values to ensure desired behaviour.
 */
function initializeInputModes() {
  const graphEditorInputMode = new GraphEditorInputMode({
    allowCreateNode: false,
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.EDGE_LABEL,
    clickSelectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    movableItems: GraphItemTypes.NODE,
    showHandleItems: GraphItemTypes.EDGE,
    labelEditableItems:
      GraphItemTypes.LABEL_OWNER | GraphItemTypes.NODE_LABEL | GraphItemTypes.EDGE_LABEL,
    deletableItems: GraphItemTypes.NONE,
    allowClipboardOperations: false,
    autoRemoveEmptyLabels: false,
    contextMenuItems: GraphItemTypes.NODE,
    focusableItems: GraphItemTypes.NODE
  })
  // when the label text is updated, the node bounds have to be recalculated so that the label fits in
  // the corresponding 'branch', also a new layout is needed
  graphEditorInputMode.addLabelTextChangedListener(async (_, evt) => {
    const label = evt.item
    if (label.owner instanceof INode) {
      adjustNodeBounds(label.owner, filteredGraph.wrappedGraph)
      await layoutTree(graphComponent)
    }
  })

  // enable panning without ctrl-key pressed
  graphEditorInputMode.moveViewportInputMode.pressedRecognizer = MouseEventRecognizers.LEFT_DOWN
  graphEditorInputMode.moveInputMode.priority =
    graphEditorInputMode.moveViewportInputMode.priority - 1

  // make only the nodes and the cross-reference edges selectable
  graphEditorInputMode.selectablePredicate = (item) => {
    if (item instanceof IEdge) {
      return isCrossReference(item)
    }
    return item instanceof INode
  }

  graphComponent.inputMode = graphEditorInputMode

  // disable selection of multiple elements simultaneously
  useSingleSelection(graphComponent)
}

/**
 * Initializes filtering for hiding nodes.
 */
function initializeGraphFiltering() {
  const graph = graphComponent.graph

  /**
   * Determines whether a node's parent is collapsed, so it should not be visible.
   */
  function nodePredicate(node) {
    const edge = getInEdge(node, filteredGraph.wrappedGraph)
    if (edge) {
      const parent = edge.sourceNode
      return !isCollapsed(parent) && nodePredicate(parent)
    }
    return true
  }

  filteredGraph = new FilteredGraphWrapper(graph, nodePredicate)
  graphComponent.graph = filteredGraph
}

/**
 * Creates the graph from the given dataset.
 * After building the graph, for each node we have to calculate its data needed for visualization
 * and interaction. Also, node and edge styles have to be applied, and finally, the complete graph
 * has to be arranged.
 * @param {!IGraph} graph
 * @returns {!Promise}
 */
async function buildGraph(graph) {
  // use the graphBuilder to create the graph
  const graphBuilder = new GraphBuilder(graph)
  const nodesSource = graphBuilder.createNodesSource(hobbies.concepts, 'id')
  const labelCreator = nodesSource.nodeCreator.createLabelBinding('text')
  labelCreator.defaults.style = new DefaultLabelStyle()
  const edgesSource = graphBuilder.createEdgesSource(hobbies.connections, 'from', 'to')
  edgesSource.edgeCreator.defaults.style = new MindMapEdgeStyle(1, 1)
  graphBuilder.buildGraph()

  // create the data information for each node needed for visualization and interaction
  initializeNodeData(graph)

  // create the styles for the nodes and edges based on the elements' data
  updateStyles(
    graph.nodes.find((node) => graph.inDegree(node) === 0),
    graph
  )
  // calculate the bounds for each node based on its label's size
  graph.nodes.forEach((node) => adjustNodeBounds(node, graph))
  graphComponent.fitGraphBounds()

  // arrange the graph using a tree layout
  await layoutTree(graphComponent)

  graphComponent.graph.undoEngine.clear()
}

/**
 * Initializes the data needed for the node visualization and interaction.
 * @param {!IGraph} graph
 */
function initializeNodeData(graph) {
  /**
   * Returns a lighter color than the given one based on the given depth.
   */
  function lighten(color, depth) {
    const amount = depth * 30
    return (
      '#' +
      color
        .substring(1)
        .replace(/../g, (colorValue) =>
          Math.min(255, Math.max(0, parseInt(colorValue, 16) + amount)).toString(16)
        )
    )
  }

  try {
    // Run a tree analysis algorithm to calculate the depth of each node,
    // i.e., the distance of a node from the root node.
    // Ignore the cross-reference edges, because they do not belong to the tree structure
    const treeAnalysis = new TreeAnalysis({
      subgraphEdges: (e) => !isCrossReference(e)
    })

    const analysisResult = treeAnalysis.run(graph)

    // set the node data for the root node
    const root = analysisResult.root
    const rootData = getNodeData(root)
    rootData.depth = analysisResult.getDepth(root)
    rootData.collapsed = false
    rootData.stateIcon = 0

    // calculate the node data for all other nodes
    const colors = ['#56926e', '#ff6c00', '#4281a4', '#AA5F82', '#db3a34']
    // get the direct neighbors of the root
    graph.neighbors(root).forEach((node, index) => {
      const nodeData = getNodeData(node)
      nodeData.depth = analysisResult.getDepth(node)
      nodeData.left = index % 2 === 0
      nodeData.color = colors[index % colors.length]
      nodeData.collapsed = false
      nodeData.stateIcon = 0
      // get the subtree of the node
      const subtreeNodes = analysisResult.getSubtree(node)
      subtreeNodes.nodes.forEach((subtreeNode) => {
        if (subtreeNode !== node) {
          const subtreeNodeData = getNodeData(subtreeNode)
          const depth = analysisResult.getDepth(subtreeNode)
          subtreeNodeData.depth = depth
          subtreeNodeData.left = nodeData.left
          subtreeNodeData.color = lighten(colors[index % colors.length], depth)
          subtreeNodeData.collapsed = false
          subtreeNodeData.stateIcon = 0
        }
      })
    })
  } catch (e) {
    if (e.name === 'InvalidOperationError') {
      alert(
        'This mind map graph is not a tree. Please mark the non-tree edges with type "cross-edge" in your dataset.'
      )
    }
  }
}

void run().then(finishLoading)
