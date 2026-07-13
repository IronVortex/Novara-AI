import "./styles/app.css";
import Sidebar from "./components/sidebar/Sidebar.jsx";
import ChatWindow from "./components/chat/ChatWindow.jsx";
import { MyContextProvider } from "./context/MyContext.jsx";

function App() {
  return (
    <div className="app-shell">
      <MyContextProvider>
        <Sidebar />
        <ChatWindow />
      </MyContextProvider>
    </div>
  );
}

export default App;