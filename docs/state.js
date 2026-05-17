import { nanoid } from 'https://esm.sh/nanoid@5'

export const GRID_SIZE = 22

export function snapToGrid(v, enabled) {
  if (!enabled) return v
  return Math.round(v / GRID_SIZE) * GRID_SIZE
}

export function createInitialState() {
  return {
    nodes: [],
    edges: [],
    selectedIds: [],
    activeTool: 'select',
    settings: { snap: false, toolbarPosition: 'left' },
    history: { past: [], future: [] },
  }
}

export function makeNode(tool, x, y) {
  const id = nanoid(8)
  if (tool === 'add-splitter') {
    return {
      id,
      kind: 'junction',
      type: 'splitter',
      name: 'SPLIT',
      x,
      y,
      inputs:  [{ item: null, flowState: 'ok' }],
      outputs: [{ item: null, flowState: 'ok' }, { item: null, flowState: 'ok' }],
      status: 'ok',
    }
  }
  if (tool === 'add-merger') {
    return {
      id,
      kind: 'junction',
      type: 'merger',
      name: 'MERGE',
      x,
      y,
      inputs:  [{ item: null, flowState: 'ok' }, { item: null, flowState: 'ok' }],
      outputs: [{ item: null, flowState: 'ok' }],
      status: 'ok',
    }
  }
  // generic unconfigured card node
  return {
    id,
    kind: 'card',
    type: 'unconfigured',
    name: 'NEW NODE',
    sublabel: '',
    header: '#1a1a1a',
    x,
    y,
    inputs:  [{ item: null, flowState: 'ok' }],
    outputs: [{ item: null, flowState: 'ok' }],
    status: 'ok',
  }
}
