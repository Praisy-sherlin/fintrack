// ─── Dashboard Slice ─────────────────────────────────────────────────────────
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { analyticsAPI } from '../../services/api'

export const fetchDashboard = createAsyncThunk('dashboard/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await analyticsAPI.getDashboard()
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchDashboard.pending, s => { s.loading = true })
     .addCase(fetchDashboard.fulfilled, (s, { payload }) => { s.loading = false; s.data = payload })
     .addCase(fetchDashboard.rejected, (s, { payload }) => { s.loading = false; s.error = payload })
  }
})
export default dashboardSlice.reducer
