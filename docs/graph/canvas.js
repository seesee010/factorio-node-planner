import { h, Fragment } from 'https://esm.sh/preact@10'
import { useState, useRef, useEffect, useCallback, useMemo } from 'https://esm.sh/preact@10/hooks'
import htm from 'https://esm.sh/htm@3'
const html = htm.bind(h)
import { NodeView, PlacementGhost } from './node.js'
import { EdgeView, WireGhost } from './edge.js'
import { nodeSize, socketPos, toCanvas, JUNCTION_W, JUNCTION_H } from './geometry.js'

export default function Graph({
  nodes,
  edges,
  selectedIds,
  onSetSelectedIds,
  onMoveNode,
  onAddEdge,
  onPlaceAt,
  onDoubleClickNode,
  activeTool,
  settings,
  viewRef,
  onViewChange,
}) {
  const containerRef = useRef(null)
  const scaleRef = useRef(viewRef.current.scale)
  const panRef   = useRef({ x: viewRef.current.x, y: viewRef.current.y })
  const dragRef  = useRef(null)
  const [tick, setTick] = useState(0)
  const rerender = useCallback(() => setTick(n => n + 1), [])
  const [mouse, setMouse] = useState({ x: 0, y: 0, inside: false })
  const [marquee, setMarquee] = useState(null)
  const [wireState, setWireState] = useState(null)

  // View sync effect
  useEffect(() => {
    scaleRef.current = viewRef.current.scale
    panRef.current = { x: viewRef.current.x, y: viewRef.current.y }
    rerender()
  }, [viewRef.current.tick])

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const oldScale = scaleRef.current
      const factor = Math.exp(-e.deltaY * 0.0015)
      const newScale = Math.max(0.3, Math.min(2.5, oldScale * factor))
      const cx = (mx - panRef.current.x) / oldScale
      const cy = (my - panRef.current.y) / oldScale
      panRef.current = { x: mx - cx * newScale, y: my - cy * newScale }
      scaleRef.current = newScale
      viewRef.current.scale = newScale
      viewRef.current.x = panRef.current.x
      viewRef.current.y = panRef.current.y
      onViewChange && onViewChange()
      rerender()
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  // Global mousemove/mouseup
  useEffect(() => {
    const handleMouseMove = (e) => {
      const drag = dragRef.current
      if (!drag) return

      if (drag.kind === 'pan') {
        const dx = e.clientX - drag.startMouse.x
        const dy = e.clientY - drag.startMouse.y
        if (!drag.moved && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
          drag.moved = true
        }
        panRef.current = {
          x: drag.startPan.x + dx,
          y: drag.startPan.y + dy,
        }
        viewRef.current.x = panRef.current.x
        viewRef.current.y = panRef.current.y
        onViewChange && onViewChange()
        rerender()
      } else if (drag.kind === 'node') {
        const dx = e.clientX - drag.startMouse.x
        const dy = e.clientY - drag.startMouse.y
        if (!drag.moved && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
          drag.moved = true
        }
        if (drag.moved && onMoveNode) {
          const s = scaleRef.current
          drag.dragIds.forEach((id) => {
            const start = drag.starts[id]
            if (!start) return
            let nx = start.x + dx / s
            let ny = start.y + dy / s
            if (settings?.snap !== false) {
              const snapGrid = 22
              nx = Math.round(nx / snapGrid) * snapGrid
              ny = Math.round(ny / snapGrid) * snapGrid
            }
            onMoveNode(id, nx, ny)
          })
        }
      } else if (drag.kind === 'marquee') {
        const rect = containerRef.current.getBoundingClientRect()
        const canvas = toCanvas(e.clientX, e.clientY, rect, panRef.current, scaleRef.current)
        const newMarquee = {
          x1: drag.startCanvas.x,
          y1: drag.startCanvas.y,
          x2: canvas.x,
          y2: canvas.y,
        }
        setMarquee(newMarquee)

        // Compute which nodes intersect marquee
        const mx1 = Math.min(newMarquee.x1, newMarquee.x2)
        const my1 = Math.min(newMarquee.y1, newMarquee.y2)
        const mx2 = Math.max(newMarquee.x1, newMarquee.x2)
        const my2 = Math.max(newMarquee.y1, newMarquee.y2)
        const intersected = nodes.filter(n => {
          const sz = nodeSize(n)
          return n.x < mx2 && n.x + sz.w > mx1 && n.y < my2 && n.y + sz.h > my1
        }).map(n => n.id)

        const newSelection = [...new Set([...drag.prevSelection, ...intersected])]
        onSetSelectedIds && onSetSelectedIds(newSelection)
      }
    }

    const handleMouseUp = (e) => {
      const drag = dragRef.current
      if (!drag) return

      if (drag.kind === 'node' && !drag.moved) {
        // Toggle/set selection on click without move
        if (drag.shift) {
          const isSelected = selectedIds.includes(drag.nodeId)
          if (isSelected) {
            onSetSelectedIds && onSetSelectedIds(selectedIds.filter(id => id !== drag.nodeId))
          } else {
            onSetSelectedIds && onSetSelectedIds([...selectedIds, drag.nodeId])
          }
        } else {
          onSetSelectedIds && onSetSelectedIds([drag.nodeId])
        }
      } else if (drag.kind === 'pan' && drag.bgClick && !drag.moved) {
        // Deselect all on background click
        onSetSelectedIds && onSetSelectedIds([])
      } else if (drag.kind === 'marquee') {
        setMarquee(null)
      }

      dragRef.current = null
      rerender()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [nodes, selectedIds, onSetSelectedIds, onMoveNode, settings, onViewChange])

  // Wire mouse tracking
  useEffect(() => {
    if (!wireState) return
    const handleMouseMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const canvas = toCanvas(e.clientX, e.clientY, rect, panRef.current, scaleRef.current)
      setWireState(ws => ws ? { ...ws, toX: canvas.x, toY: canvas.y } : null)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [!!wireState])

  const handleSocketClick = useCallback((nodeId, side, index) => {
    if (activeTool !== 'wire') return
    if (side === 'in' && wireState) {
      // complete wire
      onAddEdge && onAddEdge(wireState.fromNodeId, wireState.fromSocket, nodeId, index)
      setWireState(null)
    } else if (side === 'out' && !wireState) {
      // start wire
      setWireState({ fromNodeId: nodeId, fromSocket: index, toX: 0, toY: 0 })
    }
  }, [activeTool, wireState, onAddEdge])

  const onMouseDownBg = useCallback((e) => {
    if (e.target !== e.currentTarget && e.target.tagName !== 'svg' && e.target.tagName !== 'rect') {
      // Only trigger bg logic if clicking on the background
    }

    const isPlacing = activeTool === 'add-node' || activeTool === 'add-splitter' || activeTool === 'add-merger'
    const rect = containerRef.current.getBoundingClientRect()
    const canvas = toCanvas(e.clientX, e.clientY, rect, panRef.current, scaleRef.current)

    if (isPlacing) {
      onPlaceAt && onPlaceAt(activeTool, canvas.x, canvas.y)
      return
    }

    if (activeTool === 'pan') {
      dragRef.current = {
        kind: 'pan',
        startMouse: { x: e.clientX, y: e.clientY },
        startPan: { ...panRef.current },
        moved: false,
      }
      return
    }

    if (e.shiftKey) {
      dragRef.current = {
        kind: 'marquee',
        startCanvas: canvas,
        startMouse: { x: e.clientX, y: e.clientY },
        prevSelection: [...selectedIds],
      }
      return
    }

    // Default: pan with bgClick deselect
    dragRef.current = {
      kind: 'pan',
      startMouse: { x: e.clientX, y: e.clientY },
      startPan: { ...panRef.current },
      bgClick: true,
      moved: false,
    }
  }, [activeTool, selectedIds, onPlaceAt])

  const onNodeMouseDown = useCallback((e, id) => {
    e.stopPropagation()
    if (activeTool === 'wire') {
      // Wire tool: clicking the node body starts a wire from socket 0
      if (!wireState) {
        const rect = containerRef.current.getBoundingClientRect()
        const canvas = toCanvas(e.clientX, e.clientY, rect, panRef.current, scaleRef.current)
        setWireState({ fromNodeId: id, fromSocket: 0, toX: canvas.x, toY: canvas.y })
      } else {
        // Complete wire to socket 0 of this node
        onAddEdge && onAddEdge(wireState.fromNodeId, wireState.fromSocket, id, 0)
        setWireState(null)
      }
      return
    }

    const isSelected = selectedIds.includes(id)
    const dragIds = isSelected ? selectedIds : [id]
    const starts = {}
    nodes.forEach(n => {
      if (dragIds.includes(n.id)) {
        starts[n.id] = { x: n.x, y: n.y }
      }
    })

    dragRef.current = {
      kind: 'node',
      nodeId: id,
      dragIds,
      starts,
      startMouse: { x: e.clientX, y: e.clientY },
      moved: false,
      shift: e.shiftKey,
      wasInSelection: isSelected,
    }
  }, [activeTool, wireState, selectedIds, nodes, onAddEdge])

  const onNodeDoubleClickInternal = useCallback((e, id) => {
    onDoubleClickNode && onDoubleClickNode(id)
  }, [onDoubleClickNode])

  const onMouseMoveBg = useCallback((e) => {
    if (!mouse.inside) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const canvas = toCanvas(e.clientX, e.clientY, rect, panRef.current, scaleRef.current)
    setMouse({ x: canvas.x, y: canvas.y, inside: true })
  }, [mouse.inside])

  const onMouseLeaveBg = useCallback(() => {
    setMouse(m => ({ ...m, inside: false }))
  }, [])

  const onMouseEnterBg = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const canvas = toCanvas(e.clientX, e.clientY, rect, panRef.current, scaleRef.current)
    setMouse({ x: canvas.x, y: canvas.y, inside: true })
  }, [])

  const selectedSet = useMemo(() => new Set(selectedIds || []), [selectedIds])

  const isPlacing = activeTool === 'add-node' || activeTool === 'add-splitter' || activeTool === 'add-merger'

  // Cursor logic
  let cursor = 'grab'
  if (dragRef.current?.kind === 'pan') cursor = 'grabbing'
  else if (dragRef.current?.kind === 'marquee') cursor = 'crosshair'
  else if (activeTool === 'pan') cursor = 'grab'
  else if (isPlacing) cursor = 'crosshair'
  else if (activeTool === 'wire') cursor = 'crosshair'

  // Grid
  const gridSpacing = 22 * scaleRef.current
  const gridOffsetX = ((panRef.current.x % gridSpacing) + gridSpacing) % gridSpacing
  const gridOffsetY = ((panRef.current.y % gridSpacing) + gridSpacing) % gridSpacing

  const transform = `translate(${panRef.current.x} ${panRef.current.y}) scale(${scaleRef.current})`
  const s = scaleRef.current

  const wireFromNode = wireState ? nodes.find(n => n.id === wireState.fromNodeId) : null

  return html`
    <div
      ref=${containerRef}
      style=${{
        position: 'absolute',
        inset: 0,
        background: '#161616',
        overflow: 'hidden',
        cursor,
      }}
      onMouseDown=${onMouseDownBg}
      onMouseMove=${onMouseMoveBg}
      onMouseLeave=${onMouseLeaveBg}
      onMouseEnter=${onMouseEnterBg}
    >
      <svg width="100%" height="100%">
        <defs>
          <pattern
            id="dotgrid"
            width=${gridSpacing}
            height=${gridSpacing}
            patternUnits="userSpaceOnUse"
            x=${gridOffsetX}
            y=${gridOffsetY}
          >
            <rect x="0" y="0" width="1.5" height="1.5" fill="#363636" shape-rendering="crispEdges" />
          </pattern>
        </defs>

        ${settings?.grid !== false ? html`<rect width="100%" height="100%" fill="url(#dotgrid)" />` : null}

        <g transform=${transform}>
          ${edges.map((e, i) => html`
            <${EdgeView}
              key=${e.id || i}
              edge=${e}
              nodes=${nodes}
              showLabel=${settings?.edgeLabels !== false}
            />
          `)}

          ${nodes.map(n => html`
            <${NodeView}
              key=${n.id}
              node=${n}
              selected=${selectedSet.has(n.id)}
              onMouseDown=${onNodeMouseDown}
              onDoubleClick=${onNodeDoubleClickInternal}
              onSocketClick=${handleSocketClick}
            />
          `)}

          ${isPlacing && mouse.inside ? html`
            <${PlacementGhost} tool=${activeTool} x=${mouse.x} y=${mouse.y} />
          ` : null}

          ${wireFromNode ? html`
            <${WireGhost}
              fromNode=${wireFromNode}
              fromSocket=${wireState.fromSocket}
              toX=${wireState.toX}
              toY=${wireState.toY}
            />
          ` : null}

          ${marquee ? (() => {
            const mx = Math.min(marquee.x1, marquee.x2)
            const my = Math.min(marquee.y1, marquee.y2)
            const mw = Math.abs(marquee.x2 - marquee.x1)
            const mh = Math.abs(marquee.y2 - marquee.y1)
            return html`
              <rect
                x=${mx}
                y=${my}
                width=${mw}
                height=${mh}
                fill="#5878c8"
                fill-opacity="0.07"
                stroke="#5878c8"
                stroke-width=${1 / s}
                stroke-dasharray="${4 / s} ${3 / s}"
              />
            `
          })() : null}
        </g>
      </svg>
    </div>
  `
}
