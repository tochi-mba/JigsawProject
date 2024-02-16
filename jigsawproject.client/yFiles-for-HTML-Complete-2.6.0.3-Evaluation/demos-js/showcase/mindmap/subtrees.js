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
import { FilteredGraphWrapper, InteriorLabelModel, Rect, TreeAnalysis } from 'yfiles'
import {
  getDepth,
  getNodeData,
  isCrossReference,
  isLeft,
  isRoot,
  setNodeData
} from './data-types.js'
import { getEdgeStyle, updateStyles } from './styles/styles-support.js'
import { TagChangeUndoUnit } from './interaction/TagChangeUndoUnit.js'
import { layoutTree } from './mind-map-layout.js'
import { SubtreePositionHandler } from './interaction/MindMapPositionHandlers.js'

/**
 * Initializes the movement of subtrees.
 * A node can be dragged and relocated with its whole subtree to another part of the tree.
 * @param {!GraphComponent} graphComponent
 */
export function initializeSubtrees(graphComponent) {
  const inputMode = graphComponent.inputMode
  // register handlers for dragging and relocating subtrees
  inputMode.moveInputMode.addDragStartedListener((_) => prepareRelocateSubtree(graphComponent))
  inputMode.moveInputMode.addDraggedListener((_) => updateSubtreeStylesAndLayout(graphComponent))
  inputMode.moveInputMode.addDragCanceledListener((_) => resetSubtree(graphComponent))
  inputMode.moveInputMode.addDragFinishedListener((_) => relocateSubtree(graphComponent))

  // customize the position handler to move a whole subtree and update the styles and layout
  const filteredGraph = graphComponent.graph
  filteredGraph.decorator.nodeDecorator.positionHandlerDecorator.setImplementationWrapper(
    (item, implementation) => {
      return !isRoot(item) ? new SubtreePositionHandler(implementation) : null
    }
  )
}

/**
 * Holds the subtree's root node that is dragged.
 * When no node is currently dragged, it is reset to <code>undefined</code>.
 * @type {INode}
 */
let movedNode

/**
 * Holds the old node data.
 * This helps to restore any changes when reverting a drag operation with undo.
 * @type {NodeData}
 */
let oldNodeData

/**
 * Holds the style of the subtree root's in-edge to be able to restore it after the drag is canceled.
 * @type {IEdgeStyle}
 */
let oldInEdgeStyle

/**
 * Prepares to move the selected node and its subtree.
 * Information about the subtree is stored that helps undo or reset the relocation gesture.
 * @param {!GraphComponent} graphComponent
 */
export function prepareRelocateSubtree(graphComponent) {
  movedNode = graphComponent.selection.selectedNodes.at(0)
  if (movedNode) {
    // store the current node data to be able to undo
    const oldData = getNodeData(movedNode)
    oldNodeData = { ...oldData }

    // store the style of the current in edge of the subtree root to be able to cancel the gesture
    const inEdge = graphComponent.graph.inEdgesAt(movedNode).at(0)
    if (inEdge) {
      oldInEdgeStyle = inEdge.style
    }
  }
}

/**
 * Updates the styles while a subtree is moved.
 * The styles of nodes and edges change with the position of the nodes within the tree and need to
 * be updated when these positions change during a drag.
 * @param {!GraphComponent} graphComponent
 */
export function updateSubtreeStylesAndLayout(graphComponent) {
  const fullGraph = getFullGraph(graphComponent)
  const subtreeEdge = getInEdge(movedNode, fullGraph)
  if (subtreeEdge) {
    // update the depths and styles according to the new potential parent of the subtree root
    const depth = getDepth(subtreeEdge.sourceNode)
    setSubtreeDepths(fullGraph, movedNode, depth + 1)
    updateStyles(movedNode, fullGraph)
    fullGraph.setStyle(subtreeEdge, getEdgeStyle(depth))
  }
}

/**
 * Relocates the subtree when a new parent candidate was found, otherwise the subtree is deleted.
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise}
 */
