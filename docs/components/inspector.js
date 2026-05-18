import { h, Fragment } from 'https://esm.sh/preact@10'
import { useState, useEffect, useRef } from 'https://esm.sh/preact@10/hooks'
import htm from 'https://esm.sh/htm@3'
const html = htm.bind(h)
import { getMachineIcon } from '../icons.js'

// ---------------------------------------------------------------------------
// Item / Object library — fallback (hardcoded) used when gameData === null
// ---------------------------------------------------------------------------

const FALLBACK_ITEM_LIBRARY = [
  { id: 'iron-ore',   label: 'iron ore',   desc: 'raw material · ore', color: '#a85e24' },
  { id: 'copper-ore', label: 'copper ore', desc: 'raw material · ore', color: '#8B4513' },
]

const FALLBACK_OBJECT_LIBRARY = [
  { id: 'furnace',   label: 'furnace',   desc: 'smelter · stone · 1×', header: '#181408', iconKey: 'furnace' },
  { id: 'assembler', label: 'assembler', desc: 'crafter · 1×',          header: '#12142a', iconKey: 'assembler' },
  { id: 'output',    label: 'output',    desc: 'sink · endpoint',        header: '#0e1a10', iconKey: 'output' },
]

// ---------------------------------------------------------------------------
// Color map for known source items
// ---------------------------------------------------------------------------

const ITEM_COLORS = {
  'iron-ore':    '#a85e24',
  'copper-ore':  '#8B4513',
  'coal':        '#2a2a2a',
  'stone':       '#8a7a60',
  'wood':        '#6b4226',
  'uranium-ore': '#4a7a20',
  'raw-fish':    '#1a5a7a',
}
const DEFAULT_ITEM_COLOR = '#5a5a5a'

// ---------------------------------------------------------------------------
// Build item library dynamically from gameData
// ---------------------------------------------------------------------------

function buildItemLibrary(gameData) {
  if (!gameData || !Array.isArray(gameData.sourceItems)) return FALLBACK_ITEM_LIBRARY
  const items = gameData.sourceItems.slice(0, 12)
  return items.map(item => ({
    id:    item.id,
    label: item.label,
    desc:  'raw material · source',
    color: ITEM_COLORS[item.id] || DEFAULT_ITEM_COLOR,
  }))
}

// ---------------------------------------------------------------------------
// Build object library dynamically from gameData
// ---------------------------------------------------------------------------

function buildObjectLibrary(gameData) {
  if (!gameData || !Array.isArray(gameData.machines)) return FALLBACK_OBJECT_LIBRARY

  const TYPE_META = {
    'furnace':         { label: 'smelter',       header: '#181408', iconKey: 'furnace' },
    'assembling-machine': { label: 'crafter',    header: '#12142a', iconKey: 'assembler' },
    'mining-drill':    { label: 'drill',          header: '#1a1408', iconKey: 'assembler' },
    'pump':            { label: 'pump',           header: '#0e1420', iconKey: 'assembler' },
    'boiler':          { label: 'boiler',         header: '#1a0e0e', iconKey: 'furnace' },
    'lab':             { label: 'lab',            header: '#0e1a14', iconKey: 'assembler' },
  }

  const relevant = gameData.machines
    .sort((a, b) => {
      const order = ['furnace', 'assembling-machine', 'mining-drill', 'pump', 'boiler', 'lab']
      const ai = order.indexOf(a.entityType ?? ''), bi = order.indexOf(b.entityType ?? '')
      if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
      return a.speed - b.speed
    })
    .map(m => {
      const meta = TYPE_META[m.entityType] || { label: 'machine', header: '#12142a', iconKey: 'assembler' }
      return {
        id:          m.id,
        label:       m.label,
        desc:        `${meta.label} · ${m.speed}×`,
        header:      meta.header,
        iconKey:     meta.iconKey,
        entityType:  m.entityType,
        speed:       m.speed,
        energyUsage: m.energyUsage,
        machineId:   m.id,
      }
    })

  relevant.push({
    id:      'output',
    label:   'output',
    desc:    'sink · endpoint',
    header:  '#0e1a10',
    iconKey: 'output',
  })

  return relevant
}

// ---------------------------------------------------------------------------
// Inspector (default export)
// ---------------------------------------------------------------------------

