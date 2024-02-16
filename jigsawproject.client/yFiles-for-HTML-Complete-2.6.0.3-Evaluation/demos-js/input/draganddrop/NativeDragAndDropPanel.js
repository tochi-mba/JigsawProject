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
  IEdge,
  ILabel,
  ILabelModelParameterFinder,
  IListEnumerable,
  INode,
  Insets,
  IPort,
  Point,
  Rect,
  SimpleLabel,
  SimpleNode,
  SvgExport,
  VoidNodeStyle
} from 'yfiles'
import { EdgeDropInputMode } from './EdgeDropInputMode.js'

/**
 * @typedef {Object} DragAndDropPanelItem
 * @property {T} modelItem
 * @property {string} tooltip
 */

// @yjs:keep = effectAllowed

/**
 * A palette of sample nodes. Users can drag and drop the nodes from this palette to a graph control.
 *
 * This class uses the native drag events to start a drag.
 */
export class NativeDragAndDropPanel {
  /**
   * Create a new style panel in the given element.
   * @param {!HTMLElement} div The element that will display the palette items.
   */
  constructor(div) {
    this.div = div
  }

  /**
   * Whether the labels of the DnD node visual should be transferred to
   * the created node or discarded.
   */
  copyNodeLabels = true

  /**
   * This map is used for getting the instances from the string data of the
   * data transfer during 'drop'.
   */
  id2items = new Map()

  /**
   * Adds the items in the given array to the palette.
   * This method delegates the creation of the visualization of each node to createNodeVisual.
   * @param {!Iterable.<DragAndDropPanelItem.<(INode|IEdge)>>} items
   * @param {!GraphEditorInputMode} graphEditorInputMode
   */
  initialize(items, graphEditorInputMode) {
    this.populatePanel(items)
    this.wrapDropInputModes(graphEditorInputMode)
  }

  /**
   * @param {!Iterable.<DragAndDropPanelItem.<(INode|IEdge)>>} items
   */
  populatePanel(items) {
    // Convert the nodes into plain visualizations
    const exportGraphComponent = new GraphComponent()

    let i = 0
    for (const item of items) {
      const modelItem = item.modelItem

      // The item ID is used to get the node instance from the data transfer during 'drop'
      const itemId = `item ${i}`
      const element =
        modelItem instanceof INode
          ? this.createNodeVisual(item, exportGraphComponent)
          : this.createEdgeVisual(item, exportGraphComponent)

      this.addToIdMap(modelItem, itemId)
      this.addDragEventListeners(element, modelItem, itemId)

      // Finally, add the visual to palette
      this.div.appendChild(element)
      i++
    }
  }

  /**
   * @param {!HTMLElement} element
   * @param {!(INode|IEdge)} modelItem
   * @param {!string} itemId
   */
  addDragEventListeners(element, modelItem, itemId) {
    // Set the item ID as data of the data transfer and configure some other drop properties according to the
    // dragged type
    element.addEventListener('dragstart', (e) => {
      if (!e.dataTransfer) {
        return
      }

      e.dataTransfer.dropEffect = 'copy'
      e.dataTransfer.effectAllowed = 'copy'

      if (modelItem.tag instanceof IPort) {
        e.dataTransfer.setData(IPort.$class.name, itemId)
      } else if (modelItem.tag instanceof ILabel) {
        e.dataTransfer.setData(ILabel.$class.name, itemId)
      } else if (modelItem instanceof IEdge) {
        e.dataTransfer.setData(IEdge.$class.name, itemId)
      } else {
        e.dataTransfer.setData(INode.$class.name, itemId)
      }
    })
  }

  /**
   * @param {!(INode|IEdge)} modelItem
   * @param {!string} itemId
   */
  addToIdMap(modelItem, itemId) {
    if (modelItem.tag instanceof IPort) {
      this.id2items.set(itemId, modelItem.tag)
    } else if (modelItem.tag instanceof ILabel) {
      this.id2items.set(itemId, modelItem.tag)
    } else if (modelItem instanceof IEdge) {
      this.id2items.set(itemId, modelItem)
    } else {
      // Store a node without labels to create a plain node on drop
      const modifiedNode = new SimpleNode()
      modifiedNode.layout = modelItem.layout
      modifiedNode.style = modelItem.style
      modifiedNode.ports = modelItem.ports
      modifiedNode.tag = modelItem.tag
      modifiedNode.labels = this.copyNodeLabels ? modelItem.labels : IListEnumerable.EMPTY
      this.id2items.set(itemId, modifiedNode)
    }
  }

  /**
   * If the provided data is an id string, it will be resolved to the respective model item.
   * Else, data is returned as a model item.
   * @param {!unknown} data
   * @returns {!IModelItem}
   */
  resolveItem(data) {
    if (typeof data === 'string') {
      return this.id2items.get(data)
    }

    return data
  }

  /**
   * Creates an element that contains the visualization of the given node.
   * This method is used by populatePanel to create the visualization
   * for each node provided by the factory.
   * @param {!DragAndDropPanelItem.<INode>} original
   * @param {!GraphComponent} exportGraphComponent
   * @returns {!HTMLElement}
   */
  createNodeVisual(original, exportGraphComponent) {
    const exportGraph = exportGraphComponent.graph
    exportGraph.clear()
    const originalNode = original.modelItem

    const node = exportGraph.createNode(
      originalNode.layout.toRect(),
      originalNode.style,
      originalNode.tag
    )
    originalNode.labels.forEach((label) => {
      exportGraph.addLabel(
        node,
        label.text,
        label.layoutParameter,
        label.style,
        label.preferredSize,
        label.tag
      )
    })
    originalNode.ports.forEach((port) => {
      exportGraph.addPort(node, port.locationParameter, port.style, port.tag)
    })

    return exportAndWrap(exportGraphComponent, original.tooltip)
  }

