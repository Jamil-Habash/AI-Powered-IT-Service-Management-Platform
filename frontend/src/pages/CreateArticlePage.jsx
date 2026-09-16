import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Shell from "../components/Shell";
import {
  createArticle,
  updateArticle,
  getArticleById,
} from "../services/knowledgeBaseService";
import usePageTitle from "../hooks/usePageTitle";

const ICON_OPTIONS = [
  "vpn_key",
  "lock_reset",
  "devices",
  "laptop_mac",
  "badge",
  "mail",
  "wifi",
  "print",
  "security",
  "storage",
  "cloud",
  "settings_suggest",
];

export default function CreateArticlePage() {
  usePageTitle("Knowledge Base | Add Article");
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [steps, setSteps] = useState([{ title: "", description: "" }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(isEditing);

  useEffect(() => {
    if (!isEditing) return;
    getArticleById(id)
      .then((res) => {
        const a = res.data;
        setTitle(a.title);
        setCategory(a.category);
        setIcon(a.icon);
        setSteps(a.steps.length ? a.steps : [{ title: "", description: "" }]);
      })
      .catch(() => setError("Unable to load this article."))
      .finally(() => setLoadingArticle(false));
  }, [id, isEditing]);

  const updateStep = (index, field, value) => {
    setSteps((current) =>
      current.map((step, i) =>
        i === index ? { ...step, [field]: value } : step,
      ),
    );
  };

  const addStep = () =>
    setSteps((current) => [...current, { title: "", description: "" }]);

  const removeStep = (index) =>
    setSteps((current) => current.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanSteps = steps.filter(
      (s) => s.title.trim() && s.description.trim(),
    );
    if (cleanSteps.length === 0) {
      setError("Add at least one complete step.");
      return;
    }

    setLoading(true);
    try {
      const payload = { title, category, icon, steps: cleanSteps };
      const response = isEditing
        ? await updateArticle(id, payload)
        : await createArticle(payload);
      navigate(`/knowledge-base/${response.data.id}`);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          Object.values(err.response?.data || {})[0] ||
          "Unable to save article.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingArticle)
    return (
      <Shell>
        <p>Loading article...</p>
      </Shell>
    );

  return (
    <Shell>
      <PageHeader
        eyebrow="SELF-SERVICE • KNOWLEDGE BASE"
        title={isEditing ? "Edit Article" : "New Article"}
        description="Write a step-by-step guide for a common issue employees can resolve themselves."
        action={
          <button
            className="secondary-button"
            onClick={() => navigate("/knowledge-base")}
          >
            <Icon>arrow_back</Icon>Back to Knowledge Base
          </button>
        }
      />

      {error && <p className="form-error">{error}</p>}

      <form className="panel ticket-form" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <div className="form-row">
          <label>
            Category
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Network, Security, Hardware"
              required
            />
          </label>
          <label>
            Icon
            <select value={icon} onChange={(e) => setIcon(e.target.value)}>
              {ICON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        </div>

        <h2 style={{ marginTop: "16px" }}>Steps</h2>
        {steps.map((step, index) => (
          <div
            key={index}
            className="panel"
            style={{
              background: "var(--surface-soft, #f1f5f9)",
              marginBottom: "10px",
            }}
          >
            <div className="panel-heading">
              <strong>Step {index + 1}</strong>
              {steps.length > 1 && (
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => removeStep(index)}
                >
                  <Icon>delete</Icon>
                </button>
              )}
            </div>
            <label>
              Step title
              <input
                value={step.title}
                onChange={(e) => updateStep(index, "title", e.target.value)}
                placeholder="e.g. Check your internet connection"
              />
            </label>
            <label>
              Step description
              <textarea
                value={step.description}
                onChange={(e) =>
                  updateStep(index, "description", e.target.value)
                }
                rows={3}
                placeholder="Explain what to do and why it matters"
              />
            </label>
          </div>
        ))}

        <button
          type="button"
          className="secondary-button"
          onClick={addStep}
          style={{ alignSelf: "flex-start" }}
        >
          <Icon>add</Icon>Add Step
        </button>

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Publish Article"}
          </button>
        </div>
      </form>
    </Shell>
  );
}
