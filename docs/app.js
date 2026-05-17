import { h, render } from 'https://esm.sh/preact@10'
import { useState, useRef, useEffect, useMemo, useCallback } from 'https://esm.sh/preact@10/hooks'
import htm from 'https://esm.sh/htm@3'
const html = htm.bind(h)
import { nanoid } from 'https://esm.sh/nanoid@5'

import Graph    from './graph/canvas.js'
import Toolbar  from './components/toolbar.js'
import Sidebar  from './components/sidebar.js'
import Inspector from './components/inspector.js'

import { computeFlow } from './flow/compute.js'
import { makeNode, snapToGrid } from './state.js'

// ---------------------------------------------------------------------------
// Demo topology (6 nodes, pre-wired iron-plate line)
// ---------------------------------------------------------------------------

function buildDemo() {
  // Positions calculated for perfect socket alignment:
  // src.out[0]=(300,272), split.in[0]=(380,272), split.out[0]=(418,240), split.out[1]=(418,304)
  // f1.in=(470,240), f1.out=(690,240), f2.in=(470,304), f2.out=(690,304)
  // merge.in[0]=(740,240), merge.in[1]=(740,304), merge.out=(778,272)
  // out.in=(820,272)
  const src = {
    id: 'src', kind: 'card', type: 'source',
    name: 'IRON ORE', sublabel: 'raw material · ore',
    header: '#182210',
    x: 80, y: 202,
    throughput: 240,
    inputs: [],
    outputs: [{ item: 'iron-ore', flowState: 'ok' }],
    status: 'ok',
  }
  const split = {
    id: 'split', kind: 'junction', type: 'splitter',
    name: 'SPLIT',
    x: 380, y: 240,
    inputs:  [{ item: 'iron-ore', flowState: 'ok' }],
    outputs: [{ item: 'iron-ore', flowState: 'ok' }, { item: 'iron-ore', flowState: 'ok' }],
    status: 'ok',
  }
  const f1 = {
    id: 'f1', kind: 'card', type: 'furnace',
    name: 'FURNACE', sublabel: 'smelter · stone',
    header: '#181408',
    x: 470, y: 170,
    inputs:  [{ item: 'iron-ore',   flowState: 'ok' }],
    outputs: [{ item: 'iron-plate', flowState: 'ok' }],
    status: 'ok',
  }
  const f2 = {
    id: 'f2', kind: 'card', type: 'furnace',
    name: 'FURNACE', sublabel: 'smelter · stone',
    header: '#181408',
    x: 470, y: 234,
    inputs:  [{ item: 'iron-ore',   flowState: 'ok' }],
    outputs: [{ item: 'iron-plate', flowState: 'ok' }],
    status: 'ok',
  }
  const merge = {
    id: 'merge', kind: 'junction', type: 'merger',
    name: 'MERGE',
    x: 740, y: 240,
    inputs:  [{ item: 'iron-plate', flowState: 'ok' }, { item: 'iron-plate', flowState: 'ok' }],
    outputs: [{ item: 'iron-plate', flowState: 'ok' }],
    status: 'ok',
  }
  const out = {
    id: 'out', kind: 'card', type: 'output',
    name: 'OUTPUT', sublabel: 'iron plates',
    header: '#0c1e12',
    x: 820, y: 202,
    inputs:  [{ item: 'iron-plate', flowState: 'ok' }],
    outputs: [],
    status: 'ok',
  }

  const edges = [
    { id: 'e1', from: { nodeId: 'src',   socket: 0 }, to: { nodeId: 'split', socket: 0 }, state: 'ok', value: 0 },
    { id: 'e2', from: { nodeId: 'split', socket: 0 }, to: { nodeId: 'f1',    socket: 0 }, state: 'ok', value: 0 },
    { id: 'e3', from: { nodeId: 'split', socket: 1 }, to: { nodeId: 'f2',    socket: 0 }, state: 'ok', value: 0 },
    { id: 'e4', from: { nodeId: 'f1',    socket: 0 }, to: { nodeId: 'merge', socket: 0 }, state: 'ok', value: 0 },
    { id: 'e5', from: { nodeId: 'f2',    socket: 0 }, to: { nodeId: 'merge', socket: 1 }, state: 'ok', value: 0 },
    { id: 'e6', from: { nodeId: 'merge', socket: 0 }, to: { nodeId: 'out',   socket: 0 }, state: 'ok', value: 0 },
  ]

  return { nodes: [src, split, f1, f2, merge, out], edges }
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
  const demo = useMemo(() => buildDemo(), [])

  const [nodes,       setNodes]       = useState(demo.nodes)
  const [edges,       setEdges]       = useState(demo.edges)
  const [selectedIds, setSelectedIds] = useState(['f2'])
  const [activeTool,  setActiveTool]  = useState('select')
  const [settings,    setSettings]    = useState({ snap: false, toolbarPosition: 'left' })
  const [sourceOutput, setSourceOutput] = useState(240)
  const [inspectedId,  setInspectedId]  = useState(null)
  const [inspectorPos, setInspectorPos] = useState({ x: 200, y: 100 })

  const viewRef = useRef({ x: 0, y: 0, scale: 1, tick: 0 })
  const [scale, setScale] = useState(1)

  // Undo/redo stacks
  const historyRef = useRef({ past: [], future: [] })

  // Sync source throughput into src node
  useEffect(() => {
    setNodes(ns => ns.map(n => n.id === 'src' ? { ...n, throughput: sourceOutput } : n))
  }, [sourceOutput])

  // computeFlow
  const { nodes: flowNodes, edges: flowEdges } = useMemo(
    () => computeFlow(nodes, edges),
    [nodes, edges]
  )

  // Derived: selected node, error nodes, flow summary
  const selectedNode = useMemo(
    () => selectedIds.length === 1 ? flowNodes.find(n => n.id === selectedIds[0]) : null,
    [flowNodes, selectedIds]
  )
  const errorNodes = useMemo(
    () => flowNodes.filter(n => n.status === 'error' || n.status === 'warning'),
    [flowNodes]
  )
  const flowSummary = useMemo(() => {
    const srcNode   = flowNodes.find(n => n.type === 'source')
    const oreIn     = srcNode?.throughput || 0
    const outNode   = flowNodes.find(n => n.type === 'output')
    const platesOut = outNode
      ? (flowEdges.find(e => e.to.nodeId === outNode.id)?.value || 0)
      : 0
    const efficiency = oreIn > 0 ? Math.round((platesOut / oreIn) * 100) : 0
    return { oreIn, platesOut, efficiency }
  }, [flowNodes, flowEdges])

  // Inspector node from flowNodes
  const inspectedNode = useMemo(
    () => inspectedId ? flowNodes.find(n => n.id === inspectedId) : null,
    [inspectedId, flowNodes]
  )

  // Handlers
  const pushHistory = useCallback((ns, es) => {
    historyRef.current.past.push({ nodes, edges })
    historyRef.current.future = []
    setNodes(ns)
    setEdges(es)
  }, [nodes, edges])

  const handleMoveNode = useCallback((id, x, y) => {
    setNodes(ns => ns.map(n => n.id === id ? { ...n, x, y } : n))
  }, [])

  const handleAddEdge = useCallback((fromId, fromSocket, toId, toSocket) => {
    // prevent duplicate edges on same socket pair
    const dup = edges.find(e =>
      e.from.nodeId === fromId && e.from.socket === fromSocket &&
      e.to.nodeId === toId   && e.to.socket   === toSocket
    )
    if (dup) return
    const edge = {
      id:    nanoid(8),
      from:  { nodeId: fromId, socket: fromSocket },
      to:    { nodeId: toId,   socket: toSocket },
      state: 'ok',
      value: 0,
    }
    pushHistory(nodes, [...edges, edge])
  }, [edges, nodes, pushHistory])

  const handlePlaceAt = useCallback((tool, x, y) => {
    const sx = snapToGrid(x, settings.snap)
    const sy = snapToGrid(y, settings.snap)
    const node = makeNode(tool, sx, sy)
    pushHistory([...nodes, node], edges)
    setActiveTool('select')
    setSelectedIds([node.id])
  }, [nodes, edges, settings.snap, pushHistory])

  const handleDelete = useCallback(() => {
    if (selectedIds.length === 0) return
    const newNodes = nodes.filter(n => !selectedIds.includes(n.id))
    const newEdges = edges.filter(e =>
      !selectedIds.includes(e.from.nodeId) && !selectedIds.includes(e.to.nodeId)
    )
    pushHistory(newNodes, newEdges)
    setSelectedIds([])
    if (selectedIds.includes(inspectedId)) setInspectedId(null)
  }, [nodes, edges, selectedIds, inspectedId, pushHistory])

  const handleUndo = useCallback(() => {
    const { past, future } = historyRef.current
    if (past.length === 0) return
    const prev = past.pop()
    future.push({ nodes, edges })
    setNodes(prev.nodes)
    setEdges(prev.edges)
  }, [nodes, edges])

  const handleRedo = useCallback(() => {
    const { past, future } = historyRef.current
    if (future.length === 0) return
    const next = future.pop()
    past.push({ nodes, edges })
    setNodes(next.nodes)
    setEdges(next.edges)
  }, [nodes, edges])

  const handleDoubleClickNode = useCallback((id) => {
    const node = nodes.find(n => n.id === id)
    if (!node) return
    // compute screen position to the right of the node
    const v = viewRef.current
    const nodeW = node.kind === 'junction' ? 38 : 220
    const sx = (node.x + nodeW) * v.scale + v.x + 8
    const sy = node.y * v.scale + v.y
    const clampedX = Math.min(sx, window.innerWidth - 296)
    const clampedY = Math.max(0, Math.min(sy, window.innerHeight - 320))
    setInspectorPos({ x: clampedX, y: clampedY })
    setInspectedId(id)
    setSelectedIds([id])
  }, [nodes])

  const handleUpdateNode = useCallback((patch) => {
    if (inspectedId === '__multi') {
      setNodes(ns => ns.map(n => selectedIds.includes(n.id) ? { ...n, ...patch } : n))
    } else if (inspectedId) {
      setNodes(ns => ns.map(n => n.id === inspectedId ? { ...n, ...patch } : n))
    }
  }, [inspectedId, selectedIds])

  const handleCloseInspector = useCallback(() => setInspectedId(null), [])

  const handleViewChange = useCallback(() => {
    setScale(viewRef.current.scale)
  }, [])

  const handleResetView = useCallback(() => {
    viewRef.current = { x: 0, y: 0, scale: 1, tick: (viewRef.current.tick || 0) + 1 }
    setScale(1)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      switch (e.key) {
        case 'v': case 'V': setActiveTool('select'); break
        case 'h': case 'H': setActiveTool('pan');    break
        case 'n': case 'N': setActiveTool('add-node'); break
        case 's': case 'S': setActiveTool('add-splitter'); break
        case 'm': case 'M': setActiveTool('add-merger'); break
        case 'c': case 'C': setActiveTool('wire'); break
        case 'Escape':
          setActiveTool('select')
          setInspectedId(null)
          break
        case 'Delete': case 'Backspace': handleDelete(); break
        case 'z': if (e.metaKey || e.ctrlKey) { e.shiftKey ? handleRedo() : handleUndo() } break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleDelete, handleUndo, handleRedo])

  // Tool change: close inspector
  useEffect(() => {
    if (activeTool !== 'select') setInspectedId(null)
  }, [activeTool])

  const isLeft = settings.toolbarPosition !== 'top'

  return html`
    <div style=${{
      position: 'fixed', inset: 0,
      display: 'flex',
      flexDirection: isLeft ? 'row' : 'column',
      background: '#0a0a0a',
      overflow: 'hidden',
    }}>
      <${Toolbar}
        orientation=${settings.toolbarPosition || 'left'}
        activeTool=${activeTool}
        setActiveTool=${setActiveTool}
        hasSelection=${selectedIds.length > 0}
        onDelete=${handleDelete}
        onUndo=${handleUndo}
        onRedo=${handleRedo}
        canUndo=${historyRef.current.past.length > 0}
        canRedo=${historyRef.current.future.length > 0}
        errorCount=${errorNodes.length}
        settings=${settings}
        setSettings=${setSettings}
      />

      <!-- Main canvas area + sidebar -->
      <div style=${{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <${Graph}
          nodes=${flowNodes}
          edges=${flowEdges}
          selectedIds=${selectedIds}
          onSetSelectedIds=${setSelectedIds}
          onMoveNode=${handleMoveNode}
          onAddEdge=${handleAddEdge}
          onPlaceAt=${handlePlaceAt}
          onDoubleClickNode=${handleDoubleClickNode}
          activeTool=${activeTool}
          settings=${settings}
          viewRef=${viewRef}
          onViewChange=${handleViewChange}
        />

        <${Sidebar}
          selectedNode=${selectedNode}
          errorNodes=${errorNodes}
          flow=${flowSummary}
          sourceOutput=${sourceOutput}
          setSourceOutput=${setSourceOutput}
          scale=${scale}
          onResetView=${handleResetView}
          multiSelectCount=${selectedIds.length}
        />

        ${inspectedId && html`
          <${Inspector}
            node=${inspectedId === '__multi' ? null : inspectedNode}
            screenPos=${inspectorPos}
            onClose=${handleCloseInspector}
            onUpdateNode=${handleUpdateNode}
            multiCount=${inspectedId === '__multi' ? selectedIds.length : 1}
          />
        `}
      </div>
    </div>
  `
}

render(html`<${App} />`, document.getElementById('app'))
