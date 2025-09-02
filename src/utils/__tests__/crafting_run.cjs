// Inline version of craftItem for quick runtime test (CommonJS)
function craftItem(gameLogic, itemDef) {
  if (!gameLogic) return { success: false, reason: "no_gamelogic" };
  if (!itemDef || !itemDef.recipe)
    return { success: false, reason: "no_recipe" };

  if (
    itemDef.id &&
    gameLogic.tools &&
    Array.isArray(gameLogic.tools.value) &&
    gameLogic.tools.value.includes(itemDef.id)
  ) {
    return { success: false, reason: "already_owned" };
  }

  const inv = (gameLogic.inventory && gameLogic.inventory.content) || {};

  for (const [matId, needed] of Object.entries(itemDef.recipe)) {
    if (!inv[matId] || inv[matId] < needed) {
      return { success: false, reason: "insufficient_materials" };
    }
  }

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

  if (itemDef.id && gameLogic.current_tool && gameLogic.current_tool.set) {
    gameLogic.current_tool.set(itemDef);
  }

  if (itemDef.id && gameLogic.tools && gameLogic.tools.add) {
    try {
      gameLogic.tools.add(itemDef.id);
    } catch {
      // ignore
    }
  }

  if (itemDef.id && gameLogic.unlocked && gameLogic.unlocked.add) {
    try {
      if (itemDef.id === "pickaxe_wood") {
        try {
          gameLogic.unlocked.add("pickaxe_stone");
        } catch {
          void 0;
        }
      }
      if (Array.isArray(itemDef.unlocks)) {
        for (const uid of itemDef.unlocks) {
          try {
            gameLogic.unlocked.add(uid);
          } catch {
            void 0;
          }
        }
      }
      gameLogic.unlocked.add(itemDef.id);
    } catch {
      // ignore
    }
  }

  return { success: true };
}

function makeMockGame() {
  const unlocked = new Set();
  const tools = new Set();
  return {
    inventory: {
      content: { wood: 20, stone: 50, iron: 20 },
      setContent(fn) {
        this.content = fn(this.content);
      },
    },
    current_tool: { set: (t) => (this.current = t) },
    tools: { add: (id) => tools.add(id) },
    unlocked: { add: (id) => unlocked.add(id), has: (id) => unlocked.has(id) },
    logger: { push: () => {} },
  };
}

const woodPick = {
  id: "pickaxe_wood",
  name: "Wood Pick",
  recipe: { wood: 10 },
  unlocks: ["pickaxe_stone"],
};
const exampleTool = {
  id: "example_tool",
  name: "Example",
  recipe: { stone: 10 },
  unlocks: ["foo", "bar"],
};

function testCrafting() {
  const g = makeMockGame();
  console.log(
    "Before unlocked has pickaxe_stone?",
    g.unlocked.has("pickaxe_stone")
  );
  const res = craftItem(g, woodPick);
  console.log("craft wood pick result", res);
  console.log(
    "After unlocked has pickaxe_stone?",
    g.unlocked.has("pickaxe_stone")
  );
  const res2 = craftItem(g, exampleTool);
  console.log("craft example tool result", res2);
  console.log(
    "Unlocked foo?",
    g.unlocked.has("foo"),
    "Unlocked bar?",
    g.unlocked.has("bar")
  );
}

if (require.main === module) testCrafting();
