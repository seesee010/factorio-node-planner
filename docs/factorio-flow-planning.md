# factorio-flow — planning doc

## stack

```
Vite + React + TypeScript (TSX)
@xyflow/react — node graph
nanoid — ID generation
dagre — auto-layout algorithmus
gh-pages — deploy
```

```bash
npm create vite@latest factorio-flow -- --template react-ts
cd factorio-flow
npm install @xyflow/react nanoid dagre
npm install -D gh-pages
```

---

## file format

zwei varianten, beide `.json`:

### exact (mit positionen) — `meinefactory.json` mit `"layout": "exact"`

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
    },
    "mN2qR7": {
      "kind": "obj",
      "type": "furnace",
      "x": 415,
      "y": 55,
      "parents": ["a3Kx9p"],
      "children": ["q7Ry2n"]
    }
  }
}
```

### compact (ohne positionen) — `meinefactory.json` mit `"layout": "auto"`

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
    },
    "mN2qR7": {
      "kind": "obj",
      "type": "furnace",
      "parents": ["a3Kx9p"],
      "children": ["q7Ry2n"]
    }
  }
}
```

### mit func/group

```json
{
  "version": 1,
  "layout": "auto",
  "capacity": 20,
  "funcs": {
    "Xk29mP": {
      "name": "iron-chain",
      "inputs": 2,
      "outputs": 1,
      "nodes": {
        "a3Kx9p": { "kind": "obj", "type": "furnace", "parents": [], "children": [] },
        "mN2qR7": { "kind": "obj", "type": "splitter", "parents": [], "children": [] }
      }
    }
  },
  "nodes": {
    "q7Ry2n": {
      "kind": "obj",
      "type": "func",
      "ref": "Xk29mP",
      "parents": ["b2Lm5k"],
      "children": ["p9Xm4k"]
    }
  }
}
```

### save/share dialog

```
standardmäßig: compact (kleiner, kein layout-chaos)
optional: exact (user will sein layout behalten)

save  → default: exact vorgeschlagen  → speichert als .json
share → default: compact vorgeschlagen → speichert als .json
settings → "always ask" / "always compact" / "always exact"

unterschied nur im "layout" field:
  exact:  "layout": "exact"  + x/y bei jedem node
  compact: "layout": "auto"  + kein x/y
```

### capacity / pre-allocation

```
dynamic array prinzip:
capacity startet bei 10
wenn nodes.length >= capacity → capacity verdoppeln
capacity wird im file gespeichert

beim laden: array mit capacity vorallozieren
→ verhindert constant resizing
```

### autosave

```
default: alle 5 minuten
einstellbar in settings
läuft via setInterval im hintergrund
save button → sofortiger save, kein warten
```

### IDs

```
nanoid() — random, url-safe, kurz
z.b.: "a3Kx9p", "mN2qR7", "Tz8wL1"
kein hash von content — pure random
→ keine kollisionen, keine abhängigkeit vom inhalt
```

---

## node types

### kind: "item"

```json
{
  "kind": "item",
  "type": "iron-ore",
  "parents": [],
  "children": ["mN2qR7"]
}
```

items: iron-ore, iron-plates, copper-ore, copper-plates,
coal, stone, wood, steel-plates, green-circuits, ...

### kind: "obj"

```json
{
  "kind": "obj",
  "type": "furnace",
  "parents": ["a3Kx9p"],
  "children": ["q7Ry2n"]
}
```

obj types:
- `furnace` — transformer, kein hardcoded recipe, schaut was reinkommt
- `splitter` — hat `ratio` field: `"1:2"`, `"1:3"`, custom
- `merge` — N inputs, 1 output, summe
- `balancer` — N inputs, M outputs, konfigurierbar
- `func` — referenziert einen func-block via `"ref": "Xk29mP"`

### func/group node

```json
"funcs": {
  "Xk29mP": {
    "name": "iron-chain",
    "inputs": 2,
    "outputs": 1,
    "nodes": { ... }
  }
}
```

- lila + glow visuell
- inputs/outputs: anzahl definiert, kein item-typ
- wiederverwendbar: beliebig oft im graph nutzbar
- änderung inside → updated sich überall
- unendlich nestbar (func in func in func...)

---

## edge / throughput system

### throughput propagation

```
graph traversal von links nach rechts
jeder node berechnet seinen output aus seinen inputs
bottleneck = wenn input < was node braucht
```

### furnace recipe validation

```
input item + output item → lookup in recipe DB
existiert rezept? → ok
existiert nicht? → alle connected edges rot
unbekannt (kein input)? → rot
```

### recipe DB

```json
{
  "iron-smelting": {
    "input": "iron-ore",
    "output": "iron-plates",
    "machines": ["furnace", "electric-furnace", "steel-furnace"]
  },
  "copper-smelting": {
    "input": "copper-ore",
    "output": "copper-plates",
    "machines": ["furnace", "electric-furnace", "steel-furnace"]
  }
}
```

