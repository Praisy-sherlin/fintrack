// Mock data used when backend is not running (VITE_USE_MOCK=true)

export const mockUser = {
  id: 1,
  name: 'Arjun Kumar',
  email: 'admin@fintrack.com',
  role: 'ADMIN',
  department: 'Finance',
  employeeId: 'FT-001',
  avatar: null,
}

export const mockDashboard = {
  kpis: {
    totalPayroll: 4820000,
    payrollChange: 3.4,
    expenseClaims: 370000,
    pendingClaims: 24,
    activeLoans: 1210000,
    loanCount: 8,
    tdsDeducted: 640000,
    tdsChange: -1.1,
  },
  payrollTrend: [
    { month: 'Jan', amount: 4200000 },
    { month: 'Feb', amount: 4350000 },
    { month: 'Mar', amount: 4280000 },
    { month: 'Apr', amount: 4500000 },
    { month: 'May', amount: 4680000 },
    { month: 'Jun', amount: 4820000 },
  ],
  recentTransactions: [
    { id: 1, type: 'PAYROLL', description: 'June salary — Engineering', meta: '42 employees', date: '2026-06-05', status: 'PAID', amount: 1840000, credit: true },
    { id: 2, type: 'EXPENSE', description: 'Expense reimbursement batch', meta: 'Rajesh M, Priya S +5', date: '2026-06-04', status: 'PROCESSING', amount: 47200, credit: false },
    { id: 3, type: 'LOAN', description: 'Loan disbursement — Personal', meta: 'Meena R', date: '2026-06-03', status: 'PAID', amount: 250000, credit: false },
    { id: 4, type: 'TDS', description: 'TDS remittance — May', meta: 'Income Tax Dept', date: '2026-06-01', status: 'PENDING', amount: 640000, credit: false },
    { id: 5, type: 'PAYROLL', description: 'May salary — HR & Admin', meta: '18 employees', date: '2026-05-31', status: 'PAID', amount: 980000, credit: true },
  ],
  payrollProgress: { processed: 142, total: 168, budgetUsed: 4050000, budgetTotal: 4820000, tdsCollected: 520000, tdsTotal: 640000 },
  complianceAlerts: [
    { id: 1, severity: 'high', title: 'TDS due in 3 days', description: '₹6.4L due by 09 Jun', icon: 'alert-circle' },
    { id: 2, severity: 'medium', title: 'Form 16 deadline', description: 'Issue by 15 Jun 2026', icon: 'clock' },
    { id: 3, severity: 'info', title: '24 expense claims', description: 'Awaiting your approval', icon: 'info-circle' },
  ],
}

export const mockEmployees = [
  { id: 1, employeeId: 'FT-001', name: 'Arjun Kumar', email: 'arjun@fintrack.com', department: 'Finance', designation: 'Finance Manager', status: 'ACTIVE', joinDate: '2021-03-15', salary: 120000, phone: '9876543210' },
  { id: 2, employeeId: 'FT-002', name: 'Priya Sharma', email: 'priya@fintrack.com', department: 'Engineering', designation: 'Senior Developer', status: 'ACTIVE', joinDate: '2020-07-01', salary: 145000, phone: '9876543211' },
  { id: 3, employeeId: 'FT-003', name: 'Rajesh Mehta', email: 'rajesh@fintrack.com', department: 'HR', designation: 'HR Manager', status: 'ACTIVE', joinDate: '2019-11-20', salary: 110000, phone: '9876543212' },
  { id: 4, employeeId: 'FT-004', name: 'Meena Reddy', email: 'meena@fintrack.com', department: 'Engineering', designation: 'DevOps Engineer', status: 'ACTIVE', joinDate: '2022-01-10', salary: 130000, phone: '9876543213' },
  { id: 5, employeeId: 'FT-005', name: 'Suresh Patel', email: 'suresh@fintrack.com', department: 'Sales', designation: 'Sales Executive', status: 'INACTIVE', joinDate: '2021-06-05', salary: 85000, phone: '9876543214' },
  { id: 6, employeeId: 'FT-006', name: 'Kavitha Nair', email: 'kavitha@fintrack.com', department: 'Finance', designation: 'Accountant', status: 'ACTIVE', joinDate: '2022-09-15', salary: 95000, phone: '9876543215' },
  { id: 7, employeeId: 'FT-007', name: 'Vikram Singh', email: 'vikram@fintrack.com', department: 'Engineering', designation: 'Tech Lead', status: 'ACTIVE', joinDate: '2018-04-01', salary: 180000, phone: '9876543216' },
  { id: 8, employeeId: 'FT-008', name: 'Ananya Das', email: 'ananya@fintrack.com', department: 'Marketing', designation: 'Marketing Manager', status: 'ACTIVE', joinDate: '2023-02-15', salary: 105000, phone: '9876543217' },
]

