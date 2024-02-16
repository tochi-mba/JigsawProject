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
  DefaultGraph,
  delegate,
  HashMap,
  type IFoldingView,
  type IGraph,
  type ILabel,
  type ILabelOwner,
  INode,
  type ItemChangedEventArgs,
  type ItemEventArgs,
  type LabelEventArgs,
  type NodeEventArgs
} from 'yfiles'

/**
 * Specifies the folding view features required for the structure view.
 */
type FoldingViewType = {
  getViewItem: (node: INode) => INode | null
  collapse: (node: INode) => void
  expand: (node: INode) => void
  addGroupCollapsedListener: (
    listener: (src: IFoldingView, args: ItemEventArgs<INode>) => void
  ) => void
  removeGroupCollapsedListener: (
    listener: (src: IFoldingView, args: ItemEventArgs<INode>) => void
  ) => void
  addGroupExpandedListener: (
    listener: (src: IFoldingView, args: ItemEventArgs<INode>) => void
  ) => void
  removeGroupExpandedListener: (
    listener: (src: IFoldingView, args: ItemEventArgs<INode>) => void
  ) => void
}

/**
 * Stub implementation of the above-specified folding view type for flat graphs (or graphs without
 * folding). This stub implementation ensures that the structure view is properly populated even
 * if the associated graph does not support folding.
 */
const DummyFoldingView: FoldingViewType = {
  getViewItem(node: INode): INode | null {
    return node
  },

  collapse(): void {},

  expand(): void {},

  addGroupCollapsedListener(): void {},

  removeGroupCollapsedListener(): void {},

  addGroupExpandedListener(): void {},

  removeGroupExpandedListener(): void {}
}

/**
 * Displays a structured view of a given {@link IGraph}. The collapse/expand mechanism is based on
 * a checkbox state and CSS selectors. Therefore, the corresponding CSS file is required.
 */
export class StructureView {
  /**
   * The text for nodes that do not have a label.
   */
  nodeLabelPlaceholder = '< node >'
  groupLabelPlaceholder = '< group >'

  /**
   * Whether the folding state should be synced between the structure view and the graph.
   */
  syncFoldingState = false

  private foldingView: FoldingViewType = DummyFoldingView
  private masterGraph: IGraph = new DefaultGraph()
  private readonly rootListElement: HTMLElement
  private groupElementCounter = 0

  /**
   * Stores a mapping from graph nodes to structure view DOM elements.
   * Uses a yFiles HashMap because keys are yFiles objects of type INode.
   */
  private readonly nodeToElement: HashMap<INode, HTMLElement>

  /**
   * Initializes the structure view in the DOM element given by the id and the given click callback.
   * @param selector The selector for the container in which the structure view should be created.
   * @param graph The graph which is represented by the structure view
   */
  constructor(
    selector: string,
    private graph: IGraph
  ) {
    this.nodeToElement = new HashMap()
    this.rootListElement = document.createElement('ol')

    const graphRoot = this.createGraphRootElement()
    graphRoot.appendChild(this.rootListElement)

    const graphList = document.createElement('div')
    graphList.className = 'structure-view__list'
    graphList.appendChild(graphRoot)

    const container = document.querySelector(selector)!
    container.className = 'structure-view'
    container.appendChild(graphList)

    this.setGraph(this.graph)
  }

  /**
   * The callback that is executed when an element in the structure view is clicked.
   */
  elementClickedCallback: (node: INode) => void = () => {}

  /**
   * Specifies the graph that is currently displayed by this structure view.
   */
  setGraph(graph: IGraph): void {
    //remove events from the previous graph
    this.uninstallEventListeners()

    this.graph = graph

    // re-initialize the StructureView with the new graph
    const foldingView = graph.foldingView
    this.foldingView = foldingView ?? DummyFoldingView
    this.masterGraph = foldingView?.manager.masterGraph ?? graph
    this.installEventListeners()
    this.buildStructure()
  }

