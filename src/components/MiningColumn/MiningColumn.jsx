import { LayerList } from "./LayerList";
import { DepthMeter } from "./DepthMeter";
import { MiningAction } from "./MiningAction";
import { useGameLogic } from "../../contexts/GameLogicContext";

export function MiningColumn({ className = "" }) {
  const gameLogic = useGameLogic();
  const mergedClassName = `bg-slate-200 flex flex-row ${className}`.trim();
  // You can pass blockQueue to LayerList or use it here as needed
  return (
    <div className={mergedClassName}>
      <LayerList />
      <DepthMeter depth={100} />
      <MiningAction queue={gameLogic.block_queue.value} />
    </div>
  );
}
