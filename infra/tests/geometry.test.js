import {
  nodeCardHeight, nodeSize, getSocketLocal, socketPos, bezierPath, formatVal,
  NODE_WIDTH, HEADER_H, SOCKET_ROW_H, BODY_PAD_Y, SOCKET_R, JUNCTION_W, JUNCTION_H
} from '../../docs/graph/geometry.js'

let passed = 0, failed = 0
function assert(cond, msg) {
  if (cond) { console.log(`  ✓ ${msg}`); passed++ }
  else { console.error(`  ✗ ${msg}`); failed++ }
}

// nodeCardHeight
const card1 = { kind:'card', inputs:[{item:'iron-ore'}], outputs:[{item:'iron-plate'}] }
assert(nodeCardHeight(card1) === HEADER_H + BODY_PAD_Y*2 + SOCKET_ROW_H, 'card 1in 1out height')

const card2 = { kind:'card', inputs:[{},{} ], outputs:[{}] }
assert(nodeCardHeight(card2) === HEADER_H + BODY_PAD_Y*2 + 2*SOCKET_ROW_H, 'card 2in height uses max row count')

// nodeSize
const junc = { kind: 'junction', type: 'splitter', inputs:[{}], outputs:[{},{}] }
const sz = nodeSize(junc)
assert(sz.w === JUNCTION_W && sz.h === JUNCTION_H, 'junction size')

const cardSz = nodeSize(card1)
assert(cardSz.w === NODE_WIDTH, 'card width')
assert(cardSz.h === nodeCardHeight(card1), 'card height')

// getSocketLocal — splitter
const splitter = { kind:'junction', type:'splitter', inputs:[{}], outputs:[{},{}] }
const splIn = getSocketLocal(splitter, 'in', 0)
assert(splIn.x === 0 && splIn.y === JUNCTION_H/2, 'splitter input center-left')
const splOut0 = getSocketLocal(splitter, 'out', 0)
assert(splOut0.x === JUNCTION_W && splOut0.y === 0, 'splitter output 0 top-right')
const splOut1 = getSocketLocal(splitter, 'out', 1)
assert(splOut1.x === JUNCTION_W && splOut1.y === JUNCTION_H, 'splitter output 1 bottom-right')

// getSocketLocal — merger
const merger = { kind:'junction', type:'merger', inputs:[{},{}], outputs:[{}] }
const merIn0 = getSocketLocal(merger, 'in', 0)
assert(merIn0.x === 0 && merIn0.y === 0, 'merger input 0 top-left')
const merIn1 = getSocketLocal(merger, 'in', 1)
assert(merIn1.x === 0 && merIn1.y === JUNCTION_H, 'merger input 1 bottom-left')
const merOut = getSocketLocal(merger, 'out', 0)
assert(merOut.x === JUNCTION_W && merOut.y === JUNCTION_H/2, 'merger output center-right')

// getSocketLocal — card, centered smaller side
const asymCard = { kind:'card', inputs:[{}], outputs:[{},{},{}] }
const sockIn = getSocketLocal(asymCard, 'in', 0)
// 3 total rows, 1 input → offset = (3-1)/2 = 1, so y = HEADER_H + BODY_PAD_Y + (1+0+0.5)*SOCKET_ROW_H
const expectedY = HEADER_H + BODY_PAD_Y + 1.5 * SOCKET_ROW_H
assert(Math.abs(sockIn.y - expectedY) < 0.01, 'asymmetric card input centered')

// formatVal
assert(formatVal(120) === '120', 'integer stays integer')
assert(formatVal(60.5) === '60.5', '1 decimal')
assert(formatVal(60.123) === '60.1', 'rounds to 1 decimal')

// bezierPath
const p = bezierPath(0, 0, 200, 0)
assert(p.startsWith('M 0 0'), 'bezier starts at origin')
assert(p.includes('C'), 'bezier has cubic control points')

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
