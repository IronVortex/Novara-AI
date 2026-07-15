import { useContext, useEffect, useRef, useState } from "react";
import { PLACEHOLDER_TEXT } from "../../constants/index.js";
import { MyContext } from "../../context/MyContext.jsx";
import { useSpeech } from "../../hooks/useSpeech.js";
import Button from "../common/Button.jsx";
import PromptLibrary from "./PromptLibrary.jsx";

function ChatInput({ onSend, onStop, loading, onFiles, attachments = [] }) {
  const { prompt, setPrompt, settings } = useContext(MyContext);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showPrompts, setShowPrompts] = useState(false);

  const { listening, supported, startListening, stopListening, interim } = useSpeech({
    onResult: (transcript, isFinal) => {
      if (!settings.speechEnabled || !isFinal) return;
      setPrompt((prev) => {
        const base = prev && !prev.endsWith(" ") ? `${prev} ` : prev;
        return `${base}${transcript}`.trimStart();
      });
      textareaRef.current?.focus();
    },
  });

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 220)}px`;
  }, [prompt]);

  const handleSubmit = () => {
    if (!prompt.trim() || loading) return;
    onSend();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files?.length) onFiles?.(Array.from(event.dataTransfer.files));
  };

  return (
    <div className="composer-wrap">
      {showPrompts ? (
        <PromptLibrary onInsert={(text) => setPrompt((prev) => `${prev}${text}`)} onClose={() => setShowPrompts(false)} />
      ) : null}

      <div
        className="composer-card floating-input"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="composer-toolbar">
          <button className="icon-pill" type="button" aria-label="Attach file" onClick={() => fileInputRef.current?.click()}>
            Attach
          </button>
          <button className="icon-pill" type="button" aria-label="Open prompt library" onClick={() => setShowPrompts(true)}>
            Prompts
          </button>
          <button
            className={`icon-pill ${listening ? "active" : ""}`}
            type="button"
            aria-label={listening ? "Stop recording" : "Start voice input"}
            onClick={listening ? stopListening : startListening}
            disabled={!supported || !settings.speechEnabled}
            title={!supported ? "Speech recognition not supported in this browser" : undefined}
          >
            {listening ? "Stop mic" : "Mic"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            multiple
            accept="image/*,.pdf,.txt,.md,.json,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(event) => onFiles?.(Array.from(event.target.files || []))}
          />
        </div>

        {attachments.length ? (
          <div className="attachment-row">
            {attachments.map((file) => (
              <span key={`${file.name}-${file.mimeType}`} className="attachment-chip">
                {file.name}
              </span>
            ))}
          </div>
        ) : null}

        {listening && interim ? <p className="live-transcript">{interim}</p> : null}

        <div className="composer-main">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER_TEXT}
            rows={1}
            aria-label="Message input"
          />
          {loading ? (
            <Button className="send-btn stop-btn" onClick={onStop} aria-label="Stop generation">
              Stop
            </Button>
          ) : (
            <Button className="send-btn" onClick={handleSubmit} disabled={!prompt.trim()} aria-label="Send message">
              Send
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
