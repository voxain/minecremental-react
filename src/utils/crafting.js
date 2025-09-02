// Generic crafting helper
// gameLogic: the gameLogic object from context
// itemDef: an object describing the craftable item, expected to have { id, recipe }
export function craftItem(gameLogic, itemDef) {
  if (!gameLogic) return { success: false, reason: "no_gamelogic" };
  if (!itemDef || !itemDef.recipe)
    return { success: false, reason: "no_recipe" };

  // Prevent crafting an item that's already owned
  if (
    itemDef.id &&
    gameLogic.tools &&
    Array.isArray(gameLogic.tools.value) &&
    gameLogic.tools.value.includes(itemDef.id)
  ) {
    return { success: false, reason: "already_owned" };
  }

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

  // Manage unlocked tools visibility separate from ownership if available
  if (itemDef.id && gameLogic.unlocked && gameLogic.unlocked.add) {
    try {
      // crafting a wood pickaxe could unlock stone pickaxe for crafting
      if (
        itemDef.id === "pickaxe_wood" &&
        gameLogic.unlocked &&
        gameLogic.unlocked.add
      ) {
        gameLogic.unlocked.add("pickaxe_stone");
      }
      // ensure the crafted tool is marked unlocked as well
      gameLogic.unlocked.add(itemDef.id);
    } catch {
      // ignore
    }
  }

  // Notify player via logger if available
  try {
    const name = itemDef.name || itemDef.id || "item";
    if (gameLogic && gameLogic.logger && gameLogic.logger.push) {
      gameLogic.logger.push(`Crafted ${name}`, {
        bold: true,
        severity: "important",
        meta: { id: itemDef.id },
      });
      // if unlocking occurred, inform about unlocked items (simple heuristic)
      if (
        itemDef.id === "pickaxe_wood" &&
        gameLogic.logger &&
        gameLogic.logger.push
      ) {
        gameLogic.logger.push("Unlocked Stone Pickaxe for crafting", {
          severity: "important",
        });
      }
    }
  } catch {
    // ignore logging errors
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
