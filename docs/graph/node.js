import { h } from 'https://esm.sh/preact@10'
import htm from 'https://esm.sh/htm@3'
const html = htm.bind(h)
import { getSocketLocal, nodeCardHeight, NODE_WIDTH, HEADER_H, SOCKET_ROW_H, BODY_PAD_Y, SOCKET_R, JUNCTION_W, JUNCTION_H } from './geometry.js'
import { ITEM_COLORS, ITEM_LABELS, STATE_STROKE, FurnaceIcon, SourceIcon, OutputIcon, UnconfiguredIcon, AssemblerIcon, BadgeBang } from '../icons.js'

const TYPE_ICONS = {
  source:    SourceIcon,
  furnace:   FurnaceIcon,
  assembler: AssemblerIcon,
  output:    OutputIcon,
}

function NodeCard({ node, selected, onMouseDown, onDoubleClick, onSocketClick, onSocketEnter, onSocketLeave, wireActive, wireSourceId }) {
  const height = nodeCardHeight(node)
  const errored = node.status === 'error'
  const warned  = node.status === 'warning'

  const Icon = node.icon || TYPE_ICONS[node.type] || UnconfiguredIcon

  const borderColor = selected ? '#5878c8' : (errored ? '#501818' : '#2a2a2a')
  const borderW     = selected ? 1.5 : 1
  const headerFill  = errored && node.headerError ? node.headerError : node.header

  const inputs  = node.inputs  || []
  const outputs = node.outputs || []

  return html`
    <g
      transform=${`translate(${node.x}, ${node.y})`}
      onMouseDown=${(e) => onMouseDown && onMouseDown(e, node.id)}
      onDblClick=${(e) => { e.stopPropagation(); onDoubleClick && onDoubleClick(e, node.id) }}
      style="cursor: grab"
    >
      <rect
        width=${NODE_WIDTH}
        height=${height}
        fill="#1c1c1c"
        stroke=${borderColor}
        stroke-width=${borderW}
      />
      <rect
        width=${NODE_WIDTH}
        height=${HEADER_H}
        fill=${headerFill || '#1c1c1c'}
      />
      <line x1="0" y1=${HEADER_H} x2=${NODE_WIDTH} y2=${HEADER_H} stroke="#262626" stroke-width="1" />

      <g transform=${`translate(12, ${HEADER_H / 2 - 11})`}>
        <${Icon} size=${22} />
      </g>

      <text
        x="44"
        y="18"
        fill="#e6e6e6"
        font-family="JetBrains Mono, monospace"
        font-size="11.5"
        font-weight="600"
        letter-spacing="0.04em"
      >${node.name || ''}</text>
      <text
        x="44"
        y="32"
        fill="#7a7a7a"
        font-family="JetBrains Mono, monospace"
        font-size="10"
        letter-spacing="0.02em"
      >${node.sublabel || ''}</text>

      ${(errored || warned) ? html`
        <g transform=${`translate(${NODE_WIDTH - 14}, 14)`}>
          <${BadgeBang} kind=${errored ? 'error' : 'warning'} />
        </g>
      ` : null}

      ${inputs.map((sock, i) => {
        const local = getSocketLocal(node, 'in', i)
        const strokeColor = STATE_STROKE[sock.flowState] || STATE_STROKE.idle
        const itemColor   = ITEM_COLORS[sock.item] || '#555'
        const label       = ITEM_LABELS[sock.item] || sock.item || ''
        const isTarget    = wireActive && wireSourceId !== node.id
        return html`
          <g key=${i}>
            ${isTarget && html`<circle cx=${local.x} cy=${local.y} r="8" fill="none" stroke="#5878c8" stroke-width="1" opacity="0.4" />`}
            <circle
              cx=${local.x}
              cy=${local.y}
              r=${SOCKET_R}
              fill="#141414"
              stroke=${isTarget ? '#5878c8' : strokeColor}
              stroke-width="1.5"
            />
            <circle cx=${local.x} cy=${local.y} r="1.5" fill=${itemColor} />
            <text
              x="14"
              y=${local.y + 3.5}
              fill="#b0b0b0"
              font-size="10.5"
              font-family="JetBrains Mono, monospace"
            >${label}</text>
            <circle
              cx=${local.x}
              cy=${local.y}
              r="10"
              fill="transparent"
              style="cursor: crosshair;"
              onClick=${(e) => { e.stopPropagation(); onSocketClick && onSocketClick(node.id, 'in', i) }}
              onMouseEnter=${() => onSocketEnter && onSocketEnter(node.id, 'in', i)}
              onMouseLeave=${() => onSocketLeave && onSocketLeave()}
            />
          </g>
        `
      })}

      ${outputs.map((sock, i) => {
        const local = getSocketLocal(node, 'out', i)
        const strokeColor = STATE_STROKE[sock.flowState] || STATE_STROKE.idle
        const itemColor   = ITEM_COLORS[sock.item] || '#555'
        const label       = ITEM_LABELS[sock.item] || sock.item || ''
        return html`
          <g key=${i}>
            <circle
              cx=${local.x}
              cy=${local.y}
              r=${SOCKET_R}
              fill="#141414"
              stroke=${strokeColor}
              stroke-width="1.5"
            />
            <circle cx=${local.x} cy=${local.y} r="1.5" fill=${itemColor} />
            <text
              x=${NODE_WIDTH - 14}
              y=${local.y + 3.5}
              fill="#b0b0b0"
              font-size="10.5"
              font-family="JetBrains Mono, monospace"
              text-anchor="end"
            >${label}</text>
            <circle
              cx=${local.x}
              cy=${local.y}
              r="10"
              fill="transparent"
              style="cursor: crosshair;"
              onClick=${(e) => { e.stopPropagation(); onSocketClick && onSocketClick(node.id, 'out', i) }}
              onMouseEnter=${() => onSocketEnter && onSocketEnter(node.id, 'out', i)}
              onMouseLeave=${() => onSocketLeave && onSocketLeave()}
            />
          </g>
        `
      })}

      ${node.footer ? html`
        <text
          x=${NODE_WIDTH / 2}
          y=${height - 9}
          text-anchor="middle"
          fill="#7a7a7a"
          font-size="9.5"
          letter-spacing="0.08em"
          font-family="JetBrains Mono, monospace"
        >${node.footer}</text>
      ` : null}
    </g>
  `
}

