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
  Arrow,
  Class,
  DefaultLabelStyle,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  IGraph,
  IModelItem,
  INode,
  InteriorStretchLabelModel,
  InteriorStretchLabelModelPosition,
  LayoutExecutor,
  License,
  OrganicLayout,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  PolylineEdgeStyle,
  Size
} from 'yfiles'
import { graphQLQuery } from './GraphQLQuery.js'
import { SocialNetworkGraphBuilder } from './SocialNetworkGraphBuilder.js'
import { SocialNetworkNodeStyle } from './SocialNetworkNodeStyle.js'
import PropertiesPanel from './PropertiesPanel.js'
import { copyWithFriends } from './Person.js'

import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

Class.ensure(LayoutExecutor)

/** @type {GraphComponent} */
let graphComponent

/** @type {SocialNetworkGraphBuilder} */
let graphBuilder

/** @type {PropertiesPanel} */
let propertiesPanel

/**
 * GraphQL query to retrieve all persons in the data set
 */
const queryAllPersons = `{
  persons {
    id
    name
    icon
    friendsCount
    friends {
      id
    }
  }
}`

/**
 * GraphQL query to retrieve the one person whose ID matches the given ID
 */
const querySinglePerson = `query loadSinglePerson ($id: ID!) {
  person(id: $id) {
    id
    name
    icon
    friendsCount
  }
}`

/**
 * GraphQL query to retrieve all friends of the person with the given ID
 */
const queryFriends = `query loadFriends ($id: ID!) {
  person(id: $id) {
    friends {
      id
      name
      icon
      friendsCount
    }
  }
}`

/**
 * Runs the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  configureGraph(graphComponent.graph)

  graphBuilder = new SocialNetworkGraphBuilder(graphComponent.graph)

  configureInteraction(graphComponent)
  createPropertiesPanel(graphComponent)
  initializeUI()

  await loadSinglePerson(1)
  const initialNode = graphComponent.graph.nodes.at(0)
  if (initialNode) {
    await loadFriends(initialNode)
  }
}

/**
 * Initializes the styles for the graph nodes, edges, labels.
 * @param {!IGraph} graph
 */
function configureGraph(graph) {
  // nodes
  graph.nodeDefaults.style = new SocialNetworkNodeStyle()
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.size = new Size(75, 75)

  // labels
  const labelModel = new InteriorStretchLabelModel({ insets: [0, 0, 5, 0] })
  graph.nodeDefaults.labels.layoutParameter = labelModel.createParameter(
    InteriorStretchLabelModelPosition.SOUTH
  )
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'center',
    backgroundFill: 'rgba(255,255,255,0.66)'
  })

  // edges
  const circleArrow = new Arrow({
    scale: 2,
    type: 'circle',
    fill: 'lightgray'
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '5px lightgray',
    targetArrow: circleArrow,
    sourceArrow: circleArrow
  })
}

/**
 * Initialize and configure the input mode. Only allow viewing of the data and moving nodes around.
 * @param {!GraphComponent} graphComponent
 */
function configureInteraction(graphComponent) {
  const mode = new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NODE,
    focusableItems: GraphItemTypes.NODE,
    selectableItems: GraphItemTypes.NONE
  })
  mode.marqueeSelectionInputMode.enabled = false

  mode.addItemDoubleClickedListener(async (_, evt) => {
    await loadFriends(evt.item)

    // update the properties panel, since new friends may be visible now
    propertiesPanel.showProperties(graphComponent.currentItem)
  })

  graphComponent.inputMode = mode
}

/**
 * Create the properties panel that displays the information about the current person.
 * @param {!GraphComponent} graphComponent
 */
function createPropertiesPanel(graphComponent) {
  const propertiesPanelRoot = document.getElementById('propertiesView')
  propertiesPanel = new PropertiesPanel(propertiesPanelRoot)

  graphComponent.addCurrentItemChangedListener(() => {
    propertiesPanel.showProperties(graphComponent.currentItem)
  })
}

/**
 * Moves incremental nodes between their neighbors before expanding for a smooth animation.
 *
 * @param {!Iterable.<INode>} newNodes
 */
function prepareSmoothExpandLayoutAnimation(newNodes) {
  const graph = graphComponent.graph

  // mark the new nodes and place them between their neighbors
  const layoutData = new PlaceNodesAtBarycenterStageData({
    affectedNodes: newNodes
  })

  const layout = new PlaceNodesAtBarycenterStage()
  graph.applyLayout(layout, layoutData)
}

/**
 * Runs an organic layout.
 * @param {!Iterable.<INode>} [newNodes]
 * @returns {!Promise}
 */
async function runLayout(newNodes) {
  if (newNodes) {
    prepareSmoothExpandLayoutAnimation(newNodes)
  }
  const layout = new OrganicLayout()
  layout.minimumNodeDistance = 100
  await graphComponent.morphLayout(layout, '1s')
}

/**
 * Clears the graph and fetches a single person.
 * @param {number} id
 * @returns {!Promise}
 */
async function loadSinglePerson(id) {
  const data = await tryQuery(querySinglePerson, { id })
  if (!data) {
    return
  }

  graphBuilder.clear()
  graphBuilder.addPersons([copyWithFriends(data.person, [])])
  await runLayout()
}

/**
 * Loads all friends of the person.
 * @param {!IModelItem} item The node for which the friends should be loaded
 * @returns {!Promise} The layout animation promise
 */
async function loadFriends(item) {
  if (!(item instanceof INode)) {
    return
  }

  const person = item.tag
  if (person.friendsCount === person.friends.length) {
    return
  }

  const data = await tryQuery(queryFriends, { id: person.id })
  if (!data) {
    return Promise.resolve()
  }

  const friends = data.person.friends
  const copiedFriends = friends.map((friend) => copyWithFriends(friend, [person]))
  const copiedPerson = copyWithFriends(person, copiedFriends)
  const newNodes = graphBuilder.addPersons([copiedPerson].concat(copiedFriends))

  return runLayout(newNodes)
}

/**
 * Loads the complete social network.
 * @returns {!Promise}
 */
async function loadAll() {
  const data = await tryQuery(queryAllPersons)
  if (!data) {
    return
  }

  graphBuilder.clear()
  graphBuilder.addPersons(data.persons)
  await runLayout()
}

/**
 * Executes a query and shows an error dialog if the server is not reachable.
 * @param {!string} query
 * @param {!object} variables
 * @returns {!Promise}
 */
async function tryQuery(query, variables = {}) {
  try {
    const response = await graphQLQuery(query, variables)
    return response.data
  } catch (e) {
    const errorDialog = document.getElementById('fetchError')
    if (errorDialog) {
      errorDialog.style.setProperty('display', 'unset')
    }
    return null
  }
}

/**
 * Binds actions to the demo's UI controls.
 */
function initializeUI() {
  document.querySelector('#reset-button').addEventListener('click', () => loadSinglePerson(1))
  document.querySelector('#load-all-button').addEventListener('click', () => loadAll())
}

run().then(finishLoading)
