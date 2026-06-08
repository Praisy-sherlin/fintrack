import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from '../store/slices/employeeSlice'
import { Table, StatusBadge, Avatar, Modal, SearchInput, Select, ConfirmDialog, EmptyState } from '../components/common'
import { formatCurrency, formatDate } from '../utils/helpers'
import { mockEmployees } from '../utils/mockData'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const DEPARTMENTS = ['Engineering', 'Finance', 'HR', 'Sales', 'Marketing', 'Operations']

export default function EmployeesPage() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(s => s.employees)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const employees = USE_MOCK ? mockEmployees : list

  useEffect(() => {
    if (!USE_MOCK) dispatch(fetchEmployees())
  }, [dispatch])

  const filtered = employees.filter(e => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()) || e.employeeId?.toLowerCase().includes(search.toLowerCase())
    const matchDept = !deptFilter || e.department === deptFilter
    const matchStatus = !statusFilter || e.status === statusFilter
    return matchSearch && matchDept && matchStatus
  })

  const columns = [
    {
      key: 'name', label: 'Employee',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <div>
            <p className="font-medium text-gray-800 text-sm">{val}</p>
            <p className="text-xs text-gray-400">{row.employeeId}</p>
          </div>
        </div>
      )
    },
    { key: 'email', label: 'Email', render: v => <span className="text-gray-600 text-sm">{v}</span> },
    { key: 'department', label: 'Department', render: v => <span className="text-sm">{v}</span> },
    { key: 'designation', label: 'Designation', render: v => <span className="text-sm text-gray-500">{v}</span> },
    { key: 'salary', label: 'Salary', render: v => <span className="text-sm font-mono font-medium">{formatCurrency(v)}</span> },
    { key: 'joinDate', label: 'Joined', render: v => <span className="text-xs text-gray-400">{formatDate(v, 'short')}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'id', label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1 justify-end">
          <button onClick={e => { e.stopPropagation(); openEdit(row) }}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <i className="ti ti-edit text-base" />
          </button>
          <button onClick={e => { e.stopPropagation(); setDeleteTarget(row) }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <i className="ti ti-trash text-base" />
          </button>
        </div>
      )
    },
  ]

  const openAdd = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit = (emp) => { setEditTarget(emp); setModalOpen(true) }

  const handleDelete = async () => {
    setDeleteLoading(true)
    if (!USE_MOCK) {
      const r = await dispatch(deleteEmployee(deleteTarget.id))
      if (deleteEmployee.fulfilled.match(r)) toast.success('Employee deleted')
      else toast.error('Delete failed')
    } else {
      toast.success('Employee deleted (demo)')
    }
    setDeleteLoading(false)
    setDeleteTarget(null)
  }

  // Stats
  const total = employees.length
  const active = employees.filter(e => e.status === 'ACTIVE').length
  const depts = [...new Set(employees.map(e => e.department))].length

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-800">Employees</h2>
          <p className="text-sm text-gray-400 mt-0.5">{total} total · {active} active</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <i className="ti ti-user-plus" />Add employee
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total employees', value: total, icon: 'ti-users', color: 'bg-blue-50 text-blue-600' },
          { label: 'Active', value: active, icon: 'ti-user-check', color: 'bg-green-50 text-green-600' },
          { label: 'On leave', value: employees.filter(e => e.status === 'ON_LEAVE').length, icon: 'ti-calendar-off', color: 'bg-amber-50 text-amber-600' },
          { label: 'Departments', value: depts, icon: 'ti-building', color: 'bg-purple-50 text-purple-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0', s.color)}>
              <i className={clsx('ti', s.icon)} />
            </div>
            <div>
              <p className="text-xl font-display font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email or ID..." className="flex-1" />
          <Select value={deptFilter} onChange={setDeptFilter} placeholder="All departments" className="sm:w-48"
            options={DEPARTMENTS.map(d => ({ value: d, label: d }))} />
          <Select value={statusFilter} onChange={setStatusFilter} placeholder="All statuses" className="sm:w-40"
            options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }, { value: 'ON_LEAVE', label: 'On Leave' }]} />
          {(search || deptFilter || statusFilter) && (
            <button onClick={() => { setSearch(''); setDeptFilter(''); setStatusFilter('') }}
              className="btn-secondary flex items-center gap-1 whitespace-nowrap">
              <i className="ti ti-x text-sm" />Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {filtered.length === 0 && !loading
          ? <EmptyState icon="ti-users" title="No employees found" description="Try adjusting your search or filters" />
          : <Table columns={columns} data={filtered} loading={!USE_MOCK && loading} onRowClick={openEdit} />
        }
      </div>

      {/* Add/Edit Modal */}
      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={editTarget}
        onSaved={() => { if (!USE_MOCK) dispatch(fetchEmployees()) }}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete employee"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
      />
    </div>
  )
}

function EmployeeModal({ isOpen, onClose, employee, onSaved }) {
  const dispatch = useDispatch()
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    reset(employee || { status: 'ACTIVE' })
  }, [employee, reset, isOpen])

  const onSubmit = async (data) => {
    setSaving(true)
    const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
    if (USE_MOCK) {
      toast.success(employee ? 'Employee updated (demo)' : 'Employee added (demo)')
      setSaving(false); onClose(); return
    }
    const action = employee
      ? dispatch(updateEmployee({ id: employee.id, payload: data }))
      : dispatch(createEmployee(data))
    const r = await action
    if (createEmployee.fulfilled.match(r) || updateEmployee.fulfilled.match(r)) {
      toast.success(employee ? 'Employee updated' : 'Employee added')
      onSaved(); onClose()
    } else {
      toast.error('Failed to save employee')
    }
    setSaving(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={employee ? 'Edit employee' : 'Add new employee'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
            <input className={clsx('input-field', errors.name && 'border-red-400')}
              {...register('name', { required: true })} placeholder="Arjun Kumar" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" className={clsx('input-field', errors.email && 'border-red-400')}
              {...register('email', { required: true })} placeholder="arjun@company.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input className="input-field" {...register('phone')} placeholder="9876543210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <select className={clsx('input-field', errors.department && 'border-red-400')}
              {...register('department', { required: true })}>
              <option value="">Select department</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
            <input className={clsx('input-field', errors.designation && 'border-red-400')}
              {...register('designation', { required: true })} placeholder="Software Engineer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Basic salary (₹) *</label>
            <input type="number" className={clsx('input-field', errors.salary && 'border-red-400')}
              {...register('salary', { required: true, min: 1 })} placeholder="80000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Join date</label>
            <input type="date" className="input-field" {...register('joinDate')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="input-field" {...register('status')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PAN number</label>
            <input className="input-field uppercase" {...register('pan')} placeholder="ABCDE1234F" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank account IFSC</label>
            <input className="input-field uppercase" {...register('ifsc')} placeholder="SBIN0001234" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            {saving ? <i className="ti ti-loader-2 animate-spin" /> : <i className="ti ti-check" />}
            {employee ? 'Update employee' : 'Add employee'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
