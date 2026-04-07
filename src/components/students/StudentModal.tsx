import { useState } from 'react'
import { useCreateStudent, useUpdateStudent } from '@/queries/useStudents'
import type { Student } from '@/types'

interface Props {
  student: Student | null
  onClose: () => void
}

export default function StudentModal({ student, onClose }: Props) {
  const [form, setForm] = useState<Omit<Student, 'id'>>({
    name: student?.name ?? '',
    subject: student?.subject ?? '',
    grade: student?.grade ?? '',
    status: student?.status ?? 'active',
    priority: student?.priority ?? false,
    phone: student?.phone ?? '',
    notes: student?.notes ?? '',
    createdAt: student?.createdAt ?? new Date().toISOString(),
  })

  const createStudent = useCreateStudent()
  const updateStudent = useUpdateStudent()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (student?.id) {
      updateStudent.mutate({ ...form, id: student.id }, { onSuccess: onClose })
    } else {
      createStudent.mutate(form, { onSuccess: onClose })
    }
  }

  const isValid = form.name.trim() && form.subject.trim()

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-(--text-1) font-bold text-lg">
            {student ? 'Editează student' : 'Student nou'}
          </h2>
          <button onClick={onClose} className="text-(--text-3) hover:text-(--text-1) transition-colors text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nume complet</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="ex. Alexandru Ciobanu"
              className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm placeholder-gray-600 focus:outline-none focus:border-lime-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Materie</label>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="ex. Matematică"
                className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm placeholder-gray-600 focus:outline-none focus:border-lime-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Clasă</label>
              <input
                name="grade"
                value={form.grade}
                onChange={handleChange}
                placeholder="ex. clasa 9"
                className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm placeholder-gray-600 focus:outline-none focus:border-lime-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Telefon</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="ex. +373 69 000 000"
              className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm placeholder-gray-600 focus:outline-none focus:border-lime-400 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm focus:outline-none focus:border-lime-400 transition-colors"
              >
                <option value="active">Activ</option>
                <option value="inactive">Inactiv</option>
              </select>
            </div>
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="priority"
                  checked={form.priority}
                  onChange={handleChange}
                  className="w-4 h-4 accent-lime-400"
                />
                <span className="text-sm text-gray-400">Prioritar</span>
              </label>
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
              className="w-full bg-(--bg-input) border border-(--border) rounded-lg px-3 py-2.5 text-(--text-1) text-sm placeholder-gray-600 focus:outline-none focus:border-lime-400 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-(--bg-input) text-gray-400 font-medium rounded-lg py-2.5 text-sm hover:bg-gray-700 transition-colors"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="flex-1 bg-lime-400 text-gray-950 font-semibold rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {student ? 'Salvează' : 'Adaugă'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
