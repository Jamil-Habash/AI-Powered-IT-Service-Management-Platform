import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Light_LOGO_SRC,
  Dark_LOGO_SRC,
  Light_PNG_SRC,
  Dark_PNG_SRC,
} from "../components/Shell";
import { forgotPassword } from "../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="login-page">
      <main className="login-card">
        {theme == "light" && <img src={Light_PNG_SRC} alt="SmartDesk logo" />}
        {theme == "dark" && <img src={Dark_PNG_SRC} alt="SmartDesk logo" />}
        <h1>Forgot Password</h1>
        <p>Enter your email and we'll send you a reset link.</p>

        {submitted ? (
          <p className="form-success">
            If an account exists with that email, a reset link has been sent.
            Check your inbox.
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

        <p>
          <Link to="/login">Back to login</Link>
        </p>
      </main>
    </div>
  );
}
