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
# 07 Hit-Testing - Tutorial: Edge Style Implementation

# Customizing hit-testing

Styles not only provide a visual representation for graph items. They also offer crucial parts for interacting with said items. Hit-testing determines whether a particular item is at a given point in the canvas. It happens all the time during interaction, e.g. when selecting items, moving nodes, or creating edges.

The default implementation in the `EdgeStyleBase` class only considers the polyline with thickness 1 when hit-testing. When edges have shapes that deviate from the polyline, hit-testing has to be adjusted by providing a different implementation for the `isHit` method.

In this example, we have to include the thickness of the edge visualization for the hit-test. We also take the hit-test radius into account. This radius enables a bit of fuzziness when hit-testing the item, so you can still hit it when you’re slightly outside.

```
protected isHit(
  context: IInputModeContext,
  location: Point,
  edge: IEdge
): boolean {
  const thickness = this.distance + 2
  const edgePath = super.getPath(edge)!
  return edgePath.pathContains(
    location,
    context.hitTestRadius + thickness * 0.5
  )
}
```

Note

Try this implementation by hovering both edges. Notice that the left edge, which uses the default hit-test, only detects hits in the center of the edge visualization. The right edge uses the adjusted hit-test code.

[08 Item Visibility](../../tutorial-style-implementation-edge/08-visibility/)
