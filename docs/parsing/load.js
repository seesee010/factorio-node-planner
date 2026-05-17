// Parse and validate a graph JSON file

export function validateGraph(data) {
  if (!data || typeof data !== 'object') return 'invalid JSON'
  if (!Array.isArray(data.nodes)) return 'missing nodes array'
  if (!Array.isArray(data.edges)) return 'missing edges array'
  for (const n of data.nodes) {
    if (!n.id) return `node missing id`
    if (typeof n.x !== 'number' || typeof n.y !== 'number') return `node ${n.id}: missing x/y`
  }
  for (const e of data.edges) {
    if (!e.id) return `edge missing id`
    if (!e.from?.nodeId) return `edge ${e.id}: missing from.nodeId`
    if (!e.to?.nodeId)   return `edge ${e.id}: missing to.nodeId`
  }
  return null
}

export function parseGraph(json) {
  let data
  try {
    data = JSON.parse(json)
  } catch {
    return { error: 'invalid JSON', nodes: null, edges: null }
  }
  const err = validateGraph(data)
  if (err) return { error: err, nodes: null, edges: null }

  const nodes = data.nodes.map(n => ({
    id:         n.id,
    kind:       n.kind || 'card',
    type:       n.type || 'unconfigured',
    name:       n.name || 'NODE',
    sublabel:   n.sublabel || '',
    header:     n.header  || '#1a1a1a',
    x:          n.x,
    y:          n.y,
    throughput: n.throughput  ?? undefined,
    capacity:   n.capacity    ?? undefined,
    recipe:     n.recipe      ?? undefined,
    inputs:     (n.inputs  || []).map(s => ({ item: s.item || null, flowState: s.flowState || 'ok' })),
    outputs:    (n.outputs || []).map(s => ({ item: s.item || null, flowState: s.flowState || 'ok' })),
    status:     'ok',
  }))

  const edges = data.edges.map(e => ({
    id:    e.id,
    from:  { nodeId: e.from.nodeId, socket: e.from.socket ?? 0 },
    to:    { nodeId: e.to.nodeId,   socket: e.to.socket   ?? 0 },
    state: 'ok',
    value: 0,
  }))

  return { error: null, nodes, edges }
}
