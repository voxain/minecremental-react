// Mining logic extracted from App.jsx — pure function operating on gameLogic
import { layerData } from "../data/layers";
import { blockData } from "../data/blocks";

// mineBlock performs a single mining 'action' using the provided gameLogic.
// It mirrors the behavior previously embedded in App.jsx.
export function mineBlock(gameLogic) {
  if (!gameLogic) return;

  const current_block =
    (gameLogic.block_queue &&
      gameLogic.block_queue.value &&
      gameLogic.block_queue.value[0]) ||
    null;
  if (!current_block) return;

  const tool = (gameLogic.current_tool && gameLogic.current_tool.value) || {};

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

  const newProgress =
    (gameLogic.mining && gameLogic.mining.progress
      ? gameLogic.mining.progress
      : 0) + miningPowerUsed;
  if (gameLogic.mining && gameLogic.mining.setProgress)
    gameLogic.mining.setProgress(newProgress);

  if (newProgress >= current_block.hardness) {
    // Use block id (original object key) as inventory key so it's stable
    const blockId = current_block.id;

    // Only add to inventory if the tool was effective against this block class
    // Exception: if the tool is the hand and the block is wood, still add to inventory
    if (toolEffective || (tool.id === "hand" && blockId === "wood")) {
      if (gameLogic.inventory && gameLogic.inventory.setContent) {
        gameLogic.inventory.setContent((prev) => ({
          ...prev,
          [blockId]: (prev[blockId] || 0) + 1,
        }));
      }
    }

    // Determine next block regardless of effectiveness (block still breaks)
    const drop_calculation = Math.random();
    let new_block = null;
    const layerIdx =
      (gameLogic.current_layer && gameLogic.current_layer.value) || 0;
    const blocks =
      (layerData[layerIdx] && layerData[layerIdx].layerBlocks) || [];
    blocks.forEach((blockProps) => {
      if (drop_calculation < blockProps.dropRate / 100) {
        new_block = blockProps.block;
      }
    });
    if (new_block) {
      if (gameLogic.block_queue && gameLogic.block_queue.pushAndShift) {
        gameLogic.block_queue.pushAndShift(new_block);
      }
      if (gameLogic.mining && gameLogic.mining.setProgress)
        gameLogic.mining.setProgress(0);
    }
  }
}
