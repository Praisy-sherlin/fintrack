import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPayroll, processPayroll, approvePayroll } from '../store/slices/payrollSlice'
import { Table, StatusBadge, Modal, SearchInput, Select, KpiCard } from '../components/common'
import { formatCurrency, formatDate, MONTHS, getCurrentMonthYear } from '../utils/helpers'
import { mockPayroll } from '../utils/mockData'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export default function PayrollPage() {
  const dispatch = useDispatch()
  const { list, summary, loading, processing } = useSelector(s => s.payroll)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [processModal, setProcessModal] = useState(false)
  const [viewRecord, setViewRecord] = useState(null)

  const records = USE_MOCK ? mockPayroll : list

  const { month, year } = getCurrentMonthYear()

  useEffect(() => {
    if (!USE_MOCK) dispatch(fetchPayroll({ month, year }))
  }, [dispatch])

  const filtered = records.filter(r => {
    const matchSearch = !search || r.employeeName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalGross = filtered.reduce((a, r) => a + (r.grossSalary || 0), 0)
  const totalNet = filtered.reduce((a, r) => a + (r.netSalary || 0), 0)
  const totalTDS = filtered.reduce((a, r) => a + (r.tds || 0), 0)
  const pending = filtered.filter(r => r.status === 'PENDING').length

  const columns = [
    { key: 'employeeName', label: 'Employee', render: v => <span className="font-medium text-gray-800">{v}</span> },
    { key: 'month', label: 'Period', render: (v, row) => <span className="text-sm text-gray-500">{MONTHS[v - 1]} {row.year}</span> },
    { key: 'basicSalary', label: 'Basic', render: v => <span className="font-mono text-sm">{formatCurrency(v)}</span> },
    { key: 'grossSalary', label: 'Gross', render: v => <span className="font-mono text-sm font-medium">{formatCurrency(v)}</span> },
    { key: 'tds', label: 'TDS', render: v => <span className="font-mono text-sm text-red-500">-{formatCurrency(v)}</span> },
    { key: 'pf', label: 'PF', render: v => <span className="font-mono text-sm text-red-500">-{formatCurrency(v)}</span> },
    { key: 'netSalary', label: 'Net pay', render: v => <span className="font-mono text-sm font-bold text-green-700">{formatCurrency(v)}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'id', label: '', render: (_, row) => (
        <div className="flex gap-1 justify-end">
          <button onClick={e => { e.stopPropagation(); setViewRecord(row) }}
            className="p-1.5 text-gray-400 hover:text-navy-800 hover:bg-gray-100 rounded-lg transition-colors">
            <i className="ti ti-eye text-base" />
          </button>
          {row.status === 'PENDING' && (
            <button onClick={async e => {
              e.stopPropagation()
              if (!USE_MOCK) await dispatch(approvePayroll(row.id))
              toast.success(`Payroll approved for ${row.employeeName}`)
            }}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <i className="ti ti-check text-base" />
            </button>
          )}
        </div>
      )
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-800">Payroll</h2>
          <p className="text-sm text-gray-400 mt-0.5">{MONTHS[month - 1]} {year} payroll cycle</p>
        </div>
        <div className="flex gap-3">
          {pending > 0 && (
            <button onClick={async () => {
              const pendingIds = records.filter(r => r.status === 'PENDING').map(r => r.id)
              if (!USE_MOCK) {
                for (const id of pendingIds) await dispatch(approvePayroll(id))
              }
              toast.success(`${pendingIds.length} payroll records approved`)
            }} className="btn-secondary flex items-center gap-2">
              <i className="ti ti-check-all" />Approve all ({pending})
            </button>
          )}
          <button onClick={() => setProcessModal(true)} className="btn-gold flex items-center gap-2">
            <i className="ti ti-send" />Run payroll
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total gross" value={formatCurrency(totalGross, 'INR', true)} icon="ti-cash" iconBg="bg-gold-50 text-gold-600" />
        <KpiCard label="Total net pay" value={formatCurrency(totalNet, 'INR', true)} icon="ti-send" iconBg="bg-green-50 text-green-600" />
        <KpiCard label="TDS deducted" value={formatCurrency(totalTDS, 'INR', true)} icon="ti-file-invoice" iconBg="bg-red-50 text-red-600" />
        <KpiCard label="Pending approvals" value={pending} icon="ti-clock" iconBg="bg-amber-50 text-amber-600" />
      </div>

      {/* Filters + table */}
      <div className="card p-4">
        <div className="flex gap-3 mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search employee..." className="flex-1" />
          <Select value={statusFilter} onChange={setStatusFilter} placeholder="All statuses" className="w-44"
            options={[{ value: 'PAID', label: 'Paid' }, { value: 'PENDING', label: 'Pending' }, { value: 'PROCESSING', label: 'Processing' }]} />
        </div>
        <Table columns={columns} data={filtered} loading={!USE_MOCK && loading} onRowClick={setViewRecord}
          emptyMessage="No payroll records for this period" />
      </div>

      {/* Process payroll modal */}
      <ProcessPayrollModal isOpen={processModal} onClose={() => setProcessModal(false)} />

      {/* Payslip view modal */}
      {viewRecord && <PayslipModal record={viewRecord} onClose={() => setViewRecord(null)} />}
    </div>
  )
}

function ProcessPayrollModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const { processing } = useSelector(s => s.payroll)
  const { month, year } = getCurrentMonthYear()
  const [form, setForm] = useState({ month, year, department: '' })

  const handleProcess = async () => {
    const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
    if (USE_MOCK) {
      toast.success('Payroll processed for all employees (demo mode)')
      onClose(); return
    }
    const r = await dispatch(processPayroll(form))
    if (processPayroll.fulfilled.match(r)) {
      toast.success('Payroll processed successfully!')
      onClose()
    } else toast.error('Failed to process payroll')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Run payroll" size="sm">
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-xs text-amber-700">
          <i className="ti ti-alert-triangle flex-shrink-0 mt-0.5" />
          This will calculate and disburse salaries for all active employees. Verify all salary structures before proceeding.
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <select className="input-field" value={form.month} onChange={e => setForm(f => ({ ...f, month: +e.target.value }))}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input type="number" className="input-field" value={form.year}
            onChange={e => setForm(f => ({ ...f, year: +e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department (optional)</label>
          <select className="input-field" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
            <option value="">All departments</option>
            {['Engineering', 'Finance', 'HR', 'Sales', 'Marketing'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-gold flex items-center gap-2" onClick={handleProcess} disabled={processing}>
            {processing ? <i className="ti ti-loader-2 animate-spin" /> : <i className="ti ti-send" />}
            Process payroll
          </button>
        </div>
      </div>
    </Modal>
  )
}

function PayslipModal({ record, onClose }) {
  const rows = [
    { label: 'Basic salary', credit: record.basicSalary },
    { label: 'HRA (40%)', credit: record.hra },
    { label: 'DA (10%)', credit: record.da },
    { label: 'Gross salary', credit: record.grossSalary, bold: true },
    { label: 'Provident Fund', debit: record.pf },
    { label: 'TDS', debit: record.tds },
    { label: 'Net salary', credit: record.netSalary, bold: true, highlight: true },
  ]
  return (
    <Modal isOpen={!!record} onClose={onClose} title="Payslip" size="sm">
      <div className="mb-4">
        <p className="text-lg font-bold text-gray-800">{record.employeeName}</p>
        <p className="text-sm text-gray-400">{MONTHS[record.month - 1]} {record.year}</p>
      </div>
      <div className="border border-gray-100 rounded-xl overflow-hidden mb-5">
        {rows.map((r, i) => (
          <div key={i} className={clsx('flex justify-between px-4 py-2.5 text-sm border-b border-gray-50 last:border-0', r.highlight && 'bg-green-50', r.bold && 'font-semibold')}>
            <span className={r.highlight ? 'text-green-700' : 'text-gray-600'}>{r.label}</span>
            <span className={r.debit ? 'text-red-500' : r.highlight ? 'text-green-700' : 'text-gray-800'}>
              {r.debit ? `-${formatCurrency(r.debit)}` : formatCurrency(r.credit)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button className="btn-secondary flex-1 flex items-center justify-center gap-2" onClick={onClose}>Close</button>
        <button className="btn-primary flex-1 flex items-center justify-center gap-2"
          onClick={() => toast.success('Payslip PDF downloaded (demo)')}>
          <i className="ti ti-download" />Download PDF
        </button>
      </div>
    </Modal>
  )
}
