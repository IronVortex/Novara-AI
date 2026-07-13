import { useTheme } from "../../hooks/useTheme.js";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="icon-pill theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}

export default ThemeToggle;
