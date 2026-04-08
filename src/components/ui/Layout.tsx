import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { toggleSidebar, toggleTheme } from '@/store/slices/uiSlice'
import { getInitials } from '@/lib/dateUtils'
import type { RootState, AppDispatch } from '@/store'

const navItems = [
  {
    path: '/dashboard', label: 'Dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>,
  },
  {
    path: '/students', label: 'Studenți',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>,
  },
  {
    path: '/lessons', label: 'Lecții',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="2" width="14" height="12" rx="1.5"/><path d="M5 1v2M11 1v2M1 6h14"/></svg>,
  },
  {
    path: '/payments', label: 'Plăți',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="14" height="9" rx="1.5"/><path d="M1 7h14M4 10.5h2M10 10.5h2"/></svg>,
  },
  {
    path: '/reports', label: 'Rapoarte',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12V5l5-3 5 3v7"/><path d="M6 12V9h4v3"/></svg>,
  },
  {
    path: '/statistics', label: 'Statistici',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12l4-4 3 3 4-5 3 3"/><path d="M1 15h14"/></svg>,
  },
  {
    path: '/settings', label: 'Setări',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/></svg>,
  },
]

interface Props { children: React.ReactNode }

export default function Layout({ children }: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const profile = useSelector((state: RootState) => state.profile)
  const { theme, sidebarOpen } = useSelector((state: RootState) => state.ui)

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Închide drawer pe mobile când navighezi
  useEffect(() => {
    if (isMobile) setMobileOpen(false)
  }, [location.pathname, isMobile])

  const isDark = theme === 'dark'
  const c = {
    bg: isDark ? '#0f1f24' : '#f2f2f2',
    sidebar: isDark ? '#0d1c21' : '#ffffff',
    border: isDark ? 'rgba(82,171,152,0.12)' : 'rgba(43,103,119,0.12)',
    text1: isDark ? '#e8f4f6' : '#1a3a42',
    text2: isDark ? '#7aaab5' : '#5a7a82',
    text3: isDark ? '#3a6575' : '#9ab5bc',
    activeText: '#ffffff',
    activeBg: isDark ? '#52ab98' : '#2b6777',
    hoverBg: isDark ? '#1e3540' : '#e8f2f5',
  }

  const SidebarContent = () => (
    <>
      <div style={{
        padding: '16px', borderBottom: `1px solid ${c.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        minHeight: '60px', gap: '8px',
      }}>
        {(!isMobile ? sidebarOpen : true) && (
          <div onClick={() => { navigate('/dashboard'); if(isMobile) setMobileOpen(false) }}
            style={{ cursor:'pointer', flex:1 }}>
            <div style={{ fontSize:'17px', fontWeight:700, color: c.text1, letterSpacing:'-0.3px' }}>
              Tutor<span style={{ color: c.activeBg }}>Track</span>
            </div>
          </div>
        )}
        <button onClick={() => dispatch(toggleTheme())}
          style={{ background:'none', border:'none', cursor:'pointer', color: c.text3, padding:'4px', borderRadius:'6px', display:'flex', alignItems:'center' }}>
          {isDark
            ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="3"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1 1M11.8 11.8l1 1M11.8 3.2l-1 1M3.2 11.8l1-1"/></svg>
            : <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13.5 10A6 6 0 0 1 6 2.5a6 6 0 1 0 7.5 7.5z"/></svg>
          }
        </button>
        {!isMobile && (
          <button onClick={() => dispatch(toggleSidebar())}
            style={{ background:'none', border:'none', cursor:'pointer', color: c.text3, padding:'4px', borderRadius:'6px', display:'flex', alignItems:'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h10M3 8h10M3 12h10"/></svg>
          </button>
        )}
        {isMobile && (
          <button onClick={() => setMobileOpen(false)}
            style={{ background:'none', border:'none', cursor:'pointer', color: c.text3, padding:'4px', fontSize:'20px', lineHeight:1 }}>×</button>
        )}
      </div>

      <nav style={{ padding:'12px 8px', flex:1 }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path === '/students' && location.pathname.startsWith('/students'))
          const showLabel = isMobile ? true : sidebarOpen
          return (
            <div key={item.path} onClick={() => navigate(item.path)}
              style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding: showLabel ? '9px 12px' : '9px',
                borderRadius:'8px', cursor:'pointer', marginBottom:'2px',
                justifyContent: showLabel ? 'flex-start' : 'center',
                background: isActive ? c.activeBg : 'transparent',
                color: isActive ? c.activeText : c.text2,
                fontSize:'13px', fontWeight: isActive ? 600 : 400,
                transition:'all 0.12s', whiteSpace:'nowrap',
              }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = c.hoverBg; (e.currentTarget as HTMLElement).style.color = c.text1 } }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = c.text2 } }}
            >
              {item.icon}
              {showLabel && item.label}
            </div>
          )
        })}
      </nav>

      <div style={{ padding:'14px 16px', borderTop:`1px solid ${c.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{
            width:'30px', height:'30px', borderRadius:'8px',
            background: c.activeBg, color: '#ffffff',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'11px', fontWeight:700, flexShrink:0,
          }}>
            {getInitials(profile.name)}
          </div>
          {(isMobile || sidebarOpen) && (
            <div>
              <div style={{ fontSize:'12px', fontWeight:500, color: c.text1 }}>{profile.name || 'Tutor'}</div>
              <div style={{ fontSize:'10px', color: c.text3 }}>{profile.email || ''}</div>
            </div>
          )}
        </div>
      </div>
    </>
  )

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background: c.bg }}>

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{
          position:'fixed', top:0, left:0, right:0, zIndex:100,
          background: c.sidebar, borderBottom:`1px solid ${c.border}`,
          height:'56px', display:'flex', alignItems:'center',
          justifyContent:'space-between', padding:'0 16px',
        }}>
          <button onClick={() => setMobileOpen(true)}
            style={{ background:'none', border:'none', cursor:'pointer', color: c.text2, display:'flex', alignItems:'center' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 5h14M3 10h14M3 15h14"/></svg>
          </button>
          <div style={{ fontSize:'16px', fontWeight:700, color: c.text1 }}>
            Tutor<span style={{ color: c.activeBg }}>Track</span>
          </div>
          <button onClick={() => dispatch(toggleTheme())}
            style={{ background:'none', border:'none', cursor:'pointer', color: c.text3, display:'flex', alignItems:'center' }}>
            {isDark
              ? <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="3"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15"/></svg>
              : <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13.5 10A6 6 0 0 1 6 2.5a6 6 0 1 0 7.5 7.5z"/></svg>
            }
          </button>
        </div>
      )}

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:150 }}
        />
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <div style={{
          position:'fixed', top:0, left:0, bottom:0, zIndex:200,
          width:'260px', background: c.sidebar,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition:'transform 0.25s ease',
          display:'flex', flexDirection:'column',
          boxShadow: mobileOpen ? '4px 0 24px rgba(0,0,0,0.2)' : 'none',
        }}>
          <SidebarContent />
        </div>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside style={{
          width: sidebarOpen ? '220px' : '64px',
          height:'100vh', background: c.sidebar,
          borderRight:`1px solid ${c.border}`,
          display:'flex', flexDirection:'column',
          transition:'width 0.2s ease', flexShrink:0, overflow:'hidden',
        }}>
          <SidebarContent />
        </aside>
      )}

      <main style={{
        flex:1, overflowY:'auto', height:'100vh',
        background: c.bg, transition:'background 0.3s',
        paddingTop: isMobile ? '56px' : '0',
      }}>
        {children}
      </main>
    </div>
  )
}
