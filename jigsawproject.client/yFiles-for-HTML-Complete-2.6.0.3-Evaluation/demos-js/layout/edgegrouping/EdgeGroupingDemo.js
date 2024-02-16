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
  Arrow,
  ArrowType,
  BridgeCrossingStyle,
  BridgeManager,
  EdgeStyleBase,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphObstacleProvider,
  GraphSelectionIndicatorManager,
  HierarchicLayout,
  HierarchicLayoutData,
  IArrow,
  IEdge,
  IModelItem,
  INode,
  IRenderContext,
  LayoutMode,
  License,
  NodeStylePortStyleAdapter,
  PolylineEdgeStyle,
  PopulateItemContextMenuEventArgs,
  ShapeNodeShape,
  ShapeNodeStyle,
  SimplexNodePlacer,
  SmoothingPolicy,
  SolidColorFill,
  SvgVisual,
  SvgVisualGroup,
  Visual,
  VoidPortStyle
} from 'yfiles'

import { ContextMenu } from 'demo-utils/ContextMenu'
import SampleData from './resources/SampleData.js'
import { applyDemoTheme, createDemoNodeStyle, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

/**
 * @typedef {Object} EdgeTag
 * @property {string} [sourceGroupId]
 * @property {string} [targetGroupId]
 */

/** @type {GraphComponent} */
let graphComponent = null

/** @type {boolean} */
let portGroupMode = false

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  configureInteraction()
  createSampleGraph()
  initializeUI()
}

/**
 * Applies a layout to the current graph including the edge/port group information in the edges'
 * tags.
 * @param {boolean} incremental
 */
async function runLayout(incremental) {
  setUIDisabled(true)
  const layout = new HierarchicLayout({
    orthogonalRouting: true,
    minimumLayerDistance: 70,
    layoutMode: incremental ? LayoutMode.INCREMENTAL : LayoutMode.FROM_SCRATCH
  })
  layout.nodePlacer.barycenterMode = true
  layout.nodePlacer.bendReduction = false

  const layoutData = new HierarchicLayoutData({
    edgeThickness: 3,
    incrementalHints: { incrementalSequencingItems: graphComponent.graph.edges }
  })
  if (portGroupMode) {
    layoutData.sourcePortGroupIds.delegate = (edge) =>
      edge.tag && edge.tag.sourceGroupId ? edge.tag.sourceGroupId : null
    layoutData.targetPortGroupIds.delegate = (edge) =>
      edge.tag && edge.tag.targetGroupId ? edge.tag.targetGroupId : null
  } else {
    layoutData.sourceGroupIds.delegate = (edge) =>
      edge.tag && edge.tag.sourceGroupId ? edge.tag.sourceGroupId : null
    layoutData.targetGroupIds.delegate = (edge) =>
      edge.tag && edge.tag.targetGroupId ? edge.tag.targetGroupId : null
  }

  await graphComponent.morphLayout(layout, '700ms', layoutData)
  setUIDisabled(false)
}

function createSampleGraph() {
  const graph = graphComponent.graph
  graph.clear()
  initDemoStyles(graph, { extraCropLength: 0 })
  graph.nodeDefaults.style = createDemoNodeStyle('demo-palette-44')
  graph.nodeDefaults.size = [50, 30]
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '3px #BBBBBB',
    targetArrow: new Arrow({
      fill: '#BBBBBB',
      type: ArrowType.TRIANGLE
    }),
    smoothingLength: 15
  })
  graph.edgeDefaults.shareStyleInstance = false

  graphComponent.selectionIndicatorManager = new GraphSelectionIndicatorManager({
    edgeStyle: new HighlightEdgeStyle()
  })

  const bridgeManager = new BridgeManager({
    canvasComponent: graphComponent,
    defaultBridgeCrossingStyle: BridgeCrossingStyle.GAP
  })
  bridgeManager.addObstacleProvider(new GraphObstacleProvider())

  const builder = new GraphBuilder(graph)
  builder.createNodesSource(SampleData.nodes, 'id')
  builder.createEdgesSource(SampleData.edges, 'from', 'to', 'id')
  builder.buildGraph()

  graph.edges.forEach((edge) => {
    edge.tag = edge.tag.groupIds
    updateStyles(edge)
  })

  graphComponent.fitGraphBounds()
  runLayout(false)
}

/**
 * Updates the selection when an item is right-clicked for a context menu.
 * @param {!IModelItem} item
 */
