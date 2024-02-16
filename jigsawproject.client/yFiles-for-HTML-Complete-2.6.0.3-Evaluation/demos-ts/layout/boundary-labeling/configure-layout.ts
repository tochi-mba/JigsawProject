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
  ExteriorLabelModel,
  type IEdge,
  type IGraph,
  type ILayoutAlgorithm,
  type INode,
  type LayoutData,
  OrganicLayout,
  OrganicLayoutConstraintOrientation,
  OrganicLayoutData,
  OrganicLayoutScope,
  Rect
} from 'yfiles'
import { getPointData, isLabel, NodeType } from './data-types'

/**
 * Returns a layout configuration of the organic layout with constraints so that:
 * (i) Label nodes associated with points on the left side of the image should be placed before their
 * associated points but not necessary horizontally aligned with them.
 * (ii) Label nodes associated with points on the right side of the image should be placed after their
 * associated points but not necessary horizontally aligned with them.
 * (iii) Label nodes associated with points on the top side of the image should be placed above their
 * associated points but not necessary vertically aligned with them.
 * (iv) Label nodes on the left or on the right side should be vertically aligned.
 * Labels associated with points on the top are excluded from this rule.
 */
export function configureLayout(
  graph: IGraph,
  imageRect: Rect
): {
  layout: ILayoutAlgorithm
  layoutData: LayoutData
} {
  // positions all label nodes at the position of their associated points
  resetLabelPositions(graph)
  // define the label models based on the position of the point
  assignLabelModels(graph, imageRect)

  // some basic configuration for the organic layout
  // scope SUBSET is used because the locations of the points may not change. i.e. the algorithm may
  // arrange only label nodes
  const organicLayout = new OrganicLayout({
    deterministic: true,
    scope: OrganicLayoutScope.SUBSET,
    considerNodeLabels: true,
    minimumNodeDistance: 5
  })

  // specifies desired edge lengths and the set of node to be arranged, i.e., the label nodes
  const organicLayoutData = new OrganicLayoutData({
    affectedNodes: (node) => getPointData(node).type === NodeType.LABEL,
    preferredEdgeLengths: (edge: IEdge) => (isLeftPoint(edge.sourceNode!, imageRect) ? 50 : 25)
  })

  // create the constraints for the layout algorithm
  for (const edge of graph.edges) {
    const point = edge.sourceNode!
    const labelNode = edge.targetNode!

    if (isVerticalPoint(point, imageRect)) {
      // create the constraints for the nodes on the top/bottom part
      addVerticalConstraints(point, labelNode, organicLayoutData, imageRect)
    } else {
      addHorizontalConstraints(point, labelNode, organicLayoutData, imageRect)
    }
  }

  // create the constraints to vertically align the label nodes, excluding the ones on the top part
  addVerticalLabelToLabelConstraints(graph, imageRect, organicLayoutData)

  return { layout: organicLayout, layoutData: organicLayoutData }
}

/**
 * Creates horizontal constraints so that:
 * (i) Label nodes associated with points on the left side of the image are placed to the left of
 * their associated point nodes.
 * (ii) Label nodes associated with points on the right side of the image are placed to the right of
 * their associated point nodes.
 */
function addHorizontalConstraints(
  point: INode,
  labelNode: INode,
  organicLayoutData: OrganicLayoutData,
  imageRect: Rect
): void {
  const pointLeft = isLeftPoint(point, imageRect)

  // determine which node should be on the left/right based on the location of the point
  const left = pointLeft ? labelNode : point
  const right = pointLeft ? point : labelNode

  // calculate the distance of the point to the left/right boundary of the image to make sure
  // that the label node is placed outside the image
  const distanceToBorder = pointLeft
    ? Math.abs(point.layout.x - imageRect.x)
    : Math.abs(point.layout.x - imageRect.x - imageRect.width)

  // enforce a minimum distance between the two nodes
  const separationConstraint = organicLayoutData.constraints.addSeparationConstraint(
    OrganicLayoutConstraintOrientation.HORIZONTAL,
    distanceToBorder + 20
  )
  separationConstraint.firstSet.item = left
  separationConstraint.secondSet.item = right

  // create a constraint tο enforce the desired order of the point and label node
  const orderConstraint = organicLayoutData.constraints.addOrderConstraint(
    OrganicLayoutConstraintOrientation.HORIZONTAL
  )
  orderConstraint.items = [left, right]
}

/**
 * Creates constraints that force label nodes associated with points on the top/bottom side of
 * the image to be placed above/below their associated points but not necessary vertically
 * aligned with them.
 */
