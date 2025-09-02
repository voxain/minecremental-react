import { LayerList } from "./LayerList";
import { DepthMeter } from "./DepthMeter";
import { MiningAction } from "./MiningAction";
import { useGameLogic } from "../../contexts/GameLogicContext";
import { layerData } from "../../data/layers";

export function MiningColumn({ className = "" }) {
  const gameLogic = useGameLogic();
  const mergedClassName = `bg-slate-200 flex flex-row ${className}`.trim();
  // You can pass blockQueue to LayerList or use it here as needed
  return (
    <div className={mergedClassName}>
      <LayerList />
      <DepthMeter
        maxDepth={
          (gameLogic.current_layer &&
            layerData[gameLogic.current_layer.value] &&
            layerData[gameLogic.current_layer.value].depth) ||
          0
        }
        current={
          (gameLogic.layer_progress &&
            gameLogic.layer_progress.value &&
            gameLogic.layer_progress.value[gameLogic.current_layer.value]) ||
          0
        }
      />
      <MiningAction queue={gameLogic.block_queue.value} />
    </div>
  );
}
