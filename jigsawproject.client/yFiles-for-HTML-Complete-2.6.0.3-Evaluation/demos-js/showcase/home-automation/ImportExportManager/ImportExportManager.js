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
import { showErrorDialog } from '../UI/showErrorDialog.js'
import { GraphData } from './GraphData.js'
import { GraphComponent } from 'yfiles'

/**
 * @param {!GraphComponent} graphComponent
 */
export function initializeJsonIo(graphComponent) {
  setupButtons(graphComponent)
}

/**
 * Retrieves the "Open" & "Save" buttons from the DOM and sets up event listeners.
 * @param {!GraphComponent} graphComponent
 */
function setupButtons(graphComponent) {
  const buttons = {
    open: document.querySelector('button[data-command="OPEN_JSON"]'),
    save: document.querySelector('button[data-command="SAVE_JSON"]')
  }
  if (!buttons.open || !buttons.save) {
    throw new Error('Could not retrieve command buttons from the DOM')
  }

  buttons.open.addEventListener('click', () => importGraphData(graphComponent))
  buttons.save.addEventListener('click', () => exportGraphData(graphComponent))
}

/**
 * Creates a new graph from graph data. If the dataset is not specified, the user
 * will be prompted to select a JSON file from their local filesystem.
 * @param {!GraphComponent} graphComponent
 * @param {!SerializableGraphData} [data]
 */
export async function importGraphData(graphComponent, data) {
  try {
    if (!data) {
      data = await importJsonData()
    }
    GraphData.fromJSONData(data).applyToGraph(graphComponent.graph)

    graphComponent.selection.clear()
    await graphComponent.fitGraphBounds({ animated: true })
  } catch (error) {
    showErrorDialog({
      title: 'Graph import error',
      message: error instanceof Error ? error.message : 'Could not load graph data.'
    })
    return
  }
}

/**
 * Handles the details of prompting file selection, reading the specified file,
 * and parsing its JSON contents.
 * @returns {!Promise.<SerializableGraphData>}
 */
function importJsonData() {
  return new Promise((resolve, reject) => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'
    fileInput.style.display = 'none'
    document.body.appendChild(fileInput)
    fileInput.click()

    function handleFileSelect(event) {
      const target = event.target
      target.removeEventListener('change', handleFileSelect)
      document.body.removeChild(fileInput)

      const file = target.files?.[0]
      if (!file) {
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const fileContent = event.target?.result
        if (typeof fileContent !== 'string') {
          throw new Error('Error reading file')
        }

        try {
          resolve(JSON.parse(fileContent))
        } catch (error) {
          if (error instanceof Error) {
            reject(error)
          } else {
            reject(new Error('Error parsing JSON file'))
          }
        }
      }
      reader.onerror = () => {
        reject(new Error('Error reading file'))
      }

      reader.readAsText(file)
    }

    fileInput.addEventListener('change', handleFileSelect)
  })
}

/**
 * @param {!GraphComponent} graphComponent
 */
function exportGraphData(graphComponent) {
  const dataString = GraphData.fromGraph(graphComponent.graph).toJSON()
  const blob = new Blob([dataString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'data.json'
  a.click()
  URL.revokeObjectURL(url)
}
