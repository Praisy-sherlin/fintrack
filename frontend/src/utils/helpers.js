// ── Currency ────────────────────────────────────────────────────────
export const formatCurrency = (amount, currency = 'INR', compact = false) => {
  if (amount == null) return '—'
  if (compact) {
    if (Math.abs(amount) >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
    if (Math.abs(amount) >= 100000)   return `₹${(amount / 100000).toFixed(1)}L`
    if (Math.abs(amount) >= 1000)     return `₹${(amount / 1000).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ── Date ─────────────────────────────────────────────────────────────
export const formatDate = (dateStr, format = 'medium') => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const opts = {
    short:  { day: '2-digit', month: 'short', year: 'numeric' },
    medium: { day: '2-digit', month: 'long', year: 'numeric' },
    time:   { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' },
    monthYear: { month: 'long', year: 'numeric' },
  }
  return new Intl.DateTimeFormat('en-IN', opts[format]).format(date)
}

export const timeAgo = dateStr => {
  if (!dateStr) return ''
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (seconds < 60)   return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// ── Status mappings ──────────────────────────────────────────────────
export const statusConfig = {
  PAID:       { label: 'Paid',       cls: 'badge-success' },
  APPROVED:   { label: 'Approved',   cls: 'badge-success' },
  ACTIVE:     { label: 'Active',     cls: 'badge-success' },
  DISBURSED:  { label: 'Disbursed',  cls: 'badge-success' },
  PENDING:    { label: 'Pending',    cls: 'badge-warning' },
  PROCESSING: { label: 'Processing', cls: 'badge-info' },
  SUBMITTED:  { label: 'Submitted',  cls: 'badge-info' },
  REJECTED:   { label: 'Rejected',   cls: 'badge-danger' },
  OVERDUE:    { label: 'Overdue',    cls: 'badge-danger' },
  CLOSED:     { label: 'Closed',     cls: 'badge-neutral' },
  DRAFT:      { label: 'Draft',      cls: 'badge-neutral' },
}

export const getStatus = status => statusConfig[status] || { label: status, cls: 'badge-neutral' }

// ── EMI Calculator ───────────────────────────────────────────────────
export const calculateEMI = (principal, annualRate, tenureMonths) => {
  if (!principal || !annualRate || !tenureMonths) return 0
  const r = annualRate / 12 / 100
  return Math.round((principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1))
}

// ── Initials ────────────────────────────────────────────────────────
export const getInitials = name => {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

// ── Avatar colors (deterministic by name) ───────────────────────────
const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
]

export const getAvatarColor = name => {
  if (!name) return AVATAR_COLORS[0]
  const sum = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

// ── Download blob ─────────────────────────────────────────────────────
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Validation ─────────────────────────────────────────────────────
export const validators = {
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email',
  phone: v => /^[6-9]\d{9}$/.test(v) || 'Invalid phone number',
  pan:   v => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v) || 'Invalid PAN',
  ifsc:  v => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v) || 'Invalid IFSC code',
  required: v => (v !== '' && v != null) || 'This field is required',
  minAmount: min => v => Number(v) >= min || `Minimum amount is ₹${min.toLocaleString('en-IN')}`,
}

// ── Months ─────────────────────────────────────────────────────────
export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

export const getCurrentMonthYear = () => {
  const d = new Date()
  return { month: d.getMonth() + 1, year: d.getFullYear() }
}
