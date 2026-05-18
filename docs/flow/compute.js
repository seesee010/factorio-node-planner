// Main entry point
// nodes: Node[] — with .id, .kind, .type, .parents, .children, .inputs, .outputs, .throughput (for source nodes)
// edges: Edge[] — with .id, .from {nodeId, socket}, .to {nodeId, socket}
// Returns: { nodes: Node[], edges: Edge[] } — deep copies with flow state filled in
export function computeFlow(nodes, edges, gameData = null) {
  // 1. Deep-copy all nodes and edges
  const nodesCopy = JSON.parse(JSON.stringify(nodes))
  const edgesCopy = JSON.parse(JSON.stringify(edges))

  // 2. topoSort to get processing order
  const order = topoSort(nodesCopy, edgesCopy)

  // 3. Build a map: nodeId → outputValues[] (throughput leaving each output socket)
  const outputMap = {}

  // 4. Initialize: source nodes start with their throughput
  for (const node of nodesCopy) {
    if (node.type === 'source') {
      outputMap[node.id] = [node.throughput || 0]
    } else {
      outputMap[node.id] = []
    }
  }

  // Build a quick lookup: nodeId → node
  const nodeById = {}
  for (const node of nodesCopy) {
    nodeById[node.id] = node
  }

  // 5. Process each node in topo order
  for (const nodeId of order) {
    const node = nodeById[nodeId]

    // Gather inputValues from edges feeding each of this node's input sockets
    const inputSocketCount = node.inputs ? node.inputs.length : 0
    const inputValues = new Array(inputSocketCount).fill(0)

    for (const edge of edgesCopy) {
      if (edge.to.nodeId === nodeId) {
        const socketIdx = edge.to.socket
        const sourceValues = outputMap[edge.from.nodeId] || []
        const val = sourceValues[edge.from.socket] || 0
        if (socketIdx < inputValues.length) {
          inputValues[socketIdx] += val
        }
      }
    }

    // Call computeNode
    const result = computeNode(node, inputValues, gameData)

    // Store outputValues
    outputMap[nodeId] = result.outputValues

    // Update node fields
    node.status = result.status
    node.issue = result.issue
    node.efficiency = result.efficiency
    node.throughput = result.throughput
    if (node.inputs) {
      for (let i = 0; i < node.inputs.length; i++) {
        node.inputs[i].flowState = result.socketStates.inputs[i] || 'ok'
      }
    }
    if (node.outputs) {
      for (let i = 0; i < node.outputs.length; i++) {
        node.outputs[i].flowState = result.socketStates.outputs[i] || 'ok'
      }
    }
  }

  // 6. Update each edge .state and .value from the outputValues map
  for (const edge of edgesCopy) {
    const sourceNode = nodeById[edge.from.nodeId]
    const sourceValues = outputMap[edge.from.nodeId] || []
    edge.value = sourceValues[edge.from.socket] || 0

    // Edge state derives from the source node's output socket state
    if (sourceNode && sourceNode.outputs && sourceNode.outputs[edge.from.socket]) {
      edge.state = sourceNode.outputs[edge.from.socket].flowState || 'ok'
    } else if (sourceNode && sourceNode.status === 'error') {
      edge.state = 'error'
    } else {
      edge.state = 'ok'
    }
  }

  // 7. Post-pass: mark "warning" on nodes whose outputs have no consumers (orange)
  // Build set of consumed (nodeId, socket) pairs
  const consumed = new Set()
  for (const edge of edgesCopy) {
    consumed.add(`${edge.from.nodeId}:${edge.from.socket}`)
  }

  for (const node of nodesCopy) {
    if (!node.outputs || node.outputs.length === 0) continue
    // Only warn if the node is currently ok and has outputs
    if (node.status !== 'ok') continue
    // Check if any output socket is unconsumed
    let hasUnconsumedOutput = false
    for (let i = 0; i < node.outputs.length; i++) {
      if (!consumed.has(`${node.id}:${i}`)) {
        hasUnconsumedOutput = true
        break
      }
    }
    if (hasUnconsumedOutput) {
      node.status = 'warning'
      node.issue = node.issue || 'output has no consumers'
    }
  }

  return { nodes: nodesCopy, edges: edgesCopy }
}

// Kahn's algorithm topological sort
// Returns: string[] of node IDs in dependency order
export function topoSort(nodes, edges) {
  // Build adjacency and in-degree maps
  const inDegree = {}
  const adjList = {}

  for (const node of nodes) {
    inDegree[node.id] = 0
    adjList[node.id] = []
  }

  // Use edges if available, otherwise fall back to parents/children
  if (edges && edges.length > 0) {
    for (const edge of edges) {
      const from = edge.from.nodeId
      const to = edge.to.nodeId
      if (adjList[from] !== undefined && inDegree[to] !== undefined) {
        adjList[from].push(to)
        inDegree[to]++
      }
    }
  } else {
    // Fall back to parents/children relationships
    for (const node of nodes) {
      if (node.children) {
        for (const childId of node.children) {
          if (adjList[node.id] !== undefined && inDegree[childId] !== undefined) {
            adjList[node.id].push(childId)
            inDegree[childId]++
          }
        }
      }
    }
  }

  // Kahn's algorithm
  const queue = []
  for (const nodeId of Object.keys(inDegree)) {
    if (inDegree[nodeId] === 0) {
      queue.push(nodeId)
    }
  }

  const order = []
  while (queue.length > 0) {
    const nodeId = queue.shift()
    order.push(nodeId)
    for (const neighbor of adjList[nodeId] || []) {
      inDegree[neighbor]--
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor)
      }
    }
  }

  // If order doesn't include all nodes (cycle), append remaining nodes
  const orderSet = new Set(order)
  for (const node of nodes) {
    if (!orderSet.has(node.id)) {
      order.push(node.id)
    }
  }

  return order
}

