import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { toggleSidebar, toggleTheme } from '@/store/slices/uiSlice'
import { getInitials } from '@/lib/dateUtils'
import type { RootState, AppDispatch } from '@/store'

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="6" height="6" rx="1.5"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5"/>
      </svg>
    ),
  },
  {
    path: '/students',
    label: 'Studenți',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="5" r="3"/>
        <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
      </svg>
    ),
  },
  {
    path: '/lessons',
    label: 'Lecții',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="2" width="14" height="12" rx="1.5"/>
        <path d="M5 1v2M11 1v2M1 6h14"/>
      </svg>
    ),
  },
  {
    path: '/payments',
    label: 'Plăți',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="4" width="14" height="9" rx="1.5"/>
        <path d="M1 7h14"/>
        <path d="M4 10.5h2M10 10.5h2"/>
      </svg>
    ),
  },
  {
    path: '/reports',
    label: 'Rapoarte',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 12V5l5-3 5 3v7"/>
        <path d="M6 12V9h4v3"/>
      </svg>
    ),
  },
  {
    path: '/settings',
    label: 'Setări',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="2"/>
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/>
      </svg>
    ),
  },
]

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const profile = useSelector((state: RootState) => state.profile)
  const { theme, sidebarOpen } = useSelector((state: RootState) => state.ui)

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: theme === 'dark' ? '#0a0a0f' : '#f5f4f0',
    }}>
      <aside style={{
        width: sidebarOpen ? '220px' : '64px',
        background: theme === 'dark' ? '#111118' : '#ffffff',
        borderRight: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        flexShrink: 0,
        overflow: 'hidden',
      }}>

        <div style={{
            padding: '20px 16px 16px',
            borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '64px',
            gap: '8px',
            }}>
            {sidebarOpen && (
                <div onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', flex: 1 }}>
                <div style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    color: theme === 'dark' ? '#f0f0f2' : '#18181c',
                    letterSpacing: '-0.3px',
                }}>
                    Tutor<span style={{ color: '#c8fb57' }}>Track</span>
                </div>
                </div>
            )}
            <button
                onClick={() => dispatch(toggleTheme())}
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: theme === 'dark' ? '#5a5a6a' : '#9a9aaa',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                }}
            >
                {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="8" cy="8" r="3"/>
                    <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1 1M11.8 11.8l1 1M11.8 3.2l-1 1M3.2 11.8l1-1"/>
                </svg>
                ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M13.5 10A6 6 0 0 1 6 2.5a6 6 0 1 0 7.5 7.5z"/>
                </svg>
                )}
            </button>
            <button
                onClick={() => dispatch(toggleSidebar())}
                style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: theme === 'dark' ? '#5a5a6a' : '#9a9aaa',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                }}
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 4h10M3 8h10M3 12h10"/>
                </svg>
            </button>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path ||
              (item.path === '/students' && location.pathname.startsWith('/students'))
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: sidebarOpen ? '8px 10px' : '8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '2px',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  background: isActive ? '#c8fb57' : 'transparent',
                  color: isActive ? '#0a0a0f' : theme === 'dark' ? '#8e8e9e' : '#6a6a7a',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.12s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background =
                      theme === 'dark' ? '#1e1e27' : '#eeecea'
                    ;(e.currentTarget as HTMLElement).style.color =
                      theme === 'dark' ? '#f0f0f2' : '#18181c'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLElement).style.color =
                      theme === 'dark' ? '#8e8e9e' : '#6a6a7a'
                  }
                }}
              >
                {item.icon}
                {sidebarOpen && item.label}
              </div>
            )
          })}
        </nav>

        <div style={{
          padding: '14px 16px',
          borderTop: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: '#c8fb57',
              color: '#0a0a0f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {getInitials(profile.name)}
            </div>
            {sidebarOpen && (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: theme === 'dark' ? '#f0f0f2' : '#18181c' }}>
                  {profile.name || 'Tutor'}
                </div>
                <div style={{ fontSize: '10px', color: theme === 'dark' ? '#5a5a6a' : '#9a9aaa' }}>
                  {profile.email || ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main style={{
        flex: 1,
        overflowY: 'auto',
        background: theme === 'dark' ? '#0a0a0f' : '#f5f4f0',
        color: theme === 'dark' ? '#f0f0f2' : '#18181c',
        transition: 'background 0.3s, color 0.3s',
        }}>
        {children}
        </main>
    </div>
  )
}
