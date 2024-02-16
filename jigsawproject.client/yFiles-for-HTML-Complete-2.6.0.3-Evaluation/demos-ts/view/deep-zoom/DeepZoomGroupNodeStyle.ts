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
  type GeneralPath,
  GraphComponent,
  type INode,
  type INodeStyle,
  type IRenderContext,
  Matrix,
  NodeStyleBase,
  type Point,
  Rect,
  ShapeNodeStyle,
  SvgExport,
  SvgVisual,
  type Visual
} from 'yfiles'

const CONTENT_RECT_MARGINS = 50
const MIN_NODE_SIZE = 5
const MAX_ZOOM_CHANGE_THRESHOLD = 3

/**
 * This group node style creates a visualization of its children if used in the context of folding.
 * The contents are scaled and rendered within the bounds of the node.
 */
export class DeepZoomGroupNodeStyle extends NodeStyleBase {
  /**
   * Creates a new group node style with the given backgroundStyle.
   */
  constructor(public backgroundStyle: INodeStyle = new ShapeNodeStyle()) {
    super()
  }

  /**
   * Creates a visual of the given node. The visual consists of the background of the node and, if
   * the node has been zoomed out, an image that shows the content of the node.
   */
  createVisual(renderContext: IRenderContext, node: INode): SvgVisual {
    const outerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const background = this.createBackgroundVisual(node, renderContext)
    outerGroup.appendChild(background)

    const innerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    SvgVisual.setTranslate(innerGroup, node.layout.x, node.layout.y)
    outerGroup.appendChild(innerGroup)

    const contents = this.createContentsVisual(renderContext, node)
    innerGroup.appendChild(contents)

    return new SvgVisual(outerGroup)
  }

  /**
   * Updates the current visual instead of creating a new one.
   */
  updateVisual(renderContext: IRenderContext, oldVisual: Visual, node: INode): SvgVisual {
    const outerGroup = (oldVisual as SvgVisual).svgElement

    const background = outerGroup.firstChild! as SVGElement
    const innerGroup = outerGroup.lastElementChild!
    const contents = innerGroup.firstElementChild! as SVGGElement

    const renderedZoom = DeepZoomGroupNodeStyle.readRenderCache<number>(contents, 'data-zoom')

    if (
      renderedZoom < renderContext.zoom / MAX_ZOOM_CHANGE_THRESHOLD ||
      renderedZoom > MAX_ZOOM_CHANGE_THRESHOLD * renderContext.zoom
    ) {
      return this.createVisual(renderContext, node)
    }

    SvgVisual.setTranslate(innerGroup, node.layout.x, node.layout.y)

    this.updateBackgroundVisual(node, renderContext, background)
    this.updateContentsVisual(contents, node)

    return oldVisual as SvgVisual
  }

  /**
   * Delegates intersection calculation to the {@link backgroundStyle}.
   * @param node The node that has to be tested for intersections.
   * @param inner The first point of the line that is inside the shape.
   * @param outer The second point of the line that is outside the shape.
   * @returns The coordinates of the intersection point, if an intersection was found.
   */
  protected getIntersection(node: INode, inner: Point, outer: Point): Point | null {
    return this.backgroundStyle.renderer
      .getShapeGeometry(node, this.backgroundStyle)
      .getIntersection(inner, outer)
  }

  /**
   * Delegates outline calculation to the {@link backgroundStyle}.
   * @returns The outline or null if no outline can be provided.
   */
  protected getOutline(node: INode): GeneralPath | null {
    return this.backgroundStyle.renderer.getShapeGeometry(node, this.backgroundStyle).getOutline()
  }

  private createBackgroundVisual(node: INode, renderContext: IRenderContext): SVGGElement {
    const backgroundVisual = this.backgroundStyle.renderer
      .getVisualCreator(node, this.backgroundStyle)
      .createVisual(renderContext) as SvgVisual

    const backgroundGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    this.setBackgroundOpacity(renderContext, backgroundGroup)
    DeepZoomGroupNodeStyle.writeRenderCache(
      backgroundGroup,
      'data-background-visual',
      backgroundVisual
    )
    backgroundGroup.appendChild(backgroundVisual.svgElement)
    return backgroundGroup
  }

