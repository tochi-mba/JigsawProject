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
import { GraphBuilder, IEdge, IGraph, INode } from 'yfiles'

/**
 * A type that describes the graph data.
 * This data is used to build a graph that acts as a base for the simulated event log.
 * @typedef {Object} GraphData
 * @property {Array.<NodeData>} nodes
 * @property {Array.<EdgeData>} edges
 */

/**
 * A type that describes the data of a node in the simulation graph.
 * @typedef {Object} NodeData
 * @property {number} id
 * @property {string} label
 * @property {number} [capacity]
 * @property {number} [duration]
 */

/**
 * A type that describes the data of an edge in the simulation graph.
 * @typedef {Object} EdgeData
 * @property {number} source
 * @property {number} target
 * @property {number} [probability]
 */

/**
 * Returns the data of the given process step.
 * @param {!INode} step
 * @returns {!NodeData}
 */
export function getProcessStepTag(step) {
  return step.tag
}

/**
 * Returns the data of the given process transition.
 * @param {!IEdge} transition
 * @returns {!EdgeData}
 */
export function getProcessTransitionTag(transition) {
  return transition.tag
}

/**
 * Returns the graph on which the simulation runs random traversals to create an event log.
 * @returns {!IGraph}
 */
export function getSimulationGraph() {
  const builder = new GraphBuilder()
  builder.createNodesSource({
    data: graphData.nodes,
    id: 'id'
  }).nodeCreator.tagProvider = (dataItem) => ({
    duration: Math.random() * 0.5,
    ...dataItem
  })
  builder.createEdgesSource({
    data: graphData.edges,
    sourceId: 'source',
    targetId: 'target'
  })
  return builder.buildGraph()
}

/**
 * The data from which the simulation graph is built.
 */
const graphData = {
  nodes: [
    { id: 1, label: 'Start', capacity: 50 },
    { id: 3, label: 'Evaluation', capacity: 20 },
    { id: 4, label: 'Move to Backlog' },
    { id: 5, label: 'Prepare', capacity: 20 },
    { id: 6, label: 'Prepare Shortcut' },
    { id: 7, label: 'Step A-1' },
    { id: 9, label: 'Advance', duration: 3 },
    { id: 10, label: 'Early Discard' },
    { id: 11, label: 'Step A-2' },
    { id: 12, label: 'Quick Preparation' },
    { id: 13, label: 'Backlog', capacity: 100 },
    { id: 14, label: 'Step B' },
    { id: 16, label: 'End of Preparation' },
    { id: 17, label: 'Buffer', capacity: 30, duration: 10 },
    { id: 18, label: 'Main Processing', capacity: 70, duration: 2 },
    { id: 19, label: 'Refinement 1', capacity: 20, duration: 1 },
    { id: 20, label: 'Refinement 2', capacity: 60, duration: 4 },
    { id: 21, label: 'Testing', capacity: 70, duration: 1 },
    { id: 22, label: 'Delivery', capacity: 20 },
    { id: 23, label: 'Rejection', capacity: 100 },
    { id: 24, label: 'Store', capacity: 50, duration: 5 }
  ],
  edges: [
    { source: 1, target: 5 },
    { source: 1, target: 2 },
    { source: 1, target: 3 },
    { source: 1, target: 4, probability: 0.1 },
    { source: 16, target: 17 },
    { source: 16, target: 18 },
    { source: 18, target: 19 },
    { source: 5, target: 11 },
    { source: 9, target: 6, probability: 0.1 },
    { source: 5, target: 7, probability: 3 },
    { source: 2, target: 8 },
    { source: 6, target: 12 },
    { source: 3, target: 9 },
    { source: 3, target: 10, probability: 0.1 },
    { source: 4, target: 13 },
    { source: 11, target: 14 },
    { source: 7, target: 14 },
    { source: 5, target: 16, probability: 0.1 },
    { source: 14, target: 16 },
    { source: 18, target: 21 },
    { source: 21, target: 23, probability: 0.1 },
    { source: 21, target: 24 },
    { source: 21, target: 22 },
    { source: 13, target: 15 },
    { source: 12, target: 17 },
    { source: 18, target: 22 },
    { source: 10, target: 15 },
    { source: 9, target: 20 },
    { source: 19, target: 21 },
    { source: 17, target: 18 },
    { source: 20, target: 21 }
  ]
}
