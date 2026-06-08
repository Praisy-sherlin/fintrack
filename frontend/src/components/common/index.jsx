import { useEffect } from 'react'
import { getStatus, getInitials, getAvatarColor } from '../../utils/helpers'
import clsx from 'clsx'

// ── Modal ─────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    const handler = e => e.key === 'Escape' && onClose()
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative bg-white rounded-2xl shadow-2xl w-full animate-slide-up', sizes[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <i className="ti ti-x text-lg" />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && <div className="px-6 pb-6">{footer}</div>}
      </div>
    </div>
  )
}

// ── Table ─────────────────────────────────────────────────────────────
export function Table({ columns, data, loading, emptyMessage = 'No records found', onRowClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map(col => (
              <th key={col.key} className={clsx('text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide', col.className)}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="skeleton h-4 w-full rounded" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-gray-400">
                <i className="ti ti-inbox text-3xl mb-2 block" />
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || i}
                className={clsx('border-b border-gray-50 transition-colors', onRowClick && 'cursor-pointer hover:bg-gray-50/80')}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map(col => (
                  <td key={col.key} className={clsx('px-4 py-3', col.className)}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// ── Status Badge ──────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const cfg = getStatus(status)
  return <span className={cfg.cls}>{cfg.label}</span>
}

// ── Avatar ────────────────────────────────────────────────────────────
export function Avatar({ name, size = 'md' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }
  return (
    <div className={clsx('rounded-full flex items-center justify-center font-semibold', sizes[size], getAvatarColor(name))}>
      {getInitials(name)}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────
export function Skeleton({ className }) {
  return <div className={clsx('skeleton rounded', className)} />
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────
export function EmptyState({ icon = 'ti-inbox', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <i className={clsx('ti text-3xl text-gray-400', icon)} />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────
export function KpiCard({ label, value, change, changeType, icon, iconBg, loading }) {
  if (loading) return <SkeletonCard />
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center text-lg', iconBg)}>
          <i className={clsx('ti', icon)} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-gray-800 font-display">{value}</p>
      {change && (
        <p className={clsx('text-xs mt-1.5 flex items-center gap-1', changeType === 'up' ? 'text-green-600' : changeType === 'down' ? 'text-red-500' : 'text-gray-400')}>
          {changeType === 'up' && <i className="ti ti-trending-up" />}
          {changeType === 'down' && <i className="ti ti-trending-down" />}
          {change}
        </p>
      )}
    </div>
  )
}

// ── Confirm Dialog ────────────────────────────────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
        <button
          className={danger ? 'btn-danger' : 'btn-primary'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? <i className="ti ti-loader-2 animate-spin" /> : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

// ── Search Input ──────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div className={clsx('relative', className)}>
      <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-9"
      />
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────
export function Select({ value, onChange, options, placeholder, className }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={clsx('input-field', className)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
