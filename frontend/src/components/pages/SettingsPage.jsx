import PageHeader from '../PageHeader'
import Shell from '../Shell'

export default function SettingsPage() { return <Shell><PageHeader eyebrow="WORKSPACE" title="User & Workspace Preferences" description="Manage profile details, notification preferences, and routing configurations." /><section className="panel settings"><label>Full Name<input defaultValue="Alex Morgan" /></label><label>Work Email<input defaultValue="alex.m@company.org" disabled /></label><label>Assigned Department<input defaultValue="Product & UX Design (HQ Austin)" /></label><label className="remember"><input type="checkbox" defaultChecked />Receive email digests for ticket SLA status changes</label><button className="primary-button">Save Changes</button></section></Shell> }
