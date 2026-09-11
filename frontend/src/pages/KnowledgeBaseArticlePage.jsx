import { useParams, useNavigate, Link } from "react-router-dom";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import Shell from "../components/Shell";
import { kbArticles } from "../data/kbArticles";
import usePageTitle from "../hooks/usePageTitle";

export default function KnowledgeBaseArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = kbArticles.find((a) => a.id === id);
  usePageTitle(`Knowledge Base | ${article.title}`)

  if (!article) {
    return (
      <Shell>
        <PageHeader
          eyebrow="SELF-SERVICE"
          title="Article not found"
          description="This guide doesn't exist or may have been moved."
        />
        <Link to="/knowledge-base" className="text-button">
          <Icon>arrow_back</Icon> Back to Knowledge Base
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <PageHeader
        eyebrow={`SELF-SERVICE  •  ${article.category.toUpperCase()}`}
        title={article.title}
        description="Follow these steps in order. If the issue isn't resolved, create a ticket with the details noted at the end."
        action={
          <button className="secondary-button" onClick={() => navigate("/knowledge-base")}>
            <Icon>arrow_back</Icon>Back to Knowledge Base
          </button>
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
          <p>Create a ticket and reference this guide so IT knows what you've already tried.</p>
        </div>
        <button className="primary-button" onClick={() => navigate("/create-ticket")}>
          <Icon>add</Icon>Create a Ticket
        </button>
      </section>
    </Shell>
  );
}