function NodeJunction({ node, selected, onMouseDown, onDoubleClick, onSocketClick, onSocketEnter, onSocketLeave, wireActive, wireSourceId }) {
  const W = JUNCTION_W
  const H = JUNCTION_H
  const isSplitter = node.type === 'splitter'

  const pathD = isSplitter
    ? `M 0 ${H/2} L ${W} 0 L ${W} ${H} Z`
    : `M 0 0 L ${W} ${H/2} L 0 ${H} Z`

  const borderColor = selected ? '#5878c8' : '#3a4070'
  const borderW     = selected ? 1.5 : 1

  const inputs  = node.inputs  || []
  const outputs = node.outputs || []

  return html`
    <g
      transform=${`translate(${node.x}, ${node.y})`}
      onMouseDown=${(e) => onMouseDown && onMouseDown(e, node.id)}
      onDblClick=${(e) => { e.stopPropagation(); onDoubleClick && onDoubleClick(e, node.id) }}
      style="cursor: grab"
    >
      <path
        d=${pathD}
        fill="#12142a"
        stroke=${borderColor}
        stroke-width=${borderW}
        stroke-linejoin="miter"
      />
      <text
        x=${W / 2}
        y=${H + 12}
        text-anchor="middle"
        fill="#4a4a4a"
        font-size="9"
        letter-spacing="0.1em"
        font-family="JetBrains Mono, monospace"
      >${isSplitter ? 'SPLIT' : 'MERGE'}</text>

      ${inputs.map((sock, i) => {
        const local      = getSocketLocal(node, 'in', i)
        const strokeColor = STATE_STROKE[sock.flowState] || STATE_STROKE.idle
        const itemColor  = ITEM_COLORS[sock.item] || '#555'
        const isTarget   = wireActive && wireSourceId !== node.id
        return html`
          <g key=${i}>
            ${isTarget && html`<circle cx=${local.x} cy=${local.y} r="8" fill="none" stroke="#5878c8" stroke-width="1" opacity="0.4" />`}
            <circle cx=${local.x} cy=${local.y} r=${SOCKET_R} fill="#141414"
              stroke=${isTarget ? '#5878c8' : strokeColor} stroke-width="1.5" />
            <circle cx=${local.x} cy=${local.y} r="1.5" fill=${itemColor} />
            <circle cx=${local.x} cy=${local.y} r="10" fill="transparent" style="cursor: crosshair;"
              onClick=${(e) => { e.stopPropagation(); onSocketClick && onSocketClick(node.id, 'in', i) }}
              onMouseEnter=${() => onSocketEnter && onSocketEnter(node.id, 'in', i)}
              onMouseLeave=${() => onSocketLeave && onSocketLeave()}
            />
          </g>
        `
      })}

      ${outputs.map((sock, i) => {
        const local      = getSocketLocal(node, 'out', i)
        const strokeColor = STATE_STROKE[sock.flowState] || STATE_STROKE.idle
        const itemColor  = ITEM_COLORS[sock.item] || '#555'
        return html`
          <g key=${i}>
            <circle cx=${local.x} cy=${local.y} r=${SOCKET_R} fill="#141414"
              stroke=${strokeColor} stroke-width="1.5" />
            <circle cx=${local.x} cy=${local.y} r="1.5" fill=${itemColor} />
            <circle cx=${local.x} cy=${local.y} r="10" fill="transparent" style="cursor: crosshair;"
              onClick=${(e) => { e.stopPropagation(); onSocketClick && onSocketClick(node.id, 'out', i) }}
              onMouseEnter=${() => onSocketEnter && onSocketEnter(node.id, 'out', i)}
              onMouseLeave=${() => onSocketLeave && onSocketLeave()}
            />
          </g>
        `
      })}
    </g>
  `
}

