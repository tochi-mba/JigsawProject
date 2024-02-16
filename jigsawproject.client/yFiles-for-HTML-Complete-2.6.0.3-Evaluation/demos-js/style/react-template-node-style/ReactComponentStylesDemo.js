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
import { finishLoading } from 'demo-resources/demo-page'

import * as ReactDOM from 'react-dom'

import * as CodeMirror from 'codemirror'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/jsx/jsx.js'
import 'codemirror/addon/search/search'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/lint/lint'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/lint/lint.css'

import {
  ExteriorLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphMLSupport,
  GraphViewerInputMode,
  IArrow,
  License,
  PolylineEdgeStyle,
  Rect,
  Size,
  StorageLocation
} from 'yfiles'

import SampleData from './resources/sample.js'
import { fetchLicense } from 'demo-resources/fetch-license'
import { registerReactComponentNodeStyleSerialization } from './ReactComponentSvgNodeStyleMarkupExtension.js'
import {
  createReactComponentHtmlLabelStyleFromJSX,
  createReactComponentHtmlNodeStyleFromJSX,
  createReactComponentSvgLabelStyleFromJSX,
  createReactComponentSvgNodeStyleFromJSX,
  isReactComponentStyleEx
} from './jsx-compiler.js'
import { ReactComponentHtmlLabelStyle } from './ReactComponentHtmlLabelStyle.js'
import { ReactComponentHtmlNodeStyle } from './ReactComponentHtmlNodeStyle.js'
import { applyDemoTheme } from 'demo-resources/demo-styles'
import { ReactComponentSvgLabelStyle } from './ReactComponentSvgLabelStyle.js'
import { ReactComponentSvgNodeStyle } from './ReactComponentSvgNodeStyle.js'

/** @type {GraphComponent} */
let graphComponent

let jsxRenderFunctionTextArea

let tagTextArea

/** @type {GraphMLSupport} */
let graphMLSupport

const templateErrorArea = document.querySelector('#template-text-area-error')
const tagErrorArea = document.querySelector('#tag-text-area-error')
const applyTemplateButton = document.querySelector('#apply-template-button')
const htmlTemplateToggle = document.querySelector('#html-template')
const applyTagButton = document.querySelector('#apply-tag-button')

/**
 * Runs the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.inputMode = new GraphViewerInputMode({
    clickSelectableItems: GraphItemTypes.NODE | GraphItemTypes.LABEL,
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.LABEL
  })

  // initialize demo
  initializeTextAreas()
  initializeStyles()
  initializeIO()
  loadSampleGraph()
  initializeUI()
}

/**
 * Initializes text areas to use CodeMirror and to update when the selection in the graph has
 * changed.
 */
function initializeTextAreas() {
  jsxRenderFunctionTextArea = CodeMirror.fromTextArea(
    document.querySelector('#template-text-area'),
    {
      lineNumbers: true,
      mode: 'jsx',
      gutters: ['CodeMirror-lint-markers'],
      lint: true
    }
  )
  tagTextArea = CodeMirror.fromTextArea(document.querySelector('#tag-text-area'), {
    lineNumbers: true,
    mode: 'application/json',
    gutters: ['CodeMirror-lint-markers'],
    lint: true
  })

  // disable standard selection and focus visualization
  graphComponent.selectionIndicatorManager.enabled = false
  graphComponent.focusIndicatorManager.enabled = false

  graphComponent.selection.addItemSelectionChangedListener(() => {
    const selectedItem =
      graphComponent.selection.selectedNodes.at(0) ?? graphComponent.selection.selectedLabels.at(0)

    templateErrorArea.classList.remove('open-error')
    tagErrorArea.classList.remove('open-error')
    let jsx
    let tag
    if (selectedItem && isReactComponentStyleEx(selectedItem.style)) {
      jsx = selectedItem.style.jsx
      tag = selectedItem.tag
      htmlTemplateToggle.checked =
        selectedItem.style instanceof ReactComponentHtmlLabelStyle ||
        selectedItem.style instanceof ReactComponentHtmlNodeStyle
    }

    jsxRenderFunctionTextArea.setOption('readOnly', !jsx)
    jsxRenderFunctionTextArea.setValue(jsx ?? 'Style is not an instance with attached JSX sources.')
    applyTemplateButton.disabled = !jsx
    htmlTemplateToggle.disabled = !jsx

    tagTextArea.setOption('readOnly', false)
    tagTextArea.setValue(tag ? JSON.stringify(tag, null, 2) : '{}')
    applyTagButton.disabled = !selectedItem
  })
}

