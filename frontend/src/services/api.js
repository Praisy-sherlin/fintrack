import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// ── Axios instance ──────────────────────────────────────────────────
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── Request interceptor — attach JWT ────────────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor — handle 401 ───────────────────────────────
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken })
        localStorage.setItem('accessToken', data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch (e) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── API modules ─────────────────────────────────────────────────────
export const authAPI = {
  login:         payload => api.post('/auth/login', payload),
  register:      payload => api.post('/auth/register', payload),
  logout:        payload => api.post('/auth/logout', payload),
  refresh:       payload => api.post('/auth/refresh', payload),
  getProfile:    ()      => api.get('/auth/profile'),
  updateProfile: payload => api.put('/auth/profile', payload),
  changePassword:payload => api.put('/auth/change-password', payload),
  enable2FA:     ()      => api.post('/auth/2fa/enable'),
  verify2FA:     payload => api.post('/auth/2fa/verify', payload),
  disable2FA:    payload => api.post('/auth/2fa/disable', payload),
}

export const employeeAPI = {
  getAll:      params        => api.get('/employees', { params }),
  getById:     id            => api.get(`/employees/${id}`),
  create:      payload       => api.post('/employees', payload),
  update:      (id, payload) => api.put(`/employees/${id}`, payload),
  delete:      id            => api.delete(`/employees/${id}`),
  getDepartments: ()         => api.get('/employees/departments'),
}

export const payrollAPI = {
  getAll:              params        => api.get('/payroll', { params }),
  getById:             id            => api.get(`/payroll/${id}`),
  process:             payload       => api.post('/payroll/process', payload),
  approve:             id            => api.put(`/payroll/${id}/approve`),
  reject:              id            => api.put(`/payroll/${id}/reject`),
  getPayslip:          id            => api.get(`/payroll/${id}/payslip`, { responseType: 'blob' }),
  getSummary:          params        => api.get('/payroll/summary', { params }),
  getSalaryStructure:  employeeId    => api.get(`/payroll/salary-structure/${employeeId}`),
  updateSalaryStructure: (id, payload) => api.put(`/payroll/salary-structure/${id}`, payload),
}

export const expenseAPI = {
  getAll:      params        => api.get('/expenses', { params }),
  getById:     id            => api.get(`/expenses/${id}`),
  submit:      payload       => api.post('/expenses', payload),
  approve:     (id, payload) => api.put(`/expenses/${id}/approve`, payload),
  reject:      (id, payload) => api.put(`/expenses/${id}/reject`, payload),
  getCategories: ()          => api.get('/expenses/categories'),
  getSummary:  params        => api.get('/expenses/summary', { params }),
}

export const loanAPI = {
  getAll:      params        => api.get('/loans', { params }),
  getById:     id            => api.get(`/loans/${id}`),
  apply:       payload       => api.post('/loans/apply', payload),
  approve:     (id, payload) => api.put(`/loans/${id}/approve`, payload),
  reject:      (id, payload) => api.put(`/loans/${id}/reject`, payload),
  getSchedule: id            => api.get(`/loans/${id}/schedule`),
  calculateEMI:payload       => api.post('/loans/calculate-emi', payload),
  getTypes:    ()            => api.get('/loans/types'),
}

export const analyticsAPI = {
  getDashboard:       ()      => api.get('/analytics/dashboard'),
  getPayrollTrend:    params  => api.get('/analytics/payroll-trend', { params }),
  getExpenseBreakdown:params  => api.get('/analytics/expense-breakdown', { params }),
  getTaxSummary:      params  => api.get('/analytics/tax-summary', { params }),
  getBudgetReport:    params  => api.get('/analytics/budget', { params }),
  getHeadcountTrend:  params  => api.get('/analytics/headcount', { params }),
}

export const complianceAPI = {
  getTDSReport:  params      => api.get('/compliance/tds', { params }),
  getForm16:     employeeId  => api.get(`/compliance/form16/${employeeId}`, { responseType: 'blob' }),
  getAuditLogs:  params      => api.get('/compliance/audit-logs', { params }),
  getDeadlines:  ()          => api.get('/compliance/deadlines'),
}

export const notificationAPI = {
  getAll:         ()      => api.get('/notifications'),
  markRead:       id      => api.put(`/notifications/${id}/read`),
  markAllRead:    ()      => api.put('/notifications/read-all'),
  getSettings:    ()      => api.get('/notifications/settings'),
  updateSettings: payload => api.put('/notifications/settings', payload),
}

export default api