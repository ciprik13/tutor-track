import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getInitials } from '@/lib/dateUtils'
import type { RootState } from '@/store'
import { useStudents } from '@/queries/useStudents'
import { useLessons } from '@/queries/useLessons'
import { usePayments } from '@/queries/usePayments'
import { useState } from 'react'
import LessonModal from '@/components/lessons/LessonModal'

export default function DashboardPage() {
  const navigate = useNavigate()
  const profile = useSelector((state: RootState) => state.profile)
  const [lessonModal, setLessonModal] = useState(false)

  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentWeekStart = (() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() + 1)
    return d.toISOString().slice(0, 10)
  })()

  const { data: students = [] } = useStudents()
  const { data: allLessons = [] } = useLessons()
  const { data: payments = [] } = usePayments()

  const activeStudents = students.filter(s => s.status === 'active')

  const lessonsThisMonth = allLessons.filter(l =>
    l.date.startsWith(currentMonth) && l.status === 'done'
  )

  const lessonsThisWeek = allLessons.filter(l =>
    l.date.slice(0, 10) >= currentWeekStart && l.status === 'done'
  )

  const unpaidTotal = allLessons
    .filter(l => l.paymentStatus === 'unpaid' && l.status === 'done')
    .reduce((sum, l) => sum + l.pricePerSession, 0)

  const recentActivity = [...allLessons]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const getStudentName = (studentId: number) =>
    students.find(s => s.id === studentId)?.name ?? '—'

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bună dimineața'
    if (h < 18) return 'Bună ziua'
    return 'Bună seara'
  }

  return (
    <div className="min-h-full p-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-(--text-1) tracking-tight">
              {greeting()}, <span className="text-lime-400">{profile.name.split(' ')[0]}</span>
            </h1>
            <p className="text-(--text-2) text-sm mt-1">
              {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => setLessonModal(true)}
            className="bg-lime-400 text-gray-950 font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            Lecție nouă
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div
            onClick={() => navigate('/students')}
            className="bg-(--bg-card) border border-(--border) rounded-xl p-4 cursor-pointer hover:border-(--border) transition-colors"
          >
            <p className="text-(--text-2) text-xs uppercase tracking-wider mb-3">Studenți activi</p>
            <p className="text-(--text-1) font-bold text-3xl">{activeStudents.length}</p>
            <p className="text-(--text-3) text-xs mt-2">din {students.length} total</p>
          </div>

          <div
            onClick={() => navigate('/lessons')}
            className="bg-(--bg-card) border border-(--border) rounded-xl p-4 cursor-pointer hover:border-(--border) transition-colors"
          >
            <p className="text-(--text-2) text-xs uppercase tracking-wider mb-3">Lecții în{' '}
              {new Date().toLocaleDateString('ro-RO', { month: 'long' })}
            </p>
            <p className="text-(--text-1) font-bold text-3xl">{lessonsThisMonth.length}</p>
            <p className="text-(--text-3) text-xs mt-2">
              {lessonsThisMonth.reduce((s, l) => s + l.pricePerSession, 0)} {profile.currency} total
            </p>
          </div>

          <div
            onClick={() => navigate('/payments')}
            className="bg-(--bg-card) border border-(--border) rounded-xl p-4 cursor-pointer hover:border-(--border) transition-colors"
          >
            <p className="text-(--text-2) text-xs uppercase tracking-wider mb-3">Total neachitat</p>
            <p className={`font-bold text-3xl ${unpaidTotal > 0 ? 'text-amber-400' : 'text-lime-400'}`}>
              {unpaidTotal}
            </p>
            <p className="text-(--text-3) text-xs mt-2">{profile.currency}</p>
          </div>

          <div
            onClick={() => navigate('/lessons')}
            className="bg-(--bg-card) border border-(--border) rounded-xl p-4 cursor-pointer hover:border-(--border) transition-colors"
          >
            <p className="text-(--text-2) text-xs uppercase tracking-wider mb-3">Săptămâna aceasta</p>
            <p className="text-(--text-1) font-bold text-3xl">{lessonsThisWeek.length}</p>
            <p className="text-(--text-3) text-xs mt-2">lecții efectuate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-(--bg-card) border border-(--border) rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-(--border) flex items-center justify-between">
              <h2 className="text-(--text-1) font-semibold text-sm">Activitate recentă</h2>
              <button
                onClick={() => navigate('/lessons')}
                className="text-lime-400 text-xs hover:underline"
              >
                Vezi toate →
              </button>
            </div>
            {recentActivity.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-(--text-3) text-sm">Nicio activitate încă</p>
                <button
                  onClick={() => setLessonModal(true)}
                  className="mt-3 text-lime-400 text-xs hover:underline"
                >
                  Adaugă prima lecție →
                </button>
              </div>
            ) : (
              <div>
                {recentActivity.map(lesson => (
                  <div
                    key={lesson.id}
                    onClick={() => navigate(`/students/${lesson.studentId}`)}
                    className="px-5 py-3.5 border-b border-(--border) last:border-0 flex items-center justify-between cursor-pointer hover:bg-(--bg-input)/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        lesson.paymentStatus === 'paid' ? 'bg-lime-400' : 'bg-amber-400'
                      }`} />
                      <div>
                        <p className="text-(--text-1) text-sm font-medium">{getStudentName(lesson.studentId)}</p>
                        <p className="text-(--text-2) text-xs mt-0.5">
                          {formatDate(lesson.date)} · {lesson.durationMinutes} min
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-(--text-1) text-sm font-bold">{lesson.pricePerSession} {profile.currency}</p>
                      <p className={`text-xs mt-0.5 ${
                        lesson.paymentStatus === 'paid' ? 'text-lime-400' : 'text-amber-400'
                      }`}>
                        {lesson.paymentStatus === 'paid' ? 'Achitat' : 'Neachitat'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-(--bg-card) border border-(--border) rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-(--border) flex items-center justify-between">
              <h2 className="text-(--text-1) font-semibold text-sm">Studenți activi</h2>
              <button
                onClick={() => navigate('/students')}
                className="text-lime-400 text-xs hover:underline"
              >
                Vezi toți →
              </button>
            </div>
            {activeStudents.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-(--text-3) text-sm">Niciun student activ</p>
                <button
                  onClick={() => navigate('/students')}
                  className="mt-3 text-lime-400 text-xs hover:underline"
                >
                  Adaugă primul student →
                </button>
              </div>
            ) : (
              <div>
                {activeStudents.slice(0, 5).map(student => {
                  const studentLessons = allLessons.filter(l =>
                    l.studentId === student.id &&
                    l.date.startsWith(currentMonth) &&
                    l.status === 'done'
                  )
                  const studentUnpaid = studentLessons
                    .filter(l => l.paymentStatus === 'unpaid')
                    .reduce((s, l) => s + l.pricePerSession, 0)

                  return (
                    <div
                      key={student.id}
                      onClick={() => navigate(`/students/${student.id}`)}
                      className="px-5 py-3.5 border-b border-(--border) last:border-0 flex items-center justify-between cursor-pointer hover:bg-(--bg-input)/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-(--bg-input) flex items-center justify-center text-xs font-bold text-lime-400">
                          {getInitials(student.name)}
                        </div>
                        <div>
                          <p className="text-(--text-1) text-sm font-medium">{student.name}</p>
                          <p className="text-(--text-2) text-xs mt-0.5">{student.subject} · {studentLessons.length} lecții luna aceasta</p>
                        </div>
                      </div>
                      {studentUnpaid > 0 && (
                        <span className="text-xs bg-amber-400/10 text-amber-400 px-2 py-1 rounded-lg font-medium">
                          {studentUnpaid} {profile.currency}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {lessonModal && (
        <LessonModal
          lesson={null}
          onClose={() => setLessonModal(false)}
        />
      )}
    </div>
  )
}
