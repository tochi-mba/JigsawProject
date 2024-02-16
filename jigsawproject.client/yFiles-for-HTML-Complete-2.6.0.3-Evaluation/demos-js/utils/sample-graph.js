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
/**
 * Some simple functions to create a sample graph with folding functionality
 * and give it a bit of styling.
 */
import {
  DefaultFolderNodeConverter,
  DefaultLabelStyle,
  FoldingManager,
  FreeEdgeLabelModel,
  GraphComponent,
  GroupNodeStyle,
  HorizontalTextAlignment,
  IGraph,
  ILabelOwner,
  IList,
  Insets,
  InteriorLabelModel,
  LabelShape,
  PolylineEdgeStyle,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size,
  VerticalTextAlignment
} from 'yfiles'

/**
 * Creates a sample graph with grouping.
 * @param {!IGraph} graph The input graph to be filled.
 */
export function createGroupedSampleGraph(graph) {
  graph.clear()

  graph.nodeDefaults.size = [75, 75]

  const root = graph.createNode()

  for (let i = 0; i < 2; i++) {
    const groupNode = graph.createGroupNode()
    const nestedGroupNode1 = graph.createGroupNode(groupNode)
    const nestedGroupNode2 = graph.createGroupNode(groupNode)

    const nodes = []
    for (let j = 0; j < 2; j++) {
      nodes[j] = graph.createNode()
      graph.setParent(nodes[j], groupNode)
    }

    for (let k = 2; k < 4; k++) {
      nodes[k] = graph.createNode()
      graph.setParent(nodes[k], nestedGroupNode1)
    }

    for (let l = 4; l < 8; l++) {
      nodes[l] = graph.createNode()
      graph.setParent(nodes[l], nestedGroupNode2)
    }

    graph.createEdge(root, nodes[1])
    graph.createEdge(nodes[3], nodes[7])
    graph.createEdge(nodes[0], nodes[1])
    graph.createEdge(nodes[0], nodes[4])
    graph.createEdge(nodes[1], nodes[2])
    graph.createEdge(nodes[5], nodes[6])
  }

  generateItemLabels(graph, graph.edges.toList())
  generateItemLabels(graph, graph.nodes.filter((node) => !graph.isGroupNode(node)).toList())
}

/**
 * Generate and add random labels for a collection of ModelItems.
 * Existing items will be deleted before adding the new items.
 * @param {!IGraph} graph the current graph
 * @param {!IList.<ILabelOwner>} items the collection of items the labels are generated for
 */
