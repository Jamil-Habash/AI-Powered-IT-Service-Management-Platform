import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import {
  getArticleById,
  deleteArticle,
} from "../services/knowledgeBaseService";
import usePageTitle from "../hooks/usePageTitle";

export default function KnowledgeBaseArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  usePageTitle(`Knowledge Base | ${article?.title}`);
  const [error, setError] = useState("");
  const isStaff = user?.role === "IT_AGENT" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    getArticleById(id)
      .then((res) => setArticle(res.data))
      .catch(() =>
        setError("This guide doesn't exist or may have been moved."),
      );
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this article? This cannot be undone.")) return;
    try {
      await deleteArticle(id);
      navigate("/knowledge-base");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to delete article.");
    }
  };

  if (error) {
    return (
      <Shell>
        <PageHeader
          eyebrow="SELF-SERVICE"
          title="Article not found"
          description={error}
        />
        <Link to="/knowledge-base" className="text-button">
          <Icon>arrow_back</Icon> Back to Knowledge Base
        </Link>
      </Shell>
    );
  }

  if (!article)
    return (
      <Shell>
        <p>Loading...</p>
      </Shell>
    );

  return (
    <Shell>
      <PageHeader
        eyebrow={`SELF-SERVICE  •  ${article.category.toUpperCase()}`}
        title={article.title}
        description="Follow these steps in order. If the issue isn't resolved, create a ticket with the details noted at the end."
        action={
          <div style={{ display: "flex", gap: "8px" }}>
            {isStaff && (
              <button
                className="secondary-button"
                onClick={() => navigate(`/knowledge-base/${id}/edit`)}
              >
                <Icon>edit</Icon>Edit
              </button>
            )}
            {isAdmin && (
              <button className="danger-button" onClick={handleDelete}>
                <Icon>delete</Icon>Delete
              </button>
            )}
            <button
              className="secondary-button"
              onClick={() => navigate("/knowledge-base")}
            >
              <Icon>arrow_back</Icon>Back
            </button>
          </div>
        }
      />

      <section className="panel kb-steps">
        {article.steps.map((step, index) => (
          <div className="kb-step" key={index}>
            <div className="kb-step-number">{index + 1}</div>
            <div className="kb-step-content">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="panel kb-still-stuck">
        <div>
          <h2>Still having this issue?</h2>
          <p>
            Create a ticket and reference this guide so IT knows what you've
            already tried.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => navigate("/create-ticket")}
        >
          <Icon>add</Icon>Create a Ticket
        </button>
      </section>
    </Shell>
  );
}
