import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { MyContext } from '../../context/MyContext.jsx';
import { searchThreads } from '../../services/api.js';
import { IconSearch2, IconX, IconChevronRight } from './Icons.jsx';

function GlobalSearch({ isOpen, onClose, onSelectThread }) {
  const { isAuthenticated, allThreads } = useContext(MyContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const runSearch = useCallback(
    async (q) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        if (isAuthenticated) {
          const data = await searchThreads(q);
          setResults(data.results || []);
        } else {
          const filtered = (allThreads || []).filter(
            (t) =>
              t.title?.toLowerCase().includes(q.toLowerCase()) ||
              t.lastMessage?.toLowerCase().includes(q.toLowerCase())
          );
          setResults(
            filtered.map((t) => ({
              threadId: t.threadId,
              title: t.title,
              snippet: t.lastMessage,
            }))
          );
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, allThreads]
  );

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), 300);
  };

  const highlight = (text = '', q = '') => {
    if (!q.trim()) return text;
    const parts = text.split(
      new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    );
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? <mark key={i}>{part}</mark> : part
    );
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="global-search-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
    >
      <div
        className="global-search-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="global-search-input-row">
          <IconSearch2 size={18} className="search-icon" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleChange}
            placeholder="Search threads, messages..."
            className="global-search-input"
            aria-label="Search"
          />
          {loading && <span className="search-spinner" aria-label="Searching" />}
          <button
            className="icon-pill"
            onClick={onClose}
            aria-label="Close search"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="global-search-results" role="list">
          {results.length === 0 && query.trim() && !loading && (
            <p className="search-empty">No results for &ldquo;{query}&rdquo;</p>
          )}
          {results.length === 0 && !query.trim() && (
            <p className="search-hint">
              Start typing to search your conversations
            </p>
          )}
          {results.map((r) => (
            <button
              key={r.threadId}
              className="search-result-item"
              role="listitem"
              onClick={() => {
                onSelectThread(r.threadId);
                onClose();
              }}
            >
              <div className="search-result-title">
                {highlight(r.title || 'Untitled', query)}
              </div>
              {r.snippet && (
                <div className="search-result-snippet">
                  {highlight(r.snippet, query)}
                </div>
              )}
              <IconChevronRight size={14} className="search-result-arrow" />
            </button>
          ))}
        </div>

        <div className="search-footer">
          <span>
            <kbd>↑↓</kbd> Navigate
          </span>
          <span>
            <kbd>Enter</kbd> Open
          </span>
          <span>
            <kbd>Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearch;
