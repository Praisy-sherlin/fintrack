import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { login, clearError } from '../store/slices/authSlice'
import { mockUser } from '../utils/mockData'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(s => s.auth)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: 'admin@fintrack.com', password: 'Admin@123' }
  })

  useEffect(() => { dispatch(clearError()) }, [dispatch])
  useEffect(() => { if (error) toast.error(error) }, [error])

  const onSubmit = async (data) => {
    if (USE_MOCK) {
      // Demo mode — skip real API
      localStorage.setItem('accessToken', 'mock-token')
      localStorage.setItem('refreshToken', 'mock-refresh')
      dispatch({ type: 'auth/login/fulfilled', payload: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh',
        user: mockUser,
      }})
      toast.success('Welcome back, Arjun!')
      navigate('/')
      return
    }
    const result = await dispatch(login(data))
    if (login.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user?.name?.split(' ')[0]}!`)
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0A1628' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center">
              <i className="ti ti-building-bank text-white text-xl" />
            </div>
            <div>
              <p className="text-white font-display font-bold text-xl">FinTrack</p>
              <p className="text-gold-400 text-xs">Enterprise Finance Portal</p>
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-white font-display font-bold text-5xl leading-tight mb-6">
              Smarter finance<br />
              <span className="text-gold-400">for your team.</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed">
              Payroll, expenses, loans and compliance — all in one secure platform built for modern organisations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: 'ti-shield-lock', label: 'Bank-grade security', sub: 'AES-256 + JWT' },
              { icon: 'ti-chart-line', label: 'Real-time analytics', sub: 'Live dashboards' },
              { icon: 'ti-users', label: 'Multi-role access', sub: 'RBAC system' },
              { icon: 'ti-file-check', label: 'Compliance ready', sub: 'TDS, Form 16' },
            ].map(f => (
              <div key={f.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <i className={clsx('ti text-gold-400 text-xl mb-2 block', f.icon)} />
                <p className="text-white text-sm font-medium">{f.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{f.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-xs">
          © 2026 FinTrack. Enterprise Finance Platform. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-gold-500 rounded-xl flex items-center justify-center">
              <i className="ti ti-building-bank text-white text-lg" />
            </div>
            <p className="text-white font-display font-bold text-xl">FinTrack</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-800">Sign in</h2>
              <p className="text-gray-400 text-sm mt-1">Access your finance dashboard</p>
            </div>

            {USE_MOCK && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 flex items-start gap-2">
                <i className="ti ti-info-circle text-amber-500 text-base flex-shrink-0 mt-0.5" />
                <p className="text-amber-700 text-xs">
                  <strong>Demo mode active.</strong> Pre-filled credentials will log you in instantly without a backend.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <i className="ti ti-mail absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input
                    type="email"
                    className={clsx('input-field pl-10', errors.email && 'border-red-400 focus:border-red-400 focus:ring-red-100')}
                    placeholder="you@company.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                    })}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <i className="ti ti-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={clsx('input-field pl-10 pr-10', errors.password && 'border-red-400')}
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <i className={clsx('ti text-base', showPassword ? 'ti-eye-off' : 'ti-eye')} />
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-navy-800" />
                  <span className="text-sm text-gray-500">Remember me</span>
                </label>
                <button type="button" className="text-sm text-navy-800 hover:underline font-medium">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-base font-semibold flex items-center justify-center gap-2"
              >
                {loading
                  ? <><i className="ti ti-loader-2 animate-spin" /> Signing in...</>
                  : <><i className="ti ti-login" /> Sign in to FinTrack</>
                }
              </button>
            </form>

            {/* Role hints */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-3">Demo accounts</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Admin', email: 'admin@fintrack.com' },
                  { label: 'Manager', email: 'manager@fintrack.com' },
                  { label: 'Employee', email: 'employee@fintrack.com' },
                  { label: 'Auditor', email: 'auditor@fintrack.com' },
                ].map(r => (
                  <div key={r.label} className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="text-xs font-semibold text-gray-600">{r.label}</p>
                    <p className="text-[11px] text-gray-400 truncate">{r.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