export default function Inspector({
  node,
  screenPos,
  onClose,
  onUpdateNode,
  multiCount = 1,
  gameData = null,
}) {
  const [activeTab, setActiveTab] = useState('items')
  const [closeHover, setCloseHover] = useState(false)
  const [search, setSearch] = useState('')
  const searchRef = useRef(null)

  const itemLibrary   = buildItemLibrary(gameData)
  const objectLibrary = buildObjectLibrary(gameData)

  const searchLower = search.toLowerCase()
  const filteredItems   = search ? itemLibrary.filter(e => e.label.toLowerCase().includes(searchLower) || e.desc.toLowerCase().includes(searchLower)) : itemLibrary
  const filteredObjects = search ? objectLibrary.filter(e => e.label.toLowerCase().includes(searchLower) || e.desc.toLowerCase().includes(searchLower)) : objectLibrary

  useEffect(() => {
    if (searchRef.current) searchRef.current.focus()
  }, [])

  // ESC key handler
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (search) { setSearch(''); return }
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, search])

  function applyPreset(entry) {
    if (entry.kind === 'item') {
      onUpdateNode({
        name: entry.label.toUpperCase(),
        sublabel: entry.desc,
        type: 'source',
        header: '#182210',
        inputs: [],
        outputs: [{ item: entry.id, flowState: 'ok' }],
      })
    } else if (entry.id === 'output') {
      onUpdateNode({
        name: 'OUTPUT',
        sublabel: entry.desc,
        type: 'output',
        header: entry.header,
        inputs:  [{ item: null, flowState: 'ok' }],
        outputs: [],
      })
    } else {
      const patch = {
        name:     entry.label.toUpperCase(),
        sublabel: `${entry.speed}× · ${entry.energyUsage}kW`,
        type:     entry.entityType === 'furnace' ? 'furnace' : 'assembler',
        header:   entry.entityType === 'furnace' ? '#181408' : '#12142a',
        inputs:   [{ item: null, flowState: 'ok' }],
        outputs:  [{ item: null, flowState: 'ok' }],
      }
      if (entry.machineId)       patch.machineId    = entry.machineId
      if (entry.speed != null)   patch.machineSpeed = entry.speed
      onUpdateNode(patch)
    }
  }

  const isMulti = multiCount > 1

  return html`
    <div
      style=${{
        position: 'fixed',
        left: screenPos.x,
        top: screenPos.y,
        width: 280,
        background: '#101010',
        border: '1px solid #2a2a2a',
        zIndex: 50,
        boxShadow: '0 12px 32px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(88,120,200,0.05)',
        fontFamily: 'JetBrains Mono, monospace',
      }}
      onMouseDown=${(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div style=${{
        borderBottom: '1px solid #1e1e1e',
        display: 'flex',
      }}>
        <!-- Left info area -->
        <div style=${{ flex: 1, padding: '12px 14px' }}>
          ${isMulti
            ? html`
              <div style=${{
                fontSize: 13,
                color: '#5878c8',
                fontWeight: 600,
                letterSpacing: '0.06em',
              }}>${multiCount} NODES</div>
              <div style=${{
                fontSize: 9.5,
                color: '#3a3a3a',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginTop: 4,
              }}>choose preset — applies to all</div>
            `
            : html`
              <div style=${{
                fontSize: 13,
                color: '#e6e6e6',
                fontWeight: 600,
                letterSpacing: '0.06em',
              }}>${node ? node.name : '—'}</div>
              <div style=${{
                fontSize: 9.5,
                color: '#3a3a3a',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginTop: 4,
              }}>${node ? '#' + node.id + ' · ' + node.type : ''}</div>
            `
          }
        </div>
        <!-- Close button -->
        <button
          onClick=${onClose}
          style=${{
            width: 32,
            background: 'transparent',
            border: 'none',
            borderLeft: '1px solid #1e1e1e',
            fontSize: 12,
            color: closeHover ? '#c8c8c8' : '#5a5a5a',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter=${() => setCloseHover(true)}
          onMouseLeave=${() => setCloseHover(false)}
        >×</button>
      </div>

      <!-- Search -->
      <div style=${{ borderBottom: '1px solid #1e1e1e' }}>
        <input
          ref=${searchRef}
          type="text"
          placeholder="search..."
          value=${search}
          onInput=${(e) => setSearch(e.target.value)}
          style=${{
            width: '100%',
            boxSizing: 'border-box',
            padding: '8px 12px',
            background: '#0c0c0c',
            border: 'none',
            outline: 'none',
            color: '#e6e6e6',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.04em',
          }}
        />
      </div>

      <!-- Tabs -->
      <div style=${{
        background: '#0c0c0c',
        borderBottom: '1px solid #1e1e1e',
        display: 'flex',
      }}>
        ${['items', 'objects'].map(tab => html`
          <button
            key=${tab}
            style=${{
              flex: 1,
              background: activeTab === tab ? '#101010' : 'transparent',
              border: 'none',
              borderRight: tab === 'items' ? '1px solid #1e1e1e' : 'none',
              padding: '8px 0',
              cursor: 'pointer',
              position: 'relative',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10.5,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: activeTab === tab ? '#e6e6e6' : '#5a5a5a',
            }}
            onClick=${() => setActiveTab(tab)}
          >
            ${tab}
            ${activeTab === tab && html`
              <span style=${{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: -1,
                height: 1.5,
                background: '#5878c8',
              }} />
            `}
          </button>
        `)}
      </div>

      <!-- Library grid -->
      <div style=${{
        padding: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        maxHeight: 280,
        overflowY: 'auto',
      }}>
        ${activeTab === 'items'
          ? filteredItems.map(entry => html`
            <${ItemCard}
              key=${entry.id}
              entry=${{ ...entry, kind: 'item' }}
              onApply=${applyPreset}
            />
          `)
          : filteredObjects.map(entry => html`
            <${ObjectCard}
              key=${entry.id}
              entry=${{ ...entry, kind: 'object' }}
              onApply=${applyPreset}
            />
          `)
        }
      </div>

      <!-- Footer hint -->
      <div style=${{
        padding: '7px 12px 9px',
        borderTop: '1px solid #1e1e1e',
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 9,
        color: '#383838',
        letterSpacing: '0.1em',
      }}>
        <span>esc to close</span>
        <span>dbl-click node to open</span>
      </div>
    </div>
  `
}

