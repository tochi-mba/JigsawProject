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
  DefaultLabelStyle,
  EdgePathLabelModel,
  IconLabelStyle,
  InteriorLabelModel,
  InteriorStretchLabelModel,
  Size
} from 'yfiles'

/**
 * @param {!(LabelCreator.<EntityData>|LabelCreator.<string>)} nameLabelCreator
 */
export function configureNodeLabelParameter(nameLabelCreator) {
  // position the label on the top of the node
  nameLabelCreator.layoutParameterProvider = () => InteriorStretchLabelModel.NORTH
}

/**
 * @param {!LabelCreator.<EntityData>} typeLabelCreator
 */
export function configureDefaultPlacement(typeLabelCreator) {
  typeLabelCreator.defaults.layoutParameter = InteriorLabelModel.CENTER
}

/**
 * @param {!LabelCreator.<EntityData>} nameLabelCreator
 */
export function configureLabelDefaultStyles(nameLabelCreator) {
  nameLabelCreator.defaults.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'center'
  })
}

/**
 * @param {!LabelCreator.<EntityData>} typeLabelCreator
 */
export function configureLabelStylingWithBinding(typeLabelCreator) {
  // disable the sharing of the label style
  typeLabelCreator.defaults.shareStyleInstance = false
  // create a new binding to assign a new font
  typeLabelCreator.styleBindings.addBinding('font', () => 'bold 12px Roboto')
}

/**
 * @param {!LabelCreator.<EntityData>} nameLabelCreator
 */
export function configureLabelStylingWithProvider(nameLabelCreator) {
  const icon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='48' width='48'%3E%3Cpath d='M24 23.95q-3.3 0-5.4-2.1-2.1-2.1-2.1-5.4 0-3.3 2.1-5.4 2.1-2.1 5.4-2.1 3.3 0 5.4 2.1 2.1 2.1 2.1 5.4 0 3.3-2.1 5.4-2.1 2.1-5.4 2.1ZM37 40H11q-1.25 0-2.125-.875T8 37v-1.7q0-1.9.95-3.25T11.4 30q3.35-1.5 6.425-2.25Q20.9 27 24 27q3.1 0 6.15.775 3.05.775 6.4 2.225 1.55.7 2.5 2.05.95 1.35.95 3.25V37q0 1.25-.875 2.125T37 40Zm-26-3h26v-1.7q0-.8-.475-1.525-.475-.725-1.175-1.075-3.2-1.55-5.85-2.125Q26.85 30 24 30t-5.55.575q-2.7.575-5.85 2.125-.7.35-1.15 1.075Q11 34.5 11 35.3Zm13-16.05q1.95 0 3.225-1.275Q28.5 18.4 28.5 16.45q0-1.95-1.275-3.225Q25.95 11.95 24 11.95q-1.95 0-3.225 1.275Q19.5 14.5 19.5 16.45q0 1.95 1.275 3.225Q22.05 20.95 24 20.95Zm0-4.5ZM24 37Z'/%3E%3C/svg%3E`
  const orange = '#ffc499'
  const pink = '#dda7b5'
  // disable the sharing of the label style
  nameLabelCreator.defaults.shareStyleInstance = false
  // create a provider that will assign a new style, based on the type property
  nameLabelCreator.styleProvider = (data) => {
    if (data.type === 'Corporation') {
      return new DefaultLabelStyle({
        backgroundFill: orange,
        horizontalTextAlignment: 'center'
      })
    } else {
      return new IconLabelStyle({
        icon,
        iconSize: new Size(14, 14),
        iconPlacement: InteriorLabelModel.WEST,
        wrapped: new DefaultLabelStyle({
          backgroundFill: pink,
          horizontalTextAlignment: 'center'
        })
      })
    }
  }
}

/**
 * @param {!LabelCreator.<EntityData>} typeLabelCreator
 */
export function configureLabelSizeWithProvider(typeLabelCreator) {
  // set a new size for the labels with type 'Trust'
  typeLabelCreator.preferredSizeProvider = (data) =>
    data.type === 'Trust' ? new Size(70, 15) : new Size(100, 15)
}

/**
 * @param {!LabelCreator.<EntityData>} typeLabelCreator
 */
export function configureLabelSizeWithBinding(typeLabelCreator) {

  // set different widths for nodes with type 'Trust'
  typeLabelCreator.preferredSizeBindings.addBinding('width', (data) => {
    return data.type === 'Trust' ? 200 : 100
  })
}

/**
 * @param {!EdgesSource.<ConnectionData>} edgesSource
 */
export function configureEdgeLabels(edgesSource) {
  // bind the label text data and add some more text information
  const edgeLabelCreator = edgesSource.edgeCreator.createLabelBinding((data) =>
    data.ownership ?? 0 ? `Owns ${data.ownership}%` : ''
  )
  const red = '#ab2346'
  const grey = '#1a3442'
  // configure the position of the label
  edgeLabelCreator.layoutParameterProvider = () =>
    new EdgePathLabelModel({
      autoRotation: false
    }).createDefaultParameter()

  // configure its style
  edgeLabelCreator.defaults.shareStyleInstance = false
  edgeLabelCreator.styleBindings.addBinding('textFill', (data) => {
    return (data.ownership ?? 0) > 50 ? red : grey
  })
}
/**
 * @param {!GraphBuilder} graphBuilder
 * @returns {!NodesSource.<EntityData>}
 */
export function createNodesSource(graphBuilder) {
  const data = {
    nodeData: [
      {
        id: '0',
        name: 'Investment Capital',
        type: 'Corporation'
      },
      { id: '1', name: 'Melissa Barner', type: 'Trust' },
      { id: '2', name: 'Monster Inc', type: 'Corporation' },
      {
        id: '3',
        name: 'International Group',
        type: 'Trust'
      }
    ],
    edgeData: [
      {
        id: '0',
        sourceId: '1',
        targetId: '0',
        ownership: 30
      },
      {
        id: '1',
        sourceId: '2',
        targetId: '0',
        ownership: 60
      },
      {
        id: '2',
        sourceId: '3',
        targetId: '0',
        ownership: 5
      }
    ]
  }
  return graphBuilder.createNodesSource(data.nodeData, 'id')
}

/**
 * @param {!GraphBuilder} graphBuilder
 * @returns {!EdgesSource.<ConnectionData>}
 */
export function createEdgesSource(graphBuilder) {
  const data = {
    edgesSource: [
      {
        id: '0',
        sourceId: '1',
        targetId: '0',
        ownership: 30
      },
      {
        id: '1',
        sourceId: '2',
        targetId: '0',
        ownership: 60
      },
      {
        id: '2',
        sourceId: '3',
        targetId: '0',
        ownership: 5
      }
    ]
  }
  return graphBuilder.createEdgesSource(data.edgesSource, 'sourceId', 'targetId', 'id')
}

/**
 * @param {!NodesSource.<EntityData>} nodesSource
 * @returns {!LabelCreator.<EntityData>}
 */
export function createLabelsForName(nodesSource) {
  const labelCreator = nodesSource.nodeCreator.createLabelBinding((data) => data.name)
  return labelCreator
}

/**
 * @param {!NodesSource.<EntityData>} nodesSource
 * @returns {!LabelCreator.<EntityData>}
 */
export function createLabelsForType(nodesSource) {
  const labelCreator = nodesSource.nodeCreator.createLabelBinding()
  labelCreator.textProvider = (data) => data.type
  return labelCreator
}
