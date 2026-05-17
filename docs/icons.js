import { h } from 'https://esm.sh/preact@10'
import htm from 'https://esm.sh/htm@3'
const html = htm.bind(h)

export const ITEM_COLORS = {
  'iron-ore':       '#a85e24',
  'iron-plate':     '#687080',
  'copper-ore':     '#8B4513',
  'copper-plate':   '#b87333',
  'green-circuit':  '#3a7a3a',
  'gear':           '#8a8060',
}

export const ITEM_LABELS = {
  'iron-ore':       'iron ore',
  'iron-plate':     'iron plates',
  'copper-ore':     'copper ore',
  'copper-plate':   'copper plates',
  'green-circuit':  'green circuits',
  'gear':           'gears',
}

export const STATE_STROKE = {
  ok:      '#2a8c2a',
  warning: '#cc6820',
  error:   '#cc2828',
  idle:    '#363636',
}

export const STATE_LABEL_FG = {
  ok:      '#7ec27e',
  warning: '#e0a060',
  error:   '#e87878',
  idle:    '#4a4a4a',
}

export function SourceIcon({ size = 22, color = '#8a8060' }) {
  return html`
    <svg width=${size} height=${size} viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="14" width="16" height="3" fill=${color} />
      <rect x="5" y="10" width="12" height="3" fill=${color} opacity="0.85" />
      <rect x="7" y="6" width="8" height="3" fill=${color} opacity="0.7" />
    </svg>
  `
}

export function FurnaceIcon({ size = 22, color = '#d68830', dim = false }) {
  const flameMain  = dim ? '#553a18' : color
  const flameInner = dim ? '#7a5320' : '#ffd07a'
  const shell      = dim ? '#6a6258' : '#8a8060'
  return html`
    <svg width=${size} height=${size} viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="16" height="14" stroke=${shell} stroke-width="1.5" fill="none" />
      <rect x="9" y="2" width="4" height="2" fill=${shell} />
      <path d="M8 15 L8 12 L11 8 L14 12 L14 15 Z" fill=${flameMain} />
      <path d="M10 15 L10 13 L11 11 L12 13 L12 15 Z" fill=${flameInner} />
    </svg>
  `
}

export function AssemblerIcon({ size = 22, color = '#7080d0' }) {
  return html`
    <svg width=${size} height=${size} viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="14" height="14" stroke=${color} stroke-width="1.5" fill="none" />
      <rect x="10" y="1" width="2" height="3" fill=${color} />
      <rect x="10" y="18" width="2" height="3" fill=${color} />
      <rect x="1" y="10" width="3" height="2" fill=${color} />
      <rect x="18" y="10" width="3" height="2" fill=${color} />
      <circle cx="11" cy="11" r="2.3" stroke=${color} stroke-width="1.2" fill="none" />
      <rect x="10.25" y="10.25" width="1.5" height="1.5" fill=${color} />
    </svg>
  `
}

export function OutputIcon({ size = 22, color = '#5a8a5a' }) {
  return html`
    <svg width=${size} height=${size} viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="4" width="10" height="14" stroke=${color} stroke-width="1.5" fill="none" />
      <path d="M2 11 L8 11" stroke=${color} stroke-width="2" stroke-linecap="square" />
      <path d="M5 8 L8 11 L5 14" stroke=${color} stroke-width="2" stroke-linecap="square" fill="none" />
    </svg>
  `
}

export function UnconfiguredIcon({ size = 22, color = '#5a5a5a' }) {
  return html`
    <svg width=${size} height=${size} viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="16" height="16" stroke=${color} stroke-width="1" stroke-dasharray="2 2" fill="none" />
      <text x="11" y="15" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" fill=${color} font-weight="600">?</text>
    </svg>
  `
}

export function SplitterIcon({ size = 22, color = '#4050a0' }) {
  return html`
    <svg width=${size} height=${size} viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 11 L10 11" stroke=${color} stroke-width="2" stroke-linecap="square" />
      <path d="M10 11 L18 5" stroke=${color} stroke-width="2" stroke-linecap="square" />
      <path d="M10 11 L18 17" stroke=${color} stroke-width="2" stroke-linecap="square" />
    </svg>
  `
}

export function MergeIcon({ size = 22, color = '#4050a0' }) {
  return html`
    <svg width=${size} height=${size} viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 5 L12 11" stroke=${color} stroke-width="2" stroke-linecap="square" />
      <path d="M4 17 L12 11" stroke=${color} stroke-width="2" stroke-linecap="square" />
      <path d="M12 11 L19 11" stroke=${color} stroke-width="2" stroke-linecap="square" />
    </svg>
  `
}

export function BadgeBang({ kind = 'error' }) {
  const fill = kind === 'error' ? '#cc1c1c' : '#aa7010'
  return html`
    <g>
      <circle r="8" fill=${fill} />
      <rect x="-0.75" y="-4.5" width="1.5" height="5" fill="#fff" />
      <rect x="-0.75" y="2.5" width="1.5" height="1.5" fill="#fff" />
    </g>
  `
}

const MACHINE_ICON_MAP = { furnace: FurnaceIcon, assembler: AssemblerIcon }
export function getMachineIcon(iconKey, size = 18) {
  const Icon = MACHINE_ICON_MAP[iconKey] || UnconfiguredIcon
  return html`<${Icon} size=${size} />`
}
