import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../../context/MyContext.jsx";
import { loginUser, loginWithFirebase, migrateGuestThreads } from "../../services/api.js";
import {
  firebaseGoogleLogin,
  isFirebaseConfigured,
  toFirebaseIdentity,
} from "../../services/firebase.js";
import { IconGoogle } from "../../components/common/Icons.jsx";
import { getGuestThreads, clearGuestThreads } from "../../services/guestStorage.js";
import "../../styles/auth.css";

function Login() {
  const navigate = useNavigate();
  const { setAuthUser, setToken, setToast, setAuthReady, setSettings } = useContext(MyContext);
  const [form, setForm] = useState({ email: "", password: "", rememberMe: true });
  const [loading, setLoading] = useState(false);

  const persistSession = (response, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    localStorage.removeItem("novara-token");
    sessionStorage.removeItem("novara-token");
    storage.setItem("novara-token", response.token);
    setToken(response.token);
    setAuthUser(response.user);
    if (response.user?.preferences) {
      setSettings((prev) => ({ ...prev, ...response.user.preferences }));
    }
    setAuthReady(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser({ email: form.email, password: form.password });
      persistSession(response, form.rememberMe);
      
      const guestThreads = getGuestThreads();
      if (guestThreads.length > 0) {
        try {
          await migrateGuestThreads({ threads: guestThreads });
          clearGuestThreads();
        } catch (e) {
          console.error("Failed to migrate guest threads", e);
        }
      }

      setToast({ type: "success", message: "Welcome back to Novara AI" });
      navigate("/app");
    } catch (error) {
      setToast({ type: "error", message: error.message || "Unable to sign you in" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const user = await firebaseGoogleLogin();
      const response = await loginWithFirebase(toFirebaseIdentity(user, "google"));
      persistSession(response, true);
      
      const guestThreads = getGuestThreads();
      if (guestThreads.length > 0) {
        try {
          await migrateGuestThreads({ threads: guestThreads });
          clearGuestThreads();
        } catch (e) {
          console.error("Failed to migrate guest threads", e);
        }
      }

      setToast({ type: "success", message: "Signed in with Google" });
      navigate("/app");
    } catch (error) {
      setToast({ type: "error", message: error.message || "Google sign-in failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* ── Left Hero Panel ─────────────────────── */}
      <div className="auth-hero">
        <div className="auth-hero-glow" />
        <Link to="/" className="auth-hero-brand">
          <div className="brand-mark">N</div>
          <span>Novara AI</span>
        </Link>
        <h2 className="auth-hero-headline">Your intelligent<br />AI workspace</h2>
        <p className="auth-hero-tagline">
          Think, write, and build with an AI that stays out of the way.
          Cloud sync when you need it. Guest mode when you don't.
        </p>
        <div className="auth-hero-features">
          {["Streaming AI responses", "Guest mode — no account needed", "Cloud history sync", "Voice input & read aloud"].map((f) => (
            <div key={f} className="auth-hero-feature">
              <div className="auth-hero-feature-dot" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Form Panel ────────────────────── */}
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark">N</div>
          <div>
            <h1>Welcome back</h1>
            <p>Continue your premium AI workspace</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={form.email}
              required
              autoComplete="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              required
              minLength={6}
              autoComplete="current-password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>

          <div className="auth-row">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {isFirebaseConfigured ? (
          <>
            <div className="auth-divider">or</div>
            <button
              type="button"
              className="auth-google"
              onClick={handleGoogle}
              disabled={loading}
            >
              <IconGoogle size={18} />
              Continue with Google
            </button>
          </>
        ) : null}

        <p className="auth-switch">
          No account? <Link to="/register">Create one free</Link>
        </p>
        <p className="auth-switch">
          Or <Link to="/app">continue as guest</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
