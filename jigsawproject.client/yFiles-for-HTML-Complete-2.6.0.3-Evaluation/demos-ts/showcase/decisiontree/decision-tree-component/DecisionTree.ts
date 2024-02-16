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
  Arrow,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  HierarchicLayout,
  HierarchicLayoutData,
  HierarchicLayoutEdgeLayoutDescriptor,
  type IEdge,
  type IGraph,
  INode,
  LayoutExecutor,
  MinimumNodeSizeStage,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  PolylineEdgeStyle,
  Rect,
  type SimplexNodePlacer
} from 'yfiles'

import {
  applyDemoTheme,
  colorSets,
  createDemoGroupStyle,
  createDemoNodeStyle
} from 'demo-resources/demo-styles'

const pathNodeStyle = createDemoNodeStyle('demo-palette-403')
const sideNodeStyle = createDemoNodeStyle('demo-palette-44')
const clickableNodeStyle = createDemoNodeStyle('demo-palette-13')
const endNodeStyle = createDemoNodeStyle('demo-palette-402')
const groupNodeStyle = createDemoGroupStyle({ colorSetName: 'demo-palette-42' })
const edgeStyle = new PolylineEdgeStyle({
  smoothingLength: 30,
  targetArrow: new Arrow({
    type: 'triangle',
    stroke: colorSets['demo-palette-44'].stroke,
    fill: colorSets['demo-palette-44'].stroke,
    cropLength: 1
  }),
  stroke: colorSets['demo-palette-44'].stroke
})

const targetZoom = 2

/**
 * A component that displays a graph as an interactive decision tree.
 */
export default class DecisionTree {
  graphComponent: GraphComponent

  private graph: IGraph

  // a mapping from copied nodes to original nodes
  private copiedNodeToOriginalNode: Map<INode, INode> = new Map()

  private nodeToLayerMap: Map<INode, number> = new Map()
  private layerToNodesMap: Map<number, Set<INode>> = new Map()
  private currentLayer = 0

  // the nodes that are currently clickable
  private activeNodes: Set<INode> = new Set()

  // the previously clicked nodes
  private pathNodes: Set<INode> = new Set()

  private runningLayout = false

  /**
   * Creates a new instance of the decision tree component using the given graph, root node, and container element.
   * @param originalGraph the decision graph
   * @param containerElement the element to display the decision tree in
   * @param rootNode the root node that the decision tree starts with
   * @param beforeLayoutCallback a callback when layout starts
   * @param afterLayoutCallback a callback when layout ends
   */
  constructor(
    public originalGraph: IGraph,
    containerElement: HTMLDivElement | string,
    rootNode?: INode,
    public beforeLayoutCallback?: (running: boolean, graphComponent: GraphComponent) => void,
    public afterLayoutCallback?: (running: boolean, graphComponent: GraphComponent) => void
  ) {
    // initialize the GraphComponent
    const graphComponent = new GraphComponent('#decision-tree')
    applyDemoTheme(graphComponent)
    this.graph = graphComponent.graph
    this.graphComponent = graphComponent

    // load the input module and initialize the input mode
    this.initializeInputModes()

    if (originalGraph.nodes.size > 0) {
      this.initializeDecisionGraph(rootNode)
    }
  }

  /**
   * Copies the root node and its direct descendants
   */
  private initializeDecisionGraph(rootNode?: INode): void {
    // if root node is not explicitly specified, use the first node
    // that has the least incoming edges and is not a group node
    rootNode = rootNode ?? this.findRootNode(this.originalGraph)

    if (!rootNode || !this.originalGraph.contains(rootNode)) {
      throw new Error('Root node not found.')
    }
    // copy root node
    const copiedRootNode = this.copyNode(rootNode)
    this.activeNodes.add(copiedRootNode)

    if (this.getOriginalOutDegree(copiedRootNode) > 0) {
      // load the descendants
      void this.showSuccessors(copiedRootNode, false)
    } else {
      this.updateNodeStyles()

      // center the root node in the visible area
      this.graphComponent.updateContentRect()
      this.graphComponent.zoomTo(copiedRootNode.layout.center, targetZoom)
    }
  }

  /**
   * Finds a node in the graph that has no incoming edges.
   */
  private findRootNode(graph: IGraph): INode | undefined {
    let result: INode | undefined = undefined
    let resultDegree = graph.edges.size + 1
    for (const node of graph.nodes) {
      if (!graph.isGroupNode(node)) {
        const nodeDegree = graph.inDegree(node)
        if (resultDegree > nodeDegree) {
          resultDegree = nodeDegree
          result = node
        }
      }
    }
    return result
  }

