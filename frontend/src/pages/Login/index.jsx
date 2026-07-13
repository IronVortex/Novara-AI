import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../../context/MyContext.jsx";
import { loginUser } from "../../services/api.js";
import "../../styles/auth.css";

function Login() {
  const navigate = useNavigate();
  const { setAuthUser, setToken, setToast, setAuthReady } = useContext(MyContext);
  const [form, setForm] = useState({ email: "", password: "", rememberMe: true });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await loginUser({
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
      setToast({ type: "success", message: "Welcome back to Novara AI" });
      navigate("/");
    } catch (error) {
      setToast({ type: "error", message: error.message || "Unable to sign you in" });
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
              onChange={(event) => setForm({ ...form, email: event.target.value })}
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
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={(event) => setForm({ ...form, rememberMe: event.target.checked })}
            />
            Remember me
          </label>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
