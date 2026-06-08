import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { notificationAPI } from '../../services/api'

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (_, { rejectWithValue }) => {
  try { const { data } = await notificationAPI.getAll(); return data }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const markRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try { await notificationAPI.markRead(id); return id }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try { await notificationAPI.markAllRead(); return true }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { list: [], unreadCount: 0, loading: false },
  reducers: {
    addNotification(state, { payload }) {
      state.list.unshift(payload)
      if (!payload.read) state.unreadCount++
    }
  },
  extraReducers: b => {
    b.addCase(fetchNotifications.fulfilled, (s, { payload }) => {
       s.list = payload
       s.unreadCount = payload.filter(n => !n.read).length
     })
     .addCase(markRead.fulfilled, (s, { payload }) => {
       const n = s.list.find(n => n.id === payload)
       if (n && !n.read) { n.read = true; s.unreadCount = Math.max(0, s.unreadCount - 1) }
     })
     .addCase(markAllRead.fulfilled, s => {
       s.list.forEach(n => n.read = true)
       s.unreadCount = 0
     })
  }
})

export const { addNotification } = notificationSlice.actions
export default notificationSlice.reducer
