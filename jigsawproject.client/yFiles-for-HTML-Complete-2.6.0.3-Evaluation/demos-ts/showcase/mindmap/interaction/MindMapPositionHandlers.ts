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
  BaseClass,
  type GraphComponent,
  type IEdge,
  type IGraph,
  type IInputModeContext,
  type INode,
  type IPoint,
  IPositionHandler,
  List,
  Point,
  Rect
} from 'yfiles'
import { getNodeData, isLeft, isRoot } from '../data-types'

import { adjustPortLocations, layoutSubtree, layoutTree } from '../mind-map-layout'
import { getFullGraph, getInEdge, getRoot, getSubtree } from '../subtrees'

/**
 * A position handler that moves a node and its subtree.
 *
 * The subtree is mirrored horizontally if the moved node crosses
 * the center of the root node. This is done by calculating an
 * automatic layout of the moved subgraph.
 *
 * While moving the node, the nearest subtree parent candidate is determined.
 * If the parent candidate of the subtree root changes, the edge to the old
 * parent is removed and an edge is inserted from the new parent candidate
 * to the moved node.
 */
export class SubtreePositionHandler
  extends BaseClass(IPositionHandler)
  implements IPositionHandler
{
  private handler: IPositionHandler
  private lastLocation: Point = Point.ORIGIN
  private rootNodeCenter: Point = Point.ORIGIN
  // get the selected node
  private movedNode: INode = null!
  // get the mind map root node
  private globalRoot: INode = null!
  private subtreeNodes: INode[] = []
  private subtreeEdges: IEdge[] = []
  private originalParent: INode | null = null
  private originalIsLeft = false
  private oldParent: INode | null = null

  /**
   * Creates the SubtreePositionHandler that wraps the given position handler.
   */
  constructor(handler: IPositionHandler) {
    super()
    this.handler = handler
  }

  /**
   * Returns the maximum allowed distance for a parent candidate
   */
  static get MAX_DISTANCE(): number {
    return 300
  }

  /**
   * Returns a view of the item's location.
   */
  get location(): IPoint {
    return this.handler.location
  }

  /**
   * Initializes locations and other properties
   * that are needed during the drag and when it is finished/cancelled.
   */
  initializeDrag(inputModeContext: IInputModeContext): void {
    const graphComponent = inputModeContext.canvasComponent as GraphComponent
    const fullGraph = getFullGraph(graphComponent)
    this.handler.initializeDrag(inputModeContext)
    this.lastLocation = new Point(this.location.x, this.location.y)

    // get the selected node
    this.movedNode = graphComponent.selection.selectedNodes.first()
    // get the mind map root node
    this.globalRoot = getRoot(fullGraph)
    this.rootNodeCenter = this.globalRoot.layout.center

    // get subtree nodes
    ;({ nodes: this.subtreeNodes, edges: this.subtreeEdges } = getSubtree(
      fullGraph,
      this.movedNode
    ))
    // get incoming edge of moved node
    const inEdge = getInEdge(this.movedNode, fullGraph)
    // store data at drag start
    if (inEdge) {
      this.originalParent = inEdge.sourceNode
      this.originalIsLeft = isLeft(this.movedNode)
      this.oldParent = this.originalParent
    }
  }

  /**
   * Updates the locations in and the layout direction of the subtree nodes during the drag.
   */
  handleMove(
    inputModeContext: IInputModeContext,
    originalLocation: Point,
    newLocation: Point
  ): boolean {
    if (newLocation.equals(this.lastLocation)) {
      return false
    }
    const delta = newLocation.subtract(this.lastLocation)
    this.lastLocation = newLocation

    // use unfiltered graph for all subsequent operations
    const graphComponent = inputModeContext.canvasComponent as GraphComponent
    const graph = getFullGraph(graphComponent)

    // check if the location is left of the root node's center
    const isLeft = newLocation.x + this.movedNode.layout.width * 0.5 < this.rootNodeCenter.x

    this.mirrorSubtree(isLeft, graph)
    this.moveSubtree(delta, graph)
    const newParent = this.computeClosestNode(isLeft, graph)

    // parent node has changed
    if (newParent !== this.oldParent) {
      this.updateInEdge(newParent, graph)
      this.oldParent = newParent
    }
    return true
  }

  /**
   * Resets the layout and location of the subtree when the drag is cancelled.
   */
  cancelDrag(inputModeContext: IInputModeContext, originalLocation: Point): void {
    this.handler.cancelDrag(inputModeContext, originalLocation)
    this.lastLocation = originalLocation

    // use unfiltered graph for subsequent operations
    const graphComponent = inputModeContext.canvasComponent as GraphComponent
    const graph = getFullGraph(graphComponent)
    this.mirrorSubtree(this.originalIsLeft, graph)

    const isLeft = this.location.x + this.movedNode.layout.width * 0.5 < this.rootNodeCenter.x
    const newParent = this.computeClosestNode(isLeft, graph)
    // create edge between subtree and original parent
    if (newParent !== this.oldParent) {
      this.updateInEdge(this.originalParent, graph)
    }

    // re-layout the tree
    graphComponent.selection.clear()
    void layoutTree(graphComponent)

    this.originalParent = null
  }

  /**
   * Finishes the drag gesture.
   */
  dragFinished(
    inputModeContext: IInputModeContext,
    originalLocation: Point,
    newLocation: Point
  ): void {
    this.handler.dragFinished(inputModeContext, originalLocation, newLocation)
  }

  /**
   * Mirrors the subtree of the moved node.
   * The layout of the subtree is mirrored when it is dragged to the other side of the root node.
   */
  mirrorSubtree(left: boolean, graph: IGraph): void {
    if (isLeft(this.movedNode) !== left) {
      // set isLeft state
      this.subtreeNodes.forEach((n) => (getNodeData(n).left = !isLeft(n)))
      // calculate an automatic layout
      layoutSubtree(graph, this.movedNode, this.subtreeNodes, this.subtreeEdges)
    }
  }

  /**
   * Moves the subtree by a given delta.
   */
  moveSubtree(delta: Point, graph: IGraph): void {
    // move all subtree nodes
    this.subtreeNodes.forEach((n) =>
      graph.setNodeLayout(
        n,
        new Rect(n.layout.x + delta.x, n.layout.y + delta.y, n.layout.width, n.layout.height)
      )
    )
    // move all bends of subtree edges
    this.subtreeEdges.forEach((e) =>
      e.bends.forEach((bend) =>
        graph.setBendLocation(bend, new Point(bend.location.x + delta.x, bend.location.y + delta.y))
      )
    )
  }

  /**
   * Removes the old incoming edge and creates a new edge from the new parent to the moved node.
   * @returns the edge to the new parent
   */
  updateInEdge(newParent: INode | null, graph: IGraph): IEdge | null {
    if (graph.inDegree(this.movedNode) > 0) {
      // remove old edge
      const removedEdge = getInEdge(this.movedNode, graph)
      if (removedEdge) {
        graph.remove(removedEdge)
      }
    }

    if (newParent) {
      // create edge between subtree and new parent
      const edge = graph.createEdge(newParent, this.movedNode)
      adjustPortLocations(graph, [edge])
      return edge
    }
    return null
  }

  /**
   * Computes the nearest parent candidate for the moved node.
   * Returns null if the distance to the found candidate exceeds
   * the {@link SubtreePositionHandler.MAX_DISTANCE limit}.
   * @returns The parent candidate, or null.
   */
  computeClosestNode(isLeft: boolean, graph: IGraph): INode | null {
    let p: Point
    let d: number = Number.POSITIVE_INFINITY
    let dMin: number = Number.POSITIVE_INFINITY
    let newParent: INode | null = null

    graph.nodes.forEach((n) => {
      if (!this.subtreeNodes.includes(n)) {
        let /** @type {Point} */ q

        if (isLeft) {
          q = this.movedNode.layout.bottomRight
          if (isRoot(n)) {
            p = n.layout.center
            d = p.distanceTo(q)
          } else {
            p = n.layout.bottomLeft
            if (p.x > q.x && p.x <= this.rootNodeCenter.x) {
              d = p.distanceTo(q)
            }
          }
        } else {
          q = this.movedNode.layout.bottomLeft
          if (isRoot(n)) {
            p = n.layout.center
            d = p.distanceTo(q)
          } else {
            p = n.layout.bottomRight
            if (p.x < q.x && p.x >= this.rootNodeCenter.x) {
              d = p.distanceTo(q)
            }
          }
        }

        if (d < dMin) {
          dMin = d
          newParent = n
        }
      }
    })
    // EsLint doesn't detect the possible assignment of newParent
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return dMin < SubtreePositionHandler.MAX_DISTANCE ? newParent ?? this.globalRoot : null
  }

  /**
   * Returns a list of the given edge's bend locations.
   */
  getBendLocations(edge: IEdge): List<Point> {
    const points = new List<Point>()
    edge.bends.forEach((bend) => points.add(bend.location.toPoint()))
    return points
  }
}
