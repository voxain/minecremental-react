import React, { useEffect, useRef, useState } from "react";

export default function ConsolePanel({ logger }) {
  const containerRef = useRef(null);
  const [minSeverity, setMinSeverity] = useState("info");

  // Auto-scroll to bottom whenever logger.lines changes so newest messages are visible.
  const lines = (logger && logger.lines) || [];

  // severity ranking
  const severityRank = {
    debug: 0,
    info: 1,
    important: 2,
    warning: 3,
    error: 4,
  };

  const filtered = lines.filter((l) => {
    const sev = l && l.severity ? l.severity : "info";
    return severityRank[sev] >= severityRank[minSeverity];
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // scroll to bottom
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } catch {
      // fallback
      el.scrollTop = el.scrollHeight;
    }
  }, [filtered.length]);

  return (
    <div className="mt-2">
      <div className="bg-black text-white p-2 h-40 overflow-y-hidden text-xs font-mono">
        <div className="sticky top-0 bg-black z-10 py-1">
          <div className="flex justify-between items-center mb-1">
            <div>Console</div>
            <div className="flex items-center gap-2">
              <label className="text-xs mr-1">Min severity:</label>
              <select
                value={minSeverity}
                onChange={(e) => setMinSeverity(e.target.value)}
                className="text-xs bg-gray-800 border p-1"
              >
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="important">Important</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
              <button
                onClick={() => logger && logger.clear && logger.clear()}
                className="border p-1 text-xs bg-gray-800"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        <div
          ref={containerRef}
          className="overflow-y-auto h-[calc(10rem-1.5rem)]"
        >
          <div className="px-0 py-1">
            {filtered.map((l) => {
              const sev = l && l.severity ? l.severity : "info";
              const tagMap = {
                debug: "DBUG",
                info: "INFO",
                important: "IMPT",
                warning: "WARN",
                error: "CRIT",
              };
              const tag = tagMap[sev] || "INFO";
              const content = l.text;
              const messageColor = l.color || "#cfcfcf"; // default light gray
              const tagColorMap = {
                debug: "#ffffff",
                info: "#0ee5ff",
                important: "#44ff66",
                warning: "#ffd24a",
                error: "#ff6161",
              };
              const tagColor = tagColorMap[sev] || "#ffffff";
              return (
                <div key={l.id} style={{ color: messageColor }}>
                  <span style={{ color: tagColor, fontWeight: 700 }}>
                    [{tag}]
                  </span>
                  <span style={{ paddingLeft: 6 }}>
                    {l.bold ? <strong>{content}</strong> : content}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
