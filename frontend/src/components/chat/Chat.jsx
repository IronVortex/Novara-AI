import { useContext, useMemo } from "react";
import { MyContext } from "../../context/MyContext.jsx";
import ChatMessage from "./ChatMessage.jsx";
import Skeleton from "../common/Skeleton.jsx";
import { APP_NAME } from "../../constants/index.js";

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
  const { newChat, prevChats } = useContext(MyContext);

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
          <h3>Start your next conversation with {APP_NAME}</h3>
          <p>Ask for ideas, summaries, code help, or upload a document to chat with it.</p>
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
          />
          );
        })}
      </div>
    </div>
  );
}

export default Chat;
