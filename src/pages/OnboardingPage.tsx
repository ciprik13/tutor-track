import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from '@/store/slices/profileSlice'
import type { AppDispatch } from '@/store'

export default function OnboardingPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    defaultPrice60: 200,
    defaultPrice90: 300,
    defaultPrice120: 400,
    currency: 'MDL' as 'MDL' | 'USD' | 'EUR',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: ['defaultPrice60', 'defaultPrice90', 'defaultPrice120'].includes(name)
        ? Number(value)
        : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(updateProfile({
      ...form,
      googleCalendarToken: null,
      googleCalendarConnected: false,
    }))
    navigate('/dashboard')
  }

  const isValid = form.name.trim() && form.email.trim() && form.phone.trim()

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Tutor<span className="text-lime-400">Track</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Configurează profilul tău pentru a începe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Date personale
            </h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nume complet</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="ex. Maria Andrei"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-lime-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ex. maria@email.com"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-lime-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Telefon</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="ex. +373 69 000 000"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-lime-400 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Prețuri implicite
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {([60, 90, 120] as const).map(min => (
                <div key={min}>
                  <label className="block text-sm text-gray-400 mb-1">{min} min</label>
                  <input
                    name={`defaultPrice${min}`}
                    type="number"
                    value={form[`defaultPrice${min}` as keyof typeof form]}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Monedă
            </h2>
            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400 transition-colors"
            >
              <option value="MDL">MDL — Leu moldovenesc</option>
              <option value="USD">USD — Dolar american</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="w-full bg-lime-400 text-gray-950 font-semibold rounded-lg py-3 text-sm transition-opacity disabled:opacity-40 hover:opacity-90"
          >
            Începe →
          </button>
        </form>
      </div>
    </div>
  )
}
