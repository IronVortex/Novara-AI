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

  return (
    <div className="chat-surface">
      {newChat && !prevChats.length ? (
        <div className="empty-state">
          <div className="empty-badge">✦</div>
          <h3>{APP_TAGLINE}</h3>
          <p>
            Start chatting instantly{isAuthenticated ? "" : " as a guest"}. Ask for ideas, code help, or upload a
            document — {APP_NAME} stays out of the way.
          </p>
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
