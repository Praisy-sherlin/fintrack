import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../services/api'

// ── Thunks ──────────────────────────────────────────────────────────
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.login(credentials)
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  try {
    const { refreshToken } = getState().auth
    await authAPI.logout({ refreshToken })
  } finally {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
})

export const refreshToken = createAsyncThunk('auth/refresh', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('refreshToken')
    if (!token) throw new Error('No refresh token')
    const { data } = await authAPI.refresh({ refreshToken: token })
    localStorage.setItem('accessToken', data.accessToken)
    return data
  } catch (err) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    return rejectWithValue('Session expired')
  }
})

export const getProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.getProfile()
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

// ── Helper to rehydrate from localStorage ───────────────────────────
const storedToken = localStorage.getItem('accessToken')

// ── Slice ────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: storedToken || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!storedToken,
    loading: false,
    error: null,
    requires2FA: false,
  },
  reducers: {
    clearError(state) { state.error = null },
    setRequires2FA(state, { payload }) { state.requires2FA = payload },
  },
  extraReducers: builder => {
    // Login
    builder
      .addCase(login.pending, state => { state.loading = true; state.error = null })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false
        state.isAuthenticated = true
        state.accessToken = payload.accessToken
        state.refreshToken = payload.refreshToken
        state.user = payload.user
        state.requires2FA = payload.requires2FA || false
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.loading = false
        state.error = payload
        state.isAuthenticated = false
      })

    // Logout
    builder.addCase(logout.fulfilled, state => {
      Object.assign(state, {
        user: null, accessToken: null, refreshToken: null,
        isAuthenticated: false, loading: false, error: null
      })
    })

    // Refresh
    builder.addCase(refreshToken.fulfilled, (state, { payload }) => {
      state.accessToken = payload.accessToken
      state.isAuthenticated = true
    })
    builder.addCase(refreshToken.rejected, state => {
      state.isAuthenticated = false
      state.user = null
    })

    // Profile
    builder.addCase(getProfile.fulfilled, (state, { payload }) => {
      state.user = payload
    })
  }
})

export const { clearError, setRequires2FA } = authSlice.actions
export default authSlice.reducer
