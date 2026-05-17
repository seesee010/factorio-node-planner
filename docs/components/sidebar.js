import { h, Fragment } from 'https://esm.sh/preact@10'
import { useState } from 'https://esm.sh/preact@10/hooks'
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

export default function Sidebar({
  selectedNode,
  errorNodes,
  flow,
  sourceOutput,
  setSourceOutput,
  scale,
  onResetView,
  multiSelectCount = 0,
}) {
  return html`
    <div style=${{
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: 188,
      background: '#121212',
      borderLeft: '1px solid #1e1e1e',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 5,
    }}>

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
        }}>FLOW.001</div>
        <div style=${{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9.5,
          color: '#4a4a4a',
          marginTop: 3,
          letterSpacing: '0.04em',
        }}>iron plate line</div>
      </div>

      <!-- Scrollable content -->
      <div style=${{ flex: 1, overflowY: 'auto' }}>

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
            onChange=${(e) => setSourceOutput(Number(e.target.value))}
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
                }}>press ⌫ to delete</div>
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

                  ${selectedNode.recipe && html`<${KV} k="recipe" v=${selectedNode.recipe} />`}
                  ${selectedNode.efficiency !== undefined && html`
                    <${KV}
                      k="efficiency"
                      v=${selectedNode.efficiency + '%'}
                      vColor=${selectedNode.efficiency < 100 ? '#cc6820' : '#3a9c3a'}
                    />
                  `}
                  ${selectedNode.throughputIn !== undefined && html`<${KV} k="in" v=${selectedNode.throughputIn + '/min'} />`}
                  ${selectedNode.throughputOut !== undefined && html`<${KV} k="out" v=${selectedNode.throughputOut + '/min'} />`}

                  ${selectedNode.issue && html`
                    <div style=${{
                      marginTop: 10,
                      padding: '7px 8px',
                      background: selectedNode.issue.severity === 'error' ? '#1f0c0c' : '#1f1808',
                      borderLeft: '2px solid ' + (selectedNode.issue.severity === 'error' ? '#cc1c1c' : '#aa7010'),
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 10,
                      color: '#c8c8c8',
                      lineHeight: 1.4,
                    }}>
                      ${selectedNode.issue.message}
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
            : errorNodes.map(node => html`
              <div key=${node.id} style=${{
                display: 'flex',
                gap: 8,
                marginBottom: 8,
              }}>
                <span style=${{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  fontSize: 12,
                  lineHeight: '14px',
                  color: node.issue && node.issue.severity === 'error' ? '#cc1c1c' : '#aa7010',
                  flexShrink: 0,
                }}>!</span>
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
                  }}>${node.issue ? node.issue.message : ''}</div>
                </div>
              </div>
            `)
          }
        </${Section}>

        <!-- Flow section -->
        <${Section} title="Flow">
          <${KV} k="ore in" v=${flow.oreIn + '/min'} />
          <${KV} k="plates out" v=${flow.platesOut + '/min'} />
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
