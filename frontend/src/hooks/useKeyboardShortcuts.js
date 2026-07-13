import { useEffect } from "react";

export function useKeyboardShortcuts(shortcuts = {}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const combo = `${event.ctrlKey || event.metaKey ? "ctrl+" : ""}${key}`;

      if (shortcuts[combo]) {
        event.preventDefault();
        shortcuts[combo](event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
