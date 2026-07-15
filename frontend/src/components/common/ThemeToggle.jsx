import { useTheme } from "../../hooks/useTheme.js";
import { IconSun, IconMoon, IconMonitor } from "./Icons.jsx";

const THEME_ICONS = {
  light: <IconSun size={16} />,
  dark: <IconMoon size={16} />,
  oled: <IconMonitor size={16} />,
  purple: <IconMonitor size={16} />,
  blue: <IconMonitor size={16} />,
};

function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme();
  const order = Object.keys(themes);
  const next = order[(order.indexOf(theme) + 1) % order.length];
  const nextLabel = themes[next]?.label || next;

  return (
    <button
      className="icon-pill theme-toggle"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${nextLabel} theme (current: ${themes[theme]?.label || theme})`}
      title={`Theme: ${themes[theme]?.label || theme} → ${nextLabel}`}
    >
      {THEME_ICONS[theme] || <IconMoon size={16} />}
    </button>
  );
}

export default ThemeToggle;
