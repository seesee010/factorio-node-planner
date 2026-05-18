export async function loadGameData(version) {
  const response = await fetch(`./data/factorio-${version}.json`)
  const raw = await response.json()
  return transformData(raw, version)
}

function transformData(raw, version) {
  const machines = []
  const sourceItems = []

  for (const item of raw.items || []) {
    if (item.machine) {
      machines.push({
        id: item.id,
        label: item.name || item.id,
        speed: item.machine.speed || 1,
        type: item.machine.type || 'electric',
        energyUsage: item.machine.usage || 0,
        modules: item.machine.modules || 0,
        categories: item.category ? [item.category] : [],
        size: item.machine.size || [2, 2],
      })
    } else {
      sourceItems.push({
        id: item.id,
        label: item.name || item.id,
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
