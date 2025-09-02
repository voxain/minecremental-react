import { blockData } from "../data/blocks";
import { toolsData } from "../data/tools";

export const buildSaveObject = ({
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
}) => {
  return {
    version: 1,
    timestamp: Date.now(),
    block_queue: (queue || []).map((b) => (b && b.id ? b.id : null)),
    current_layer: layer,
    isMining: Boolean(isMining),
    miningProgress: Number(miningProgress) || 0,
    toolShake: Boolean(toolShake),
    inventory: invContents || {},
    currentToolId: currentTool && currentTool.id ? currentTool.id : null,
    ownedTools: ownedTools || [],
    unlockedTools: unlockedTools || [],
    autosaveEnabled: Boolean(autosaveEnabled),
    lastSaveAt: typeof lastSaveAt === "number" ? lastSaveAt : null,
  };
};

export const parseSaveObject = (obj) => {
  if (!obj || typeof obj !== "object")
    return { success: false, reason: "invalid_object" };
  // basic validation
  if (!Array.isArray(obj.block_queue))
    return { success: false, reason: "invalid_queue" };
  return { success: true, obj };
};

export const mapSaveToState = (obj, setters) => {
  try {
    const {
      setQueue,
      setLayer,
      setMining,
      setMiningProgress,
      setToolShake,
      setInvContents,
      setOwnedTools,
      setUnlockedTools,
      setCurrentTool,
      setAutoSave,
      setLastSaveAt,
    } = setters;

    if (Array.isArray(obj.block_queue)) {
      const mapped = obj.block_queue.map(
        (id) => (id && blockData[id]) || blockData["wood"]
      );
      setQueue(mapped);
    }

    if (typeof obj.current_layer === "number") setLayer(obj.current_layer);

    if (typeof obj.isMining === "boolean") setMining(obj.isMining);
    if (typeof obj.miningProgress === "number")
      setMiningProgress(obj.miningProgress);
    if (typeof obj.toolShake === "boolean") setToolShake(obj.toolShake);

    if (obj.inventory && typeof obj.inventory === "object")
      setInvContents(obj.inventory);

    if (obj.ownedTools && Array.isArray(obj.ownedTools))
      setOwnedTools(obj.ownedTools);
    if (obj.unlockedTools && Array.isArray(obj.unlockedTools))
      setUnlockedTools(obj.unlockedTools);

    if (obj.currentToolId && obj.currentToolId in toolsData) {
      setCurrentTool(toolsData[obj.currentToolId]);
      setOwnedTools((prev = []) =>
        prev.includes(obj.currentToolId) ? prev : [...prev, obj.currentToolId]
      );
    } else {
      setCurrentTool(toolsData.hand);
    }

    // restore autosave preference if provided
    if (typeof obj.autosaveEnabled === "boolean" && setAutoSave)
      setAutoSave(Boolean(obj.autosaveEnabled));
    if (typeof obj.lastSaveAt === "number" && setLastSaveAt)
      setLastSaveAt(obj.lastSaveAt);

    return { success: true };
  } catch {
    return { success: false, reason: "apply_failed" };
  }
};
