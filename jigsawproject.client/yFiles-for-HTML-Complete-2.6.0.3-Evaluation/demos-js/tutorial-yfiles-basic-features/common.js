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
  EdgeStyleDecorationInstaller,
  ExteriorLabelModel,
  FreeNodePortLocationModel,
  GraphBuilder,
  GraphEditorInputMode,
  GroupNodeLabelModel,
  GroupNodeStyle,
  HorizontalTextAlignment,
  IGraph,
  InteriorLabelModel,
  NodeStyleDecorationInstaller,
  Point,
  PolylineEdgeStyle,
  Rect,
  RectangleCornerStyle,
  RectangleNodeStyle,
  ShapeNodeStyle,
  SmartEdgeLabelModel
} from 'yfiles'
import { applyDemoTheme } from 'demo-resources/demo-styles'
import { graphDataAnalysis, graphDataLayout, graphDataLayoutData } from './graph-data.js'

/**
 * Configures colors for styling the nodes retrieved from the given data sources.
 * @param {!Array.<NodesSource>} nodesSources
 */
export function configureStyles(nodesSources) {
  const nodeFills = ['#0b7189', '#111d4a', '#ff6c00', '#ab2346', '#621b00']
  const nodeStrokes = ['#042d37', '#070c1e', '#662b00', '#440e1c', '#270b00']
  const labelTextColors = ['#042d37', '#070c1e', '#662b00', '#440e1c', '#270b00']
  const labelFills = ['#9dc6d0', '#a0a5b7', '#ffc499', '#dda7b5', '#c0a499']
  nodesSources.forEach((nodesSource, index) => {
    nodesSource.nodeCreator.defaults.style = new ShapeNodeStyle({
      shape: 'round-rectangle',
      fill: nodeFills[index % nodeFills.length],
      stroke: nodeStrokes[index % nodeStrokes.length]
    })
    nodesSource.nodeCreator.defaults.labels.style = new DefaultLabelStyle({
      shape: 'round-rectangle',
      textFill: labelTextColors[index % labelTextColors.length],
      backgroundFill: labelFills[index % labelFills.length],
      insets: 2
    })
  })
}

/**
 * Initializes the default styles for nodes, edges, and labels.
 * @param {!GraphComponent} graphComponent
 */
export function initializeTutorialDefaults(graphComponent) {
  applyDemoTheme(graphComponent)
  graphComponent.focusIndicatorManager.enabled = false
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: '#0b7189',
    stroke: '#042d37'
  })
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    shape: 'round-rectangle',
    textFill: '#042d37',
    backgroundFill: '#9dc6d0',
    insets: 2,
    horizontalTextAlignment: HorizontalTextAlignment.CENTER
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '1.5px #0b7189',
    targetArrow: '#0b7189 medium triangle'
  })

  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: '#111d4a',
    contentAreaInsets: 10
  })

  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'left',
    textFill: 'white'
  })

  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createDefaultParameter()
}

/**
 * Fits the graph into the graph component with a minimum zoom value.
 * The graph will be slightly zoomed in to avoid that small graphs are displayed too small.
 * @param {!GraphComponent} graphComponent
 * @param {number} [minimumZoom=3]
 */
export function fitGraphBounds(graphComponent, minimumZoom = 3) {
  graphComponent.limitFitContentZoom = false
  graphComponent.fitGraphBounds()
  graphComponent.zoom = Math.min(graphComponent.zoom, minimumZoom)
}

/**
 * Creates a sample graph and introduces all important graph elements present in
 * yFiles for HTML. Additionally, this method now overrides the label placement for some specific labels.
 * @param {!IGraph} graph
 */
export function createSampleGraph(graph) {
  const node1 = graph.createNodeAt(new Point(30, 30))
  const node2 = graph.createNodeAt(new Point(170, 30))
  const node3 = graph.createNode(new Rect(230, 200, 60, 30))

  graph.createEdge(node1, node2)
  const edge2 = graph.createEdge(node2, node3)

  graph.addBend(edge2, new Point(260, 30))

  const port1AtNode1 = graph.addPort(node1, FreeNodePortLocationModel.NODE_CENTER_ANCHORED)

  const port1AtNode3 = graph.addPortAt(node3, new Point(node3.layout.x, node3.layout.center.y))

  const edgeAtPorts = graph.createEdge(port1AtNode1, port1AtNode3)

  // Adds labels to several graph elements
  graph.addLabel(node1, 'n1')
  graph.addLabel(node2, 'n2')
  const n3Label = graph.addLabel(node3, 'n3')
  graph.addLabel(edgeAtPorts, 'Edge at Ports')
}

/**
 * @param {!IGraph} graph
 */
export function createSampleGraphLabelPlacement(graph) {
  const node1 = graph.createNodeAt(new Point(30, 30))
  const node2 = graph.createNode(new Rect(120, 10, 60, 40))
  const node3 = graph.createNode(new Rect(230, 200, 60, 30))

  graph.createEdge(node1, node2)
  const edge2 = graph.createEdge(node2, node3)

  graph.addBend(edge2, new Point(260, 30))

  const port1AtNode1 = graph.addPort(node1, FreeNodePortLocationModel.NODE_CENTER_ANCHORED)

  const port1AtNode3 = graph.addPortAt(node3, new Point(node3.layout.x, node3.layout.center.y))

  const edgeAtPorts = graph.createEdge(port1AtNode1, port1AtNode3)

  // Adds labels to several graph elements
  graph.addLabel(node1, 'n1')
  graph.addLabel(node2, 'n2')
  const n3Label = graph.addLabel(node3, 'n3')
  graph.addLabel(edgeAtPorts, 'Edge at Ports')
}

