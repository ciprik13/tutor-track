import { useState } from 'react'
import { useCreateLesson, useUpdateLesson } from '@/queries/useLessons'
import { useStudents } from '@/queries/useStudents'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import type { Lesson } from '@/types'

interface Props {
  lesson: Lesson | null
  onClose: () => void
  preselectedStudentId?: number
}

export default function LessonModal({ lesson, onClose, preselectedStudentId }: Props) {
  const profile = useSelector((state: RootState) => state.profile)
  const { data: students = [] } = useStudents()

  const [form, setForm] = useState<Omit<Lesson, 'id'>>({
    studentId: lesson?.studentId ?? preselectedStudentId ?? (students[0]?.id ?? 0),
    title: lesson?.title ?? '',
    date: lesson?.date ?? new Date().toISOString().slice(0, 16),
    durationMinutes: lesson?.durationMinutes ?? 60,
    pricePerSession: lesson?.pricePerSession ?? profile.defaultPrice60,
    status: lesson?.status ?? 'done',
    paymentStatus: lesson?.paymentStatus ?? 'unpaid',
    googleCalendarEventId: lesson?.googleCalendarEventId ?? null,
    notes: lesson?.notes ?? '',
    createdAt: lesson?.createdAt ?? new Date().toISOString(),
  })

  const createLesson = useCreateLesson()
  const updateLesson = useUpdateLesson()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => {
      const updated = {
        ...prev,
        [name]: name === 'durationMinutes' || name === 'pricePerSession' || name === 'studentId'
          ? Number(value)
          : value,
      }
      if (name === 'durationMinutes') {
        const dur = Number(value) as 60 | 90 | 120
        updated.pricePerSession =
          dur === 60 ? profile.defaultPrice60
          : dur === 90 ? profile.defaultPrice90
          : profile.defaultPrice120
      }
      return updated
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (lesson?.id) {
      updateLesson.mutate({ ...form, id: lesson.id }, { onSuccess: onClose })
    } else {
      createLesson.mutate(form, { onSuccess: onClose })
    }
  }

  const isValid = form.studentId && form.date

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">
            {lesson ? 'Editează lecție' : 'Lecție nouă'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-white transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Student</label>
            <select
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400 transition-colors"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Data și ora</label>
            <input
              name="date"
              type="datetime-local"
              value={form.date}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Durată</label>
              <select
                name="durationMinutes"
                value={form.durationMinutes}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400 transition-colors"
              >
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
                <option value={120}>120 min</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Preț (MDL)</label>
              <input
                name="pricePerSession"
                type="number"
                value={form.pricePerSession}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status lecție</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400 transition-colors"
              >
                <option value="done">Efectuat</option>
                <option value="cancelled">Anulat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status plată</label>
              <select
                name="paymentStatus"
                value={form.paymentStatus}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400 transition-colors"
              >
                <option value="unpaid">Neachitat</option>
                <option value="paid">Achitat</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Note</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Observații opționale..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-lime-400 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 text-gray-400 font-medium rounded-lg py-2.5 text-sm hover:bg-gray-700 transition-colors"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="flex-1 bg-lime-400 text-gray-950 font-semibold rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {lesson ? 'Salvează' : 'Adaugă'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
