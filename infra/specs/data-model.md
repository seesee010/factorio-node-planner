# Data Model — factorio-flow

## Runtime Node Shape (in-memory)

```js
{
  // --- identity ---
  id: "a3Kx9p",          // nanoid() string, unique
  kind: "card",           // "card" | "junction"
  type: "furnace",        // see Node Types below

  // --- graph topology ---
  parents:  ["b2Lm5k"],  // IDs of nodes whose output feeds into this node's inputs
  children: ["q7Ry2n"],  // IDs of nodes this node feeds into

  // --- position (canvas coordinates) ---
  x: 480,
  y: 100,

  // --- display (card nodes) ---
  name:     "FURNACE 01",
  sublabel: "smelter · stone",
  header:   "#181408",        // CSS color string for header background
  headerError: "#1a0d08",     // optional: override header color when errored
  icon:     FurnaceIcon,      // Preact component reference
  dimIcon:  false,            // dim the icon (broken machine visual)
  footer:   null,             // optional footer text (e.g. "target 240/m")

  // --- sockets ---
  inputs:  [{ item: "iron-ore",   flowState: "ok" }],
  outputs: [{ item: "iron-plate", flowState: "error" }],
  //   item: string key from ITEM_COLORS map, or null if unconnected
  //   flowState: "ok" | "warning" | "error"

  // --- flow state (computed by flow/compute.js) ---
  status:     "error",        // "ok" | "warning" | "error"
  issue:      "under-fed: 60/m, needs 120/m",  // null or string
  efficiency: 50,             // 0-100 integer, null if N/A
  throughput: 60,             // numeric output value, null if N/A

  // --- splitter-specific ---
  ratio: "1:2",               // only on type="splitter"

  // --- func/group-specific (v0.3) ---
  ref: null,                  // func block ID if type="func"
}
```

## Node Types

### kind: "card"
| type           | header       | inputs      | outputs      | notes                          |
|----------------|-------------|-------------|--------------|-------------------------------|
| `source`       | #182210     | []          | [item]       | raw material input             |
| `furnace`      | #181408     | [item]      | [item]       | smelter, no hardcoded recipe   |
| `assembler`    | #12142a     | [item...]   | [item]       | crafter                        |
| `target`       | #0c1e12     | [item]      | []           | output terminal + gap target   |
| `unconfigured` | #1a1a1a     | [item?]     | [item?]      | newly placed, not yet set up   |
| `func`         | #2a1a4a     | [...]       | [...]        | v0.3 — references a func block |

### kind: "junction"
| type       | fill    | stroke   | inputs      | outputs        |
|------------|---------|----------|-------------|----------------|
| `splitter` | #12142a | #3a4070  | 1 (center left) | 2 (top-right + bottom-right) |
| `merger`   | #12142a | #3a4070  | 2 (top-left + bottom-left) | 1 (center right) |
| `balancer` | #12142a | #3a4070  | N           | M              |

## Edge Shape (in-memory)

```js
{
  id: "e_a3Kx9p_mN2qR7",    // "e_{fromId}_{toId}_{fromSocket}_{toSocket}"
  from: { nodeId: "a3Kx9p", socket: 0 },  // output socket index
  to:   { nodeId: "mN2qR7", socket: 0 },  // input socket index
  value: 120,                              // throughput value (computed)
  state: "ok",                             // "ok" | "warning" | "error"
}
```

## App State Shape

```js
{
  // graph data
  nodes: Node[],
  edges: Edge[],

  // interaction
  selectedIds: string[],      // node IDs
  activeTool: "select",       // "select"|"pan"|"add-node"|"add-splitter"|"add-merger"|"wire"
  wireState: null,            // null | { fromNodeId, fromSocket } — in-progress wire drag

  // view transform
  view: { x: 0, y: 0, scale: 1 },

  // settings
  settings: {
    grid: true,
    snap: false,
    edgeLabels: true,
    toolbarSide: "left",      // "left" | "top"
    unit: "min",              // "min" | "sec"
    autosave: true,
    autosaveInterval: 300,    // seconds
  },

  // inspector
  inspectorOpen: false,

  // computed (from flow/compute.js — not stored, derived)
  // accessed via computeFlow(nodes, edges) → { nodes with flow state, edges with state }
}
```

## JSON File Format (save/load)

### Exact layout (saves x/y positions)
```json
{
  "version": 1,
  "layout": "exact",
  "capacity": 20,
  "funcs": {},
  "nodes": {
    "a3Kx9p": {
      "kind": "item",
      "type": "iron-ore",
      "x": 40,
      "y": 175,
      "parents": [],
      "children": ["mN2qR7"]
    }
  }
}
```

### Auto layout (no positions — uses dagre)
```json
{
  "version": 1,
  "layout": "auto",
  "capacity": 20,
  "funcs": {},
  "nodes": {
    "a3Kx9p": {
      "kind": "item",
      "type": "iron-ore",
      "parents": [],
      "children": ["mN2qR7"]
    }
  }
}
```

### capacity
- Starts at 10, doubles when `nodes.length >= capacity`
- Pre-allocates array capacity to prevent constant resizing

## Items (socket item types)

```js
const ITEMS = {
  "iron-ore":       { label: "iron ore",      color: "#a85e24" },
  "iron-plate":     { label: "iron plates",   color: "#687080" },
  "copper-ore":     { label: "copper ore",    color: "#8B4513" },
  "copper-plate":   { label: "copper plates", color: "#b87333" },
  "green-circuit":  { label: "green circuits",color: "#3a7a3a" },
  "gear":           { label: "gears",         color: "#8a8060" },
  // more to be added in v0.2 with full Factorio recipe DB
}
```

## Flow State Computation

Inputs: nodes[], edges[]
Output: same nodes[] and edges[] with .status, .issue, .efficiency, .throughput, and socket .flowState filled in

Algorithm (graph traversal left → right, i.e. topological sort):
1. Topological sort of nodes by dependency (parents before children)
2. For each node in order: compute output throughput from input throughput
3. Propagate bottlenecks forward and backward
4. Set .status:
   - "error"   if throughput < required (bottleneck, invalid recipe)
   - "warning" if output has no consumer (would overflow)
   - "ok"      otherwise

### Furnace recipe validation
- Input item + output item → lookup in recipes.js
- Valid recipe found → ok
- No recipe for this combo → all edges red, status error
- No input connected → status gray (not connected)

### Splitter
- Output[0] = output[1] = input[0] / 2  (equal split by default)
- ratio field overrides: "1:2" → output[0] = input/3, output[1] = input*2/3

### Merger
- output[0] = sum of all inputs
