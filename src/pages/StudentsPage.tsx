import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getInitials } from '@/lib/dateUtils'
import { useStudents, useDeleteStudent } from '@/queries/useStudents'
import StudentModal from '@/components/students/StudentModal'
import type { Student } from '@/types'

export default function StudentsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)

  const { data: students = [], isLoading } = useStudents({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search,
  })

  const deleteStudent = useDeleteStudent()

  const handleEdit = (student: Student) => {
    setEditStudent(student)
    setModalOpen(true)
  }

  const handleAdd = () => {
    setEditStudent(null)
    setModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Sigur vrei să ștergi acest student?')) {
      deleteStudent.mutate(id)
    }
  }

  return (
    <div className="min-h-full p-6">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-(--text-1) tracking-tight">Studenți</h1>
            <p className="text-(--text-2) text-sm mt-1">{students.length} studenți</p>
          </div>
          <button
            onClick={handleAdd}
            className="bg-[#2b6777] text-white font-semibold rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-opacity"
          >
            + Adaugă student
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Caută după nume..."
            className="flex-1 bg-(--bg-card) border border-(--border) rounded-lg px-4 py-2 text-(--text-1) text-sm placeholder-gray-600 focus:outline-none focus:border-[#2b6777] transition-colors"
          />
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-[#2b6777] text-white'
                    : 'bg-(--bg-card) text-gray-400 border border-(--border) hover:border-gray-600'
                }`}
              >
                {s === 'all' ? 'Toți' : s === 'active' ? 'Activi' : 'Inactivi'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="text-(--text-2) text-sm">Se încarcă...</p>
        ) : students.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-(--text-3) text-sm">Niciun student găsit</p>
            <button onClick={handleAdd} className="mt-4 text-[#52ab98] text-sm hover:underline">
              Adaugă primul student →
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {students.map(student => (
              <div
                key={student.id}
                className="bg-(--bg-card) border border-(--border) rounded-xl p-4 flex items-center justify-between hover:border-(--border) transition-colors"
              >
                <div
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => navigate(`/students/${student.id}`)}
                >
                  <div className="w-10 h-10 rounded-lg bg-(--bg-input) flex items-center justify-center text-sm font-bold text-[#52ab98]">
                    {getInitials(student.name)}
                  </div>
                  <div>
                    <p className="text-(--text-1) font-medium text-sm">{student.name}</p>
                    <p className="text-(--text-2) text-xs mt-0.5">
                      {student.subject} · {student.grade}
                    </p>
                  </div>
                  {student.priority && (
                    <span className="ml-2 text-xs bg-[#c07a20]/10 text-[#c07a20] px-2 py-0.5 rounded-full">
                      Prioritar
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    student.status === 'active'
                      ? 'bg-[#2b6777]/10 text-[#52ab98]'
                      : 'bg-(--bg-input) text-(--text-2)'
                  }`}>
                    {student.status === 'active' ? 'Activ' : 'Inactiv'}
                  </span>
                  <button
                    onClick={() => handleEdit(student)}
                    className="text-(--text-3) hover:text-(--text-1) text-xs transition-colors px-2 py-1"
                  >
                    Editează
                  </button>
                  <button
                    onClick={() => handleDelete(student.id!)}
                    className="text-(--text-3) hover:text-red-400 text-xs transition-colors px-2 py-1"
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
        <StudentModal
          student={editStudent}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
