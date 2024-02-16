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
  ExteriorLabelModel,
  Font,
  GraphComponent,
  GraphViewerInputMode,
  ICanvasObjectDescriptor,
  License,
  MarkupLabelStyle,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeStyle,
  Size,
  TextWrapping,
  VoidNodeStyle
} from 'yfiles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import ImageVisualCreator from './ImageVisualCreator.js'
import { configureLayout } from './configure-layout.js'
import { NodeType } from './data-types.js'
import { pointsData } from './resources/points-data.js'
import { applyDemoTheme } from 'demo-resources/demo-styles'

const imageRect = new Rect(0, 0, 350, 477)

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // configure user interaction, disable selection and focus
  graphComponent.inputMode = new GraphViewerInputMode()

  // assign the default style and size for the points
  initializeDefaultStyles(graphComponent.graph)

  // read the points from the dataset and creates the associated label nodes
  initializeGraph(graphComponent.graph)

  // adds the image to be annotated to the demo's graph component
  addBackgroundImage(graphComponent)

  // configure and run OrganicLayout with constraints for aligning points and their associated
  // labels
  void runLayout(graphComponent)

  initializeUI(graphComponent)
}

/**
 * Creates the graph from the given dataset.
 * For each data item in the dataset, a point node and an associated label node are created.
 * @param {!IGraph} graph
 */
function initializeGraph(graph) {
  for (const data of pointsData) {
    // create the point node with the x,y coordinates given in the dataset and the default node size
    const point = graph.createNode({
      layout: new Rect(
        data.layout.x,
        data.layout.y,
        graph.nodeDefaults.size.width,
        graph.nodeDefaults.size.height
      ),
      tag: { ...data, type: NodeType.POINT }
    })

    // create the label node and define its tag based on the tag of the associated point
    const labelNode = graph.createNode({
      layout: point.layout,
      style: new VoidNodeStyle(),
      tag: { type: NodeType.LABEL }
    })

    // add the label to the new label node and use a MarkupLabelStyle to support HTML tags
    graph.addLabel({
      owner: labelNode,
      text: data.label,
      layoutParameter: ExteriorLabelModel.NORTH
    })

    // ... create an edge between the point and the label node
    graph.createEdge(point, labelNode)
  }
}

/**
 * Configures the default node size and style as well as the default style for the edges for this demo.
 * @param {!IGraph} graph
 */
function initializeDefaultStyles(graph) {
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'rectangle',
    fill: 'black'
  })
  graph.nodeDefaults.size = new Size(3, 3)
  graph.nodeDefaults.labels.style = getLabelStyle()
  graph.edgeDefaults.style = new PolylineEdgeStyle()
}

/**
 * Adds the image that shall be annotated to the background group of the given graph component.
 * @param {!GraphComponent} graphComponent
 */
function addBackgroundImage(graphComponent) {
  // create the image and display it
  // using ICanvasObjectDescriptor.DYNAMIC_DIRTY_INSTANCE without actually marking the corresponding
  // canvas object as dirty means the visual for the background image is created only once and
  // never updated/changed - which is fine for this demo, because the background image cannot change
  graphComponent.backgroundGroup.addChild(
    new ImageVisualCreator(imageRect),
    ICanvasObjectDescriptor.DYNAMIC_DIRTY_INSTANCE
  )
}

/**
 *  Configures and runs an OrganicLayout with the constraints for aligning points and their
 *  associated labels.
 * @param {!GraphComponent} graphComponent
 * @param {boolean} [animated=false]
 * @returns {!Promise}
 */
async function runLayout(graphComponent, animated = false) {
  const { layout, layoutData } = configureLayout(graphComponent.graph, imageRect)
  await graphComponent.morphLayout(layout, animated ? '0.2s' : '0s', layoutData)
}

/**
 * Binds the action to the toolbar slider.
 * @param {!GraphComponent} graphComponent
 */
function initializeUI(graphComponent) {
  const fontSizeSlider = document.querySelector('#font-size-slider')
  fontSizeSlider.addEventListener('change', async () => {
    const fontSize = parseInt(fontSizeSlider.value)
    document.querySelector('#font-size-label').textContent = fontSize.toString()
    const graph = graphComponent.graph

    graph.labels.forEach((label) => {
      const oldFont = label.style.font
      graph.setStyle(label, getLabelStyle(new Font({ fontSize, fontWeight: oldFont.fontWeight })))
    })

    await runLayout(graphComponent, true)
  })
}

/**
 * Returns a new MarkupLabelStyle with the given font.
 * @param {!Font} font
 * @returns {!MarkupLabelStyle}
 */
function getLabelStyle(font = new Font({ fontSize: 12 })) {
  return new MarkupLabelStyle({
    wrapping: TextWrapping.WORD_ELLIPSIS,
    maximumSize: [400, 100],
    insets: 4,
    font,
    backgroundStroke: '1px black',
    backgroundFill: 'white'
  })
}

void run().then(finishLoading)
