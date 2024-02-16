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

const tabWidth = 50
const tabHeight = 14

/**
 * Augment the SvgVisual type with the data used to cache the rendering information
 */
// the values we use to render the graphics
/**
 * @typedef {Object} Cache
 * @property {number} width
 * @property {number} height
 * @property {string} fillColor
 */

/**
 * @typedef {TaggedSvgVisual.<SVGPathElement,Cache>} CustomNodeStyleVisual
 */

export class CustomNodeStyle extends NodeStyleBase {
  /**
   * Creates a new instance of this style using the given fill color.
   * @param fillColor The color used to fill nodes.
   * @param {!string} [fillColor]
   */
  constructor(fillColor) {
    super()
    this.fillColor = fillColor
  }

  /**
   * @param {!IRenderContext} context
   * @param {!INode} node
   * @returns {!CustomNodeStyleVisual}
   */
  createVisual(context, node) {
    const { x, y, width, height } = node.layout

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathElement.setAttribute('d', createPathData(0, 0, width, height))

    const fillColor = this.fillColor ?? '#0b7189'
    pathElement.setAttribute('fill', fillColor)
    pathElement.setAttribute('stroke', '#333')

    SvgVisual.setTranslate(pathElement, x, y)

    return SvgVisual.from(pathElement, { width, height, fillColor })
  }

  /**
   * @param {!IRenderContext} context
   * @param {!CustomNodeStyleVisual} oldVisual
   * @param {!INode} node
   * @returns {!CustomNodeStyleVisual}
   */
  updateVisual(context, oldVisual, node) {
    const { x, y, width, height } = node.layout
    // get the path element that needs updating from the old visual
    const pathElement = oldVisual.svgElement
    // get the cache object we stored in createVisual
    const cache = oldVisual.tag

    const fillColor = this.fillColor ?? '#0b7189'
    if (fillColor !== cache.fillColor) {
      cache.fillColor = fillColor
      // update the fill color
      pathElement.setAttribute('fill', fillColor)
    }

    if (width !== cache.width || height !== cache.height) {
      // update the path data to fit the new width and height
      pathElement.setAttribute('d', createPathData(0, 0, width, height))
      cache.width = width
      cache.height = height
    }

    SvgVisual.setTranslate(pathElement, x, y)
    return oldVisual
  }
}

/**
 * Creates the path data for the SVG path element.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {!string}
 */
export function createPathData(x, y, width, height) {
  return `M ${x} ${y} h ${tabWidth} v ${tabHeight} h ${width - tabWidth} v ${
    height - tabHeight
  } h ${-width} z`
}
