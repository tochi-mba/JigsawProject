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
  GraphComponent,
  GraphEditorInputMode,
  INode,
  ITreeLayoutNodePlacer,
  License,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size,
  Stroke,
  TreeBuilder,
  TreeLayout
} from 'yfiles'
import type { Configuration } from './TreeLayoutConfigurations'
import {
  createCategoryTreeConfiguration,
  createDefaultTreeConfiguration,
  createGeneralGraphConfiguration,
  createGenericConfiguration,
  createLargeTreeConfiguration,
  createWideTreeConfiguration
} from './TreeLayoutConfigurations'
import * as TreeData from './resources/TreeData'
import CreateTreeEdgeInputMode from './CreateTreeEdgeInputMode'
import { LayerColors, NodePlacerPanel } from './NodePlacerPanel'

import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from 'demo-resources/demo-page'

/**
 * The graph component which contains the tree graph.
 */
let graphComponent: GraphComponent

/**
 * The panel which provides access to the node placer settings.
 */
let nodePlacerPanel: NodePlacerPanel

/**
 * Flag to prevent re-entrant layout calculations.
 */
let busy = false

/**
 * Launches the TreeLayoutDemo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // initialize the graph component
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // initialize the settings panel and registers a listener which updates the layout if settings were changed
  nodePlacerPanel = new NodePlacerPanel(graphComponent)
  nodePlacerPanel.addChangeListener(() => runLayout(false))

  // initialize interactive behavior and toolbar buttons
  initializesInputModes()
  initializeUI()

  // load a sample graph
  loadGraph()
}

/**
 * Runs a {@link TreeLayout} using the specified {@link ITreeLayoutNodePlacer}s.
 */
async function runLayout(initConfig: boolean): Promise<void> {
  if (busy) {
    // there is already a layout calculating do not start another one
    return
  }

  setBusy(true)

  let configuration: Configuration
  if (!initConfig) {
    // use the current configuration from the panel
    configuration = createGenericConfiguration(graphComponent.graph, nodePlacerPanel)
  } else {
    // create a layout configuration according to the current sample
    switch (document.querySelector<HTMLSelectElement>('#select-sample')!.value) {
      default:
        configuration = createGenericConfiguration(graphComponent.graph, nodePlacerPanel)
        break
      case 'default':
        configuration = createDefaultTreeConfiguration(graphComponent.graph, nodePlacerPanel)
        break
      case 'wide':
        configuration = createWideTreeConfiguration(graphComponent.graph, nodePlacerPanel)
        break
      case 'category':
        configuration = createCategoryTreeConfiguration(graphComponent.graph, nodePlacerPanel)
        break
      case 'general':
        configuration = createGeneralGraphConfiguration(graphComponent.graph, nodePlacerPanel)
        break
      case 'large':
        configuration = createLargeTreeConfiguration(graphComponent.graph, nodePlacerPanel)
        break
    }
  }

  // run the layout animated
  await graphComponent.morphLayout(
    configuration.layout,
    '0.5s',
    configuration.layoutData ? configuration.layoutData : null
  )
  setBusy(false)
}

/**
 * Initializes interactive behavior
 */
function initializesInputModes(): void {
  // create a new GraphEditorInputMode
  const inputMode = new GraphEditorInputMode({
    // disable label editing on double click, so it won't interfere with toggling the node's assistant marking
    allowEditLabelOnDoubleClick: false,
    // add a custom CreateEdgeInputMode that will also create the edge's target to keep the tree-structure intact
    createEdgeInputMode: new CreateTreeEdgeInputMode(),
    // disabled clipboard and undo operations
    allowClipboardOperations: false,
    allowUndoOperations: false,
    // forbid node creation and allow only node deletion to maintain the tree-structure
    allowCreateNode: false,
    selectableItems: 'node',
    deletableItems: 'node',
    focusableItems: 'none'
  })
  inputMode.createEdgeInputMode.priority = 45

  // always delete the whole subtree
  inputMode.addDeletingSelectionListener((_, evt) => {
    const selectedNodes = evt.selection
    const nodesToDelete: INode[] = []
    selectedNodes.forEach((selectedNode) => {
      collectSubtreeNodes(selectedNode as INode, nodesToDelete)
    })
    nodesToDelete.forEach((node) => {
      if (graphComponent.graph.inDegree(node)) {
        evt.selection.setSelected(node, true)
      } else {
        // do not delete the root node to be able to build a new tree
        evt.selection.setSelected(node, false)
      }
    })
  })
  // update the layout and the settings panel when nodes are deleted
  inputMode.addDeletedSelectionListener(() => runLayout(false))

  // run a layout every time a node/bend is dragged or a node is resized
  inputMode.moveInputMode.addDragFinishedListener(() => runLayout(false))
  inputMode.handleInputMode.addDragFinishedListener(() => runLayout(false))

  // update the settings panel when selection changed to be able to edit its node placer
  inputMode.addMultiSelectionFinishedListener((_, evt) =>
    nodePlacerPanel.onNodeSelectionChanged(evt.selection.ofType(INode.$class).toArray())
  )

  // toggle the assistant marking for the double-clicked node
  inputMode.addItemDoubleClickedListener((_, evt) => {
    if (evt.item instanceof INode) {
      const node = evt.item
      node.tag.assistant = !node.tag.assistant
      const nodeStyle = node.style.clone()
      ;(nodeStyle as ShapeNodeStyle).stroke = !node.tag.assistant
        ? null
        : new Stroke({
            fill: 'black',
            thickness: 2,
            dashStyle: 'dash'
          })
      graphComponent.graph.setStyle(node, nodeStyle)
      runLayout(false)
    }
  })

  // labels may influence the order of child nodes, if they are changed a new layout should be calculated
  inputMode.addLabelAddedListener((_, evt) => {
    if (!Number.isNaN(Number(evt.item.text))) {
      runLayout(false)
    }
  })
  inputMode.addLabelTextChangedListener((_, evt) => {
    if (!Number.isNaN(Number(evt.item.text))) {
      runLayout(false)
    }
  })

  // update layout and settings panel when an edge was created
  inputMode.createEdgeInputMode.addEdgeCreatedListener(() => runLayout(false))

  // assign the input mode to the graph component
  graphComponent.inputMode = inputMode
}

