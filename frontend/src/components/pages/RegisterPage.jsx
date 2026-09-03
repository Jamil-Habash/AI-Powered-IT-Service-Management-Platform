import { useState } from "react";
import { Link } from "react-router-dom";
import { LOGO_SRC } from "../Shell";

function EyeIcon({ visible }) {
  return (
    <svg
      className="eye-icon"
      style={{ width: "18px", height: "18px", display: "block" }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      {visible ? (
        <g>
          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
        </g>
      ) : (
        <path d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 0 1 1.563-3.029m5.858.908a3 3 0 1 1 4.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532 3.29 3.29M3 3l18 18" />
      )}
    </svg>
  );
}
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
const userPath =
  "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z";
const mailPath =
  "M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z";
const lockPath =
  "M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z";

export default function RegisterPage() {
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
  const update = (field) => (event) =>
    setForm((current) => ({
      ...current,
      [field]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    }));
  const submit = (event) => {
    event.preventDefault();
    const confirm = event.currentTarget.elements.confirmPassword;
    confirm.setCustomValidity(
      form.password === form.confirmPassword ? "" : "Passwords do not match",
    );
    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }
    window.alert("Account created successfully!");
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
        <header className="card-header">
          <img
            className="logo"
            src={LOGO_SRC}
            alt="SmartDesk IT Service Management Logo"
          />
          <h1>Create your account</h1>
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
        </header>
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
            <button
              className="visibility-button"
              type="button"
              onClick={() =>
                setVisible((current) => ({
                  ...current,
                  password: !current.password,
                }))
              }
              aria-label="Toggle password visibility"
            >
              <EyeIcon visible={visible.password} />
            </button>
          </div>
          <p className="hint">Must be at least 8 characters</p>
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
            <button
              className="visibility-button"
              type="button"
              onClick={() =>
                setVisible((current) => ({
                  ...current,
                  confirmPassword: !current.confirmPassword,
                }))
              }
              aria-label="Toggle confirm password visibility"
            >
              <EyeIcon visible={visible.confirmPassword} />
            </button>
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
          <button className="submit-button" type="submit">
            Create account
          </button>
        </form>
        <footer className="card-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </footer>
        <footer className="page-footer">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#help">Help Center</a>
        </footer>
      </main>
    </div>
  );
}
