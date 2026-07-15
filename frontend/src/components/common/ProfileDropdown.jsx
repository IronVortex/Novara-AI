import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme.js";

function ProfileDropdown({
  user,
  isAuthenticated,
  onLogout,
  onExport,
  onCopy,
  onShare,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme, setTheme, themes } = useTheme();

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="profile-dropdown" ref={ref}>
      <button
        className="profile-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="avatar">{user?.name?.[0] || "G"}</div>
        <div className="profile-copy">
          <strong>{user?.name || "Guest"}</strong>
          <span>{isAuthenticated ? user?.email : "Local history"}</span>
        </div>
      </button>

      {open ? (
        <div className="profile-menu" role="menu">
          {!isAuthenticated ? (
            <>
              <button type="button" role="menuitem" onClick={() => go("/login")}>
                Login
              </button>
              <button type="button" role="menuitem" onClick={() => go("/register")}>
                Register
              </button>
            </>
          ) : (
            <button type="button" role="menuitem" onClick={() => go("/settings")}>
              Profile
            </button>
          )}
          <button type="button" role="menuitem" onClick={() => go("/settings")}>
            Settings
          </button>
          <button type="button" role="menuitem" onClick={toggleTheme}>
            Theme: {themes[theme]?.label || theme}
          </button>
          <div className="theme-mini">
            {Object.values(themes).map((item) => (
              <button
                key={item.id}
                type="button"
                className={theme === item.id ? "active" : ""}
                onClick={() => setTheme(item.id)}
                aria-label={`Use ${item.label} theme`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {isAuthenticated ? (
            <>
              <button type="button" role="menuitem" onClick={onExport}>
                Export chat
              </button>
              <button type="button" role="menuitem" onClick={onCopy}>
                Copy conversation
              </button>
              <button type="button" role="menuitem" onClick={onShare}>
                Share conversation
              </button>
              <button type="button" role="menuitem" className="danger" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default ProfileDropdown;
