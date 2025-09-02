import { Tooltip } from "radix-ui";
import { layerData } from "../../data/layers";
import { useGameLogic } from "../../contexts/GameLogicContext";

export function LayerList() {
  const gameLogic = useGameLogic();
  return (
    <div className="h-full w-14 px-2 bg-slate-300">
      <h3 className="text-sm font-semibold">Layers</h3>
      <div className="flex flex-col space-y-2">
        {layerData.map((layer, id) => {
          const unlocked =
            gameLogic.layer_progress && gameLogic.layer_progress.isUnlocked
              ? gameLogic.layer_progress.isUnlocked(id)
              : id === 0;
          // hide locked layers entirely
          if (!unlocked) return null;
          return (
            <Tooltip.Root key={id}>
              <Tooltip.Trigger
                onClick={() => {
                  gameLogic.switchLayer(id);
                }}
                asChild
              >
                <img
                  src={layer.icon}
                  alt={layer.name}
                  className={`w-full ${
                    gameLogic.current_layer.value === id
                      ? "border-2 border-blue-500 rounded"
                      : ""
                  }`}
                />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  className="bg-slate-800 text-white p-2 rounded"
                  sideOffset={5}
                >
                  <div className="font-semibold">{layer.name}</div>
                  <div className="text-xs mt-1 mb-2">{layer.description}</div>
                  {Array.isArray(layer.layerBlocks) &&
                  layer.layerBlocks.length > 0
                    ? (() => {
                        // compute probabilities using the sequential selection algorithm
                        // probability for index i is: if i < n-1 => max(0, rate[i] - rate[i+1])
                        // for last index: max(0, rate[last])
                        // clamp rates into 0..100 to avoid visual overshoot (e.g., single item with 500)
                        const rates = layer.layerBlocks.map((b) => {
                          const v = Number(b.dropRate || 0);
                          if (!Number.isFinite(v)) return 0;
                          return Math.min(100, Math.max(0, v));
                        });
                        return (
                          <div className="text-xs">
                            <div className="underline mb-1">Drop chances</div>
                            {layer.layerBlocks.map((b, i) => {
                              const name =
                                (b.block && b.block.name) ||
                                (b.block && b.block.id) ||
                                `block-${i}`;
                              let raw = 0;
                              if (i < rates.length - 1)
                                raw = Math.max(0, rates[i] - rates[i + 1]);
                              else raw = Math.max(0, rates[i]);
                              const pct = Math.min(100, raw); // cap visual percent at 100
                              const label =
                                pct >= 1 ? pct.toFixed(1) : pct.toFixed(2);
                              return (
                                <div key={i} className="mb-1">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm">{name}</div>
                                    <div className="ml-2 text-xs">{label}%</div>
                                  </div>
                                  <div className="w-full bg-slate-700 h-2 rounded mt-1">
                                    <div
                                      className="bg-white h-2 rounded"
                                      style={{ width: `${Math.max(0, pct)}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()
                    : null}
                  <Tooltip.Arrow className="TooltipArrow" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          );
        })}
      </div>
    </div>
  );
}
