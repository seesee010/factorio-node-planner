import { h } from 'https://esm.sh/preact@10'
import htm from 'https://esm.sh/htm@3'
const html = htm.bind(h)
import { socketPos, bezierPath, formatVal } from './geometry.js'
import { STATE_STROKE, STATE_LABEL_FG } from '../icons.js'

export function EdgeView({ edge, nodes, showLabel = true }) {
  const fromNode = nodes.find(n => n.id === edge.from.nodeId)
  const toNode   = nodes.find(n => n.id === edge.to.nodeId)
  if (!fromNode || !toNode) return null

  const a = socketPos(fromNode, 'out', edge.from.socket)
  const b = socketPos(toNode,   'in',  edge.to.socket)

  const stroke = STATE_STROKE[edge.state] || STATE_STROKE.ok
  const d = bezierPath(a.x, a.y, b.x, b.y)

  if (!showLabel || edge.value == null) {
    return html`
      <path d=${d} fill="none" stroke=${stroke} stroke-width="2" />
    `
  }

  const mx   = (a.x + b.x) / 2
  const my   = (a.y + b.y) / 2
  const text = `${formatVal(edge.value)}/m`
  const w    = Math.max(40, text.length * 6.6 + 10)
  const h    = 14
  const fg   = STATE_LABEL_FG[edge.state] || STATE_LABEL_FG.ok

  return html`
    <g>
      <path d=${d} fill="none" stroke=${stroke} stroke-width="2" />
      <g transform=${`translate(${mx}, ${my})`}>
        <rect x=${-w/2} y=${-h/2} width=${w} height=${h} fill="#161616" stroke="#202020" stroke-width="1" />
        <text
          text-anchor="middle"
          y="3.5"
          font-size="10"
          font-family="JetBrains Mono, monospace"
          fill=${fg}
          font-weight="500"
        >${text}</text>
      </g>
    </g>
  `
}

export function WireGhost({ fromNode, fromSocket, toX, toY }) {
  const from = socketPos(fromNode, 'out', fromSocket)
  const d = bezierPath(from.x, from.y, toX, toY)
  return html`
    <path
      d=${d}
      stroke="#5878c8"
      stroke-width="1.5"
      stroke-dasharray="4 3"
      fill="none"
      opacity="0.7"
    />
  `
}
