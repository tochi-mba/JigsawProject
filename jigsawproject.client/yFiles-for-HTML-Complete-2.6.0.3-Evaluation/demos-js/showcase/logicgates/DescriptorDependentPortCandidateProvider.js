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
  DefaultPortCandidate,
  FreeNodePortLocationModel,
  IPortCandidateProvider,
  List,
  ListEnumerable,
  Point,
  PortCandidateValidity,
  SimpleNode,
  SimplePort
} from 'yfiles'
import { LogicGateType } from './LogicGateType.js'

/**
 * @readonly
 * @enum {number}
 */
const EdgeDirection = {
  IN: 0,
  OUT: 1
}

/**
 * @typedef {Object} PortDescriptor
 * @property {number} x
 * @property {number} y
 * @property {number} direction
 */

/**
 * Provides all available ports of the given graph with the specified edge direction.
 */
export class DescriptorDependentPortCandidateProvider extends BaseClass(IPortCandidateProvider) {
  /**
   * Creates a new instance of DescriptorDependentPortCandidateProvider.
   * @param {!INode} node
   */
  constructor(node) {
    super()
    this.node = node
  }

  /**
   * Returns all port candidates that apply for the provided opposite port candidate.
   * @param {!IInputModeContext} context The context for which the candidates should be provided
   * @param {!IPortCandidate} target The opposite port candidate
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getSourcePortCandidates(context, target) {
    return this.getPortCandidatesForDirection(EdgeDirection.OUT)
  }

  /**
   * Returns all port candidates that apply for the provided opposite port candidate.
   * @param {!IInputModeContext} context The context for which the candidates should be provided
   * @param {!IPortCandidate} source The opposite port candidate
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getTargetPortCandidates(context, source) {
    return this.getPortCandidatesForDirection(EdgeDirection.IN)
  }

  /**
   * Returns all source port candidates that belong to the context of this provider.
   * @param {!IInputModeContext} context The context for which the candidates should be provided
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getAllSourcePortCandidates(context) {
    return this.getPortCandidatesForDirection(EdgeDirection.OUT)
  }

  /**
   * Returns all target port candidates that belong to the context of this provider.
   * @param {!IInputModeContext} context The context for which the candidates should be provided
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getAllTargetPortCandidates(context) {
    return this.getPortCandidatesForDirection(EdgeDirection.IN)
  }

  /**
   * Returns the suitable candidates based on the specified edge direction.
   * @param {number} direction The direction of the edge
   * @returns {!List.<IPortCandidate>}
   */
  getPortCandidatesForDirection(direction) {
    const candidates = new List()
    // iterate over all available ports
    for (const port of this.node.ports) {
      // create a port candidate, invalidate it (so it is visible but not usable)
      const candidate = new DefaultPortCandidate(port)
      candidate.validity = PortCandidateValidity.INVALID

      // get the port descriptor which is stored in the port's tag
      const portDescriptor = port.tag
      // make the candidate valid if the direction is the same as the one supplied
      if (portDescriptor.direction === direction) {
        candidate.validity = PortCandidateValidity.VALID
      }
      // add the candidate to the list
      candidates.add(candidate)
    }
    // and return the list
    return candidates
  }
}

/**
 * Creates the port descriptors for the given nodes. If a graph is provided, the ports are directly added
 * to the graph. Otherwise they are added as SimplePorts to the node's port list.
 * @param {!Iterable.<INode>} nodes The nodes for which the port descriptors should be created
 * @param graph The graph which contains the nodes. If no graph is provided, the ports are added to the nodes port list.
 * @param {!IGraph} [graph]
 */
export function createPortDescriptors(nodes, graph) {
  for (const node of nodes) {
    const portDescriptors = createPortDescriptorsForNode(node)
    const model = new FreeNodePortLocationModel()
    const ports = []

    // iterate through all descriptors and add their ports, using the descriptor as the tag for the port
    for (const descriptor of portDescriptors) {
      // use the descriptor's location as offset
      const portLocationModelParameter = model.createParameter(
        node,
        new Point(descriptor.x, descriptor.y)
      )
      const port = graph
        ? graph.addPort(node, portLocationModelParameter)
        : new SimplePort(node, portLocationModelParameter)
      port.tag = descriptor
      if (!graph) {
        ports.push(port)
      }
    }

    if (!graph && node instanceof SimpleNode) {
      node.ports = new ListEnumerable(ports)
    }
  }
}

/**
 * Creates a list of all edges belonging to the type of the node as specified by its logic gate type.
 * @param {!INode} node The given node
 * @returns {!List.<PortDescriptor>}
 */
function createPortDescriptorsForNode(node) {
  const layout = node.layout
  const width = layout.width
  const height = layout.height
  const ports = new List()
  const style = node.style
  switch (style.gateType) {
    default:
    case LogicGateType.AND:
    case LogicGateType.NAND:
    case LogicGateType.OR:
    case LogicGateType.NOR:
    case LogicGateType.XOR:
    case LogicGateType.XNOR: {
      ports.add({ x: width, y: height * 0.5, direction: EdgeDirection.OUT })
      ports.add({ x: 0, y: height * 0.25, direction: EdgeDirection.IN })
      ports.add({ x: 0, y: height * 0.75, direction: EdgeDirection.IN })
      return ports
    }
    case LogicGateType.NOT: {
      ports.add({ x: width, y: height * 0.5, direction: EdgeDirection.OUT })
      ports.add({ x: 0, y: height * 0.5, direction: EdgeDirection.IN })
      return ports
    }
  }
}