  /**
   * Creates an element that contains the visualization of the given edge.
   * @param {!DragAndDropPanelItem.<IEdge>} original
   * @param {!GraphComponent} graphComponent
   * @returns {!HTMLElement}
   */
  createEdgeVisual(original, graphComponent) {
    const exportGraph = graphComponent.graph
    exportGraph.clear()

    const originalEdge = original.modelItem

    const n1 = exportGraph.createNode(new Rect(0, 10, 0, 0), VoidNodeStyle.INSTANCE)
    const n2 = exportGraph.createNode(new Rect(50, 40, 0, 0), VoidNodeStyle.INSTANCE)
    const edge = exportGraph.createEdge(n1, n2, originalEdge.style)
    exportGraph.addBend(edge, new Point(25, 10))
    exportGraph.addBend(edge, new Point(25, 40))

    return exportAndWrap(graphComponent, original.tooltip)
  }

  /**
   * Wraps the item creators of the drop input modes to resolve the item ids to model items.
   * @param {!GraphEditorInputMode} graphEditorInputMode
   */
  wrapDropInputModes(graphEditorInputMode) {
    this.wrapNodeDropInputMode(graphEditorInputMode)
    this.wrapPortDropInputMode(graphEditorInputMode)
    this.wrapLabelDropInputMode(graphEditorInputMode)
    this.wrapEdgeDropInputMode(graphEditorInputMode)
  }

  /**
   * @param {!GraphEditorInputMode} graphEditorInputMode
   */
  wrapNodeDropInputMode(graphEditorInputMode) {
    // An item creator returns the node instance for the ID of the data transfer.
    // In this demo, we get the node from the 'id2items' map
    const oldItemCreator = graphEditorInputMode.nodeDropInputMode.itemCreator
    graphEditorInputMode.nodeDropInputMode.itemCreator = (
      context,
      graph,
      info,
      dropTarget,
      dropLocation
    ) => {
      const node = this.resolveItem(info)
      // The old item creator handles the placement of the new node in the graph
      return oldItemCreator(context, graph, node, dropTarget, dropLocation)
    }
  }

  /**
   * @param {!GraphEditorInputMode} graphEditorInputMode
   */
  wrapPortDropInputMode(graphEditorInputMode) {
    // An item creator returns the port instance for the ID of the data transfer.
    // In this demo, we get the port from the 'id2items' map
    const portDropInputMode = graphEditorInputMode.portDropInputMode
    const oldPortCreator = portDropInputMode.itemCreator
    portDropInputMode.itemCreator = (context, graph, info, dropTarget, dropLocation) => {
      const port = this.resolveItem(info)
      // the old item creator handles the placement of the new node in the graph
      return oldPortCreator(context, graph, port, dropTarget, dropLocation)
    }
  }

  /**
   * @param {!GraphEditorInputMode} graphEditorInputMode
   */
  wrapLabelDropInputMode(graphEditorInputMode) {
    // An item creator returns the label instance for the ID of the data transfer.
    // In this demo, we get the label from the 'id2items' map
    const labelDropInputMode = graphEditorInputMode.labelDropInputMode
    const oldLabelCreator = labelDropInputMode.itemCreator
    labelDropInputMode.itemCreator = (context, graph, info, dropTarget, dropLocation) => {
      const label = this.resolveItem(info)
      if (label instanceof SimpleLabel) {
        const finder = label.layoutParameter.model.lookup(ILabelModelParameterFinder.$class)
        if (finder) {
          label.layoutParameter = finder.findBestParameter(
            label,
            label.layoutParameter.model,
            label.layout
          )
        }
      }

      // the old item creator handles the placement of the new node in the graph
      return oldLabelCreator(context, graph, label, dropTarget, dropLocation)
    }
  }

  /**
   * @param {!GraphEditorInputMode} graphEditorInputMode
   */
  wrapEdgeDropInputMode(graphEditorInputMode) {
    const edgeDropInputMode = graphEditorInputMode
      .getSortedModes()
      .find((mode) => mode instanceof EdgeDropInputMode)
    if (edgeDropInputMode instanceof EdgeDropInputMode) {
      const oldEdgeCreator = edgeDropInputMode.itemCreator
      edgeDropInputMode.itemCreator = (context, graph, info, dropTarget, dropLocation) => {
        const edge = this.resolveItem(info)
        // the old item creator handles the placement of the new node in the graph
        return oldEdgeCreator(context, graph, edge, dropTarget, dropLocation)
      }
    }
  }
}

/**
 * Exports and wraps the original visualization in an HTML element.
 * @param {!GraphComponent} graphComponent
 * @param {!string} tooltip
 * @returns {!HTMLElement}
 */
function exportAndWrap(graphComponent, tooltip) {
  graphComponent.updateContentRect(new Insets(10))
  const exporter = new SvgExport(graphComponent.contentRect)
  const nodeVisual = exporter.exportSvg(graphComponent)

  // Firefox does not display the SVG correctly because of the clip - so we remove it.
  nodeVisual.removeAttribute('clip-path')

  // create the HTML element
  const div = document.createElement('div')
  div.setAttribute('class', 'demo-dnd-panel__item')
  div.appendChild(nodeVisual)

  div.setAttribute('draggable', 'true')
  div.title = tooltip
  return div
}
