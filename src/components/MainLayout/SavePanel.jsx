import React, { useEffect, useState } from "react";
import moment from "moment";

export default function SavePanel({
  exportText,
  importText,
  setImportText,
  onBuild,
  onCopy,
  onSaveLocal,
  onLoadLocal,
  onImport,
  onClear,
  autosaveEnabled,
  onToggleAutoSave,
  lastSaveAt,
}) {
  const [, setTick] = useState(0);

  // keep relative time reactive — update every 1 second while we have a timestamp
  useEffect(() => {
    if (!lastSaveAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [lastSaveAt]);
  return (
    <div>
      <h2 className="text-lg mt-2">Save / Load</h2>
      <div className="flex gap-2 items-center">
        <button onClick={onBuild} className="border p-1">
          Build Export
        </button>
        <button onClick={onCopy} className="border p-1">
          Copy
        </button>
        <button onClick={onSaveLocal} className="border p-1">
          Save to Local
        </button>
        <button onClick={onLoadLocal} className="border p-1">
          Load from Local
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          id="autosave"
          type="checkbox"
          checked={!!autosaveEnabled}
          onChange={(e) =>
            onToggleAutoSave && onToggleAutoSave(e.target.checked)
          }
        />
        <label htmlFor="autosave">Enable autosave (every 5 minutes)</label>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Last save: {lastSaveAt ? moment(lastSaveAt).fromNow() : "Never"}
      </div>
      <textarea
        className="w-full h-24 mt-2 p-1 text-xs"
        value={exportText}
        readOnly
      />
      <div className="mt-2">Or paste an import string below:</div>
      <textarea
        className="w-full h-24 mt-1 p-1 text-xs"
        value={importText}
        onChange={(e) => setImportText(e.target.value)}
      />
      <div className="flex gap-2 mt-2">
        <button onClick={onImport} className="border p-1">
          Import
        </button>
        <button onClick={onClear} className="border p-1">
          Clear
        </button>
      </div>
    </div>
  );
}
