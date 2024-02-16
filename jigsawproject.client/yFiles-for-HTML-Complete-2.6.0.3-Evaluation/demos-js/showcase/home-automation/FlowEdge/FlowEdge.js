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
import { CreateEdgeInputMode, GraphComponent, IGraph, INode, Point, YPoint } from 'yfiles'
import './flowEdge.css'
import { FlowPortRelocationHandleProvider } from './FlowPortRelocationHandleProvider.js'
import { validatePortTag } from '../FlowNode/FlowNodePort.js'
import { FlowEdgeStyle } from './FlowEdgeStyle.js'

/**
 * Modifies general edge-related settings on the graph component.
 * @param {!GraphComponent} gc
 */
export function configureFlowEdges(gc) {
  const { graph } = gc

  graph.edgeDefaults.style = new FlowEdgeStyle()
  graph.decorator.edgeDecorator.selectionDecorator.hideImplementation()
  graph.decorator.edgeDecorator.highlightDecorator.hideImplementation()
  graph.decorator.edgeDecorator.focusIndicatorDecorator.hideImplementation()

  graph.decorator.edgeDecorator.edgePortHandleProviderDecorator.setFactory((edge) => {
    return new FlowPortRelocationHandleProvider(graph, edge)
  })
}

/**
 * Calculates and applies custom edge bends.
 * @param {!IGraph} graph
 * @param {!INode} node
 */
export function recalculateEdges(graph, node) {
  const affectedEdges = graph.edgesAt(node)
  affectedEdges.forEach((edge) => {
    const portTag = edge.sourcePort?.tag
    if (!validatePortTag(portTag)) {
      return
    }
    const fromSide = portTag.side
    const bends = getSmoothEdgeControlPoints({
      start: edge.sourcePort.location,
      end: edge.targetPort.location,
      fromSide
    })

    graph.clearBends(edge)
    graph.addBends(edge, bends)
  })
}

/**
 * Modifies edge-related input mode settings.
 * @param {!CreateEdgeInputMode} inputMode
 */
export function configureCreateEdgeInputMode(inputMode) {
  inputMode.startOverCandidateOnly = true
  inputMode.useHitItemsCandidatesOnly = false
  inputMode.allowCreateBend = false

  inputMode.addEdgeCreationStartedListener(({ inputModeContext, dummyEdgeGraph, dummyEdge }) => {
    const gc = inputModeContext?.canvasComponent
    if (!(gc instanceof GraphComponent)) {
      return
    }
    // Clear any existing selection when a new edge is being created.
    // This is for visual purposes: a node being selected affects the appearance
    // of its connected edges, which makes the graph look very "busy".
    gc.selection.clear()

    dummyEdgeGraph.setStyle(dummyEdge, new FlowEdgeStyle('newEdge'))
  })

  inputMode.addEdgeCreatedListener(({ inputModeContext }, { item: edge }) => {
    const gc = inputModeContext?.canvasComponent
    if (!(gc instanceof GraphComponent)) {
      return
    }
    gc.selection.setSelected(edge, true)
    gc.graph.setStyle(edge, new FlowEdgeStyle())
  })

  inputMode.edgeCreator = (_, graph, sourcePortCandidate, targetPortCandidate, dummyEdge) => {
    // Assign ports to constants to simplify references
    let targetPort = targetPortCandidate.port
    let sourcePort = sourcePortCandidate.port
    const sourcePortSide = sourcePort?.tag.side
    const targetPortSide = targetPort?.tag.side
    if (sourcePortSide === 'left' && targetPortSide === 'right') {
      const tempPort = targetPort
      targetPort = sourcePort
      sourcePort = tempPort
    }
    const portTag = sourcePort.tag
    if (!validatePortTag(portTag)) {
      return null
    }
    const fromSide = portTag.side

    const bends = getSmoothEdgeControlPoints({
      start: sourcePort.location.toPoint(),
      end: targetPort.location.toPoint(),
      fromSide
    })
    const edge = graph.createEdge(sourcePort, targetPort, dummyEdge.style)
    graph.addBends(edge, bends)

    // create the edge from the source port candidate to the new node
    return edge
  }
}

