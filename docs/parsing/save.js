// Serialize the current graph to JSON and optionally trigger download

export function serializeGraph(nodes, edges) {
  return JSON.stringify({
    version: 1,
    nodes: nodes.map(n => ({
      id: n.id,
      kind: n.kind,
      type: n.type,
      name: n.name,
      sublabel: n.sublabel,
      header: n.header,
      x: Math.round(n.x),
      y: Math.round(n.y),
      throughput: n.throughput,
      capacity: n.capacity,
      recipe: n.recipe,
      inputs: n.inputs,
      outputs: n.outputs,
    })),
    edges: edges.map(e => ({
      id: e.id,
      from: e.from,
      to: e.to,
    })),
  }, null, 2)
}

export function downloadGraph(nodes, edges, filename = 'flow.json') {
  const json = serializeGraph(nodes, edges)
  const blob = new Blob([json], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
