import { MiningColumn } from "./components/MiningColumn/MiningColumn";
import { layerData } from "./data/layers";
import { blockData } from "./data/blocks";
import { toolsData } from "./data/tools";
import { craftItem, isCraftable } from "./utils/crafting";
import {
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./components/voxain-radix/tabs";

import { GameLogicProvider, useGameLogic } from "./contexts/GameLogicContext";

function App() {
  // The provider must wrap any component that calls `useGameLogic()`.
  // Move hook usage into a child component so the hook is called after the provider mounts.
  function MainLayout() {
    const gameLogic = useGameLogic();

    // Helper to craft using shared craftItem util
    function craftTool(itemId) {
      const itemDef = toolsData[itemId];
      const result = craftItem(gameLogic, itemDef);
      if (result && result.success) console.log("Crafted", itemId);
      else console.log("Failed to craft:", result && result.reason);
    }

    function mine_block() {
      let current_block = gameLogic.block_queue.value[0];

      const tool = gameLogic.current_tool.value;

      // Check: tool mining power must be >= block toughness
      if (
        typeof tool.mining_power === "number" &&
        typeof current_block.toughness === "number"
      ) {
        if (tool.mining_power < current_block.toughness) {
          // briefly trigger a shake animation on the tool icon to indicate it's too weak
          if (gameLogic.tool_shake && gameLogic.tool_shake.set) {
            gameLogic.tool_shake.set(true);
            setTimeout(() => gameLogic.tool_shake.set(false), 200);
          }
          return;
        }
      }

      // Check: whether the tool is effective against the block class.
      // If not effective, mine with power 1 (very slowly) but still allow breaking.
      const toolEffective =
        Array.isArray(tool.effective) &&
        tool.effective.includes(current_block.class);
      const miningPowerUsed = toolEffective ? tool.mining_power : 1;

      const newProgress = gameLogic.mining.progress + miningPowerUsed;
      gameLogic.mining.setProgress(newProgress);
      console.log(newProgress);
      if (newProgress >= current_block.hardness) {
        // Use block id (original object key) as inventory key so it's stable
        const blockId = current_block.id;

        // Only add to inventory if the tool was effective against this block class
        // Exception: if the tool is the hand and the block is wood, still add to inventory
        if (toolEffective || (tool.id === "hand" && blockId === "wood")) {
          gameLogic.inventory.setContent((prev) => ({
            ...prev,
            [blockId]: (prev[blockId] || 0) + 1,
          }));
        }

        // Determine next block regardless of effectiveness (block still breaks)
        const drop_calculation = Math.random();
        let new_block = null;
        layerData[gameLogic.current_layer.value].layerBlocks.forEach(
          (blockProps) => {
            if (drop_calculation < blockProps.dropRate / 100) {
              new_block = blockProps.block;
            }
          }
        );
        if (new_block) {
          gameLogic.block_queue.pushAndShift(new_block);
          gameLogic.mining.setProgress(0);
        }
      }
    }

    return (
      <>
        <div className="grid grid-cols-[20rem_3fr_1fr] grid-rows-[min-content_1fr] gap-4 h-screen p-4">
          <MiningColumn className="bg-slate-200 row-span-2 border-3 border-gray-400" />

          <div className="bg-teal-100 p-4 col-start-2 col-span-2 border-3 border-gray-400 flex">
            <div className="flex w-20">
              <img
                className="size-6"
                src="/img/currencies/copper.png"
                alt="Copper Coin"
                title="Copper Coins"
              />
              : 10
            </div>
            <div className="flex w-20">
              <img
                className="size-6"
                src="/img/currencies/silver.png"
                alt="Silver Coin"
                title="Silver Coins"
              />
              : 0
            </div>
            Current layer: {layerData[gameLogic.current_layer.value].name}
          </div>

          <div className="bg-slate-400 p-4 col-start-2 row-start-2 border-3 border-gray-400">
            <TabsRoot defaultValue="actions">
              <TabsList aria-label="Actions">
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="craft">Craft</TabsTrigger>
              </TabsList>
              <TabsContent value="actions">
                <h1 className="text-xl">Manual Actions</h1>
                <div
                  onClick={mine_block}
                  onMouseDown={() => gameLogic.mining.set(true)}
                  onMouseUp={() => gameLogic.mining.set(false)}
                  className="border-1 p-3 w-50 cursor-pointer"
                >
                  <h1 className="text-lg">Mine</h1>
                  <p>Current tool: {gameLogic.current_tool.value.name}</p>
                  <p>
                    Mining power: {gameLogic.current_tool.value.mining_power}
                  </p>
                </div>
                <hr />
                <h1 className="text-xl">Machines</h1>
                <div className="border-1 p-3 w-50">
                  <h1 className="text-lg">Handcrank</h1>
                  <p>Generates 1 power</p>
                </div>
                <hr />
              </TabsContent>
              <TabsContent value="craft">
                <h1 className="text-xl">Crafting</h1>
                {
                  // simplified: use helper to decide craftability
                }
                <div
                  role="button"
                  aria-disabled={
                    !isCraftable(gameLogic, toolsData.pickaxe_wood)
                  }
                  onClick={() => {
                    if (!isCraftable(gameLogic, toolsData.pickaxe_wood)) return;
                    craftTool("pickaxe_wood");
                  }}
                  className={
                    "border-1 p-3 w-50 " +
                    (isCraftable(gameLogic, toolsData.pickaxe_wood)
                      ? "cursor-pointer hover:bg-slate-100"
                      : "opacity-50")
                  }
                >
                  <h1 className="text-lg">Wooden Pickaxe</h1>
                  <p>Requires: 10x Wood</p>
                </div>
                {/* Stone pickaxe: only visible after wooden pickaxe is owned */}
                {gameLogic.tools &&
                Array.isArray(gameLogic.tools.value) &&
                gameLogic.tools.value.includes("pickaxe_wood") ? (
                  <div
                    role="button"
                    aria-disabled={
                      !isCraftable(gameLogic, toolsData.pickaxe_stone)
                    }
                    onClick={() => {
                      if (!isCraftable(gameLogic, toolsData.pickaxe_stone))
                        return;
                      craftTool("pickaxe_stone");
                    }}
                    className={
                      "border-1 p-3 w-50 mt-2 " +
                      (isCraftable(gameLogic, toolsData.pickaxe_stone)
                        ? "cursor-pointer hover:bg-slate-100"
                        : "opacity-50")
                    }
                  >
                    <h1 className="text-lg">Stone Pickaxe</h1>
                    <p>Requires: 5x Wood, 30x Stone</p>
                  </div>
                ) : null}
              </TabsContent>
            </TabsRoot>
          </div>

          <div className="bg-slate-200 p-4 col-start-3 row-start-2 border-3 border-gray-400">
            <h1 className="text-xl">Inventory</h1>
            {Object.entries(gameLogic.inventory.content).map(
              ([itemId, quantity]) => {
                const item = blockData[itemId];
                const label = item ? item.name : itemId;
                return (
                  <div key={itemId}>
                    {label}: {quantity}
                  </div>
                );
              }
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <GameLogicProvider>
      <MainLayout />
    </GameLogicProvider>
  );
}
export default App;
