import { formatDate, truncateText } from "../../utils/formatDate.js";
import {
  IconPin,
  IconPinFilled,
  IconStar,
  IconStarFilled,
  IconEdit,
  IconTrash,
} from "../common/Icons.jsx";

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
          {thread.isPinned && <IconPinFilled size={14} className="inline-icon" style={{ marginRight: "4px", verticalAlign: "middle" }} />}
          {thread.isFavorite && <IconStarFilled size={14} className="inline-icon" style={{ marginRight: "4px", verticalAlign: "middle" }} />}
          {truncateText(thread.title, 32)}
        </span>
        <span className="thread-meta">{formatDate(thread.updatedAt)}</span>
      </button>
      <div className="thread-actions">
        <button
          type="button"
          className="thread-action"
          onClick={onTogglePin}
          aria-label="Pin thread"
        >
          {thread.isPinned ? <IconPinFilled size={16} /> : <IconPin size={16} />}
        </button>
        <button
          type="button"
          className="thread-action"
          onClick={onToggleFavorite}
          aria-label="Favorite thread"
        >
          {thread.isFavorite ? <IconStarFilled size={16} /> : <IconStar size={16} />}
        </button>
        <button
          type="button"
          className="thread-action"
          onClick={() => onRename(thread)}
          aria-label="Rename thread"
        >
          <IconEdit size={16} />
        </button>
        <button
          className="thread-delete"
          onClick={() => onDelete(thread)}
          aria-label={`Delete ${thread.title}`}
        >
          <IconTrash size={16} />
        </button>
      </div>
    </li>
  );
}

export default ThreadItem;
