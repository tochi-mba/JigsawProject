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
  Exception,
  type IGraph,
  type IInputModeContext,
  type INode,
  type IPoint,
  IPositionHandler,
  Point
} from 'yfiles'

/**
 * Constrains the node movement only along the layer to which it belongs, i.e., the node can be moved
 * only along the y-axis.
 */
export function allowOnlyVerticalNodeMovement(graph: IGraph): void {
  // set a constrained handler that will allow the movement of the nodes only on the layer to which
  // they belong
  graph.decorator.nodeDecorator.positionHandlerDecorator.setImplementationWrapper(
    (node: INode | null, handler: IPositionHandler | null): ConstrainedPositionHandler => {
      return new ConstrainedPositionHandler(handler)
    }
  )
}

/**
 * A custom position handler which constrains the node movement long the layer to which it belongs,
 * i.e., the node can be moved only along the y-axis.
 * This implementation wraps the default position handler and delegates most of the work to it.
 */
class ConstrainedPositionHandler extends BaseClass(IPositionHandler) {
  private lastLocation = Point.ORIGIN

  constructor(private readonly handler: IPositionHandler | null) {
    super()
  }

  get location(): IPoint {
    if (this.handler) {
      return this.handler.location
    }
    throw new Exception('IPositionHandler === null')
  }

  /**
   * Called when the drag starts. It delegates the work to the default position handler and
   * additionally, updates the last location to be used for calculating the new drag position.
   */
  initializeDrag(context: IInputModeContext): void {
    if (this.handler === null) {
      return
    }
    this.handler.initializeDrag(context)
    this.lastLocation = this.handler.location.toPoint()
  }

  /**
   * It allows moving only along the y-axis, by keeping the original x-coordinate.
   */
  handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    if (this.handler === null) {
      return
    }
    // only move along the y-axis, keep the original x coordinate
    newLocation = new Point(originalLocation.x, newLocation.y)
    if (!newLocation.equalsEps(this.lastLocation, 0)) {
      // delegate to the wrapped handler for the actual move
      this.handler.handleMove(context, originalLocation, newLocation)
      // remember the location
      this.lastLocation = newLocation
    }
  }

  /**
   * Cancels the drag operation and delegates the work to the default position handler.
   */
  cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    this.handler?.cancelDrag(context, originalLocation)
  }

  /**
   * Called when the drag operation has finished and delegates the work to the default position handler.
   */
  dragFinished(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    this.handler?.dragFinished(context, originalLocation, newLocation)
  }
}