/**
 * Finds all nodes in the subtree rooted by the selected node and collects them in the passed array.
 */
function collectSubtreeNodes(selectedNode: INode, nodesToDelete: INode[]): void {
  nodesToDelete.push(selectedNode)

  graphComponent.graph.outEdgesAt(selectedNode).forEach((outEdge) => {
    const target = outEdge.targetNode!
    collectSubtreeNodes(target, nodesToDelete)
  })
}

type TreeNodeType = {
  id: number | string
  layer: number
  assistant?: boolean
  children?: TreeNodeType[]
}

/**
 * Reads a tree graph from file
 */
async function loadGraph(): Promise<void> {
  const graph = graphComponent.graph
  graph.clear()

  // initialize the node and edge default styles, they will be applied to the newly created graph
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    stroke: 'white',
    fill: 'crimson'
  })
  graph.nodeDefaults.size = new Size(60, 30)
  graph.nodeDefaults.shareStyleInstance = false

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    targetArrow: '#617984 medium triangle',
    stroke: '1.5px solid #617984'
  })

  // select tree data
  let nodesSource: TreeNodeType[]
  const sample = document.querySelector<HTMLSelectElement>('#select-sample')!.value
  switch (sample) {
    default:
    case 'default':
      nodesSource = TreeData.DefaultTree.nodesSource
      break
    case 'wide':
      nodesSource = TreeData.DefaultTree.nodesSource
      break
    case 'category':
      nodesSource = TreeData.CategoryTree.nodesSource
      break
    case 'general':
      nodesSource = TreeData.GeneralGraph.nodesSource
      break
    case 'large':
      nodesSource = TreeData.LargeTree.nodesSource
      break
  }

  // configure the tree builder
  const builder = new TreeBuilder(graph)
  const rootNodesSource = builder.createRootNodesSource(nodesSource, 'id')
  rootNodesSource.addChildNodesSource((data) => data.children, rootNodesSource)

  // create the graph
  builder.buildGraph()

  if (sample === 'general') {
    // add some non-tree edges
    graph.createEdge(graph.nodes.get(1), graph.nodes.get(22))
    graph.createEdge(graph.nodes.get(3), graph.nodes.get(16))
    graph.createEdge(graph.nodes.get(28), graph.nodes.get(26))
  }

  // update the node fill colors according to their layers
  graph.nodes.forEach((node) => {
    const layerColor = LayerColors[node.tag.layer % LayerColors.length]
    const style = node.style as ShapeNodeStyle
    style.fill = layerColor.fill
    style.stroke = layerColor.stroke
    if (node.tag.assistant) {
      style.stroke = '2px dashed black'
    }
  })

  // apply layout
  await runLayout(true)
}

/**
 * Enables/disables interaction.
 */
function setBusy(isBusy: boolean): void {
  busy = isBusy
  ;(graphComponent.inputMode as GraphEditorInputMode).enabled = !isBusy
}

/**
 * Wires up the GUI.
 */
function initializeUI(): void {
  addNavigationButtons(
    document.querySelector<HTMLSelectElement>('#select-sample')!
  ).addEventListener('change', loadGraph)
}

run().then(finishLoading)
