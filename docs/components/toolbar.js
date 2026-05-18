import { h, Fragment } from 'https://esm.sh/preact@10'
import { useState, useEffect } from 'https://esm.sh/preact@10/hooks'
import htm from 'https://esm.sh/htm@3'
const html = htm.bind(h)

const RAIL_W = 52
const BTN_H  = 40

// ---------------------------------------------------------------------------
// Inline SVG icon functions — each returns an SVG element (16×16 viewBox)
// ---------------------------------------------------------------------------

const ICONS = {
  menu: (color) => html`
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="12" height="1.5" fill=${color}/>
      <rect x="2" y="7.25" width="12" height="1.5" fill=${color}/>
      <rect x="2" y="11.5" width="12" height="1.5" fill=${color}/>
    </svg>
  `,

  select: (color) => html`
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 2 L3 12 L6 9 L8 13 L10 12 L8 8 L12 8 Z"
        fill=${color} stroke=${color} strokeWidth="0.5" strokeLinejoin="miter"/>
    </svg>
  `,

  pan: (color) => html`
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 2 L8 14 M2 8 L14 8"
        stroke=${color} strokeWidth="1.5" strokeLinecap="square" fill="none"/>
      <path d="M5 5 L8 2 L11 5 M5 11 L8 14 L11 11 M5 5 L2 8 L5 11 M11 5 L14 8 L11 11"
        stroke=${color} strokeWidth="1.5" strokeLinecap="square" fill="none"/>
    </svg>
  `,

  node: (color) => html`
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="12" height="10" stroke=${color} strokeWidth="1" fill="none"/>
      <rect x="2" y="3" width="12" height="3" fill=${color}/>
      <circle cx="2" cy="9.5" r="1" fill=${color}/>
      <circle cx="14" cy="9.5" r="1" fill=${color}/>
    </svg>
  `,

  splitter: (color) => html`
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 3 L4 13 L13 8 Z"
        fill=${color} stroke=${color} strokeWidth="0.5" strokeLinejoin="miter"/>
    </svg>
  `,

  merger: (color) => html`
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3 L12 13 L3 8 Z"
        fill=${color} stroke=${color} strokeWidth="0.5" strokeLinejoin="miter"/>
    </svg>
  `,

  wire: (color) => html`
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 4 C 7 4, 9 12, 13 12"
        stroke=${color} strokeWidth="1.5" fill="none"/>
      <circle cx="3" cy="4" r="1.6" fill=${color}/>
      <circle cx="13" cy="12" r="1.6" fill=${color}/>
    </svg>
  `,

  trash: (color) => html`
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 4 L13 4"
        stroke=${color} strokeWidth="1.2" strokeLinecap="square" fill="none"/>
      <path d="M6 4 L6 2.5 L10 2.5 L10 4"
        stroke=${color} strokeWidth="1.2" strokeLinecap="square" fill="none"/>
      <path d="M4.5 4 L5 13 L11 13 L11.5 4"
        stroke=${color} strokeWidth="1.2" strokeLinecap="square" fill="none"/>
      <path d="M6.5 6.5 L7 11 M9 6.5 L9.5 11"
        stroke=${color} strokeWidth="1.2" strokeLinecap="square" fill="none"/>
    </svg>
  `,

  undo: (color) => html`
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8 C 3 5, 6 3, 9 3 C 12 3, 14 5, 14 8"
        stroke=${color} strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" fill="none"/>
      <path d="M3 5 L3 8 L6 8"
        stroke=${color} strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" fill="none"/>
    </svg>
  `,

  redo: (color) => html`
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 8 C 13 5, 10 3, 7 3 C 4 3, 2 5, 2 8"
        stroke=${color} strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" fill="none"/>
      <path d="M13 5 L13 8 L10 8"
        stroke=${color} strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" fill="none"/>
    </svg>
  `,

  settings: (color) => html`
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="4" cy="4" r="1.5" stroke=${color} strokeWidth="1.2" fill="none"/>
      <path d="M7 4 L14 4"
        stroke=${color} strokeWidth="1.2" strokeLinecap="square" fill="none"/>
      <circle cx="11" cy="8" r="1.5" stroke=${color} strokeWidth="1.2" fill="none"/>
      <path d="M2 8 L8 8 M13 8 L14 8"
        stroke=${color} strokeWidth="1.2" strokeLinecap="square" fill="none"/>
      <circle cx="6" cy="12" r="1.5" stroke=${color} strokeWidth="1.2" fill="none"/>
      <path d="M2 12 L3 12 M8 12 L14 12"
        stroke=${color} strokeWidth="1.2" strokeLinecap="square" fill="none"/>
    </svg>
  `,
}

