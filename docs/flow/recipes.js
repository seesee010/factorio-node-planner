export function findRecipe(gameData, inputItem, outputItem) {
  if (!gameData) return findRecipeFallback(inputItem, outputItem)
  return gameData.recipes.find(r => {
    const hasInput  = inputItem  ? (inputItem  in r.in)  : true
    const hasOutput = outputItem ? (outputItem in r.out) : true
    return hasInput && hasOutput
  }) || null
}

export function getRecipesForMachine(gameData, machineId) {
  if (!gameData) return []
  const machine = gameData.machines.find(m => m.id === machineId)
  if (!machine) return []
  return gameData.recipes.filter(r => r.producers.includes(machineId))
}

export function getMachineById(gameData, machineId) {
  if (!gameData) return null
  return gameData.machines.find(m => m.id === machineId) || null
}

const FALLBACK_RECIPES = [
  { id: 'iron-plate',      time: 3.2, category: 'smelting',  in: { 'iron-ore': 1 },    out: { 'iron-plate': 1 },      producers: ['stone-furnace', 'steel-furnace', 'electric-furnace'] },
  { id: 'copper-plate',    time: 3.2, category: 'smelting',  in: { 'copper-ore': 1 },  out: { 'copper-plate': 1 },    producers: ['stone-furnace', 'steel-furnace', 'electric-furnace'] },
  { id: 'iron-gear-wheel', time: 0.5, category: 'crafting',  in: { 'iron-plate': 2 },  out: { 'iron-gear-wheel': 1 }, producers: ['assembling-machine-1', 'assembling-machine-2', 'assembling-machine-3'] },
]

function findRecipeFallback(inputItem, outputItem) {
  return FALLBACK_RECIPES.find(r => {
    const hasInput  = inputItem  ? (inputItem  in r.in)  : true
    const hasOutput = outputItem ? (outputItem in r.out) : true
    return hasInput && hasOutput
  }) || null
}