function generateItemLabels(graph, items) {
  const wordCountMin = 2
  const wordCountMax = 4
  const labelPercMin = 0.2
  const labelPercMax = 0.7
  const labelCount = Math.floor(
    items.size * (Math.random() * (labelPercMax - labelPercMin) + labelPercMin)
  )

  const loremList = [
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'donec',
    'felis',
    'erat',
    'malesuada',
    'quis',
    'ipsum',
    'et',
    'condimentum',
    'ultrices',
    'orci',
    'nullam',
    'interdum',
    'vestibulum',
    'eros',
    'sed',
    'porta',
    'donec',
    'ac',
    'eleifend',
    'dolor',
    'at',
    'dictum',
    'ipsum',
    'pellentesque',
    'vel',
    'suscipit',
    'mi',
    'nullam',
    'aliquam',
    'turpis',
    'et',
    'dolor',
    'porttitor',
    'varius',
    'nullam',
    'vel',
    'arcu',
    'rutrum',
    'iaculis',
    'est',
    'sit',
    'amet',
    'rhoncus',
    'turpis',
    'vestibulum',
    'lacinia',
    'sollicitudin',
    'urna',
    'nec',
    'vestibulum',
    'nulla',
    'id',
    'lacinia',
    'metus',
    'etiam',
    'ac',
    'felis',
    'rutrum',
    'sollicitudin',
    'erat',
    'vitae',
    'egestas',
    'tortor',
    'curabitur',
    'quis',
    'libero',
    'aliquet',
    'mattis',
    'mauris',
    'nec',
    'tempus',
    'nibh',
    'in',
    'at',
    'lectus',
    'luctus',
    'mattis',
    'urna',
    'pretium',
    'eleifend',
    'lacus',
    'sed',
    'interdum',
    'sapien',
    'nec',
    'justo',
    'vestibulum',
    'non',
    'scelerisque',
    'nibh',
    'sollicitudin',
    'interdum',
    'et',
    'malesuada',
    'fames',
    'ac',
    'ante',
    'ipsum',
    'primis',
    'in',
    'faucibus',
    'vivamus',
    'congue',
    'tristique',
    'magna',
    'quis',
    'elementum',
    'phasellus',
    'sit',
    'amet',
    'tristique',
    'massa',
    'vestibulum',
    'eu',
    'leo',
    'vitae',
    'quam',
    'dictum',
    'venenatis',
    'eu',
    'id',
    'nibh',
    'donec',
    'eget',
    'eleifend',
    'felis',
    'nulla',
    'ac',
    'suscipit',
    'ante',
    'et',
    'sollicitudin',
    'dui',
    'mauris',
    'in',
    'pulvinar',
    'tortor',
    'vestibulum',
    'pulvinar',
    'arcu',
    'vel',
    'tellus',
    'maximus',
    'blandit',
    'morbi',
    'sed',
    'sem',
    'vehicula',
    'fermentum',
    'nisi',
    'eu',
    'fringilla',
    'metus',
    'duis',
    'ut',
    'quam',
    'eget',
    'odio',
    'hendrerit',
    'finibus',
    'ut',
    'a',
    'lectus',
    'cras',
    'ullamcorper',
    'turpis',
    'in',
    'purus',
    'facilisis',
    'vestibulum',
    'donec',
    'maximus',
    'ac',
    'tortor',
    'tempus',
    'egestas',
    'aenean',
    'est',
    'diam',
    'dictum',
    'et',
    'sodales',
    'vel',
    'efficitur',
    'ac',
    'libero',
    'vivamus',
    'vehicula',
    'ligula',
    'eu',
    'diam',
    'auctor',
    'at',
    'dapibus',
    'nulla',
    'pellentesque',
    'morbi',
    'et',
    'dapibus',
    'dolor',
    'quis',
    'auctor',
    'turpis',
    'nunc',
    'sed',
    'pretium',
    'diam',
    'quisque',
    'non',
    'massa',
    'consectetur',
    'tempor',
    'augue',
    'vel',
    'volutpat',
    'ex',
    'vivamus',
    'vestibulum',
    'dolor',
    'risus',
    'quis',
    'mollis',
    'urna',
    'fermentum',
    'sed',
    'sed',
    'porttitor',
    'venenatis',
    'volutpat',
    'nulla',
    'facilisi',
    'donec',
    'aliquam',
    'mi',
    'vitae',
    'ligula',
    'dictum',
    'ornare',
    'suspendisse',
    'finibus',
    'ligula',
    'vitae',
    'congue',
    'iaculis',
    'donec',
    'vestibulum',
    'erat',
    'vel',
    'tortor',
    'iaculis',
    'tempor',
    'vivamus',
    'et',
    'purus',
    'eu',
    'ipsum',
    'rhoncus',
    'pretium',
    'sit',
    'amet',
    'nec',
    'nisl',
    'nunc',
    'molestie',
    'consectetur',
    'rhoncus',
    'duis',
    'ex',
    'nunc',
    'interdum',
    'at',
    'molestie',
    'quis',
    'blandit',
    'quis',
    'diam',
    'nunc',
    'imperdiet',
    'lorem',
    'vel',
    'scelerisque',
    'facilisis',
    'eros',
    'massa',
    'auctor',
    'nisl',
    'vitae',
    'efficitur',
    'leo',
    'diam',
    'vel',
    'felis',
    'aliquam',
    'tincidunt',
    'dapibus',
    'arcu',
    'in',
    'pulvinar',
    'metus',
    'tincidunt',
    'et',
    'etiam',
    'turpis',
    'ligula',
    'sodales',
    'a',
    'eros',
    'vel',
    'fermentum',
    'imperdiet',
    'purus',
    'fusce',
    'mollis',
    'enim',
    'sed',
    'volutpat',
    'blandit',
    'arcu',
    'orci',
    'iaculis',
    'est',
    'non',
    'iaculis',
    'lorem',
    'sapien',
    'sit',
    'amet',
    'est',
    'morbi',
    'ut',
    'porttitor',
    'elit',
    'aenean',
    'ac',
    'sodales',
    'lectus',
    'morbi',
    'ut',
    'bibendum',
    'arcu',
    'maecenas',
    'tincidunt',
    'erat',
    'vel',
    'maximus',
    'pellentesque',
    'ut',
    'placerat',
    'quam',
    'sem',
    'a',
    'auctor',
    'ligula',
    'imperdiet',
    'quis',
    'pellentesque',
    'gravida',
    'consectetur',
    'urna',
    'suspendisse',
    'vitae',
    'nisl',
    'et',
    'ante',
    'ornare',
    'vulputate',
    'sed',
    'a',
    'est',
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'eu',
    'facilisis',
    'lectus',
    'nullam',
    'iaculis',
    'dignissim',
    'eros',
    'eget',
    'tincidunt',
    'metus',
    'viverra',
    'at',
    'donec',
    'nec',
    'justo',
    'vitae',
    'risus',
    'eleifend',
    'imperdiet',
    'eget',
    'ut',
    'ante',
    'ut',
    'arcu',
    'ex',
    'convallis',
    'in',
    'lobortis',
    'at',
    'mattis',
    'sed',
    'velit',
    'ut',
    'viverra',
    'ultricies',
    'lacus',
    'suscipit',
    'feugiat',
    'eros',
    'luctus',
    'et',
    'vestibulum',
    'et',
    'aliquet',
    'mauris',
    'quisque',
    'convallis',
    'purus',
    'posuere',
    'aliquam',
    'nulla',
    'sit',
    'amet',
    'posuere',
    'orci',
    'nullam',
    'sed',
    'iaculis',
    'mauris',
    'ut',
    'volutpat',
    'est',
    'suspendisse',
    'in',
    'vestibulum',
    'felis',
    'nullam',
    'gravida',
    'nulla',
    'at',
    'varius',
    'fringilla',
    'ipsum',
    'ipsum',
    'finibus',
    'lectus',
    'nec',
    'vestibulum',
    'lorem',
    'arcu',
    'ut',
    'magna',
    'aliquam',
    'aliquam',
    'erat',
    'erat',
    'ac',
    'euismod',
    'orci',
    'iaculis',
    'blandit',
    'morbi',
    'tincidunt',
    'posuere',
    'mi',
    'non',
    'eleifend',
    'vivamus',
    'accumsan',
    'dolor',
    'magna',
    'in',
    'cursus',
    'eros',
    'malesuada',
    'eu',
    'sed',
    'auctor',
    'consectetur',
    'tempus',
    'maecenas',
    'luctus',
    'turpis',
    'a'
  ]

  // add random item labels
  for (let i = 0; i < labelCount; i++) {
    let label = ''
    const wordCount = Math.floor(Math.random() * (wordCountMax + 1 - wordCountMin)) + wordCountMin
    for (let j = 0; j < wordCount; j++) {
      const k = Math.floor(Math.random() * loremList.length)
      label += j === 0 ? '' : ' '
      label += loremList[k]
    }
    const itemIdx = Math.floor(Math.random() * items.size)
    const item = items.get(itemIdx)
    items.removeAt(itemIdx)
    graph.addLabel(item, label)
  }
}

