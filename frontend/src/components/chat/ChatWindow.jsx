import { useContext, useEffect, useRef, useState } from "react";
import { APP_NAME } from "../../constants/index.js";
import { MyContext } from "../../context/MyContext.jsx";
import { useChat } from "../../hooks/useChat.js";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts.js";
import { useSpeech } from "../../hooks/useSpeech.js";
import { exportThread } from "../../services/api.js";
import { copyConversation, exportMarkdownFile, exportPdfFile } from "../../utils/exportChat.js";
import { buildShareUrl } from "../../utils/helpers.js";
import CommandPalette from "../common/CommandPalette.jsx";
import ThemeToggle from "../common/ThemeToggle.jsx";
import Chat from "./Chat.jsx";
import ChatInput from "./ChatInput.jsx";
import "../../styles/chat.css";

function ChatWindow({ onToggleSidebar }) {
  const { prevChats, currThreadId, setToast } = useContext(MyContext);
  const viewportRef = useRef(null);
  const [conversationQuery, setConversationQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);

  const {
    isGenerating,
    error,
    attachments,
    sendChat,
    stopGeneration,
    retryLast,
    regenerate,
    continueResponse,
    editUserPrompt,
    addFiles,
  } = useChat();

  const { speak } = useSpeech({});

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: "smooth" });
  }, [prevChats, isGenerating]);

  const handleExport = async (format) => {
    try {
      const response = await exportThread(currThreadId);
      if (format === "md") exportMarkdownFile(response.markdown, response.title);
      if (format === "pdf") await exportPdfFile(prevChats, response.title);
      setToast({ type: "success", message: "Conversation exported" });
    } catch (exportError) {
      setToast({ type: "error", message: exportError.message });
    }
  };

  const commands = [
    { id: "new", label: "Focus message input", shortcut: "Ctrl+/", action: () => document.querySelector("textarea")?.focus() },
    { id: "retry", label: "Retry last message", shortcut: "Ctrl+R", action: retryLast },
    { id: "export-md", label: "Export markdown", shortcut: "Ctrl+E", action: () => handleExport("md") },
    { id: "sidebar", label: "Toggle sidebar", shortcut: "Ctrl+B", action: onToggleSidebar },
  ];

  useKeyboardShortcuts({
    "ctrl+k": () => setPaletteOpen(true),
    "ctrl+/": () => document.querySelector("textarea")?.focus(),
    "ctrl+r": () => retryLast(),
    "ctrl+e": () => handleExport("md"),
    "ctrl+b": () => onToggleSidebar?.(),
  });

  return (
    <main className="chat-shell">
      <header className="chat-header glass-card">
        <div>
          <p className="eyebrow">Premium AI Workspace</p>
          <h1>{APP_NAME}</h1>
        </div>
        <div className="chat-header-actions">
          <label className="inline-search">
            <span>⌕</span>
            <input
              value={conversationQuery}
              onChange={(event) => setConversationQuery(event.target.value)}
              placeholder="Search in conversation"
            />
          </label>
          <ThemeToggle />
          <button className="icon-pill mobile-only" type="button" onClick={onToggleSidebar}>☰</button>
          <div className="status-pill">● Live</div>
        </div>
      </header>

      {error ? (
        <div className="feedback error">
          <span>{error}</span>
          <button type="button" onClick={retryLast}>Retry</button>
        </div>
      ) : null}

      <section className="messages-pane glass-card" ref={viewportRef}>
        <Chat
          loading={isGenerating}
          isGenerating={isGenerating}
          onRegenerate={regenerate}
          onEdit={editUserPrompt}
          onContinue={continueResponse}
          onSpeak={speak}
          threadId={currThreadId}
          conversationQuery={conversationQuery}
          onMetaChange={(index, message) => {
            // meta updates handled via API; optional local refresh
            console.debug("message meta updated", index, message);
          }}
        />
      </section>

      <ChatInput
        onSend={sendChat}
        onStop={stopGeneration}
        loading={isGenerating}
        onFiles={addFiles}
        attachments={attachments}
      />

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />

      <div className="chat-quick-actions">
        <button type="button" onClick={() => copyConversation(prevChats).then(() => setToast({ type: "success", message: "Conversation copied" }))}>
          Copy all
        </button>
        <button type="button" onClick={() => handleExport("md")}>Export MD</button>
        <button type="button" onClick={() => handleExport("pdf")}>Export PDF</button>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(buildShareUrl(currThreadId));
            setToast({ type: "success", message: "Share link copied" });
          }}
        >
          Share
        </button>
      </div>
    </main>
  );
}

export default ChatWindow;
