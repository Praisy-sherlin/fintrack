import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { payrollAPI } from '../../services/api'

export const fetchPayroll = createAsyncThunk('payroll/fetchAll', async (params, { rejectWithValue }) => {
  try { const { data } = await payrollAPI.getAll(params); return data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const processPayroll = createAsyncThunk('payroll/process', async (params, { rejectWithValue }) => {
  try { const { data } = await payrollAPI.process(params); return data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const approvePayroll = createAsyncThunk('payroll/approve', async (id, { rejectWithValue }) => {
  try { const { data } = await payrollAPI.approve(id); return data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const payrollSlice = createSlice({
  name: 'payroll',
  initialState: { list: [], summary: null, loading: false, processing: false, error: null },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchPayroll.pending, s => { s.loading = true })
     .addCase(fetchPayroll.fulfilled, (s, { payload }) => {
       s.loading = false
       s.list = payload.records || payload
       s.summary = payload.summary || null
     })
     .addCase(fetchPayroll.rejected, (s, { payload }) => { s.loading = false; s.error = payload })
     .addCase(processPayroll.pending, s => { s.processing = true })
     .addCase(processPayroll.fulfilled, (s, { payload }) => {
       s.processing = false
       s.list = [...payload.records, ...s.list]
       s.summary = payload.summary
     })
     .addCase(processPayroll.rejected, (s, { payload }) => { s.processing = false; s.error = payload })
     .addCase(approvePayroll.fulfilled, (s, { payload }) => {
       const idx = s.list.findIndex(r => r.id === payload.id)
       if (idx !== -1) s.list[idx] = payload
     })
  }
})

export default payrollSlice.reducer