export async function relocateSubtree(graphComponent) {
  const filteredGraph = graphComponent.graph
  const fullGraph = getFullGraph(graphComponent)
  graphComponent.selection.clear()

  // begin a compound undo operation
  const compoundEdit = graphComponent.graph.beginEdit('Set State Label', 'Set State Label')

  const subtreeEdge = getInEdge(movedNode, fullGraph)
  if (subtreeEdge) {
    // update the depths and styles according to the new parent of the subtree root
    setSubtreeDepths(fullGraph, movedNode, getDepth(subtreeEdge.sourceNode) + 1)
    updateStyles(movedNode, fullGraph)
    adjustNodeBounds(movedNode, fullGraph)
    collapseSubtree(subtreeEdge.sourceNode, false, filteredGraph)

    // add an undo unit because the node data has changed
    const newNodeData = getNodeData(movedNode)
    graphComponent.graph.undoEngine.addUnit(
      new TagChangeUndoUnit(
        'Set State Label',
        'Set State Label',
        oldNodeData,
        newNodeData,
        movedNode,
        (node) =>
          getSubtree(fullGraph, node).nodes.forEach((n) => {
            const nData = getNodeData(n)
            nData.left = isLeft(node)
          })
      )
    )
  } else {
    // there is no connection to the rest of the tree anymore

    // add an undo unit because the node data has changed during the drag
    const newTagData = getNodeData(movedNode)
    graphComponent.graph.undoEngine.addUnit(
      new TagChangeUndoUnit(
        'Set State Label',
        'Set State Label',
        oldNodeData,
        newTagData,
        movedNode,
        (node) => filteredGraph.nodePredicateChanged(node)
      )
    )

    // delete the whole subtree
    removeSubtree(fullGraph, movedNode)
  }

  // update the layout
  await layoutTree(graphComponent)

  compoundEdit.commit()

  movedNode = undefined
}

/**
 * Reverts the relocation of the subtree when the gesture is cancelled.
 * The depths and styles of the subtree nodes are restored,
 * and the subtree returns to its initial location.
 * @param {!GraphComponent} graphComponent
 */
export function resetSubtree(graphComponent) {
  graphComponent.selection.clear()
  const filteredGraph = graphComponent.graph
  const fullGraph = getFullGraph(graphComponent)
  const subtreeEdge = getInEdge(movedNode, fullGraph)
  if (subtreeEdge) {
    setSubtreeDepths(fullGraph, movedNode, getDepth(subtreeEdge.sourceNode) + 1)
    updateStyles(movedNode, fullGraph)
    adjustNodeBounds(movedNode, fullGraph)
    collapseSubtree(subtreeEdge.sourceNode, false, filteredGraph)
    // reset the in-edge's old style
    fullGraph.setStyle(subtreeEdge, oldInEdgeStyle)
  }
  movedNode = undefined
  oldInEdgeStyle = undefined
}

/**
 * Marks the given node as collapsed, which will result in hiding all of its children.
 * @param {!INode} node
 * @param {boolean} collapsed
 * @param {!FilteredGraphWrapper} filteredGraph
 */
export function collapseSubtree(node, collapsed, filteredGraph) {
  const oldData = node.tag
  const newData = { ...oldData, collapsed: collapsed }
  setNodeData(node, newData)

  // create a custom undo unit since the node data changed
  filteredGraph.undoEngine.addUnit(
    new TagChangeUndoUnit('Collapse/Expand', 'Collapse/Expand', oldData, newData, node, () =>
      filteredGraph.nodePredicateChanged()
    )
  )

  // tell the filtered graph to update the graph structure
  filteredGraph.nodePredicateChanged()
}

/**
 * Returns the mind map root node.
 * @param {!IGraph} graph
 * @returns {!INode}
 */
export function getRoot(graph) {
  // find the first node with no incoming mind map edges
  return graph.nodes.find((node) => !getInEdge(node, graph))
}

/**
 * Creates the arrays containing the nodes and edges of a given root's subtree.
 * @param {!IGraph} graph
 * @param {!INode} subtreeRoot
 * @returns {!object}
 */
export function getSubtree(graph, subtreeRoot) {
  const treeAnalysis = new TreeAnalysis({
    subgraphEdges: (e) => !isCrossReference(e)
  })
  const analysisResult = treeAnalysis.run(graph)
  const subtree = analysisResult.getSubtree(subtreeRoot)
  return { nodes: [...subtree.nodes], edges: [...subtree.edges] }
}

/**
 * Gets the first incoming edge that's not a cross-reference or null.
 * @param {!INode} node
 * @param {!IGraph} graph
 * @returns {?IEdge}
 */
export function getInEdge(node, graph) {
  return graph.inEdgesAt(node).find((edge) => !isCrossReference(edge))
}

/**
 * Creates a sibling node for a given node.
 * @param {!IGraph} graph The input graph.
 * @param {!INode} node The node.
 * @param {!INodeStyle} nodeStyle The style for the new sibling node.
 * @param {!IEdgeStyle} edgeStyle The style for the new edge connecting sibling and parent node.
 * @param {!ILabelStyle} labelStyle The style for the sibling node's label.
 * @returns {?INode} The newly created sibling.
 */
