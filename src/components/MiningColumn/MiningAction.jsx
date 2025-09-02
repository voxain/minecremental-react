import { Tooltip } from "@radix-ui/themes";
import { useGameLogic } from "../../contexts/GameLogicContext";
import { Progress } from "radix-ui";
import { useEffect, useState } from "react";
import { toolsData } from "../../data/tools";

export function MiningAction({ queue }) {
  const gameLogic = useGameLogic();
  const [shake, setShake] = useState(false);
  const [prevToolId, setPrevToolId] = useState(null);
  const [indicatorShake, setIndicatorShake] = useState(false);

  // Mirror the tool_shake flag from game logic so the UI can animate
  const toolShakeFlag = gameLogic.tool_shake
    ? gameLogic.tool_shake.value
    : false;
  useEffect(() => setShake(Boolean(toolShakeFlag)), [toolShakeFlag]);

  // current tool id
  const currentToolId =
    gameLogic.current_tool &&
    gameLogic.current_tool.value &&
    gameLogic.current_tool.value.id;

  useEffect(() => {
    if (!currentToolId) return;
    if (prevToolId && prevToolId !== currentToolId) {
      const t = setTimeout(() => setPrevToolId(null), 320);
      return () => clearTimeout(t);
    }
    if (!prevToolId) setPrevToolId(currentToolId);
  }, [currentToolId, prevToolId]);

  const owned = (gameLogic.tools && gameLogic.tools.value) || [];
  const currentId = currentToolId;
  const idx = owned.indexOf(currentId);
  const prev =
    owned.length > 1 ? owned[(idx - 1 + owned.length) % owned.length] : null;
  const next = owned.length > 1 ? owned[(idx + 1) % owned.length] : null;
  const prevTool = prev ? toolsData[prev] : null;
  const nextTool = next ? toolsData[next] : null;

  // queued block for checks
  const currentQueuedBlock =
    (gameLogic.block_queue &&
      gameLogic.block_queue.value &&
      gameLogic.block_queue.value[0]) ||
    null;
  const currentTool = currentId ? toolsData[currentId] : null;
  const toolObj = currentTool;
  const isTooWeak =
    toolObj &&
    currentQueuedBlock &&
    typeof toolObj.mining_power === "number" &&
    typeof currentQueuedBlock.toughness === "number" &&
    toolObj.mining_power < currentQueuedBlock.toughness;
  const isIneffective =
    toolObj &&
    currentQueuedBlock &&
    Array.isArray(toolObj.effective) &&
    !toolObj.effective.includes(currentQueuedBlock.class);

  return (
    <div className="flex flex-1 items-center flex-col gap-2">
      <div className="flex items-center gap-3 min-h-[48px]">
        {/* previous preview */}
        <div className="flex flex-col items-center gap-1">
          {prevTool ? (
            <img
              src={prevTool.image}
              alt={prevTool.name}
              className="w-12 h-12 opacity-50 object-contain block cursor-pointer hover:opacity-80"
              onClick={() =>
                gameLogic.tools &&
                gameLogic.tools.equipPrev &&
                gameLogic.tools.equipPrev()
              }
            />
          ) : (
            <div className="w-12 h-12" />
          )}
        </div>

        {/* current tool (with animation & indicator) */}
        <div className="relative w-24 h-24">
          {prevToolId && prevToolId !== currentId ? (
            <img
              src={prevToolId ? toolsData[prevToolId].image : ""}
              alt={prevToolId ? toolsData[prevToolId].name : ""}
              className="absolute inset-0 w-24 h-24 object-contain block tool-out"
            />
          ) : null}
          {currentTool ? (
            <img
              src={currentTool.image}
              alt={currentTool.name}
              className={`absolute inset-0 w-24 h-24 object-contain block ${
                shake ? "animate-shake" : ""
              } ${prevToolId && prevToolId !== currentId ? "tool-in" : ""}`}
            />
          ) : null}

          {/* indicator badge: shows if ineffective or too weak */}
          {(isTooWeak || isIneffective) && (
            <div
              onClick={() => {
                setIndicatorShake(true);
                setTimeout(() => setIndicatorShake(false), 220);
              }}
              role="button"
              aria-label={isTooWeak ? "Tool too weak" : "Tool ineffective"}
              className={`absolute -right-1 -top-1 z-10 text-xs px-2 py-0.5 rounded-full text-white ${
                isTooWeak ? "bg-red-500" : "bg-yellow-500"
              } ${indicatorShake ? "animate-shake" : ""}`}
            >
              {isTooWeak ? "Too weak" : "Ineffective"}
            </div>
          )}
        </div>

        {/* next preview */}
        <div className="flex flex-col items-center gap-1">
          {nextTool ? (
            <img
              src={nextTool.image}
              alt={nextTool.name}
              className="w-12 h-12 opacity-50 object-contain block cursor-pointer hover:opacity-80"
              onClick={() =>
                gameLogic.tools &&
                gameLogic.tools.equipNext &&
                gameLogic.tools.equipNext()
              }
            />
          ) : (
            <div className="w-12 h-12" />
          )}
        </div>
      </div>

      {/* Skip button shown when tool is too weak to avoid softlocks */}
      <div className="w-full flex justify-end">
        {isTooWeak ? (
          <button
            onClick={() =>
              gameLogic.skipCurrentBlock && gameLogic.skipCurrentBlock()
            }
            className="bg-red-600! text-white text-sm px-3 py-1 rounded hover:bg-red-700!"
            title="Skip current block"
          >
            Skip
          </button>
        ) : null}
      </div>

      {queue.map((block, id) => (
        <Tooltip
          key={id}
          content={`${block.name}, Hardness: ${block.hardness}`}
        >
          <div>
            <img className="w-16" src={block.image} alt={block.name} />
            <Progress.Root
              className="h-3 w-16 bg-red-500 relative overflow-hidden"
              max={block.hardness}
              hidden={id > 0}
            >
              <Progress.Indicator
                style={{
                  transform: `translateX(${
                    100 - (gameLogic.mining.progress / block.hardness) * 100
                  }%)`,
                }}
                className="h-full bg-slate-500"
              />
            </Progress.Root>
          </div>
        </Tooltip>
      ))}
    </div>
  );
}