  /**
   * Installs listeners to update the structure view if the graph is edited.
   * The structure is updated on label editing, node creation/deletion and re-parenting.
   */
  private installEventListeners(): void {
    const graph = this.masterGraph
    graph.addLabelAddedListener(delegate(this.onLabelAdded, this))
    graph.addLabelTextChangedListener(delegate(this.onLabelTextChanged, this))
    graph.addLabelRemovedListener(delegate(this.onLabelRemoved, this))
    graph.addNodeCreatedListener(delegate(this.onNodeCreated, this))
    graph.addNodeRemovedListener(delegate(this.onNodeRemoved, this))
    graph.addParentChangedListener(delegate(this.onParentChanged, this))

    this.foldingView.addGroupCollapsedListener(delegate(this.syncGroupElementStateWithNode, this))
    this.foldingView.addGroupExpandedListener(delegate(this.syncGroupElementStateWithNode, this))
  }

  /**
   * Uninstalls listeners added in {@link installEventListeners}.
   */
  private uninstallEventListeners(): void {
    this.foldingView.removeGroupCollapsedListener(
      delegate(this.syncGroupElementStateWithNode, this)
    )
    this.foldingView.removeGroupExpandedListener(delegate(this.syncGroupElementStateWithNode, this))

    const graph = this.masterGraph
    graph.removeLabelAddedListener(delegate(this.onLabelAdded, this))
    graph.removeLabelTextChangedListener(delegate(this.onLabelTextChanged, this))
    graph.removeLabelRemovedListener(delegate(this.onLabelRemoved, this))
    graph.removeNodeCreatedListener(delegate(this.onNodeCreated, this))
    graph.removeNodeRemovedListener(delegate(this.onNodeRemoved, this))
    graph.removeParentChangedListener(delegate(this.onParentChanged, this))
  }

  // ========
  // Definition of event listener methods since we need to be able to remove them from the
  // old graph if the graph is updated.
  // ========
  private onLabelAdded(_: IGraph, args: ItemEventArgs<ILabel>): void {
    this.updateLabel(args.item.owner)
  }
  private onLabelTextChanged(_: IGraph, args: ItemChangedEventArgs<ILabel, string>): void {
    this.updateLabel(args.item.owner)
  }
  private onLabelRemoved(_: IGraph, args: LabelEventArgs): void {
    this.updateLabel(args.owner)
  }
  private onNodeCreated(_: IGraph, args: ItemEventArgs<INode>): void {
    this.addNode(args.item)
  }
  private onNodeRemoved(_: IGraph, args: NodeEventArgs): void {
    this.removeNode(args.item)
  }
  private onParentChanged(_: IGraph, args: NodeEventArgs): void {
    this.reParentNode(args.item)
  }

  /**
   * Clears the current structure component and builds it anew from scratch.
   */
  private buildStructure(): void {
    this.clearStructure()
    for (const node of this.masterGraph.getChildren(null)) {
      // traverse the top-level nodes and recursively build the structure view
      this.buildRecursiveTreeStructure(this.rootListElement, node)
    }
  }

  /**
   * A recursive helper function that actually builds the structure view. It
   * traverses all graph nodes and adds the respective DOM elements in the structure
   * view component.
   */
  private buildRecursiveTreeStructure(rootElement: HTMLElement, node: INode): void {
    if (this.masterGraph.getChildren(node).size > 0) {
      // add a new group element and recursively build its children
      const childRoot = this.appendGroupElement(rootElement, node)
      for (const child of this.masterGraph.getChildren(node)) {
        this.buildRecursiveTreeStructure(childRoot, child)
      }
    } else {
      // add a leaf
      this.appendNodeElement(rootElement, node)
    }
  }

  /**
   * Helper method to clear the entire structure and its internal maps.
   */
  private clearStructure(): void {
    while (this.rootListElement.lastChild) {
      this.rootListElement.removeChild(this.rootListElement.lastChild)
    }
    this.nodeToElement.clear()
    this.groupElementCounter = 0
  }