const defaultLabelSize = [150, 14]

/**
 * Initializes the default styles for the graph. By default org-chart nodes are used.
 */
function initializeStyles() {
  const graph = graphComponent.graph
  graph.nodeDefaults.style = createReactComponentSvgNodeStyleFromJSX(demoSvgNodeStyleJSXSources)
  graph.nodeDefaults.size = new Size(290, 100)
  graph.nodeDefaults.shareStyleInstance = false

  graph.nodeDefaults.labels.style = createReactComponentSvgLabelStyleFromJSX(
    demoSvgLabelStyleJSXSources,
    defaultLabelSize
  )

  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({ insets: 2 }).createParameter(
    'north'
  )

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px rgb(170, 170, 170)',
    targetArrow: IArrow.NONE
  })
}

/**
 * @param {!Event} event
 */
function toggleHtmlSvgTemplate(event) {
  const isHtml = event.target.checked
  if (
    graphComponent.selection.selectedNodes.some(
      (label) =>
        label.style instanceof ReactComponentSvgNodeStyle ||
        label.style instanceof ReactComponentHtmlNodeStyle
    )
  ) {
    jsxRenderFunctionTextArea.setValue(
      isHtml ? demoHtmlNodeStyleJSXSources : demoSvgNodeStyleJSXSources
    )
  } else if (
    graphComponent.selection.selectedLabels.some(
      (label) =>
        label.style instanceof ReactComponentSvgLabelStyle ||
        label.style instanceof ReactComponentHtmlLabelStyle
    )
  ) {
    jsxRenderFunctionTextArea.setValue(
      isHtml ? demoHtmlLabelStyleJSXSources : demoSvgLabelStyleJSXSources
    )
  } else {
    jsxRenderFunctionTextArea.setValue('Style is not an instance with attached JSX sources.')
  }
}

const demoSvgNodeStyleJSXSources = `({width, height, selected, detail, tag}) =>
(
  <>
    <rect fill="#C0C0C0" width={width} height={height} x="2" y="2"></rect>
    <rect fill="white" stroke="#C0C0C0" width={width} height={height}></rect>
    {
      {
        present: <rect width={width} height="2" fill="#55B757"></rect>,
        busy: <rect width={width} height="2" fill="#E7527C"></rect>,
        travel: <rect width={width} height="2" fill="#9945E9"></rect>,
        unavailable: <rect width={width} height="2" fill="#8D8F91"></rect>
      }[tag.status]
    }
    <rect
      fill="transparent"
      stroke={selected ? '#FF6C00' : 'transparent'}
      strokeWidth="3"
      width={width - 3}
      height={height - 3}
      x="1.5"
      y="1.5"
    ></rect>
    {
      {
        high: (
          <>
            <image
              href={'./resources/' + tag.icon + '.svg'}
              x="15"
              y="10"
              width="63.75"
              height="63.75"
            ></image>
            <image
              href={'./resources/' + tag.status + '_icon.svg'}
              x="25"
              y="80"
              height="15"
              width="60"
            ></image>
            <g style={{ fontFamily: 'Roboto,sans-serif', fill: '#444' }} width="185">
              <text transform="translate(90 25)" style={{ fontSize: '16px', fill: '#336699' }}>
                {tag.name}
              </text>
              <text
                transform="translate(90 45)"
                style={{ fontSize: '8px', textTransform: 'uppercase' }}
              >
                {tag.position}
              </text>
              <text transform="translate(90 72)">{tag.email}</text>
              <text transform="translate(90 88)">{tag.phone}</text>
              <text transform="translate(170 88)">{tag.fax}</text>
            </g>
          </>
        ),
        low: (
          <>
            <image
              href={'./resources/' + tag.icon + '.svg'}
              x="15"
              y="20"
              width="56.25"
              height="56.25"
            ></image>
            <g
              style={{ fontSize: '15px', fontFamily: 'Roboto,sans-serif', fill: '#444' }}
              width="185"
            >
              <text transform="translate(85 60)" style={{ fontSize: '26px', fill: '#336699' }}>
                {tag.name}
              </text>
            </g>
          </>
        )
      }[detail]
    }
  </>
)`

