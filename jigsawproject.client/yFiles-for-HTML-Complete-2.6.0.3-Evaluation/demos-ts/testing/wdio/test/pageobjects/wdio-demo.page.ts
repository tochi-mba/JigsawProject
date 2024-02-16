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
import Page from './page.js'
import type { CanvasComponent, GraphComponent } from 'yfiles'

// provide types for the global yFiles object
declare const yfiles: {
  CanvasComponent: typeof CanvasComponent
}

class WdioDemoPage extends Page {
  get zoomInButton() {
    return $("button[data-command='INCREASE_ZOOM']")
  }

  get graphComponentElement() {
    return $('#graphComponent')
  }

  get nodeCount() {
    return browser.execute(
      async () =>
        (
          yfiles.CanvasComponent.getComponent(
            document.getElementById('graphComponent')
          ) as GraphComponent
        ).graph.nodes.size
    )
  }

  async nodeCountAt(location) {
    return browser.execute((location) => {
      const graphComponent = yfiles.CanvasComponent.getComponent(
        document.getElementById('graphComponent')
      )
      const worldLocation = graphComponent.toWorldFromPage(location)
      return graphComponent.graph.nodes.filter((node) => node.layout.contains(worldLocation)).size
    }, location)
  }

  async bendCountAt(location) {
    return browser.execute(async (location) => {
      const graphComponent = yfiles.CanvasComponent.getComponent(
        document.getElementById('graphComponent')
      ) as GraphComponent
      const worldLocation = graphComponent.toWorldFromPage(location)

      return graphComponent.graph.bends.filter((bend) =>
        worldLocation.equalsEps(bend.location.toPoint(), 2)
      ).size
    }, location)
  }

  get edgeCount() {
    return browser.execute(
      async () =>
        (
          yfiles.CanvasComponent.getComponent(
            document.getElementById('graphComponent')
          ) as GraphComponent
        ).graph.edges.size
    )
  }

  get zoom() {
    return browser.execute(
      async () =>
        (
          yfiles.CanvasComponent.getComponent(
            document.getElementById('graphComponent')
          ) as GraphComponent
        ).zoom
    )
  }

  public open() {
    return super.open('/demos-ts/testing/wdio/index.html')
  }
}

export default new WdioDemoPage()
