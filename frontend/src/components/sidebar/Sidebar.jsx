import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { MyContext } from "../../context/MyContext.jsx";
import { deleteThread, getThread, getThreads } from "../../services/api.js";
import { normalizeThreads } from "../../utils/helpers.js";
import SidebarHeader from "./SidebarHeader.jsx";
import ThreadItem from "./ThreadItem.jsx";
import "../../styles/sidebar.css";

function Sidebar() {
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
  } = useContext(MyContext);
  const navigate = useNavigate();

  const [query, setQuery] = useState("");

  const loadThreads = useCallback(async () => {
    try {
      const threads = await getThreads();
      setAllThreads(normalizeThreads(threads));
    } catch (error) {
      console.error(error);
    }
  }, [setAllThreads]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const filteredThreads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return allThreads;

    return allThreads.filter((thread) =>
      thread.title?.toLowerCase().includes(normalizedQuery)
    );
  }, [allThreads, query]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv4());
    setPrevChats([]);
  };

  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);
    setNewChat(false);

    try {
      const messages = await getThread(newThreadId);
      setPrevChats(messages || []);
      setReply(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteThread = async (threadId) => {
    try {
      await deleteThread(threadId);
      setAllThreads((prev) => prev.filter((thread) => thread.threadId !== threadId));

      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
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
            onDelete={handleDeleteThread}
          />
        ))}
      </ul>

      <div className="sidebar-footer">
        <div className="profile-card">
          <div className="avatar">{authUser?.name?.[0] || "A"}</div>
          <div>
            <strong>{authUser?.name || "Alex"}</strong>
            <p>Premium plan</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