const demoHtmlNodeStyleJSXSources = `({selected, detail, tag}) =>
(
  <div style={
    {
      width:"100%",
      height:"100%",
      background:"white",
      boxShadow:"2px 3px 3px rgba(0,0,0,0.15)",
      border: "1px solid #C0C0C0"
    }
  }>
    <div style={
      {
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        padding: "0px 0 0 12px",
        border: selected ? "2px solid #FF6C00" : "2px solid transparent",
        borderTop: "2px solid " + (selected ? "#FF6C00" : {present:'#55b757', busy:'#e7527c',  travel:'#9945e9', unavailable:'#8d8f91'}[tag.status])
      }
    }>
      {
        {
          high: (
            <>
              <div style={{display: "flex",flexDirection: "column"}}>
                <img src={"./resources/" + tag.icon + ".svg"} width="63px" height="63px" alt="icon"/>
                <img src={"./resources/" + tag.status + "_icon.svg"} alt="status" style={{marginTop: "6px", marginLeft: "10px"}}/>
              </div>
              <div style={{padding: "0px 6px", fontFamily: "Roboto,sans-serif", color: "#444", lineHeight: "1.2" }}>
                <div style={{ fontSize: "16px", color: "#336699" }}>{tag.name}</div>
                <div style={{ fontSize: "8px", textTransform: "uppercase", margin: "8px 0" }}>{tag.position}</div>
                <div>{tag.email}</div>
                <span>{tag.phone}</span>
                <span style={{marginLeft: "1rem"}}>{tag.fax}</span>
              </div>
            </>
          ),
          low: (
            <>
              <img src={"./resources/" + tag.icon + ".svg"} width="63px" height="63px" alt="icon"/>
              <div style={{ fontSize: "26px", color: "#336699", paddingLeft: "10px" }}>{tag.name}</div>
            </>
          )
        }[detail]
      }
    </div>
  </div>
)
`

const demoSvgLabelStyleJSXSources = `({width, height, selected, text, tag}) =>
(
  <>
    <rect fill={selected?'#eee':'#fff'} fillOpacity="0.9" width={width} height={height} x="0" y="0" rx="8" ry="8" stroke="#444" strokeWidth="0.5"></rect>
    <SvgText fill="#222" x={4} width={width-8} height={height} fontSize="10" content={text}/>
  </>
)`

const demoHtmlLabelStyleJSXSources = `({selected, text, tag}) =>
(
  <div style={
    {
      width:'100%',
      height: '100%',
      padding: "0 5px",
      backgroundColor: selected ? '#eee' : '#fff',
      border: "1px solid #444",
      borderRadius: "100px",
      fontSize:10,
      opacity: .9
    }
  }>
    {text}
  </div>
)`

/**
 * Initializes GraphML writing and reading for files containing ReactComponentNodeStyle.
 */
function initializeIO() {
  const graphmlHandler = new GraphMLIOHandler()

  registerReactComponentNodeStyleSerialization(graphmlHandler)

  graphMLSupport = new GraphMLSupport({
    graphComponent,
    graphMLIOHandler: graphmlHandler,
    storageLocation: StorageLocation.FILE_SYSTEM
  })
}

/**
 * Loads the sample graph.
 */
function loadSampleGraph() {
  graphComponent.graph.clear()
  const defaultNodeSize = graphComponent.graph.nodeDefaults.size
  const graphBuilder = new GraphBuilder(graphComponent.graph)
  const nodesSource = graphBuilder.createNodesSource({
    data: SampleData.nodes,
    id: 'id',
    tag: (data) => {
      // for this demo, we don't want the layout and id information as part of the tag
      const { layout, id, ...rest } = data
      return rest
    },
    // This example uses hard-coded locations. If no predefined layout data is given, an automatic layout could have
    // been applied to the graph after buildGraph, which is a common use case. For example, see the Organization Chart Demo
    layout: (data) =>
      new Rect(data.layout.x, data.layout.y, defaultNodeSize.width, defaultNodeSize.height)
  })

  nodesSource.nodeCreator.createLabelBinding((dataItem) => dataItem.name)

  graphBuilder.createEdgesSource(SampleData.edges, 'src', 'tgt').edgeCreator.bendsProvider = (e) =>
    e.bends

  const graph = graphBuilder.buildGraph()
  graphComponent.fitGraphBounds(30)

  graphComponent.selection.setSelected(graph.nodes.last(), true)
}

