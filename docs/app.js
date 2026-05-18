import { h, render } from 'https://esm.sh/preact@10'
import { useState, useRef, useEffect, useMemo, useCallback } from 'https://esm.sh/preact@10/hooks'
import htm from 'https://esm.sh/htm@3'
const html = htm.bind(h)
import { nanoid } from 'https://esm.sh/nanoid@5'

import Graph     from './graph/canvas.js'
import Toolbar   from './components/toolbar.js'
import Sidebar   from './components/sidebar.js'
import Inspector from './components/inspector.js'

import { computeFlow } from './flow/compute.js'
import { loadGameData } from './flow/loader.js'
import { makeNode, snapToGrid } from './state.js'
import { serializeGraph, downloadGraph } from './parsing/save.js'
import { parseGraph } from './parsing/load.js'
import { NODE_WIDTH, JUNCTION_W, JUNCTION_H, HEADER_H, SOCKET_ROW_H, BODY_PAD_Y } from './graph/geometry.js'

// ---------------------------------------------------------------------------
// URL state encoding
// ---------------------------------------------------------------------------

function encodeState(nodes, edges) {
  try {
    const minimal = {
      nodes: nodes.map(n => ({
        id: n.id, kind: n.kind, type: n.type,
        name: n.name, sublabel: n.sublabel, header: n.header,
        x: Math.round(n.x), y: Math.round(n.y),
        throughput: n.throughput, capacity: n.capacity,
        inputs: n.inputs, outputs: n.outputs,
      })),
      edges: edges.map(e => ({ id: e.id, from: e.from, to: e.to })),
    }
    return btoa(encodeURIComponent(JSON.stringify(minimal)))
  } catch { return null }
}

