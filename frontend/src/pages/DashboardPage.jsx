import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { fetchDashboard } from '../store/slices/dashboardSlice'
import { KpiCard, StatusBadge } from '../components/common'
import { formatCurrency, formatDate, timeAgo } from '../utils/helpers'
import { mockDashboard } from '../utils/mockData'
import clsx from 'clsx'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const TX_ICONS = {
  PAYROLL: { icon: 'ti-cash', bg: 'bg-blue-50 text-blue-600' },
  EXPENSE: { icon: 'ti-receipt', bg: 'bg-amber-50 text-amber-600' },
  LOAN:    { icon: 'ti-building-bank', bg: 'bg-green-50 text-green-600' },
  TDS:     { icon: 'ti-file-invoice', bg: 'bg-purple-50 text-purple-600' },
}

const SEVERITY = {
  high:   'bg-red-50 border-red-200 text-red-700',
  medium: 'bg-amber-50 border-amber-200 text-amber-700',
  info:   'bg-blue-50 border-blue-200 text-blue-700',
}

const ICON_SEVERITY = {
  high: 'text-red-500', medium: 'text-amber-500', info: 'text-blue-500'
}

export default function DashboardPage() {
  const dispatch = useDispatch()
  const { data, loading } = useSelector(s => s.dashboard)
  const { user } = useSelector(s => s.auth)

  useEffect(() => {
    if (!USE_MOCK) dispatch(fetchDashboard())
  }, [dispatch])

  const d = USE_MOCK ? mockDashboard : data
  const kpis = d?.kpis || {}
  const trend = d?.payrollTrend || []
  const transactions = d?.recentTransactions || []
  const progress = d?.payrollProgress || {}
  const alerts = d?.complianceAlerts || []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-gray-800">
            {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {' · '}
            <span className="text-gold-600 font-medium">June payroll cycle is active</span>
          </p>
        </div>
        <button className="btn-gold flex items-center gap-2">
          <i className="ti ti-plus" />
          Quick action
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Total Payroll"
          value={formatCurrency(kpis.totalPayroll, 'INR', true)}
          change={`${kpis.payrollChange > 0 ? '+' : ''}${kpis.payrollChange}% vs last month`}
          changeType={kpis.payrollChange > 0 ? 'up' : 'down'}
          icon="ti-cash"
          iconBg="bg-gold-50 text-gold-600"
          loading={!USE_MOCK && loading}
        />
        <KpiCard
          label="Expense Claims"
          value={formatCurrency(kpis.expenseClaims, 'INR', true)}
          change={`${kpis.pendingClaims} pending approval`}
          changeType="neutral"
          icon="ti-receipt"
          iconBg="bg-blue-50 text-blue-600"
          loading={!USE_MOCK && loading}
        />
        <KpiCard
          label="Active Loans"
          value={formatCurrency(kpis.activeLoans, 'INR', true)}
          change={`${kpis.loanCount} employees`}
          changeType="neutral"
          icon="ti-building-bank"
          iconBg="bg-green-50 text-green-600"
          loading={!USE_MOCK && loading}
        />
        <KpiCard
          label="TDS Deducted"
          value={formatCurrency(kpis.tdsDeducted, 'INR', true)}
          change={`${kpis.tdsChange > 0 ? '+' : ''}${kpis.tdsChange}% this month`}
          changeType={kpis.tdsChange > 0 ? 'up' : 'down'}
          icon="ti-file-invoice"
          iconBg="bg-purple-50 text-purple-600"
          loading={!USE_MOCK && loading}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left: Chart + Transactions */}
        <div className="xl:col-span-2 space-y-6">

          {/* Payroll trend chart */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-800">Payroll disbursement trend</h3>
                <p className="text-xs text-gray-400 mt-0.5">Monthly payroll — FY 2025-26</p>
              </div>
              <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-500 bg-gray-50">
                <option>Last 6 months</option>
                <option>This year</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trend} barSize={28}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis hide />
                <Tooltip
                  formatter={v => formatCurrency(v)}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                />
                <Bar dataKey="amount" fill="#0A1628" radius={[4, 4, 0, 0]}
                  label={{ position: 'top', formatter: v => formatCurrency(v, 'INR', true), fontSize: 10, fill: '#9ca3af' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent transactions */}
          <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h3 className="font-semibold text-gray-800">Recent transactions</h3>
              <button className="text-xs text-navy-800 hover:underline font-medium">View all</button>
            </div>
            <div className="divide-y divide-gray-50">
              {transactions.map(tx => {
                const icon = TX_ICONS[tx.type] || TX_ICONS.PAYROLL
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base', icon.bg)}>
                      <i className={clsx('ti', icon.icon)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{tx.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{tx.meta} · {formatDate(tx.date, 'short')}</p>
                    </div>
                    <StatusBadge status={tx.status} />
                    <p className={clsx('text-sm font-semibold ml-2 tabular-nums', tx.credit ? 'text-green-600' : 'text-red-500')}>
                      {tx.credit ? '+' : '-'}{formatCurrency(tx.amount, 'INR', true)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: actions, payroll progress, alerts */}
        <div className="space-y-5">

          {/* Quick actions */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Quick actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: 'ti-send', label: 'Run payroll', to: '/payroll' },
                { icon: 'ti-check', label: 'Approve claims', to: '/expenses' },
                { icon: 'ti-file-download', label: 'Gen. payslip', to: '/payroll' },
                { icon: 'ti-user-plus', label: 'Add employee', to: '/employees' },
                { icon: 'ti-credit-card', label: 'New loan', to: '/loans' },
                { icon: 'ti-chart-bar', label: 'View reports', to: '/analytics' },
              ].map(a => (
                <a
                  key={a.label}
                  href={a.to}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all text-center"
                >
                  <i className={clsx('ti text-xl text-navy-800', a.icon)} />
                  <span className="text-xs text-gray-600 font-medium leading-tight">{a.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Payroll progress */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">June payroll status</h3>
            <div className="space-y-4">
              {[
                { label: 'Employees processed', value: `${progress.processed} / ${progress.total}`, pct: Math.round((progress.processed / progress.total) * 100) || 0, color: 'bg-navy-900' },
                { label: 'Budget utilised', value: `${formatCurrency(progress.budgetUsed, 'INR', true)} / ${formatCurrency(progress.budgetTotal, 'INR', true)}`, pct: Math.round((progress.budgetUsed / progress.budgetTotal) * 100) || 0, color: 'bg-blue-500' },
                { label: 'TDS collected', value: `${formatCurrency(progress.tdsCollected, 'INR', true)} / ${formatCurrency(progress.tdsTotal, 'INR', true)}`, pct: Math.round((progress.tdsCollected / progress.tdsTotal) * 100) || 0, color: 'bg-green-500' },
              ].map(p => (
                <div key={p.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-500">{p.label}</span>
                    <span className="font-medium text-gray-700">{p.value}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={clsx('h-full rounded-full transition-all', p.color)} style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance alerts */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Compliance alerts</h3>
            <div className="space-y-2">
              {alerts.map(a => (
                <div key={a.id} className={clsx('flex items-start gap-3 p-3 rounded-xl border', SEVERITY[a.severity])}>
                  <i className={clsx('ti text-base flex-shrink-0 mt-0.5', `ti-${a.icon}`, ICON_SEVERITY[a.severity])} />
                  <div>
                    <p className="text-xs font-semibold">{a.title}</p>
                    <p className="text-xs opacity-75 mt-0.5">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