function updateSelection(item) {
  const selection = graphComponent.selection
  if (item) {
    if (!selection.isSelected(item)) {
      selection.clear()
      selection.setSelected(item, true)
    } else {
      if (item instanceof IEdge) {
        selection.selectedNodes.clear()
      } else {
        selection.selectedEdges.clear()
      }
      selection.setSelected(item, true)
    }
  }
}

/**
 * Groups the given edges according to the type. In case 'override' is true, a new tag is set.
 * @param {!('source'|'target'|'source-and-target'|'ungroup')} type
 * @param {!Array.<IEdge>} edges
 * @param {boolean} override
 */
function groupEdges(type, edges, override) {
  const id = Date.now()
  edges.forEach((edge) => {
    const tag = {}
    switch (type) {
      case 'source':
        tag.sourceGroupId = `s ${id} ${hashCode(edge.sourceNode)}`
        break
      case 'target':
        tag.targetGroupId = `t ${id} ${hashCode(edge.targetNode)}`
        break
      case 'source-and-target':
        tag.sourceGroupId = `s ${id} ${hashCode(edge.sourceNode)}`
        tag.targetGroupId = `t ${id} ${hashCode(edge.targetNode)}`
        break
      default:
    }

    if (!edge.tag || override || type === 'ungroup') {
      edge.tag = tag
    } else {
      edge.tag.sourceGroupId = tag.sourceGroupId || edge.tag.sourceGroupId
      edge.tag.targetGroupId = tag.targetGroupId || edge.tag.targetGroupId
    }
    updateStyles(edge)
  })

  runLayout(true)
}

/**
 * Returns the hash code of the given node.
 * @param {!INode} node
 * @returns {number}
 */
function hashCode(node) {
  return node.hashCode()
}

/**
 * Updates the styles to distinguish the different types of edge/port grouping.
 * @param {!IEdge} edge
 */
function updateStyles(edge) {
  const tag = edge.tag
  if (!tag) {
    return // the ungrouped edge default
  }

  let color = '#BBBBBB'
  if (portGroupMode) {
    if (tag.sourceGroupId && tag.targetGroupId) {
      color = '#FFA500'
    } else if (tag.sourceGroupId) {
      color = '#DC143C'
    } else if (tag.targetGroupId) {
      color = '#D2691E'
    }
  } else if (tag.sourceGroupId && tag.targetGroupId) {
    color = '#6495ED'
  } else if (tag.sourceGroupId) {
    color = '#4169E1'
  } else if (tag.targetGroupId) {
    color = '#483D8B'
  }

  const portStyle = new NodeStylePortStyleAdapter({
    nodeStyle: new ShapeNodeStyle({
      shape: ShapeNodeShape.ELLIPSE,
      fill: color,
      stroke: null
    }),
    renderSize: [7, 7]
  })
  if (tag.sourceGroupId) {
    graphComponent.graph.setStyle(edge.sourcePort, portStyle)
  } else {
    graphComponent.graph.setStyle(edge.sourcePort, new VoidPortStyle())
  }
  if (tag.targetGroupId) {
    graphComponent.graph.setStyle(edge.targetPort, portStyle)
  } else {
    graphComponent.graph.setStyle(edge.targetPort, new VoidPortStyle())
  }

  graphComponent.graph.setStyle(
    edge,
    new PolylineEdgeStyle({
      stroke: `3px ${color}`,
      targetArrow: new Arrow({
        fill: color,
        stroke: color,
        type: ArrowType.TRIANGLE,
        cropLength: tag.targetGroupId ? 4 : 0.5
      }),
      smoothingLength: 15
    })
  )
}

/**
 * Sets a {@link GraphEditorInputMode} and initializes the context menu.
 */
function configureInteraction() {
  const inputMode = new GraphEditorInputMode({
    selectableItems: GraphItemTypes.EDGE | GraphItemTypes.NODE
  })

  const contextMenu = new ContextMenu(graphComponent)
  contextMenu.addOpeningEventListeners(graphComponent, (location) => {
    const worldLocation = graphComponent.toWorldFromPage(location)
    const showMenu = inputMode.contextMenuInputMode.shouldOpenMenu(worldLocation)
    if (showMenu) {
      contextMenu.show(location)
    }
  })
  inputMode.addPopulateItemContextMenuListener((_, evt) => populateContextMenu(contextMenu, evt))
  inputMode.contextMenuInputMode.addCloseMenuListener(() => contextMenu.close())
  contextMenu.onClosedCallback = () => inputMode.contextMenuInputMode.menuClosed()
  graphComponent.inputMode = inputMode
}

