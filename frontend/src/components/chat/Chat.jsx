import { useContext, useMemo } from "react";
import { MyContext } from "../../context/MyContext.jsx";
import ChatMessage from "./ChatMessage.jsx";
import Skeleton from "../common/Skeleton.jsx";
import { APP_NAME, APP_TAGLINE } from "../../constants/index.js";

function Chat({
  loading,
  isGenerating,
  onRegenerate,
  onEdit,
  onContinue,
  onSpeak,
  threadId,
  onMetaChange,
  conversationQuery,
}) {
  const { newChat, prevChats, isAuthenticated, settings } = useContext(MyContext);

  const visibleMessages = useMemo(() => {
    const query = conversationQuery.trim().toLowerCase();
    if (!query) return prevChats || [];
    return (prevChats || []).filter((message) => message.content?.toLowerCase().includes(query));
  }, [conversationQuery, prevChats]);

  const suggestions = [
    { title: "Explore an idea", desc: "Think through a complex problem", text: "Help me think through a complex problem and break down the core components." },
    { title: "Write something", desc: "Draft an email or refine writing", text: "Draft a professional product release email for a new AI feature." },
    { title: "Solve a problem", desc: "Generate or debug code", text: "Help me write a robust JavaScript function." },
    { title: "Analyze a document", desc: "Extract key insights from text", text: "Summarize the key points of the following document." }
  ];

  const handleSuggestionClick = (text) => {
    const textarea = document.querySelector(".composer-card textarea");
    if (textarea) {
      // Find react internal value setter to trigger state change correctly
      const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      nativeTextareaValueSetter.call(textarea, text);
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.focus();
    }
  };

  return (
    <div className="chat-surface">
      {newChat && !prevChats.length ? (
        <div className="empty-state">
          <div className="empty-badge">✦</div>
          <h3>What would you like to work on?</h3>
          <div className="suggestions-grid">
            {suggestions.map((s, i) => (
              <button key={i} className="suggestion-card" type="button" onClick={() => handleSuggestionClick(s.text)}>
                <div className="suggestion-title">{s.title}</div>
                <div className="suggestion-desc">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="messages-list">
        {loading && !prevChats.length ? <Skeleton lines={4} /> : null}
        {visibleMessages.map((chat) => {
          const index = prevChats.findIndex((message) => message === chat);
          return (
            <ChatMessage
              key={`${chat.role}-${index}-${chat.content?.slice(0, 12)}`}
              message={chat}
              index={index}
              isStreaming={isGenerating && index === prevChats.length - 1 && chat.role === "assistant"}
              onRegenerate={onRegenerate}
              onEdit={onEdit}
              onContinue={onContinue}
              onSpeak={onSpeak}
              threadId={threadId}
              onMetaChange={onMetaChange}
              isAuthenticated={isAuthenticated}
              speechEnabled={settings.speechEnabled}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Chat;
