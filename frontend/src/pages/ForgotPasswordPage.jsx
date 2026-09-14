import { useState } from "react";
import { Link } from "react-router-dom";
import { Light_LOGO_SRC, Dark_LOGO_SRC } from "../components/Shell";
import { forgotPassword } from "../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
    } finally {
      setLoading(false);
      setSubmitted(true); // show the same message regardless of outcome
    }
  };

  return (
    <div className="login-page">
      <main className="login-card">
        <img src={Dark_LOGO_SRC} alt="SmartDesk logo" />
        <h1>Forgot Password</h1>
        <p>Enter your email and we'll send you a reset link.</p>

        {submitted ? (
          <p className="form-success">
            If an account exists with that email, a reset link has been sent. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>
              Email Address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                required
              />
            </label>
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p><Link to="/login">Back to login</Link></p>
      </main>
    </div>
  );
}