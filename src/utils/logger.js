// Lightweight console helper functions
export const pushConsole = (
  setConsoleLines,
  MAX_CONSOLE_LINES,
  text,
  opts = {}
) => {
  try {
    const line = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      text: String(text),
      time: new Date().toISOString(),
      // severity: one of 'debug'|'info'|'important'|'warning'|'error'
      severity: opts.severity || "info",
      color: opts.color || null,
      bold: Boolean(opts.bold),
      meta: opts.meta || null,
    };
    setConsoleLines((prev) => {
      const next = (prev || []).concat(line);
      if (next.length > MAX_CONSOLE_LINES)
        return next.slice(-MAX_CONSOLE_LINES);
      return next;
    });
  } catch {
    // ignore
  }
};

export const clearConsole = (setConsoleLines) => {
  try {
    setConsoleLines([]);
  } catch {
    // ignore
  }
};