/**
 * Adds menu items to the context menu depending on what type of graph element was hit.
 * @param {!ContextMenu} contextMenu
 * @param {!PopulateItemContextMenuEventArgs.<IModelItem>} args
 */
function populateContextMenu(contextMenu, args) {
  args.showMenu = true
  contextMenu.clearItems()

  let item = args.item
  const selection = graphComponent.selection
  if (!item && selection.selectedEdges.size > 0) {
    item = selection.selectedEdges.first()
  }
  updateSelection(item)
  if (item instanceof IEdge) {
    contextMenu.clearItems()
    const selectedEdges = selection.selectedEdges.toArray()
    if (portGroupMode) {
      const sourcePortGroupMenuItem = contextMenu.addMenuItem('Source Port Group', () =>
        groupEdges('source', selectedEdges, true)
      )
      const targetPortGroupMenuItem = contextMenu.addMenuItem('Target Port Group', () =>
        groupEdges('target', selectedEdges, true)
      )
      const sourceAndTargetPortGroupMenuItem = contextMenu.addMenuItem(
        'Source and Target Port Group',
        () => groupEdges('source-and-target', selectedEdges, true)
      )
      sourcePortGroupMenuItem.classList.add('source-port-group')
      targetPortGroupMenuItem.classList.add('target-port-group')
      sourceAndTargetPortGroupMenuItem.classList.add('source-and-target-port-group')
    } else {
      const sourceGroupMenuItem = contextMenu.addMenuItem('Source Group', () =>
        groupEdges('source', selectedEdges, true)
      )
      const targetGroupMenuItem = contextMenu.addMenuItem('Target Group', () =>
        groupEdges('target', selectedEdges, true)
      )
      const sourceAndTargetGroupMenuItem = contextMenu.addMenuItem('Source and Target Group', () =>
        groupEdges('source-and-target', selectedEdges, true)
      )
      sourceGroupMenuItem.classList.add('source-edge-group')
      targetGroupMenuItem.classList.add('target-edge-group')
      sourceAndTargetGroupMenuItem.classList.add('source-and-target-edge-group')
    }
    contextMenu.addMenuItem('Ungroup', () => groupEdges('ungroup', selectedEdges, true))
  } else if (item instanceof INode) {
    let outgoingEdges = []
    let incomingEdges = []
    let incidentEdges = []
    selection.selectedNodes.forEach((node) => {
      outgoingEdges = outgoingEdges.concat(graphComponent.graph.outEdgesAt(node).toArray())
      incomingEdges = incomingEdges.concat(graphComponent.graph.inEdgesAt(node).toArray())
      incidentEdges = incidentEdges.concat(graphComponent.graph.edgesAt(node).toArray())
    })
    if (portGroupMode) {
      const sourcePortGroupMenuItem = contextMenu.addMenuItem('Port Group Outgoing Edges', () =>
        groupEdges('source', outgoingEdges, false)
      )
      const targetPortGroupMenuItem = contextMenu.addMenuItem('Port Group Incoming Edges', () =>
        groupEdges('target', incomingEdges, false)
      )
      const sourceAndTargetPortGroupMenuItem = contextMenu.addMenuItem(
        'Port Group Incident Edges',
        () => {
          groupEdges('source', outgoingEdges, false)
          groupEdges('target', incomingEdges, false)
        }
      )
      sourcePortGroupMenuItem.classList.add('source-port-group')
      targetPortGroupMenuItem.classList.add('target-port-group')
      sourceAndTargetPortGroupMenuItem.classList.add('source-and-target-port-group')
    } else {
      const sourceGroupMenuItem = contextMenu.addMenuItem('Group Outgoing Edges', () =>
        groupEdges('source', outgoingEdges, false)
      )
      const targetGroupMenuItem = contextMenu.addMenuItem('Group Incoming Edges', () =>
        groupEdges('target', incomingEdges, false)
      )
      const sourceAndTargetGroupMenuItem = contextMenu.addMenuItem('Group Incident Edges', () =>
        groupEdges('source-and-target', incidentEdges, false)
      )
      sourceGroupMenuItem.classList.add('source-edge-group')
      targetGroupMenuItem.classList.add('target-edge-group')
      sourceAndTargetGroupMenuItem.classList.add('source-and-target-edge-group')
    }
    contextMenu.addMenuItem('Ungroup Incident Edges', () =>
      groupEdges('ungroup', incidentEdges, false)
    )
  } else {
    const allEdges = graphComponent.graph.edges.toArray()
    if (portGroupMode) {
      const sourcePortGroupMenuItem = contextMenu.addMenuItem('Source Port Group All Edges', () =>
        groupEdges('source', allEdges, true)
      )
      const targetPortGroupMenuItem = contextMenu.addMenuItem('Target Port Group All Edges', () =>
        groupEdges('target', allEdges, true)
      )
      const sourceAndTargetPortGroupMenuItem = contextMenu.addMenuItem(
        'Source and Target Port Group All Edges',
        () => groupEdges('source-and-target', allEdges, true)
      )
      sourcePortGroupMenuItem.classList.add('source-port-group')
      targetPortGroupMenuItem.classList.add('target-port-group')
      sourceAndTargetPortGroupMenuItem.classList.add('source-and-target-port-group')
    } else {
      const sourceGroupMenuItem = contextMenu.addMenuItem('Source Group All Edges', () =>
        groupEdges('source', allEdges, true)
      )
      const targetGroupMenuItem = contextMenu.addMenuItem('Target Group All Edges', () =>
        groupEdges('target', allEdges, true)
      )
      const sourceAndTargetGroupMenuItem = contextMenu.addMenuItem(
        'Source and Target Group All Edges',
        () => groupEdges('source-and-target', allEdges, true)
      )
      sourceGroupMenuItem.classList.add('source-edge-group')
      targetGroupMenuItem.classList.add('target-edge-group')
      sourceAndTargetGroupMenuItem.classList.add('source-and-target-edge-group')
    }
    contextMenu.addMenuItem('Ungroup All Edges', () => groupEdges('ungroup', allEdges, true))
  }
}

