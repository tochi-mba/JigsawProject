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
import { IEdge, IGraph, INode, IPort, Point } from 'yfiles'

export type SerializableEdgeData = {
  bends: Array<[number, number]>
  sourceNodeIndex: number
  targetNodeIndex: number
}

type EdgeDataOptions = SerializableEdgeData

/**
 * A simple, minimal data structure that can be used for storing a FlowEdge in JSON
 * and then re-create it in the graph.
 */
export class EdgeData {
  bends: Array<[number, number]>
  sourceNodeIndex: number
  targetNodeIndex: number

  /**
   * Creates EdgeData from an actual edge
   */
  static fromGraphItem(edge: IEdge, sourceNodeIndex: number, targetNodeIndex: number): EdgeData {
    const bends = edge.bends
      .toArray()
      .map(bend => [bend.location.x, bend.location.y] as [number, number])
    return new EdgeData({ bends, sourceNodeIndex, targetNodeIndex })
  }

  /**
   * Converts an arbitrary piece of data to EdgeData after validation.
   */
  static fromJSONData(data: unknown): EdgeData {
    EdgeData.validate(data)
    return new EdgeData(data)
  }

  /**
   * Checks if an arbitrary piece of data (as it comes from a JSON source)
   * conforms to the format required by EdgeData.
   */
  static validate(data: unknown): asserts data is EdgeDataOptions {
    const bendsAreValid = (data as EdgeDataOptions).bends.every(
      bend => Array.isArray(bend) && Number.isFinite(bend[0]) && Number.isFinite(bend[1])
    )
    if (
      data !== null &&
      typeof data === 'object' &&
      bendsAreValid &&
      Number.isFinite((data as EdgeDataOptions).sourceNodeIndex) &&
      Number.isFinite((data as EdgeDataOptions).targetNodeIndex)
    ) {
      return
    }
    throw new Error('Malformed edge data')
  }

  constructor({ bends, sourceNodeIndex, targetNodeIndex }: EdgeDataOptions) {
    this.bends = bends
    this.sourceNodeIndex = sourceNodeIndex
    this.targetNodeIndex = targetNodeIndex
  }

  /**
   * Matches the intended source and target ports based on the source and target node indices.
   */
  matchPorts(nodes: Array<INode>): [IPort, IPort] {
    const sourceNode = nodes[this.sourceNodeIndex]
    const targetNode = nodes[this.targetNodeIndex]

    const sourcePort = sourceNode.ports.find(p => p.tag.side === 'right')
    const targetPort = targetNode.ports.find(p => p.tag.side === 'left')
    if (!sourcePort || !targetPort) {
      throw new Error('Malformed edge data')
    }
    return [sourcePort, targetPort]
  }

  /**
   * Converts node data to an actual graph node.
   */
  createGraphItem(graph: IGraph, sourcePort: IPort, targetPort: IPort): IEdge {
    const bends = this.bends.map(b => new Point(...b))
    return graph.createEdge({ sourcePort, targetPort, bends })
  }

  /**
   * Converts node data to a serializable format.
   */
  toJSONData(): SerializableEdgeData {
    return {
      bends: this.bends,
      sourceNodeIndex: this.sourceNodeIndex,
      targetNodeIndex: this.targetNodeIndex
    }
  }
}
