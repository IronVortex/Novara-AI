import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { formatDate } from "../../utils/formatDate.js";
import { updateMessageMeta } from "../../services/api.js";
import CodeBlock from "./CodeBlock.jsx";

const REACTIONS = ["👍", "❤️", "✨", "🔥"];

function ChatMessage({
  message,
  index,
  isStreaming,
  onRegenerate,
  onEdit,
  onContinue,
  onSpeak,
  threadId,
  onMetaChange,
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const handleReaction = async (emoji) => {
    try {
      const response = await updateMessageMeta({ threadId, messageIndex: index, reaction: { emoji } });
      onMetaChange?.(index, response.message);
    } catch (error) {
      console.warn(error);
    }
  };

  const timestamp = useMemo(() => formatDate(message.updatedAt || message.createdAt), [message]);

  return (
    <article className={`message-row ${isUser ? "user-row" : "assistant-row"} ${message.isPinned ? "pinned" : ""}`}>
      <div className={`message-bubble ${isUser ? "user-bubble" : "assistant-bubble"}`}>
        <div className="message-meta">
          <span>{isUser ? "You" : "Novara"}</span>
          <span>{timestamp}</span>
        </div>

        {editing ? (
          <div className="edit-prompt">
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={4} />
            <div className="message-actions">
              <button type="button" onClick={() => { onEdit(index, draft); setEditing(false); }}>Save & resend</button>
              <button type="button" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className={`markdown-body ${isStreaming ? "typing" : ""}`}>
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight]}
              components={{
                code({ inline, className, children, ...props }) {
                  if (inline) {
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                  return <CodeBlock className={className}>{children}</CodeBlock>;
                },
              }}
            >
              {message.content || " "}
            </ReactMarkdown>
            {isStreaming ? <span className="typing-cursor" aria-hidden="true" /> : null}
          </div>
        )}

        <div className="message-actions">
          {!isUser ? (
            <>
              <button type="button" onClick={handleCopy}>{copied ? "Copied" : "Copy"}</button>
              <button type="button" onClick={() => onRegenerate(index)}>Regenerate</button>
              <button type="button" onClick={onContinue}>Continue</button>
              <button type="button" onClick={() => onSpeak(message.content)}>Listen</button>
            </>
          ) : (
            <button type="button" onClick={() => setEditing(true)}>Edit</button>
          )}
        </div>

        {!isUser ? (
          <div className="reaction-bar">
            {REACTIONS.map((emoji) => (
              <button key={emoji} type="button" onClick={() => handleReaction(emoji)}>{emoji}</button>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default ChatMessage;
