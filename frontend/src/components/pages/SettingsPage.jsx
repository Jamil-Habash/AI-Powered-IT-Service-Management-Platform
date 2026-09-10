import { useState, useEffect } from "react";
import Icon from "../Icon";
import PageHeader from "../PageHeader";
import Shell from "../Shell";
import { useAuth } from "../../context/AuthContext";
import { updateUser } from "../../services/userService";

export default function SettingsPage() {
  const { user, refreshSession } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    confirmPassword: ""
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
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: user?.name || "",
      email: user?.email || "",
    }));
  }, [user?.name, user?.email]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  
    setLoading(true);
    try {
      const response = await updateUser(user.userId, form.name, form.email, form.password);
      refreshSession(response.data);
      setForm((current) => ({ ...current, password: "", confirmPassword: "" }));
      setMessage("Profile updated successfully.");
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        Object.values(err.response?.data || {})[0] ||
        "Unable to update your profile.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };
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

  const field = (id, label, val, path, props) => (
    <>
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <FieldIcon path={path} />
        <input id={id} name={id} value={val} {...props} required />
      </div>
    </>
  );

  return (
    <Shell>
      <PageHeader
        eyebrow="WORKSPACE"
        title="User & Workspace Preferences"
        description="Manage profile details, notification preferences, and routing configurations."
      />
      <form className="panel settings" onSubmit={submit}>
        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}
        {field("name", "Full Name",user.name,userPath,{
            value: form.name,
            onChange: update("name"),
          } )}
        <label htmlFor="email">Work Email</label>
        <div className="input-wrap">
          <FieldIcon path={mailPath} />
          <input id="email" name="email" type="email" value={form.email} onChange={update("email")} required />
        </div>
        <label htmlFor="password">New Password</label>
        <div className="input-wrap">
          <FieldIcon path={lockPath} />
          <input id="password" name="password" type={visible.password ? "text" : "password"} value={form.password} onChange={update("password")} minLength="8" placeholder="Leave blank to keep current password" />
        </div>
        <label htmlFor="confirmPassword">Confirm New Password</label>
        <div className="input-wrap">
          <FieldIcon path={lockPath} />
          <input id="confirmPassword" name="confirmPassword" type={visible.confirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={update("confirmPassword")} minLength="8" placeholder="Leave blank to keep current password" />
        </div>
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </Shell>
  );
}
