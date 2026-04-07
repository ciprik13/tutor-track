import React from 'react'
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { loadProfileFromStorage, updateProfile } from '@/store/slices/profileSlice'
import type { AppDispatch } from '@/store'
import { exchangeCodeForToken } from '@/lib/oauth'

import Layout from '@/components/ui/Layout'
import OnboardingPage from '@/pages/OnboardingPage'
import DashboardPage from '@/pages/DashboardPage'
import StudentsPage from '@/pages/StudentsPage'
import StudentDetailPage from '@/pages/StudentDetailPage'
import LessonsPage from '@/pages/LessonsPage'
import PaymentsPage from '@/pages/PaymentsPage'
import ReportsPage from '@/pages/ReportsPage'
import StatisticsPage from '@/pages/StatisticsPage'
import SettingsPage from '@/pages/SettingsPage'

function RequireProfile({ children }: { children: React.ReactNode }) {
  const hasProfile = Boolean(localStorage.getItem('tutor_profile'))
  return hasProfile ? <>{children}</> : <Navigate to="/onboarding" replace />
}

function OAuthHandler() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (code) {
      // Curăță URL-ul imediat
      window.history.replaceState({}, '', window.location.pathname)
      exchangeCodeForToken(code).then(token => {
        dispatch(updateProfile({
          googleCalendarToken: token,
          googleCalendarConnected: true,
        }))
        navigate('/settings', { replace: true })
      }).catch(err => {
        console.error('OAuth error:', err)
        navigate('/settings', { replace: true })
      })
    }
  }, [dispatch, navigate])

  return null
}

function App() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(loadProfileFromStorage())
  }, [dispatch])

  return (
    <HashRouter>
      <OAuthHandler />
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<RequireProfile><Layout><DashboardPage /></Layout></RequireProfile>} />
        <Route path="/students" element={<RequireProfile><Layout><StudentsPage /></Layout></RequireProfile>} />
        <Route path="/students/:id" element={<RequireProfile><Layout><StudentDetailPage /></Layout></RequireProfile>} />
        <Route path="/lessons" element={<RequireProfile><Layout><LessonsPage /></Layout></RequireProfile>} />
        <Route path="/payments" element={<RequireProfile><Layout><PaymentsPage /></Layout></RequireProfile>} />
        <Route path="/reports" element={<RequireProfile><Layout><ReportsPage /></Layout></RequireProfile>} />
        <Route path="/statistics" element={<RequireProfile><Layout><StatisticsPage /></Layout></RequireProfile>} />
        <Route path="/settings" element={<RequireProfile><Layout><SettingsPage /></Layout></RequireProfile>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