/**
 * Creates a sample graph and introduces all important graph elements present in
 * yFiles for HTML. Additionally, this method now overrides the label placement for some specific labels.
 * @param {!IGraph} graph
 */
export function createSampleGraphViewport(graph) {
  const node1 = graph.createNodeAt(new Point(30, 30))
  const node2 = graph.createNodeAt(new Point(150, 30))

  const node3 = graph.createNode(new Rect(230, 200, 60, 30))

  graph.createEdge(node1, node2)
  const edgeWithBend = graph.createEdge(node2, node3)

  graph.addBend(edgeWithBend, new Point(260, 30))

  const port1AtNode1 = graph.addPort(node1, FreeNodePortLocationModel.NODE_CENTER_ANCHORED)

  const port1AtNode3 = graph.addPortAt(node3, new Point(node3.layout.x, node3.layout.center.y))

  const edgeAtPorts = graph.createEdge(port1AtNode1, port1AtNode3)

  graph.addLabel(node1, 'n1')
  graph.addLabel(node2, 'n2')
  graph.addLabel(node3, 'n3')
  graph.addLabel(edgeAtPorts, 'Edge at Ports')

  graph.addLabel(
    graph.createNodeAt(new Point(-500, -500)),
    'Outside initial viewport',
    ExteriorLabelModel.SOUTH
  )
}

/**
 * Creates a larger sample graph.
 * @param {!IGraph} graph
 */
export function createSampleGraphLayout(graph) {
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: graphDataLayout.nodes,
    id: 'id',
    parentId: 'parent',
    layout: 'layout',
    labels: ['label']
  })
  builder.createGroupNodesSource({
    data: graphDataLayout.groups,
    id: 'id',
    layout: 'layout',
    labels: ['label']
  })
  builder.createEdgesSource(graphDataLayout.edges, 'source', 'target', 'id')

  builder.buildGraph()
}

/**
 * Creates a larger sample graph.
 * @param {!IGraph} graph
 */
export function createSampleGraphLayoutData(graph) {
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: graphDataLayoutData.nodes,
    id: 'id',
    parentId: 'parent',
    layout: 'layout',
    labels: ['alignment']
  })
  builder.createGroupNodesSource({
    data: graphDataLayoutData.groups,
    id: 'id',
    layout: 'layout',
    labels: ['label']
  })
  builder.createEdgesSource(graphDataLayoutData.edges, 'source', 'target', 'id')

  builder.buildGraph()
}

/**
 * @param {!IGraph} graph
 */
export function createSampleGraphAnalysis(graph) {
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: graphDataAnalysis.nodes,
    id: 'id',
    parentId: 'parent',
    layout: 'layout',
    labels: ['label']
  })
  builder.createGroupNodesSource({
    data: graphDataAnalysis.groups,
    id: 'id',
    layout: 'layout',
    labels: ['label']
  })
  builder.createEdgesSource(graphDataAnalysis.edges, 'source', 'target', 'id')

  builder.buildGraph()
}

/**
 * @param {!IGraph} graph
 */
export function setDefaultLabelLayoutParameters(graph) {
  // For node labels, the default is a label position at the node center
  // Let's keep the default.  Here is how to set it manually

  // Place node labels in the node center
  graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.CENTER

  // Use a rotated layout for edge labels
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel({
    autoRotation: true
  }).createParameterFromSource(0, 10.0, 0.5)
}

/**
 * @param {!GraphComponent} graphComponent
 * @returns {!GraphEditorInputMode}
 */
export function configureInteraction(graphComponent) {
  // Create a new GraphEditorInputMode instance and register it as the main
  // input mode for the graphComponent
  const graphEditorInputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  graphComponent.inputMode = graphEditorInputMode
  return graphEditorInputMode
}

/**
 * @param {!GraphComponent} graphComponent
 */
export function configureHighlights(graphComponent) {
  graphComponent.selection.addItemSelectionChangedListener(() =>
    graphComponent.highlightIndicatorManager.clearHighlights()
  )

  graphComponent.graph.decorator.nodeDecorator.highlightDecorator.setImplementation(
    new NodeStyleDecorationInstaller({
      nodeStyle: new ShapeNodeStyle({ stroke: '3px orange', fill: 'none' })
    })
  )
  graphComponent.graph.decorator.edgeDecorator.highlightDecorator.setImplementation(
    new EdgeStyleDecorationInstaller({
      edgeStyle: new PolylineEdgeStyle({
        stroke: '3px orange'
      })
    })
  )
}

/**
 * @param {!string} selector
 * @param {!function} callback
 */
export function addButtonListener(selector, callback) {
  document.querySelector(selector)?.addEventListener('click', async () => {
    callback()
  })
}