  /**
   * Creates the DOM element for the given node and adds it to
   * the structure view.
   */
  private addNode(node: INode): void {
    let rootElement = this.rootListElement
    const parentNode = this.masterGraph.getParent(node)
    if (parentNode) {
      const parentElement = this.getElement(parentNode)
      if (parentElement) {
        const listElement = this.getChildRootElement(parentElement)
        if (listElement) {
          rootElement = listElement
        }
      }
    }

    if (this.masterGraph.isGroupNode(node)) {
      const childRoot = this.appendGroupElement(rootElement, node)
      for (const child of this.masterGraph.getChildren(node)) {
        this.buildRecursiveTreeStructure(childRoot, child)
      }
    } else {
      this.appendNodeElement(rootElement, node)
    }
  }

  /**
   * Removes the node element from the structure view and deletes the node to element mappings.
   */
  private removeNode(node: INode): void {
    const element = this.getElement(node)

    if (element) {
      const listElement = this.getChildRootElement(element)
      if (listElement) {
        // move the children to the parent
        const newGroupList = element.parentNode!
        while (listElement.lastChild) {
          newGroupList.appendChild(listElement.lastChild)
        }
      }

      // removes the node from the node-to-element map
      this.nodeToElement.delete(node)

      // removes the element from the DOM
      element.remove()
    }
  }

  /**
   * Moves the structure view element which belongs to the given node to the element
   * of the new parent node.
   */
  private reParentNode(node: INode): void {
    let newRoot = this.rootListElement
    const newParentNode = this.masterGraph.getParent(node)
    if (newParentNode) {
      const newParentElement = this.getElement(newParentNode)
      if (newParentElement) {
        const listElement = this.getChildRootElement(newParentElement)
        if (listElement) {
          newRoot = listElement
        }
      }
    }

    const element = this.getElement(node)
    if (element) {
      newRoot.appendChild(element)
    }
  }

  /**
   * Synchronizes the name of the element in the structure view with the label of the node.
   * If the node has no label, the placeholder label will be used instead.
   */
  private updateLabel(modelItem: ILabelOwner | null): void {
    if (!(modelItem instanceof INode)) {
      return
    }

    const element = this.getElement(modelItem)
    if (element) {
      const label = this.getLabelElement(element)
      label.textContent =
        modelItem.labels.at(0)?.text ??
        (this.masterGraph.isGroupNode(modelItem)
          ? this.groupLabelPlaceholder
          : this.nodeLabelPlaceholder)
    }
  }

  /**
   * Creates the root element for the structure view. This element does not belong to any node
   * and also has no click events or callbacks. This just serves as a collapse/expand button for the
   * structure view
   */
  private createGraphRootElement(): HTMLElement {
    // Create the 'Graph' root folder
    const graphRootElement = document.createElement('div')
    graphRootElement.className = 'structure-view__group'

    const label = document.createElement('label')
    label.setAttribute('for', 'graph-root')
    label.textContent = 'Graph'

    const collapseBox = document.createElement('input')
    collapseBox.id = 'graph-root'
    collapseBox.type = 'checkbox'
    collapseBox.checked = true

    graphRootElement.append(label, collapseBox)

    return graphRootElement
  }

