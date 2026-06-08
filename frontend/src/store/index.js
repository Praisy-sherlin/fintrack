import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import dashboardReducer from './slices/dashboardSlice'
import employeeReducer from './slices/employeeSlice'
import payrollReducer from './slices/payrollSlice'
import expenseReducer from './slices/expenseSlice'
import loanReducer from './slices/loanSlice'
import notificationReducer from './slices/notificationSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    employees: employeeReducer,
    payroll: payrollReducer,
    expenses: expenseReducer,
    loans: loanReducer,
    notifications: notificationReducer,
    ui: uiReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck: false }),
})