// ---------------------------------------------------------------------------
// ToolButton
// ---------------------------------------------------------------------------

function ToolButton({ iconKey, label, shortcut, active, disabled, badge, onClick, orientation = 'left' }) {
  const [hover, setHover] = useState(false)

  let color = '#7a7a7a'
  if (disabled) color = '#333333'
  else if (active) color = '#e6e6e6'
  else if (hover) color = '#c8c8c8'

  const isLeft = orientation === 'left'

  return html`
    <div style=${{ position: 'relative', width: RAIL_W, height: BTN_H }}
      onMouseEnter=${() => setHover(true)}
      onMouseLeave=${() => setHover(false)}>
      <button
        onClick=${disabled ? undefined : onClick}
        disabled=${disabled}
        style=${{
          width: '100%',
          height: '100%',
          background: active ? '#191919' : (hover && !disabled ? '#161616' : 'transparent'),
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
        ${active && html`<span style=${isLeft
          ? { position: 'absolute', left: 0, top: 6, bottom: 6, width: 2, background: '#5878c8' }
          : { position: 'absolute', bottom: 0, left: 6, right: 6, height: 2, background: '#5878c8' }
        } />`}
        ${ICONS[iconKey](color)}
        ${badge && html`<span style=${{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 5,
          height: 5,
          background: badge === 'error' ? '#cc1c1c' : '#aa7010',
        }} />`}
      </button>
      ${hover && !disabled && html`
        <div style=${{
          position: 'absolute',
          ...(isLeft
            ? { top: '50%', transform: 'translateY(-50%)', left: RAIL_W + 6 }
            : { left: '50%', transform: 'translateX(-50%)', top: RAIL_W + 6 }),
          background: '#0a0a0a',
          border: '1px solid #1e1e1e',
          padding: '5px 9px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10.5,
          color: '#c8c8c8',
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
          pointerEvents: 'none',
          zIndex: 50,
        }}>
          <span>${label}</span>
          ${shortcut && html`<span style=${{ color: '#4a4a4a', fontSize: 9.5 }}>${shortcut}</span>`}
        </div>
      `}
    </div>
  `
}

// ---------------------------------------------------------------------------
// RailDivider
// ---------------------------------------------------------------------------

function RailDivider({ orientation = 'left' }) {
  if (orientation === 'left') {
    return html`<div style=${{ padding: '6px 10px' }}>
      <div style=${{ height: 1, background: '#1e1e1e' }} />
    </div>`
  }
  return html`<div style=${{ padding: '10px 6px', display: 'flex', alignItems: 'center' }}>
    <div style=${{ width: 1, height: '100%', background: '#1e1e1e' }} />
  </div>`
}

// ---------------------------------------------------------------------------
// MenuFlyout
// ---------------------------------------------------------------------------

function MenuFlyout({ orientation, onClose, onNew, onSave, onExportURL }) {
  const isLeft = orientation === 'left'

  const posStyle = isLeft
    ? { top: 0, left: RAIL_W }
    : { top: RAIL_W, left: 0 }

  const borderStyle = isLeft
    ? { borderLeft: 'none' }
    : { borderTop: 'none' }

  const itemStyle = (hovered) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '7px 12px',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 11,
    color: '#c8c8c8',
    cursor: 'pointer',
    background: hovered ? '#161616' : 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
  })

  const headingStyle = {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 9,
    color: '#383838',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    padding: '8px 12px 4px',
  }

  const kbdStyle = {
    color: '#3a3a3a',
    fontSize: 9.5,
    fontFamily: 'JetBrains Mono, monospace',
  }

  const dividerStyle = {
    height: 1,
    background: '#1e1e1e',
  }

  const [hovered, setHovered] = useState(null)

  const sections = [
    {
      title: 'File',
      items: [
        { label: 'new graph',    kbd: '⌘N', action: onNew },
        { label: 'save as json', kbd: '⌘S', action: onSave },
        { label: 'copy URL',     kbd: '⌘E', action: onExportURL },
      ],
    },
    {
      title: 'Help',
      items: [
        { label: 'V select · H pan · C wire', dimmed: true },
        { label: 'N node · S split · M merge', dimmed: true },
        { label: 'Del delete · dbl-click config', dimmed: true },
      ],
    },
  ]

  return html`
    <${Fragment}>
      <div
        style=${{ position: 'fixed', inset: 0, zIndex: 40 }}
        onClick=${onClose}
      />
      <div style=${{
        position: 'absolute',
        ...posStyle,
        width: 220,
        background: '#101010',
        border: '1px solid #1e1e1e',
        ...borderStyle,
        zIndex: 45,
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        <div style=${{ padding: '10px 12px 8px', borderBottom: '1px solid #1e1e1e' }}>
          <div style=${{ fontSize: 11, color: '#c8c8c8', letterSpacing: '0.08em' }}>FACTORIO-FLOW</div>
          <div style=${{ fontSize: 9.5, color: '#4a4a4a', marginTop: 3, letterSpacing: '0.04em' }}>⌘S save · ⌘Z undo</div>
        </div>
        ${sections.map((section, si) => html`
          <div key=${section.title}>
            ${si > 0 && html`<div style=${dividerStyle} />`}
            <div style=${headingStyle}>${section.title}</div>
            ${section.items.map((item, ii) => html`
              <button
                key=${item.label}
                style=${{
                  ...itemStyle(hovered === `${si}-${ii}`),
                  color: item.dimmed ? '#4a4a4a' : '#c8c8c8',
                  cursor: item.dimmed ? 'default' : 'pointer',
                }}
                onMouseEnter=${() => !item.dimmed && setHovered(`${si}-${ii}`)}
                onMouseLeave=${() => setHovered(null)}
                onClick=${item.dimmed ? undefined : () => { item.action?.(); onClose() }}
              >
                <span>${item.label}</span>
                ${item.kbd && html`<span style=${kbdStyle}>${item.kbd}</span>`}
              </button>
            `)}
          </div>
        `)}
      </div>
    </${Fragment}>
  `
}