function addVerticalConstraints(
  point: INode,
  labelNode: INode,
  organicLayoutData: OrganicLayoutData,
  imageRect: Rect
): void {
  const isTop = isTopPoint(point, imageRect)
  // determine the top-to-bottom order of the point node and its label node depending on the
  // location of the point node
  const top = isTop ? labelNode : point
  const bottom = isTop ? point : labelNode

  // calculate the distance of the point to the top/bottom boundary of the image to make sure
  // that the label node is placed outside the image
  const distanceToBorder = isTop
    ? Math.abs(point.layout.y - imageRect.y)
    : Math.abs(point.layout.y - imageRect.y - imageRect.height)

  // enforce a minimum distance between the two nodes
  const separationConstraint = organicLayoutData.constraints.addSeparationConstraint(
    OrganicLayoutConstraintOrientation.VERTICAL,
    distanceToBorder + 20
  )
  separationConstraint.firstSet.item = top
  separationConstraint.secondSet.item = bottom

  // create a constraint to enforce the desired ordering of the point and its label node
  // based on whether the point node should ly above or below its label node
  const orderConstraint = organicLayoutData.constraints.addOrderConstraint(
    OrganicLayoutConstraintOrientation.VERTICAL
  )
  orderConstraint.items = [top, bottom]
}

/**
 * Create constraints to vertically align the label nodes excluding the ones on the top/bottom part.
 */
function addVerticalLabelToLabelConstraints(
  graph: IGraph,
  imageRect: Rect,
  organicLayoutData: OrganicLayoutData
): void {
  // get all label nodes that do not lie on the topmost/bottommost part
  const nonVerticalPoints = graph.nodes.filter(
    (node) => isLabel(node) && !isVerticalPoint(node, imageRect)
  )

  // get the labels on the left side and create a constraint to align them vertically
  const leftAlignmentConstraint = organicLayoutData.constraints.addAlignmentConstraint(
    OrganicLayoutConstraintOrientation.VERTICAL
  )
  leftAlignmentConstraint.items = nonVerticalPoints.filter((node) => isLeftPoint(node, imageRect))

  // get the labels on the right side and create a constraint to align them vertically
  const rightAlignmentConstraint = organicLayoutData.constraints.addAlignmentConstraint(
    OrganicLayoutConstraintOrientation.VERTICAL
  )
  rightAlignmentConstraint.items = nonVerticalPoints.filter((node) => !isLeftPoint(node, imageRect))
}

/**
 * Returns whether the point lies on the left side of the image.
 */
function isLeftPoint(point: INode, imageRect: Rect): boolean {
  return point.layout.x < imageRect.x + imageRect.width * 0.5
}

/**
 * Returns whether the point lies on the top of the image, i.e., the distance from the top border is smaller
 * than 30.
 */
function isTopPoint(point: INode, imageRect: Rect): boolean {
  return Math.abs(point.layout.y - imageRect.y) < 30
}

/**
 * Returns whether the point lies on the bottom of the image, i.e., the distance from the bottom border is smaller
 * than 30.
 */
function isBottomPoint(point: INode, imageRect: Rect): boolean {
  return Math.abs(point.layout.y - imageRect.y - imageRect.height) < 30
}

/**
 * Returns whether the connection between the point and its label node should be vertical,
 * i.e., the point lies on the topmost/bottommost part of the image.
 */
function isVerticalPoint(point: INode, imageRect: Rect): boolean {
  return isTopPoint(point, imageRect) || isBottomPoint(point, imageRect)
}

/**
 * Defines the positions of the labels based on the location of the point.
 */
function assignLabelModels(graph: IGraph, imageRect: Rect): void {
  graph.nodes
    .filter((node) => isLabel(node))
    .forEach((labelNode) => {
      const label = labelNode.labels.at(0)!

      if (isVerticalPoint(labelNode, imageRect)) {
        const isTop = isTopPoint(labelNode, imageRect)
        // for labels that should go vertically, i.e., point is on the top or at the bottom
        // the label should go above the node or below the node, respectively
        graph.setLabelLayoutParameter(
          label,
          isTop ? ExteriorLabelModel.NORTH : ExteriorLabelModel.SOUTH
        )
      } else {
        const isLeft = isLeftPoint(labelNode, imageRect)
        // for labels that should go horizontally, (i.e., point is on the left or on the right)
        // the label should go before the node or after the node, respectively
        graph.setLabelLayoutParameter(
          label,
          isLeft ? ExteriorLabelModel.WEST : ExteriorLabelModel.EAST
        )
      }
    })
}

/**
 * For better layout results when the graph is re-arranged after font changes, the label
 * nodes are placed initially on the positions of the point nodes.
 */
function resetLabelPositions(graph: IGraph): void {
  graph.nodes
    .filter((node) => isLabel(node))
    .forEach((labelNode) => {
      const point = graph.edgesAt(labelNode).at(0)!.sourceNode!
      graph.setNodeLayout(
        labelNode,
        new Rect(point.layout.x, point.layout.y, labelNode.layout.width, labelNode.layout.height)
      )
    })
}