export function NodeView(props) {
  return props.node.kind === 'junction'
    ? html`<${NodeJunction} ...${props} />`
    : html`<${NodeCard} ...${props} />`
}

export function PlacementGhost({ tool, x, y }) {
  const W = NODE_WIDTH
  const H = HEADER_H + BODY_PAD_Y * 2 + SOCKET_ROW_H

  if (tool === 'add-splitter' || tool === 'add-merger') {
    const isSplitter = tool === 'add-splitter'
    const JW = JUNCTION_W
    const JH = JUNCTION_H
    const cx = x - JW / 2
    const cy = y - JH / 2
    const pathD = isSplitter
      ? `M ${cx} ${cy + JH/2} L ${cx + JW} ${cy} L ${cx + JW} ${cy + JH} Z`
      : `M ${cx} ${cy} L ${cx + JW} ${cy + JH/2} L ${cx} ${cy + JH} Z`
    return html`
      <path
        d=${pathD}
        fill="none"
        stroke="#5878c8"
        stroke-width="1.5"
        stroke-dasharray="3 2"
        opacity="0.55"
        pointer-events="none"
      />
    `
  }

  // add-node
  return html`
    <rect
      x=${x - W / 2}
      y=${y - H / 2}
      width=${W}
      height=${H}
      fill="none"
      stroke="#5878c8"
      stroke-width="1.5"
      stroke-dasharray="3 2"
      opacity="0.55"
      pointer-events="none"
    />
  `
}

export { NodeCard, NodeJunction }
