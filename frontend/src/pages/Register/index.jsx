import { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../../context/MyContext.jsx";
import { registerUser } from "../../services/api.js";
import { getPasswordStrength, validateEmail, validatePassword, getPasswordHints } from "../../utils/validatePassword.js";
import "../../styles/auth.css";

function Register() {
  const navigate = useNavigate();
  const { setAuthUser, setToken, setToast, setAuthReady } = useContext(MyContext);
  const [form, setForm] = useState({ name: "", email: "", password: "", rememberMe: true });
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ password: false });

  const emailError = useMemo(() => validateEmail(form.email), [form.email]);
  const passwordErrors = useMemo(() => validatePassword(form.password), [form.password]);
  const passwordHints = useMemo(() => getPasswordHints(form.password), [form.password]);
  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const canSubmit =
    form.name.trim() &&
    !emailError &&
    passwordErrors.length === 0 &&
    !loading;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({ password: true });

    if (!canSubmit) {
      setToast({ type: "error", message: "Please fix the form errors before continuing" });
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      const storage = form.rememberMe ? localStorage : sessionStorage;
      localStorage.removeItem("novara-token");
      sessionStorage.removeItem("novara-token");
      storage.setItem("novara-token", response.token);
      setToken(response.token);
      setAuthUser(response.user);
      setAuthReady(true);
      setToast({ type: "success", message: "Your Novara account is ready" });
      navigate("/");
    } catch (error) {
      setToast({ type: "error", message: error.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
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
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              required
              autoComplete="email"
              onChange={(event) => setForm({ ...form, email: event.target.value })}
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
              onChange={(event) => setForm({ ...form, password: event.target.value })}
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
                {passwordErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : null}
            {touched.password && passwordHints.length > 0 ? (
              <ul className="field-hint-list">
                {passwordHints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            ) : null}
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={(event) => setForm({ ...form, rememberMe: event.target.checked })}
            />
            Remember me
          </label>

          <button className="auth-btn" type="submit" disabled={!canSubmit}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
