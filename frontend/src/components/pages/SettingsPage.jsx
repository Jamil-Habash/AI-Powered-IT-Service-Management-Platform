import { useState } from "react";
import PageHeader from "../PageHeader";
import Shell from "../Shell";
import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saved, setSaved] = useState(false);

  const save = (event) => {
    event.preventDefault();
    updateUser({ name });
    setSaved(true);
  };

  return (
    <Shell>
      <PageHeader
        eyebrow="WORKSPACE"
        title="User & Workspace Preferences"
        description="Manage profile details, notification preferences, and routing configurations."
      />
      <form className="panel settings" onSubmit={save}>
        <label>
          Full Name
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Work Email
          <input value={user?.email || ""} disabled />
        </label>
        <label>
          Assigned Department
          <input value={user?.role || ""} disabled />
        </label>
        <label className="remember">
          <input type="checkbox" defaultChecked />
          Receive email digests for ticket SLA status changes
        </label>
        <button className="primary-button" type="submit">Save Changes</button>
        {saved && <p>Profile saved.</p>}
      </form>
    </Shell>
  );
}
