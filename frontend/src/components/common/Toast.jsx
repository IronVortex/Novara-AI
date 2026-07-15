import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../context/MyContext.jsx";
import { IconCheck, IconInfo, IconX } from "./Icons.jsx";

const ICONS = {
  success: <IconCheck size={16} />,
  error: <IconX size={16} />,
  info: <IconInfo size={16} />,
};

function Toast() {
  const { toast, setToast } = useContext(MyContext);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return undefined;
    // Slight delay to allow CSS transition to trigger
    const show = window.setTimeout(() => setVisible(true), 10);
    const hide = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => setToast(null), 300);
    }, 2900);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [toast, setToast]);

  if (!toast) return null;

  const type = toast.type || "success";

  return (
    <div
      className={`toast toast--${type} ${visible ? "toast--visible" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="toast__icon">{ICONS[type] || ICONS.info}</span>
      <span className="toast__message">{toast.message}</span>
      <button
        className="toast__close"
        onClick={() => {
          setVisible(false);
          window.setTimeout(() => setToast(null), 300);
        }}
        aria-label="Dismiss notification"
      >
        <IconX size={14} />
      </button>
    </div>
  );
}

export default Toast;
