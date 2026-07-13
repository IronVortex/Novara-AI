import { useState } from "react";
import Sidebar from "../sidebar/Sidebar.jsx";
import ChatWindow from "../chat/ChatWindow.jsx";

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ChatWindow onToggleSidebar={() => setSidebarOpen((value) => !value)} />
      {sidebarOpen ? <button className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" /> : null}
    </div>
  );
}

export default AppShell;
