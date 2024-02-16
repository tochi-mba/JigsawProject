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
  WebGL2Transition,
  WebGL2BeaconNodeIndicatorStyle,
  WebGL2NodeIndicatorStyle,
  WebGL2EdgeIndicatorStyle,
  WebGL2LabelIndicatorStyle,
  Color,
  Size,
  ShapeNodeStyle,
  DefaultLabelStyle,
  PolylineEdgeStyle,
  EdgePathLabelModel,
  EdgeSides
} from 'yfiles'

/**
 * @typedef {Object} SelectionStyle
 * @property {string} primaryColor
 * @property {number} primaryTransparency
 * @property {string} secondaryColor
 * @property {number} secondaryTransparency
 * @property {number} thickness
 * @property {number} margins
 * @property {(WebGL2IndicatorTypeStringValues|WebGL2BeaconAnimationTypeStringValues)} stylePattern
 * @property {StyleDecorationZoomPolicyStringValues} zoomPolicy
 * @property {WebGL2AnimationEasingStringValues} easing
 * @property {WebGL2Transition} transition
 * @property {WebGL2AnimationTiming} animationTiming
 */

/**
 * Initializes the defaults for the styling in this demo.
 * @param {!IGraph} graph
 */
export function initStyleDefaults(graph) {
  graph.nodeDefaults.size = new Size(100, 100)
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: 'lightgray',
    stroke: 'transparent'
  })
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({ insets: 10 })

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px gray',
    targetArrow: 'triangle'
  })
  graph.edgeDefaults.labels.style = new DefaultLabelStyle({ insets: 10 })
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 0,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.ON_EDGE })
}

/**
 * Reconfigures the selection styles according to the settings chosen in the UI.
 * @param {!SelectionStyle} style
 * @param {!GraphComponent} graphComponent
 */
export function updateSelectionStyles(style, graphComponent) {
  const selectionIndicatorManager = graphComponent.selectionIndicatorManager

  selectionIndicatorManager.nodeStyle = createNodeIndicatorStyle(style)
  selectionIndicatorManager.edgeStyle = createEdgeIndicatorStyle(style)
  selectionIndicatorManager.nodeLabelStyle = createLabelIndicatorStyle(style)
  selectionIndicatorManager.edgeLabelStyle = createLabelIndicatorStyle(style)

  reselectSelected(graphComponent)
}

/**
 * Creates a node indicator style from the given style properties. This can either be a
 * node indicator style or a beacon node indicator style.
 * @param {!SelectionStyle} style
 * @returns {!(WebGL2NodeIndicatorStyle|WebGL2BeaconNodeIndicatorStyle)}
 */
function createNodeIndicatorStyle(style) {
  // If we have a beacon or a halo style, we want the transition property to be 'scale' instead of
  // 'opacity', which is the default for other styles
  const nodeTransition =
    style.transition && (isBeaconStyle(style.stylePattern) || style.stylePattern === 'halo')
      ? new WebGL2Transition({
          properties: 'scale',
          easing: style.transition.easing,
          duration: style.transition.duration
        })
      : style.transition

  if (isBeaconStyle(style.stylePattern)) {
    return new WebGL2BeaconNodeIndicatorStyle({
      type: style.stylePattern,
      color: getColor(style.primaryColor, style.primaryTransparency),
      pulseCount: 1,
      pulseWidth: style.thickness,
      zoomPolicy: style.zoomPolicy,
      enterTransition: nodeTransition,
      leaveTransition: nodeTransition,
      timing: style.animationTiming,
      shape: 'node-shape'
    })
  } else {
    return new WebGL2NodeIndicatorStyle({
      type: style.stylePattern,
      primaryColor: getColor(style.primaryColor, style.primaryTransparency),
      secondaryColor: getColor(style.secondaryColor, style.secondaryTransparency),
      zoomPolicy: style.zoomPolicy,
      enterTransition: nodeTransition,
      leaveTransition: nodeTransition,
      dashStrokeAnimation: style.animationTiming,
      margins: style.margins,
      thickness: style.thickness,
      shape: 'node-shape'
    })
  }
}

/**
 * Creates an edge indicator style from the given style properties.
 * @param {!SelectionStyle} style
 * @returns {!WebGL2EdgeIndicatorStyle}
 */
function createEdgeIndicatorStyle(style) {
  return new WebGL2EdgeIndicatorStyle({
    type: isNodeOnlyStyle(style.stylePattern) ? 'solid' : style.stylePattern,
    primaryColor: getColor(style.primaryColor, style.primaryTransparency),
    secondaryColor: getColor(style.secondaryColor, style.secondaryTransparency),
    zoomPolicy: style.zoomPolicy,
    enterTransition: style.transition,
    leaveTransition: style.transition,
    dashStrokeAnimation: style.animationTiming,
    thickness: style.thickness
  })
}

/**
 * Creates a label indicator style from the given style properties.
 * @param {!SelectionStyle} style
 * @returns {!WebGL2LabelIndicatorStyle}
 */
function createLabelIndicatorStyle(style) {
  return new WebGL2LabelIndicatorStyle({
    type: isNodeOnlyStyle(style.stylePattern) ? 'solid' : style.stylePattern,
    primaryColor: getColor(style.primaryColor, style.primaryTransparency),
    secondaryColor: getColor(style.secondaryColor, style.secondaryTransparency),
    zoomPolicy: style.zoomPolicy,
    enterTransition: style.transition,
    leaveTransition: style.transition,
    dashStrokeAnimation: style.animationTiming,
    margins: style.margins,
    thickness: style.thickness,
    shape: 'label-shape'
  })
}

/**
 * "Re"-selects all already selected graph element to apply newly configured selection styles
 * @param {!GraphComponent} graphComponent
 */
function reselectSelected(graphComponent) {
  const selectedItems = graphComponent.selection.toArray()
  for (const item of selectedItems) {
    graphComponent.selection.setSelected(item, false)
    graphComponent.selection.setSelected(item, true)
  }
}

/**
 * Determines if the given style string is a beacon style.
 * @param {!string} styleString
 * @returns {!WebGL2BeaconAnimationTypeStringValues}
 */
function isBeaconStyle(styleString) {
  return styleString === 'fade' || styleString === 'no-fade' || styleString === 'reverse-fade'
}

/**
 * Creates a Color from a css color string and a provided transparency
 * @param {!string} color
 * @param {number} transparency
 * @returns {!Color}
 */
function getColor(color, transparency) {
  const r = parseInt(color.substring(1, 3), 16)
  const g = parseInt(color.substring(3, 5), 16)
  const b = parseInt(color.substring(5, 7), 16)
  return Color.fromRGBA(r, g, b, 1 - transparency)
}

/**
 *  Determines if the style pattern is only available for nodes which is true for beacon and halo styles.
 * @param {!string} styleString
 * @returns {!WebGL2BeaconAnimationTypeStringValues}
 */
function isNodeOnlyStyle(styleString) {
  return isBeaconStyle(styleString) || styleString === 'halo'
}
