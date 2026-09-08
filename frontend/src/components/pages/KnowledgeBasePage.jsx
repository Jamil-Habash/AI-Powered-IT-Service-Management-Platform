import { useState } from "react";
import Icon from "../Icon";
import PageHeader from "../PageHeader";
import Shell from "../Shell";

const articles = [
  "Fixing GlobalProtect VPN connection timeout",
  "Okta Multi-Factor authentication reset guide",
  "CalDigit TS4 Thunderbolt display firmware patch",
  "macOS Sonoma DisplayLink driver installation",
  "Requesting software license seats via BambooHR",
  "Office 365 Outlook duplicate notifications reset",
];
export default function KnowledgeBasePage() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <Shell>
      <PageHeader
        eyebrow="SELF-SERVICE"
        title="Knowledge Base & Self-Service Guides"
        description="Browse verified IT resolutions, deployment procedures, and troubleshooting wikis."
      />
      <div className="article-grid">
        {articles.map((article, index) => (
          <article className="panel article" key={article}>
            <Icon>
              {
                [
                  "vpn_key",
                  "lock_reset",
                  "devices",
                  "laptop_mac",
                  "badge",
                  "mail",
                ][index]
              }
            </Icon>
            <small>
              {
                [
                  "Network",
                  "Security",
                  "Hardware",
                  "macOS",
                  "Licensing",
                  "Productivity",
                ][index]
              }
            </small>
            <h2>{article}</h2>
            <button className="text-button" onClick={() => setSelectedArticle(article)}>
              Read Guide <Icon>arrow_forward</Icon>
            </button>
          </article>
        ))}
      </div>
      {selectedArticle && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedArticle(null)}>
          <article className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="panel-heading">
              <div>
                <small>Verified self-service guide</small>
                <h2>{selectedArticle}</h2>
              </div>
              <button className="icon-button" aria-label="Close guide" onClick={() => setSelectedArticle(null)}>
                <Icon>close</Icon>
              </button>
            </div>
            <p>Follow the documented troubleshooting steps for this service. If the issue remains after the recommended checks, create a support ticket with the steps you completed and any error details.</p>
            <button className="primary-button" onClick={() => setSelectedArticle(null)}>Done</button>
          </article>
        </div>
      )}
    </Shell>
  );
}