einmal aus factorio extrahiert → liegt als JSON im projekt.
bei mod-support: user importiert eigene recipe-DB.

---

## color system

```
grau        nicht verbunden / floating
grün        throughput ok, valid recipe
rot         bottleneck oder invalid recipe
orange      output ohne consumer (würde overflow/stopp)
lila        func/group node (+ glow effect)
gestrichelt collapsed verbindung (ausgeklappter graph)
blau        selected node (border highlight)
```

### error propagation

```
fehler propagiert vorwärts UND rückwärts:
furnace 2 hat problem
→ merge bekommt weniger → orange/rot
→ output bekommt weniger → rot
→ zeigt exakt welche nodes betroffen sind
```

### orange = warning nicht fehler

```
node produziert aber niemand konsumiert output
→ nicht rot (kein fehler) sondern orange (warning)
usecase: user checkt "wieviel brauche ich für X"
         ohne den ganzen graph weiterzubauen
```

---

## gap analyzer (phase 2)

```
user gibt ein: "ich will 120/m iron plates"
tool zeigt:

iron plates    brauchst 120/m   hast 60/m    → −60/m   (+1 furnace)
iron ore       brauchst 120/m   hast 120/m   → ok

direkt am node angezeigt:
→ node wird rot
→ zeigt "+1 furnace um target zu erreichen"
```

### target node

```json
{
  "kind": "obj",
  "type": "target",
  "item": "iron-plates",
  "amount": 120,
  "unit": "min",
  "parents": ["q7Ry2n"],
  "children": []
}
```

---

## auto-builder (phase 3)

```
user gibt ein:
  - endprodukt: "science pack 3"
  - menge: 60/min
  - verfügbare maschinen: [furnace, assembler-1]

tool baut automatisch kompletten graph auf:
  recursive recipe solver rückwärts vom endprodukt
  berechnet benötigte mengen pro node
  platziert nodes via dagre
  zeigt sofort wo bottlenecks wären
```

---

## blueprint import (phase 2-3)

```
factorio blueprint string format:
"0" + base64( zlib_compress( JSON ) )

browser: pako library für zlib
→ blueprint string einfügen → graph wird aufgebaut

usecase:
1. factory in factorio bauen
2. blueprint exportieren
3. in factorio-flow einfügen
4. gap-analyzer zeigt was fehlt
```

---

## units

```
default: /min (factorio-nativ)
toggle: /sec
global setting, alle edge-labels rechnen um
```

---

## mod support

```
website phase:
  user importiert eigene recipe-DB als .json
  icons: aus factoriolab/community repos (kein upload nötig)

mod phase:
  läuft inside factorio
  zugriff auf data.raw → alle recipes automatisch
  inkl. aller aktiven mods (krastorio, space exploration, angelsbobs...)
  icons direkt aus dem spiel
  null extra arbeit — spiel liefert alles
```

---

## visual style

```
dark industrial aesthetic
keine rounded corners (rx=0 oder rx=1 max)
canvas bg: #161616 mit dot-grid (22px, #212121)

node card:        #1c1c1c, border 1px #2a2a2a
node header:      44px, colored by machine type
  furnace:        #181408
  splitter/merge: #12142a
  source:         #182210
  output:         #0c1e12
  func/group:     lila #2a1a4a + glow

socket dots:      r=5, fill #141414, stroke = item color
  iron ore:       #a85e24
  iron plates:    #687080
  copper ore:     #8B4513
  copper plates:  #b87333
  green circuits: #3a7a3a

edges:            bezier, stroke-width 2
  ok:             #2a8c2a
  bottleneck:     #cc2828
  warning:        #cc6820
  gestrichelt:    grau, dashed

selected:         border 1.5px #5878c8
error badge:      circle top-right, #cc1c1c, weißes ! (line + dot)
warning badge:    circle top-right, #aa7010
```

---

## deployment

```bash
# vite.config.ts
export default { base: '/factorio-flow/' }

# package.json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

npm run deploy → live auf username.github.io/factorio-flow
```

---

## roadmap

```
v0.1 — manueller node editor
  - nodes platzieren (hardcoded recipe types)
  - connections ziehen
  - throughput propagation
  - grün/rot coloring
  - json save/load (.json)

v0.2 — recipe database + polish
  - komplette factorio recipe DB
  - item icons (aus factoriolab/community repos, kein upload)
  - gap analyzer (target node)
  - auto-layout (dagre)
  - compact/exact save dialog
  - autosave

v0.3 — advanced features
  - func/group nodes
  - blueprint import (pako)
  - auto-builder (recursive solver)
  - mod support (custom recipe DB als .json importieren)
  - share via URL (graph encoded in URL)

mod — factorio integration
  - alles von v0.3
  - live data aus dem spiel via data.raw
  - automatisch alle aktiven mods (krastorio, space ex, angelsbobs...)
  - icons direkt aus dem spiel
  - kein browser nötig
```
