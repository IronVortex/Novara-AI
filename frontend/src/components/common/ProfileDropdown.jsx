import { useEffect, useRef, useState } from "react";

function ProfileDropdown({ user, onLogout, onExport, onCopy, onShare }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="profile-dropdown" ref={ref}>
      <button className="profile-trigger" onClick={() => setOpen((value) => !value)}>
        <div className="avatar">{user?.name?.[0] || "N"}</div>
        <div className="profile-copy">
          <strong>{user?.name || "User"}</strong>
          <span>{user?.email}</span>
        </div>
      </button>

      {open ? (
        <div className="profile-menu">
          <button type="button" onClick={onExport}>Export chat</button>
          <button type="button" onClick={onCopy}>Copy conversation</button>
          <button type="button" onClick={onShare}>Share conversation</button>
          <button type="button" className="danger" onClick={onLogout}>Logout</button>
        </div>
      ) : null}
    </div>
  );
}

export default ProfileDropdown;
