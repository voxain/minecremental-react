import { Tooltip } from "radix-ui";
import { layerData } from "../../data/layers";
import { useGameLogic } from "../../contexts/GameLogicContext";

export function LayerList() {
  const gameLogic = useGameLogic();
  return (
    <div className="h-full w-14 px-2 bg-slate-300">
      <h3 className="text-sm font-semibold">Layers</h3>
      <div className="flex flex-col space-y-2">
        {layerData.map((layer, id) => (
          <Tooltip.Root key={id}>
            <Tooltip.Trigger onClick={() => gameLogic.switchLayer(id)} asChild>
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
                {layer.name}: {layer.description}
                <Tooltip.Arrow className="TooltipArrow" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        ))}
      </div>
    </div>
  );
}
