import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile, clearProfile } from '@/store/slices/profileSlice'
import { toggleTheme } from '@/store/slices/uiSlice'
import type { RootState, AppDispatch } from '@/store'
import { useNavigate } from 'react-router-dom'
import db from '@/db'
import { startGoogleAuth } from '@/lib/oauth'

export default function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const profile = useSelector((state: RootState) => state.profile)
  const theme = useSelector((state: RootState) => state.ui.theme)

  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    defaultPrice60: profile.defaultPrice60,
    defaultPrice90: profile.defaultPrice90,
    defaultPrice120: profile.defaultPrice120,
    currency: profile.currency,
  })
  const [saved, setSaved] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: ['defaultPrice60', 'defaultPrice90', 'defaultPrice120'].includes(name)
        ? Number(value)
        : value,
    }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(updateProfile(form))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = async () => {
    const students = await db.students.toArray()
    const lessons = await db.lessons.toArray()
    const payments = await db.payments.toArray()
    const data = { profile, students, lessons, payments, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tutor-track-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data.students) await db.students.bulkPut(data.students)
        if (data.lessons) await db.lessons.bulkPut(data.lessons)
        if (data.payments) await db.payments.bulkPut(data.payments)
        if (data.profile) dispatch(updateProfile(data.profile))
        alert('Date importate cu succes!')
      } catch {
        alert('Fișier invalid!')
      }
    }
    reader.readAsText(file)
  }

  const handleClearAll = async () => {
    if (!confirm('Sigur vrei să ștergi TOATE datele? Această acțiune nu poate fi anulată!')) return
    if (!confirm('Ești absolut sigur? Toate lecțiile, studenții și plățile vor fi șterse!')) return
    await db.students.clear()
    await db.lessons.clear()
    await db.payments.clear()
    dispatch(clearProfile())
    navigate('/onboarding')
  }

  return (
    <div className="min-h-full p-4 md:p-6">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-(--text-1) tracking-tight">Setări</h1>
          <p className="text-(--text-2) text-sm mt-1">Gestionează profilul și preferințele</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-(--bg-card) border border-(--border) rounded-xl p-5">
            <h2 className="text-(--text-1) font-semibold text-sm mb-4 uppercase tracking-wider">
              Profil tutor
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-(--text-2) mb-1">Nume complet</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm focus:outline-none focus:border-[#2b6777] transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-(--text-2) mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm focus:outline-none focus:border-[#2b6777] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-(--text-2) mb-1">Telefon</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm focus:outline-none focus:border-[#2b6777] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-(--bg-card) border border-(--border) rounded-xl p-5">
            <h2 className="text-(--text-1) font-semibold text-sm mb-4 uppercase tracking-wider">
              Prețuri implicite
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {([60, 90, 120] as const).map(min => (
                <div key={min}>
                  <label className="block text-sm text-(--text-2) mb-1">{min} min</label>
                  <input
                    name={`defaultPrice${min}`}
                    type="number"
                    value={form[`defaultPrice${min}` as keyof typeof form]}
                    onChange={handleChange}
                    className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm focus:outline-none focus:border-[#2b6777] transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm text-(--text-2) mb-1">Monedă</label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm focus:outline-none focus:border-[#2b6777] transition-colors"
              >
                <option value="MDL">MDL — Leu moldovenesc</option>
                <option value="USD">USD — Dolar american</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#2b6777] text-white font-semibold rounded-lg py-3 text-sm hover:opacity-90 transition-all"
          >
            {saved ? '✓ Salvat!' : 'Salvează modificările'}
          </button>
        </form>

        <div className="mt-6 bg-(--bg-card) border border-(--border) rounded-xl p-5">
          <h2 className="text-(--text-1) font-semibold text-sm mb-4 uppercase tracking-wider">
            Google Calendar
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-(--text-1) text-sm font-medium">
                {profile.googleCalendarConnected ? 'Calendar conectat' : 'Conectează Google Calendar'}
              </p>
              <p className="text-(--text-2) text-xs mt-0.5">
                {profile.googleCalendarConnected
                  ? 'Poți importa lecții din calendar la pagina Lecții'
                  : 'Importă lecții direct din Google Calendar'}
              </p>
            </div>
            {profile.googleCalendarConnected ? (
              <div className="flex gap-2">
                <span className="text-xs bg-[#2b6777]/10 text-[#52ab98] px-3 py-1.5 rounded-lg font-medium">
                  ✓ Conectat
                </span>
                <button
                  onClick={() => dispatch(updateProfile({
                    googleCalendarToken: null,
                    googleCalendarConnected: false,
                  }))}
                  className="text-xs bg-(--bg-input) text-(--text-2) font-medium px-3 py-1.5 rounded-lg hover:bg-(--bg-card-hover) transition-colors"
                >
                  Deconectează
                </button>
              </div>
            ) : (
              <button
                onClick={startGoogleAuth}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.31a3.68 3.68 0 0 1-1.6 2.42v2h2.6c1.52-1.4 2.4-3.46 2.4-5.88z" fill="#4285F4"/>
                  <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-2.7.75 4.79 4.79 0 0 1-4.5-3.32H.9v2.06A8 8 0 0 0 8 16z" fill="#34A853"/>
                  <path d="M3.5 9.49a4.83 4.83 0 0 1 0-3.08V4.35H.9a8 8 0 0 0 0 7.2l2.6-2.06z" fill="#FBBC05"/>
                  <path d="M8 3.18c1.23 0 2.33.42 3.2 1.25l2.4-2.4A8 8 0 0 0 .9 4.35L3.5 6.41A4.79 4.79 0 0 1 8 3.18z" fill="#EA4335"/>
                </svg>
                Conectează cu Google
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 bg-(--bg-card) border border-(--border) rounded-xl p-5">
          <h2 className="text-(--text-1) font-semibold text-sm mb-4 uppercase tracking-wider">
            Aspect
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-(--text-1) text-sm font-medium">Temă {theme === 'dark' ? 'întunecată' : 'luminoasă'}</p>
              <p className="text-(--text-2) text-xs mt-0.5">Comută între light și dark mode</p>
            </div>
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-[#2b6777]' : 'bg-gray-700'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <div className="mt-6 bg-(--bg-card) border border-(--border) rounded-xl p-5">
          <h2 className="text-(--text-1) font-semibold text-sm mb-4 uppercase tracking-wider">
            Date
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-(--text-1) text-sm font-medium">Export backup</p>
                <p className="text-(--text-2) text-xs mt-0.5">Descarcă toate datele ca JSON</p>
              </div>
              <button
                onClick={handleExport}
                className="bg-(--bg-input) text-(--text-2) font-medium rounded-lg px-4 py-2 text-sm hover:bg-(--bg-card-hover) transition-colors"
              >
                Exportă
              </button>
            </div>
            <div className="w-full h-px bg-(--border)" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-(--text-1) text-sm font-medium">Import backup</p>
                <p className="text-(--text-2) text-xs mt-0.5">Restaurează din fișier JSON</p>
              </div>
              <label className="bg-(--bg-input) text-(--text-2) font-medium rounded-lg px-4 py-2 text-sm hover:bg-(--bg-card-hover) transition-colors cursor-pointer">
                Importă
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-red-400/5 border border-red-400/20 rounded-xl p-5">
          <h2 className="text-red-400 font-semibold text-sm mb-4 uppercase tracking-wider">
            Zonă periculoasă
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-(--text-1) text-sm font-medium">Șterge toate datele</p>
              <p className="text-(--text-2) text-xs mt-0.5">Acțiune ireversibilă — șterge tot</p>
            </div>
            <button
              onClick={handleClearAll}
              className="bg-red-400/10 text-red-400 font-medium rounded-lg px-4 py-2 text-sm hover:bg-red-400/20 transition-colors"
            >
              Șterge tot
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
