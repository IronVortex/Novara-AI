import { lazy, Suspense, useContext, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./styles/theme.css";
import "./styles/app.css";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import GuestRoute from "./components/common/GuestRoute.jsx";
import Toast from "./components/common/Toast.jsx";
import Loader from "./components/common/Loader.jsx";
import { MyContext, MyContextProvider } from "./context/MyContext.jsx";
import { getMe } from "./services/api.js";

const AppShell = lazy(() => import("./components/layout/AppShell.jsx"));
const Login = lazy(() => import("./pages/Login/index.jsx"));
const Register = lazy(() => import("./pages/Register/index.jsx"));

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
      } catch {
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
      <Suspense fallback={<div className="auth-loading"><Loader loading label="Loading Novara..." /></div>}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppShell />} />
          </Route>
          <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
        </Routes>
      </Suspense>
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
