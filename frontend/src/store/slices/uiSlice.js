import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    activeModal: null,
    modalData: null,
    theme: 'light',
  },
  reducers: {
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen },
    setSidebarOpen(state, { payload }) { state.sidebarOpen = payload },
    openModal(state, { payload }) {
      state.activeModal = payload.modal
      state.modalData = payload.data || null
    },
    closeModal(state) { state.activeModal = null; state.modalData = null },
    toggleTheme(state) { state.theme = state.theme === 'light' ? 'dark' : 'light' },
  }
})

export const { toggleSidebar, setSidebarOpen, openModal, closeModal, toggleTheme } = uiSlice.actions
export default uiSlice.reducer
