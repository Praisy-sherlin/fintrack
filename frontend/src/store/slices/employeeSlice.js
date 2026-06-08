import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { employeeAPI } from '../../services/api'

export const fetchEmployees = createAsyncThunk('employees/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await employeeAPI.getAll(params)
    return data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const createEmployee = createAsyncThunk('employees/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await employeeAPI.create(payload)
    return data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const updateEmployee = createAsyncThunk('employees/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await employeeAPI.update(id, payload)
    return data
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const deleteEmployee = createAsyncThunk('employees/delete', async (id, { rejectWithValue }) => {
  try {
    await employeeAPI.delete(id)
    return id
  } catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const employeeSlice = createSlice({
  name: 'employees',
  initialState: {
    list: [],
    total: 0,
    page: 0,
    loading: false,
    error: null,
    selected: null,
  },
  reducers: {
    setSelected(state, { payload }) { state.selected = payload },
  },
  extraReducers: b => {
    b.addCase(fetchEmployees.pending, s => { s.loading = true })
     .addCase(fetchEmployees.fulfilled, (s, { payload }) => {
       s.loading = false
       s.list = payload.content || payload
       s.total = payload.totalElements || payload.length
     })
     .addCase(fetchEmployees.rejected, (s, { payload }) => { s.loading = false; s.error = payload })
     .addCase(createEmployee.fulfilled, (s, { payload }) => { s.list.unshift(payload) })
     .addCase(updateEmployee.fulfilled, (s, { payload }) => {
       const idx = s.list.findIndex(e => e.id === payload.id)
       if (idx !== -1) s.list[idx] = payload
     })
     .addCase(deleteEmployee.fulfilled, (s, { payload }) => {
       s.list = s.list.filter(e => e.id !== payload)
     })
  }
})

export const { setSelected } = employeeSlice.actions
export default employeeSlice.reducer
