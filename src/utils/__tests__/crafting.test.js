import { craftItem, isCraftable } from "../crafting";

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

export { testCrafting };
