export function DepthMeter({ depth }) {
  return (
    <div className="h-full w-7 flex bg-slate-800 text-white relative">
      <div className="rotate-270 absolute top-0 left-0 whitespace-nowrap w-fit h-fit">
        Depth
      </div>
      <div
        className="w-full h-0.5 bg-white"
        style={{ marginTop: `${depth}px` }}
      />
    </div>
  );
}
