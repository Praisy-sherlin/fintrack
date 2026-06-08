import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loanAPI } from '../../services/api'

export const fetchLoans = createAsyncThunk('loans/fetchAll', async (params, { rejectWithValue }) => {
  try { const { data } = await loanAPI.getAll(params); return data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const applyLoan = createAsyncThunk('loans/apply', async (payload, { rejectWithValue }) => {
  try { const { data } = await loanAPI.apply(payload); return data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const approveLoan = createAsyncThunk('loans/approve', async ({ id, remarks }, { rejectWithValue }) => {
  try { const { data } = await loanAPI.approve(id, { remarks }); return data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const rejectLoan = createAsyncThunk('loans/reject', async ({ id, remarks }, { rejectWithValue }) => {
  try { const { data } = await loanAPI.reject(id, { remarks }); return data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const loanSlice = createSlice({
  name: 'loans',
  initialState: { list: [], total: 0, loading: false, error: null },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchLoans.pending, s => { s.loading = true })
     .addCase(fetchLoans.fulfilled, (s, { payload }) => {
       s.loading = false
       s.list = payload.content || payload
       s.total = payload.totalElements || payload.length
     })
     .addCase(fetchLoans.rejected, (s, { payload }) => { s.loading = false; s.error = payload })
     .addCase(applyLoan.fulfilled, (s, { payload }) => { s.list.unshift(payload) })
     .addCase(approveLoan.fulfilled, (s, { payload }) => {
       const idx = s.list.findIndex(l => l.id === payload.id)
       if (idx !== -1) s.list[idx] = payload
     })
     .addCase(rejectLoan.fulfilled, (s, { payload }) => {
       const idx = s.list.findIndex(l => l.id === payload.id)
       if (idx !== -1) s.list[idx] = payload
     })
  }
})

export default loanSlice.reducer
