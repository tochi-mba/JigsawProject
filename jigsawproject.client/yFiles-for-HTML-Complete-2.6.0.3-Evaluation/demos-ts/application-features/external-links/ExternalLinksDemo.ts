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
  Class,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicLayout,
  IEdge,
  IGraph,
  ILabel,
  INode,
  LayoutExecutor,
  License,
  ModifierKeys,
  Size
} from 'yfiles'

import LinkItemHoverInputMode from './LinkItemHoverInputMode'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import type { JSONGraph } from 'demo-utils/json-model'
import graphData from './graph-data.json'

let graphComponent: GraphComponent

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  const inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  graphComponent.inputMode = inputMode

  // configures default styles for newly created graph elements
  initializeGraph(graphComponent.graph)

  // then build the graph with the given data set
  buildGraph(graphComponent.graph, graphData)

  Class.ensure(LayoutExecutor)
  graphComponent.graph.applyLayout(
    new HierarchicLayout({
      orthogonalRouting: true,
      minimumLayerDistance: 35,
      considerNodeLabels: true
    })
  )
  graphComponent.fitGraphBounds()

  // Finally, enable the undo engine. This prevents undoing of the graph creation
  graphComponent.graph.undoEngineEnabled = true

  // the click listener for labels that represent external links
  initializeLinkListener()

  // an optional custom ItemHoverInputMode which highlights clickable links by underlining the text
  inputMode.add(new LinkItemHoverInputMode())
}

/**
 * Creates nodes and edges from to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder
    .createNodesSource({
      data: graphData.nodeList.filter((item) => !item.isGroup),
      id: (item) => item.id,
      parentId: (item) => item.parentId
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter((item) => item.isGroup),
      id: (item) => item.id
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

function initializeLinkListener(): void {
  ;(graphComponent.inputMode as GraphEditorInputMode).addItemLeftClickedListener((_, evt): void => {
    if (evt.modifiers !== ModifierKeys.CONTROL) {
      // this listener should only handle CTRL+click to open external links
      return
    }
    const clickedItem = evt.item
    let url = ''

    if (ILabel.isInstance(clickedItem)) {
      const label = clickedItem
      url = label.text.startsWith('www.') || label.text.startsWith('http') ? label.text : ''
    } else if (INode.isInstance(clickedItem) || IEdge.isInstance(clickedItem)) {
      // if a node or edge was clicked, we see whether it has any label that resembles a link
      clickedItem.labels.forEach((label: ILabel): void => {
        const text = label.text
        if (text.startsWith('www.') || text.startsWith('http')) {
          url = text
        }
      })
    }

    if (url) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank')
      evt.handled = true
    }
  })
}

/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param graph The graph.
 */
function initializeGraph(graph: IGraph): void {
  // set styles for this demo
  initDemoStyles(graph)

  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('south')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

run().then(finishLoading)
