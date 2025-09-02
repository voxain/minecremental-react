export function DepthMeter({ maxDepth = 0, current = 0 }) {
  // compute percentage of progress (0 = top, 1 = bottom reached)
  const pct = maxDepth > 0 ? Math.min(current / maxDepth, 1) : 0;
  // render a thin marker that moves from top to bottom as pct increases
  const markerTop = pct * 100;
  return (
    <div className="h-full w-7 flex bg-slate-800 text-white relative">
      <div className="rotate-270 absolute top-0 left-0 whitespace-nowrap w-fit h-fit">
        Depth
      </div>
      {/* background track */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="w-full h-full" />
      </div>
      {/* marker */}
      <div
        className="absolute left-0 w-full bg-white"
        style={{
          height: "4px",
          top: `${markerTop}%`,
          transform: "translateY(-50%)",
        }}
      />
      {/* numeric label */}
      <div className="absolute bottom-1 left-0 w-full text-center text-xs text-gray-300">
        {`${Math.min(
          Math.max(0, Math.floor(current || 0)),
          Math.max(0, Math.floor(maxDepth || 0))
        )} / ${Math.max(0, Math.floor(maxDepth || 0))}`}
      </div>
    </div>
  );
}
