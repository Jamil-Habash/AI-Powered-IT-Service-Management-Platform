import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Shell from "../components/Shell";
import { getCategories } from "../services/categoryService";
import { createTicket } from "../services/ticketService";
import usePageTitle from "../hooks/usePageTitle";

export default function CreateTicketPage() {
  usePageTitle("Create a support Ticket");
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const draft = localStorage.getItem("smartdesk_ticket_draft");
    if (!draft) return;
    try {
      const saved = JSON.parse(draft);
      setTitle(saved.title || "");
      setCategory(saved.category || "");
      setPriority(saved.priority || "MEDIUM");
      setDescription(saved.description || "");
    } catch {
      localStorage.removeItem("smartdesk_ticket_draft");
    }
  }, []);

  const updateTitle = (value) => {
    setTitle(value);
    if (category) return;
    const lower = value.toLowerCase();
    const match = categories.find((item) => {
      const name = item.name.toLowerCase();
      return (
        (/(vpn|wifi|network|dns)/.test(lower) && /network|vpn/.test(name)) ||
        (/(monitor|dock|laptop|keyboard)/.test(lower) && /hardware|peripheral|display/.test(name)) ||
        (/(password|login|sso|account)/.test(lower) && /account|access|identity/.test(name))
      );
    });
    if (match) setCategory(String(match.id));
  };

  const saveDraft = () => {
    localStorage.setItem(
      "smartdesk_ticket_draft",
      JSON.stringify({ title, category, priority, description }),
    );
    setError("Draft saved locally on this device.");
  };

  useEffect(() => {
    getCategories()
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.content || [];
        setCategories(data);
      })
      .catch(() => setError("Unable to load ticket categories."))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!title || !category || !description) return;
    setError("");
    setLoading(true);
    try {
      const response = await createTicket({
        title,
        description,
        categoryId: Number(category),
        priority,
      });
      localStorage.removeItem("smartdesk_ticket_draft");
      navigate(`/ticket/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to submit ticket.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Shell>
      <PageHeader
        eyebrow="SELF-SERVICE PORTAL  •  IT SUPPORT DESK"
        title="Create a Support Ticket"
        description="Submit a detailed request and our IT support team or automated assistants will assist you."
        action={
          <button
            className="secondary-button"
            onClick={() => navigate("/tickets")}
          >
            <Icon>arrow_back</Icon>Back to Tickets
          </button>
        }
      />
      <div className="content-grid">
        <form className="panel ticket-form" onSubmit={submit}>
          {error && <p className="form-error">{error}</p>}
          <h2>Ticket Details</h2>
          <p>
            Please provide clear details about the issue or request so we can
            route it quickly.
          </p>
          <label>
            Ticket Title
            <input
              value={title}
              onChange={(event) => updateTitle(event.target.value)}
              placeholder="Unable to connect to corporate VPN"
              required
            />
          </label>
          <div className="form-row">
            <label>
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
              >
                <option value="">
                  {categoriesLoading ? "Loading categories..." : "Select a category..."}
                </option>
                {categories.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {!categoriesLoading && !categories.length && !error && (
                <small>No categories are available yet.</small>
              )}
            </label>
            <label>
              Urgency & Impact
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </label>
          </div>
          <label>
            Description
            <div className="editor-toolbar" aria-label="Formatting tools">
              <button type="button" title="Bold" onClick={() => setDescription((value) => `${value}**bold text**`)}><Icon>format_bold</Icon></button>
              <button type="button" title="Italic" onClick={() => setDescription((value) => `${value}*italic text*`)}><Icon>format_italic</Icon></button>
              <button type="button" title="Bullet list" onClick={() => setDescription((value) => `${value}\n- `)}><Icon>format_list_bulleted</Icon></button>
              <button type="button" title="Code block" onClick={() => setDescription((value) => `${value}\n\`\`\`\n\`\`\``)}><Icon>code</Icon></button>
            </div>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the issue in detail..."
              rows="7"
              required
            />
          </label>
          <label className="upload">
            <Icon>cloud_upload</Icon>Attach screenshots or logs
            <input
              type="file"
              multiple
              onChange={(event) => setFiles([...event.target.files])}
            />
            <small>
              {files.length
                ? `${files.length} file(s) attached`
                : "PNG, JPG, PDF, LOG up to 25MB"}
            </small>
          </label>
          <section className="triage-callout">
            <Icon>auto_awesome</Icon>
            <div>
              <strong>Smart Triage Active</strong>
              <p>We analyze the subject and description to route this request to the right support queue.</p>
            </div>
          </section>
          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={saveDraft}>
              Save Draft
            </button>
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Ticket"} <Icon>send</Icon>
            </button>
          </div>
        </form>
        <aside className="panel tips">
          <h2>Before Submitting</h2>
          {[
            "Check System Health",
            "Restart Device & Peripherals",
            "Explore Knowledge Base",
          ].map((tip, index) => (
            <div key={tip}>
              <b>{index + 1}</b>
              <span>
                <strong>{tip}</strong>
                <small>
                  Check our verified resolutions before raising a request.
                </small>
              </span>
            </div>
          ))}
        </aside>
      </div>
    </Shell>
  );
}
