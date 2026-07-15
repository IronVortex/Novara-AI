import { memo, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import { formatDate } from "../../utils/formatDate.js";
import { updateMessageMeta } from "../../services/api.js";
import CodeBlock from "./CodeBlock.jsx";
import MermaidBlock from "./MermaidBlock.jsx";
import {
  IconCopy,
  IconCheck,
  IconRefresh,
  IconContinue,
  IconVolumeUp,
  IconThumbUp,
  IconThumbDown,
  IconEdit,
} from "../common/Icons.jsx";

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
  isAuthenticated,
  speechEnabled = true,
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const [feedback, setFeedback] = useState(null);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const handleReaction = async (emoji) => {
    setFeedback(emoji);
    if (!isAuthenticated) return;
    try {
      const response = await updateMessageMeta({ threadId, messageIndex: index, reaction: { emoji } });
      onMetaChange?.(index, response.message);
    } catch {
      // Local feedback still applied.
    }
  };

  const [now] = useState(() => Date.now());
  const messageTime = message.updatedAt || message.createdAt || now;
  const timestamp = useMemo(() => formatDate(messageTime), [messageTime]);

  return (
    <article className={`message-row ${isUser ? "user-row" : "assistant-row"} ${message.isPinned ? "pinned" : ""}`}>
      <div className="message-avatar" aria-hidden="true">
        {isUser ? "You" : "N"}
      </div>
      <div className={`message-bubble ${isUser ? "user-bubble" : "assistant-bubble"}`}>
        <div className="message-meta">
          <span>{isUser ? "You" : "Novara"}</span>
          <span>{timestamp}</span>
        </div>

        {editing ? (
          <div className="edit-prompt">
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={4} />
            <div className="message-actions">
              <button
                type="button"
                onClick={() => {
                  onEdit(index, draft);
                  setEditing(false);
                }}
              >
                Save & resend
              </button>
              <button type="button" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className={`markdown-body ${isStreaming ? "typing" : ""}`}>
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex, rehypeHighlight]}
              components={{
                code({ inline, className, children, ...props }) {
                  const language = /language-(\w+)/.exec(className || "")?.[1];
                  if (inline) {
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                  if (language === "mermaid") {
                    return <MermaidBlock chart={String(children).replace(/\n$/, "")} />;
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
              <button
                type="button"
                onClick={handleCopy}
                title={copied ? "Copied" : "Copy text"}
                aria-label={copied ? "Copied text" : "Copy text"}
              >
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              </button>
              <button
                type="button"
                onClick={() => onRegenerate(index)}
                title="Regenerate response"
                aria-label="Regenerate response"
              >
                <IconRefresh size={16} />
              </button>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={onContinue}
                  title="Continue response"
                  aria-label="Continue response"
                >
                  <IconContinue size={16} />
                </button>
              ) : null}
              {speechEnabled ? (
                <button
                  type="button"
                  onClick={() => onSpeak(message.content)}
                  title="Read aloud"
                  aria-label="Read aloud"
                >
                  <IconVolumeUp size={16} />
                </button>
              ) : null}
              <button
                type="button"
                className={feedback === "👍" ? "active" : ""}
                onClick={() => handleReaction("👍")}
                title="Like response"
                aria-label="Like response"
              >
                <IconThumbUp size={16} />
              </button>
              <button
                type="button"
                className={feedback === "👎" ? "active" : ""}
                onClick={() => handleReaction("👎")}
                title="Dislike response"
                aria-label="Dislike response"
              >
                <IconThumbDown size={16} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              title="Edit prompt"
              aria-label="Edit prompt"
            >
              <IconEdit size={16} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(ChatMessage);
