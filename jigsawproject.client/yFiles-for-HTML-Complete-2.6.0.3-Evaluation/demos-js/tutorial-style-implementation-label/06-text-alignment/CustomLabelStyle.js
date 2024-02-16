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
import { Font, LabelStyleBase, Size, SvgVisual, TextRenderSupport } from 'yfiles'

const font = new Font({
  fontFamily: 'Arial',
  fontSize: 12
})
const padding = 3

/**
 * Augment the SvgVisual type with the data used to cache the rendering information
 * @typedef {Object} Cache
 * @property {number} width
 * @property {number} height
 * @property {string} text
 * @property {string} horizontalAlignment
 * @property {string} verticalAlignment
 */

/**
 * @typedef {TaggedSvgVisual.<SVGGElement,Cache>} CustomLabelStyleVisual
 */

export class CustomLabelStyle extends LabelStyleBase {
  /**
   * @param {!('start'|'middle'|'end')} [horizontalAlignment=middle]
   * @param {!('top'|'center'|'bottom')} [verticalAlignment=center]
   */
  constructor(horizontalAlignment = 'middle', verticalAlignment = 'center') {
    super()
    this.verticalAlignment = verticalAlignment
    this.horizontalAlignment = horizontalAlignment
  }

  /**
   * @param {!IRenderContext} context
   * @param {!ILabel} label
   * @returns {!CustomLabelStyleVisual}
   */
  createVisual(context, label) {
    // create an SVG text element that displays the label text
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')

    const labelSize = label.layout.toSize()
    this.updateText(textElement, label.text, labelSize)

    // add a background shape
    const backgroundPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    backgroundPathElement.setAttribute('d', this.createBackgroundShapeData(labelSize))
    backgroundPathElement.setAttribute('stroke', '#aaa')
    backgroundPathElement.setAttribute('fill', '#fffecd')

    const gElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    gElement.appendChild(backgroundPathElement)
    gElement.appendChild(textElement)

    // move text to label location
    const transform = LabelStyleBase.createLayoutTransform(context, label.layout, true)
    transform.applyTo(gElement)

    const cache = {
      width: labelSize.width,
      height: labelSize.height,
      text: label.text,
      horizontalAlignment: this.horizontalAlignment,
      verticalAlignment: this.verticalAlignment
    }

    return SvgVisual.from(gElement, cache)
  }

  /**
   * @param {!IRenderContext} context
   * @param {!CustomLabelStyleVisual} oldVisual
   * @param {!ILabel} label
   * @returns {!CustomLabelStyleVisual}
   */
  updateVisual(context, oldVisual, label) {
    const gElement = oldVisual.svgElement
    const labelSize = label.layout.toSize()
    // get the cache object we stored in createVisual
    const cache = oldVisual.tag

    // check if the label size or text has changed
    if (
      labelSize.width !== cache.width ||
      labelSize.height !== cache.height ||
      label.text !== cache.text ||
      this.horizontalAlignment !== cache.horizontalAlignment ||
      this.verticalAlignment !== cache.verticalAlignment
    ) {
      // get the path and text element
      const backgroundPath = gElement.children.item(0)
      const textElement = gElement.children.item(1)
      if (backgroundPath) {
        backgroundPath.setAttribute('d', this.createBackgroundShapeData(labelSize))
      }
      if (textElement instanceof SVGTextElement) {
        this.updateText(textElement, label.text, labelSize)
      }
      // update the cache with the new values
      cache.width = labelSize.width
      cache.height = labelSize.height
      cache.text = label.text
      cache.horizontalAlignment = this.horizontalAlignment
      cache.verticalAlignment = this.verticalAlignment
    }

    // move text to label location
    const transform = LabelStyleBase.createLayoutTransform(context, label.layout, true)
    transform.applyTo(gElement)

    return oldVisual
  }

  /**
   * Updates the text content of the text element using TextRenderSupport.
   * @param {!SVGTextElement} textElement
   * @param {!string} text
   * @param {!Size} labelSize
   */
  updateText(textElement, text, labelSize) {
    // use a convenience method to place text content in the <text> element.
    const textContent = TextRenderSupport.addText(textElement, text, font)

    textElement.setAttribute('text-anchor', this.horizontalAlignment)

    // calculate offset for horizontal alignment
    // leave room for the padding
    let translateX
    switch (this.horizontalAlignment) {
      case 'start':
        // the left border of the label
        translateX = padding
        break
      case 'middle':
        // the label center
        translateX = labelSize.width * 0.5
        break
      case 'end':
        // the right border of the label
        translateX = labelSize.width - padding
        break
    }

    // calculate the size of the text element
    const textSize = TextRenderSupport.measureText(textContent, font)

    // calculate vertical offset for centered alignment
    let translateY = (labelSize.height - textSize.height) * 0.5
    switch (this.verticalAlignment) {
      case 'top':
        translateY = padding
        break
      case 'center':
        translateY = (labelSize.height - textSize.height) * 0.5
        break
      case 'bottom':
        translateY = labelSize.height - textSize.height - padding
        break
    }

    textElement.setAttribute('transform', `translate(${translateX} ${translateY})`)
  }

  /**
   * @param {!ILabel} label
   * @returns {!Size}
   */
  getPreferredSize(label) {
    const insets = 20 + 2 * padding
    // measure the label text using the font
    const { width, height } = TextRenderSupport.measureText(label.text, font)
    // return the measured size plus the insets
    return new Size(width + insets, height + insets)
  }

  /**
   * Creates a simple "speech balloon" shape.
   * @param {!Size} labelSize
   * @returns {!string}
   */
  createBackgroundShapeData(labelSize) {
    const { width: w, height: h } = labelSize
    return `M 0 0 h ${w} v ${h} h -${w * 0.5 - 5} l -5 5 v -5 h -${w * 0.5} z`
  }
}