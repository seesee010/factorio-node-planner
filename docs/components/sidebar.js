import { h, Fragment } from 'https://esm.sh/preact@10'
import { useState, useRef, useEffect, useCallback } from 'https://esm.sh/preact@10/hooks'
import htm from 'https://esm.sh/htm@3'
const html = htm.bind(h)

// ---------------------------------------------------------------------------
// Section — reusable section wrapper
// ---------------------------------------------------------------------------

function Section({ title, count, children }) {
  return html`
    <div style=${{ borderBottom: '1px solid #1e1e1e', padding: '14px 14px 16px' }}>
      <div style=${{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
      }}>
        <span style=${{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          color: '#383838',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}>${title}</span>
        ${count !== undefined && html`
          <span style=${{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9.5,
            color: '#4a4a4a',
          }}>${count}</span>
        `}
      </div>
      ${children}
    </div>
  `
}

// ---------------------------------------------------------------------------
// KV — key/value row
// ---------------------------------------------------------------------------

function KV({ k, v, vColor }) {
  return html`
    <div style=${{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '3px 0',
    }}>
      <span style=${{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10.5,
        color: '#6a6a6a',
      }}>${k}</span>
      <span style=${{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        color: vColor || '#c8c8c8',
      }}>${v}</span>
    </div>
  `
}

// ---------------------------------------------------------------------------
// Sidebar (default export)
// ---------------------------------------------------------------------------

