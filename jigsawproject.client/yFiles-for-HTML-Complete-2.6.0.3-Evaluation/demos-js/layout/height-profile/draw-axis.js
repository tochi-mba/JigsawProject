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
  BaseClass,
  Font,
  IBoundsProvider,
  ICanvasObjectDescriptor,
  IVisualCreator,
  Rect,
  SvgVisual,
  TextRenderSupport
} from 'yfiles'
import { getMax, SCALED_MAX_X, SCALED_MAX_Y } from './scale-data.js'

/**
 * Adds a visual for the horizontal and vertical axes to the background group of the given graph
 * component.
 * @param {!GraphComponent} graphComponent
 * @param {!Array.<Waypoint>} trail
 */
export function drawAxis(graphComponent, trail) {
  const axisGroup = graphComponent.contentGroup.addGroup()
  axisGroup.toBack()
  axisGroup.addChild(new AxisVisual(trail), ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE)
}

/**
 * Determines how much the axis should extend beyond its first and last value ticks.
 */
const AXIS_EXTEND = 20

/**
 * The size of a value tick in an axis.
 */
const TICK_LENGTH = 3

/**
 * The desired maximum value for the horizontal axis.
 */
const X_AXIS_MAX = 55000

/**
 * The desired maximum value for the vertical axis.
 */
const Y_AXIS_MAX = 600

/**
 * The desired tick scale for the horizontal axis.
 */
const X_AXIS_SCALE = 5

/**
 * The desired tick scale for the vertical axis.
 */
const Y_AXIS_SCALE = 50

/**
 * The desired unit for the horizontal axis.
 */
const X_AXIS_UNIT = 1000

/**
 * The desired unit for the vertical axis.
 */
const Y_AXIS_UNIT = 1

/**
 * The desired label for the horizontal axis.
 */
const X_AXIS_LABEL = 'km'

/**
 * The desired label for the vertical axis.
 */
const Y_AXIS_LABEL = 'm'

/**
 * The desired font for the axes.
 */
const AXIS_FONT = new Font({
  fontFamily: 'Roboto,sans-serif',
  fontSize: 14
})

/**
 * Creates the visualization for the axes, draws the corresponding ticks, and their labels.
 */
class AxisVisual extends BaseClass(IVisualCreator, IBoundsProvider) {
  /**
   * @param {!Array.<Waypoint>} trail
   */
  constructor(trail) {
    super()
    this.trail = trail
  }

  /**
   * Creates the two axes, draws the corresponding ticks, and their labels.
   * @param {!IRenderContext} context
   * @returns {!Visual}
   */
  createVisual(context) {
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const { maxX, maxY } = getMax(this.trail)
    const horizontalAxisLength = (X_AXIS_MAX * SCALED_MAX_X) / maxX
    const verticalAxisLength = (Y_AXIS_MAX * SCALED_MAX_Y) / maxY

    this.addLine(-AXIS_EXTEND, horizontalAxisLength + 2 * AXIS_EXTEND, 0, 0, container)
    this.addLine(0, 0, AXIS_EXTEND, -verticalAxisLength - AXIS_EXTEND, container)

    this.drawTicksOnHorizontalAxis(horizontalAxisLength, container)
    this.drawTicksOnVerticalAxis(verticalAxisLength, container)

    return new SvgVisual(container)
  }

  /**
   * Draws the horizontal axis ticks and their labels.
   * @param {number} axisLength
   * @param {!SVGGElement} container
   */
  drawTicksOnHorizontalAxis(axisLength, container) {
    const tickNumber = this.getTickNumber(X_AXIS_MAX, X_AXIS_UNIT, X_AXIS_SCALE)
    for (let i = 0; i <= tickNumber; i++) {
      // find the position of the tick and draw it with its label
      const tickPos = i * (axisLength / tickNumber)
      this.addLine(tickPos, tickPos, -TICK_LENGTH, TICK_LENGTH, container)
      if (i !== 0) {
        this.addTickLabel(String(X_AXIS_SCALE * i), tickPos, -TICK_LENGTH, true, container)
      }
    }

    // draw the last tick of the axis and add a label with the axis unit
    this.addLine(
      axisLength + 2 * AXIS_EXTEND,
      axisLength + 2 * AXIS_EXTEND,
      -TICK_LENGTH,
      TICK_LENGTH,
      container
    )
    this.addLabel(`(${X_AXIS_LABEL})`, axisLength + 3.5 * AXIS_EXTEND, 0, container)
  }

