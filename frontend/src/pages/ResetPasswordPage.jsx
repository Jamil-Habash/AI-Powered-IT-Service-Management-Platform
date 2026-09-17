import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Light_LOGO_SRC,
  Dark_LOGO_SRC,
  Light_PNG_SRC,
  Dark_PNG_SRC,
} from "../components/Shell";
import { resetPassword, validateResetToken } from "../services/authService";

function FieldIcon({ path }) {
  return (
    <span className="field-icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d={path} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState({
    password: false,
    confirmPassword: false,
  });
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const lockPath =
    "M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z";

  const [checkingToken, setCheckingToken] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const resetToken = new URLSearchParams(window.location.search).get("token");

    if (!resetToken) {
      navigate("/forgot-password", { replace: true });
      return;
    }

    const checkToken = async () => {
      try {
        await validateResetToken(resetToken);
        setToken(resetToken);
      } catch (err) {
        navigate("/forgot-password", { replace: true });
      } finally {
        setCheckingToken(false);
      }
    };

    checkToken();
  }, [navigate]);

  if (checkingToken) {
    return <div>Checking reset link...</div>;
  }

  if (!token) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    const confirm = event.currentTarget.elements.confirmPassword;

    confirm.setCustomValidity(
      form.password === form.confirmPassword ? "" : "Passwords do not match",
    );

    if (!passwordValid) {
      setError(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
      );
      return;
    }

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, form.password);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "This reset link is invalid or has expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (event) =>
    setForm((current) => ({
      ...current,
      [field]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    }));

  // Password requirements
  const passwordRules = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[@$!%*?&]/.test(form.password),
  };

  const passwordValid =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number &&
    passwordRules.special;

  return (
    <div className="login-page">
      <main className="login-card">
        {theme === "light" && <img src={Light_PNG_SRC} alt="SmartDesk logo" />}
        {theme === "dark" && <img src={Dark_PNG_SRC} alt="SmartDesk logo" />}
        <h1>Reset Password</h1>
        <p>Enter a new password for your account.</p>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={submit}>
          <label htmlFor="password">Password</label>

          <div className="input-wrap">
            <FieldIcon path={lockPath} />

            <input
              id="password"
              name="password"
              type={visible.password ? "text" : "password"}
              placeholder="Create a strong password"
              minLength="8"
              value={form.password}
              onChange={update("password")}
              required
            />
          </div>

          <div className="password-requirements">
            <small className={passwordRules.length ? "valid" : ""}>
              {passwordRules.length ? "✓" : "○"} At least 8 characters
            </small>
            <br></br>

            <small className={passwordRules.uppercase ? "valid" : ""}>
              {passwordRules.uppercase ? "✓" : "○"} One uppercase letter
            </small>
            <br></br>

            <small className={passwordRules.lowercase ? "valid" : ""}>
              {passwordRules.lowercase ? "✓" : "○"} One lowercase letter
            </small>
            <br></br>

            <small className={passwordRules.number ? "valid" : ""}>
              {passwordRules.number ? "✓" : "○"} One number
            </small>
            <br></br>

            <small className={passwordRules.special ? "valid" : ""}>
              {passwordRules.special ? "✓" : "○"} One special character
            </small>
          </div>

          <label htmlFor="confirmPassword">Confirm Password</label>

          <div className="input-wrap">
            <FieldIcon path={lockPath} />

            <input
              id="confirmPassword"
              name="confirmPassword"
              type={visible.confirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              required
            />
          </div>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p>
          <Link to="/login">Back to login</Link>
        </p>
      </main>
    </div>
  );
}
