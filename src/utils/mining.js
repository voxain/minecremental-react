// Mining logic extracted from App.jsx — pure function operating on gameLogic
import { layerData } from "../data/layers";

// In-memory cooldown map to debounce repetitive 'too weak' log messages.
// Keyed by `${toolId}::${blockId}` and stores timestamp of last log.
const weakLogCooldown = {};

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
      // log to console that tool is too weak, but debounce to avoid spam
      try {
        if (gameLogic && gameLogic.logger && gameLogic.logger.push) {
          // maintain a simple in-memory cooldown per block-tool combination
          // module-scoped cache (see weakLogCooldown below)
          const toolId = tool && tool.id ? tool.id : "tool";
          const blockIdKey =
            current_block && current_block.id ? current_block.id : "block";
          const cacheKey = `${toolId}::${blockIdKey}`;
          const now = Date.now();
          const last = weakLogCooldown[cacheKey] || 0;
          const COOLDOWN_MS = 10 * 1000; // 10 seconds
          if (now - last > COOLDOWN_MS) {
            weakLogCooldown[cacheKey] = now;
            const toolName = tool && tool.name ? tool.name : tool.id || "Tool";
            const blockName =
              current_block && current_block.name
                ? current_block.name
                : current_block.id || "Block";
            // too-weak messages are low-importance; mark as debug so players can hide them
            gameLogic.logger.push(`${toolName} is too weak for ${blockName}`, {
              severity: "debug",
            });
          }
        }
      } catch (e) {
        // ignore logging errors
        void e;
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
      // Notify player about rare finds only (keep console clean).
      try {
        // Log only for rare/important blocks to avoid clutter. Emerald is considered rare.
        if (blockId === "emerald") {
          if (gameLogic && gameLogic.logger && gameLogic.logger.push) {
            gameLogic.logger.push(`Found rare: ${current_block.name}`, {
              bold: true,
              severity: "important",
              meta: { id: blockId },
            });
          }
        }
      } catch (e) {
        // ignore logging errors
        void e;
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
      // increment per-layer mined depth (do not increment on skip)
      try {
        const layerIdx =
          (gameLogic.current_layer && gameLogic.current_layer.value) || 0;
        if (gameLogic.layer_progress && gameLogic.layer_progress.increment)
          gameLogic.layer_progress.increment(layerIdx);
      } catch (e) {
        void e;
      }
      // record new queued block (no console notification to avoid frequent noise)
    }
  }
}