// ---------------------------------------------------------------------------
// SettingsFlyout
// ---------------------------------------------------------------------------

function SettingsFlyout({ orientation, settings, setSettings, onClose }) {
  const isLeft = orientation === 'left'

  const posStyle = isLeft
    ? { bottom: 0, left: RAIL_W }
    : { top: RAIL_W, right: 0 }

  const borderStyle = isLeft
    ? { borderLeft: 'none' }
    : { borderTop: 'none' }

  const [rowHover, setRowHover] = useState(null)

  const headingStyle = {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 9,
    color: '#383838',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    padding: '8px 12px 6px',
  }

  function TogglePill({ value }) {
    return html`
      <div style=${{
        position: 'relative',
        width: 22,
        height: 12,
        background: value ? '#5878c8' : '#262626',
        flexShrink: 0,
      }}>
        <div style=${{
          position: 'absolute',
          top: 1,
          left: value ? 11 : 1,
          width: 10,
          height: 10,
          background: '#0f0f0f',
        }} />
      </div>
    `
  }

  function ToggleRow({ label, settingKey, idx }) {
    const active = settings[settingKey]
    return html`
      <div
        style=${{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '7px 12px',
          cursor: 'pointer',
          background: rowHover === idx ? '#161616' : 'transparent',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10.5,
          color: '#c8c8c8',
        }}
        onMouseEnter=${() => setRowHover(idx)}
        onMouseLeave=${() => setRowHover(null)}
        onClick=${() => setSettings({ ...settings, [settingKey]: !active })}
      >
        <span>${label}</span>
        <${TogglePill} value=${active} />
      </div>
    `
  }

  const radioOptions = [
    { value: 'left', label: 'left' },
    { value: 'top', label: 'top' },
  ]

  return html`
    <${Fragment}>
      <div
        style=${{ position: 'fixed', inset: 0, zIndex: 40 }}
        onClick=${onClose}
      />
      <div style=${{
        position: 'absolute',
        ...posStyle,
        width: 240,
        background: '#101010',
        border: '1px solid #1e1e1e',
        ...borderStyle,
        zIndex: 45,
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        <div style=${headingStyle}>Toolbar</div>
        <div style=${{ display: 'flex', gap: 4, padding: '0 12px 10px' }}>
          ${radioOptions.map(opt => html`
            <button
              key=${opt.value}
              style=${{
                flex: 1,
                padding: '5px 0',
                background: settings.toolbarPosition === opt.value ? '#191919' : 'transparent',
                border: `1px solid ${settings.toolbarPosition === opt.value ? '#5878c8' : '#262626'}`,
                color: settings.toolbarPosition === opt.value ? '#e6e6e6' : '#7a7a7a',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor: 'pointer',
              }}
              onClick=${() => setSettings({ ...settings, toolbarPosition: opt.value })}
            >${opt.label}</button>
          `)}
        </div>
        <div style=${{ height: 1, background: '#1e1e1e' }} />
        <div style=${headingStyle}>View</div>
        <${ToggleRow} label="show grid"    settingKey="grid"       idx="grid" />
        <${ToggleRow} label="snap to grid" settingKey="snap"       idx="snap" />
        <${ToggleRow} label="edge labels"  settingKey="edgeLabels" idx="edgeLabels" />
      </div>
    </${Fragment}>
  `
}

// ---------------------------------------------------------------------------
// Main Toolbar (default export)
// ---------------------------------------------------------------------------