/**
 * Initializes the graph defaults and adds item created listeners that set a unique ID to each new node and edge.
 * The IDs are used in the exported JSON files to identify items in the graph model.
 * @param {!GraphComponent} graphComponent
 */
export function initializeFolding(graphComponent) {
  // Configure folding
  const manager = new FoldingManager()
  const folderNodeConverter = new DefaultFolderNodeConverter()
  folderNodeConverter.folderNodeSize = new Size(150, 100)
  manager.folderNodeConverter = folderNodeConverter

  const foldingView = manager.createFoldingView()
  foldingView.enqueueNavigationalUndoUnits = true
  graphComponent.graph = foldingView.graph

  // enable undo/redo support
  manager.masterGraph.undoEngineEnabled = true
}

/**
 * @param {!IGraph} graph
 */
export function initializeBasicDemoStyles(graph) {
  const colorSet = {
    fill: '#ff6c00',
    stroke: '#662b00',
    nodeLabelFill: '#ffc499',
    edgeLabelFill: '#e0d5cc',
    text: '#662b00'
  }

  const colorSet2 = {
    fill: '#242265',
    stroke: '#0e0e28',
    nodeLabelFill: '#a7a7c1',
    edgeLabelFill: '#cfcfd4',
    text: '#0e0e28'
  }

  // set (group-)node defaults
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: ShapeNodeShape.ROUND_RECTANGLE,
    fill: colorSet.fill,
    stroke: `1.5px ${colorSet.stroke}`
  })

  graph.groupNodeDefaults.style = new GroupNodeStyle({
    groupIcon: 'minus',
    folderIcon: 'plus',
    tabFill: colorSet2.nodeLabelFill,
    stroke: `2px solid ${colorSet2.fill}`,
    contentAreaInsets: 20,
    tabBackgroundFill: colorSet2.fill,
    tabPosition: 'top-trailing',
    tabWidth: 30,
    tabHeight: 20,
    tabInset: 3,
    iconOffset: 2,
    iconSize: 14,
    iconForegroundFill: colorSet2.fill,
    hitTransparentContentArea: true
  })

  // set edge defaults
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: `1.5px ${colorSet.stroke}`,
    targetArrow: `${colorSet.stroke} small triangle`
  })

  // set label defaults
  const defaultLabelStyle = new DefaultLabelStyle({
    shape: LabelShape.ROUND_RECTANGLE,
    backgroundFill: colorSet.nodeLabelFill,
    textFill: colorSet.text,
    verticalTextAlignment: VerticalTextAlignment.CENTER,
    horizontalTextAlignment: HorizontalTextAlignment.CENTER,
    insets: new Insets(4, 2, 4, 1)
  })

  graph.nodeDefaults.labels.style = defaultLabelStyle
  graph.edgeDefaults.labels.style = defaultLabelStyle
  graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.CENTER
  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createDefaultParameter()
}
