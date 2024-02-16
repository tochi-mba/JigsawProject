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
import { BaseClass, GeneralPath, ICanvasObjectDescriptor, IVisualCreator, SvgVisual } from 'yfiles'

/**
 * Adds a trekking tour visual to the background group of the given graph component.
 * @param {!GraphComponent} graphComponent
 * @param {!Array.<Point>} scaledTrail
 */
export function drawTrekkingTrail(graphComponent, scaledTrail) {
  graphComponent.backgroundGroup.addChild(
    new TrailVisual(scaledTrail),
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )
}

/**
 * Creates the trail based on a given set of points.
 */
class TrailVisual extends BaseClass(IVisualCreator) {
  /**
   * @param {!Array.<Point>} trailPoints
   */
  constructor(trailPoints) {
    super()
    this.trailPoints = trailPoints
  }

  /**
   * Creates a path that represents the trail based on the given set of points.
   * @param {!IRenderContext} context
   * @returns {!SvgVisual}
   */
  createVisual(context) {
    const path = this.getTrailPath()

    // creates a background path that will be used to color the background of the trail
    const backgroundPath = this.getTrailBackgroundPath(path).createSvgPath()
    backgroundPath.setAttribute('stroke', 'none')
    backgroundPath.setAttribute('fill', '#c0e1e9')

    // creates the actual trail path
    const svgPath = path.createSvgPath()
    svgPath.setAttribute('stroke', '#0b7189')
    svgPath.setAttribute('stroke-width', '1.5')
    svgPath.setAttribute('fill', 'none')

    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    container.appendChild(backgroundPath)
    container.appendChild(svgPath)
    return new SvgVisual(container)
  }

  /**
   * Creates a background path that enlarges the given path with some points that define
   * the area formed by the trail and the horizontal and vertical axes.
   * @param {!GeneralPath} path
   * @returns {!GeneralPath}
   */
  getTrailBackgroundPath(path) {
    const backgroundPath = new GeneralPath()
    backgroundPath.moveTo(this.trailPoints[0].x, 0)
    backgroundPath.append(path, true)
    backgroundPath.lineTo(this.trailPoints[this.trailPoints.length - 1].x, 0)
    backgroundPath.close()
    return backgroundPath
  }

  /**
   * Returns a general path formed by the trail points.
   * @returns {!GeneralPath}
   */
  getTrailPath() {
    const generalPath = new GeneralPath()
    generalPath.moveTo(this.trailPoints[0].x, this.trailPoints[0].y)
    for (const point of this.trailPoints) {
      generalPath.lineTo(point.x, point.y)
    }
    return generalPath.createSmoothedPath(100)
  }

  /**
   * Delegates the call to the {@link createVisual} method.
   * @param {!IRenderContext} context
   * @param {!Visual} oldVisual
   * @returns {!Visual}
   */
  updateVisual(context, oldVisual) {
    return this.createVisual(context)
  }
}
