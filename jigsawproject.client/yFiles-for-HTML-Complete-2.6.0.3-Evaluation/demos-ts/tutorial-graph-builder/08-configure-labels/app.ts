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
  GraphBuilder,
  GraphComponent,
  License,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size
} from 'yfiles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import { runLayout } from '../common'
import {
  configureDefaultPlacement,
  configureEdgeLabels,
  configureLabelDefaultStyles,
  configureLabelSizeWithProvider,
  configureLabelStylingWithBinding,
  configureLabelStylingWithProvider,
  configureNodeLabelParameter,
  createEdgesSource,
  createLabelsForName,
  createLabelsForType,
  createNodesSource
} from './configure-labels'
import { applyDemoTheme } from 'demo-resources/demo-styles'

License.value = await fetchLicense()

const graphComponent = new GraphComponent('#graphComponent')
applyDemoTheme(graphComponent)

const graph = graphComponent.graph
graph.nodeDefaults.style = new ShapeNodeStyle({
  shape: 'rectangle',
  fill: '#eeeeee',
  stroke: '#eeeeee'
})
graph.nodeDefaults.size = new Size(135, 60)
graph.edgeDefaults.style = new PolylineEdgeStyle({
  stroke: '#aaaaaa',
  targetArrow: '#aaaaaa small triangle'
})

const graphBuilder = new GraphBuilder(graph)

const nodesSource = createNodesSource(graphBuilder)
const edgesSource = createEdgesSource(graphBuilder)

const nameLabelCreator = createLabelsForName(nodesSource)
const typeLabelCreator = createLabelsForType(nodesSource)

configureDefaultPlacement(nameLabelCreator)
configureDefaultPlacement(typeLabelCreator)

configureNodeLabelParameter(nameLabelCreator)

configureLabelDefaultStyles(nameLabelCreator)
configureLabelDefaultStyles(typeLabelCreator)

configureLabelStylingWithBinding(typeLabelCreator)
configureLabelStylingWithProvider(nameLabelCreator)

configureLabelSizeWithProvider(typeLabelCreator)

configureEdgeLabels(edgesSource)

graphBuilder.buildGraph()

void runLayout(graphComponent)

finishLoading()
