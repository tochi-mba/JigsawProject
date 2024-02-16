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
import * as CodeMirror from 'codemirror'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/search/search'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/json-lint'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/lint/lint.css'

import {
  GraphBuilder,
  GraphComponent,
  GraphMLSupport,
  GraphViewerInputMode,
  IArrow,
  IGraph,
  License,
  PolylineEdgeStyle,
  Rect,
  Size,
  StorageLocation,
  StringTemplateNodeStyle,
  TemplateNodeStyle
} from 'yfiles'

import SampleData from './resources/SampleData.js'

import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import { applyDemoTheme } from 'demo-resources/demo-styles'

let templateEditor

let tagEditor

/** @type {GraphMLSupport} */
let graphMLSupport

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  graphComponent.inputMode = new GraphViewerInputMode()

  initializeEditors(graphComponent)
  initializeStyles(graphComponent.graph)
  initializeIO(graphComponent)
  initializeConverters()

  resetSampleGraph(graphComponent)

  initializeUI(graphComponent)
}

/**
 * Initializes the template and tag editors and registers selection listeners that update the
 * editors on selection changes.
 * @param {!GraphComponent} graphComponent
 */
function initializeEditors(graphComponent) {
  templateEditor = CodeMirror.fromTextArea(document.querySelector(`#template-text-area`), {
    lineNumbers: true,
    mode: 'application/xml',
    gutters: ['CodeMirror-lint-markers'],
    lint: true
  })
  tagEditor = CodeMirror.fromTextArea(document.querySelector(`#tag-text-area`), {
    lineNumbers: true,
    mode: 'application/json',
    gutters: ['CodeMirror-lint-markers'],
    lint: true
  })

  // disable standard selection and focus visualization
  graphComponent.selectionIndicatorManager.enabled = false
  graphComponent.focusIndicatorManager.enabled = false

  graphComponent.selection.addItemSelectionChangedListener((graphComponent) => {
    const selectedNode = graphComponent.selectedNodes.at(0)
    if (selectedNode) {
      if (selectedNode.style instanceof StringTemplateNodeStyle) {
        templateEditor.setOption('readOnly', false)
        templateEditor.setValue(selectedNode.style.svgContent || '')
      } else {
        templateEditor.setOption('readOnly', true)
        templateEditor.setValue('Style is not an instance of StringTemplateNodeStyle.')
      }
      tagEditor.setOption('readOnly', false)
      tagEditor.setValue(selectedNode.tag ? JSON.stringify(selectedNode.tag, null, 2) : '{}')
      document.querySelector(`#apply-template-button`).disabled = false
      document.querySelector(`#apply-tag-button`).disabled = false
    } else {
      templateEditor.setOption('readOnly', 'nocursor')
      tagEditor.setOption('readOnly', 'nocursor')
      templateEditor.setValue('Select a node to edit its template.')
      tagEditor.setValue('Select a node to edit its tag.')
      document.querySelector(`#apply-template-button`).disabled = true
      document.querySelector(`#apply-tag-button`).disabled = true
    }
  })
}

/**
 * Initializes the default styles for the graph. By default org-chart nodes are used.
 * @param {!IGraph} graph
 */
function initializeStyles(graph) {
  graph.nodeDefaults.style = new StringTemplateNodeStyle(`<g>
  <rect fill="#C0C0C0" width="{TemplateBinding width}" height="{TemplateBinding height}" x="2" y="2"/>
  <rect fill="url('#bottomGradient')" stroke="#C0C0C0" width="{TemplateBinding width}" height="{TemplateBinding height}"/>
  <rect width="{TemplateBinding width}" height="2" fill="{Binding status, Converter=demoConverters.statusColorConverter}"/>
  <use xlink:href="{Binding icon, Converter=demoConverters.addHashConverter}" transform="scale(0.85) translate(15 10)"/>
  <use xlink:href="{Binding status, Converter=demoConverters.addHashConverter}"/>
  <use xlink:href="{Binding status, Converter=demoConverters.addHashConverter, Parameter=_icon}" transform="translate(26 84)"/>
  <g style="font-family: Roboto,sans-serif; fill: #444">
    <text transform="translate(90 25)" style="font-size: 16px; fill: #336699" data-content="{Binding name}"/>
    <text transform="translate(90 45)" style="font-size: 9px; text-transform: uppercase" data-content="{Binding position}"/>
    <text transform="translate(90 72)" data-content="{Binding email}"/>
    <text transform="translate(90 88)" data-content="{Binding phone}"/>
    <text transform="translate(170 88)" data-content="{Binding fax}"/>
  </g>
   <rect fill='transparent'
      stroke="{TemplateBinding itemSelected, Converter=demoConverters.selectedStrokeConverter}"
      stroke-width="3"
      x="1.5"
      y="1.5"
      width="{TemplateBinding width, Converter=demoConverters.addConverter, Parameter=-3}"
      height="{TemplateBinding height, Converter=demoConverters.addConverter, Parameter=-3}"
      />
  <defs>
    <linearGradient id="bottomGradient" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="{Binding status, Converter=demoConverters.statusColorConverter}" stop-opacity="1"/>
      <stop offset="5%" stop-color="white" stop-opacity="1" />
    </linearGradient>
  </defs>
</g>`)
  graph.nodeDefaults.size = new Size(290, 100)
  graph.nodeDefaults.shareStyleInstance = false

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px rgb(170, 170, 170)',
    targetArrow: IArrow.NONE
  })
}

