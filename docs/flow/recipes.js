// Factorio base-game recipe database
// keyed by recipe ID

export const RECIPES = {
  "iron-smelting": {
    input: "iron-ore",
    output: "iron-plate",
    machines: ["furnace", "electric-furnace", "stone-furnace"],
    time: 3.2,
    inputCount: 1,
    outputCount: 1,
  },
  "copper-smelting": {
    input: "copper-ore",
    output: "copper-plate",
    machines: ["furnace", "electric-furnace", "stone-furnace"],
    time: 3.2,
    inputCount: 1,
    outputCount: 1,
  },
  "steel-smelting": {
    input: "iron-plate",
    output: "steel-plate",
    machines: ["furnace", "electric-furnace", "stone-furnace"],
    time: 16,
    inputCount: 5,
    outputCount: 1,
  },
  "iron-gear-wheel": {
    input: "iron-plate",
    output: "gear",
    machines: ["assembler"],
    time: 0.5,
    inputCount: 2,
    outputCount: 1,
  },
  "copper-cable": {
    input: "copper-plate",
    output: "copper-cable",
    machines: ["assembler"],
    time: 0.5,
    inputCount: 1,
    outputCount: 2,
  },
  "green-circuit": {
    input: "iron-plate",
    output: "green-circuit",
    machines: ["assembler"],
    time: 0.5,
    inputCount: 1,
    outputCount: 1,
  },
  "stone-brick": {
    input: "stone",
    output: "stone-brick",
    machines: ["furnace", "electric-furnace", "stone-furnace"],
    time: 3.2,
    inputCount: 2,
    outputCount: 1,
  },
}

// Returns the recipe entry for a given (inputItem, outputItem, machineType) combo, or null
// machineType is optional — if omitted, matches any machine
export function findRecipe(inputItem, outputItem, machineType) {
  for (const recipe of Object.values(RECIPES)) {
    if (recipe.input !== inputItem) continue
    if (recipe.output !== outputItem) continue
    if (machineType !== undefined && !recipe.machines.includes(machineType)) continue
    return recipe
  }
  return null
}

// Returns all possible output items for a given (inputItem, machineType) combo
// Returns: string[] of output item keys
export function possibleOutputs(inputItem, machineType) {
  const outputs = []
  for (const recipe of Object.values(RECIPES)) {
    if (recipe.input !== inputItem) continue
    if (machineType !== undefined && !recipe.machines.includes(machineType)) continue
    outputs.push(recipe.output)
  }
  return outputs
}
