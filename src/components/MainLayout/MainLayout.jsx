import React from "react";
import { MiningColumn } from "../MiningColumn/MiningColumn";
import { layerData } from "../../data/layers";
import { toolsData } from "../../data/tools";
import { craftItem, isCraftable } from "../../utils/crafting";
import {
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../voxain-radix/tabs";
import { useGameLogic } from "../../contexts/GameLogicContext";
import { mineBlock } from "../../utils/mining";
import { blockData } from "../../data/blocks";
import { useState } from "react";
import SavePanel from "./SavePanel";
import ConsolePanel from "./ConsolePanel";

export function MainLayout() {
  const gameLogic = useGameLogic();
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const logger = gameLogic && gameLogic.logger ? gameLogic.logger : null;

  // Helper: attempt to craft a tool via shared craftItem helper
  // Keeps UI code concise and centralizes logging for craft attempts.
  function craftTool(itemId) {
    const itemDef = toolsData[itemId];
    const result = craftItem(gameLogic, itemDef);
    if (result && result.success) console.log("Crafted", itemId);
    else console.log("Failed to craft:", result && result.reason);
  }

  // Format a recipe object into a human-readable string, e.g. {wood:10} -> "10x Wood"
  function formatReqText(recipe = {}) {
    return Object.entries(recipe)
      .map(
        ([mat, qty]) => `${qty}x ${mat.charAt(0).toUpperCase()}${mat.slice(1)}`
      )
      .join(", ");
  }

  // Small helpers to check ownership/unlock state
  function isOwned(id) {
    return (
      gameLogic.tools &&
      Array.isArray(gameLogic.tools.value) &&
      gameLogic.tools.value.includes(id)
    );
  }

  function isUnlocked(id) {
    return (
      gameLogic.unlocked &&
      Array.isArray(gameLogic.unlocked.value) &&
      gameLogic.unlocked.value.includes(id)
    );
  }

  // Render the craftable items list. Extracted to declutter JSX below.
  function renderCraftList() {
    return Object.values(toolsData)
      .filter((t) => t && t.recipe)
      .map((item) => {
        const id = item.id;
        const owned = isOwned(id);

        // Historical visibility rule: stone pickaxe is only visible after wooden pickaxe is unlocked
        if (id === "pickaxe_stone" && !isUnlocked("pickaxe_stone")) return null;

        const craftable = isCraftable(gameLogic, item) && !owned;

        return (
          <div
            key={id}
            role="button"
            aria-disabled={!craftable}
            onClick={() => {
              if (!craftable) return;
              craftTool(id);
            }}
            className={
              "border-1 p-3 w-50 mt-2 " +
              (craftable ? "cursor-pointer hover:bg-slate-100" : "opacity-50")
            }
          >
            <h1 className="text-lg">{item.name}</h1>
            <p>Requires: {formatReqText(item.recipe)}</p>
            {owned ? <p className="text-sm">(Owned)</p> : null}
          </div>
        );
      });
  }

  function buildExport() {
    if (!gameLogic || !gameLogic.save) return;
    const s = gameLogic.save.toString();
    if (!s) {
      logger &&
        logger.push &&
        logger.push("Failed to build export string", {
          color: "red",
          severity: "error",
        });
      return;
    }
    setExportText(s);
    logger &&
      logger.push &&
      logger.push("Export ready", { color: "green", severity: "important" });
  }

  function doExportToLocal() {
    if (!gameLogic || !gameLogic.save) return;
    gameLogic.save.saveToLocal();
  }

  function doLoadFromLocal() {
    if (!gameLogic || !gameLogic.save) return;
    gameLogic.save.loadFromLocal();
  }

  function doImportString() {
    if (!gameLogic || !gameLogic.save) return;
    gameLogic.save.loadFromString(importText);
  }

  return (
    <>
      <div className="grid grid-cols-[20rem_3fr_1fr] grid-rows-[min-content_1fr] gap-4 h-screen p-4">
        <MiningColumn className="bg-slate-200 row-span-2 border-3 border-gray-400" />

        <div className="bg-teal-100 p-4 col-start-2 col-span-2 border-3 border-gray-400 flex">
          <div className="flex w-20">
            <img
              className="size-6"
              src={import.meta.env.BASE_URL + "img/currencies/copper.png"}
              alt="Copper Coin"
              title="Copper Coins"
            />
            : 10
          </div>
          <div className="flex w-20">
            <img
              className="size-6"
              src={import.meta.env.BASE_URL + "img/currencies/silver.png"}
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
                onClick={() => mineBlock(gameLogic)}
                onMouseDown={() => gameLogic.mining.set(true)}
                onMouseUp={() => gameLogic.mining.set(false)}
                className="border-1 p-3 w-50 cursor-pointer"
              >
                <h1 className="text-lg">Mine</h1>
                <p>Current tool: {gameLogic.current_tool.value.name}</p>
                <p>Mining power: {gameLogic.current_tool.value.mining_power}</p>
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
              {renderCraftList()}
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
          <hr className="my-2" />
          <SavePanel
            exportText={exportText}
            importText={importText}
            setImportText={setImportText}
            onBuild={() => buildExport()}
            onCopy={() =>
              navigator.clipboard && navigator.clipboard.writeText(exportText)
            }
            onSaveLocal={() => doExportToLocal()}
            onLoadLocal={() => doLoadFromLocal()}
            onImport={() => doImportString()}
            onClear={() => {
              setImportText("");
              setExportText("");
              logger && logger.clear && logger.clear();
            }}
            autosaveEnabled={
              gameLogic && gameLogic.save
                ? gameLogic.save.autosaveEnabled
                : false
            }
            onToggleAutoSave={(v) =>
              gameLogic &&
              gameLogic.save &&
              gameLogic.save.setAutoSave &&
              gameLogic.save.setAutoSave(v)
            }
            lastSaveAt={
              gameLogic && gameLogic.save ? gameLogic.save.lastSaveAt : null
            }
            onCheatUnlockAll={() =>
              gameLogic && gameLogic.cheats && gameLogic.cheats.unlockAllLayers
                ? gameLogic.cheats.unlockAllLayers()
                : null
            }
            onCheatGiveAll={() =>
              gameLogic && gameLogic.cheats && gameLogic.cheats.giveAllItems
                ? gameLogic.cheats.giveAllItems()
                : null
            }
            onCheatGiveItem={(id) => {
              if (!id) return;
              gameLogic &&
                gameLogic.cheats &&
                gameLogic.cheats.giveItem &&
                gameLogic.cheats.giveItem(id, 999);
            }}
          />

          <ConsolePanel logger={logger} />
        </div>
      </div>
    </>
  );
}

export default MainLayout;