// Compute throughput for one node given its resolved input values
// node: Node
// inputValues: number[] — throughput value arriving at each input socket
// gameData: optional — { recipes: {...} } from FactorioLab; if null, uses node fields directly
// Returns: { throughput: number, efficiency: number|null, status: string, issue: string|null, outputValues: number[], socketStates: { inputs: string[], outputs: string[] } }
export function computeNode(node, inputValues, gameData = null) {
  const inputCount = node.inputs ? node.inputs.length : 0
  const outputCount = node.outputs ? node.outputs.length : 0

  switch (node.type) {
    case 'source': {
      const throughput = node.throughput || 0
      return {
        throughput,
        efficiency: null,
        status: 'ok',
        issue: null,
        outputValues: [throughput],
        socketStates: {
          inputs: [],
          outputs: ['ok'],
        },
      }
    }

    case 'furnace':
    case 'assembler': {
      const inputVal = inputValues[0] || 0

      // Machine speed + recipe time capacity model
      if (node.machineSpeed && node.recipeTime) {
        const count = node.machineCount || 1
        const outputAmt = node.recipeOutputAmount || 1
        const maxOutput = (60 / node.recipeTime) * node.machineSpeed * count * outputAmt
        const actual = Math.min(inputVal, maxOutput)
        const eff = maxOutput > 0 ? (actual / maxOutput) * 100 : null

        let status = 'ok', issue = null
        if (inputVal === 0) {
          status = 'error'; issue = 'no input'
        } else if (actual < inputVal * 0.99) {
          status = 'warning'; issue = `bottleneck: max ${Math.round(maxOutput)}/m`
        }

        return {
          throughput: actual,
          efficiency: eff,
          status,
          issue,
          outputValues: [actual],
          socketStates: {
            inputs: [inputVal > 0 ? 'ok' : 'error'],
            outputs: [actual > 0 ? 'ok' : 'idle'],
          },
        }
      }

      // Fallback: passthrough (old behavior)
      if (inputVal === 0) {
        return {
          throughput: 0,
          efficiency: node.capacity ? 0 : null,
          status: 'error',
          issue: 'no input',
          outputValues: [0],
          socketStates: {
            inputs: ['error'],
            outputs: ['error'],
          },
        }
      }

      const throughput = inputVal
      const efficiency = node.capacity ? (throughput / node.capacity) * 100 : null

      return {
        throughput,
        efficiency,
        status: 'ok',
        issue: null,
        outputValues: [throughput],
        socketStates: {
          inputs: ['ok'],
          outputs: ['ok'],
        },
      }
    }

    case 'splitter': {
      const inputVal = inputValues[0] || 0

      if (inputVal === 0) {
        const outputStates = new Array(outputCount).fill('error')
        return {
          throughput: 0,
          efficiency: null,
          status: 'error',
          issue: 'no input',
          outputValues: new Array(outputCount).fill(0),
          socketStates: {
            inputs: ['error'],
            outputs: outputStates,
          },
        }
      }

      // Parse ratio
      const ratioStr = node.ratio || '1:1'
      const parts = ratioStr.split(':').map(Number)
      const totalParts = parts.reduce((a, b) => a + b, 0)

      const outputValues = parts.map(part => inputVal * (part / totalParts))
      const outputStates = outputValues.map(v => v > 0 ? 'ok' : 'error')

      return {
        throughput: inputVal,
        efficiency: null,
        status: 'ok',
        issue: null,
        outputValues,
        socketStates: {
          inputs: ['ok'],
          outputs: outputStates,
        },
      }
    }

    case 'merger': {
      const total = inputValues.reduce((sum, v) => sum + (v || 0), 0)
      const anyInput = total > 0

      return {
        throughput: total,
        efficiency: null,
        status: anyInput ? 'ok' : 'error',
        issue: anyInput ? null : 'no input',
        outputValues: [total],
        socketStates: {
          inputs: inputValues.map(v => (v || 0) > 0 ? 'ok' : 'error'),
          outputs: [anyInput ? 'ok' : 'error'],
        },
      }
    }

    case 'output':
    case 'target': {
      const throughput = inputValues[0] || 0
      const target = node.amount || 0

      let status, issue
      if (throughput > 0) {
        status = 'ok'
        issue = null
      } else {
        status = 'error'
        issue = 'no input'
      }

      const efficiency = target > 0 ? (throughput / target) * 100 : null

      return {
        throughput,
        efficiency,
        status,
        issue,
        outputValues: [],
        socketStates: {
          inputs: [throughput > 0 ? 'ok' : 'error'],
          outputs: [],
        },
      }
    }

    default: {
      // Unconfigured / passthrough node
      const throughput = inputValues[0] || 0
      return {
        throughput,
        efficiency: null,
        status: 'ok',
        issue: null,
        outputValues: outputCount > 0 ? [throughput] : [],
        socketStates: {
          inputs: new Array(inputCount).fill('ok'),
          outputs: new Array(outputCount).fill('ok'),
        },
      }
    }
  }
}
