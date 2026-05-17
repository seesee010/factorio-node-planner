export const NODE_WIDTH   = 220
export const HEADER_H     = 44
export const SOCKET_ROW_H = 28
export const BODY_PAD_Y   = 12
export const SOCKET_R     = 5
export const JUNCTION_W   = 38
export const JUNCTION_H   = 64

// Returns { w, h }
export function nodeSize(node) {
  if (node.kind === 'junction') return { w: JUNCTION_W, h: JUNCTION_H }
  return { w: NODE_WIDTH, h: nodeCardHeight(node) }
}

// HEADER_H + BODY_PAD_Y*2 + max(inputs.length, outputs.length, 1) * SOCKET_ROW_H
export function nodeCardHeight(node) {
  const rows = Math.max(node.inputs?.length || 0, node.outputs?.length || 0, 1)
  return HEADER_H + BODY_PAD_Y * 2 + rows * SOCKET_ROW_H
}

// Returns { x, y } relative to node origin
// For junction splitter: input center-left, outputs top-right + bottom-right
// For junction merger:   inputs top-left + bottom-left, output center-right
// For card: inputs on left side, outputs on right side, centered vertically
export function getSocketLocal(node, side, index) {
  if (node.kind === 'junction') {
    if (node.type === 'splitter') {
      if (side === 'in')  return { x: 0,          y: JUNCTION_H / 2 }
      return { x: JUNCTION_W, y: index === 0 ? 0 : JUNCTION_H }
    } else { // merger
      if (side === 'in')  return { x: 0,          y: index === 0 ? 0 : JUNCTION_H }
      return { x: JUNCTION_W, y: JUNCTION_H / 2 }
    }
  }
  // card: vertical rows, smaller side centered relative to larger side
  const arr   = side === 'in' ? node.inputs  : node.outputs
  const other = side === 'in' ? node.outputs : node.inputs
  const count      = arr?.length   || 0
  const otherCount = other?.length || 0
  const totalRows  = Math.max(count, otherCount, 1)
  const offsetRows = (totalRows - count) / 2
  return {
    x: side === 'in' ? 0 : NODE_WIDTH,
    y: HEADER_H + BODY_PAD_Y + (offsetRows + index + 0.5) * SOCKET_ROW_H,
  }
}

// Returns { x, y } in canvas coordinates
export function socketPos(node, side, index) {
  const local = getSocketLocal(node, side, index)
  return { x: node.x + local.x, y: node.y + local.y }
}

// Cubic bezier path string
export function bezierPath(x1, y1, x2, y2) {
  const dx = Math.max(Math.abs(x2 - x1) * 0.45, 40)
  return `M ${x1} ${y1} C ${x1+dx} ${y1}, ${x2-dx} ${y2}, ${x2} ${y2}`
}

// Format throughput value (integer or 1 decimal)
export function formatVal(v) {
  if (!Number.isFinite(v)) return '0'
  if (Number.isInteger(v)) return String(v)
  return v.toFixed(1)
}

// Convert mouse event clientX/Y to canvas coordinates
export function toCanvas(clientX, clientY, containerRect, pan, scale) {
  return {
    x: (clientX - containerRect.left - pan.x) / scale,
    y: (clientY - containerRect.top  - pan.y) / scale,
  }
}
