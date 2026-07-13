import { useContext, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./styles/app.css";
import Sidebar from "./components/sidebar/Sidebar.jsx";
import ChatWindow from "./components/chat/ChatWindow.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import Toast from "./components/common/Toast.jsx";
import { MyContext, MyContextProvider } from "./context/MyContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { getMe } from "./services/api.js";

function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}

function AppRoutes() {
  const { setAuthUser, setToken, setAuthReady, setToast, token } = useContext(MyContext);

  useEffect(() => {
    const storedToken = localStorage.getItem("novara-token") || sessionStorage.getItem("novara-token") || token;

    if (!storedToken) {
      setAuthReady(true);
      return;
    }

    const validateSession = async () => {
      try {
        const response = await getMe();
        setAuthUser(response.user);
        setToken(storedToken);
      } catch (error) {
        localStorage.removeItem("novara-token");
        sessionStorage.removeItem("novara-token");
        setToken(null);
        setToast({ type: "error", message: "Session expired. Please sign in again." });
      } finally {
        setAuthReady(true);
      }
    };

    validateSession();
  }, [setAuthReady, setAuthUser, setToken, setToast, token]);

  return (
    <>
      <Toast />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppShell />} />
        </Route>
        <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <MyContextProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </MyContextProvider>
  );
}

export default App;