  /**
   * Creates a viewer mode and registers it as the input mode for the decision tree graph component.
   */
  private initializeInputModes(): void {
    // create a viewer input mode and register callbacks for item clicks
    const graphViewerInputMode = new GraphViewerInputMode({
      selectableItems: GraphItemTypes.NONE,
      clickableItems: GraphItemTypes.NODE
    })
    graphViewerInputMode.addItemClickedListener(async (_, evt) => {
      if (evt.item instanceof INode) {
        // toggle the collapsed state of the clicked node
        await this.showSuccessors(evt.item, true)
      }
    })
    this.graphComponent.inputMode = graphViewerInputMode

    // disable selection, ...
    this.graphComponent.selectionIndicatorManager.enabled = false
    // ... focus, and ...
    this.graphComponent.focusIndicatorManager.enabled = false
    // ... highlight indicators
    this.graphComponent.highlightIndicatorManager.enabled = false
  }

  /**
   * Loads the successor nodes of the given node if the given node is an active node.
   * @param copiedNode the node that has been clicked
   * @param animateScroll whether to animate scrolling to the new nodes
   */
  private async showSuccessors(copiedNode: INode, animateScroll: boolean): Promise<void> {
    if (this.getOriginalOutDegree(copiedNode) === 0 || this.graph.isGroupNode(copiedNode)) {
      // node is an end node or group
      return
    }

    let newNodes: INode[] = []
    if (this.activeNodes.has(copiedNode)) {
      // a node in the current layer has been clicked
      newNodes = this.expandActiveNode(copiedNode)
    } else if (!this.graph.isGroupNode(copiedNode)) {
      // a node in a higher layer has been clicked
      newNodes = this.expandHigherNode(copiedNode)
    }

    this.updateNodeStyles()

    this.beforeLayoutCallback?.(true, this.graphComponent)

    await this.runLayout(newNodes, animateScroll)

    // calculate the bounding box of all new nodes
    let nodeArea = Rect.EMPTY
    for (const node of newNodes) {
      nodeArea = Rect.add(nodeArea, node.layout.toRect())
    }

    // if there are new nodes, ensure all of them are visible
    if (!nodeArea.isEmpty) {
      nodeArea = nodeArea.getEnlarged(10)

      let zoom = targetZoom
      if (nodeArea.width * targetZoom > this.graphComponent.size.width) {
        zoom = this.graphComponent.size.width / nodeArea.width
      }
      if (animateScroll) {
        await this.graphComponent.zoomToAnimated(nodeArea.center, zoom)
      } else {
        this.graphComponent.zoomTo(nodeArea.center, zoom)
      }
    }
    this.afterLayoutCallback?.(false, this.graphComponent)
  }

  /**
   * Expands the successor nodes of the given node.
   * Called when a node in the current layer has been clicked.
   * @param copiedNode the node that has been clicked
   * @returns the new nodes that were added
   */
  private expandActiveNode(copiedNode: INode): INode[] {
    this.currentLayer++
    // get the corresponding node in the original graph
    const originalNode = this.copiedNodeToOriginalNode.get(copiedNode)!
    this.pathNodes.add(copiedNode)
    this.activeNodes.clear()
    const copiedNodes: INode[] = []
    const copiedParentNodes = new Map<INode, INode>()
    // copy the successors from the original graph
    this.originalGraph.outEdgesAt(originalNode).forEach((originalEdge) => {
      const originalTargetNode = originalEdge.targetNode!
      if (!this.originalGraph.isGroupNode(originalTargetNode)) {
        // target is not a group, thus copy it
        const copiedTargetNode = this.copyNode(originalTargetNode)

        if (this.getOriginalOutDegree(copiedTargetNode) > 0) {
          // if the new node has outgoing edges, it's an active node now
          this.activeNodes.add(copiedTargetNode)
        }
        this.copyEdge(originalEdge, copiedNode, copiedTargetNode)
        copiedNodes.push(copiedTargetNode)

        // if the new node is in a group, copy its parent node
        const originalParentNode = this.originalGraph.getParent(originalTargetNode)
        if (originalParentNode !== null) {
          // check if the parent node has already been copied
          if (!copiedParentNodes.has(originalParentNode)) {
            // copy parent node
            const copiedParentNode = this.copyGroupNode(originalParentNode, null)
            copiedNodes.push(copiedParentNode)
            copiedParentNodes.set(originalParentNode, copiedParentNode)
          }
          // set copied node as a child node of the copied parent
          this.graph.setParent(copiedTargetNode, copiedParentNodes.get(originalParentNode)!)
        }
      } else {
        // node is a group - copy the group and all its children
        const copiedGroupNode = this.copyGroupNode(originalTargetNode)

        // copy children
        this.originalGraph.getChildren(originalTargetNode).forEach((originalNode) => {
          const copiedChildNode = this.copyNode(originalNode, copiedGroupNode)
          copiedNodes.push(copiedChildNode)
        })

        this.copyEdge(originalEdge, copiedNode, copiedGroupNode)

        this.graph.getChildren(copiedGroupNode).forEach((copiedChildNode) => {
          if (this.getOriginalOutDegree(copiedChildNode) > 0) {
            // child nodes that have outgoing edges are clickable nodes
            this.activeNodes.add(copiedChildNode)
          }
        })

        copiedNodes.push(copiedGroupNode)
      }
    })
    return copiedNodes
  }

