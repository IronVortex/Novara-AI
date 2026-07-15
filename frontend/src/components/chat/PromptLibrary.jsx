import { useMemo, useState } from "react";
import { PROMPT_CATEGORIES, PROMPT_LIBRARY } from "../../constants/prompts.js";

function PromptLibrary({ onInsert, onClose }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    return PROMPT_LIBRARY.filter((item) => {
      const categoryOk = category === "All" || item.category === category;
      const queryOk =
        !query.trim() ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.prompt.toLowerCase().includes(query.toLowerCase());
      return categoryOk && queryOk;
    });
  }, [category, query]);

  return (
    <div className="prompt-library">
      <div className="prompt-library-header">
        <div>
          <h3>Prompt Library</h3>
          <p>One-click templates for common workflows</p>
        </div>
        <button type="button" className="icon-pill" onClick={onClose} aria-label="Close prompt library">
          ×
        </button>
      </div>

      <input
        className="prompt-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search prompts"
        aria-label="Search prompts"
      />

      <div className="prompt-cats" role="tablist" aria-label="Prompt categories">
        <button type="button" className={category === "All" ? "active" : ""} onClick={() => setCategory("All")}>
          All
        </button>
        {PROMPT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={category === cat ? "active" : ""}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <ul className="prompt-list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => {
                onInsert(item.prompt);
                onClose();
              }}
            >
              <strong>{item.title}</strong>
              <span>{item.category}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PromptLibrary;
