import { lazy, Suspense, useContext, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./styles/theme.css";
import "./styles/app.css";
import GuestRoute from "./components/common/GuestRoute.jsx";
import Toast from "./components/common/Toast.jsx";
import Loader from "./components/common/Loader.jsx";
import { MyContext, MyContextProvider } from "./context/MyContext.jsx";
import { getMe } from "./services/api.js";
import { useTheme } from "./hooks/useTheme.js";

const LandingPage = lazy(() => import("./pages/Landing/index.jsx"));
const AppShell = lazy(() => import("./components/layout/AppShell.jsx"));
const Login = lazy(() => import("./pages/Login/index.jsx"));
const Register = lazy(() => import("./pages/Register/index.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword/index.jsx"));
const SettingsPage = lazy(() => import("./pages/Settings/index.jsx"));

function ThemeBootstrap({ children }) {
  useTheme();
  return children;
}

function AppRoutes() {
  const { setAuthUser, setToken, setAuthReady, setToast, setSettings, token } = useContext(MyContext);

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
        if (response.user?.preferences) {
          setSettings((prev) => ({ ...prev, ...response.user.preferences }));
        }
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
  }, [setAuthReady, setAuthUser, setSettings, setToken, setToast, token]);

  return (
    <>
      <Toast />
      <Suspense
        fallback={
          <div className="auth-loading">
            <Loader loading label="Loading Novara..." />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<AppShell />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <MyContextProvider>
      <BrowserRouter>
        <ThemeBootstrap>
          <AppRoutes />
        </ThemeBootstrap>
      </BrowserRouter>
    </MyContextProvider>
  );
}

export default App;
