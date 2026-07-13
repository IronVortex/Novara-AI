import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { MyContext } from "../../context/MyContext.jsx";
import { deleteThread, exportThread, getThread, getThreads, updateThread } from "../../services/api.js";
import { copyConversation, exportMarkdownFile } from "../../utils/exportChat.js";
import { buildShareUrl, normalizeThreads, sortThreads } from "../../utils/helpers.js";
import Modal from "../common/Modal.jsx";
import ProfileDropdown from "../common/ProfileDropdown.jsx";
import SidebarHeader from "./SidebarHeader.jsx";
import ThreadItem from "./ThreadItem.jsx";
import "../../styles/sidebar.css";

function Sidebar({ isOpen, onClose }) {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,
    authUser,
    logout,
    setToast,
    prevChats,
  } = useContext(MyContext);
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const loadThreads = useCallback(async () => {
    try {
      const threads = await getThreads();
      setAllThreads(sortThreads(normalizeThreads(threads)));
    } catch (error) {
      console.error(error);
    }
  }, [setAllThreads]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const filteredThreads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const base = sortThreads(allThreads);
    if (!normalizedQuery) return base;

    return base.filter(
      (thread) =>
        thread.title?.toLowerCase().includes(normalizedQuery) ||
        thread.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery))
    );
  }, [allThreads, query]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv4());
    setPrevChats([]);
    onClose?.();
  };

  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);
    setNewChat(false);
    onClose?.();

    try {
      const response = await getThread(newThreadId);
      setPrevChats(response.messages || response || []);
      setReply(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteThread = async (threadId) => {
    try {
      await deleteThread(threadId);
      setAllThreads((prev) => prev.filter((thread) => thread.threadId !== threadId));
      if (threadId === currThreadId) createNewChat();
      setToast({ type: "success", message: "Conversation deleted" });
    } catch (error) {
      setToast({ type: "error", message: error.message });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleToggleMeta = async (thread, field) => {
    try {
      await updateThread(thread.threadId, { [field]: !thread[field] });
      setAllThreads((prev) =>
        prev.map((item) =>
          item.threadId === thread.threadId ? { ...item, [field]: !item[field] } : item
        )
      );
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  const handleRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    try {
      await updateThread(renameTarget.threadId, { title: renameValue.trim() });
      setAllThreads((prev) =>
        prev.map((item) =>
          item.threadId === renameTarget.threadId ? { ...item, title: renameValue.trim() } : item
        )
      );
      setToast({ type: "success", message: "Conversation renamed" });
    } catch (error) {
      setToast({ type: "error", message: error.message });
    } finally {
      setRenameTarget(null);
      setRenameValue("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleExport = async () => {
    const response = await exportThread(currThreadId);
    exportMarkdownFile(response.markdown, response.title);
    setToast({ type: "success", message: "Chat exported" });
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <SidebarHeader onNewChat={createNewChat} />

      <label className="search-box" htmlFor="thread-search">
        <span>⌕</span>
        <input
          id="thread-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search conversations"
          aria-label="Search conversations"
        />
      </label>

      <ul className="thread-list" aria-label="Conversation history">
        {filteredThreads.map((thread) => (
          <ThreadItem
            key={thread.threadId}
            thread={thread}
            active={thread.threadId === currThreadId}
            onSelect={changeThread}
            onDelete={setDeleteTarget}
            onRename={(item) => {
              setRenameTarget(item);
              setRenameValue(item.title);
            }}
            onTogglePin={() => handleToggleMeta(thread, "isPinned")}
            onToggleFavorite={() => handleToggleMeta(thread, "isFavorite")}
          />
        ))}
      </ul>

      <div className="sidebar-footer">
        <ProfileDropdown
          user={authUser}
          onLogout={handleLogout}
          onExport={handleExport}
          onCopy={() => copyConversation(prevChats).then(() => setToast({ type: "success", message: "Copied" }))}
          onShare={() => {
            navigator.clipboard.writeText(buildShareUrl(currThreadId));
            setToast({ type: "success", message: "Share link copied" });
          }}
        />
      </div>

      <Modal isOpen={Boolean(deleteTarget)} title="Delete conversation?" onClose={() => setDeleteTarget(null)}>
        <p>This action cannot be undone.</p>
        <div className="modal-actions">
          <button type="button" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button type="button" className="danger" onClick={() => handleDeleteThread(deleteTarget.threadId)}>
            Delete
          </button>
        </div>
      </Modal>

      <Modal isOpen={Boolean(renameTarget)} title="Rename conversation" onClose={() => setRenameTarget(null)}>
        <input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} />
        <div className="modal-actions">
          <button type="button" onClick={() => setRenameTarget(null)}>Cancel</button>
          <button type="button" onClick={handleRename}>Save</button>
        </div>
      </Modal>
    </aside>
  );
}

export default Sidebar;
