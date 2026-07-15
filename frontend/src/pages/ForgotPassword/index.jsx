import { useState } from "react";
import { Link } from "react-router-dom";
import { firebaseForgotPassword, isFirebaseConfigured } from "../../services/firebase.js";
import { IconArrowLeft } from "../../components/common/Icons.jsx";
import "../../styles/auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      if (!isFirebaseConfigured) {
        throw new Error("Password reset requires Firebase. Configure VITE_FIREBASE_* env vars.");
      }
      await firebaseForgotPassword(email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err.message || "Unable to send reset email");
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
        <h2 className="auth-hero-headline">Reset your<br />password</h2>
        <p className="auth-hero-tagline">
          We'll send a secure reset link to your email address.
          You'll be back in your workspace in minutes.
        </p>
      </div>

      {/* ── Right Form Panel ────────────────────── */}
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark">N</div>
          <div>
            <h1>Reset password</h1>
            <p>We'll email you a secure reset link</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email address
            <input
              type="email"
              value={email}
              required
              autoComplete="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        {message ? <p className="auth-success">{message}</p> : null}
        {error ? <p className="field-error">{error}</p> : null}

        <p className="auth-switch">
          <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <IconArrowLeft size={15} />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
