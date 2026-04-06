import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { loadProfileFromStorage } from '@/store/slices/profileSlice'
import type { AppDispatch } from '@/store'

import OnboardingPage from '@/pages/OnboardingPage'
import DashboardPage from '@/pages/DashboardPage'
import StudentsPage from '@/pages/StudentsPage'
import StudentDetailPage from '@/pages/StudentDetailPage'
import LessonsPage from '@/pages/LessonsPage'
import PaymentsPage from '@/pages/PaymentsPage'
import ReportsPage from '@/pages/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'

function RequireProfile({ children }: { children: React.ReactNode }) {
  const hasProfile = Boolean(localStorage.getItem('tutor_profile'))
  return hasProfile ? <>{children}</> : <Navigate to="/onboarding" replace />
}

function App() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(loadProfileFromStorage())
  }, [dispatch])

  return (
    <HashRouter>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<RequireProfile><DashboardPage /></RequireProfile>} />
        <Route path="/students" element={<RequireProfile><StudentsPage /></RequireProfile>} />
        <Route path="/students/:id" element={<RequireProfile><StudentDetailPage /></RequireProfile>} />
        <Route path="/lessons" element={<RequireProfile><LessonsPage /></RequireProfile>} />
        <Route path="/payments" element={<RequireProfile><PaymentsPage /></RequireProfile>} />
        <Route path="/reports" element={<RequireProfile><ReportsPage /></RequireProfile>} />
        <Route path="/settings" element={<RequireProfile><SettingsPage /></RequireProfile>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
