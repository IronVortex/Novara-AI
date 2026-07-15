import { useContext, useEffect, useRef, useState } from "react";
import { APP_NAME } from "../../constants/index.js";
import { MyContext } from "../../context/MyContext.jsx";
import { useChat } from "../../hooks/useChat.js";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts.js";
import { useSpeech } from "../../hooks/useSpeech.js";
import { exportThread } from "../../services/api.js";
import { exportGuestMarkdown } from "../../services/guestStorage.js";
import { copyConversation, exportMarkdownFile, exportPdfFile } from "../../utils/exportChat.js";
import { buildShareUrl } from "../../utils/helpers.js";
import CommandPalette from "../common/CommandPalette.jsx";
import ThemeToggle from "../common/ThemeToggle.jsx";
import Chat from "./Chat.jsx";
import ChatInput from "./ChatInput.jsx";
import ModelSelector from "./ModelSelector.jsx";
import "../../styles/chat.css";

function ChatWindow({ onToggleSidebar }) {
  const {
    prevChats,
    currThreadId,
    setToast,
    setPrevChats,
    isAuthenticated,
    settings,
    setSettings,
  } = useContext(MyContext);
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
      let title = "Novara Chat";
      let markdown = "";

      if (isAuthenticated) {
        const response = await exportThread(currThreadId);
        title = response.title;
        markdown = response.markdown;
      } else {
        const response = exportGuestMarkdown(currThreadId);
        if (!response) throw new Error("Nothing to export yet");
        title = response.title;
        markdown = response.markdown;
      }

      if (format === "md") exportMarkdownFile(markdown, title);
      if (format === "pdf") await exportPdfFile(prevChats, title);
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
          <p className="eyebrow">Intelligent workspace</p>
          <h1>{APP_NAME}</h1>
        </div>
        <div className="chat-header-actions">
          <ModelSelector
            provider={settings.provider}
            model={settings.model}
            onChange={(next) => setSettings(next)}
          />
          <label className="inline-search">
            <span aria-hidden="true">⌕</span>
            <input
              value={conversationQuery}
              onChange={(event) => setConversationQuery(event.target.value)}
              placeholder="Search in conversation"
              aria-label="Search in conversation"
            />
          </label>
          <ThemeToggle />
          <button className="icon-pill mobile-only" type="button" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            ☰
          </button>
        </div>
      </header>

      {error ? (
        <div className="feedback error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={retryLast}>
            Retry
          </button>
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
          onMetaChange={(index, updated) => {
            setPrevChats((prev) => prev.map((item, i) => (i === index ? { ...item, ...updated } : item)));
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
        <button
          type="button"
          onClick={() =>
            copyConversation(prevChats).then(() => setToast({ type: "success", message: "Conversation copied" }))
          }
        >
          Copy all
        </button>
        <button type="button" onClick={() => handleExport("md")}>
          Export MD
        </button>
        <button type="button" onClick={() => handleExport("pdf")}>
          Export PDF
        </button>
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
