import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import EmployeesPage from './pages/EmployeesPage'
import PayrollPage from './pages/PayrollPage'
import ExpensesPage from './pages/ExpensesPage'
import LoansPage from './pages/LoansPage'
import AnalyticsPage from './pages/AnalyticsPage'
import CompliancePage from './pages/CompliancePage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/auth/ProtectedRoute'

export default function App() {
  const { isAuthenticated } = useSelector(s => s.auth)

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="loans" element={<LoansPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="compliance" element={<CompliancePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
