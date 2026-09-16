import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import { getArticles } from "../services/knowledgeBaseService";
import usePageTitle from "../hooks/usePageTitle";

export default function KnowledgeBasePage() {
  usePageTitle("Knowledge Base");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const isStaff = user?.role === "IT_AGENT" || user?.role === "ADMIN";

  useEffect(() => {
    getArticles()
      .then((res) => setArticles(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Shell>
      <PageHeader
        eyebrow="SELF-SERVICE"
        title="Knowledge Base & Self-Service Guides"
        description="Browse verified IT resolutions, deployment procedures, and troubleshooting wikis."
        action={
          isStaff ? (
            <button
              className="primary-button"
              onClick={() => navigate("/knowledge-base/new")}
            >
              <Icon>add</Icon>New Article
            </button>
          ) : undefined
        }
      />

      {loading && <p>Loading articles...</p>}
      {!loading && articles.length === 0 && <p>No articles yet.</p>}

      <div className="article-grid">
        {articles.map((article) => (
          <article className="panel article" key={article.id}>
            <Icon>{article.icon}</Icon>
            <small>{article.category}</small>
            <h2>{article.title}</h2>
            <button
              className="text-button"
              onClick={() => navigate(`/knowledge-base/${article.id}`)}
            >
              Read Guide <Icon>arrow_forward</Icon>
            </button>
          </article>
        ))}
      </div>
    </Shell>
  );
}