export function createSibling(graph, node, nodeStyle, edgeStyle, labelStyle) {
  const nodeData = getNodeData(node)
  // siblings can't be created for the root node
  if (!isRoot(node)) {
    const inEdge = getInEdge(node, graph)
    if (inEdge) {
      const parent = inEdge.sourceNode
      // create data for sibling
      const data = { ...nodeData, collapsed: false, stateIcon: 0 }
      const sibling = graph.createNode(node.layout.toRect(), nodeStyle, data)
      graph.addLabel(sibling, ' ', InteriorLabelModel.CENTER, labelStyle)
      graph.createEdge(parent, sibling, edgeStyle)
      adjustNodeBounds(sibling, graph)
      return sibling
    }
  }
  return null
}

/**
 * Creates a child node for a given parent.
 * @param {!IGraph} graph The input graph.
 * @param {!INode} parent The given parent node.
 * @param {!INodeStyle} nodeStyle The desired node style.
 * @param {!IEdgeStyle} edgeStyle The desired edge style.
 * @param {!ILabelStyle} labelStyle The desired label style.
 * @returns {!INode} The created child.
 */
export function createChild(graph, parent, nodeStyle, edgeStyle, labelStyle) {
  const parentNodeData = getNodeData(parent)
  let left = parentNodeData.left

  // if parent is root, find side to keep the tree balanced
  if (isRoot(parent)) {
    // get all edges starting at root and count left or right
    let balance = 0
    graph.outEdgesAt(parent).forEach((edge) => {
      if (!isCrossReference(edge)) {
        balance += isLeft(edge.targetNode) ? -1 : 1
      }
    })
    left = balance > 0
  }
  const nodeData = {
    depth: parentNodeData.depth + 1,
    left: left,
    color: '#4281a4',
    collapsed: false,
    stateIcon: 0
  }
  const node = graph.createNode(parent.layout.toRect(), nodeStyle, nodeData)
  graph.addLabel(node, '', InteriorLabelModel.CENTER, labelStyle)
  graph.createEdge(parent, node, edgeStyle)

  adjustNodeBounds(node, graph)
  return node
}

/**
 * Removes a node and its subtree.
 * @param {!IGraph} graph The input graph.
 * @param {!INode} subtreeRoot The root node of the subtree.
 */
export function removeSubtree(graph, subtreeRoot) {
  const nodesToCheck = [subtreeRoot]

  while (nodesToCheck.length > 0) {
    const node = nodesToCheck.pop()
    for (const outEdge of graph.outEdgesAt(node).filter((edge) => !isCrossReference(edge))) {
      nodesToCheck.push(outEdge.targetNode)
    }
    graph.remove(node)
  }
}

/**
 * Sets the depth information of a given node and its subtree.
 * @param {!IGraph} graph The input graph.
 * @param {!INode} node The node to set the depth.
 * @param {number} depth The given depth.
 */
export function setSubtreeDepths(graph, node, depth) {
  graph.outEdgesAt(node).forEach((edge) => {
    if (!isCrossReference(edge)) {
      setSubtreeDepths(graph, edge.targetNode, depth + 1)
    }
  })
  const nodeData = getNodeData(node)
  nodeData.depth = depth
}

/**
 * Returns whether a node has children.
 * @param {!INode} node The given node.
 * @param {!IGraph} graph The given graph.
 * @returns {boolean} True if a node ahs children, false otherwise
 */
export function hasChildNodes(node, graph) {
  return graph.outEdgesAt(node).filter((edge) => !isCrossReference(edge)).size > 0
}

/**
 * Gets the full graph from the graph in the graph component.
 * @param {!GraphComponent} graphComponent
 * @returns {!IGraph}
 */
export function getFullGraph(graphComponent) {
  let graph = graphComponent.graph
  if (graph instanceof FilteredGraphWrapper) {
    graph = graph.wrappedGraph
  }
  return graph
}

/**
 * Adjusts all node sizes to fit their labels' preferred size.
 * @param {!INode} node
 * @param {!IGraph} graph
 */
export function adjustNodeBounds(node, graph) {
  if (node.labels.size > 0) {
    const label = node.labels.at(0)
    const preferredSize = label.style.renderer.getPreferredSize(label, label.style)
    graph.setLabelPreferredSize(label, preferredSize)
    const { x, y, center } = node.layout
    if (isRoot(node)) {
      graph.setNodeLayout(
        node,
        Rect.fromCenter(center, [Math.max(170, preferredSize.width + 20), 60])
      )
    } else {
      graph.setNodeLayout(node, new Rect(x, y, preferredSize.width + 10, preferredSize.height + 10))
    }
  }
}
