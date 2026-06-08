// ── AnalyticsPage ────────────────────────────────────────────────────────────
import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../utils/helpers'
import { mockDashboard } from '../utils/mockData'

const EXPENSE_BREAKDOWN = [
  { name: 'Travel', value: 180000, color: '#3b82f6' },
  { name: 'Training', value: 95000, color: '#8b5cf6' },
  { name: 'Meals', value: 54000, color: '#f59e0b' },
  { name: 'Office', value: 38000, color: '#10b981' },
  { name: 'Equipment', value: 72000, color: '#ef4444' },
]

const HEADCOUNT = [
  { month: 'Jan', count: 148 },
  { month: 'Feb', count: 151 },
  { month: 'Mar', count: 155 },
  { month: 'Apr', count: 158 },
  { month: 'May', count: 162 },
  { month: 'Jun', count: 168 },
]

export function AnalyticsPage() {
  const [period, setPeriod] = useState('6m')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-800">Analytics & Reports</h2>
          <p className="text-sm text-gray-400 mt-0.5">Financial insights for FY 2025-26</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {['3m', '6m', '1y'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${period === p ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Payroll trend */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Payroll trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockDashboard.payrollTrend} barSize={24}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis hide />
              <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f0f0f0' }} />
              <Bar dataKey="amount" fill="#0A1628" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense breakdown */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Expense breakdown</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={EXPENSE_BREAKDOWN} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {EXPENSE_BREAKDOWN.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f0f0f0' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {EXPENSE_BREAKDOWN.map(e => (
                <div key={e.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                    <span className="text-sm text-gray-600">{e.name}</span>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(e.value, 'INR', true)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Headcount growth */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Headcount growth</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={HEADCOUNT}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f0f0f0' }} />
              <Line type="monotone" dataKey="count" stroke="#D4A942" strokeWidth={2.5} dot={{ fill: '#D4A942', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Budget vs Actual */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Budget vs actual payroll</h3>
          <div className="space-y-4">
            {[
              { dept: 'Engineering', budget: 2200000, actual: 1980000 },
              { dept: 'Finance', budget: 800000, actual: 760000 },
              { dept: 'HR', dept2: 'HR', budget: 600000, actual: 620000 },
              { dept: 'Sales', budget: 950000, actual: 870000 },
              { dept: 'Marketing', budget: 550000, actual: 510000 },
            ].map(r => {
              const pct = Math.round((r.actual / r.budget) * 100)
              const over = pct > 100
              return (
                <div key={r.dept}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{r.dept}</span>
                    <span className={over ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                      {formatCurrency(r.actual, 'INR', true)} / {formatCurrency(r.budget, 'INR', true)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${over ? 'bg-red-500' : 'bg-navy-800'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── CompliancePage ────────────────────────────────────────────────────────────
export function CompliancePage() {
  const deadlines = [
    { title: 'TDS payment', due: '2026-06-09', amount: '₹6,40,000', status: 'URGENT', form: '26QB' },
    { title: 'Form 16 issuance', due: '2026-06-15', amount: 'All employees', status: 'UPCOMING', form: 'Form 16' },
    { title: 'EPFO contribution', due: '2026-06-15', amount: '₹3,20,000', status: 'UPCOMING', form: 'ECR' },
    { title: 'ESI contribution', due: '2026-06-21', amount: '₹48,000', status: 'UPCOMING', form: 'ESI' },
    { title: 'Advance tax Q1', due: '2026-06-15', amount: '₹2,10,000', status: 'UPCOMING', form: 'Challan 280' },
  ]

  const auditLogs = [
    { action: 'Payroll processed', user: 'Arjun Kumar', time: '2026-06-05 14:32', entity: 'Payroll #JUN-2026' },
    { action: 'Loan approved', user: 'Arjun Kumar', time: '2026-06-03 10:15', entity: 'Loan #L-008' },
    { action: 'Expense approved', user: 'Rajesh Mehta', time: '2026-06-02 16:45', entity: 'Claim #EXP-024' },
    { action: 'Employee added', user: 'Arjun Kumar', time: '2026-06-01 11:00', entity: 'FT-008 Ananya Das' },
    { action: 'Salary structure updated', user: 'Arjun Kumar', time: '2026-05-31 09:30', entity: 'FT-007 Vikram Singh' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-display font-bold text-gray-800">Compliance & Audit</h2>
        <p className="text-sm text-gray-400 mt-0.5">Tax compliance, deadlines, and audit trail</p>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Upcoming deadlines</h3>
            <span className="badge-danger">{deadlines.filter(d => d.status === 'URGENT').length} urgent</span>
          </div>
          <div className="divide-y divide-gray-50">
            {deadlines.map(d => (
              <div key={d.title} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${d.status === 'URGENT' ? 'bg-red-500' : 'bg-amber-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{d.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{d.form} · Due: {d.due}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">{d.amount}</p>
                  <button className="text-xs text-blue-600 hover:underline mt-0.5">Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-800">Audit trail</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {auditLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                <div className="w-7 h-7 bg-navy-900/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ti ti-activity text-navy-800 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{log.action}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{log.entity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500">{log.user}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── NotificationsPage ─────────────────────────────────────────────────────────
import { useDispatch, useSelector } from 'react-redux'
import { fetchNotifications, markRead, markAllRead } from '../store/slices/notificationSlice'
import { timeAgo } from '../utils/helpers'
import { mockNotifications } from '../utils/mockData'
import clsx from 'clsx'

const NOTIF_ICONS = {
  PAYROLL: { icon: 'ti-cash', bg: 'bg-blue-50 text-blue-600' },
  EXPENSE: { icon: 'ti-receipt', bg: 'bg-amber-50 text-amber-600' },
  LOAN: { icon: 'ti-building-bank', bg: 'bg-green-50 text-green-600' },
  COMPLIANCE: { icon: 'ti-shield-check', bg: 'bg-red-50 text-red-600' },
  EMPLOYEE: { icon: 'ti-user', bg: 'bg-purple-50 text-purple-600' },
}

export function NotificationsPage() {
  const dispatch = useDispatch()
  const { list } = useSelector(s => s.notifications)
  const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
  const notifs = USE_MOCK ? mockNotifications : list

  const handleMarkRead = async (id) => {
    dispatch(markRead(id))
    if (!USE_MOCK) await fetchNotifications()
  }

  const handleMarkAll = async () => {
    dispatch(markAllRead())
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-800">Notifications</h2>
          <p className="text-sm text-gray-400 mt-0.5">{notifs.filter(n => !n.read).length} unread</p>
        </div>
        <button onClick={handleMarkAll} className="btn-secondary text-sm flex items-center gap-1">
          <i className="ti ti-check-all" />Mark all read
        </button>
      </div>

      <div className="card divide-y divide-gray-50">
        {notifs.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <i className="ti ti-bell-off text-3xl mb-2 block" />
            No notifications
          </div>
        ) : notifs.map(n => {
          const icon = NOTIF_ICONS[n.type] || NOTIF_ICONS.EMPLOYEE
          return (
            <div key={n.id}
              onClick={() => !n.read && handleMarkRead(n.id)}
              className={clsx('flex items-start gap-4 px-5 py-4 transition-colors', !n.read ? 'bg-blue-50/30 cursor-pointer hover:bg-blue-50/50' : 'hover:bg-gray-50/50')}>
              <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base', icon.bg)}>
                <i className={clsx('ti', icon.icon)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={clsx('text-sm', !n.read ? 'font-semibold text-gray-800' : 'font-medium text-gray-700')}>{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                <p className="text-xs text-gray-300 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── SettingsPage ──────────────────────────────────────────────────────────────
import toast from 'react-hot-toast'

export function SettingsPage() {
  const { user } = useSelector(s => s.auth)

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-xl font-display font-bold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account and preferences</p>
      </div>

      {[
        {
          title: 'Security', items: [
            { label: 'Two-factor authentication', sub: 'Add extra security with TOTP', action: <button onClick={() => toast.success('2FA setup opened')} className="btn-secondary text-xs px-3 py-1.5">Enable</button> },
            { label: 'Change password', sub: 'Update your login password', action: <button onClick={() => toast('Change password form')} className="btn-secondary text-xs px-3 py-1.5">Change</button> },
            { label: 'Active sessions', sub: '1 active session on this device', action: <button onClick={() => toast.success('Sessions revoked')} className="text-xs text-red-600 hover:underline">Revoke all</button> },
          ]
        },
        {
          title: 'Notifications', items: [
            { label: 'Payroll alerts', sub: 'Email when payroll is processed', action: <input type="checkbox" defaultChecked className="rounded" /> },
            { label: 'Expense alerts', sub: 'Email when expense is approved/rejected', action: <input type="checkbox" defaultChecked className="rounded" /> },
            { label: 'Compliance reminders', sub: 'Get reminded before tax deadlines', action: <input type="checkbox" defaultChecked className="rounded" /> },
          ]
        },
        {
          title: 'System', items: [
            { label: 'Financial year', sub: 'April 2025 — March 2026', action: <span className="text-xs text-gray-400">FY 2025-26</span> },
            { label: 'Currency', sub: 'Indian Rupee (₹)', action: <span className="text-xs text-gray-400">INR</span> },
            { label: 'Date format', sub: 'DD MMM YYYY', action: <span className="text-xs text-gray-400">en-IN</span> },
          ]
        },
      ].map(section => (
        <div key={section.title} className="card">
          <div className="px-5 py-3.5 border-b border-gray-50">
            <h3 className="font-semibold text-gray-800 text-sm">{section.title}</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {section.items.map(item => (
              <div key={item.label} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-700">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                </div>
                {item.action}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── ProfilePage ───────────────────────────────────────────────────────────────
import { getInitials, getAvatarColor } from '../utils/helpers'

export function ProfilePage() {
  const { user } = useSelector(s => s.auth)

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <h2 className="text-xl font-display font-bold text-gray-800">My Profile</h2>

      <div className="card p-6">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-50">
          <div className={clsx('w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold', getAvatarColor(user?.name))}>
            {getInitials(user?.name)}
          </div>
          <div>
            <p className="text-xl font-display font-bold text-gray-800">{user?.name || 'User'}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <span className="badge-info mt-1 inline-block">{user?.role}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Employee ID', value: user?.employeeId || 'FT-001' },
            { label: 'Department', value: user?.department || 'Finance' },
            { label: 'Email', value: user?.email },
            { label: 'Role', value: user?.role },
          ].map(f => (
            <div key={f.label}>
              <p className="text-xs text-gray-400 mb-1">{f.label}</p>
              <p className="text-sm font-medium text-gray-800">{f.value || '—'}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={() => toast('Edit profile form')} className="btn-primary flex items-center gap-2">
            <i className="ti ti-edit" />Edit profile
          </button>
          <button onClick={() => toast('Change password form')} className="btn-secondary flex items-center gap-2">
            <i className="ti ti-lock" />Change password
          </button>
        </div>
      </div>
    </div>
  )
}

// ── NotFoundPage ──────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A1628' }}>
      <div className="text-center">
        <p className="text-gold-400 font-display font-bold text-8xl mb-4">404</p>
        <h1 className="text-white text-2xl font-semibold mb-2">Page not found</h1>
        <p className="text-white/40 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-gold inline-flex items-center gap-2">
          <i className="ti ti-arrow-left" />Back to dashboard
        </Link>
      </div>
    </div>
  )
}
