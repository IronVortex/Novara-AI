import { useContext, useEffect, useRef } from "react";
import { PLACEHOLDER_TEXT } from "../../constants/index.js";
import { MyContext } from "../../context/MyContext.jsx";
import { useSpeech } from "../../hooks/useSpeech.js";
import Button from "../common/Button.jsx";

function ChatInput({
  onSend,
  onStop,
  loading,
  onFiles,
  attachments = [],
}) {
  const { prompt, setPrompt } = useContext(MyContext);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const { listening, supported, startListening, stopListening } = useSpeech({
    onResult: (transcript, isFinal) => {
      setPrompt(transcript);
      if (isFinal) textareaRef.current?.focus();
    },
  });

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
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
    <div
      className="composer-card floating-input"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="composer-toolbar">
        <button className="icon-pill" type="button" aria-label="Attach file" onClick={() => fileInputRef.current?.click()}>
          +
        </button>
        <button
          className={`icon-pill ${listening ? "active" : ""}`}
          type="button"
          aria-label="Voice input"
          onClick={listening ? stopListening : startListening}
          disabled={!supported}
        >
          {listening ? "●" : "♪"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          accept="image/*,.pdf,.txt,.md,.json"
          onChange={(event) => onFiles?.(Array.from(event.target.files || []))}
        />
      </div>

      {attachments.length ? (
        <div className="attachment-row">
          {attachments.map((file) => (
            <span key={file.name} className="attachment-chip">{file.name}</span>
          ))}
        </div>
      ) : null}

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
        <Button className="send-btn stop-btn" onClick={onStop}>■</Button>
      ) : (
        <Button className="send-btn" onClick={handleSubmit} disabled={!prompt.trim()}>
          →
        </Button>
      )}
    </div>
  );
}

export default ChatInput;
