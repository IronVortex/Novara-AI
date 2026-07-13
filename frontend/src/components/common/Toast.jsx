import { useContext, useEffect } from "react";
import { MyContext } from "../../context/MyContext.jsx";

function Toast() {
  const { toast, setToast } = useContext(MyContext);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast, setToast]);

  if (!toast) return null;

  return (
    <div className={`toast ${toast.type || "success"}`} role="status">
      {toast.message}
    </div>
  );
}

export default Toast;
