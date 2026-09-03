import Icon from '../Icon'
import PageHeader from '../PageHeader'
import Shell from '../Shell'

const articles = ['Fixing GlobalProtect VPN connection timeout', 'Okta Multi-Factor authentication reset guide', 'CalDigit TS4 Thunderbolt display firmware patch', 'macOS Sonoma DisplayLink driver installation', 'Requesting software license seats via BambooHR', 'Office 365 Outlook duplicate notifications reset']
export default function KnowledgeBasePage() { return <Shell><PageHeader eyebrow="SELF-SERVICE" title="Knowledge Base & Self-Service Guides" description="Browse verified IT resolutions, deployment procedures, and troubleshooting wikis." /><div className="article-grid">{articles.map((article, index) => <article className="panel article" key={article}><Icon>{['vpn_key', 'lock_reset', 'devices', 'laptop_mac', 'badge', 'mail'][index]}</Icon><small>{['Network', 'Security', 'Hardware', 'macOS', 'Licensing', 'Productivity'][index]}</small><h2>{article}</h2><button className="text-button">Read Guide <Icon>arrow_forward</Icon></button></article>)}</div></Shell> }