/**
 * Binds the various actions to the buttons in the toolbar.
 */
function initializeUI() {
  document.querySelector('#layout').addEventListener('click', () => runLayout(false))
  document.querySelector('#reset').addEventListener('click', createSampleGraph)
  document.querySelector('#toggle-port-group-mode').addEventListener('change', (evt) => {
    const value = evt.target.value
    portGroupMode = value === 'port-grouping'
    graphComponent.graph.edges.forEach((edge) => {
      updateStyles(edge)
    })
    runLayout(true)
  })
}

/**
 * Disables the HTML elements of the UI.
 * @param {boolean} disabled true if the element should be disabled, false otherwise
 */
function setUIDisabled(disabled) {
  document.querySelector('#reset').disabled = disabled
  document.querySelector('#layout').disabled = disabled
  document.querySelector('#toggle-port-group-mode').disabled = disabled
  graphComponent.inputMode.enabled = !disabled
}

/**
 * An edge style to draw the selection highlight 'below' the edge.
 */
class HighlightEdgeStyle extends EdgeStyleBase {
  /**
   * @param {!IRenderContext} context
   * @param {!IEdge} edge
   * @returns {!Visual}
   */
  createVisual(context, edge) {
    const style = edge.style
    const strokeColor = style.stroke.fill.color
    const highlightColor = `rgba(${strokeColor.r}, ${strokeColor.g}, ${strokeColor.b})`
    const visualGroup = new SvgVisualGroup()
    const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const highlightPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const path = this.cropPath(
      edge,
      style.sourceArrow,
      style.targetArrow,
      this.getPath(edge)
    ).createSmoothedPath(15, SmoothingPolicy.ASYMMETRIC, true)
    highlightPath.setAttribute('d', path.createSvgPathData())
    highlightPath.setAttribute('stroke', highlightColor)
    highlightPath.setAttribute('stroke-width', '6px')
    highlightPath.setAttribute('fill', 'none')
    this.addArrows(
      context,
      highlight,
      edge,
      path,
      IArrow.NONE,
      new Arrow({
        color: highlightColor,
        scale: 1.5,
        type: ArrowType.TRIANGLE
      })
    )
    highlight.appendChild(highlightPath)
    highlight.setAttribute('opacity', '0.75')

    const highlightVisual = new SvgVisual(highlight)
    visualGroup.add(highlightVisual)
    visualGroup.add(style.renderer.getVisualCreator(edge, style).createVisual(context))

    return visualGroup
  }
}

run().then(finishLoading)