/**
 * @param {!string} jsxSource
 * @param {boolean} svg
 */
function applyJSXtoSelectedNodes(jsxSource, svg) {
  const style = svg
    ? createReactComponentSvgNodeStyleFromJSX(jsxSource)
    : createReactComponentHtmlNodeStyleFromJSX(jsxSource)
  // check if style is a valid style
  style.renderer
    .getVisualCreator(graphComponent.selection.selectedNodes.first(), style)
    .createVisual(graphComponent.createRenderContext())

  // check whether there is an error in the style or template
  ReactDOM.flushSync(() => {})

  graphComponent.selection.selectedNodes.forEach((node) => {
    graphComponent.graph.setStyle(node, style)
  })
}

/**
 * @param {!string} jsxSource
 * @param {boolean} svg
 */
function applyJSXtoSelectedLabels(jsxSource, svg) {
  const style = svg
    ? createReactComponentSvgLabelStyleFromJSX(jsxSource, defaultLabelSize)
    : createReactComponentHtmlLabelStyleFromJSX(jsxSource, defaultLabelSize)

  // check if style is a valid style
  style.renderer
    .getVisualCreator(graphComponent.selection.selectedLabels.first(), style)
    .createVisual(graphComponent.createRenderContext())

  // check whether there is an error in the style or template
  ReactDOM.flushSync(() => {})

  graphComponent.selection.selectedLabels.forEach((label) => {
    graphComponent.graph.setStyle(label, style)
  })
}

/**
 * Wires up the UI. Buttons are linked with their according actions.
 */
function initializeUI() {
  const openButton = document.querySelector("button[data-command='OPEN']")
  openButton.setAttribute('data-command-registered', 'true')
  openButton.setAttribute('title', 'Open a GraphML file')
  openButton.addEventListener('click', async () => {
    try {
      await graphMLSupport.openFile(graphComponent.graph)
      graphComponent.fitGraphBounds()
    } catch (ignored) {
      alert(
        'The graph contains styles that are not supported by this demo. This demo works best when nodes have ReactComponentNodeStyles created by this demo.'
      )
      graphComponent.graph.clear()
    }
  })

  htmlTemplateToggle.addEventListener('change', toggleHtmlSvgTemplate)

  document.querySelector('#apply-template-button').addEventListener('click', () => {
    if (
      graphComponent.selection.selectedNodes.size === 0 &&
      graphComponent.selection.selectedLabels.size === 0
    ) {
      return
    }
    const svg = !htmlTemplateToggle.checked
    const jsxSource = jsxRenderFunctionTextArea.getValue()
    try {
      if (graphComponent.selection.selectedNodes.size > 0) {
        applyJSXtoSelectedNodes(jsxSource, svg)
      } else if (graphComponent.selection.selectedLabels.size > 0) {
        applyJSXtoSelectedLabels(jsxSource, svg)
      }
      templateErrorArea.classList.remove('open-error')
    } catch (err) {
      const errorString = err.toString().replace(jsxSource, '...template...')
      templateErrorArea.setAttribute('title', errorString)
      templateErrorArea.classList.add('open-error')
    }
  })

  document.querySelector('#apply-tag-button').addEventListener('click', () => {
    graphComponent.selection.selectedNodes.forEach((node) => {
      try {
        const tag = JSON.parse(tagTextArea.getValue())
        tagErrorArea.classList.remove('open-error')
        graphComponent.selection.forEach((item) => {
          item.tag = tag
        })
      } catch (err) {
        tagErrorArea.classList.add('open-error')
        tagErrorArea.setAttribute('title', err.toString())
      }
    })
    graphComponent.invalidate()
  })

  document.querySelector('#reload').addEventListener('click', loadSampleGraph)
}

run().then(finishLoading)
