import { useMemo, useRef, useState, useEffect } from "react";

function CommandPalette({ isOpen, onClose, commands = [] }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);



  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((command) => command.label.toLowerCase().includes(q));
  }, [commands, query]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop command-backdrop" onClick={onClose} role="presentation">
      <div
        className="command-palette"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search commands..."
          className="command-input"
          aria-label="Search commands"
        />
        <ul className="command-list">
          {filtered.map((command) => (
            <li key={command.id}>
              <button
                type="button"
                onClick={() => {
                  command.action();
                  onClose();
                }}
              >
                <span>{command.label}</span>
                <kbd>{command.shortcut}</kbd>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CommandPalette;