function decodeState(hash) {
  try {
    const raw = hash.replace(/^#/, '')
    if (!raw) return null
    const json = decodeURIComponent(atob(raw))
    const data = JSON.parse(json)
    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) return null
    const result = parseGraph(JSON.stringify(data))
    return result.error ? null : result
  } catch { return null }
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
  // Decode initial state from URL hash, otherwise start blank
  const initial = useMemo(() => {
    const decoded = decodeState(window.location.hash)
    if (decoded) return { nodes: decoded.nodes, edges: decoded.edges }
    return { nodes: [], edges: [] }
  }, [])

  const [nodes,        setNodes]        = useState(initial.nodes)
  const [edges,        setEdges]        = useState(initial.edges)
  const [selectedIds,  setSelectedIds]  = useState([])
  const [activeTool,   setActiveTool]   = useState('select')
  const [settings,     setSettings]     = useState({ snap: false, toolbarPosition: 'left' })
  const [sourceOutput, setSourceOutput] = useState(240)
  const [inspectedId,  setInspectedId]  = useState(null)
  const [inspectorPos, setInspectorPos] = useState({ x: 200, y: 100 })
  const [gameVersion,  setGameVersion]  = useState('1.1')
  const [gameData,     setGameData]     = useState(null)

  const viewRef      = useRef({ x: 0, y: 0, scale: 1, tick: 0 })
  const [scale, setScale] = useState(1)
  const historyRef   = useRef({ past: [], future: [] })

  // When sourceOutput changes, update throughput on all source-type nodes
  useEffect(() => {
    setNodes(ns => {
      const hasSrc = ns.some(n => n.type === 'source')
      if (!hasSrc) return ns
      return ns.map(n => n.type === 'source' ? { ...n, throughput: sourceOutput } : n)
    })
  }, [sourceOutput])

  // Encode state into URL hash whenever nodes/edges change
  useEffect(() => {
    const encoded = encodeState(nodes, edges)
    if (encoded) {
      history.replaceState(null, '', '#' + encoded)
    } else {
      history.replaceState(null, '', window.location.pathname)
    }
  }, [nodes, edges])

  // Load game data when version changes
  useEffect(() => {
    setGameData(null)
    loadGameData(gameVersion)
      .then(data => setGameData(data))
      .catch(err => console.error('Failed to load game data:', err))
  }, [gameVersion])

  // computeFlow (memoized)
  const { nodes: rawFlowNodes, edges: flowEdges } = useMemo(
    () => computeFlow(nodes, edges, gameData),
    [nodes, edges, gameData]
  )

  // Mark unconnected sockets as idle (gray)
  const flowNodes = useMemo(() => {
    const toSet   = new Set(flowEdges.map(e => `${e.to.nodeId}:${e.to.socket}`))
    const fromSet = new Set(flowEdges.map(e => `${e.from.nodeId}:${e.from.socket}`))
    return rawFlowNodes.map(n => ({
      ...n,
      inputs:  n.inputs?.map((s, i)  => ({ ...s, flowState: toSet.has(`${n.id}:${i}`)   ? s.flowState : 'idle' })),
      outputs: n.outputs?.map((s, i) => ({ ...s, flowState: fromSet.has(`${n.id}:${i}`) ? s.flowState : 'idle' })),
    }))
  }, [rawFlowNodes, flowEdges])

  // Derived: selected node with throughputIn/Out computed from edge values
  const selectedNode = useMemo(() => {
    if (selectedIds.length !== 1) return null
    const n = flowNodes.find(n => n.id === selectedIds[0])
    if (!n) return null
    const inEdges  = flowEdges.filter(e => e.to.nodeId   === n.id)
    const outEdges = flowEdges.filter(e => e.from.nodeId === n.id)
    const throughputIn  = inEdges.reduce((s, e)  => s + (e.value || 0), 0)
    const throughputOut = outEdges.reduce((s, e) => s + (e.value || 0), 0) || n.throughput || 0
    return { ...n, throughputIn, throughputOut }
  }, [flowNodes, flowEdges, selectedIds])

  const errorNodes = useMemo(
    () => flowNodes.filter(n => n.status === 'error' || n.status === 'warning'),
    [flowNodes]
  )

  const flowSummary = useMemo(() => {
    const srcNode   = flowNodes.find(n => n.type === 'source')
    const oreIn     = srcNode ? (srcNode.throughput || sourceOutput) : sourceOutput
    const outNode   = flowNodes.find(n => n.type === 'output')
    const platesOut = outNode
      ? (flowEdges.find(e => e.to.nodeId === outNode.id)?.value || 0)
      : 0
    const efficiency = oreIn > 0 ? Math.round((platesOut / oreIn) * 100) : 0
    return { oreIn, platesOut, efficiency }
  }, [flowNodes, flowEdges, sourceOutput])

  const inspectedNode = useMemo(
    () => inspectedId && inspectedId !== '__multi'
      ? flowNodes.find(n => n.id === inspectedId)
      : null,
    [inspectedId, flowNodes]
  )

  // ---------------------------------------------------------------------------
  // History helpers
  // ---------------------------------------------------------------------------

  const pushHistory = useCallback((ns, es) => {
    historyRef.current.past.push({ nodes, edges })
    historyRef.current.future = []
    setNodes(ns)
    setEdges(es)
  }, [nodes, edges])

  // ---------------------------------------------------------------------------
  // Graph event handlers
  // ---------------------------------------------------------------------------

  const handleMoveNode = useCallback((id, x, y) => {
    setNodes(ns => ns.map(n => n.id === id ? { ...n, x, y } : n))
  }, [])

  const handleAddEdge = useCallback((fromId, fromSocket, toId, toSocket) => {
    const dup = edges.find(e =>
      e.from.nodeId === fromId && e.from.socket === fromSocket &&
      e.to.nodeId   === toId   && e.to.socket   === toSocket
    )
    if (dup) return
    const edge = {
      id:   nanoid(8),
      from: { nodeId: fromId, socket: fromSocket },
      to:   { nodeId: toId,   socket: toSocket },
      state: 'ok', value: 0,
    }
    pushHistory(nodes, [...edges, edge])
  }, [edges, nodes, pushHistory])

  const handlePlaceAt = useCallback((tool, x, y) => {
    const sx = snapToGrid(x, settings.snap)
    const sy = snapToGrid(y, settings.snap)
    // Center node at click position (PlacementGhost is also centered)
    const isJunction = tool === 'add-splitter' || tool === 'add-merger'
    const W = isJunction ? JUNCTION_W : NODE_WIDTH
    const H = isJunction ? JUNCTION_H : HEADER_H + BODY_PAD_Y * 2 + SOCKET_ROW_H
    const node = makeNode(tool, sx - Math.round(W / 2), sy - Math.round(H / 2))
    // Source nodes inherit current slider value
    if (node.type === 'source') node.throughput = sourceOutput
    pushHistory([...nodes, node], edges)
    setActiveTool('select')
    setSelectedIds([node.id])
  }, [nodes, edges, settings.snap, sourceOutput, pushHistory])

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
    const v = viewRef.current
    const nodeW = node.kind === 'junction' ? JUNCTION_W : NODE_WIDTH
    const sx = (node.x + nodeW) * v.scale + v.x + 12
    const sy = node.y * v.scale + v.y
    const clampedX = Math.min(Math.max(sx, 60), window.innerWidth - 296)
    const clampedY = Math.max(0, Math.min(sy, window.innerHeight - 340))
    setInspectorPos({ x: clampedX, y: clampedY })
    setInspectedId(id)
    setSelectedIds([id])
  }, [nodes])

  const handleUpdateNode = useCallback((patch) => {
    // When converting to source, inherit current slider throughput
    const effectivePatch = patch.type === 'source'
      ? { ...patch, throughput: sourceOutput }
      : patch
    if (inspectedId === '__multi') {
      setNodes(ns => ns.map(n => selectedIds.includes(n.id) ? { ...n, ...effectivePatch } : n))
    } else if (inspectedId) {
      setNodes(ns => ns.map(n => n.id === inspectedId ? { ...n, ...effectivePatch } : n))
    }
  }, [inspectedId, selectedIds, sourceOutput])

  const handleCloseInspector = useCallback(() => setInspectedId(null), [])

  const handleViewChange = useCallback(() => {
    setScale(viewRef.current.scale)
  }, [])

  const handleResetView = useCallback(() => {
    viewRef.current = { x: 0, y: 0, scale: 1, tick: (viewRef.current.tick || 0) + 1 }
    setScale(1)
  }, [])

  // ---------------------------------------------------------------------------
  // File operations
  // ---------------------------------------------------------------------------

  const handleNew = useCallback(() => {
    if (nodes.length > 0 && !confirm('Clear the current graph?')) return
    historyRef.current = { past: [], future: [] }
    setNodes([])
    setEdges([])
    setSelectedIds([])
    setInspectedId(null)
  }, [nodes])

  const handleSave = useCallback(() => {
    downloadGraph(nodes, edges)
  }, [nodes, edges])

  const handleExportURL = useCallback(() => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {})
    // Show brief feedback via alert fallback
    const url = window.location.href
    prompt('Copy this URL to share your graph:', url)
  }, [])

  // ---------------------------------------------------------------------------
  // Keyboard shortcuts
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave(); return }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.shiftKey ? handleRedo() : handleUndo(); return }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); handleNew(); return }
      switch (e.key) {
        case 'v': case 'V': setActiveTool('select'); break
        case 'h': case 'H': setActiveTool('pan'); break
        case 'a': case 'A': if (!e.metaKey && !e.ctrlKey) setActiveTool('add-node'); break
        case 's': case 'S': if (!e.metaKey && !e.ctrlKey) setActiveTool('add-splitter'); break
        case 'm': case 'M': if (!e.metaKey && !e.ctrlKey) setActiveTool('add-merger'); break
        case 'c': case 'C': setActiveTool('wire'); break
        case 'Escape':
          setActiveTool('select')
          setInspectedId(null)
          break
        case 'Delete': case 'Backspace': handleDelete(); break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleDelete, handleUndo, handleRedo, handleSave, handleNew])

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
        onNew=${handleNew}
        onSave=${handleSave}
        onExportURL=${handleExportURL}
      />

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
          nodeCount=${nodes.length}
          edgeCount=${edges.length}
          gameVersion=${gameVersion}
          setGameVersion=${setGameVersion}
          gameDataLoaded=${gameData !== null}
        />

        ${inspectedId && html`
          <${Inspector}
            node=${inspectedId === '__multi' ? null : inspectedNode}
            screenPos=${inspectorPos}
            onClose=${handleCloseInspector}
            onUpdateNode=${handleUpdateNode}
            multiCount=${inspectedId === '__multi' ? selectedIds.length : 1}
            gameData=${gameData}
          />
        `}
      </div>
    </div>
  `
}

render(html`<${App} />`, document.getElementById('app'))
