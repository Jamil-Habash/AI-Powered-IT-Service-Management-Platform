import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../Icon";
import { LOGO_SRC } from "../Shell";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="login-page">
      <main className="login-card">
        <img src={LOGO_SRC} alt="SmartDesk logo" />
        <h1>SmartDesk</h1>
        <p>IT Service Management Platform</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            navigate("/dashboard");
          }}
        >
          <label>
            Email Address
            <input type="email" placeholder="Enter your work email" required />
          </label>
          <label>
            Password
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                <Icon>{showPassword ? "visibility" : "visibility_off"}</Icon>
              </button>
            </div>
          </label>
          <label className="remember">
            <input type="checkbox" />
            Remember me for 30 days
          </label>
          <button className="primary-button" type="submit">
            Log in
          </button>
        </form>
        <p>
          Don't have an account?{" "}
          <Link to="/register">Create employee account</Link>
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