/**
 * Provides support for opening and saving graphs from and to GraphML.
 * @param {!GraphComponent} graphComponent
 */
function initializeIO(graphComponent) {
  graphMLSupport = new GraphMLSupport({
    graphComponent,
    storageLocation: StorageLocation.FILE_SYSTEM
  })
}

/**
 * Initializes the converters for the bindings of the template node styles.
 */
function initializeConverters() {
  const colors = {
    present: '#76b041',
    busy: '#ab2346',
    travel: '#a367dc',
    unavailable: '#c1c1c1'
  }

  TemplateNodeStyle.CONVERTERS.demoConverters = {
    // converter function for the background color of nodes
    statusColorConverter: (value) => colors[value] || 'white',

    // converter function for the border color nodes
    selectedStrokeConverter: (value) => {
      if (typeof value === 'boolean') {
        return value ? '#ff6c00' : 'rgba(0,0,0,0)'
      }
      return '#FFF'
    },

    // converter function that adds a hash to a given string and - if present - appends the parameter to it
    addHashConverter: (value, parameter) => {
      if (typeof value === 'string') {
        if (typeof parameter === 'string') {
          return `#${value}${parameter}`
        }
        return `#${value}`
      }
      return value
    },

    // converter function that adds the numbers given as value and parameter
    addConverter: (value, parameter) => {
      if (typeof parameter === 'string') {
        return String(Number(value) + Number(parameter))
      }
      return value
    }
  }
}

/**
 * Creates a sample graph for this demo.
 * @param {!IGraph} graph
 */
function createSampleGraph(graph) {
  const defaultNodeSize = graph.nodeDefaults.size
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: SampleData.nodes,
    id: 'id',
    layout: (data) =>
      new Rect(data.layout.x, data.layout.y, defaultNodeSize.width, defaultNodeSize.height)
  })
  builder.createEdgesSource({
    data: SampleData.edges,
    sourceId: 'src',
    targetId: 'tgt',
    bends: 'bends'
  })

  builder.buildGraph()
}

/**
 * Resets the graph in the given graph view to the demo's sample graph, centers the graph in
 * the visible area, and selects the graph's last node.
 * @param {!GraphComponent} graphComponent
 */
function resetSampleGraph(graphComponent) {
  const graph = graphComponent.graph
  graph.clear()

  createSampleGraph(graph)

  graphComponent.selection.setSelected(graph.nodes.last(), true)

  graphComponent.fitGraphBounds(30)
}

/**
 * Replaces the styles of the currently selected nodes with new instances that use the template
 * from the template editor.
 * @param {!GraphComponent} graphComponent
 */
function applyTemplate(graphComponent) {
  const selectedNodes = graphComponent.selection.selectedNodes
  if (selectedNodes.size === 0) {
    // if there are no selected nodes, there is no need to do anything
    return
  }

  const templateText = templateEditor.getValue()
  try {
    const style = new StringTemplateNodeStyle(templateText)
    // check if style is valid
    style.renderer
      .getVisualCreator(selectedNodes.first(), style)
      .createVisual(graphComponent.createRenderContext())

    for (const node of selectedNodes) {
      graphComponent.graph.setStyle(node, style)
    }

    document.querySelector(`#template-text-area-error`).classList.remove('open-error')
  } catch (err) {
    const errorArea = document.querySelector(`#template-text-area-error`)
    const errorString = err.toString().replace(templateText, '...template...')
    errorArea.setAttribute('title', errorString)
    errorArea.classList.add('open-error')
  }
}

/**
 * Replaces the tags of the currently selected nodes with new instances that correspond to the
 * data in the tag editor.
 * @param {!GraphComponent} graphComponent
 */
function applyTag(graphComponent) {
  const selectedNodes = graphComponent.selection.selectedNodes
  if (selectedNodes.size === 0) {
    // if there are no selected nodes, there is no need to do anything
    return
  }

  const tagText = tagEditor.getValue()
  try {
    const tag = JSON.parse(tagText)

    for (const node of selectedNodes) {
      node.tag = tag
    }

    document.querySelector(`#tag-text-area-error`).classList.remove('open-error')
  } catch (err) {
    const errorArea = document.querySelector(`#tag-text-area-error`)
    errorArea.setAttribute('title', err.toString())
    errorArea.classList.add('open-error')
  }

  // Unlike replacing a node's style, replacing a node's tag does not automatically repaint
  // the graph view. Thus a repaint needs to be triggered manually here.
  graphComponent.invalidate()
}

/**
 * Binds actions to the demo's UI controls.
 * @param {!GraphComponent} graphComponent
 */
function initializeUI(graphComponent) {
  document
    .querySelector('#apply-template-button')
    .addEventListener('click', () => applyTemplate(graphComponent))

  document
    .querySelector('#apply-tag-button')
    .addEventListener('click', () => applyTag(graphComponent))

  document
    .querySelector('#reload')
    .addEventListener('click', () => resetSampleGraph(graphComponent))
}

run().then(finishLoading)
