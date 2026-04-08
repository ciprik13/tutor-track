import { useState } from 'react'
import { useStudents } from '@/queries/useStudents'
import { getInitials } from '@/lib/dateUtils'
import { useLessons, useUpdateLesson } from '@/queries/useLessons'
import { useSelector } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import type { RootState } from '@/store'
import { useNavigate } from 'react-router-dom'
import MonthPicker from '@/components/ui/MonthPicker'

interface MonthSummary {
  studentId: number
  studentName: string
  month: string
  monthLabel: string
  total: number
  lessonCount: number
  paidCount: number
  unpaidCount: number
  status: 'paid' | 'unpaid' | 'partial'
}

export default function PaymentsPage() {
  const navigate = useNavigate()
  const profile = useSelector((state: RootState) => state.profile)
  const queryClient = useQueryClient()
  const updateLesson = useUpdateLesson()

  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7))
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all')

  const { data: students = [] } = useStudents()
  const { data: allLessons = [] } = useLessons({ status: 'done' })

  const summaries: MonthSummary[] = []

  students.forEach(student => {
    const studentLessons = allLessons.filter(l => l.studentId === student.id)
    const months = [...new Set(studentLessons.map(l => l.date.slice(0, 7)))]

    months.forEach(month => {
      const monthLessons = studentLessons.filter(l => l.date.startsWith(month))
      if (monthLessons.length === 0) return

      const total = monthLessons.reduce((s, l) => s + l.pricePerSession, 0)
      const paidCount = monthLessons.filter(l => l.paymentStatus === 'paid').length
      const unpaidCount = monthLessons.filter(l => l.paymentStatus === 'unpaid').length

      const status: 'paid' | 'unpaid' | 'partial' =
        paidCount === monthLessons.length ? 'paid'
        : unpaidCount === monthLessons.length ? 'unpaid'
        : 'partial'

      summaries.push({
        studentId: student.id!,
        studentName: student.name,
        month,
        monthLabel: new Date(month + '-01').toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' }),
        total,
        lessonCount: monthLessons.length,
        paidCount,
        unpaidCount,
        status,
      })
    })
  })

  summaries.sort((a, b) => b.month.localeCompare(a.month))

  const filtered = summaries.filter(s => {
    if (monthFilter && !s.month.startsWith(monthFilter)) return false
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    return true
  })

  const totalUnpaid = summaries
    .filter(s => s.status !== 'paid')
    .reduce((sum, s) => {
      const unpaidAmount = s.status === 'unpaid' ? s.total
        : s.total * (s.unpaidCount / s.lessonCount)
      return sum + unpaidAmount
    }, 0)

  const handleMarkAllPaid = async (summary: MonthSummary) => {
    const monthLessons = allLessons.filter(l =>
      l.studentId === summary.studentId &&
      l.date.startsWith(summary.month) &&
      l.paymentStatus === 'unpaid'
    )
    await Promise.all(
      monthLessons.map(l => updateLesson.mutateAsync({ ...l, paymentStatus: 'paid' }))
    )
    queryClient.invalidateQueries({ queryKey: ['lessons'] })
  }

  const handleMarkAllUnpaid = async (summary: MonthSummary) => {
    const monthLessons = allLessons.filter(l =>
      l.studentId === summary.studentId &&
      l.date.startsWith(summary.month) &&
      l.paymentStatus === 'paid'
    )
    await Promise.all(
      monthLessons.map(l => updateLesson.mutateAsync({ ...l, paymentStatus: 'unpaid' }))
    )
    queryClient.invalidateQueries({ queryKey: ['lessons'] })
  }

  return (
    <div className="min-h-full p-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-(--text-1) tracking-tight">Plăți</h1>
            <p className="text-(--text-2) text-sm mt-1">
              Sumar automat per student per lună
            </p>
          </div>
          {totalUnpaid > 0 && (
            <div className="text-right">
              <p className="text-xs text-(--text-3) uppercase tracking-wider">Total neachitat</p>
              <p className="text-2xl font-bold text-[#c07a20] mt-1">{Math.round(totalUnpaid)} {profile.currency}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <MonthPicker
            value={monthFilter}
            onChange={setMonthFilter}
          />
          <div className="flex gap-2">
            {(['all', 'unpaid', 'partial', 'paid'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-[#2b6777] text-white'
                    : 'bg-(--bg-input) text-(--text-2) border-(--border) border hover:border-(--border-hover)'
                }`}
              >
                {s === 'all' ? 'Toate' : s === 'paid' ? 'Achitate' : s === 'unpaid' ? 'Neachitate' : 'Parțiale'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-(--text-3) text-sm">Nicio plată găsită</p>
            <p className="text-(--text-3) text-xs mt-2">Adaugă lecții pentru a vedea sumarul plăților</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map(summary => (
              <div
                key={`${summary.studentId}-${summary.month}`}
                className="bg-(--bg-card) border-(--border) border rounded-xl p-4 hover:border-(--border-hover) transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-10 h-10 rounded-lg bg-(--bg-input) flex items-center justify-center text-sm font-bold text-[#52ab98] cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/students/${summary.studentId}`)}
                    >
                      {getInitials(summary.studentName)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p
                          className="text-(--text-1) font-medium text-sm cursor-pointer hover:text-[#52ab98] transition-colors"
                          onClick={() => navigate(`/students/${summary.studentId}`)}
                        >
                          {summary.studentName}
                        </p>
                        <span className="text-(--text-3) text-xs">·</span>
                        <p className="text-(--text-2) text-xs capitalize">{summary.monthLabel}</p>
                      </div>
                      <p className="text-(--text-3) text-xs mt-0.5">
                        {summary.lessonCount} lecții
                        {summary.paidCount > 0 && ` · ${summary.paidCount} achitate`}
                        {summary.unpaidCount > 0 && ` · ${summary.unpaidCount} neachitate`}
                      </p>
                    </div>

                    <div className="text-right mr-4">
                      <p className="text-(--text-1) font-bold text-lg">{summary.total} {profile.currency}</p>
                      {summary.status === 'partial' && (
                        <p className="text-xs text-[#c07a20] mt-0.5">
                          {Math.round(summary.total * summary.unpaidCount / summary.lessonCount)} neachitat
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      summary.status === 'paid'
                        ? 'bg-[#2b6777]/10 text-[#52ab98]'
                        : summary.status === 'partial'
                        ? 'bg-[#c07a20]/10 text-[#c07a20]'
                        : 'bg-red-400/10 text-red-400'
                    }`}>
                      {summary.status === 'paid' ? 'Achitat' : summary.status === 'partial' ? 'Parțial' : 'Neachitat'}
                    </span>

                    {summary.status !== 'paid' && (
                      <button
                        onClick={() => handleMarkAllPaid(summary)}
                        className="text-xs bg-[#2b6777] text-white font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Marchează achitat
                      </button>
                    )}
                    {summary.status !== 'unpaid' && (
                      <button
                        onClick={() => handleMarkAllUnpaid(summary)}
                        className="text-xs bg-(--bg-input) text-(--text-2) font-medium px-3 py-1.5 rounded-lg hover:text-(--text-1) transition-colors"
                      >
                        Anulează
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
