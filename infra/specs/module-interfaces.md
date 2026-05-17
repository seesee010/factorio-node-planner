# Module Interfaces — factorio-flow

Every module uses ES6 named exports. No default exports except Preact components.
All imports use CDN URLs for external libs, relative paths for internal modules.

## CDN Imports (use these exact URLs)

```js
import { h, render, Fragment } from 'https://esm.sh/preact@10'
import { useState, useEffect, useRef, useMemo, useCallback, useReducer } from 'https://esm.sh/preact@10/hooks'
import htm from 'https://esm.sh/htm@3'
import { nanoid } from 'https://esm.sh/nanoid@5'
// v0.2 only:
import dagre from 'https://esm.sh/dagre@0.8'

const html = htm.bind(h)
```

---

## docs/graph/geometry.js

Pure math, no DOM, no Preact.

```js
export const NODE_WIDTH    = 220
export const HEADER_H      = 44
export const SOCKET_ROW_H  = 28
export const BODY_PAD_Y    = 12
export const SOCKET_R      = 5
export const JUNCTION_W    = 38
export const JUNCTION_H    = 64

// Returns { w, h } for a node
export function nodeSize(node)

// Returns the height of a card node body + header
export function nodeCardHeight(node)

// Returns { x, y } of socket relative to node origin
// side: "in" | "out", index: socket index
export function getSocketLocal(node, side, index)

// Returns { x, y } of socket in canvas coordinates
export function socketPos(node, side, index)

// Returns SVG path string for a cubic bezier edge
export function bezierPath(x1, y1, x2, y2)

// Format a throughput value: integer stays integer, else 1 decimal
export function formatVal(v)

// Returns the canvas coordinates from a mouse event + container element + pan/zoom
export function toCanvas(e, containerEl, pan, scale)
```

---

## docs/graph/node.js

Preact components for SVG node rendering.

```js
import { h } from 'https://esm.sh/preact@10'
import htm from 'https://esm.sh/htm@3'
import { getSocketLocal, nodeCardHeight, NODE_WIDTH, HEADER_H,
         SOCKET_ROW_H, BODY_PAD_Y, SOCKET_R,
         JUNCTION_W, JUNCTION_H } from './geometry.js'
import { ITEM_COLORS, ITEM_LABELS, STATE_STROKE } from '../icons.js'

// Renders a card-type node as SVG <g>
// Props: node, selected, onMouseDown(e, id), onDoubleClick(e, id)
export function NodeCard({ node, selected, onMouseDown, onDoubleClick })

// Renders a junction (splitter/merger) as SVG <g>
// Props: node, selected, onMouseDown(e, id), onDoubleClick(e, id)
export function NodeJunction({ node, selected, onMouseDown, onDoubleClick })

// Renders the correct node type (card or junction)
// Props: same as above
export function NodeView(props)

// Renders a placement ghost at cursor position when placing a new node
// Props: tool ("add-node"|"add-splitter"|"add-merger"), x, y
export function PlacementGhost({ tool, x, y })
```

---

## docs/graph/edge.js

Preact component for SVG edge rendering.

```js
import { h } from 'https://esm.sh/preact@10'
import htm from 'https://esm.sh/htm@3'
import { socketPos, bezierPath, formatVal } from './geometry.js'
import { STATE_STROKE, STATE_LABEL_FG } from '../icons.js'

// Renders a single edge as SVG <g> with bezier path + optional throughput label
// Props: edge, nodes[], showLabel (bool)
export function EdgeView({ edge, nodes, showLabel })

// Renders an in-progress wire being drawn (from socket to cursor)
// Props: fromNode, fromSocket (index), toX, toY (canvas coords)
export function WireGhost({ fromNode, fromSocket, toX, toY })
```

---

## docs/graph/canvas.js

The main graph canvas component.

```js
import { h } from 'https://esm.sh/preact@10'
import { useState, useRef, useEffect, useCallback, useMemo } from 'https://esm.sh/preact@10/hooks'
import htm from 'https://esm.sh/htm@3'
import { NodeView, PlacementGhost } from './node.js'
import { EdgeView, WireGhost } from './edge.js'
import { nodeSize, socketPos, toCanvas } from './geometry.js'

// The full SVG canvas with pan/zoom/drag/marquee/wire
// Props:
//   nodes[]            — node objects with x,y
//   edges[]            — edge objects
//   selectedIds[]      — currently selected node IDs
//   onSetSelectedIds(ids[])
//   onMoveNode(id, x, y)
//   onAddEdge(fromNodeId, fromSocket, toNodeId, toSocket)
//   onPlaceAt(tool, canvasX, canvasY)
//   onDoubleClickNode(id)
//   activeTool         — string
//   settings           — { grid, snap, edgeLabels }
//   viewRef            — { x, y, scale, tick } mutable ref
//   onViewChange()     — called when view changes
export default function Graph(props)
```

---

## docs/icons.js

Icon components + color/label maps.

```js
import { h } from 'https://esm.sh/preact@10'
import htm from 'https://esm.sh/htm@3'

// Color maps
export const ITEM_COLORS  // { "iron-ore": "#a85e24", ... }
export const ITEM_LABELS  // { "iron-ore": "iron ore", ... }
export const STATE_STROKE // { ok: "#2a8c2a", warning: "#cc6820", error: "#cc2828" }
export const STATE_LABEL_FG // { ok: "#7ec27e", warning: "#e0a060", error: "#e87878" }

// Icon components — each takes { size=22, color?, dim? }
export function SourceIcon(props)
export function FurnaceIcon(props)
export function AssemblerIcon(props)
export function OutputIcon(props)
export function UnconfiguredIcon(props)
export function SplitterIcon(props)
export function MergeIcon(props)

// Error/warning badge — used inside node card header area
// Props: kind ("error"|"warning")
export function BadgeBang({ kind })
```

