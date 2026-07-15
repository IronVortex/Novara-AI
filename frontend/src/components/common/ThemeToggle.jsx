import { useTheme } from "../../hooks/useTheme.js";

function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme();
  const order = Object.keys(themes);
  const next = order[(order.indexOf(theme) + 1) % order.length];

  return (
    <button
      className="icon-pill theme-toggle"
      onClick={() => setTheme(next)}
      aria-label={`Switch theme (current ${themes[theme]?.label || theme})`}
      title={`Theme: ${themes[theme]?.label || theme}`}
    >
      {theme === "light" ? "☾" : "☀"}
    </button>
  );
}

export default ThemeToggle;
