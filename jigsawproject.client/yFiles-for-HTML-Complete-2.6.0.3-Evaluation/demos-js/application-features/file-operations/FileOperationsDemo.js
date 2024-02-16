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
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLIOHandler,
  License
} from 'yfiles'

import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import { downloadFile, getFileExtension, openFile } from 'demo-utils/file-support'
import { openInWindow } from 'demo-utils/open-in-window'
import { openStorageItem, saveStorageItem } from './storage-support.js'
import { readGraphML, writeGraphML } from './graphml-support.js'
import { readJSON, writeJSON } from './json-support.js'
import sampleData from './file-operations-sample.json?raw'

const storageKey = 'graph-file-operations-demo.graphml'

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  /// Enable folding since users might load GraphML files with folder nodes
  const foldingManager = new FoldingManager()
  graphComponent.graph = foldingManager.createFoldingView().graph

  initDemoStyles(graphComponent.graph, { foldingEnabled: true })

  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  createSampleGraph(graphComponent)

  initializeUI(graphComponent)
}

/**
 * Creates the sample graph.
 * @param {!GraphComponent} graphComponent
 */
function createSampleGraph(graphComponent) {
  readJSON(graphComponent, sampleData)

  graphComponent.fitGraphBounds()
}

/**
 * Adds event listeners to the demo's input elements.
 * @param {!GraphComponent} graphComponent
 */
function initializeUI(graphComponent) {
  document.querySelector('#open-file').addEventListener('click', async () => {
    try {
      const { content, filename } = await openFile()
      const fileExtension = getFileExtension(filename) ?? ''
      switch (fileExtension.toLowerCase()) {
        case 'graphml':
          await readGraphML(graphComponent, content)
          return
        case 'json':
          readJSON(graphComponent, content)
          return
        default:
          alert(`This demo cannot open files of type ${fileExtension}.`)
      }
    } catch (err) {
      alert(err)
    }
  })

  const getSaveFormat = () =>
    document.querySelector('#file-format-select').selectedOptions.item(0)?.value ?? 'json'

  document.querySelector('#download-button').addEventListener('click', async () => {
    const saveFormat = getSaveFormat()
    const text =
      saveFormat === 'graphml' ? await writeGraphML(graphComponent) : writeJSON(graphComponent)
    try {
      downloadFile(text, `file-operations-graph.${saveFormat}`)
    } catch (err) {
      alert(err)
    }
  })

  document.querySelector('#show-in-window-button').addEventListener('click', async () => {
    const saveFormat = getSaveFormat()
    const text =
      saveFormat === 'graphml' ? await writeGraphML(graphComponent) : writeJSON(graphComponent)
    openInWindow(`<pre>${text.replaceAll('<', '&lt;')}</pre>`, `File content (${saveFormat})`)
  })

  document.querySelector('#open-storage-button').addEventListener('click', async () => {
    try {
      const graphMLText = openStorageItem(storageKey)
      await readGraphML(graphComponent, graphMLText)
    } catch (err) {
      alert(err)
    }
  })

  document.querySelector('#save-storage-button').addEventListener('click', async () => {
    try {
      const result = await new GraphMLIOHandler().write(graphComponent.graph)
      await saveStorageItem(storageKey, result)
      document.querySelector('#open-storage-button').disabled = false
    } catch (err) {
      alert(err)
    }
  })
}

void run().then(finishLoading)
