import { useContext, useEffect, useRef } from "react";
import { PLACEHOLDER_TEXT } from "../../constants/index.js";
import { MyContext } from "../../context/MyContext.jsx";
import Button from "../common/Button.jsx";

function ChatInput({ onSend, loading }) {
  const { prompt, setPrompt } = useContext(MyContext);
  const textareaRef = useRef(null);

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

  return (
    <div className="composer-card">
      <div className="composer-toolbar">
        <button className="icon-pill" type="button" aria-label="Attach file">
          +
        </button>
        <button className="icon-pill" type="button" aria-label="Voice input">
          ♪
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={PLACEHOLDER_TEXT}
        rows={1}
        aria-label="Message input"
      />

      <Button className="send-btn" onClick={handleSubmit} disabled={loading || !prompt.trim()}>
        {loading ? "…" : "→"}
      </Button>
    </div>
  );
}

export default ChatInput;
