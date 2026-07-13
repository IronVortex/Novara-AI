import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../context/MyContext.jsx";
import { registerUser } from "../services/api.js";
import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();
  const { setAuthUser, setToken, setToast, setAuthReady } = useContext(MyContext);
  const [form, setForm] = useState({ name: "", email: "", password: "", rememberMe: true });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await registerUser(form);
      const storage = form.rememberMe ? localStorage : sessionStorage;
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
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              required
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
