import { formatDate, truncateText } from "../../utils/formatDate.js";

function ThreadItem({
  thread,
  active,
  onSelect,
  onDelete,
  onRename,
  onTogglePin,
  onToggleFavorite,
}) {
  return (
    <li className={`thread-item ${active ? "active" : ""} ${thread.isPinned ? "pinned" : ""}`}>
      <button className="thread-select" onClick={() => onSelect(thread.threadId)}>
        <span className="thread-title">
          {thread.isPinned ? "📌 " : ""}
          {thread.isFavorite ? "★ " : ""}
          {truncateText(thread.title, 32)}
        </span>
        <span className="thread-meta">{formatDate(thread.updatedAt)}</span>
      </button>
      <div className="thread-actions">
        <button type="button" className="thread-action" onClick={onTogglePin} aria-label="Pin thread">📌</button>
        <button type="button" className="thread-action" onClick={onToggleFavorite} aria-label="Favorite thread">★</button>
        <button type="button" className="thread-action" onClick={() => onRename(thread)} aria-label="Rename thread">✎</button>
        <button
          className="thread-delete"
          onClick={() => onDelete(thread)}
          aria-label={`Delete ${thread.title}`}
        >
          ×
        </button>
      </div>
    </li>
  );
}

export default ThreadItem;
