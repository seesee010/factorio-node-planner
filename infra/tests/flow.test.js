// infra/tests/flow.test.js
// Run with: node infra/tests/flow.test.js

import { computeFlow, topoSort } from '../../docs/flow/compute.js'
import { findRecipe, possibleOutputs } from '../../docs/flow/recipes.js'

let passed = 0
let failed = 0

function assert(condition, msg) {
  if (condition) { console.log(`  ✓ ${msg}`); passed++ }
  else { console.error(`  ✗ ${msg}`); failed++ }
}

// --- Test: topoSort ---
console.log('\n[topoSort]')
{
  const nodes = [
    { id: 'src',  parents: [],      children: ['f1'] },
    { id: 'f1',   parents: ['src'], children: ['out'] },
    { id: 'out',  parents: ['f1'],  children: [] },
  ]
  const order = topoSort(nodes, [])
  assert(order[0] === 'src',  'src comes first')
  assert(order[2] === 'out',  'out comes last')
}

// --- Test: simple chain source → furnace → target ---
console.log('\n[simple chain]')
{
  const nodes = [
    { id: 'src', kind: 'card', type: 'source', parents: [], children: ['f1'],
      inputs: [], outputs: [{ item: 'iron-ore', flowState: 'ok' }], throughput: 120 },
    { id: 'f1', kind: 'card', type: 'furnace', parents: ['src'], children: ['out'],
      inputs: [{ item: 'iron-ore', flowState: 'ok' }],
      outputs: [{ item: 'iron-plate', flowState: 'ok' }] },
    { id: 'out', kind: 'card', type: 'target', parents: ['f1'], children: [],
      inputs: [{ item: 'iron-plate', flowState: 'ok' }], outputs: [],
      amount: 120, item: 'iron-plate' },
  ]
  const edges = [
    { id: 'e1', from: { nodeId: 'src', socket: 0 }, to: { nodeId: 'f1', socket: 0 }, value: 0, state: 'ok' },
    { id: 'e2', from: { nodeId: 'f1', socket: 0 }, to: { nodeId: 'out', socket: 0 }, value: 0, state: 'ok' },
  ]
  const result = computeFlow(nodes, edges)
  const f1 = result.nodes.find(n => n.id === 'f1')
  const out = result.nodes.find(n => n.id === 'out')
  assert(f1.throughput === 120, 'furnace throughput = 120')
  assert(f1.status === 'ok', 'furnace status ok')
  assert(out.status === 'ok', 'target ok when receiving full amount')
  assert(result.edges[0].state === 'ok', 'src→furnace edge ok')
  assert(result.edges[1].state === 'ok', 'furnace→out edge ok')
}

// --- Test: bottleneck source → furnace → target (under-fed) ---
console.log('\n[bottleneck]')
{
  const nodes = [
    { id: 'src', kind: 'card', type: 'source', parents: [], children: ['f1'],
      inputs: [], outputs: [{ item: 'iron-ore', flowState: 'ok' }], throughput: 60 },
    { id: 'f1', kind: 'card', type: 'furnace', parents: ['src'], children: ['out'],
      inputs: [{ item: 'iron-ore', flowState: 'ok' }],
      outputs: [{ item: 'iron-plate', flowState: 'ok' }] },
    { id: 'out', kind: 'card', type: 'target', parents: ['f1'], children: [],
      inputs: [{ item: 'iron-plate', flowState: 'ok' }], outputs: [],
      amount: 120, item: 'iron-plate' },
  ]
  const edges = [
    { id: 'e1', from: { nodeId: 'src', socket: 0 }, to: { nodeId: 'f1', socket: 0 }, value: 0, state: 'ok' },
    { id: 'e2', from: { nodeId: 'f1', socket: 0 }, to: { nodeId: 'out', socket: 0 }, value: 0, state: 'ok' },
  ]
  const result = computeFlow(nodes, edges)
  const out = result.nodes.find(n => n.id === 'out')
  assert(out.status === 'warning' || out.status === 'error', 'target warns when under-fed')
  assert(result.edges[1].value === 60, 'edge carries 60/m')
}

// --- Test: splitter ---
console.log('\n[splitter]')
{
  const nodes = [
    { id: 'src', kind: 'card', type: 'source', parents: [], children: ['sp'],
      inputs: [], outputs: [{ item: 'iron-ore', flowState: 'ok' }], throughput: 240 },
    { id: 'sp', kind: 'junction', type: 'splitter', parents: ['src'], children: ['f1','f2'],
      inputs: [{ item: 'iron-ore', flowState: 'ok' }],
      outputs: [{ item: 'iron-ore', flowState: 'ok' }, { item: 'iron-ore', flowState: 'ok' }] },
    { id: 'f1', kind: 'card', type: 'furnace', parents: ['sp'], children: [],
      inputs: [{ item: 'iron-ore', flowState: 'ok' }], outputs: [{ item: 'iron-plate', flowState: 'ok' }] },
    { id: 'f2', kind: 'card', type: 'furnace', parents: ['sp'], children: [],
      inputs: [{ item: 'iron-ore', flowState: 'ok' }], outputs: [{ item: 'iron-plate', flowState: 'ok' }] },
  ]
  const edges = [
    { id: 'e1', from: { nodeId: 'src', socket: 0 }, to: { nodeId: 'sp', socket: 0 }, value: 0, state: 'ok' },
    { id: 'e2', from: { nodeId: 'sp', socket: 0 }, to: { nodeId: 'f1', socket: 0 }, value: 0, state: 'ok' },
    { id: 'e3', from: { nodeId: 'sp', socket: 1 }, to: { nodeId: 'f2', socket: 0 }, value: 0, state: 'ok' },
  ]
  const result = computeFlow(nodes, edges)
  const e2 = result.edges.find(e => e.id === 'e2')
  const e3 = result.edges.find(e => e.id === 'e3')
  assert(e2.value === 120, 'splitter output 0 = 120')
  assert(e3.value === 120, 'splitter output 1 = 120')
}

// --- Test: invalid recipe ---
console.log('\n[invalid recipe]')
{
  const nodes = [
    { id: 'src', kind: 'card', type: 'source', parents: [], children: ['f1'],
      inputs: [], outputs: [{ item: 'iron-ore', flowState: 'ok' }], throughput: 120 },
    { id: 'f1', kind: 'card', type: 'furnace', parents: ['src'], children: [],
      inputs: [{ item: 'iron-ore', flowState: 'ok' }],
      outputs: [{ item: 'copper-plate', flowState: 'ok' }] }, // invalid: iron-ore → copper-plate
  ]
  const edges = [
    { id: 'e1', from: { nodeId: 'src', socket: 0 }, to: { nodeId: 'f1', socket: 0 }, value: 0, state: 'ok' },
  ]
  const result = computeFlow(nodes, edges)
  const f1 = result.nodes.find(n => n.id === 'f1')
  assert(f1.status === 'error', 'furnace with invalid recipe is error')
}

// --- Test: findRecipe ---
console.log('\n[recipes]')
assert(findRecipe('iron-ore', 'iron-plate', 'furnace') !== null, 'iron smelting found')
assert(findRecipe('iron-ore', 'copper-plate', 'furnace') === null, 'invalid recipe returns null')
assert(possibleOutputs('iron-ore', 'furnace').includes('iron-plate'), 'iron-ore can produce iron-plate')

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
