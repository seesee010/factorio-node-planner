# Design Spec — factorio-flow

Extracted from the prototype in `docs/Node Graph test-handoff.zip`.
All visual output MUST match this spec exactly.

## Fonts

```
Primary (UI): Inter, system-ui, sans-serif
Monospace (all labels, numbers, code): JetBrains Mono, ui-monospace, monospace
```

Load via:
```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

## Color Tokens

### Backgrounds
```
--bg-root:         #0f0f0f   (html, body)
--bg-canvas:       #161616   (graph canvas)
--bg-rail:         #121212   (toolbar rail, sidebar)
--bg-topbar:       rgba(15,15,15,0.92)
--bg-node:         #1c1c1c   (node card fill)
--bg-node-header-furnace:   #181408
--bg-node-header-splitter:  #12142a
--bg-node-header-source:    #182210
--bg-node-header-output:    #0c1e12
--bg-node-header-unconf:    #1a1a1a
--bg-node-header-error:     reddish variant, see node specs
--bg-flyout:       #101010   (menus, inspector)
--bg-flyout-tabs:  #0c0c0c
--bg-btn-active:   #191919
--bg-btn-hover:    #161616
--bg-tooltip:      #0a0a0a
--bg-error-panel:  #1f0c0c
--bg-warning-panel:#1f1808
--bg-item-card:    #141414
--bg-item-hover:   #181818
```

### Borders
```
--border-panel:    #1e1e1e   (panel dividers, most borders)
--border-node:     #2a2a2a   (default node border)
--border-node-error: #501818
--border-node-sel: #5878c8   (1.5px when selected)
--border-subtle:   #262626
--border-faint:    #202020   (edge label bg border)
```

### Text
```
--text-bright:     #e6e6e6   (primary labels, node names)
--text-normal:     #c8c8c8   (body text, icon hover)
--text-socket:     #b0b0b0   (socket item labels)
--text-mid:        #7a7a7a   (icon default, sublabels)
--text-dim:        #6a6a6a   (sidebar secondary)
--text-faint:      #5a5a5a   (topbar hints, icon colors)
--text-ghost:      #4a4a4a   (junction ID labels)
--text-invisible:  #3a3a3a   (separators in topbar)
--text-dead:       #383838   (section headers in sidebar)
--text-disabled:   #333333   (disabled buttons)
--text-neardead:   #3a3a3a   (menu keyboard hints)
```

### State / Flow Colors
```
--state-ok-edge:    #2a8c2a
--state-ok-text:    #3a9c3a
--state-ok-label:   #7ec27e
--state-err-edge:   #cc2828
--state-err-badge:  #cc1c1c
--state-err-label:  #e87878
--state-err-panel-border: #cc1c1c
--state-warn-edge:  #cc6820
--state-warn-badge: #aa7010
--state-warn-label: #e0a060
--state-warn-panel-border: #aa7010
```

### Selection / Accent
```
--accent:          #5878c8   (selection, active tool, focus)
```

### Item Colors (socket dots + edge tinting)
```
--item-iron-ore:     #a85e24
--item-iron-plate:   #687080
--item-copper-ore:   #8B4513
--item-copper-plate: #b87333
--item-green-circuit:#3a7a3a
--item-gear:         #8a8060
--item-unknown:      #666666
```

## Typography Scale

All sizes in px, family = JetBrains Mono unless noted:

| Usage                          | Size  | Weight | Letter-spacing |
|-------------------------------|-------|--------|----------------|
| Node name (header)             | 11.5  | 600    | 0.04em         |
| Node sublabel                  | 10    | 400    | 0.02em         |
| Socket item label              | 10.5  | 400    | —              |
| Node footer                    | 9.5   | 400    | 0.08em         |
| Junction ID below shape        | 9     | 400    | 0.1em          |
| Edge throughput label          | 10    | 500    | —              |
| Sidebar section header         | 10    | 400    | 0.12em         |
| Sidebar KV key                 | 10.5  | 400    | —              |
| Sidebar KV value               | 11    | 400    | —              |
| Sidebar source number          | 18    | 400    | —              |
| Sidebar title                  | 11    | 400    | 0.08em         |
| Sidebar title sub              | 9.5   | 400    | 0.04em         |
| Topbar mode/hints              | 10.5  | 400    | 0.06em         |
| Topbar mode name               | 10.5  | 400    | 0.06em (NODE_EDIT bright) |
| Menu heading                   | 9     | 400    | 0.14em (uppercase) |
| Menu item                      | 11    | 400    | 0.02em         |
| Inspector node name            | 13    | 600    | 0.06em         |
| Inspector node type            | 9.5   | 400    | 0.12em (uppercase) |
| Toolbar tooltip label          | 10.5  | 400    | 0.04em         |
| Toolbar tooltip shortcut       | 9.5   | 400    | —              |
| Error badge item label         | 10.5  | 400    | —              |
| Error badge item issue         | 9.5   | 400    | — (line-height 1.35) |

## Layout Dimensions

```
RAIL_W = 52px          (toolbar rail width/height)
BTN_H  = 40px          (toolbar button height)
TOPBAR_H = 36px        (top bar height)
SIDEBAR_W = 188px      (right sidebar)
INSPECTOR_W = 280px    (floating inspector popup)

