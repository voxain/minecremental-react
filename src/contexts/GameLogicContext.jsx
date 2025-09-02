/* eslint-disable react-refresh/only-export-components */
import { useState, createContext, useContext, useEffect, useRef } from "react";
import { blockData } from "../data/blocks";
import { toolsData } from "../data/tools";
import {
  pushConsole as utilPushConsole,
  clearConsole as utilClearConsole,
} from "../utils/logger";
import { buildSaveObject, mapSaveToState } from "../utils/saveManager";
import { layerData } from "../data/layers";
import { craftItem } from "../utils/crafting";

// In-memory cooldown map to debounce console messages that may occur frequently.
// Keyed by arbitrary string; defaults to 60s cooldown to avoid console spam.
const logCooldowns = {};
function shouldEmitLog(key, cooldownMs = 60 * 1000) {
  const now = Date.now();
  const last = logCooldowns[key] || 0;
  if (now - last > cooldownMs) {
    logCooldowns[key] = now;
    return true;
  }
  return false;
}

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
  const [unlockedTools, setUnlockedTools] = useState(["hand"]);
  // Console / logger state for in-game messages
  const [consoleLines, setConsoleLines] = useState([]);
  const MAX_CONSOLE_LINES = 100;
  // Autosave disabled by default to avoid accidental overwrites
  const [autosaveEnabled, setAutosaveEnabled] = useState(false);
  const autosaveIntervalRef = useRef(null);
  const [lastSaveAt, setLastSaveAt] = useState(null);

  // track per-layer exploration progress (number of mined blocks in that layer)
  const [layerProgress, setLayerProgress] = useState(
    Array(layerData.length).fill(0)
  );
  // explicit unlocked layers array to ensure instant UI updates when unlocking
  const [unlockedLayers, setUnlockedLayers] = useState(
    layerData.map((_, i) => i === 0)
  );

  const pushConsole = (text, opts = {}) =>
    utilPushConsole(setConsoleLines, MAX_CONSOLE_LINES, text, opts);
  const clearConsole = () => utilClearConsole(setConsoleLines);

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
    // per-layer progress helpers
    layer_progress: {
      value: layerProgress,
      set: setLayerProgress,
      // increment progress for a given layer (capped at layer.depth)
      increment: (idx) => {
        setLayerProgress((prev) => {
          const copy = Array.isArray(prev)
            ? [...prev]
            : Array(layerData.length).fill(0);
          if (idx < 0 || idx >= layerData.length) return copy;
          const max = (layerData[idx] && layerData[idx].depth) || 0;
          const oldVal = copy[idx] || 0;
          const newVal = Math.min(oldVal + 1, max);
          copy[idx] = newVal;
          // if we just reached the bottom of this layer, notify discovery of next layer
          if (oldVal < max && newVal >= max) {
            try {
              const nextIdx = idx + 1;
              if (nextIdx < layerData.length) {
                const nextName =
                  (layerData[nextIdx] && layerData[nextIdx].name) ||
                  `Layer ${nextIdx}`;
                // mark the next layer unlocked immediately so UI updates without delay
                setUnlockedLayers((prev) => {
                  const copy = Array.isArray(prev)
                    ? [...prev]
                    : Array(layerData.length).fill(false);
                  copy[nextIdx] = true;
                  return copy;
                });
                pushConsole(
                  `You have reached the bottom of ${layerData[idx].name}. ${nextName} unlocked!`,
                  { severity: "important", bold: true }
                );
              } else {
                pushConsole(
                  `You have reached the bottom of ${layerData[idx].name}. No further layers.`,
                  { severity: "important" }
                );
              }
            } catch (e) {
              void e;
            }
          }
          return copy;
        });
      },
      // check if a layer index is unlocked (layer 0 always unlocked)
      isUnlocked: (idx) => {
        if (idx === 0) return true;
        if (
          Array.isArray(unlockedLayers) &&
          typeof unlockedLayers[idx] === "boolean"
        )
          return Boolean(unlockedLayers[idx]);
        const prev = layerProgress[idx - 1] || 0;
        const needed = (layerData[idx - 1] && layerData[idx - 1].depth) || 0;
        return prev >= needed;
      },
    },
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
          // notify player they acquired a new tool
          try {
            const name =
              (toolsData[toolId] && toolsData[toolId].name) || toolId;
            // Acquisition is rare — always notify
            pushConsole(`Acquired tool: ${name}`, { severity: "important" });
          } catch (e) {
            void e;
          }
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
          try {
            const name =
              (toolsData[nextId] && toolsData[nextId].name) || nextId;
            // Debounce equip messages per tool to avoid spam if player cycles quickly
            if (shouldEmitLog(`equip::${nextId}`))
              pushConsole(`Equipped: ${name}`, { severity: "info" });
          } catch (e) {
            void e;
          }
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
          try {
            const name =
              (toolsData[prevId] && toolsData[prevId].name) || prevId;
            if (shouldEmitLog(`equip::${prevId}`))
              pushConsole(`Equipped: ${name}`, { severity: "info" });
          } catch (e) {
            void e;
          }
          return list;
        });
      },
    },
    // Tools unlocked for crafting/visibility (distinct from ownership)
    unlocked: {
      value: unlockedTools,
      set: setUnlockedTools,
      add: (toolId) => {
        setUnlockedTools((prev) => {
          if (prev && prev.includes(toolId)) return prev;
          try {
            const name =
              (toolsData[toolId] && toolsData[toolId].name) || toolId;
            pushConsole(`Unlocked: ${name}`, { severity: "important" });
          } catch (e) {
            void e;
          }
          return [...prev, toolId];
        });
      },
    },
    switchLayer: (new_layer) => {
      // only allow switching to unlocked layers
      const canSwitch =
        typeof new_layer === "number" &&
        new_layer >= 0 &&
        new_layer < layerData.length &&
        (new_layer === 0 ||
          (Array.isArray(unlockedLayers)
            ? Boolean(unlockedLayers[new_layer])
            : (layerProgress[new_layer - 1] || 0) >=
              ((layerData[new_layer - 1] && layerData[new_layer - 1].depth) ||
                0)));
      if (!canSwitch) {
        // ignore attempts to switch to locked layers
        return;
      }
      setLayer(new_layer);
      // no console log on switching layers (by design)
    },
    // Craft a tool/item by id using the shared crafting helper
    craft: (itemId) => {
      const itemDef = toolsData[itemId];
      // pass the full gameLogic object so craftItem can update tools/unlocked
      return craftItem(gameLogic, itemDef);
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
    // Save / Load helpers
    save: {
      autosaveEnabled,
      lastSaveAt,
      toObject: () =>
        buildSaveObject({
          queue,
          layer,
          isMining,
          miningProgress,
          toolShake,
          invContents,
          currentTool,
          ownedTools,
          unlockedTools,
          autosaveEnabled,
          lastSaveAt,
          layerProgress,
          unlockedLayers,
        }),

      toString: () => {
        try {
          return JSON.stringify(gameLogic.save.toObject());
        } catch {
          /* ignore */
          return null;
        }
      },

      saveToLocal: (key = "minecremental_save_v1") => {
        try {
          // Ensure the saved JSON contains an up-to-date lastSaveAt timestamp.
          const now = Date.now();
          const obj = buildSaveObject({
            queue,
            layer,
            isMining,
            miningProgress,
            toolShake,
            invContents,
            currentTool,
            ownedTools,
            unlockedTools,
            autosaveEnabled,
            lastSaveAt: now,
            unlockedLayers,
          });
          const s = JSON.stringify(obj);
          if (!s) {
            pushConsole("Failed to build save string", { severity: "error" });
            return false;
          }
          window.localStorage.setItem(key, s);
          setLastSaveAt(now);
          pushConsole("Game saved to localStorage", {
            bold: true,
            severity: "important",
          });
          return true;
        } catch {
          pushConsole("Failed to save to localStorage", { severity: "error" });
          return false;
        }
      },

      loadFromObject: (obj) => {
        if (!obj || typeof obj !== "object")
          return { success: false, reason: "invalid_object" };
        try {
          const mappedRes = mapSaveToState(obj, {
            setQueue,
            setLayer,
            setMining,
            setMiningProgress,
            setToolShake,
            setInvContents,
            setOwnedTools,
            setUnlockedTools,
            setCurrentTool,
            setAutoSave: setAutosaveEnabled,
            setLastSaveAt: setLastSaveAt,
            setLayerProgress: setLayerProgress,
          });
          if (mappedRes && mappedRes.success) {
            pushConsole("Save applied", { severity: "important" });
            return { success: true };
          }
          pushConsole("Failed to apply save", { severity: "error" });
          return { success: false, reason: mappedRes && mappedRes.reason };
        } catch {
          pushConsole("Failed to apply save", { severity: "error" });
          return { success: false, reason: "apply_failed" };
        }
      },

      loadFromString: (str) => {
        try {
          const obj = JSON.parse(str);
          const res = gameLogic.save.loadFromObject(obj);
          if (res && res.success)
            pushConsole("Import successful", { severity: "important" });
          else pushConsole("Import failed", { severity: "error" });
          return res;
        } catch {
          pushConsole("Failed to parse import string", { severity: "error" });
          return { success: false, reason: "parse_failed" };
        }
      },

      loadFromLocal: (key = "minecremental_save_v1") => {
        try {
          const s = window.localStorage.getItem(key);
          if (!s) {
            pushConsole("No save found in localStorage", {
              severity: "warning",
            });
            return { success: false, reason: "no_save" };
          }
          const res = gameLogic.save.loadFromString(s);
          if (res && res.success)
            pushConsole("Loaded save from localStorage", {
              severity: "important",
            });
          else
            pushConsole("Failed to load save from localStorage", {
              severity: "error",
            });
          return res;
        } catch {
          pushConsole("Error while loading from localStorage", {
            severity: "error",
          });
          return { success: false, reason: "load_failed" };
        }
      },

      // set autosave on/off; saved in memory only for now
      setAutoSave: (enabled) => {
        setAutosaveEnabled(Boolean(enabled));
      },
    },
    // expose console/logger
    logger: {
      lines: consoleLines,
      push: pushConsole,
      clear: clearConsole,
    },
    // Cheats for debugging / rapid progression
    cheats: {
      unlockLayer: (idx) => {
        if (typeof idx !== "number") return;
        setUnlockedLayers((prev) => {
          const copy = Array.isArray(prev)
            ? [...prev]
            : Array(layerData.length).fill(false);
          if (idx >= 0 && idx < layerData.length) copy[idx] = true;
          return copy;
        });
        try {
          const name =
            (layerData[idx] && layerData[idx].name) || `Layer ${idx}`;
          pushConsole(`Cheat: Unlocked layer: ${name}`, {
            severity: "important",
          });
        } catch (e) {
          void e;
        }
      },
      unlockAllLayers: () => {
        setUnlockedLayers(Array.from({ length: layerData.length }, () => true));
        // also mark progress complete so other systems relying on layerProgress see full values
        setLayerProgress(layerData.map((l) => (l && l.depth) || 0));
        pushConsole("Cheat: All layers unlocked", { severity: "important" });
      },
      giveItem: (itemId, qty = 999) => {
        if (!itemId) return;
        setInvContents((prev = {}) => {
          const copy = { ...(prev || {}) };
          copy[itemId] = (copy[itemId] || 0) + Number(qty || 0);
          return copy;
        });
        pushConsole(`Cheat: Granted ${qty} x ${itemId}`, { severity: "info" });
      },
      giveAllItems: (qty = 999) => {
        // populate inventory with all known blocks
        const all = {};
        try {
          Object.keys(blockData).forEach((k) => {
            all[k] = Number(qty || 0);
          });
        } catch (e) {
          void e;
        }
        setInvContents(all);
        // also grant all tools and unlock them
        try {
          const allToolIds = Object.keys(toolsData || {});
          setOwnedTools(allToolIds);
          setUnlockedTools(allToolIds);
        } catch (e) {
          void e;
        }
        pushConsole("Cheat: Granted all items and tools", {
          severity: "important",
        });
      },
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
      try {
        // Debounce skip logs per block to avoid spam if player repeatedly skips
        if (shouldEmitLog(`skip::${new_block.id}`))
          pushConsole(`Skipped current block; new block: ${new_block.name}`, {
            color: "#ccc",
          });
      } catch (e) {
        void e;
      }
    },
  };

  // Manage autosave interval: when enabled, save to localStorage every 5 minutes
  useEffect(() => {
    const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
    // clear any existing interval
    if (autosaveIntervalRef.current) {
      clearInterval(autosaveIntervalRef.current);
      autosaveIntervalRef.current = null;
    }
    if (autosaveEnabled) {
      // set up interval
      autosaveIntervalRef.current = setInterval(() => {
        try {
          const ok = gameLogic.save.saveToLocal();
          if (ok) pushConsole("Autosave completed", { severity: "important" });
        } catch (e) {
          // ignore
          void e;
        }
      }, INTERVAL_MS);
    }
    return () => {
      if (autosaveIntervalRef.current) {
        clearInterval(autosaveIntervalRef.current);
        autosaveIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosaveEnabled]);

  // On mount, try to read the last save from localStorage to initialize lastSaveAt and autosave preference
  useEffect(() => {
    try {
      const s = window.localStorage.getItem("minecremental_save_v1");
      if (!s) return;
      const obj = JSON.parse(s);
      if (obj && typeof obj === "object") {
        // prefer explicit lastSaveAt, but fall back to the save file timestamp if present
        if (typeof obj.lastSaveAt === "number") setLastSaveAt(obj.lastSaveAt);
        else if (typeof obj.timestamp === "number")
          setLastSaveAt(obj.timestamp);
        if (typeof obj.autosaveEnabled === "boolean")
          setAutosaveEnabled(Boolean(obj.autosaveEnabled));
      }
    } catch (e) {
      void e;
    }
  }, []);

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
