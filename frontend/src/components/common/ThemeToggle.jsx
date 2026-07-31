import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../hooks/useTheme.js";
import { IconSun, IconMoon, IconMonitor } from "./Icons.jsx";
import "../../styles/theme.css";

const THEME_ICONS = {
  light: <IconSun size={16} />,
  dark: <IconMoon size={16} />,
  oled: <IconMonitor size={16} />,
  purple: <IconMonitor size={16} />,
  blue: <IconMonitor size={16} />,
};

function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="theme-dropdown-container" ref={menuRef}>
      <button
        className="icon-pill theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Appearance"
        title="Appearance"
      >
        {THEME_ICONS[theme] || <IconMoon size={16} />}
      </button>

      {isOpen && (
        <div className="theme-dropdown-menu">
          <div className="theme-dropdown-header">Appearance</div>
          {Object.entries(themes).map(([key, config]) => (
            <button
              key={key}
              className={`theme-dropdown-item ${theme === key ? "active" : ""}`}
              onClick={() => {
                setTheme(key);
                setIsOpen(false);
              }}
            >
              <span className="theme-indicator">
                {theme === key ? "●" : "○"}
              </span>
              {config.label || key}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;