  /**
   * Draws the vertical axis ticks and their labels.
   * @param {number} axisLength
   * @param {!SVGGElement} container
   */
  drawTicksOnVerticalAxis(axisLength, container) {
    const tickNumber = this.getTickNumber(Y_AXIS_MAX, Y_AXIS_UNIT, Y_AXIS_SCALE)
    for (let i = 0; i <= tickNumber; i++) {
      // find the position of the tick and draw it with its label
      const tickPos = i * (axisLength / tickNumber)
      this.addLine(-TICK_LENGTH, TICK_LENGTH, -tickPos, -tickPos, container)
      if (i !== 0) {
        this.addTickLabel(String(Y_AXIS_SCALE * i), -TICK_LENGTH, -tickPos, false, container)
      }
    }

    // draw the last tick of the axis and add a label with the axis unit
    this.addLine(
      -TICK_LENGTH,
      TICK_LENGTH,
      -axisLength - AXIS_EXTEND,
      -axisLength - AXIS_EXTEND,
      container
    )
    this.addLabel(`(${Y_AXIS_LABEL})`, -AXIS_EXTEND, -axisLength - 2 * AXIS_EXTEND, container)
  }

  /**
   * Returns the number of necessary ticks based on the length of the given axis, its unit, and scale.
   * @param {number} axisLength
   * @param {number} unit
   * @param {number} scale
   * @returns {number}
   */
  getTickNumber(axisLength, unit, scale) {
    const lastTick = axisLength / unit
    return lastTick / scale
  }

  /**
   * Adds a line element for the given coordinates.
   * @param {number} x1
   * @param {number} x2
   * @param {number} y1
   * @param {number} y2
   * @param {!SVGGElement} container
   */
  addLine(x1, x2, y1, y2, container) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.x1.baseVal.value = x1
    line.x2.baseVal.value = x2
    line.y1.baseVal.value = y1
    line.y2.baseVal.value = y2
    line.setAttribute('stroke', 'black')
    line.setAttribute('stroke-width', '1')
    container.appendChild(line)
  }

  /**
   * Adds a tick label at the given location.
   * @param {!string} labelText
   * @param {number} x
   * @param {number} y
   * @param {boolean} horizontalAxis
   * @param {!SVGGElement} container
   */
  addTickLabel(labelText, x, y, horizontalAxis, container) {
    const textSize = TextRenderSupport.measureText(labelText, AXIS_FONT)
    this.addLabel(
      labelText,
      x - (horizontalAxis ? 0 : textSize.width - 5),
      y + (horizontalAxis ? textSize.height + 5 : 0),
      container
    )
  }

  /**
   * Adds a text element at the given location.
   * @param {!string} textContent
   * @param {number} x
   * @param {number} y
   * @param {!SVGGElement} container
   */
  addLabel(textContent, x, y, container) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.textContent = textContent
    text.setAttribute('x', String(x))
    text.setAttribute('y', String(y))
    const font = AXIS_FONT
    text.setAttribute('font-family', `${font.fontFamily}`)
    text.setAttribute('font-size', `${font.fontSize}`)
    text.setAttribute('fill', 'black')
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('dominant-baseline', 'middle')
    container.appendChild(text)
  }

  /**
   * Delegates to {@link createVisual}.
   * @param {!IRenderContext} context
   * @param {!Visual} oldVisual
   * @returns {!Visual}
   */
  updateVisual(context, oldVisual) {
    return this.createVisual(context)
  }

  /**
   * Returns the bounds of this visual so that the size of the axis is also considered
   * when fitGraphBounds is called.
   * The bounds are
   * @param {!ICanvasContext} context
   * @returns {!Rect}
   */
  getBounds(context) {
    const graphComponent = context.canvasComponent

    // calculate the bounding box that contains all nodes
    const xValues = graphComponent.graph.nodes.map((node) => node.layout.x)
    const yValues = graphComponent.graph.nodes.map((node) => node.layout.y)

    const minX = Math.min(...xValues)
    const minY = Math.min(...yValues)
    const maxX = Math.max(...xValues)
    const maxY = Math.max(...yValues)

    return new Rect(
      minX,
      minY,
      maxX - minX + 150, // add some offset to fit the axis' labels (approximately)
      maxY - minY + 300 // add some offset to fit the axis' labels (approximately)
    )
  }
}
