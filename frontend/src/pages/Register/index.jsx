import { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../../context/MyContext.jsx";
import { loginWithFirebase, registerUser } from "../../services/api.js";
import {
  firebaseGoogleLogin,
  isFirebaseConfigured,
  toFirebaseIdentity,
} from "../../services/firebase.js";
import { getPasswordStrength, validateEmail, validatePassword, getPasswordHints } from "../../utils/validatePassword.js";
import { IconGoogle } from "../../components/common/Icons.jsx";
import "../../styles/auth.css";

function Register() {
  const navigate = useNavigate();
  const { setAuthUser, setToken, setToast, setAuthReady, setSettings } = useContext(MyContext);
  const [form, setForm] = useState({ name: "", email: "", password: "", rememberMe: true });
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ password: false });

  const emailError = useMemo(() => validateEmail(form.email), [form.email]);
  const passwordErrors = useMemo(() => validatePassword(form.password), [form.password]);
  const passwordHints = useMemo(() => getPasswordHints(form.password), [form.password]);
  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const canSubmit = form.name.trim() && !emailError && passwordErrors.length === 0 && !loading;

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
    setTouched({ password: true });
    if (!canSubmit) {
      setToast({ type: "error", message: "Please fix the form errors before continuing" });
      return;
    }
    setLoading(true);
    try {
      const response = await registerUser({ name: form.name, email: form.email, password: form.password });
      persistSession(response, form.rememberMe);
      setToast({ type: "success", message: "Your Novara account is ready" });
      navigate("/app");
    } catch (error) {
      setToast({ type: "error", message: error.message || "Registration failed" });
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
      setToast({ type: "success", message: "Account created with Google" });
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
        <h2 className="auth-hero-headline">Start building<br />your AI workspace</h2>
        <p className="auth-hero-tagline">
          Join thousands using Novara AI to think faster, write better,
          and get more done — with or without a cloud account.
        </p>
        <div className="auth-hero-features">
          {["Free to start, no credit card needed", "5 beautiful themes", "Guest mode available immediately", "Speech-to-text & read aloud"].map((f) => (
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
            <h1>Create your account</h1>
            <p>Start building your own AI workspace</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full name
            <input
              type="text"
              value={form.name}
              required
              autoComplete="name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              required
              autoComplete="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {form.email && emailError ? <span className="field-error">{emailError}</span> : null}
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              required
              minLength={6}
              autoComplete="new-password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onBlur={() => setTouched({ password: true })}
            />
            {form.password ? (
              <div className="password-meta">
                <div className="password-strength" aria-hidden="true">
                  {[1, 2, 3, 4].map((level) => (
                    <span
                      key={level}
                      className={level <= passwordStrength.level ? `active level-${passwordStrength.level}` : ""}
                    />
                  ))}
                </div>
                <span className="password-label">{passwordStrength.label}</span>
              </div>
            ) : null}
            {touched.password && passwordErrors.length > 0 ? (
              <ul className="field-error-list">
                {passwordErrors.map((err) => <li key={err}>{err}</li>)}
              </ul>
            ) : null}
            {touched.password && passwordHints.length > 0 ? (
              <ul className="field-hint-list">
                {passwordHints.map((hint) => <li key={hint}>{hint}</li>)}
              </ul>
            ) : null}
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
            />
            Remember me
          </label>

          <button className="auth-btn" type="submit" disabled={!canSubmit}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        {isFirebaseConfigured ? (
          <>
            <div className="auth-divider">or</div>
            <button type="button" className="auth-google" onClick={handleGoogle} disabled={loading}>
              <IconGoogle size={18} />
              Continue with Google
            </button>
          </>
        ) : null}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        <p className="auth-switch">
          Or <Link to="/app">continue as guest</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
