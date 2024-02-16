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
  IEdge,
  IGraph,
  IHandle,
  IInputModeContext,
  IPort,
  IPortCandidate,
  Point,
  PortRelocationHandle,
  PortRelocationHandleProvider,
  Visualization
} from 'yfiles'
import { FlowEdgeStyle } from './FlowEdgeStyle'
import { validatePortTag } from '../FlowNode/FlowNodePort'
import { getSmoothEdgeControlPoints } from './FlowEdge'

/**
 * A handle provider that provides port relocation handles that look the same as the handles
 * as during new edge creation.
 */
export class FlowPortRelocationHandleProvider extends PortRelocationHandleProvider {
  protected createPortRelocationHandle(
    graph: IGraph | null,
    edge: IEdge,
    sourcePort: boolean
  ): IHandle | null {
    if (!graph) {
      return null
    }
    const portRelocationHandle = new FlowPortRelocationHandle(graph, edge, sourcePort)
    portRelocationHandle.showHitPortOwnerCandidatesOnly = false
    portRelocationHandle.addExistingPort = false
    portRelocationHandle.visualization = Visualization.DUMMY
    return portRelocationHandle
  }
}

class FlowPortRelocationHandle extends PortRelocationHandle {
  private originalBendLocations: Array<Point> | null = null
  private fixedPort: IPort | null = null
  private lastClosestPortCandidate: IPortCandidate | null = null

  /**
   * Store the port candidate so that the edge can visually snap to it.
   */
  protected setClosestCandidate(portCandidate: IPortCandidate | null): void {
    super.setClosestCandidate(portCandidate)
    this.lastClosestPortCandidate = portCandidate
  }

  /**
   * To perform edge curve calculations later on, we need to identify which port
   * is the one that's not going to change as a result of the reconnection process.
   *
   * We also store the original bends of the edge, so they can be restored
   * if reconnection is canceled.
   */
  initializeDrag(context: IInputModeContext): void {
    super.initializeDrag(context)
    this.fixedPort = this.sourceEnd ? this.edge.targetPort : this.edge.sourcePort
    this.originalBendLocations = this.edge.bends.map(bend => bend.location.toPoint()).toArray()
    this.getGraph(context)?.setStyle(this.edge, new FlowEdgeStyle('edgeReconnection'))
    if (this.dummyEdge) {
      this.dummyEdge.style = new FlowEdgeStyle('edgeReconnection')
    }
  }

  /**
   * On each position change, apply new edge bends. The visual result should be exactly the same
   * as during creating a new edge.
   */
  handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    super.handleMove(context, originalLocation, newLocation)

    const { fixedPort, sourceEnd } = this
    const fromSide = validatePortTag(fixedPort?.tag) ? fixedPort?.tag.side : null

    const newVisualLocation = this.lastClosestPortCandidate?.port?.location ?? newLocation
    const fixedPortLocation = fixedPort?.location

    if (!fromSide || !fixedPortLocation) {
      return
    }

    const oppositeSide = { left: 'right', right: 'left' } as const

    const bends = getSmoothEdgeControlPoints({
      start: sourceEnd ? newVisualLocation : fixedPortLocation,
      end: sourceEnd ? fixedPortLocation : newVisualLocation,
      fromSide: sourceEnd ? oppositeSide[fromSide] : fromSide
    })

    this.getGraph(context)?.clearBends(this.edge)
    this.getGraph(context)?.addBends(this.edge, bends)
  }

  /**
   * Restore the original edge bends that were saved earlier.
   */
  cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    super.cancelDrag(context, originalLocation)
    this.getGraph(context)?.clearBends(this.edge)
    this.getGraph(context)?.addBends(this.edge, this.originalBendLocations!)
  }

  /**
   * Restore the standard, unmodified edge style.
   */
  dragFinished(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    super.dragFinished(context, originalLocation, newLocation)
    this.getGraph(context)?.setStyle(this.edge, new FlowEdgeStyle())
  }
}