function GoalPanel({ flow }) {
  const [mode, setMode] = useState('auto')
  const [customTarget, setCustomTarget] = useState(300)

  const actual = flow.platesOut
  const efficiency = mode === 'auto'
    ? flow.efficiency
    : (customTarget > 0 ? Math.round((actual / customTarget) * 100) : 0)
  const effColor = efficiency >= 100 ? '#3a9c3a' : efficiency > 0 ? '#cc6820' : '#4a4a4a'

  return html`
    <div style=${{ borderBottom: '1px solid #1e1e1e', padding: '12px 14px' }}>
      <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style=${{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, color: '#383838',
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>Goal</span>
        <div style=${{ display: 'flex', gap: 2 }}>
          ${['auto', 'custom'].map(m => html`
            <button key=${m} onClick=${() => setMode(m)} style=${{
              padding: '2px 8px',
              background: mode === m ? '#191919' : 'transparent',
              border: `1px solid ${mode === m ? '#5878c8' : '#262626'}`,
              color: mode === m ? '#c8c8c8' : '#4a4a4a',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em',
              cursor: 'pointer',
            }}>${m}</button>
          `)}
        </div>
      </div>

      ${mode === 'custom' && html`
        <div style=${{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style=${{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#6a6a6a',
          }}>target</span>
          <input
            type="number" min="1" value=${customTarget}
            onInput=${(e) => setCustomTarget(Math.max(1, Number(e.target.value) || 1))}
            style=${{
              width: 64, background: '#0c0c0c',
              border: '1px solid #2a2a2a', outline: 'none',
              color: '#e6e6e6', fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11, padding: '3px 6px',
            }}
          />
          <span style=${{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#4a4a4a' }}>/min</span>
        </div>
      `}

      <div style=${{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 20,
        color: '#e6e6e6', lineHeight: 1.1,
      }}>
        ${actual}
        ${mode === 'custom'
          ? html`<span style=${{ fontSize: 10, color: '#4a4a4a', marginLeft: 4 }}> / ${customTarget} /min</span>`
          : html`<span style=${{ fontSize: 10, color: '#4a4a4a', marginLeft: 4 }}>/min</span>`
        }
      </div>
      <div style=${{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5,
        color: effColor, marginTop: 4,
      }}>efficiency ${efficiency}%</div>
    </div>
  `
}

const MIN_W = 150
const MAX_W = 380

export default function Sidebar({
  selectedNode,
  errorNodes,
  flow,
  sourceOutput,
  setSourceOutput,
  scale,
  onResetView,
  multiSelectCount = 0,
  nodeCount = 0,
  edgeCount = 0,
  gameVersion,
  setGameVersion,
  gameDataLoaded,
}) {
  const [width, setWidth] = useState(220)
  const dragRef = useRef(null)

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return
      const dx = dragRef.current.startX - e.clientX
      const newW = Math.max(MIN_W, Math.min(MAX_W, dragRef.current.startW + dx))
      setWidth(newW)
    }
    const onUp = () => { dragRef.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  return html`
    <div style=${{
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width,
      background: '#121212',
      borderLeft: '1px solid #1e1e1e',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 5,
    }}>

      <!-- Resize handle -->
      <div
        onMouseDown=${(e) => { e.preventDefault(); dragRef.current = { startX: e.clientX, startW: width } }}
        style=${{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 4,
          cursor: 'col-resize',
          zIndex: 10,
        }}
      />

      <!-- Title bar -->
      <div style=${{
        padding: '14px 14px 10px',
        borderBottom: '1px solid #1e1e1e',
      }}>
        <div style=${{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: '#c8c8c8',
          letterSpacing: '0.08em',
        }}>FACTORIO-FLOW</div>
        <div style=${{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9.5,
          color: '#4a4a4a',
          marginTop: 3,
          letterSpacing: '0.04em',
        }}>${nodeCount} nodes · ${edgeCount} edges</div>
      </div>

      <!-- Scrollable content -->
      <div style=${{ flex: 1, overflowY: 'auto' }}>

        <!-- Goal item panel -->
        <${GoalPanel} flow=${flow} />

        <!-- Dataset / DLC toggle -->
        <${Section} title="Dataset">
          <div style=${{ display:'flex', gap:4 }}>
            ${['1.1','2.0'].map(v => html`
              <button
                key=${v}
                onClick=${() => setGameVersion(v)}
                style=${{
                  flex: 1,
                  padding: '6px 0',
                  background: gameVersion === v ? '#191919' : 'transparent',
                  border: `1px solid ${gameVersion === v ? '#5878c8' : '#262626'}`,
                  color: gameVersion === v ? '#e6e6e6' : '#6a6a6a',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                }}
              >${v === '1.1' ? 'Vanilla 1.1' : 'Space Age'}</button>
            `)}
          </div>
          <div style=${{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            color: gameDataLoaded ? '#3a9c3a' : '#4a4a4a',
            marginTop: 5,
            letterSpacing: '0.08em',
          }}>${gameDataLoaded ? 'data loaded' : 'loading...'}</div>
        </${Section}>

        <!-- Source output section -->
        <${Section} title="Source output">
          <div style=${{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 8,
          }}>
            <span style=${{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 18,
              color: '#e6e6e6',
            }}>${sourceOutput}</span>
            <span style=${{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              color: '#6a6a6a',
            }}>/min</span>
          </div>
          <input
            type="range"
            min="60"
            max="480"
            step="60"
            value=${sourceOutput}
            onInput=${(e) => setSourceOutput(Number(e.target.value))}
            style=${{ width: '100%', accentColor: '#5878c8' }}
          />
          <div style=${{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 4,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            color: '#3a3a3a',
          }}>
            <span>60</span>
            <span>240</span>
            <span>480</span>
          </div>
        </${Section}>

        <!-- Selected section -->
        <${Section} title="Selected">
          ${multiSelectCount > 1
            ? html`
              <div>
                <div style=${{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  color: '#5878c8',
                  marginBottom: 4,
                }}>${multiSelectCount} nodes</div>
                <div style=${{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9.5,
                  color: '#4a4a4a',
                }}>press ⌫ to delete · dbl-click to config</div>
              </div>
            `
            : selectedNode
              ? html`
                <div>
                  <div style=${{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11.5,
                    color: '#e6e6e6',
                    marginBottom: 2,
                  }}>${selectedNode.name}</div>
                  <div style=${{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10,
                    color: '#6a6a6a',
                    marginBottom: 10,
                  }}>#${selectedNode.id} · ${selectedNode.type}</div>

                  ${selectedNode.throughput != null && html`
                    <${KV} k="throughput" v=${selectedNode.throughput + '/m'} />
                  `}
                  ${selectedNode.throughputIn != null && selectedNode.type !== 'source' && html`
                    <${KV} k="in" v=${selectedNode.throughputIn + '/m'} />
                  `}
                  ${selectedNode.throughputOut != null && selectedNode.type !== 'output' && html`
                    <${KV} k="out" v=${selectedNode.throughputOut + '/m'} />
                  `}
                  ${selectedNode.efficiency != null && html`
                    <${KV}
                      k="efficiency"
                      v=${Math.round(selectedNode.efficiency) + '%'}
                      vColor=${selectedNode.efficiency < 100 ? '#cc6820' : '#3a9c3a'}
                    />
                  `}
                  ${selectedNode.recipe && html`<${KV} k="recipe" v=${selectedNode.recipe} />`}

                  ${selectedNode.issue && html`
                    <div style=${{
                      marginTop: 10,
                      padding: '7px 8px',
                      background: selectedNode.issue.severity === 'error' ? '#1f0c0c' : '#1f1808',
                      borderLeft: '2px solid ' + (selectedNode.status === 'error' ? '#cc1c1c' : '#aa7010'),
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 10,
                      color: '#c8c8c8',
                      lineHeight: 1.4,
                    }}>
                      ${typeof selectedNode.issue === 'string' ? selectedNode.issue : selectedNode.issue.message}
                    </div>
                  `}
                </div>
              `
              : html`
                <div style=${{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10.5,
                  color: '#4a4a4a',
                }}>click a node</div>
              `
          }
        </${Section}>

        <!-- Errors section -->
        <${Section} title="Errors" count=${errorNodes.length}>
          ${errorNodes.length === 0
            ? html`
              <div style=${{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10.5,
                color: '#3a9c3a',
              }}>all flows ok</div>
            `
            : errorNodes.map(node => {
              const issueText = typeof node.issue === 'string' ? node.issue : (node.issue?.message || '')
              return html`
              <div key=${node.id} style=${{
                display: 'flex',
                gap: 8,
                marginBottom: 8,
              }}>
                <span
                  title=${issueText}
                  style=${{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: 12,
                    lineHeight: '14px',
                    color: node.status === 'error' ? '#cc1c1c' : '#aa7010',
                    flexShrink: 0,
                    cursor: 'help',
                  }}
                >!</span>
                <div>
                  <div style=${{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10.5,
                    color: '#c8c8c8',
                  }}>${node.name}</div>
                  <div style=${{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 9.5,
                    color: '#5a5a5a',
                    marginTop: 1,
                    lineHeight: 1.35,
                  }}>${issueText}</div>
                </div>
              </div>
            `})
          }
        </${Section}>

        <!-- Flow section -->
        <${Section} title="Flow">
          <${KV} k="ore in"    v=${flow.oreIn + '/m'} />
          <${KV} k="plates out" v=${flow.platesOut + '/m'} />
          <${KV}
            k="efficiency"
            v=${flow.efficiency + '%'}
            vColor=${flow.efficiency < 100 ? '#cc6820' : '#3a9c3a'}
          />
        </${Section}>

      </div>

      <!-- Bottom bar -->
      <div style=${{
        borderTop: '1px solid #1e1e1e',
        padding: '10px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style=${{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          color: '#6a6a6a',
        }}>
          <span style=${{ color: '#4a4a4a' }}>zoom </span>${Math.round(scale * 100)}%
        </span>
        <button
          onClick=${onResetView}
          style=${{
            background: 'transparent',
            border: 'none',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: '#6a6a6a',
            cursor: 'pointer',
            padding: 0,
          }}
          onMouseEnter=${(e) => e.target.style.color = '#c8c8c8'}
          onMouseLeave=${(e) => e.target.style.color = '#6a6a6a'}
        >reset view</button>
      </div>

    </div>
  `
}
