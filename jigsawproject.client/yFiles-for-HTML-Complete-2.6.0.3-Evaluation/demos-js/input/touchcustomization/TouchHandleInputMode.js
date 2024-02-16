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
import { CanvasComponent, HandleInputMode, IHandle, Point } from 'yfiles'

/**
 * A customized HandleInputMode that considers the handle size during hit testing.
 */
export default class TouchHandleInputMode extends HandleInputMode {
  /**
   * Creates a new instance with the given handle radius.
   * @param {number} handleRadius The radius of the handles.
   */
  constructor(handleRadius) {
    super()
    this.handleRadius = handleRadius
  }

  /**
   * Overrides touch hit test to take handle size into account.
   * @param {!IHandle} handle The handle to check
   * @param {!Point} location The world coordinates to check.
   * @param {!Point} distance The distance of the handle to the touch location. In the default
   * implementation, this is a tuple representing the x- and y-distance of the handle to the
   * touch location.
   * @returns {boolean}
   */
  handleIsHitTouch(handle, location, distance) {
    return this.isHit(distance, true)
  }

  /**
   * Overrides hit test to take handle size into account.
   * @param {!IHandle} handle The handle to check
   * @param {!Point} location The view coordinates to check.
   * @param {!Point} distance The distance of the handle to the location. In the default
   * implementation, this is a tuple representing the x- and y-distance of the handle to the
   * location.
   * @returns {boolean}
   */
  handleIsHit(handle, location, distance) {
    return this.isHit(distance, false)
  }

  /**
   * @param {!Point} distance
   * @param {boolean} touch
   * @returns {boolean}
   */
  isHit(distance, touch) {
    const canvasComponent = this.inputModeContext.canvasComponent
    const extend = canvasComponent ? getHitTestRadius(canvasComponent, touch) : 0
    return distance.vectorLength <= extend + this.handleRadius
  }
}

/**
 * Gets the hit test or touch hit test radius for the given component.
 * @param {!CanvasComponent} canvasComponent
 * @param {boolean} touch
 * @returns {number}
 */
function getHitTestRadius(canvasComponent, touch) {
  return touch ? canvasComponent.hitTestRadiusTouch : canvasComponent.hitTestRadius
}