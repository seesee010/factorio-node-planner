import { h } from 'https://esm.sh/preact@10'
import htm from 'https://esm.sh/htm@3'
const html = htm.bind(h)

// Machine / node icons used by the Inspector library cards
// Each function returns an SVG element at the given size

function FurnaceIcon({ size = 18, color = '#c8c8c8' }) {
  return html`
    <svg width=${size} height=${size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="12" stroke=${color} strokeWidth="1.2" fill="none"/>
      <rect x="4" y="4" width="8" height="5" stroke=${color} strokeWidth="1" fill="none"/>
      <path d="M5 12 L5 9 M8 12 L8 9 M11 12 L11 9" stroke=${color} strokeWidth="1" strokeLinecap="square"/>
    </svg>
  `
}

function AssemblerIcon({ size = 18, color = '#c8c8c8' }) {
  return html`
    <svg width=${size} height=${size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="10" height="10" stroke=${color} strokeWidth="1.2" fill="none"/>
      <circle cx="8" cy="8" r="2" stroke=${color} strokeWidth="1" fill="none"/>
      <path d="M8 3 L8 6 M8 10 L8 13 M3 8 L6 8 M10 8 L13 8" stroke=${color} strokeWidth="1" strokeLinecap="square"/>
    </svg>
  `
}

const MACHINE_ICONS = {
  furnace: FurnaceIcon,
  assembler: AssemblerIcon,
}

export function getMachineIcon(iconKey, size = 18, color = '#c8c8c8') {
  const Icon = MACHINE_ICONS[iconKey]
  if (!Icon) return null
  return html`<${Icon} size=${size} color=${color} />`
}

export { FurnaceIcon, AssemblerIcon }
