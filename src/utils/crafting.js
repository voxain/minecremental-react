// Generic crafting helper
// gameLogic: the gameLogic object from context
// itemDef: an object describing the craftable item, expected to have { id, recipe }
export function craftItem(gameLogic, itemDef) {
  if (!gameLogic) return { success: false, reason: "no_gamelogic" };
  if (!itemDef || !itemDef.recipe)
    return { success: false, reason: "no_recipe" };

  const inv = (gameLogic.inventory && gameLogic.inventory.content) || {};

  // check requirements
  for (const [matId, needed] of Object.entries(itemDef.recipe)) {
    if (!inv[matId] || inv[matId] < needed) {
      return { success: false, reason: "insufficient_materials" };
    }
  }

  // deduct using functional updater to avoid stale state
  if (gameLogic.inventory && gameLogic.inventory.setContent) {
    gameLogic.inventory.setContent((prev = {}) => {
      const copy = { ...prev };
      for (const [matId, needed] of Object.entries(itemDef.recipe)) {
        copy[matId] = (copy[matId] || 0) - needed;
        if (copy[matId] <= 0) delete copy[matId];
      }
      return copy;
    });
  }

  // if the crafted item is a tool, equip it
  if (itemDef.id && gameLogic.current_tool && gameLogic.current_tool.set) {
    gameLogic.current_tool.set(itemDef);
  }

  // add to owned tools list if available
  if (itemDef.id && gameLogic.tools && gameLogic.tools.add) {
    try {
      gameLogic.tools.add(itemDef.id);
    } catch {
      // ignore
    }
  }

  return { success: true };
}

// Check whether an item is craftable with the current inventory
export function isCraftable(gameLogic, itemDef) {
  if (!itemDef || !itemDef.recipe) return false;
  const inv =
    (gameLogic && gameLogic.inventory && gameLogic.inventory.content) || {};
  for (const [matId, needed] of Object.entries(itemDef.recipe)) {
    if (!inv[matId] || inv[matId] < needed) return false;
  }
  return true;
}
