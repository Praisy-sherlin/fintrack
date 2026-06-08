import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { expenseAPI } from '../../services/api'

export const fetchExpenses = createAsyncThunk('expenses/fetchAll', async (params, { rejectWithValue }) => {
  try { const { data } = await expenseAPI.getAll(params); return data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const submitExpense = createAsyncThunk('expenses/submit', async (payload, { rejectWithValue }) => {
  try { const { data } = await expenseAPI.submit(payload); return data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const approveExpense = createAsyncThunk('expenses/approve', async ({ id, remarks }, { rejectWithValue }) => {
  try { const { data } = await expenseAPI.approve(id, { remarks }); return data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const rejectExpense = createAsyncThunk('expenses/reject', async ({ id, remarks }, { rejectWithValue }) => {
  try { const { data } = await expenseAPI.reject(id, { remarks }); return data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const expenseSlice = createSlice({
  name: 'expenses',
  initialState: { list: [], total: 0, loading: false, error: null },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchExpenses.pending, s => { s.loading = true })
     .addCase(fetchExpenses.fulfilled, (s, { payload }) => {
       s.loading = false
       s.list = payload.content || payload
       s.total = payload.totalElements || payload.length
     })
     .addCase(fetchExpenses.rejected, (s, { payload }) => { s.loading = false; s.error = payload })
     .addCase(submitExpense.fulfilled, (s, { payload }) => { s.list.unshift(payload) })
     .addCase(approveExpense.fulfilled, (s, { payload }) => {
       const idx = s.list.findIndex(e => e.id === payload.id)
       if (idx !== -1) s.list[idx] = payload
     })
     .addCase(rejectExpense.fulfilled, (s, { payload }) => {
       const idx = s.list.findIndex(e => e.id === payload.id)
       if (idx !== -1) s.list[idx] = payload
     })
  }
})

export default expenseSlice.reducer