/**
 * Calculates 2 cubic Bezier control points to create a smooth curve
 * instead of a straight line segment when creating a new edge
 * or reconnecting an existing one. This algorithm is also used to modify
 * any edges connected to a node whose layout has changed.
 *
 * The shape of the resulting curve depends on both the relative position
 * of the two endpoints and from which side (left/right)
 * the edge is being plotted. The idea here is that the end portions
 * of the resulting edge should curve away from the intended port for a moment.
 * @param {!object} edge
 * @returns {!Array.<Point>}
 */
export function getSmoothEdgeControlPoints(edge) {
  // Minimum length between the endpoint and its corresponding control point.
  // If too close to 0, edges that are close to vertical get almost no curve.
  let minCPDisplacement = 36

  // Maximum length between the endpoint and its corresponding control point.
  // It must be capped, or otherwise plotting edges between very distant ports
  // results in bends that go very far away from the ports (in extreme cases,
  // beyond the graph viewport).
  const maxCPDisplacement = 200

  const start = new YPoint(edge.start.x, edge.start.y)
  const end = new YPoint(edge.end.x, edge.end.y)
  const displacement = YPoint.subtract(start, end)
  const direction = { left: -1, right: 1 }[edge.fromSide]

  // For extremely short edges, cap the max control point displacement
  // depending on the distance between `start` and `end`:
  minCPDisplacement = Math.min(minCPDisplacement, Math.abs(start.distanceTo(end)) / 2)

  const cPDisplacementMagnitude = Math.max(
    minCPDisplacement,
    Math.min(maxCPDisplacement, Math.abs(displacement.x) / 2)
  )

  const controlPoints = [
    new Point(start.x + direction * cPDisplacementMagnitude, start.y),
    new Point(end.x - direction * cPDisplacementMagnitude, end.y)
  ]

  // Depending on the angle of the line segment (start, end), we may want to rotate (start, C1)
  // and (C2, end) slightly. We ignore this angle for some time, meaning that for the most part,
  // the derived angle will be 0 and have no effect.

  const deadAngleZone = Math.PI * 0.75
  const angleModifier = 0.5

  let angle = direction === 1 ? getAngle(start, end) : getAngle(end, start)
  const angleSign = Math.sign(angle)
  angle = Math.abs(angle)
  angle = Math.max(0, angle - deadAngleZone) * angleModifier
  angle = angle * angleSign

  // Apply the rotation, if any:
  controlPoints[0] = rotateByAngle(start.toPoint(), controlPoints[0], angle)[1]
  controlPoints[1] = rotateByAngle(end.toPoint(), controlPoints[1], angle)[1]

  return controlPoints
}

/**
 * Calculates the angle (in radians) between the line crossing points `a` and `b` and the horizontal line
 * passing through `a`.
 * @param {!YPoint} a
 * @param {!YPoint} b
 * @returns {number}
 */
function getAngle(a, b) {
  const deltaY = b.y - a.y
  const deltaX = b.x - a.x
  return Math.atan2(deltaY, deltaX)
}

/**
 * For a line segment (`a`, `b`), calculates a new line segment by applying
 * the specified angle (in radians).
 * @param {!Point} a
 * @param {!Point} b
 * @param {number} angle
 * @returns {!Array.<Point>}
 */
function rotateByAngle(a, b, angle) {
  const distanceAB = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)

  const currentAngle = Math.atan2(b.y - a.y, b.x - a.x)
  const newAngle = currentAngle + angle

  const newX = a.x + distanceAB * Math.cos(newAngle)
  const newY = a.y + distanceAB * Math.sin(newAngle)

  return [a, new Point(newX, newY)]
}