  /**
   * Removes all nodes in layers lower than the given node and expands the given node.
   * Called when a node in a layer above the current layer has been clicked.
   * @param copiedNode the node that has been clicked
   * @returns the new nodes that were added
   */
  private expandHigherNode(copiedNode: INode): INode[] {
    // get the layer the clicked node is in
    const layer = this.nodeToLayerMap.get(copiedNode)!
    // get all nodes in this layer
    let layerNodes = this.layerToNodesMap.get(layer)!
    // remove all nodes in this layer from the path
    layerNodes.forEach((node) => this.pathNodes.delete(node))
    // remove all nodes in lower layers
    for (let l: number = layer + 1; l <= this.currentLayer; l++) {
      layerNodes = this.layerToNodesMap.get(l)!
      layerNodes.forEach((node) => {
        this.graph.remove(node)
        this.pathNodes.delete(node)
        this.activeNodes.delete(node)
        this.nodeToLayerMap.delete(node)
      })
      this.layerToNodesMap.delete(l)
    }
    // set the layer of the clicked layer as current layer
    this.currentLayer = layer
    // expand the clicked node
    return this.expandActiveNode(copiedNode)
  }

  /**
   * Updates the styles of all nodes.
   */
  private updateNodeStyles(): void {
    this.graph.nodes.forEach((node) => {
      if (this.graph.isGroupNode(node)) {
        this.graph.setStyle(node, groupNodeStyle)
      } else if (this.getOriginalOutDegree(node) === 0) {
        this.graph.setStyle(node, endNodeStyle)
      } else if (this.activeNodes.has(node)) {
        this.graph.setStyle(node, clickableNodeStyle)
      } else if (this.pathNodes.has(node)) {
        this.graph.setStyle(node, pathNodeStyle)
      } else {
        this.graph.setStyle(node, sideNodeStyle)
      }
    })
  }

  /**
   * Copies a non-group node from the original graph to the decision graph.
   * If a parent node is specified, the copied node will be assigned to the given parent node.
   * @param originalNode the node to copy
   * @param copiedParent the parent in the decision graph, or null if the node to copy is a top-level node
   * @returns The copied node
   */
  private copyNode(originalNode: INode, copiedParent: INode | null = null): INode {
    const copiedNode = this.graph.createNode(
      copiedParent,
      originalNode.layout,
      originalNode.style,
      originalNode.tag
    )
    originalNode.labels.forEach((label) =>
      this.graph.addLabel(
        copiedNode,
        label.text,
        label.layoutParameter,
        label.style,
        label.preferredSize,
        label.tag
      )
    )

    this.copiedNodeToOriginalNode.set(copiedNode, originalNode)
    this.setNodeLayer(copiedNode)
    return copiedNode
  }

  /**
   * Copies a group node from the original graph to the decision graph.
   * If a parent node is specified, the copied node will be assigned to the given parent node.
   * @param originalNode the group node to copy
   * @param copiedParent the parent in the decision graph, or null if the node to copy is a top-level node
   * @returns The copied group node
   */
  private copyGroupNode(originalNode: INode, copiedParent: INode | null = null): INode {
    const copiedGroupNode = this.graph.createGroupNode(
      copiedParent,
      originalNode.layout.toRect(),
      originalNode.style,
      originalNode.tag
    )
    originalNode.labels.forEach((label) =>
      this.graph.addLabel(
        copiedGroupNode,
        label.text,
        label.layoutParameter,
        label.style,
        label.preferredSize,
        label.tag
      )
    )

    this.copiedNodeToOriginalNode.set(copiedGroupNode, originalNode)
    this.setNodeLayer(copiedGroupNode)
    return copiedGroupNode
  }

