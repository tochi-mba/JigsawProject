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
import { StringTemplateNodeStyle, TemplateNodeStyle } from 'yfiles'
import { predefinedColorSets } from './CompanyOwnershipNodeStyles'
import { colorSets } from 'demo-resources/demo-colors'

// creates the template style for the nodes
export const tableNodeStyle = new StringTemplateNodeStyle(`<g>
  <rect fill="#a4aeb3" width="{TemplateBinding width}" height="{TemplateBinding height}" x="1" y="1"/>
  <rect fill="#f0f0f0" stroke="#a4aeb3" width="{TemplateBinding width}" height="{TemplateBinding height}"/>
  <rect width="{TemplateBinding width}" height="3" fill="{Binding nodeType, Converter=templateNodeConverters.typeColorConverter}"/>
  <g style="font-family: Roboto,sans-serif; fill: #444; font-size: 12px;">
    <text transform="translate(8 20)" style="font-size: 14px; text-align: center; fill: #336699" data-content="{Binding name}"/>
    <rect transform="translate(8 24)" width="164" height="1" fill="#336699"/>

    <text transform="translate(8 40)">Type</text>
    <text transform="translate(110 40)" data-content="{Binding nodeType}"/>

    <text transform="translate(8 55)">Jurisdiction</text>
    <text transform="translate(110 55)" data-content="{Binding jurisdiction}"/>

    <text transform="translate(8 70)">Tax Status</text>
    <text transform="translate(110 70)" data-content="{Binding taxStatus, Converter=templateNodeConverters.valueConverter}"/>

    <text transform="translate(8 85)">Currency</text>
    <text transform="translate(110 85)" data-content="{Binding currency, Converter=templateNodeConverters.valueConverter}"/>

    <text transform="translate(8 100)">Units</text>
    <text transform="translate(110 100)" data-content="{Binding units, Converter=templateNodeConverters.valueConverter}"/>
  </g>
</g>`)

type TemplateNodeStyleConverters = {
  templateNodeConverters: {
    typeColorConverter: (val: string) => string
    valueConverter: (val: string) => string
  }
}
/**
 * Initializes the converters needed for creating the template node style.
 */
export function initializeConverters(): void {
  ;(TemplateNodeStyle.CONVERTERS as TemplateNodeStyleConverters).templateNodeConverters = {
    // converter function for the background color of nodes
    typeColorConverter: (value: string): string => {
      return colorSets[predefinedColorSets.get(value) || 'demo-palette-51'].fill || 'white'
    },

    // converter function for reading the values of the node attributes
    valueConverter: (value: string): string => {
      return value || '---'
    }
  }
}
