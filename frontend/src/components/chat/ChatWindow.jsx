import { useContext, useEffect, useRef, useState } from "react";
import { APP_NAME } from "../../constants/index.js";
import { MyContext } from "../../context/MyContext.jsx";
import { getThreads, sendMessage } from "../../services/api.js";
import { scrollToBottom } from "../../utils/formatDate.js";
import { normalizeThreads } from "../../utils/helpers.js";
import Chat from "./Chat.jsx";
import ChatInput from "./ChatInput.jsx";
import "../../styles/chat.css";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    setReply,
    currThreadId,
    setPrevChats,
    setNewChat,
    setAllThreads,
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const viewportRef = useRef(null);

  useEffect(() => {
    scrollToBottom(viewportRef.current);
  }, [loading]);

  const refreshThreads = async () => {
    try {
      const threads = await getThreads();
      setAllThreads(normalizeThreads(threads));
    } catch (refreshError) {
      console.warn("Failed to refresh thread list", refreshError);
    }
  };

  const handleSend = async () => {
    const message = prompt.trim();
    if (!message) return;

    setLoading(true);
    setError("");
    setNewChat(false);
    setPrevChats((prev) => [...prev, { role: "user", content: message }]);
    setPrompt("");

    try {
      const response = await sendMessage({ message, threadId: currThreadId });
      setReply(response.reply);
      setPrevChats((prev) => [...prev, { role: "assistant", content: response.reply }]);
      await refreshThreads();
    } catch (sendError) {
      setError(sendError.message || "Unable to send the message right now.");
      setPrevChats((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="chat-shell">
      <header className="chat-header">
        <div>
          <p className="eyebrow">Premium AI Workspace</p>
          <h1>{APP_NAME}</h1>
        </div>
        <div className="status-pill">● Live</div>
      </header>

      {error ? <div className="feedback error">{error}</div> : null}

      <section className="messages-pane" ref={viewportRef}>
        <Chat loading={loading} />
      </section>

      <ChatInput onSend={handleSend} loading={loading} />
    </main>
  );
}

export default ChatWindow;
