import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
}

const initialState: UiState = {
  theme: (localStorage.getItem('theme') as 'light' | 'dark') ?? 'dark',
  sidebarOpen: true,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', state.theme)
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
      localStorage.setItem('theme', state.theme)
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
  },
})

export const { toggleTheme, setTheme, toggleSidebar } = uiSlice.actions
export default uiSlice.reducer