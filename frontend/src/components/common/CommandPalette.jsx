import { useEffect, useRef } from "react";

function CommandPalette({ isOpen, onClose, commands = [] }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop command-backdrop" onClick={onClose}>
      <div className="command-palette" onClick={(event) => event.stopPropagation()}>
        <input ref={inputRef} placeholder="Search commands..." className="command-input" readOnly />
        <ul className="command-list">
          {commands.map((command) => (
            <li key={command.id}>
              <button type="button" onClick={() => { command.action(); onClose(); }}>
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
