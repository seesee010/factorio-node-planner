# Agent Contracts — factorio-flow

## Orchestrator: Main Claude Code session
## Agents: 4 parallel + 1 sequential (Phase 1: style/graph/flow/ui → Phase 2: app-glue)

---

## Agent 1: style-agent
**Branch:** `feat/style`
**Owns:** `docs/style/tokens.css`, `docs/style/main.css`, `docs/style/components.css`
**Does NOT own:** any .js files, index.html

**Task:**
1. Implement `tokens.css` — all CSS custom properties from `infra/specs/design.md`
2. Implement `main.css` — global reset, body/html, layout grid (toolbar+canvas+sidebar+topbar), scrollbar styling, range input styling, button base styles, selection color
3. Implement `components.css` — all class-based styles for toolbar, sidebar, inspector (supplement inline styles used in Preact components)

**Rules:**
- NO inline styles in CSS (that's for JS components)
- CSS custom properties must use `--` prefix as in design.md
- Font: link tag is in index.html, just reference the family names
- No build step, no preprocessors
- Exact colors from design.md

**Definition of Done:**
- All three files exist with complete content
- Opening index.html (even without JS) shows the correct background color #0f0f0f
- No CSS syntax errors (validated by browser devtools)

---

## Agent 2: graph-agent
**Branch:** `feat/graph`
**Owns:** `docs/graph/geometry.js`, `docs/graph/node.js`, `docs/graph/edge.js`, `docs/graph/canvas.js`, `docs/icons.js`
**Does NOT own:** components, flow, parsing, index.html, app.js

**Task:**
1. `docs/icons.js` — all icon Preact components (SourceIcon, FurnaceIcon, AssemblerIcon, OutputIcon, UnconfiguredIcon, SplitterIcon, MergeIcon, BadgeBang) + color/label maps (ITEM_COLORS, ITEM_LABELS, STATE_STROKE, STATE_LABEL_FG)
2. `docs/graph/geometry.js` — pure geometry functions (nodeSize, nodeCardHeight, getSocketLocal, socketPos, bezierPath, formatVal, toCanvas)
3. `docs/graph/node.js` — NodeCard, NodeJunction, NodeView, PlacementGhost Preact SVG components
4. `docs/graph/edge.js` — EdgeView, WireGhost Preact SVG components
5. `docs/graph/canvas.js` — full Graph component with:
   - SVG canvas with dot-grid pattern
   - Pan (drag on empty canvas OR pan tool)
   - Zoom (wheel, 0.3–2.5)
   - Node drag (single + multi-selection drag)
   - Marquee select (shift+drag)
   - Wire tool: click output socket → drag → click input socket → fires onAddEdge
   - Placement ghost + onPlaceAt callback
   - Double-click node → onDoubleClickNode callback

**Rules:**
- All imports use exact CDN URLs from module-interfaces.md
- Internal imports use relative paths (e.g., `import { socketPos } from './geometry.js'`)
- SVG only inside the <svg> element — no HTML inside SVG
- Performance: use refs for pan/zoom (not useState) to avoid re-renders on every mousemove
- Wire tool UX: click output socket dot → blue bezier ghost follows cursor → click input socket dot → fires onAddEdge(fromNodeId, fromSocket, toNodeId, toSocket) → tool stays active
- Socket hit area: 10px radius circle (invisible) over each socket dot for easier clicking

**Tests:** `infra/tests/geometry.test.js` — test all pure functions in geometry.js with assert statements

**Definition of Done:**
- All 5 files exist with complete, working code
- geometry.test.js passes (all assertions green)
- Components export correct names matching module-interfaces.md

---

## Agent 3: flow-agent
**Branch:** `feat/flow`
**Owns:** `docs/flow/compute.js`, `docs/flow/recipes.js`
**Does NOT own:** anything else

**Task:**
1. `docs/flow/recipes.js` — Factorio recipe DB for all base-game smelting + basic crafting recipes, findRecipe(), possibleOutputs()
2. `docs/flow/compute.js` — computeFlow(), topoSort(), computeNode()

**Algorithm for computeFlow:**
1. Topological sort (Kahn's algorithm using parents/children on nodes)
2. For each node in topo order:
   - source: throughput = node.throughput (user-set) or 0
   - furnace: throughput = min(inputThroughput, machineCapacity); validate recipe
   - splitter: each output = input / numOutputs (or by ratio field)
   - merger: output = sum of inputs
   - target: status ok/warning based on whether it receives its target amount
3. Mark status: error if throughput < expected, warning if output has no consumer
4. Propagate: if a node is error, its downstream edges are error too
5. Return new node/edge arrays (deep copies — do not mutate inputs)

**Rules:**
- Pure functions ONLY — no DOM, no Preact, no side effects
- All CDN imports at top of file

**Tests:** `infra/tests/flow.test.js` — test with fixture graphs:
- Simple: source → furnace → target  (all ok)
- Bottleneck: source 60/m → furnace (needs 120/m) → target  (error)
- Split: source 240/m → splitter → [furnace1 120/m, furnace2 60/m cap] → merger → target  (warning/error mix)
- Invalid recipe: iron-ore source → furnace → copper-plate (error)

**Definition of Done:**
- Both files exist
- flow.test.js passes all assertions
- computeFlow returns correct status/efficiency/throughput for all fixture graphs

---

## Agent 4: ui-agent
**Branch:** `feat/ui`
**Owns:** `docs/components/toolbar.js`, `docs/components/sidebar.js`, `docs/components/inspector.js`
**Does NOT own:** graph, flow, parsing, icons, state, app, index.html

**Task:**
Implement the three UI component panels matching the design spec in `infra/specs/design.md` EXACTLY.

**1. toolbar.js:**
- All tools: select(V), pan(H), add-node(N), add-splitter(S), add-merger(M), wire(C)
- Undo/Redo buttons (disabled state shown, no logic needed)
- Delete button (disabled if nothing selected)
- Settings flyout (grid/snap/edgeLabels toggles, toolbar position radio)
- Menu flyout (file menu items — UI only, no actual file ops needed yet)
- Orientation: works as both left vertical rail and top horizontal rail
- Active tool indicator: left/bottom 2px #5878c8 bar
- Keyboard shortcut tooltips on hover

**2. sidebar.js:**
- Source output slider (60–480, step 60)
- Selected node panel (name, id, type, recipe, efficiency, issue panel)
- Errors list (errorNodes with ! badges)
- Flow summary (ore in, plates out, efficiency %)
- Bottom zoom display + reset view button

**3. inspector.js:**
- Floating popup (fixed position from screenPos prop)
- Header: node name + id/type + close button
- Two tabs: items / objects
- Items tab: iron-ore, copper-ore cards (colored dot + label + desc)
- Objects tab: furnace, assembler cards (header icon + label + desc)
- Click on card → calls onUpdateNode(patch) to apply preset
- ESC key closes
- Multi-select header variant: "N NODES — choose preset — applies to all"

**Rules:**
- Use `html` tagged template literals from htm
- Import icons from `../icons.js` (relative path)
- Reference CSS custom properties from tokens.css for colors
- Inline styles only for dynamic values (colors computed from props, positions)
- Static layout → CSS classes preferred

**Tests:** `infra/tests/ui-smoke.test.html` — renders each component in isolation and checks they mount without throwing

**Definition of Done:**
- All 3 files exist and export correct default function
- Components render without errors when given minimal valid props
- Visual output matches design.md spec

---

## Agent 5: app-agent (runs AFTER agents 1–4 complete)
**Branch:** `feat/app-glue`
**Owns:** `index.html`, `docs/app.js`, `docs/state.js`, `docs/parsing/save.js`, `docs/parsing/load.js`
**Does NOT own:** anything in docs/graph/, docs/components/, docs/flow/, docs/icons.js, docs/style/

**Task:**
Wire everything together into a working application.

1. `index.html` — per module-interfaces.md spec
2. `docs/state.js` — createInitialState(), makeNode(), snapToGrid(), GRID_SIZE
3. `docs/app.js` — root App component:
   - Imports all components and modules
   - Holds all state (nodes, edges, selectedIds, activeTool, settings, view, inspectorOpen)
   - Computes flow via computeFlow() on every state change (useMemo)
   - Computes inspector screen position (same logic as prototype)
   - Keyboard shortcuts handler (V/H/N/S/M/C/Escape/Delete)
   - handleMoveNode, handleAddEdge, handleDelete, handlePlaceAt, handleDoubleClickNode, handleUpdateNode
   - Topbar with live machine count, edge count, active tool hint
   - Layout offsets for toolbar orientation (left vs top)
   - Demo initial graph: same topology as prototype (src → split → f1/f2 → merge → out)
4. `docs/parsing/save.js` — serializeGraph(), downloadGraph()
5. `docs/parsing/load.js` — parseGraph(), validateGraph()

**Rules:**
- Must import from agent 1–4 files using EXACT paths from module-interfaces.md
- Demo initial graph uses 240/m source, F1_CAPACITY=120, F2_CAPACITY=60, SYSTEM_TARGET=240

**Tests:** `infra/tests/integration.test.html` — opens the app, checks:
1. Page loads without JS errors (window.onerror)
2. SVG canvas element exists
3. Default nodes render (6 nodes in demo)
4. Clicking a node sets selectedIds
5. Source slider change updates throughput display

**Definition of Done:**
- index.html opens in browser and shows the app
- All demo nodes visible
- Pan/zoom works
- Selecting a node updates the sidebar
- Source slider updates flow computation
- Inspector opens on double-click
