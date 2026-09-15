import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Light_LOGO_SRC, Dark_LOGO_SRC, Light_PNG_SRC, Dark_PNG_SRC } from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import usePageTitle from "../hooks/usePageTitle";

export default function LoginPage() {
  usePageTitle("Login");
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    () => localStorage.getItem("smartdesk_remember_me") === "true",
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );

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
        {theme == "light" &&<img src={Light_PNG_SRC} alt="SmartDesk logo" />}
        {theme == "dark" && <img src={Dark_PNG_SRC} alt="SmartDesk logo" />}
        {error && <p className="form-error">{error}</p>}
        {successMessage && (
          <p className="form-success">
            {successMessage}
          </p>
        )}
       

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
          <div style={{ textAlign: "right", marginTop: "-8px", marginBottom: "8px" }}>
            <Link to="/forgot-password" style={{ fontSize: "13px" }}>Forgot password?</Link>
          </div>
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
        <footer >
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#help">Help Center</a>
        </footer>
      </main>
    </div>
  );
}