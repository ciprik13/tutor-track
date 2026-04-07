import { useState } from 'react'
import { useLessons, useDeleteLesson, useTogglePayment } from '@/queries/useLessons'
import { useStudents } from '@/queries/useStudents'
import LessonModal from '@/components/lessons/LessonModal'
import type { Lesson } from '@/types'

export default function LessonsPage() {
  const [studentFilter, setStudentFilter] = useState<number | undefined>()
  const [monthFilter, setMonthFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<'paid' | 'unpaid' | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editLesson, setEditLesson] = useState<Lesson | null>(null)

  const { data: lessons = [], isLoading } = useLessons({
    studentId: studentFilter,
    month: monthFilter || undefined,
    paymentStatus: paymentFilter,
  })

  const { data: students = [] } = useStudents()
  const deleteLesson = useDeleteLesson()
  const togglePayment = useTogglePayment()

  const handleEdit = (lesson: Lesson) => {
    setEditLesson(lesson)
    setModalOpen(true)
  }

  const handleAdd = () => {
    setEditLesson(null)
    setModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Sigur vrei să ștergi această lecție?')) {
      deleteLesson.mutate(id)
    }
  }

  const handleToggle = (lesson: Lesson) => {
    togglePayment.mutate({
      id: lesson.id!,
      paymentStatus: lesson.paymentStatus === 'paid' ? 'unpaid' : 'paid',
    })
  }

  const getStudentName = (studentId: number) =>
    students.find(s => s.id === studentId)?.name ?? '—'

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ro-RO', {
      day: 'numeric', month: 'short', year: 'numeric',
    })

  return (
    <div className="min-h-full p-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold [color:var(--text-1)] tracking-tight">Lecții</h1>
            <p className="[color:var(--text-2)] text-sm mt-1">{lessons.length} lecții</p>
          </div>
          <button
            onClick={handleAdd}
            className="bg-lime-400 text-gray-950 font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity"
          >
            + Adaugă lecție
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={studentFilter ?? ''}
            onChange={e => setStudentFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="[background:var(--bg-card)] border [border-color:var(--border)] rounded-lg px-3 py-2 text-sm [color:var(--text-1)] focus:outline-none focus:border-lime-400 transition-colors"
          >
            <option value="">Toți studenții</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <input
            type="month"
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
            className="[background:var(--bg-card)] border [border-color:var(--border)] rounded-lg px-3 py-2 text-sm [color:var(--text-1)] focus:outline-none focus:border-lime-400 transition-colors"
          />

          <div className="flex gap-2">
            {([undefined, 'paid', 'unpaid'] as const).map(p => (
              <button
                key={p ?? 'all'}
                onClick={() => setPaymentFilter(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  paymentFilter === p
                    ? 'bg-lime-400 text-gray-950'
                    : '[background:var(--bg-card)] text-gray-400 border [border-color:var(--border)] hover:border-gray-600'
                }`}
              >
                {p === undefined ? 'Toate' : p === 'paid' ? 'Achitate' : 'Neachitate'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="[color:var(--text-2)] text-sm">Se încarcă...</p>
        ) : lessons.length === 0 ? (
          <div className="text-center py-16">
            <p className="[color:var(--text-3)] text-sm">Nicio lecție găsită</p>
            <button onClick={handleAdd} className="mt-4 text-lime-400 text-sm hover:underline">
              Adaugă prima lecție →
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {lessons.map(lesson => (
              <div
                key={lesson.id}
                className="[background:var(--bg-card)] border [border-color:var(--border)] rounded-xl p-4 flex items-center justify-between hover:[border-color:var(--border)] transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-center min-w-12">
                    <p className="[color:var(--text-1)] font-bold text-lg leading-none">
                      {new Date(lesson.date).getDate()}
                    </p>
                    <p className="[color:var(--text-2)] text-xs mt-0.5">
                      {new Date(lesson.date).toLocaleDateString('ro-RO', { month: 'short' })}
                    </p>
                  </div>

                  <div className="w-px h-10 [background:var(--bg-input)]" />

                  <div className="flex-1">
                    <p className="[color:var(--text-1)] font-medium text-sm">
                      {getStudentName(lesson.studentId)}
                    </p>
                    <p className="[color:var(--text-2)] text-xs mt-0.5">
                      {formatDate(lesson.date)} · {lesson.durationMinutes} min · {lesson.pricePerSession} {' '}
                      <span className="[color:var(--text-3)]">MDL</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(lesson)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      lesson.paymentStatus === 'paid'
                        ? 'bg-lime-400/10 text-lime-400 hover:bg-lime-400/20'
                        : 'bg-amber-400/10 text-amber-400 hover:bg-amber-400/20'
                    }`}
                  >
                    {lesson.paymentStatus === 'paid' ? 'Achitat' : 'Neachitat'}
                  </button>

                  <span className={`text-xs px-2.5 py-1 rounded-full ${
                    lesson.status === 'done'
                      ? '[background:var(--bg-input)] text-gray-400'
                      : 'bg-red-400/10 text-red-400'
                  }`}>
                    {lesson.status === 'done' ? 'Efectuat' : 'Anulat'}
                  </span>

                  <button
                    onClick={() => handleEdit(lesson)}
                    className="[color:var(--text-3)] hover:[color:var(--text-1)] text-xs transition-colors px-2 py-1"
                  >
                    Editează
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id!)}
                    className="[color:var(--text-3)] hover:text-red-400 text-xs transition-colors px-2 py-1"
                  >
                    Șterge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <LessonModal
          lesson={editLesson}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
