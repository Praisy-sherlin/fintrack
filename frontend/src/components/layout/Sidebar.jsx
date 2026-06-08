import { NavLink, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSidebar } from '../../store/slices/uiSlice'
import { getInitials, getAvatarColor } from '../../utils/helpers'
import clsx from 'clsx'

const NAV = [
  {
    group: 'Main',
    items: [
      { to: '/', icon: 'ti-layout-dashboard', label: 'Dashboard', exact: true },
      { to: '/employees', icon: 'ti-users', label: 'Employees' },
      { to: '/payroll', icon: 'ti-cash', label: 'Payroll', badge: 'payroll' },
      { to: '/expenses', icon: 'ti-receipt', label: 'Expenses', badge: 'expenses' },
      { to: '/loans', icon: 'ti-credit-card', label: 'Loans' },
    ]
  },
  {
    group: 'Finance',
    items: [
      { to: '/analytics', icon: 'ti-chart-bar', label: 'Analytics' },
      { to: '/compliance', icon: 'ti-shield-check', label: 'Compliance' },
    ]
  },
  {
    group: 'System',
    items: [
      { to: '/notifications', icon: 'ti-bell', label: 'Notifications', badge: 'notifications' },
      { to: '/settings', icon: 'ti-settings', label: 'Settings' },
    ]
  }
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const { sidebarOpen } = useSelector(s => s.ui)
  const { user } = useSelector(s => s.auth)
  const { unreadCount } = useSelector(s => s.notifications)
  const { list: pendingPayroll } = useSelector(s => s.payroll)
  const { list: pendingExpenses } = useSelector(s => s.expenses)
  const location = useLocation()

  const getBadge = key => {
    if (key === 'notifications') return unreadCount || null
    if (key === 'payroll') return pendingPayroll.filter(p => p.status === 'PENDING').length || null
    if (key === 'expenses') return pendingExpenses.filter(e => e.status === 'PENDING').length || null
    return null
  }

  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to)

  return (
    <div
      className={clsx(
        'fixed top-0 left-0 h-full z-30 flex flex-col transition-all duration-300',
        'border-r border-gray-100',
        sidebarOpen ? 'w-60' : 'w-16'
      )}
      style={{ background: '#0A1628' }}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/10 flex-shrink-0">
        {sidebarOpen && (
          <div>
            <div className="text-white font-display font-bold text-lg tracking-tight">
              <i className="ti ti-building-bank text-gold-500 mr-2" />
              FinTrack
            </div>
            <div className="text-gold-400 text-[10px] tracking-wide">Enterprise Finance</div>
          </div>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="ml-auto text-white/40 hover:text-white/80 transition-colors p-1.5 rounded-lg hover:bg-white/10"
        >
          <i className={clsx('ti text-lg', sidebarOpen ? 'ti-layout-sidebar-left-collapse' : 'ti-layout-sidebar-left-expand')} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV.map(section => (
          <div key={section.group} className="mb-4">
            {sidebarOpen && (
              <p className="text-white/25 text-[10px] uppercase tracking-widest px-3 mb-2">{section.group}</p>
            )}
            {section.items.map(item => {
              const active = isActive(item.to, item.exact)
              const badge = item.badge ? getBadge(item.badge) : null

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={!sidebarOpen ? item.label : undefined}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-150',
                    'text-sm relative group',
                    active
                      ? 'bg-gold-500/15 text-gold-400'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  )}
                >
                  <i className={clsx('ti text-lg flex-shrink-0', item.icon)} />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {badge && (
                        <span className="bg-gold-500 text-navy-900 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                  {!sidebarOpen && badge && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold-500" />
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-3 flex-shrink-0">
        <NavLink to="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
          {user ? (
            <div className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0',
              'bg-gold-500/20 text-gold-400'
            )}>
              {getInitials(user.name)}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
          )}
          {sidebarOpen && user && (
            <div className="min-w-0">
              <p className="text-white/80 text-sm font-medium truncate">{user.name}</p>
              <p className="text-white/35 text-xs truncate">{user.role}</p>
            </div>
          )}
        </NavLink>
      </div>
    </div>
  )
}
