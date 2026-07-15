import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { MyContext } from "../../context/MyContext.jsx";
import { deleteThread, exportThread, getThread, getThreads, updateThread } from "../../services/api.js";
import {
  deleteGuestThread,
  exportGuestMarkdown,
  getGuestThread,
  getGuestThreads,
  updateGuestThreadMeta,
} from "../../services/guestStorage.js";
import { copyConversation, exportMarkdownFile } from "../../utils/exportChat.js";
import { buildShareUrl, normalizeThreads, sortThreads } from "../../utils/helpers.js";
import Modal from "../common/Modal.jsx";
import ProfileDropdown from "../common/ProfileDropdown.jsx";
import SidebarHeader from "./SidebarHeader.jsx";
import ThreadItem from "./ThreadItem.jsx";
import { IconSearch, IconFolder, IconArchive, IconSettings, IconSparkle } from "../common/Icons.jsx";
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
    isAuthenticated,
    sidebarCollapsed,
  } = useContext(MyContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const loadThreads = useCallback(async () => {
    try {
      if (isAuthenticated) {
        const threads = await getThreads();
        setAllThreads(sortThreads(normalizeThreads(threads)));
      } else {
        setAllThreads(sortThreads(normalizeThreads(getGuestThreads())));
      }
    } catch {
      // Keep sidebar usable offline for guests.
    }
  }, [isAuthenticated, setAllThreads]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const createNewChat = useCallback(() => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv4());
    setPrevChats([]);
    onClose?.();
  }, [onClose, setCurrThreadId, setNewChat, setPrevChats, setPrompt, setReply]);

  const changeThread = useCallback(
    async (newThreadId) => {
      setCurrThreadId(newThreadId);
      setNewChat(false);
      onClose?.();

      try {
        if (isAuthenticated) {
          const response = await getThread(newThreadId);
          setPrevChats(response.messages || response || []);
        } else {
          const thread = getGuestThread(newThreadId);
          setPrevChats(thread?.messages || []);
        }
        setReply(null);
      } catch {
        setToast({ type: "error", message: "Unable to open conversation" });
      }
    },
    [isAuthenticated, onClose, setCurrThreadId, setNewChat, setPrevChats, setReply, setToast]
  );

  useEffect(() => {
    const threadId = searchParams.get("thread");
    if (!threadId) return undefined;

    changeThread(threadId);
    const next = new URLSearchParams(searchParams);
    next.delete("thread");
    setSearchParams(next, { replace: true });
    return undefined;
    // Intentionally run once when thread query is present.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const pinnedThreads = filteredThreads.filter((thread) => thread.isPinned);
  const recentThreads = filteredThreads.filter((thread) => !thread.isPinned);

  const handleDeleteThread = async (threadId) => {
    try {
      if (isAuthenticated) await deleteThread(threadId);
      else deleteGuestThread(threadId);
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
      if (isAuthenticated) {
        await updateThread(thread.threadId, { [field]: !thread[field] });
      } else {
        updateGuestThreadMeta(thread.threadId, { [field]: !thread[field] });
      }
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
      if (isAuthenticated) {
        await updateThread(renameTarget.threadId, { title: renameValue.trim() });
      } else {
        updateGuestThreadMeta(renameTarget.threadId, { title: renameValue.trim() });
      }
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

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleExport = async () => {
    try {
      if (isAuthenticated) {
        const response = await exportThread(currThreadId);
        exportMarkdownFile(response.markdown, response.title);
      } else {
        const response = exportGuestMarkdown(currThreadId);
        if (!response) throw new Error("Nothing to export");
        exportMarkdownFile(response.markdown, response.title);
      }
      setToast({ type: "success", message: "Chat exported" });
    } catch (error) {
      setToast({ type: "error", message: error.message });
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""} ${sidebarCollapsed ? "collapsed" : ""}`}>
      <SidebarHeader onNewChat={createNewChat} />

      <label className="search-box" htmlFor="thread-search">
        <IconSearch size={16} className="search-icon" aria-hidden="true" />
        <input
          id="thread-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search chats"
          aria-label="Search chats"
        />
      </label>

      <div className="sidebar-sections">
        {pinnedThreads.length ? (
          <section>
            <h3 className="sidebar-section-title">Pinned</h3>
            <ul className="thread-list" aria-label="Pinned chats">
              {pinnedThreads.map((thread) => (
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
          </section>
        ) : null}

        <section>
          <h3 className="sidebar-section-title">Recent</h3>
          <ul className="thread-list" aria-label="Recent chats">
            {recentThreads.map((thread) => (
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
        </section>

        <section className="sidebar-future">
          <button type="button" className="sidebar-link" disabled title="Coming soon">
            <IconFolder size={18} className="sidebar-icon" />
            <span>Folders</span>
          </button>
          <button type="button" className="sidebar-link" disabled title="Coming soon">
            <IconArchive size={18} className="sidebar-icon" />
            <span>Archive</span>
          </button>
          <button type="button" className="sidebar-link" onClick={() => navigate("/settings")}>
            <IconSettings size={18} className="sidebar-icon" />
            <span>Settings</span>
          </button>
          <button type="button" className="sidebar-upgrade" onClick={() => setToast({ type: "success", message: "Upgrade coming soon" })}>
            <IconSparkle size={18} className="sidebar-icon" />
            <span>Upgrade</span>
          </button>
        </section>
      </div>

      <div className="sidebar-footer">
        {!isAuthenticated ? (
          <p className="guest-banner">Guest mode · history stays on this device</p>
        ) : null}
        <ProfileDropdown
          user={authUser}
          isAuthenticated={isAuthenticated}
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
          <button type="button" onClick={() => setDeleteTarget(null)}>
            Cancel
          </button>
          <button type="button" className="danger" onClick={() => handleDeleteThread(deleteTarget.threadId)}>
            Delete
          </button>
        </div>
      </Modal>

      <Modal isOpen={Boolean(renameTarget)} title="Rename conversation" onClose={() => setRenameTarget(null)}>
        <input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} />
        <div className="modal-actions">
          <button type="button" onClick={() => setRenameTarget(null)}>
            Cancel
          </button>
          <button type="button" onClick={handleRename}>
            Save
          </button>
        </div>
      </Modal>
    </aside>
  );
}

export default Sidebar;
