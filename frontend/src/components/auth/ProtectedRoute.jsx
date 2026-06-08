import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getProfile } from '../../store/slices/authSlice'

export default function ProtectedRoute({ children, roles }) {
  const dispatch = useDispatch()
  const { isAuthenticated, user, accessToken } = useSelector(s => s.auth)

  useEffect(() => {
    if (isAuthenticated && !user && accessToken) {
      dispatch(getProfile())
    }
  }, [isAuthenticated, user, accessToken, dispatch])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (roles && user && !roles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return children
}
