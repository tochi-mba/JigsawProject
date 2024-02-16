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
  DefaultLabelStyle,
  FreeEdgeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphSelectionIndicatorManager,
  IndicatorNodeStyleDecorator,
  INode,
  License,
  PolylineEdgeStyle,
  ShapeNodeStyle
} from 'yfiles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import { initializeToolbar, switchSample, useUniformEdgeWeights } from './ui/ui-utils.js'
import { runLayout } from './layout/layout.js'
import { TagColoredPolylineEdgeStyleRenderer, TagColoredShapeNodeStyleRenderer } from './styles.js'
import { ComponentSwitchingInputMode } from './ui/ComponentSwitchingInputMode.js'
import { applyAlgorithm } from './algorithms/algorithms.js'
import { initializeGraphInformation } from './ui/graph-structure-information.js'
import { initializeContextMenu } from './ui/context-menu.js'
import { applyDemoTheme } from 'demo-resources/demo-styles'

/**
 * Precompiled Regex matcher used to allow only weight labels with positive numbers as text.
 */
const validationPattern = new RegExp('^(0*[1-9][0-9]*(\\.[0-9]+)?|0+\\.[0-9]*[1-9][0-9]*)$')

/**
 * Main function for running the Graph Analysis demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // configure the interaction for this demo
  graphComponent.inputMode = createEditorMode(graphComponent)

  // enable undo support
  graphComponent.graph.undoEngineEnabled = true

  // initialize the styles for nodes and edges and for the selection.
  initializeStyles(graphComponent)

  // create the toolbar's elements and binds them to the appropriate commands
  initializeToolbar(graphComponent)
  // register the listeners for notifying graph structural changes to update the
  // graph information displayed in the right panel
  initializeGraphInformation(graphComponent)

  await switchSample(graphComponent)
}

/**
 * Initializes the graph instance and set default styles.
 * @param {!GraphComponent} graphComponent
 */
function initializeStyles(graphComponent) {
  const graph = graphComponent.graph

  // set the default style for the nodes
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'ellipse',
    renderer: new TagColoredShapeNodeStyleRenderer()
  })
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    font: '10px Tahoma',
    textFill: 'white'
  })

  // initialize the selection style for nodes
  graphComponent.selectionIndicatorManager = new GraphSelectionIndicatorManager({
    nodeStyle: new IndicatorNodeStyleDecorator({
      wrapped: new ShapeNodeStyle({
        shape: 'ellipse',
        stroke: '5px gray',
        fill: null
      }),
      padding: 5
    })
  })

  // disable focus decoration
  graphComponent.focusIndicatorManager.enabled = false

  // set the default style for the edges
  graph.edgeDefaults.style = new PolylineEdgeStyle(new TagColoredPolylineEdgeStyleRenderer())

  // set the style and the label model for the edge labels
  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createDefaultParameter()
  graph.edgeDefaults.labels.style = new DefaultLabelStyle({
    font: '10px Tahoma',
    textFill: 'gray'
  })
}

/**
 * Configures the interaction for this demo.
 * @param {!GraphComponent} graphComponent
 * @returns {!GraphEditorInputMode}
 */
function createEditorMode(graphComponent) {
  // configure interaction
  const inputMode = new GraphEditorInputMode({
    allowAddLabel: false,
    allowCreateBend: false,
    deletableItems: ['edge', 'node'],
    showHandleItems: 'none'
  })

  // add an input mode that allows to interactively switch the displayed component
  inputMode.add(new ComponentSwitchingInputMode())

  // deletion
  const graph = graphComponent.graph
  inputMode.addDeletingSelectionListener(async (_) => {
    applyAlgorithm(graph)
    await runLayout(graphComponent, true, [])
  })

  inputMode.addDeletedSelectionListener(async (_) => {
    applyAlgorithm(graph)
    await runLayout(graphComponent, true, [])
  })

  // edge creation
  inputMode.createEdgeInputMode.addEdgeCreatedListener(async (_, evt) => {
    const edge = evt.item

    // ensure that each created node and edge have a tag
    if (!useUniformEdgeWeights()) {
      graph.addLabel({
        owner: edge,
        text: '1',
        layoutParameter: FreeEdgeLabelModel.INSTANCE.createEdgeAnchored(0.5, 10),
        tag: 'weight'
      })
    }

    applyAlgorithm(graph)
    const incrementalNodes = [edge.sourceNode, edge.targetNode]
    await runLayout(graphComponent, true, incrementalNodes)
  })

  inputMode.moveInputMode.addDragFinishedListener(async (inputModeMove) => {
    const affectedNodes = inputModeMove.affectedItems
      .filter((item) => item instanceof INode)
      .toArray()
    if (affectedNodes.length < graph.nodes.size) {
      applyAlgorithm(graph)
      await runLayout(graphComponent, true, affectedNodes)
    }
  })

  // run the algorithm on node creation, edge port changes or label text changes
  inputMode.addEdgePortsChangedListener(async (_) => {
    applyAlgorithm(graph)
  })

  inputMode.addNodeCreatedListener((_) => {
    applyAlgorithm(graph)
  })

  inputMode.addLabelTextChangedListener(() => applyAlgorithm(graph))

  inputMode.addValidateLabelTextListener((_, evt) => {
    // labels must contain only positive numbers
    evt.cancel = !validationPattern.test(evt.newText)
  })

  // ensure that each created node has a tag
  inputMode.nodeCreator = (_, g, location) =>
    g.createNodeAt({
      location: location,
      tag: { components: [] }
    })

  inputMode.createEdgeInputMode.addEdgeCreationStartedListener(
    (_, evt) => (evt.item.tag = { components: [] })
  )

  // also we add a context menu
  initializeContextMenu(inputMode, graphComponent)
  return inputMode
}

void run().then(finishLoading)
