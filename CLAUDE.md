# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Overview

**Project Name:** factorio-flow
**Tech Stack:** Vanilla HTML/CSS/JS — ES6 modules, Preact + htm via ESM CDN, SVG graph canvas
**Purpose:** A web-based Factorio factory flow planner. Users build node graphs of machines (furnace, splitter, merger, etc.), connect them, and see live throughput propagation + bottleneck detection. Hosted on GitHub Pages, zero build step.

## No Build Step

This project has NO npm, NO Vite, NO TypeScript compiler, NO bundler.
- Everything is plain `.js` (ES6 modules), `.css`, `.html`
- Preact + htm loaded from `https://esm.sh/preact` and `https://esm.sh/htm/preact`
- Served directly from GitHub Pages (root of main branch)
- `index.html` is the single entry point at the repo root

## Directory Structure

```
/
├── index.html                # app entry point
├── pic/                      # SVG/PNG icons and images
├── infra/                    # orchestration only (NOT deployed, NOT part of the site)
│   ├── specs/                # shared contracts between agents
│   └── status/               # agent work status tracking
└── docs/
    ├── style/
    │   ├── tokens.css        # design tokens (colors, sizes, fonts)
    │   ├── main.css          # resets, layout, topbar
    │   └── components.css    # toolbar, sidebar, inspector styles
    ├── graph/
    │   ├── geometry.js       # pure functions: socketPos, bezierPath, nodeSize
    │   ├── node.js           # NodeCard + NodeJunction SVG renderers (Preact)
    │   ├── edge.js           # EdgeView SVG renderer (Preact)
    │   └── canvas.js         # Graph host: pan/zoom/drag/marquee/wire
    ├── components/
    │   ├── toolbar.js        # LeftToolbar (vertical or horizontal rail)
    │   ├── sidebar.js        # Sidebar (right panel)
    │   └── inspector.js      # NodeInspector (floating popup)
    ├── flow/
    │   ├── compute.js        # throughput propagation, bottleneck detection
    │   └── recipes.js        # Factorio recipe DB (JSON)
    ├── parsing/
    │   ├── save.js           # serialize app state → JSON file
    │   └── load.js           # deserialize JSON → app state
    ├── icons.js              # SVG icon components (FurnaceIcon, etc.)
    ├── state.js              # app state shape + helpers
    └── app.js                # root Preact component, wires everything
```

## Tech Decisions

- **Preact + htm**: Component model without build step. Import from ESM CDN.
  ```js
  import { h, render } from 'https://esm.sh/preact'
  import { useState, useEffect, useRef, useMemo, useCallback } from 'https://esm.sh/preact/hooks'
  import htm from 'https://esm.sh/htm'
  const html = htm.bind(h)
  ```
- **State**: Top-level App component holds all state (useState/useReducer). Props drill down.
- **Graph canvas**: Direct SVG rendering inside Preact JSX (no @xyflow/react).
- **Styling**: CSS custom properties in `tokens.css`, no CSS-in-JS.
- **IDs**: `nanoid` from ESM CDN for node IDs.
- **Layout**: `dagre` from ESM CDN for auto-layout (v0.2).

## Design System

Full design tokens in `infra/specs/design.md` and `docs/style/tokens.css`.
Key constraint: visual output MUST match the prototype in `docs/Node Graph test-handoff.zip` **pixel-perfectly**.
Dark industrial aesthetic, JetBrains Mono + Inter fonts, no rounded corners.

## Agent Architecture

This project uses a multi-agent orchestration pattern:
- **Orchestrator**: Main Claude Code session (this session)
- **Subagents**: Each owns a specific domain, works on its own branch
- Agent contracts and interfaces: `infra/specs/`
- Agent status: `infra/status/`

See `infra/specs/agent-contracts.md` for agent division and interfaces.

## Coding Conventions

- Language: JavaScript (ES6 modules, no TypeScript)
- No comments unless the WHY is non-obvious
- Formatter: none enforced (consistent 2-space indent)
- Branch naming: `feat/`, `fix/`, `chore/`
- Commit style: Conventional Commits (`feat:`, `fix:`, `chore:`)

## Key Constraints

- NEVER add a build step (no npm install, no webpack, no Vite)
- NEVER commit `.env*` files
- NEVER use rounded corners (rx=0 on SVG rects) — design spec
- ALL imports must be absolute CDN URLs or relative paths from the repo root
- CSS classes over inline styles where reusable; inline styles for dynamic values only
- Keep functions small and focused
- Each module exports named functions/components — no default exports except Preact components

## Testing

- Pure functions (geometry, flow compute): simple test harness in `infra/tests/`
- Test runner: plain `<script type="module">` that logs pass/fail to console
- Run by opening `infra/tests/index.html` in browser or via `node --input-type=module`
- UI smoke tests: verify components render without throwing

## Important Notes

- `infra/` is NEVER deployed — it's orchestration infrastructure only
- `docs/` is the JS/CSS source (confusingly named — GitHub Pages serves from root, not from docs/)
- `pic/` for all raster/vector assets
- When in doubt about scope, check `infra/specs/` first