// ---------------------------------------------------------------------------
// ItemCard
// ---------------------------------------------------------------------------

function ItemCard({ entry, onApply }) {
  const [hover, setHover] = useState(false)

  return html`
    <button
      style=${{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 10px',
        background: hover ? '#181818' : '#141414',
        border: '1px solid ' + (hover ? '#2a2a2a' : '#1e1e1e'),
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        fontFamily: 'JetBrains Mono, monospace',
      }}
      onMouseEnter=${() => setHover(true)}
      onMouseLeave=${() => setHover(false)}
      onClick=${() => onApply(entry)}
    >
      <!-- Icon box -->
      <div style=${{
        width: 18,
        height: 18,
        background: '#0c0c0c',
        border: '1px solid #1e1e1e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <div style=${{ width: 8, height: 8, background: entry.color }} />
      </div>
      <!-- Text column -->
      <div>
        <div style=${{
          fontSize: 11,
          color: '#e6e6e6',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>${entry.label}</div>
        <div style=${{
          fontSize: 9.5,
          color: '#5a5a5a',
          marginTop: 2,
        }}>${entry.desc}</div>
      </div>
    </button>
  `
}

// ---------------------------------------------------------------------------
// ObjectCard
// ---------------------------------------------------------------------------

function ObjectCard({ entry, onApply }) {
  const [hover, setHover] = useState(false)

  return html`
    <button
      style=${{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 10px',
        background: hover ? '#181818' : '#141414',
        border: '1px solid ' + (hover ? '#2a2a2a' : '#1e1e1e'),
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        fontFamily: 'JetBrains Mono, monospace',
      }}
      onMouseEnter=${() => setHover(true)}
      onMouseLeave=${() => setHover(false)}
      onClick=${() => onApply(entry)}
    >
      <!-- Icon box -->
      <div style=${{
        width: 28,
        height: 24,
        background: entry.header,
        borderBottom: '1px solid #262626',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        ${getMachineIcon(entry.iconKey, 18, '#c8c8c8')}
      </div>
      <!-- Text column -->
      <div>
        <div style=${{
          fontSize: 11,
          color: '#e6e6e6',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>${entry.label}</div>
        <div style=${{
          fontSize: 9.5,
          color: '#5a5a5a',
          marginTop: 2,
        }}>${entry.desc}</div>
      </div>
    </button>
  `
}
