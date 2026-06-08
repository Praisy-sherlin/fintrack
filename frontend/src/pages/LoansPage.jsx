import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLoans, applyLoan, approveLoan, rejectLoan } from '../store/slices/loanSlice'
import { Table, StatusBadge, Modal, SearchInput, KpiCard } from '../components/common'
import { formatCurrency, formatDate, calculateEMI } from '../utils/helpers'
import { mockLoans } from '../utils/mockData'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const LOAN_TYPES = ['Personal', 'Emergency', 'Vehicle', 'Education', 'Home']

export default function LoansPage() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(s => s.loans)
  const [search, setSearch] = useState('')
  const [applyModal, setApplyModal] = useState(false)
  const [viewLoan, setViewLoan] = useState(null)

  const loans = USE_MOCK ? mockLoans : list

  useEffect(() => { if (!USE_MOCK) dispatch(fetchLoans()) }, [dispatch])

  const filtered = loans.filter(l =>
    !search || l.employeeName.toLowerCase().includes(search.toLowerCase())
  )

  const totalActive = loans.filter(l => l.status === 'ACTIVE').reduce((a, l) => a + l.remainingAmount, 0)
  const totalDisbursed = loans.reduce((a, l) => a + l.amount, 0)

  const columns = [
    { key: 'employeeName', label: 'Employee', render: v => <span className="font-medium text-gray-800">{v}</span> },
    { key: 'type', label: 'Type', render: v => <span className="badge-info">{v}</span> },
    { key: 'amount', label: 'Principal', render: v => <span className="font-mono font-medium">{formatCurrency(v)}</span> },
    { key: 'emiAmount', label: 'EMI', render: v => <span className="font-mono">{formatCurrency(v)}/mo</span> },
    { key: 'interestRate', label: 'Rate', render: v => <span className="text-sm">{v}% p.a.</span> },
    { key: 'tenureMonths', label: 'Tenure', render: v => <span className="text-sm">{v} months</span> },
    { key: 'remainingAmount', label: 'Outstanding', render: v => <span className={clsx('font-mono', v > 0 ? 'text-red-600' : 'text-green-600')}>{formatCurrency(v)}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v === 'ACTIVE' ? 'ACTIVE' : v === 'CLOSED' ? 'CLOSED' : 'PENDING'} /> },
    {
      key: 'id', label: '', render: (_, row) => row.status === 'PENDING' ? (
        <div className="flex gap-1 justify-end">
          <button onClick={e => { e.stopPropagation(); handleApprove(row) }}
            className="px-2.5 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 font-medium">
            Approve
          </button>
          <button onClick={e => { e.stopPropagation(); handleReject(row) }}
            className="px-2.5 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium">
            Reject
          </button>
        </div>
      ) : <button onClick={e => { e.stopPropagation(); setViewLoan(row) }}
        className="p-1.5 text-gray-400 hover:text-navy-800 hover:bg-gray-100 rounded-lg transition-colors">
        <i className="ti ti-eye text-base" />
      </button>
    },
  ]

  const handleApprove = async (loan) => {
    if (!USE_MOCK) await dispatch(approveLoan({ id: loan.id, remarks: 'Approved by manager' }))
    toast.success(`Loan approved for ${loan.employeeName}`)
  }

  const handleReject = async (loan) => {
    if (!USE_MOCK) await dispatch(rejectLoan({ id: loan.id, remarks: 'Rejected' }))
    toast.error(`Loan rejected`)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-800">Loan Management</h2>
          <p className="text-sm text-gray-400 mt-0.5">{loans.filter(l => l.status === 'ACTIVE').length} active loans</p>
        </div>
        <button onClick={() => setApplyModal(true)} className="btn-primary flex items-center gap-2">
          <i className="ti ti-plus" />Apply for loan
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total loans" value={loans.length} icon="ti-credit-card" iconBg="bg-blue-50 text-blue-600" />
        <KpiCard label="Active outstanding" value={formatCurrency(totalActive, 'INR', true)} icon="ti-building-bank" iconBg="bg-amber-50 text-amber-600" />
        <KpiCard label="Total disbursed" value={formatCurrency(totalDisbursed, 'INR', true)} icon="ti-cash" iconBg="bg-green-50 text-green-600" />
        <KpiCard label="Closed loans" value={loans.filter(l => l.status === 'CLOSED').length} icon="ti-check-all" iconBg="bg-purple-50 text-purple-600" />
      </div>

      <div className="card p-4">
        <div className="mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search employee..." className="max-w-sm" />
        </div>
        <Table columns={columns} data={filtered} loading={!USE_MOCK && loading} onRowClick={setViewLoan} emptyMessage="No loans found" />
      </div>

      <LoanApplicationModal isOpen={applyModal} onClose={() => setApplyModal(false)} />
      {viewLoan && <LoanDetailModal loan={viewLoan} onClose={() => setViewLoan(null)} />}
    </div>
  )
}

function LoanApplicationModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({ defaultValues: { interestRate: 8.5, tenureMonths: 12 } })
  const [saving, setSaving] = useState(false)

  const principal = +watch('amount') || 0
  const rate = +watch('interestRate') || 8.5
  const tenure = +watch('tenureMonths') || 12
  const emi = calculateEMI(principal, rate, tenure)
  const totalPayable = emi * tenure
  const totalInterest = totalPayable - principal

  const onSubmit = async (data) => {
    setSaving(true)
    if (!USE_MOCK) {
      const r = await dispatch(applyLoan(data))
      if (applyLoan.fulfilled.match(r)) { toast.success('Loan application submitted'); reset(); onClose() }
      else toast.error('Failed to apply')
    } else {
      toast.success('Loan application submitted (demo)')
      reset(); onClose()
    }
    setSaving(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply for loan" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan type *</label>
            <select className={clsx('input-field', errors.type && 'border-red-400')} {...register('type', { required: true })}>
              <option value="">Select type</option>
              {LOAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Principal amount (₹) *</label>
            <input type="number" className={clsx('input-field', errors.amount && 'border-red-400')}
              {...register('amount', { required: true, min: 10000 })} placeholder="200000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest rate (% p.a.)</label>
            <input type="number" step="0.1" className="input-field" {...register('interestRate')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tenure (months)</label>
            <select className="input-field" {...register('tenureMonths')}>
              {[6, 12, 18, 24, 36, 48, 60].map(t => <option key={t} value={t}>{t} months</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose / reason *</label>
          <textarea rows={2} className={clsx('input-field resize-none', errors.purpose && 'border-red-400')}
            {...register('purpose', { required: true })} placeholder="Brief description of why you need this loan..." />
        </div>

        {/* EMI calculator */}
        {principal > 0 && (
          <div className="bg-navy-900/5 border border-navy-900/10 rounded-xl p-4">
            <p className="text-xs font-semibold text-navy-800 mb-3 uppercase tracking-wide">EMI Calculation</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xl font-display font-bold text-navy-900">{formatCurrency(emi)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Monthly EMI</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-display font-bold text-navy-900">{formatCurrency(totalInterest, 'INR', true)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total interest</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-display font-bold text-navy-900">{formatCurrency(totalPayable, 'INR', true)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total payable</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            {saving ? <i className="ti ti-loader-2 animate-spin" /> : <i className="ti ti-send" />}
            Submit application
          </button>
        </div>
      </form>
    </Modal>
  )
}

function LoanDetailModal({ loan, onClose }) {
  const paid = loan.amount - loan.remainingAmount
  const pct = Math.round((paid / loan.amount) * 100) || 0
  return (
    <Modal isOpen={!!loan} onClose={onClose} title="Loan details" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Employee', value: loan.employeeName },
            { label: 'Loan type', value: loan.type },
            { label: 'Principal', value: formatCurrency(loan.amount) },
            { label: 'Interest rate', value: `${loan.interestRate}% p.a.` },
            { label: 'Tenure', value: `${loan.tenureMonths} months` },
            { label: 'Monthly EMI', value: formatCurrency(loan.emiAmount) },
            { label: 'Disbursed date', value: formatDate(loan.disbursedDate, 'short') },
            { label: 'Installments paid', value: `${loan.paidInstallments} / ${loan.tenureMonths}` },
          ].map(r => (
            <div key={r.label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">{r.label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{r.value}</p>
            </div>
          ))}
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Repayment progress</span>
            <span className="font-semibold">{pct}% ({formatCurrency(paid, 'INR', true)} paid)</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">Outstanding: {formatCurrency(loan.remainingAmount)}</p>
        </div>
        <div className="flex justify-end">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </Modal>
  )
}
