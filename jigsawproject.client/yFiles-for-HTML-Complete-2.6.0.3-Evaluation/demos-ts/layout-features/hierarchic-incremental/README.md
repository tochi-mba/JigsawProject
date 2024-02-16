<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.0.3.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Incremental Hierarchic Layout - Layout Features

# Incremental Hierarchic Layout

This demo shows how to run the hierarchic layout algorithm on a predefined subset of nodes (and edges) in a graph.

To achieve this, two setup steps are necessary:

First, the algorithm has to be told to work on a subset only. To do so, [HierarchicLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayout)'s [layout mode](https://docs.yworks.com/yfileshtml/#/api/Hierarchic#layoutMode) property has to be set to [incremental](https://docs.yworks.com/yfileshtml/#/api/LayoutMode#INCREMENTAL).

Second, the algorithm has to be told which set of nodes (and edges) to rearrange. The class [HierarchicLayoutData](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayoutData) offers the property [incrementalHints](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayoutData#incrementalHints) for this purpose.

In this demo, the algorithm works on the subset of turquoise nodes only.

Click the button in the toolbar to run the layout and see the effect.

### Code Snippet

You can copy the code snippet to configure the layout from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout-features/hierarchic-incremental/HierarchicIncremental.ts).

### Demos

You can also take a look at more extensive demos that take advantage of this feature:

- [Hierarchic Nesting Demo](../../layout/hierarchic-nesting/)
- [Interactive Hierarchic Layout Demo](../../layout/interactive-hierarchic/)
- [Decision Tree Demo](../../showcase/decisiontree/)
- [Collapsible Trees Demo](../../view/collapse/)
- [Network Flows Demo](../../analysis/networkflows/)

### Documentation

The Developer's Guide has detailed information about the [hierarchic layout algorithm](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout) in general and about [how to run the algorithm on a subset of nodes](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout-incremental_layout) specifically.