  /**
   * Creates an HTML group element with its events and appends it to the DOM.
   * This returns the root element for the group's children.
   */
  private appendGroupElement(parent: HTMLElement, groupNode: INode): HTMLElement {
    const groupId = this.groupElementCounter++

    // create the group
    const groupElement = document.createElement('li')
    groupElement.className = 'structure-view__group'

    // create the label
    const label = document.createElement('label')
    label.setAttribute('data-groupElement', `group-${groupId}`)
    label.textContent = groupNode.labels.at(0)?.text ?? this.groupLabelPlaceholder
    label.addEventListener('click', () => this.elementClickedCallback(groupNode))

    // the collapse/expand control is done via checkbox
    const collapseBox = document.createElement('input')
    collapseBox.id = `group-${groupId}`
    collapseBox.type = 'checkbox'
    collapseBox.checked = true

    // sync the folding state with the graph if enabled
    collapseBox.addEventListener('change', (e) => this.syncGroupNodeStateWithElement(e))

    const childRoot = document.createElement('ol')

    groupElement.append(label, collapseBox, childRoot)
    parent.appendChild(groupElement)

    // keep track of the elements
    this.addElementNodeMapping(groupElement, groupNode)

    return childRoot
  }

  /**
   * Creates an HTML node element with its click listener and appends it to the DOM.
   */
  private appendNodeElement(parent: HTMLElement, node: INode): void {
    // create the element
    const nodeElement = document.createElement('li')
    nodeElement.className = 'structure-view__node'
    nodeElement.textContent = node.labels.at(0)?.text ?? this.nodeLabelPlaceholder
    nodeElement.addEventListener('click', () => this.elementClickedCallback(node))

    // keep track of the elements
    this.addElementNodeMapping(nodeElement, node)

    parent.appendChild(nodeElement)
  }

  /**
   * Stores bidirectional references from element to node and vice versa
   */
  private addElementNodeMapping(element: HTMLElement, node: INode): void {
    this.nodeToElement.set(node, element)

    const el = element as HTMLElement & { 'data-nodeMapping'?: INode }
    el['data-nodeMapping'] = node
  }

  /**
   * Returns the HTMLElement in the structure view that represents the given graph node.
   */
  private getElement(node: INode): HTMLElement | null {
    return this.nodeToElement.get(node)
  }

  /**
   * Returns the Node in the graph that represents the given structure view HTMLElement.
   */
  private getNode(element: HTMLElement): INode | undefined {
    const el = element as HTMLElement & { 'data-nodeMapping'?: INode }
    return el['data-nodeMapping']
  }

  /**
   * Gets the first ol element within the structure view group element, which serves as the
   * child root element for this group.
   */
  private getChildRootElement(groupElement: HTMLElement): HTMLElement | null {
    return groupElement.querySelector('ol')
  }

  /**
   * Gets the label of the given structure view element. For group elements this will return a label
   * and for node elements this will return the node itself
   */
  private getLabelElement(element: HTMLElement): HTMLElement {
    return element.querySelector('label') ?? element
  }

  /**
   * Sets the graph's group node element state to the given collapsed state of
   * the structure view group element.
   */
  private syncGroupNodeStateWithElement(e: Event): void {
    if (!this.syncFoldingState) {
      return
    }

    const collapseBox = e.target as HTMLInputElement
    const masterGroupNode = this.getNode(collapseBox.parentElement!)
    if (!masterGroupNode) {
      return
    }
    const viewGroupNode = this.foldingView.getViewItem(masterGroupNode)
    if (!viewGroupNode) {
      return
    }

    if (!collapseBox.checked) {
      this.foldingView.collapse(viewGroupNode)
    } else {
      this.foldingView.expand(viewGroupNode)
    }
  }

  /**
   * Sets the structured view group element state to the given collapsed state of the graph's group nodes.
   */
  private syncGroupElementStateWithNode(src: IFoldingView, args: ItemEventArgs<INode>): void {
    if (!this.syncFoldingState) {
      return
    }

    const groupNode = args.item
    const masterGroupNode = src.getMasterItem(groupNode)
    const groupLi = this.getElement(masterGroupNode ? masterGroupNode : groupNode)
    if (!groupLi) {
      return
    }
    const groupLabel = this.getLabelElement(groupLi)
    const checkboxId = groupLabel.getAttribute('data-groupElement')!
    const checkboxElement = document.querySelector<HTMLInputElement>('#' + checkboxId)!
    checkboxElement.checked = src.isExpanded(groupNode)
  }
}