export default function Toolbar({
  orientation = 'left',
  activeTool,
  setActiveTool,
  hasSelection,
  onDelete,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  errorCount,
  settings,
  setSettings,
  onNew,
  onSave,
  onExportURL,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Close popups when orientation changes
  useEffect(() => { setMenuOpen(false); setSettingsOpen(false) }, [orientation])

  const setTool = (t) => setActiveTool(activeTool === t ? 'select' : t)
  const isLeft = orientation === 'left'

  const containerStyle = isLeft
    ? {
        position: 'absolute', top: 0, left: 0, bottom: 0, width: RAIL_W,
        borderRight: '1px solid #1e1e1e', flexDirection: 'column',
        background: '#121212', display: 'flex', zIndex: 30,
      }
    : {
        position: 'absolute', top: 0, left: 0, right: 188, height: RAIL_W,
        borderBottom: '1px solid #1e1e1e', flexDirection: 'row',
        background: '#121212', display: 'flex', zIndex: 30,
      }

  return html`
    <div style=${containerStyle}>
      ${menuOpen && html`<${MenuFlyout} orientation=${orientation} onClose=${() => setMenuOpen(false)} onNew=${onNew} onSave=${onSave} onExportURL=${onExportURL} />`}
      ${settingsOpen && html`<${SettingsFlyout}
        orientation=${orientation}
        settings=${settings}
        setSettings=${setSettings}
        onClose=${() => setSettingsOpen(false)}
      />`}

      <!-- Menu -->
      <${ToolButton}
        iconKey="menu"
        label="menu"
        active=${menuOpen}
        onClick=${() => { setMenuOpen(!menuOpen); setSettingsOpen(false) }}
        orientation=${orientation}
      />

      <${RailDivider} orientation=${orientation} />

      <!-- Tool buttons -->
      <${ToolButton}
        iconKey="select"
        label="select"
        shortcut="V"
        active=${activeTool === 'select'}
        onClick=${() => setTool('select')}
        orientation=${orientation}
      />
      <${ToolButton}
        iconKey="pan"
        label="pan"
        shortcut="H"
        active=${activeTool === 'pan'}
        onClick=${() => setTool('pan')}
        orientation=${orientation}
      />

      <${RailDivider} orientation=${orientation} />

      <${ToolButton}
        iconKey="node"
        label="add node"
        shortcut="A"
        active=${activeTool === 'add-node'}
        onClick=${() => setTool('add-node')}
        orientation=${orientation}
      />
      <${ToolButton}
        iconKey="splitter"
        label="add splitter"
        shortcut="S"
        active=${activeTool === 'add-splitter'}
        onClick=${() => setTool('add-splitter')}
        orientation=${orientation}
      />
      <${ToolButton}
        iconKey="merger"
        label="add merger"
        shortcut="M"
        active=${activeTool === 'add-merger'}
        onClick=${() => setTool('add-merger')}
        orientation=${orientation}
      />

      <${RailDivider} orientation=${orientation} />

      <${ToolButton}
        iconKey="wire"
        label="connect"
        shortcut="C"
        active=${activeTool === 'wire'}
        onClick=${() => setTool('wire')}
        orientation=${orientation}
      />
      <${ToolButton}
        iconKey="trash"
        label="delete"
        shortcut="⌫"
        disabled=${!hasSelection}
        onClick=${onDelete}
        orientation=${orientation}
      />

      <${RailDivider} orientation=${orientation} />

      <${ToolButton}
        iconKey="undo"
        label="undo"
        shortcut="⌘Z"
        disabled=${!canUndo}
        onClick=${onUndo}
        orientation=${orientation}
      />
      <${ToolButton}
        iconKey="redo"
        label="redo"
        shortcut="⌘⇧Z"
        disabled=${!canRedo}
        onClick=${onRedo}
        orientation=${orientation}
      />

      <!-- Flex spacer -->
      <div style=${{ flex: 1 }} />

      <!-- Error count -->
      ${errorCount > 0 && html`
        <div style=${{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          padding: isLeft ? '4px 0' : '0 4px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          color: '#aa7010',
        }}>
          <span style=${{ width: 5, height: 5, background: '#aa7010', display: 'inline-block' }} />
          <span>${errorCount}</span>
        </div>
      `}

      <${RailDivider} orientation=${orientation} />

      <!-- Settings -->
      <${ToolButton}
        iconKey="settings"
        label="settings"
        active=${settingsOpen}
        badge=${errorCount > 0 ? 'warning' : null}
        onClick=${() => { setSettingsOpen(!settingsOpen); setMenuOpen(false) }}
        orientation=${orientation}
      />
    </div>
  `
}