---

## docs/flow/compute.js

Pure functions — no DOM, no Preact, no side effects.

```js
import { RECIPES } from './recipes.js'

// Main entry point: takes raw nodes + edges, returns enriched copies with flow state
// Does NOT mutate inputs.
// Returns: { nodes: Node[], edges: Edge[] }
export function computeFlow(nodes, edges)

// Topological sort (Kahn's algorithm)
// Returns node IDs in dependency order (parents before children)
export function topoSort(nodes, edges)

// Compute throughput for a single node given its input values
// Returns: { throughput, efficiency, status, issue, socketStates }
export function computeNode(node, inputValues, recipes)
```

---

## docs/flow/recipes.js

Static Factorio recipe database.

```js
// Recipe DB — keyed by recipe ID
export const RECIPES = {
  "iron-smelting": {
    input: "iron-ore",
    output: "iron-plate",
    machines: ["furnace", "electric-furnace", "steel-furnace"],
    time: 3.2,       // seconds
    inputCount: 1,
    outputCount: 1,
  },
  // ...
}

// Returns the recipe for a given (inputItem, outputItem, machineType) combo, or null
export function findRecipe(inputItem, outputItem, machineType)

// Returns all possible output items for a given input item + machine type
export function possibleOutputs(inputItem, machineType)
```

---

## docs/components/toolbar.js

```js
import { h } from 'https://esm.sh/preact@10'
import { useState, useEffect } from 'https://esm.sh/preact@10/hooks'
import htm from 'https://esm.sh/htm@3'

// The vertical (or horizontal) toolbar rail
// Props:
//   orientation         — "left" | "top"
//   activeTool          — string
//   setActiveTool(t)
//   hasSelection        — bool (any deletable nodes selected)
//   onDelete()
//   onUndo()
//   onRedo()
//   canUndo             — bool
//   canRedo             — bool
//   errorCount          — number
//   settings            — settings object
//   setSettings(patch)
export default function Toolbar(props)
```

---

## docs/components/sidebar.js

```js
import { h } from 'https://esm.sh/preact@10'
import htm from 'https://esm.sh/htm@3'

// Right sidebar panel
// Props:
//   selectedNode        — node object | null
//   errorNodes[]        — nodes with status "error" or "warning"
//   flow                — { oreIn, platesOut, efficiency }
//   sourceOutput        — number
//   setSourceOutput(n)
//   scale               — current zoom scale
//   onResetView()
//   multiSelectCount    — number
export default function Sidebar(props)
```

---

## docs/components/inspector.js

```js
import { h } from 'https://esm.sh/preact@10'
import { useState, useEffect } from 'https://esm.sh/preact@10/hooks'
import htm from 'https://esm.sh/htm@3'

// Floating node inspector popup
// Props:
//   node                — primary selected node
//   screenPos           — { x, y } in screen pixels (fixed positioning)
//   onClose()
//   onUpdateNode(patch) — apply patch to all selected nodes
//   multiCount          — number of selected nodes
export default function Inspector(props)
```

---

## docs/parsing/save.js

```js
// Serialize app state to the JSON file format
// Returns: string (pretty-printed JSON)
export function serializeGraph(nodes, edges, settings, layout = "exact")

// Trigger browser download of the JSON file
export function downloadGraph(nodes, edges, settings, filename = "flow.json", layout = "exact")
```

---

## docs/parsing/load.js

```js
// Parse a JSON file format string → { nodes, edges }
// Throws with a descriptive message if invalid
export function parseGraph(jsonString)

// Validate a parsed graph object
// Returns: { valid: bool, errors: string[] }
export function validateGraph(obj)
```

---

## docs/state.js

Shared constants and state shape helpers.

```js
// Default app state factory
export function createInitialState()

// Create a new node object with defaults filled in
// tool: "add-node"|"add-splitter"|"add-merger"
// x, y: canvas coordinates
export function makeNode(tool, x, y)

// Snap a value to grid (if snap enabled)
export function snapToGrid(v, enabled)

export const GRID_SIZE = 22
```

---

## docs/app.js

Root Preact component — ties everything together.

```js
import { h, render } from 'https://esm.sh/preact@10'
import { useState, useRef, useEffect, useMemo, useCallback } from 'https://esm.sh/preact@10/hooks'
import htm from 'https://esm.sh/htm@3'
import Graph from './graph/canvas.js'
import Toolbar from './components/toolbar.js'
import Sidebar from './components/sidebar.js'
import Inspector from './components/inspector.js'
import { computeFlow } from './flow/compute.js'
import { makeNode, createInitialState, snapToGrid } from './state.js'

// Root component — owns all state
function App()

// Mount to #root
render(h(App, null), document.getElementById('root'))
```

---

## index.html

Single entry point. Loads CSS first, then app.js as module.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>factorio-flow</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="docs/style/tokens.css">
  <link rel="stylesheet" href="docs/style/main.css">
  <link rel="stylesheet" href="docs/style/components.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="docs/app.js"></script>
</body>
</html>
```