  private createContentsVisual(renderContext: IRenderContext, node: INode): SVGGElement {
    const contentsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    DeepZoomGroupNodeStyle.writeRenderCache(contentsGroup, 'data-zoom', renderContext.zoom)

    // if the group node appears large enough, render the contained graph as static svg
    if (renderContext.zoom * Math.max(node.layout.width, node.layout.height) > MIN_NODE_SIZE) {
      const [contents, contentsBounds] = this.createScaledContentsVisualization(renderContext, node)

      // scale and translate the visual group to fit the displaying node
      const transform = DeepZoomGroupNodeStyle.computeTransform(node, contentsBounds)
      transform.applyTo(contentsGroup)

      // cache the bounds
      DeepZoomGroupNodeStyle.writeRenderCache(contentsGroup, 'data-contents-bounds', contentsBounds)

      contentsGroup.appendChild(contents)
    }

    return contentsGroup
  }

  /**
   * Creates a static visualization of the contents graph scaled to the container node size.
   */
  private createScaledContentsVisualization(
    renderContext: IRenderContext,
    containerNode: INode
  ): [SVGElement, Rect] {
    const graph = (renderContext.canvasComponent as GraphComponent).graph

    // create a copy of the direct children of this node by using a non-expanded folding view.
    const tempView = graph.foldingView!.manager.createFoldingView(
      graph.foldingView!.getMasterItem(containerNode),
      () => false
    )

    const tempGraphComponent = new GraphComponent()
    tempGraphComponent.graph = tempView.graph
    tempGraphComponent.updateContentRect({ margins: CONTENT_RECT_MARGINS })

    const allBounds = new Rect(
      0,
      0,
      tempGraphComponent.contentRect.width,
      tempGraphComponent.contentRect.height
    )

    // configure a rendering of the groups contents
    const svgExport = new SvgExport(tempGraphComponent.contentRect)

    // By default, the rendering has a zoom of one and the contained nodes are their 'true' sizes in world coordinates.
    // Thus, the image needs to be scaled down to the apparent size of the group node
    svgExport.zoom =
      renderContext.zoom *
      Math.max(
        0.00001,
        Math.min(
          containerNode.layout.width / allBounds.width,
          containerNode.layout.height / allBounds.height
        )
      )

    // actually create the svg element
    const svg = svgExport.exportSvg(tempGraphComponent) as SVGElement

    // clean up
    tempGraphComponent.cleanUp()
    tempView.dispose()

    return [svg, allBounds]
  }

  private updateContentsVisual(contents: SVGGElement, node: INode): void {
    const contentsBounds = DeepZoomGroupNodeStyle.readRenderCache<Rect | undefined>(
      contents,
      'data-contents-bounds'
    )
    if (contentsBounds) {
      const transform = DeepZoomGroupNodeStyle.computeTransform(node, contentsBounds)
      transform.applyTo(contents)
    }
  }

  private updateBackgroundVisual(
    node: INode,
    renderContext: IRenderContext,
    background: SVGElement
  ): void {
    this.backgroundStyle.renderer
      .getVisualCreator(node, this.backgroundStyle)
      .updateVisual(
        renderContext,
        DeepZoomGroupNodeStyle.readRenderCache<Visual>(background, 'data-background-visual')
      )

    this.setBackgroundOpacity(renderContext, background)
  }

  private setBackgroundOpacity(renderContext: IRenderContext, backgroundGroup: SVGElement): void {
    backgroundGroup.setAttribute('opacity', String(4 / renderContext.zoom - 0.02))
  }

  /**
   * Computes the transform for the rendering of the subgraph to fit the node that displays it.
   * @param containerNode The group node whose contents have to be scaled
   * @param contentsBounds The actual bounds of the group node
   * @returns The transformation matrix
   */
  private static computeTransform(containerNode: INode, contentsBounds: Rect): Matrix {
    const layout = containerNode.layout
    const width = layout.width
    const height = layout.height
    const scale = Math.min(width / contentsBounds.width, height / contentsBounds.height)
    return new Matrix(
      scale,
      0,
      0,
      scale,
      (width - contentsBounds.width * scale) * 0.5 - contentsBounds.x * scale,
      (height - contentsBounds.height * scale) * 0.5 - contentsBounds.y * scale
    )
  }

  private static writeRenderCache(element: unknown, key: string, data: unknown): void {
    // eslint-disable-next-line
    ;(element as any)[key] = data
  }

  private static readRenderCache<TCache>(element: unknown, key: string): TCache {
    // eslint-disable-next-line
    return (element as any)[key] as TCache
  }
}
