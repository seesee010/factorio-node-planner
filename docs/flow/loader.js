export async function loadGameData(version) {
  const response = await fetch(`./flow/data/factorio-${version}.json`)
  const raw = await response.json()
  return transformData(raw, version)
}

function entityTypeFromId(id) {
  if (id.endsWith('-furnace')) return 'furnace'
  if (id.startsWith('assembling-machine-')) return 'assembling-machine'
  if (id === 'chemical-plant' || id === 'oil-refinery' || id === 'centrifuge') return 'assembling-machine'
  return null
}

function transformData(raw, version) {
  const machines = []
  const sourceItems = []

  for (const item of raw.items || []) {
    if (item.machine) {
      const entityType = entityTypeFromId(item.id)
      machines.push({
        id: item.id,
        label: item.name || item.id,
        speed: item.machine.speed || 1,
        type: item.machine.type || 'electric',
        energyUsage: item.machine.usage || 0,
        modules: item.machine.modules || 0,
        categories: item.category ? [item.category] : [],
        size: item.machine.size || [2, 2],
        entityType,
      })
    } else if (item.category === 'intermediate-products' || item.category === 'fluids') {
      sourceItems.push({
        id: item.id,
        label: item.name || item.id,
        category: item.category,
      })
    }
  }

  const recipes = (raw.recipes || []).map(r => ({
    id: r.id,
    label: r.name || r.id,
    time: r.time || 1,
    category: r.category || 'crafting',
    in: r.in || {},
    out: r.out || {},
    producers: r.producers || [],
    flags: r.flags || [],
  }))

  return { version, machines, sourceItems, recipes }
}