  /**
   * Copies an edge from the original graph to the decision graph.
   * @param originalEdge the edge to copy
   * @param copiedSourceNode the source node in the decision graph
   * @param copiedTargetNode the target node in the decision graph
   * @returns The copied edge
   */
  private copyEdge(originalEdge: IEdge, copiedSourceNode: INode, copiedTargetNode: INode): IEdge {
    const originalSourcePort = originalEdge.sourcePort!
    const originalTargetPort = originalEdge.targetPort!
    const copiedSourcePort = this.graph.addPort(
      copiedSourceNode,
      originalSourcePort.locationParameter,
      originalSourcePort.style,
      originalSourcePort.tag
    )
    const copiedTargetPort = this.graph.addPort(
      copiedTargetNode,
      originalTargetPort.locationParameter,
      originalTargetPort.style,
      originalTargetPort.tag
    )
    const copiedEdge = this.graph.createEdge(
      copiedSourcePort,
      copiedTargetPort,
      edgeStyle,
      originalEdge.tag
    )
    originalEdge.labels.forEach((label) =>
      this.graph.addLabel(
        copiedEdge,
        label.text,
        label.layoutParameter,
        label.style,
        label.preferredSize,
        label.tag
      )
    )
    return copiedEdge
  }

  /**
   * Associates the given node with the current layer.
   * @param copiedNode a node from the decision graph
   */
  private setNodeLayer(copiedNode: INode): void {
    this.nodeToLayerMap.set(copiedNode, this.currentLayer)
    if (!this.layerToNodesMap.has(this.currentLayer)) {
      this.layerToNodesMap.set(this.currentLayer, new Set())
    }
    this.layerToNodesMap.get(this.currentLayer)!.add(copiedNode)
  }

  /**
   * Runs an incremental layout for the decision graph.
   * @param incrementalNodes the newly added nodes
   * @param animated if true, the layout change is animated
   */
  private async runLayout(incrementalNodes: INode[], animated: boolean): Promise<void> {
    if (!this.runningLayout) {
      const layout = new HierarchicLayout({
        layoutMode: 'incremental',
        edgeLayoutDescriptor: new HierarchicLayoutEdgeLayoutDescriptor({ minimumSlope: 0 })
      })
      ;(layout.nodePlacer as SimplexNodePlacer).barycenterMode = false

      const layoutData = new HierarchicLayoutData()
      // move the incremental nodes between their neighbors before expanding for a smooth animation
      this.prepareSmoothExpandLayoutAnimation(incrementalNodes)

      // define sequence constraints for the incremental nodes to keep the x-order of the original graph
      incrementalNodes.sort((node1: INode, node2: INode): number => {
        const originalNode1 = this.copiedNodeToOriginalNode.get(node1)!
        const originalNode2 = this.copiedNodeToOriginalNode.get(node2)!
        if (originalNode1.layout.x < originalNode2.layout.x) {
          return 1
        } else if (originalNode1.layout.x > originalNode2.layout.x) {
          return -1
        } else {
          return 0
        }
      })
      for (let i = 0; i < incrementalNodes.length - 1; i++) {
        layoutData.sequenceConstraints.placeBefore(incrementalNodes[i], incrementalNodes[i + 1])
      }
      // configure the incremental hints
      layoutData.incrementalHints.incrementalLayeringNodes = incrementalNodes

      // configure critical edges so the path edges are aligned
      layoutData.criticalEdgePriorities = (edge: IEdge): number =>
        this.pathNodes.has(edge.sourceNode!) && this.pathNodes.has(edge.targetNode!) ? 1 : 0

      this.runningLayout = true
      const layoutExecutor = new LayoutExecutor({
        graphComponent: this.graphComponent,
        layout: new MinimumNodeSizeStage(layout),
        layoutData,
        duration: animated ? '0.2s' : '0s'
      })
      try {
        await layoutExecutor.start()
      } finally {
        this.runningLayout = false
      }
    }
  }

  /**
   * Moves incremental nodes between their neighbors before expanding for a smooth animation.
   */
  private prepareSmoothExpandLayoutAnimation(incrementalNodes: INode[]): void {
    const graph = this.graphComponent.graph

    // mark the new nodes and place them between their neighbors
    const layoutData = new PlaceNodesAtBarycenterStageData({
      affectedNodes: (node) => incrementalNodes.indexOf(node) > -1
    })
    const layout = new PlaceNodesAtBarycenterStage()
    graph.applyLayout(layout, layoutData)
  }

  /**
   * Disposes the decision tree and removes it from its container element.
   */
  dispose(): void {
    this.graphComponent.cleanUp()
    this.graphComponent = null!
  }

  /**
   * Returns the out degree of the original node for the given copied node.
   */
  private getOriginalOutDegree(copiedNode: INode): number {
    return this.originalGraph.outDegree(this.copiedNodeToOriginalNode.get(copiedNode)!)
  }
}
