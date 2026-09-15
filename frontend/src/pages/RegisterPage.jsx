import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Light_LOGO_SRC, Dark_LOGO_SRC, Light_PNG_SRC, Dark_PNG_SRC } from "../components/Shell";
import { registerUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import usePageTitle from "../hooks/usePageTitle";

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

const userPath = "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z";
const mailPath = "M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z";
const lockPath = "M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z";

export default function RegisterPage() {
  usePageTitle("Register");

  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [visible, setVisible] = useState({
    password: false,
    confirmPassword: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

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


  const submit = async (event) => {
    event.preventDefault();
    setError("");

    const confirm = event.currentTarget.elements.confirmPassword;

    confirm.setCustomValidity(
      form.password === form.confirmPassword
        ? ""
        : "Passwords do not match"
    );

    if (!passwordValid) {
      setError(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    setLoading(true);

    try {
      await registerUser(form.name, form.email, form.password);

      /*
      * Admin-created users keep the existing flow.
      * Normal users must verify their email first.
      */
      if (user?.role === "ADMIN") {
        navigate("/dashboard");
        return;
      }

      /*
      * Keep the email temporarily so the verification page
      * still knows which account is being verified after a refresh.
      */
      sessionStorage.setItem("smartdesk_verification_email", form.email);

      navigate("/verify-email", {
        state: {
          email: form.email,
        },
      });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        Object.values(err.response?.data || {})[0] ||
        "Registration failed";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const field = (id, label, path, props) => (
    <>
      <label htmlFor={id}>{label}</label>

      <div className="input-wrap">
        <FieldIcon path={path} />
        <input id={id} name={id} {...props} required />
      </div>
    </>
  );

  return (
    <div className="registration-page">
      <main className="registration-card">
          {theme === "light" && (<img src={Light_PNG_SRC} alt="SmartDesk IT Service Management Logo"/>)}
          {theme === "dark" && (<img src={Dark_PNG_SRC} alt="SmartDesk IT Service Management Logo"/>)}

          {user?.role === "ADMIN" && <h1>Add a User</h1>}
          {user == null && <h1>Create your account</h1>}
          <p>Join SmartDesk IT Service Management Platform</p>
          <div
            className="role-badge"
            style={{
              width: "208px",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <span />
            Assigned Role: Employee
          </div>

        {error && <p className="form-error">{error}</p>}

        <form className="registration-form" onSubmit={submit}>
          {field("name", "Full Name", userPath, {
            placeholder: "e.g. Alex Morgan",
            value: form.name,
            onChange: update("name"),
          })}

          {field("email", "Email Address", mailPath, {
            type: "email",
            placeholder: "alex@company.com",
            value: form.email,
            onChange: update("email"),
          })}

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
            <p className={passwordRules.length ? "valid" : ""}>
              {passwordRules.length ? "✓" : "○"} At least 8 characters
            </p>

            <p className={passwordRules.uppercase ? "valid" : ""}>
              {passwordRules.uppercase ? "✓" : "○"} One uppercase letter
            </p>

            <p className={passwordRules.lowercase ? "valid" : ""}>
              {passwordRules.lowercase ? "✓" : "○"} One lowercase letter
            </p>

            <p className={passwordRules.number ? "valid" : ""}>
              {passwordRules.number ? "✓" : "○"} One number
            </p>

            <p className={passwordRules.special ? "valid" : ""}>
              {passwordRules.special ? "✓" : "○"} One special character
            </p>
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

          <label className="terms">
            <input
              type="checkbox"
              checked={form.terms}
              onChange={update("terms")}
              required
            />

            <span>
              I agree to the <a href="#terms">Terms of Service</a> and{" "}
              <a href="#privacy">Privacy Policy</a>
            </span>
          </label>

          <button
            className="submit-button"
            type="submit"
            disabled={loading || !passwordValid}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {user == null && (
          <>
            <footer className="card-footer">
              Already registered? <Link to="/login">Log in</Link>
            </footer>

            <footer className="page-footer">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#help">Help Center</a>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
