import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStudent } from '@/queries/useStudents'
import { useLessons, useTogglePayment, useDeleteLesson } from '@/queries/useLessons'
import { usePayments, useDeletePayment } from '@/queries/usePayments'
import { useUpdateLesson } from '@/queries/useLessons'
import { useQueryClient } from '@tanstack/react-query'
import LessonModal from '@/components/lessons/LessonModal'
import PaymentModal from '@/components/payments/PaymentModal'
import type { Lesson, Payment } from '@/types'

export default function StudentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'lessons' | 'payments' | 'report'>('lessons')
  const [lessonModal, setLessonModal] = useState(false)
  const [paymentModal, setPaymentModal] = useState(false)
  const [editLesson, setEditLesson] = useState<Lesson | null>(null)
  const [editPayment, setEditPayment] = useState<Payment | null>(null)

  const { data: student, isLoading } = useStudent(Number(id))
  const { data: lessons = [] } = useLessons({ studentId: Number(id) })
  const { data: payments = [] } = usePayments({ studentId: Number(id) })

  const togglePayment = useTogglePayment()
  const deleteLesson = useDeleteLesson()
  const deletePayment = useDeletePayment()
  const updateLesson = useUpdateLesson()

  const unpaidLessons = lessons.filter(l => l.paymentStatus === 'unpaid' && l.status === 'done')
  const unpaidTotal = unpaidLessons.reduce((sum, l) => sum + l.pricePerSession, 0)

  const handleMarkAllPaid = async () => {
    await Promise.all(
      unpaidLessons.map(l => updateLesson.mutateAsync({ ...l, paymentStatus: 'paid' }))
    )
    queryClient.invalidateQueries({ queryKey: ['lessons'] })
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })

  if (isLoading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Se încarcă...</p>
    </div>
  )

  if (!student) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Studentul nu a fost găsit.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">

        <button
          onClick={() => navigate('/students')}
          className="text-gray-500 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
        >
          ← Înapoi la studenți
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center text-lg font-bold text-lime-400">
            {student.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{student.name}</h1>
              {student.priority && (
                <span className="text-xs bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full">Prioritar</span>
              )}
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                student.status === 'active' ? 'bg-lime-400/10 text-lime-400' : 'bg-gray-800 text-gray-500'
              }`}>
                {student.status === 'active' ? 'Activ' : 'Inactiv'}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {student.subject} · {student.grade}
              {student.phone && ` · ${student.phone}`}
            </p>
          </div>
        </div>

        {unpaidLessons.length > 0 && (
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-amber-400 text-xs font-medium uppercase tracking-wider">Lecții neachitate</p>
              <p className="text-white font-bold text-lg mt-1">
                {unpaidLessons.length} lecții · {unpaidTotal} MDL
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditPayment(null); setPaymentModal(true) }}
                className="text-xs bg-gray-800 text-gray-300 font-medium px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Înregistrează plată
              </button>
              <button
                onClick={handleMarkAllPaid}
                className="text-xs bg-amber-400 text-gray-950 font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Marchează toate achitate
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-xl w-fit">
          {(['lessons', 'payments', 'report'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-lime-400 text-gray-950' : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab === 'lessons' ? `Lecții (${lessons.length})` : tab === 'payments' ? `Plăți (${payments.length})` : 'Raport'}
            </button>
          ))}
        </div>

        {activeTab === 'lessons' && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => { setEditLesson(null); setLessonModal(true) }}
                className="bg-lime-400 text-gray-950 font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity"
              >
                + Adaugă lecție
              </button>
            </div>
            {lessons.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-8">Nicio lecție înregistrată</p>
            ) : (
              <div className="grid gap-3">
                {lessons.map(lesson => (
                  <div key={lesson.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-gray-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[40px]">
                        <p className="text-white font-bold text-lg leading-none">{new Date(lesson.date).getDate()}</p>
                        <p className="text-gray-500 text-xs">{new Date(lesson.date).toLocaleDateString('ro-RO', { month: 'short' })}</p>
                      </div>
                      <div className="w-px h-8 bg-gray-800" />
                      <div>
                        <p className="text-white text-sm font-medium">{formatDate(lesson.date)}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{lesson.durationMinutes} min · {lesson.pricePerSession} MDL</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePayment.mutate({ id: lesson.id!, paymentStatus: lesson.paymentStatus === 'paid' ? 'unpaid' : 'paid' })}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          lesson.paymentStatus === 'paid'
                            ? 'bg-lime-400/10 text-lime-400 hover:bg-lime-400/20'
                            : 'bg-amber-400/10 text-amber-400 hover:bg-amber-400/20'
                        }`}
                      >
                        {lesson.paymentStatus === 'paid' ? 'Achitat' : 'Neachitat'}
                      </button>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        lesson.status === 'done' ? 'bg-gray-800 text-gray-400' : 'bg-red-400/10 text-red-400'
                      }`}>
                        {lesson.status === 'done' ? 'Efectuat' : 'Anulat'}
                      </span>
                      <button
                        onClick={() => { setEditLesson(lesson); setLessonModal(true) }}
                        className="text-gray-600 hover:text-white text-xs px-2 py-1 transition-colors"
                      >
                        Editează
                      </button>
                      <button
                        onClick={() => confirm('Ștergi lecția?') && deleteLesson.mutate(lesson.id!)}
                        className="text-gray-600 hover:text-red-400 text-xs px-2 py-1 transition-colors"
                      >
                        Șterge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => { setEditPayment(null); setPaymentModal(true) }}
                className="bg-lime-400 text-gray-950 font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity"
              >
                + Adaugă plată
              </button>
            </div>
            {payments.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-8">Nicio plată înregistrată</p>
            ) : (
              <div className="grid gap-3">
                {payments.map(payment => (
                  <div key={payment.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-gray-700 transition-colors">
                    <div>
                      <p className="text-white font-medium text-sm">{payment.period}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{formatDate(payment.date)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-white font-bold">{payment.amount} {payment.currency}</p>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        payment.status === 'paid' ? 'bg-lime-400/10 text-lime-400'
                        : payment.status === 'partial' ? 'bg-amber-400/10 text-amber-400'
                        : 'bg-red-400/10 text-red-400'
                      }`}>
                        {payment.status === 'paid' ? 'Achitat' : payment.status === 'partial' ? 'Parțial' : 'Neachitat'}
                      </span>
                      <button
                        onClick={() => { setEditPayment(payment); setPaymentModal(true) }}
                        className="text-gray-600 hover:text-white text-xs px-2 py-1 transition-colors"
                      >
                        Editează
                      </button>
                      <button
                        onClick={() => confirm('Ștergi plata?') && deletePayment.mutate(payment.id!)}
                        className="text-gray-600 hover:text-red-400 text-xs px-2 py-1 transition-colors"
                      >
                        Șterge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'report' && (
          <div className="text-gray-500 text-sm py-8 text-center">
            <p>Mergi la pagina <span className="text-lime-400 cursor-pointer" onClick={() => navigate('/reports')}>Rapoarte</span> pentru a genera raportul lunar</p>
          </div>
        )}

      </div>

      {lessonModal && (
        <LessonModal
          lesson={editLesson}
          preselectedStudentId={Number(id)}
          onClose={() => setLessonModal(false)}
        />
      )}

      {paymentModal && (
        <PaymentModal
          payment={editPayment}
          onClose={() => setPaymentModal(false)}
        />
      )}
    </div>
  )
}
