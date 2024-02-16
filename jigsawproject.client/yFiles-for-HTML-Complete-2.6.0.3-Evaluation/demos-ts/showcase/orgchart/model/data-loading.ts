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
import { type IGraph, type INode, TreeBuilder } from 'yfiles'
import { type Employee, orgChartData } from './orgchart-data'

type OrgChartData = Employee[]

/**
 * Creates the sample graph of this demo.
 * @param graph The graph which will be populated
 */
export function buildGraph(graph: IGraph): void {
  const data: OrgChartData = orgChartData
  addParentReferences(data[0])

  const treeBuilder = new TreeBuilder(graph)
  // configure the root nodes
  const rootSource = treeBuilder.createRootNodesSource(data)
  // configure the recursive structure of the children
  rootSource.addChildNodesSource((dataItem) => dataItem.subordinates, rootSource)
  treeBuilder.buildGraph()
}

/**
 * Adds a "parent" reference to all subordinates contained in the source data.
 * The parent reference is needed to create the colleague and parent links
 * in the properties-view.
 * @param nodesSourceItem The source data in JSON format
 */
function addParentReferences(nodesSourceItem: Employee): void {
  const subs = nodesSourceItem.subordinates
  if (subs !== undefined) {
    for (let i = 0; i < subs.length; i++) {
      const sub = subs[i]
      sub.parent = nodesSourceItem
      addParentReferences(sub)
    }
  }
}

/**
 * Retrieves the Employee from a node's tag.
 */
export function getEmployee(node: INode): Employee | undefined {
  return node.tag as Employee | undefined
}
