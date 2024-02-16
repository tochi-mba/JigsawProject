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
import { NodeStyleBase, SvgVisual } from 'yfiles'
import { getNodeData } from '../data-types.js'

/**
 * The node style used for the non-root nodes of the mind map.
 * Each node will be represented by a colored line based on its level in the mind map.
 */
export class MindMapNodeStyle extends NodeStyleBase {
  /**
   * Creates a new instance of this style using the given class name.
   * @param {!string} className The css class attributed to the node.
   */
  constructor(className) {
    super()
    this.className = className
  }

  /**
   * Creates the visual for this node style.
   * The node will be represented by a colored line.
   * @param {!IRenderContext} renderContext
   * @param {!INode} node
   * @returns {!SvgVisual}
   */
  createVisual(renderContext, node) {
    // create a container element
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    this.render(renderContext, node, g)
    // move the container to the node position
    SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
    return new SvgVisual(g)
  }

  /**
   * Updates the node visual.
   * If the size or color of the node has changed, a new visual will be created.
   * @param {!IRenderContext} renderContext
   * @param {!SvgVisual} oldVisual
   * @param {!INode} node
   * @returns {!SvgVisual}
   */
  updateVisual(renderContext, oldVisual, node) {
    const container = oldVisual.svgElement
    const nodeData = getNodeData(node)
    const nodeSize = node.layout.toSize()

    // check if the data used to create the visualization has changed
    if (!nodeSize.equals(container.cache.size) || nodeData.color !== container.cache.color) {
      // remove the old elements and re-render the node
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
      this.render(renderContext, node, container)
    }
    // move the container to the node position
    SvgVisual.setTranslate(container, node.layout.x, node.layout.y)
    return oldVisual
  }

  /**
   * Creates the line svg element, adds it to the container and updates the cached information
   * for the rendering.
   * @param {!IRenderContext} renderContext
   * @param {!INode} node
   * @param {!CachedElement} container
   */
  render(renderContext, node, container) {
    const nodeData = getNodeData(node)
    const color = nodeData.color
    const size = node.layout.toSize()

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.x1.baseVal.value = 0
    line.x2.baseVal.value = size.width
    line.y1.baseVal.value = line.y2.baseVal.value = size.height
    // set the CSS class for the line
    line.setAttribute('class', `node-underline ${this.className}`)
    line.setAttribute('stroke', color)

    container.appendChild(line)
    // store the data used to create the elements with the container
    container.cache = { size, color }
  }
}
