import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { getInitials } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function Topbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const { unreadCount } = useSelector(s => s.notifications)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/login')
  }

  // Dynamic page title based on current path
  const pathname = window.location.pathname
  const pageTitles = {
    '/': 'Dashboard', '/employees': 'Employees', '/payroll': 'Payroll',
    '/expenses': 'Expenses', '/loans': 'Loans', '/analytics': 'Analytics',
    '/compliance': 'Compliance', '/notifications': 'Notifications',
    '/settings': 'Settings', '/profile': 'My Profile',
  }
  const pageTitle = pageTitles[pathname] || 'FinTrack'

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0 z-20">
      <h1 className="text-base font-semibold text-gray-800">{pageTitle}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 h-9 text-sm text-gray-400 w-52">
          <i className="ti ti-search text-base" />
          <span>Search...</span>
        </div>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500"
        >
          <i className="ti ti-bell text-base" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-navy-900/10 flex items-center justify-center text-xs font-semibold text-navy-800">
              {user ? getInitials(user.name) : '?'}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block">{user?.name?.split(' ')[0]}</span>
            <i className="ti ti-chevron-down text-sm text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
              </div>
              <button onClick={() => { navigate('/profile'); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <i className="ti ti-user text-base" />My Profile
              </button>
              <button onClick={() => { navigate('/settings'); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <i className="ti ti-settings text-base" />Settings
              </button>
              <div className="border-t border-gray-50 mt-1 pt-1">
                <button onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <i className="ti ti-logout text-base" />Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
