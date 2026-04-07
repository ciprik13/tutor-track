import { useState, useEffect } from 'react'
import { useCreatePayment, useUpdatePayment } from '@/queries/usePayments'
import { useStudents } from '@/queries/useStudents'
import { useLessons } from '@/queries/useLessons'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import type { Payment } from '@/types'
import { toLocalISOString } from '@/lib/dateUtils'

interface Props {
  payment: Payment | null
  onClose: () => void
}

export default function PaymentModal({ payment, onClose }: Props) {
  const profile = useSelector((state: RootState) => state.profile)
  const { data: students = [] } = useStudents()

  const [amount, setAmount] = useState(payment?.amount?.toString() ?? '')
  const [form, setForm] = useState({
    studentId: payment?.studentId ?? (students[0]?.id ?? 0),
    currency: payment?.currency ?? profile.currency,
    period: payment?.period ?? new Date().toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' }),
    status: payment?.status ?? 'unpaid' as 'paid' | 'unpaid' | 'partial',
    date: payment?.date ?? toLocalISOString(new Date()).slice(0, 10),
    notes: payment?.notes ?? '',
    createdAt: payment?.createdAt ?? new Date().toISOString(),
  })

  const { data: unpaidLessons = [] } = useLessons({
    studentId: form.studentId || undefined,
    paymentStatus: 'unpaid',
    status: 'done',
  })

  const unpaidTotal = unpaidLessons.reduce((sum, l) => sum + l.pricePerSession, 0)

  useEffect(() => {
    if (!payment && form.studentId) {
      setAmount(unpaidTotal > 0 ? unpaidTotal.toString() : '')
    }
  }, [form.studentId, unpaidTotal, payment])

  const createPayment = useCreatePayment()
  const updatePayment = useUpdatePayment()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'studentId' ? Number(value) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { ...form, amount: Number(amount) }
    if (payment?.id) {
      updatePayment.mutate({ ...data, id: payment.id }, { onSuccess: onClose })
    } else {
      createPayment.mutate(data, { onSuccess: onClose })
    }
  }

  const isValid = form.studentId && Number(amount) > 0 && form.period.trim()

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-(--text-1) font-bold text-lg">
            {payment ? 'Editează plată' : 'Plată nouă'}
          </h2>
          <button onClick={onClose} className="text-(--text-3) hover:text-(--text-1) transition-colors text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-(--text-2) mb-1">Student</label>
            <select name="studentId" value={form.studentId} onChange={handleChange}
              className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm focus:outline-none focus:border-lime-400 transition-colors"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {!payment && unpaidLessons.length > 0 && (
            <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-amber-400 text-xs font-medium">{unpaidLessons.length} lecții neachitate</p>
                <p className="text-amber-300 text-sm font-bold mt-0.5">Total: {unpaidTotal} {profile.currency}</p>
              </div>
              <button type="button" onClick={() => setAmount(unpaidTotal.toString())}
                className="text-xs bg-amber-400 text-gray-950 font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
              >Folosește suma</button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-(--text-2) mb-1">Sumă</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="ex. 200" min={0}
                className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm placeholder:text-(--text-3) focus:outline-none focus:border-lime-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-(--text-2) mb-1">Monedă</label>
              <select name="currency" value={form.currency} onChange={handleChange}
                className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm focus:outline-none focus:border-lime-400 transition-colors"
              >
                <option value="MDL">MDL</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-(--text-2) mb-1">Perioadă</label>
            <input name="period" value={form.period} onChange={handleChange}
              placeholder="ex. Aprilie 2026"
              className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm placeholder:text-(--text-3) focus:outline-none focus:border-lime-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-(--text-2) mb-1">Data</label>
              <input name="date" type="date" value={form.date} onChange={handleChange}
                className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm focus:outline-none focus:border-lime-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-(--text-2) mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm focus:outline-none focus:border-lime-400 transition-colors"
              >
                <option value="unpaid">Neachitat</option>
                <option value="paid">Achitat</option>
                <option value="partial">Parțial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-(--text-2) mb-1">Note</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
              placeholder="Observații opționale..."
              className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm placeholder:text-(--text-3) focus:outline-none focus:border-lime-400 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-(--bg-input) text-(--text-2) font-medium rounded-lg py-2.5 text-sm hover:bg-(--bg-card-hover) transition-colors"
            >Anulează</button>
            <button type="submit" disabled={!isValid}
              className="flex-1 bg-lime-400 text-gray-950 font-semibold rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            >{payment ? 'Salvează' : 'Adaugă'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
