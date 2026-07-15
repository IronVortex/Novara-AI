import { useState } from "react";
import { Link } from "react-router-dom";
import { firebaseForgotPassword, isFirebaseConfigured } from "../../services/firebase.js";
import "../../styles/auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark">N</div>
          <div>
            <h1>Reset password</h1>
            <p>We’ll email you a secure reset link</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              required
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {message ? <p className="auth-success">{message}</p> : null}
        {error ? <p className="field-error">{error}</p> : null}

        <p className="auth-switch">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
