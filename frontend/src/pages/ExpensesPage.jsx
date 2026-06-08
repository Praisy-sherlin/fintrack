// ── ExpensesPage ──────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchExpenses, submitExpense, approveExpense, rejectExpense } from '../store/slices/expenseSlice'
import { Table, StatusBadge, Modal, SearchInput, Select, KpiCard, EmptyState } from '../components/common'
import { formatCurrency, formatDate } from '../utils/helpers'
import { mockExpenses } from '../utils/mockData'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const CATEGORIES = ['Travel', 'Meals', 'Office Supplies', 'Training', 'Equipment', 'Other']

export function ExpensesPage() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(s => s.expenses)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [claimModal, setClaimModal] = useState(false)
  const [viewClaim, setViewClaim] = useState(null)

  const claims = USE_MOCK ? mockExpenses : list

  useEffect(() => { if (!USE_MOCK) dispatch(fetchExpenses()) }, [dispatch])

  const filtered = claims.filter(c =>
    (!search || c.employeeName.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || c.status === statusFilter)
  )

  const totalPending = claims.filter(c => c.status === 'PENDING').reduce((a, c) => a + c.amount, 0)
  const totalApproved = claims.filter(c => c.status === 'APPROVED').reduce((a, c) => a + c.amount, 0)

  const columns = [
    { key: 'employeeName', label: 'Employee', render: v => <span className="font-medium text-gray-800">{v}</span> },
    { key: 'category', label: 'Category', render: v => <span className="badge-neutral">{v}</span> },
    { key: 'description', label: 'Description', render: v => <span className="text-sm text-gray-500 truncate max-w-xs block">{v}</span> },
    { key: 'amount', label: 'Amount', render: v => <span className="font-mono font-medium">{formatCurrency(v)}</span> },
    { key: 'submittedDate', label: 'Submitted', render: v => <span className="text-xs text-gray-400">{formatDate(v, 'short')}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'id', label: '', render: (_, row) => row.status === 'PENDING' ? (
        <div className="flex gap-1 justify-end">
          <button onClick={e => { e.stopPropagation(); handleApprove(row) }}
            className="px-2.5 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors font-medium">
            Approve
          </button>
          <button onClick={e => { e.stopPropagation(); handleReject(row) }}
            className="px-2.5 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium">
            Reject
          </button>
        </div>
      ) : null
    },
  ]

  const handleApprove = async (claim) => {
    if (!USE_MOCK) await dispatch(approveExpense({ id: claim.id, remarks: 'Approved' }))
    toast.success(`Expense approved for ${claim.employeeName}`)
  }

  const handleReject = async (claim) => {
    if (!USE_MOCK) await dispatch(rejectExpense({ id: claim.id, remarks: 'Rejected' }))
    toast.error(`Expense rejected for ${claim.employeeName}`)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-800">Expenses</h2>
          <p className="text-sm text-gray-400 mt-0.5">{claims.filter(c => c.status === 'PENDING').length} pending approval</p>
        </div>
        <button onClick={() => setClaimModal(true)} className="btn-primary flex items-center gap-2">
          <i className="ti ti-plus" />Submit claim
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total claims" value={claims.length} icon="ti-receipt" iconBg="bg-blue-50 text-blue-600" />
        <KpiCard label="Pending amount" value={formatCurrency(totalPending, 'INR', true)} icon="ti-clock" iconBg="bg-amber-50 text-amber-600" />
        <KpiCard label="Approved amount" value={formatCurrency(totalApproved, 'INR', true)} icon="ti-check" iconBg="bg-green-50 text-green-600" />
        <KpiCard label="Pending count" value={claims.filter(c => c.status === 'PENDING').length} icon="ti-alert-circle" iconBg="bg-red-50 text-red-600" />
      </div>

      <div className="card p-4">
        <div className="flex gap-3 mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search employee or description..." className="flex-1" />
          <Select value={statusFilter} onChange={setStatusFilter} placeholder="All statuses" className="w-44"
            options={[{ value: 'PENDING', label: 'Pending' }, { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Rejected' }]} />
        </div>
        <Table columns={columns} data={filtered} loading={!USE_MOCK && loading} onRowClick={setViewClaim} emptyMessage="No expense claims found" />
      </div>

      <SubmitExpenseModal isOpen={claimModal} onClose={() => setClaimModal(false)} />
    </div>
  )
}

function SubmitExpenseModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [saving, setSaving] = useState(false)

  const onSubmit = async (data) => {
    setSaving(true)
    if (!USE_MOCK) {
      const r = await dispatch(submitExpense(data))
      if (submitExpense.fulfilled.match(r)) { toast.success('Expense claim submitted'); reset(); onClose() }
      else toast.error('Failed to submit')
    } else {
      toast.success('Expense claim submitted (demo)')
      reset(); onClose()
    }
    setSaving(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit expense claim" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select className={clsx('input-field', errors.category && 'border-red-400')} {...register('category', { required: true })}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
            <input type="number" className={clsx('input-field', errors.amount && 'border-red-400')}
              {...register('amount', { required: true, min: 1 })} placeholder="5000" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea rows={3} className={clsx('input-field resize-none', errors.description && 'border-red-400')}
            {...register('description', { required: true })} placeholder="Brief description of the expense..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Receipt (optional)</label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gray-300 transition-colors">
            <i className="ti ti-upload text-2xl text-gray-300 block mb-1" />
            <p className="text-sm text-gray-400">Click to upload receipt</p>
            <p className="text-xs text-gray-300 mt-0.5">PDF, PNG, JPG up to 5MB</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            {saving ? <i className="ti ti-loader-2 animate-spin" /> : <i className="ti ti-send" />}
            Submit claim
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ExpensesPage
