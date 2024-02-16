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
  IGraph,
  ILabel,
  INode,
  Point,
  WebGL2EdgeIndicatorStyle,
  WebGL2FocusIndicatorManager,
  WebGL2GraphModelManager,
  WebGL2HighlightIndicatorManager,
  WebGL2LabelIndicatorStyle,
  WebGL2NodeIndicatorStyle,
  WebGL2SelectionIndicatorManager
} from 'yfiles'
import { isWebGL2EdgeStyle, isWebGL2LabelStyle, isWebGL2NodeStyle } from './webgl2-styles-util.js'

class PreloadingWebGL2GraphModelManager extends WebGL2GraphModelManager {
  /**
   * @param {!INode} node
   */
  getWebGL2NodeStyle(node) {
    return node.tag || null
  }

  /**
   * @param {!IEdge} edge
   */
  getWebGL2EdgeStyle(edge) {
    return edge.tag || null
  }

  /**
   * @param {!ILabel} label
   */
  getWebGL2LabelStyle(label) {
    return label.tag || null
  }
}

/**
 * @typedef {Object} SplitWebGL2Styles
 * @property {Array.<WebGL2NodeStyle>} nodeStyles
 * @property {Array.<WebGL2EdgeStyle>} edgeStyles
 * @property {Array.<WebGL2LabelStyle>} labelStyles
 * @property {object} indicatorStyles
 */

/**
 * @param {!Array.<WebGL2Style>} undefined
 * @returns {!Promise}
 */
export async function preloadWebGL2Styles(...styles) {
  const gc = new GraphComponent()
  const splitStyles = splitStylesByType(styles)
  const { selection, focus, highlight } = createGraph(gc.graph, splitStyles)
  return new Promise((resolve) => {
    const gmm = new PreloadingWebGL2GraphModelManager()
    gmm.addShadersCompiledListener(() => {
      resolve()
    })
    gc.graphModelManager = gmm
    gc.selectionIndicatorManager = selection
    gc.focusIndicatorManager = focus
    gc.highlightIndicatorManager = highlight
    gc.updateVisual()
  })
}

/**
 * @param {!IGraph} graph
 * @param {!SplitWebGL2Styles} splitStyles
 */
function createGraph(graph, splitStyles) {
  const { nodeStyles, edgeStyles, labelStyles, indicatorStyles } = splitStyles
  for (const nodeStyle of nodeStyles) {
    graph.createNode({
      tag: nodeStyle
    })
  }
  const n1 = graph.createNode()
  const n2 = graph.createNode()
  for (const edgeStyle of edgeStyles) {
    graph.createEdge({
      source: n1,
      target: n2,
      tag: edgeStyle,
      bends: Array(10)
        .fill(0)
        .map((_, i) => new Point(i, i))
    })
  }
  for (const labelStyle of labelStyles) {
    graph.addLabel({
      owner: n1,
      text: '',
      tag: labelStyle
    })
  }
  const indicatorNode = graph.createNode()
  const indicatorEdge = graph.createEdge(indicatorNode, indicatorNode)
  const indicatorLabel = graph.addLabel(indicatorNode, 'TEXT')
  const selection = new WebGL2SelectionIndicatorManager()
  const focus = new WebGL2FocusIndicatorManager()
  const highlight = new WebGL2HighlightIndicatorManager()

  for (const item of [indicatorNode, indicatorEdge, indicatorLabel]) {
    selection.addSelection(item)
    focus.focusedItem = item
    highlight.addHighlight(item)
  }

  const indicatorManagers = [selection, focus, highlight]

  for (let i = 0; i < 3; i++) {
    if (indicatorStyles.node[i]) {
      indicatorManagers[i].nodeStyle = indicatorStyles.node[i]
    }
    if (indicatorStyles.edge[i]) {
      indicatorManagers[i].edgeStyle = indicatorStyles.edge[i]
    }
    if (indicatorStyles.label[2 * i]) {
      indicatorManagers[i].nodeLabelStyle = indicatorStyles.label[2 * i]
    }
    if (indicatorStyles.label[2 * i + 1]) {
      indicatorManagers[i].edgeLabelStyle = indicatorStyles.label[2 * i + 1]
    }
  }

  return {
    selection,
    focus,
    highlight
  }
}

/**
 * @param {!Array.<WebGL2Style>} styles
 * @returns {!SplitWebGL2Styles}
 */
function splitStylesByType(styles) {
  const result = {
    nodeStyles: [],
    edgeStyles: [],
    labelStyles: [],
    indicatorStyles: {
      node: [],
      edge: [],
      label: []
    }
  }

  for (const style of styles) {
    if (isWebGL2NodeStyle(style)) {
      result.nodeStyles.push(style)
    } else if (isWebGL2EdgeStyle(style)) {
      result.edgeStyles.push(style)
    } else if (isWebGL2LabelStyle(style)) {
      result.labelStyles.push(style)
    } else if (style instanceof WebGL2NodeIndicatorStyle) {
      result.indicatorStyles.node.push(style)
    } else if (style instanceof WebGL2EdgeIndicatorStyle) {
      result.indicatorStyles.edge.push(style)
    } else if (style instanceof WebGL2LabelIndicatorStyle) {
      result.indicatorStyles.label.push(style)
    }
  }

  if (
    result.indicatorStyles.node.length > 3 ||
    result.indicatorStyles.edge.length > 3 ||
    result.indicatorStyles.label.length > 6
  ) {
    throw new Error('Too many WebGL 2 indicator styles')
  }
  return result
}
