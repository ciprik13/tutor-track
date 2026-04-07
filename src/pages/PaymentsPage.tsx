import { useState } from 'react'
import { usePayments, useDeletePayment } from '@/queries/usePayments'
import { useStudents } from '@/queries/useStudents'
import PaymentModal from '@/components/payments/PaymentModal'
import type { Payment } from '@/types'

export default function PaymentsPage() {
  const [studentFilter, setStudentFilter] = useState<number | undefined>()
  const [statusFilter, setStatusFilter] = useState<'paid' | 'unpaid' | 'partial' | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editPayment, setEditPayment] = useState<Payment | null>(null)

  const { data: payments = [], isLoading } = usePayments({
    studentId: studentFilter,
    status: statusFilter,
  })

  const { data: students = [] } = useStudents()
  const deletePayment = useDeletePayment()

  const handleEdit = (payment: Payment) => {
    setEditPayment(payment)
    setModalOpen(true)
  }

  const handleAdd = () => {
    setEditPayment(null)
    setModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Sigur vrei să ștergi această plată?')) {
      deletePayment.mutate(id)
    }
  }

  const getStudentName = (studentId: number) =>
    students.find(s => s.id === studentId)?.name ?? '—'

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="min-h-full p-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold [color:var(--text-1)] tracking-tight">Plăți</h1>
            <p className="[color:var(--text-2)] text-sm mt-1">
              {payments.length} plăți · total {totalAmount} MDL
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="bg-lime-400 text-gray-950 font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity"
          >
            + Adaugă plată
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

          <div className="flex gap-2">
            {([undefined, 'paid', 'unpaid', 'partial'] as const).map(s => (
              <button
                key={s ?? 'all'}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-lime-400 text-gray-950'
                    : '[background:var(--bg-card)] text-gray-400 border [border-color:var(--border)] hover:border-gray-600'
                }`}
              >
                {s === undefined ? 'Toate' : s === 'paid' ? 'Achitate' : s === 'unpaid' ? 'Neachitate' : 'Parțiale'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="[color:var(--text-2)] text-sm">Se încarcă...</p>
        ) : payments.length === 0 ? (
          <div className="text-center py-16">
            <p className="[color:var(--text-3)] text-sm">Nicio plată găsită</p>
            <button onClick={handleAdd} className="mt-4 text-lime-400 text-sm hover:underline">
              Adaugă prima plată →
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {payments.map(payment => (
              <div
                key={payment.id}
                className="[background:var(--bg-card)] border [border-color:var(--border)] rounded-xl p-4 flex items-center justify-between hover:[border-color:var(--border)] transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg [background:var(--bg-input)] flex items-center justify-center text-sm font-bold text-lime-400">
                    {getStudentName(payment.studentId).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="[color:var(--text-1)] font-medium text-sm">
                      {getStudentName(payment.studentId)}
                    </p>
                    <p className="[color:var(--text-2)] text-xs mt-0.5">
                      {payment.period} · {new Date(payment.date).toLocaleDateString('ro-RO')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="[color:var(--text-1)] font-bold text-sm">
                      {payment.amount} {payment.currency}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-6">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    payment.status === 'paid'
                      ? 'bg-lime-400/10 text-lime-400'
                      : payment.status === 'partial'
                      ? 'bg-amber-400/10 text-amber-400'
                      : 'bg-red-400/10 text-red-400'
                  }`}>
                    {payment.status === 'paid' ? 'Achitat' : payment.status === 'partial' ? 'Parțial' : 'Neachitat'}
                  </span>
                  <button
                    onClick={() => handleEdit(payment)}
                    className="[color:var(--text-3)] hover:[color:var(--text-1)] text-xs transition-colors px-2 py-1"
                  >
                    Editează
                  </button>
                  <button
                    onClick={() => handleDelete(payment.id!)}
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
        <PaymentModal
          payment={editPayment}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
