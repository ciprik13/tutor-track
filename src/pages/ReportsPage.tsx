import { useState } from 'react'
import { useStudents } from '@/queries/useStudents'
import { useLessons } from '@/queries/useLessons'
import { useUpdateLesson } from '@/queries/useLessons'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { useQueryClient } from '@tanstack/react-query'

export default function ReportsPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<number | undefined>()
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [copied, setCopied] = useState(false)

  const profile = useSelector((state: RootState) => state.profile)
  const { data: students = [] } = useStudents()
  const queryClient = useQueryClient()
  const updateLesson = useUpdateLesson()

  const { data: lessons = [] } = useLessons({
    studentId: selectedStudentId,
    month: selectedMonth,
    status: 'done',
  })

  const student = students.find(s => s.id === selectedStudentId)

  const grouped = lessons.reduce((acc, lesson) => {
    const key = lesson.durationMinutes
    if (!acc[key]) acc[key] = []
    acc[key].push(lesson)
    return acc
  }, {} as Record<number, typeof lessons>)

  const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString('ro-RO', {
    month: 'long', year: 'numeric',
  })

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ro-RO', {
      day: 'numeric', month: 'long',
    })

  const generateReport = () => {
    if (!student) return ''

    let index = 1
    let lines: string[] = []

    lines.push(`Salut ${student.name}. Îți trimit orarul lecțiilor de ${student.subject} din luna ${monthLabel}:`)
    lines.push('')

    lessons.forEach(lesson => {
      lines.push(`${index++}) ${formatDate(lesson.date)} — ${lesson.durationMinutes} minute`)
    })

    lines.push('')
    lines.push('💰 Calcul total:')

    let grandTotal = 0
    Object.entries(grouped).forEach(([dur, items]) => {
      const subtotal = items.length * Number(dur) / 60 * (items[0].pricePerSession / (Number(dur) / 60))
      const realSubtotal = items.reduce((s, l) => s + l.pricePerSession, 0)
      grandTotal += realSubtotal
      lines.push(`📚 ${items.length} × ${dur} min × ${items[0].pricePerSession} lei = ${realSubtotal} lei`)
    })

    lines.push('')
    lines.push(`Total de achitat: ${grandTotal} lei`)
    lines.push('')
    lines.push(`ℹ️ Date MIA: 📞 ${profile.phone}  •  📧 ${profile.email}`)
    lines.push('Dacă ai întrebări, sunt aici. 😊')

    return lines.join('\n')
  }

  const report = generateReport()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMarkAllPaid = async () => {
    const unpaid = lessons.filter(l => l.paymentStatus === 'unpaid')
    await Promise.all(
      unpaid.map(l => updateLesson.mutateAsync({ ...l, paymentStatus: 'paid' }))
    )
    queryClient.invalidateQueries({ queryKey: ['lessons'] })
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Rapoarte</h1>
          <p className="text-gray-500 text-sm mt-1">Generează raport lunar pentru un student</p>
        </div>

        <div className="flex gap-3 mb-6">
          <select
            value={selectedStudentId ?? ''}
            onChange={e => setSelectedStudentId(e.target.value ? Number(e.target.value) : undefined)}
            className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400 transition-colors"
          >
            <option value="">Selectează student</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400 transition-colors"
          />
        </div>

        {!selectedStudentId ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-sm">Selectează un student pentru a genera raportul</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-sm">
              Nicio lecție efectuată în {monthLabel} pentru {student?.name}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
              <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                {report}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 bg-lime-400 text-gray-950 font-semibold rounded-lg py-2.5 text-sm hover:opacity-90 transition-all"
              >
                {copied ? '✓ Copiat!' : 'Copiază în clipboard'}
              </button>
              <button
                onClick={handleMarkAllPaid}
                disabled={lessons.every(l => l.paymentStatus === 'paid')}
                className="flex-1 bg-gray-800 text-gray-300 font-medium rounded-lg py-2.5 text-sm hover:bg-gray-700 transition-colors disabled:opacity-40"
              >
                Marchează toate ca achitate
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {Object.entries(grouped).map(([dur, items]) => (
                <div key={dur} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{dur} min</p>
                  <p className="text-white font-bold text-xl">{items.length}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {items.reduce((s, l) => s + l.pricePerSession, 0)} {profile.currency}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}