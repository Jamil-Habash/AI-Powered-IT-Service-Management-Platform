import { useNavigate } from "react-router-dom";
import Icon from "../Icon";
import PageHeader from "../PageHeader";
import Shell from "../Shell";
import { kbArticles } from "../../data/kbArticles";
import usePageTitle from "../../hooks/usePageTitle";

export default function KnowledgeBasePage() {
  usePageTitle("Knowledge Base");
  const navigate = useNavigate();

  return (
    <Shell>
      <PageHeader
        eyebrow="SELF-SERVICE"
        title="Knowledge Base & Self-Service Guides"
        description="Browse verified IT resolutions, deployment procedures, and troubleshooting wikis."
      />
      <div className="article-grid">
        {kbArticles.map((article) => (
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