export const mockPayroll = [
  { id: 1, employeeId: 2, employeeName: 'Priya Sharma', month: 6, year: 2026, basicSalary: 145000, hra: 58000, da: 14500, grossSalary: 217500, pf: 17400, tds: 21750, netSalary: 178350, status: 'PAID', processedDate: '2026-06-05' },
  { id: 2, employeeId: 7, employeeName: 'Vikram Singh', month: 6, year: 2026, basicSalary: 180000, hra: 72000, da: 18000, grossSalary: 270000, pf: 21600, tds: 27000, netSalary: 221400, status: 'PENDING', processedDate: null },
  { id: 3, employeeId: 4, employeeName: 'Meena Reddy', month: 6, year: 2026, basicSalary: 130000, hra: 52000, da: 13000, grossSalary: 195000, pf: 15600, tds: 19500, netSalary: 159900, status: 'PAID', processedDate: '2026-06-05' },
  { id: 4, employeeId: 3, employeeName: 'Rajesh Mehta', month: 6, year: 2026, basicSalary: 110000, hra: 44000, da: 11000, grossSalary: 165000, pf: 13200, tds: 16500, netSalary: 135300, status: 'PROCESSING', processedDate: null },
]

export const mockExpenses = [
  { id: 1, employeeName: 'Priya Sharma', category: 'Travel', description: 'Client visit to Mumbai — flight + hotel', amount: 18500, receiptUrl: null, submittedDate: '2026-06-01', status: 'PENDING', remarks: null },
  { id: 2, employeeName: 'Rajesh Mehta', category: 'Office Supplies', description: 'Printer cartridges and stationery', amount: 3200, receiptUrl: null, submittedDate: '2026-05-30', status: 'APPROVED', remarks: 'Approved by manager' },
  { id: 3, employeeName: 'Meena Reddy', category: 'Training', description: 'AWS certification course fee', amount: 12000, receiptUrl: null, submittedDate: '2026-05-28', status: 'PENDING', remarks: null },
  { id: 4, employeeName: 'Vikram Singh', category: 'Travel', description: 'Team offsite — bus tickets', amount: 8400, receiptUrl: null, submittedDate: '2026-05-25', status: 'REJECTED', remarks: 'Exceeds category budget' },
  { id: 5, employeeName: 'Kavitha Nair', category: 'Meals', description: 'Client dinner — finance review', amount: 4600, receiptUrl: null, submittedDate: '2026-06-03', status: 'APPROVED', remarks: null },
]

export const mockLoans = [
  { id: 1, employeeName: 'Meena Reddy', type: 'Personal', amount: 250000, tenureMonths: 24, interestRate: 8.5, emiAmount: 11329, disbursedDate: '2026-06-03', status: 'ACTIVE', paidInstallments: 0, remainingAmount: 250000 },
  { id: 2, employeeName: 'Suresh Patel', type: 'Emergency', amount: 50000, tenureMonths: 6, interestRate: 6.0, emiAmount: 8560, disbursedDate: '2026-04-10', status: 'ACTIVE', paidInstallments: 2, remainingAmount: 32880 },
  { id: 3, employeeName: 'Rajesh Mehta', type: 'Education', amount: 500000, tenureMonths: 48, interestRate: 7.5, emiAmount: 12123, disbursedDate: '2025-12-01', status: 'ACTIVE', paidInstallments: 6, remainingAmount: 427262 },
  { id: 4, employeeName: 'Priya Sharma', type: 'Vehicle', amount: 800000, tenureMonths: 60, interestRate: 9.0, emiAmount: 16612, disbursedDate: '2025-01-15', status: 'CLOSED', paidInstallments: 60, remainingAmount: 0 },
]

export const mockNotifications = [
  { id: 1, title: 'TDS due in 3 days', body: 'Income tax TDS payment of ₹6,40,000 is due on 09 Jun 2026', type: 'COMPLIANCE', read: false, createdAt: '2026-06-06T08:00:00Z' },
  { id: 2, title: 'Payroll approved', body: 'June payroll for Engineering department has been approved', type: 'PAYROLL', read: false, createdAt: '2026-06-05T14:30:00Z' },
  { id: 3, title: 'Expense claim submitted', body: 'Priya Sharma submitted a travel expense of ₹18,500', type: 'EXPENSE', read: false, createdAt: '2026-06-04T10:15:00Z' },
  { id: 4, title: 'Loan disbursed', body: 'Personal loan of ₹2,50,000 disbursed to Meena Reddy', type: 'LOAN', read: true, createdAt: '2026-06-03T16:45:00Z' },
  { id: 5, title: 'Form 16 reminder', body: 'Form 16 for FY 2025-26 must be issued by 15 Jun 2026', type: 'COMPLIANCE', read: true, createdAt: '2026-06-02T09:00:00Z' },
  { id: 6, title: 'New employee onboarded', body: 'Ananya Das has been added to the payroll system', type: 'EMPLOYEE', read: true, createdAt: '2026-06-01T11:00:00Z' },
]