NODE_WIDTH  = 220px
HEADER_H    = 44px
SOCKET_ROW_H = 28px
BODY_PAD_Y  = 12px     (top + bottom padding inside node body)
SOCKET_R    = 5px      (socket circle radius)
SOCKET_INNER_R = 1.5px (inner colored dot)

JUNCTION_W  = 38px
JUNCTION_H  = 64px

GRID_SPACING = 22px
GRID_DOT_SIZE = 1.5x1.5 px
GRID_DOT_COLOR = #363636
```

## Node Card Visual Spec

### Card structure (NodeCard)
```
┌──────────────────────────────────────────┐ ← border: 1px #2a2a2a (normal), 1.5px #5878c8 (selected), #501818 (error)
│ [ICON 22x22] NAME              badge?    │ ← header 44px, fill = header color
│              sublabel                    │
├──────────────────────────────────────────┤ ← divider #262626
│ ● input-label        output-label ●      │ ← body, BODY_PAD_Y=12 top+bottom
│   (each row 28px tall)                   │   sockets: circle r=5 + inner dot r=1.5
└──────────────────────────────────────────┘
│ footer text (centered, 9.5px, #7a7a7a)   │ (optional)
└──────────────────────────────────────────┘
```

- Overall fill: #1c1c1c
- Header fill: varies by type (see token list above)
- Error state: border changes to #501818, header fill switches to headerError variant
- Badge (error/warning): circle r=8 at (NODE_WIDTH-14, 14), red/orange fill, white ! exclamation
  - Line: rect -0.75 to 0.75, y -4.5, height 5
  - Dot:  rect -0.75 to 0.75, y 2.5, height 1.5
- Icon: 22x22, positioned at x=12, y=(HEADER_H/2 - 11) from header top

### Socket dot spec
```
outer circle: r=5, fill=#141414, stroke=STATE_STROKE[flowState] at 1.5px
inner dot:    r=1.5, fill=ITEM_COLOR[item]
```

### Junction (NodeJunction) — splitter/merger triangles
```
Splitter: M 0 H/2  L W 0  L W H  Z     (point left → base right)
Merger:   M 0 0    L W H/2 L 0 H  Z    (base left → point right)
Fill: #12142a
Stroke (normal):   #3a4070, 1px
Stroke (selected): #5878c8, 1.5px
Label below: tiny ID "SPLIT"/"MERGE" at (W/2, H+12), 9px, #4a4a4a
```

### Edge
```
Path: cubic bezier
dx = max(abs(x2-x1)*0.45, 40)
M x1 y1 C (x1+dx) y1, (x2-dx) y2, x2 y2

stroke-width: 2
color: STATE_STROKE[state]  (ok=#2a8c2a, warning=#cc6820, error=#cc2828)

Throughput label (midpoint of endpoints):
  background rect: fill=#161616, stroke=#202020 1px
  width: max(40, text.length*6.6+10), height: 14
  text: 10px JetBrains Mono, fill=STATE_LABEL_FG[state]
  format: "120/m" or "60.5/m"
```

## Toolbar Spec

### Tool buttons
```
Active:   bg #191919, border-left 2px #5878c8 (vertical rail) or border-bottom (horizontal)
Hover:    bg #161616
Disabled: bg transparent, icon color #333333
Default:  bg transparent, icon color #7a7a7a

Tooltip: bg #0a0a0a, border 1px #1e1e1e, padding 5px 9px
  Appears: to the right (vertical rail) or below (horizontal rail)
```

### Error count badge in rail
```
5x5px square, color #aa7010, with count text beside it
```

### Menu flyout
```
width: 220px
From top of rail (start)
Sections: File, Export, Help
bg #101010, border #1e1e1e (left border removed when attached to left rail)
```

### Settings flyout
```
width: 240px
From bottom of rail (end)
Toggle rows + radio rows
Toggle: 22x12px pill, active bg #5878c8, inactive #262626
  thumb: 10x10px bg #0f0f0f, moves left(1px) or right(11px)
```

## Sidebar Spec

```
width: 188px, right edge, full height
bg: #121212, left border: 1px #1e1e1e

Title bar: padding 14px 14px 10px
  "FLOW.001"  — 11px, #c8c8c8, 0.08em
  "iron plate line" — 9.5px, #4a4a4a, 0.04em

Sections (separated by border-bottom 1px #1e1e1e, padding 14px 14px 16px):
  Header: 10px JetBrains Mono #383838 uppercase 0.12em letterSpacing

Section: Source output
  Value: 18px #e6e6e6 + unit "/min" 10px #6a6a6a
  Slider: custom range (see tokens.css for track/thumb styling)
  Range: 60-480, step 60

Section: Selected
  Node name: 11.5px #e6e6e6
  Type line: 10px #6a6a6a  "#id · type"
  KV rows: key 10.5px #6a6a6a / value 11px #c8c8c8
  Issue panel: padding 7px 8px, left border 2px colored, 10px body text

Section: Errors
  Each error: "!" in red/orange + name + issue text (9.5px, 1.35 line-height)

Section: Flow
  KV rows for ore in / plates out / efficiency

Bottom bar: zoom % + reset view button
```

## Inspector Spec

```
width: 280px, floating (fixed position, not in flow)
bg: #101010, border: 1px #2a2a2a
shadow: 0 12px 32px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(88,120,200,0.05)

Header: node name 13px 600 #e6e6e6 / "#id · type" 9.5px #3a3a3a uppercase
Close button: 32px wide, borderLeft 1px #1e1e1e, "×" 12px #5a5a5a → #c8c8c8 on hover

Tabs: items / objects
  Active tab: bg #101010, bottom border 1.5px #5878c8, text #e6e6e6
  Inactive: bg transparent, text #5a5a5a
  Tab bar bg: #0c0c0c

Library cards:
  bg #141414, border 1px #1e1e1e, padding 8px 10px
  Hover: border #2a2a2a, bg #181818
  Item icon: 18x18px box (bg #0c0c0c, border #1e1e1e) with 8x8 colored square
  Object icon: 28x24px header-colored box with machine icon

Footer hint: 9px #383838
```

## Canvas / Graph Spec

```
bg: #161616
Grid: <pattern> 22px, dot 1.5x1.5 fill=#363636

Pan: drag on empty canvas (default tool = select acts as pan on canvas drag)
     or explicit 'pan' tool
Zoom: wheel, range 0.3–2.5, centered on cursor

Selection box (marquee): shift+drag
  fill: #5878c8 at 7% opacity
  stroke: #5878c8, 1px, dashed 4/3

Cursor states:
  default:    'grab'  (canvas in select mode, hint that drag pans)
  pan tool:   'grab'
  panning:    'grabbing'
  marquee:    'crosshair'
  placing:    'crosshair'
  node hover: 'grab'
```

## Topbar Spec

```
height: 36px
bg: rgba(15,15,15,0.92), border-bottom: 1px #1e1e1e
font: JetBrains Mono 10.5px #5a5a5a 0.06em

Content (left to right):
  "NODE_EDIT"  — #c8c8c8
  "·"          — #383838
  "graph / flow.001" — dim
  "·"          — #383838
  "{n} machines"
  "·"          — #383838
  "{n} links"
  [flex spacer]
  When tool active (not select): "● tool: {toolname}" in #5878c8 + "esc to exit" in #5a5a5a
  When select: "drag canvas to pan · shift+drag to marquee · dbl-click node to edit"
```

## Placement Ghost

When placing a node/splitter/merger, show a dashed ghost at cursor:
- Node: 220 × (HEADER_H + BODY_PAD_Y*2 + SOCKET_ROW_H) rect with header divider line
- Splitter/Merger: triangle outline
- Stroke: #5878c8, dashed "3 2", opacity 0.55, pointerEvents: none

## Keyboard Shortcuts

```
V — select tool
H — pan tool
N — add node
S — add splitter
M — add merger
C — wire/connect tool
Escape — exit tool / close inspector / deselect
Delete/Backspace — delete selected (extra nodes only)
⌘Z — undo (stub)
⇧⌘Z — redo (stub)
```
