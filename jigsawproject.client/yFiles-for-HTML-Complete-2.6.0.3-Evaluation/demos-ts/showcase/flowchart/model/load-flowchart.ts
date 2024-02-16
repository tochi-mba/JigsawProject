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
import type { GraphComponent } from 'yfiles'
import { GraphBuilder, Point, Rect, Size } from 'yfiles'
import { FlowchartNodeStyle, type FlowchartNodeType } from '../style/FlowchartStyle'
import { flowchartSamples } from './flowchart-samples'

export type Sample = keyof typeof flowchartSamples

type NodeData = {
  type: FlowchartNodeType
}

export function loadFlowchart(graphComponent: GraphComponent, sample: Sample): void {
  graphComponent.graph.clear()

  // initialize the graph builder
  const data = flowchartSamples[sample]
  const builder = new GraphBuilder({
    nodes: [
      {
        data: data.nodes,
        id: 'id',
        labels: ['label'],
        layout: (dataItem: NodeData) =>
          dataItem.type === 'decision'
            ? Rect.fromCenter(Point.ORIGIN, new Size(145, 100))
            : Rect.fromCenter(Point.ORIGIN, new Size(145, 60)),
        style: (dataItem: NodeData) => new FlowchartNodeStyle(dataItem.type)
      }
    ],
    edges: [
      {
        data: data.edges,
        sourceId: 'from',
        targetId: 'to',
        labels: ['label']
      }
    ]
  })

  // create the graph
  graphComponent.graph = builder.buildGraph()
}
