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
import {
  IconSearch,
  IconMenu,
  IconCopy,
  IconExport,
  IconShare,
  IconSparkle,
} from "../common/Icons.jsx";
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
    authUser,
  } = useContext(MyContext);
  const viewportRef = useRef(null);
  const [conversationQuery, setConversationQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

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
    { id: "focus", label: "Focus message input", shortcut: "Ctrl+/", action: () => document.querySelector("textarea")?.focus() },
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

  const greeting = isAuthenticated && authUser?.name
    ? `Hi, ${authUser.name.split(" ")[0]}`
    : APP_NAME;

  return (
    <main className="chat-shell">
      {/* ── Header ─────────────────────────────────── */}
      <header className="chat-header glass-card">
        <div className="chat-header-left">
          <button
            className="icon-pill mobile-only"
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <IconMenu size={18} />
          </button>
          <div className="chat-title">
            <span className="chat-header-eyebrow">
              <IconSparkle size={12} />
              Intelligent workspace
            </span>
            <h1>{greeting}</h1>
          </div>
        </div>

        <div className="chat-header-actions">
          <ModelSelector
            provider={settings.provider}
            model={settings.model}
            onChange={(next) => setSettings(next)}
          />

          {/* Inline search — toggleable */}
          {searchVisible ? (
            <label className="inline-search inline-search--active">
              <IconSearch size={15} />
              <input
                value={conversationQuery}
                onChange={(e) => setConversationQuery(e.target.value)}
                placeholder="Search in conversation…"
                aria-label="Search in conversation"
                autoFocus
                onBlur={() => { if (!conversationQuery) setSearchVisible(false); }}
              />
            </label>
          ) : (
            <button
              className="icon-pill"
              type="button"
              aria-label="Search conversation"
              onClick={() => setSearchVisible(true)}
              title="Search (Ctrl+F)"
            >
              <IconSearch size={16} />
            </button>
          )}

          <ThemeToggle />

          {/* Quick-action pills — desktop */}
          {prevChats.length > 0 ? (
            <div className="chat-header-quick desktop-only">
              <button
                type="button"
                className="icon-pill"
                title="Copy all"
                aria-label="Copy entire conversation"
                onClick={() =>
                  copyConversation(prevChats).then(() =>
                    setToast({ type: "success", message: "Conversation copied" })
                  )
                }
              >
                <IconCopy size={15} />
              </button>
              <button
                type="button"
                className="icon-pill"
                title="Export markdown"
                aria-label="Export as Markdown"
                onClick={() => handleExport("md")}
              >
                <IconExport size={15} />
              </button>
              <button
                type="button"
                className="icon-pill"
                title="Share conversation"
                aria-label="Copy share link"
                onClick={() => {
                  navigator.clipboard.writeText(buildShareUrl(currThreadId));
                  setToast({ type: "success", message: "Share link copied" });
                }}
              >
                <IconShare size={15} />
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* ── Error banner ───────────────────────────── */}
      {error ? (
        <div className="feedback error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={retryLast}>
            Retry
          </button>
        </div>
      ) : null}

      {/* ── Messages pane ──────────────────────────── */}
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
            setPrevChats((prev) =>
              prev.map((item, i) => (i === index ? { ...item, ...updated } : item))
            );
          }}
        />
      </section>

      {/* ── Composer ───────────────────────────────── */}
      <ChatInput
        onSend={sendChat}
        onStop={stopGeneration}
        loading={isGenerating}
        onFiles={addFiles}
        attachments={attachments}
      />

      {/* ── Command palette ────────────────────────── */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={commands}
      />
    </main>
  );
}

export default ChatWindow;
