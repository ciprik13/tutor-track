import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStudent } from '@/queries/useStudents'

export default function StudentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'lessons' | 'payments' | 'report'>('lessons')

  const { data: student, isLoading } = useStudent(Number(id))

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

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center text-lg font-bold text-lime-400">
            {student.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{student.name}</h1>
              {student.priority && (
                <span className="text-xs bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full">
                  Prioritar
                </span>
              )}
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                student.status === 'active'
                  ? 'bg-lime-400/10 text-lime-400'
                  : 'bg-gray-800 text-gray-500'
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

        <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-xl w-fit">
          {(['lessons', 'payments', 'report'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-lime-400 text-gray-950'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab === 'lessons' ? 'Lecții' : tab === 'payments' ? 'Plăți' : 'Raport'}
            </button>
          ))}
        </div>

        <div>
          {activeTab === 'lessons' && (
            <div className="text-gray-500 text-sm py-8 text-center">
              Lecțiile vor apărea aici — în curând
            </div>
          )}
          {activeTab === 'payments' && (
            <div className="text-gray-500 text-sm py-8 text-center">
              Plățile vor apărea aici — în curând
            </div>
          )}
          {activeTab === 'report' && (
            <div className="text-gray-500 text-sm py-8 text-center">
              Raportul va apărea aici — în curând
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
