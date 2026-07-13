import { formatDate, truncateText } from "../../utils/formatDate.js";

function ThreadItem({ thread, active, onSelect, onDelete }) {
  return (
    <li className={`thread-item ${active ? "active" : ""}`}>
      <button className="thread-select" onClick={() => onSelect(thread.threadId)}>
        <span className="thread-title">{truncateText(thread.title, 32)}</span>
        <span className="thread-meta">{formatDate(thread.updatedAt)}</span>
      </button>
      <button
        className="thread-delete"
        onClick={() => onDelete(thread.threadId)}
        aria-label={`Delete ${thread.title}`}
      >
        ×
      </button>
    </li>
  );
}

export default ThreadItem;
