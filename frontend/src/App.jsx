import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AnalyticsPage from './components/pages/AnalyticsPage'
import CreateTicketPage from './components/pages/CreateTicketPage'
import DashboardPage from './components/pages/DashboardPage'
import KnowledgeBasePage from './components/pages/KnowledgeBasePage'
import LoginPage from './components/pages/LoginPage'
import RegisterPage from './components/pages/RegisterPage'
import SettingsPage from './components/pages/SettingsPage'
import TicketDetailPage from './components/pages/TicketDetailPage'
import TicketsPage from './components/pages/TicketsPage'
import './App.css'

export default function App() {
  return <BrowserRouter>
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/create-ticket" element={<CreateTicketPage />} />
    <Route path="/tickets" element={<TicketsPage />} />
    <Route path="/ticket/:id" element={<TicketDetailPage />} />
    <Route path="/analytics" element={<AnalyticsPage />} />
    <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
    <Route path="/settings" element={<SettingsPage />} />
  </Routes>
</BrowserRouter>
}
