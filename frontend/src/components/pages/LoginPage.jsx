import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LOGO_SRC } from "../Shell";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    () => localStorage.getItem("smartdesk_remember_me") === "true",
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const email = event.currentTarget.elements.email.value;
    const password = event.currentTarget.elements.password.value;

    setLoading(true);
    try {
      await login(email, password, rememberMe);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-card">
        <img src={LOGO_SRC} alt="SmartDesk logo" />
        <h1>SmartDesk</h1>
        <p>IT Service Management Platform</p>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>
            Email Address
            <input
              type="email"
              name="email"
              placeholder="Enter your work email"
              required
            />
          </label>
          <label>
            Password
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                required
              />
            </div>
          </label>
          <label className="remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            Remember me for 30 days
          </label>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p>
          Not registered yet?{" "}
          <Link to="/register">Register with your work email</Link>
        </p>
        <footer>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#help">Help Center</a>
        </footer>
      </main>
    </div>
  );
}