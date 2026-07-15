import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme.js";
import {
  IconChevronDown,
  IconExport,
  IconCopy,
  IconShare,
  IconSettings,
  IconLogOut,
  IconUser,
  IconKey,
  IconSun,
  IconMoon,
  IconMonitor,
} from "./Icons.jsx";

const THEME_ICONS = {
  light: <IconSun size={14} />,
  dark: <IconMoon size={14} />,
  oled: <IconMonitor size={14} />,
  purple: <IconMonitor size={14} />,
  blue: <IconMonitor size={14} />,
};

function ProfileDropdown({ user, isAuthenticated, onLogout, onExport, onCopy, onShare }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { theme, setTheme, themes } = useTheme();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "G";

  return (
    <div className="profile-dropdown" ref={ref}>
      <button
        className="profile-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="avatar" aria-hidden="true">{initials}</div>
        <div className="profile-copy">
          <strong>{user?.name || "Guest"}</strong>
          <span>{isAuthenticated ? user?.email : "Local history"}</span>
        </div>
        <IconChevronDown
          size={14}
          className={`profile-chevron ${open ? "profile-chevron--open" : ""}`}
        />
      </button>

      {open ? (
        <div className="profile-menu" role="menu">
          {/* Auth section */}
          <div className="profile-menu__section">
            {!isAuthenticated ? (
              <>
                <button type="button" role="menuitem" className="profile-menu__item" onClick={() => go("/login")}>
                  <IconUser size={15} />
                  <span>Sign in</span>
                </button>
                <button type="button" role="menuitem" className="profile-menu__item" onClick={() => go("/register")}>
                  <IconKey size={15} />
                  <span>Create account</span>
                </button>
              </>
            ) : (
              <button type="button" role="menuitem" className="profile-menu__item" onClick={() => go("/settings")}>
                <IconUser size={15} />
                <span>My Profile</span>
              </button>
            )}
            <button type="button" role="menuitem" className="profile-menu__item" onClick={() => go("/settings")}>
              <IconSettings size={15} />
              <span>Settings</span>
            </button>
          </div>

          {/* Theme section */}
          <div className="profile-menu__section">
            <p className="profile-menu__label">Theme</p>
            <div className="theme-mini">
              {Object.values(themes).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`theme-chip ${theme === item.id ? "active" : ""}`}
                  onClick={() => setTheme(item.id)}
                  aria-label={`Use ${item.label} theme`}
                >
                  {THEME_ICONS[item.id]}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions section */}
          {isAuthenticated ? (
            <div className="profile-menu__section">
              <button type="button" role="menuitem" className="profile-menu__item" onClick={onExport}>
                <IconExport size={15} />
                <span>Export chat</span>
              </button>
              <button type="button" role="menuitem" className="profile-menu__item" onClick={onCopy}>
                <IconCopy size={15} />
                <span>Copy conversation</span>
              </button>
              <button type="button" role="menuitem" className="profile-menu__item" onClick={onShare}>
                <IconShare size={15} />
                <span>Share conversation</span>
              </button>
            </div>
          ) : null}

          {/* Logout */}
          {isAuthenticated ? (
            <div className="profile-menu__section">
              <button
                type="button"
                role="menuitem"
                className="profile-menu__item profile-menu__item--danger"
                onClick={onLogout}
              >
                <IconLogOut size={15} />
                <span>Sign out</span>
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default ProfileDropdown;
