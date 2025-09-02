/* eslint-disable react-refresh/only-export-components */
import { useState, createContext, useContext } from "react";
import { blockData } from "../data/blocks";
import { toolsData } from "../data/tools";
import { layerData } from "../data/layers";
import { craftItem } from "../utils/crafting";

let initial_queue = Array(10).fill(blockData["wood"]);

// Create a context for game logic
export const GameLogicContext = createContext();

// Create a provider component
export function GameLogicProvider({ children }) {
  const block_queue = useState(initial_queue);
  const current_layer = useState(0);

  const [queue, setQueue] = block_queue;
  const [layer, setLayer] = current_layer;
  const [isMining, setMining] = useState(false);
  const [miningProgress, setMiningProgress] = useState(0);
  const [toolShake, setToolShake] = useState(false);
  const [invContents, setInvContents] = useState({});
  const [currentTool, setCurrentTool] = useState(toolsData.hand);
  const [ownedTools, setOwnedTools] = useState([toolsData.hand.id]);

  // helper: shift front and push new block
  function pushAndShift(newBlock, onlyPush) {
    setQueue((prev) => {
      const copy = [...prev];
      if (!onlyPush) copy.shift();
      copy.push(newBlock);
      return copy;
    });
  }

  const gameLogic = {
    block_queue: {
      value: queue,
      set: setQueue,
      pushAndShift,
    },
    current_layer: {
      value: layer,
      set: setLayer,
    },
    inventory: {
      content: invContents,
      setContent: setInvContents,
    },
    current_tool: {
      value: currentTool,
      set: setCurrentTool,
    },
    // Owned tool ids and helpers to navigate/equip
    tools: {
      value: ownedTools,
      set: setOwnedTools,
      add: (toolId) => {
        setOwnedTools((prev) => {
          if (prev && prev.includes(toolId)) return prev;
          return [...prev, toolId];
        });
      },
      equipNext: () => {
        setOwnedTools((prev) => {
          const list = prev || [];
          if (list.length === 0) return list;
          const currentId = currentTool && currentTool.id;
          const idx = list.indexOf(currentId);
          const nextIdx = idx === -1 ? 0 : (idx + 1) % list.length;
          const nextId = list[nextIdx];
          if (toolsData[nextId]) setCurrentTool(toolsData[nextId]);
          return list;
        });
      },
      equipPrev: () => {
        setOwnedTools((prev) => {
          const list = prev || [];
          if (list.length === 0) return list;
          const currentId = currentTool && currentTool.id;
          const idx = list.indexOf(currentId);
          const prevIdx =
            idx === -1 ? 0 : (idx - 1 + list.length) % list.length;
          const prevId = list[prevIdx];
          if (toolsData[prevId]) setCurrentTool(toolsData[prevId]);
          return list;
        });
      },
    },
    switchLayer: (new_layer) => {
      setLayer(new_layer);
    },
    // Craft a tool/item by id using the shared crafting helper
    craft: (itemId) => {
      const itemDef = toolsData[itemId];
      return craftItem(
        {
          inventory: { content: invContents, setContent: setInvContents },
          current_tool: { value: currentTool, set: setCurrentTool },
        },
        itemDef
      );
    },
    mining: {
      value: isMining,
      set: setMining,
      progress: miningProgress,
      setProgress: setMiningProgress,
    },
    tool_shake: {
      value: toolShake,
      set: setToolShake,
    },
    // Skip the current front block and push a newly-determined block
    skipCurrentBlock: () => {
      // select a new block by layer drop rates (similar to mining)
      const layerIdx = layer;
      const drop_calculation = Math.random();
      let new_block = null;
      const blocks =
        (layerData[layerIdx] && layerData[layerIdx].layerBlocks) || [];
      blocks.forEach((blockProps) => {
        if (drop_calculation < blockProps.dropRate / 100) {
          new_block = blockProps.block;
        }
      });
      // fallback to wood if nothing selected
      if (!new_block) new_block = blockData["wood"];
      pushAndShift(new_block);
    },
  };

  return (
    <GameLogicContext.Provider value={gameLogic}>
      {children}
    </GameLogicContext.Provider>
  );
}

// Custom hook to use the game logic
export function useGameLogic() {
  return useContext(GameLogicContext);
}
