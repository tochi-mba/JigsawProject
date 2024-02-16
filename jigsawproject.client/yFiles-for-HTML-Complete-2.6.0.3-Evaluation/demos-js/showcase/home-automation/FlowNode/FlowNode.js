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
import { FreeNodePortLocationModel, GraphComponent, IGraph, INode, Point, SimpleNode } from 'yfiles'
import { FlowNodePortStyle } from './FlowNodePortStyle.js'
import { FlowNodeStyle } from './FlowNodeStyle.js'
import { flowNodeProperties } from './flowNodeProperties.js'

export const flowNodeVariants = [
  'storageWriteFile',
  'storageReadFile',
  'parserCsv',
  'parserJson',
  'parserXml',
  'sequenceSort',
  'sequenceJoin',
  'networkTcpIn',
  'networkTcpOut',
  'networkTcpRequest',
  'functionFunction',
  'functionDelay',
  'functionFilter',
  'commonComment',
  'commonLinkIn',
  'commonLinkOut',
  'commonLinkCall',
  'commonStatus'
]
/**
 * @typedef {*} FlowNodeVariant
 */
/**
 * @typedef {Object} FlowNodeValidation
 * @property {Array.<string>} invalidProperties
 * @property {Array.<string>} validationMessages
 */
/**
 * @typedef {function} FlowNodeValidationFn
 */

/**
 * @typedef {Object} FlowNodeProperties
 * @property {FlowNodeVariant} variant
 * @property {string} label
 * @property {boolean} hasLeftPort
 * @property {boolean} hasRightPort
 * @property {FlowNodeValidationFn} [validate]
 */

/**
 * @typedef {*} FlowNode
 */

/**
 * @typedef {Object} FlowNodeInGraphOptions
 * @property {FlowNodeVariant} variant
 * @property {Point} position
 * @property {IGraph} graph
 */

/**
 * Properties that should never appear in the tag editor
 */
export let hiddenProperties = ['hasLeftPort', 'hasRightPort', 'validate']
export let lockedProperties = ['variant']

const portStyle = new FlowNodePortStyle()

/**
 * Modifies node-related graph configuration.
 * @param {!GraphComponent} undefined
 */
export function configureFlowNodes({ graph, selection }) {
  graph.decorator.nodeDecorator.focusIndicatorDecorator.hideImplementation()
  graph.decorator.nodeDecorator.highlightDecorator.hideImplementation()
  graph.decorator.nodeDecorator.selectionDecorator.hideImplementation()

  // When a new node appears in the graph, its ports are added automatically. This is done
  // in reaction to `NodeCreated` event so that nodes added from the DnD palette, which doesn't
  // handle nodes with ports correctly, end up having their ports properly configured as soon as
  // they're dropped onto the main graph.
  graph.addNodeCreatedListener((_sender, event) => {
    const node = event.item
    if (!isFlowNode(node)) {
      return
    }
    const { hasLeftPort, hasRightPort } = node.tag
    if (node.ports.size === 0) {
      hasLeftPort &&
        graph.addPort({
          owner: node,
          style: portStyle,
          locationParameter: FreeNodePortLocationModel.NODE_LEFT_ANCHORED,
          tag: {
            side: 'left'
          }
        })
      hasRightPort &&
        graph.addPort({
          owner: node,
          style: portStyle,
          locationParameter: FreeNodePortLocationModel.NODE_RIGHT_ANCHORED,
          tag: {
            side: 'right'
          }
        })
    }
    const label = node.tag.label
    const duplicateLabelNodes = graph.nodes.filter((node) => node.tag.label.startsWith(label))
    if (!!label && duplicateLabelNodes.size > 1) {
      const lastLabelNumber = duplicateLabelNodes
        .toArray()
        .map((node) => node.tag.label.split('#')[1] || '0')
        .map((value) => Number.parseInt(value))
        .sort((a, b) => b - a)[0]
      node.tag = { ...node.tag, label: label + ` #${lastLabelNumber + 1}` }
    }

    selection.clear()
    selection.setSelected(node, true)
  })
}

/**
 * Creates a FlowNode and adds it to the graph at the specified position.
 * Ports will be added automatically on node creation.
 * @param {!FlowNodeInGraphOptions} undefined
 * @returns {!FlowNode}
 */
export function createInGraph({ variant, position, graph }) {
  const properties = { ...flowNodeProperties[variant] }
  return graph.createNode({
    style: new FlowNodeStyle(),
    layout: {
      width: FlowNodeStyle.defaultWidth,
      height: FlowNodeStyle.defaultHeight,
      x: position.x,
      y: position.y
    },
    tag: properties
  })
}

/**
 * Creates a graph-less FlowNode without ports (but dummy port visuals will still be rendered
 * as part of the node visual).
 * @param {!FlowNodeVariant} variant
 * @returns {!FlowNode}
 */
export function createFlowNode(variant) {
  const properties = { ...flowNodeProperties[variant] }
  return new SimpleNode({
    style: new FlowNodeStyle(),
    layout: {
      width: FlowNodeStyle.defaultWidth,
      height: FlowNodeStyle.defaultHeight,
      x: 0,
      y: 0
    },
    tag: properties
  })
}

/**
 * @param {!unknown} node
 * @returns {!FlowNode}
 */
export function assertIsFlowNode(node) {
  if (!isFlowNode(node)) {
    throw new Error('Node not satisfy type FlowNode')
  }
}

/**
 * @param {!unknown} node
 * @returns {!FlowNode}
 */
export function isFlowNode(node) {
  if (!(node instanceof INode)) {
    return false
  }
  return validateNodeTag(node.tag)
}

/**
 * @param {!unknown} tag
 * @returns {!FlowNodeProperties}
 */
export function validateNodeTag(tag) {
  return typeof tag === 'object' && tag !== null && flowNodeVariants.includes(tag.variant)
}
