import { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { useStudents } from '@/queries/useStudents'
import { useCreateLesson } from '@/queries/useLessons'
import { fetchCalendarEvents, type CalendarEvent } from '@/lib/calendar'
import { useQueryClient } from '@tanstack/react-query'
import MonthPicker from '@/components/ui/MonthPicker'

interface Props {
  onClose: () => void
}

function guessStudentId(eventTitle: string, students: { id?: number; name: string }[]): number | null {
  const title = eventTitle.toLowerCase()
  for (const student of students) {
    const parts = student.name.toLowerCase().split(' ')
    if (parts.some(part => part.length > 2 && title.includes(part))) {
      return student.id ?? null
    }
  }
  return null
}

function guessDuration(event: CalendarEvent): 60 | 90 | 120 {
  if (!event.start.dateTime || !event.end.dateTime) return 60
  const diff = (new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime()) / 60000
  if (diff <= 75) return 60
  if (diff <= 105) return 90
  return 120
}

export default function CalendarImport({ onClose }: Props) {
  const profile = useSelector((state: RootState) => state.profile)
  const { data: students = [] } = useStudents()
  const createLesson = useCreateLesson()
  const queryClient = useQueryClient()

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'select' | 'preview' | 'done'>('select')

  const handleFetch = async () => {
    if (!profile.googleCalendarToken) return
    setLoading(true)
    setError('')
    try {
      const data = await fetchCalendarEvents(profile.googleCalendarToken, month)
      const filtered = data.filter(e => e.summary && e.start.dateTime)
      setEvents(filtered)
      setSelected(new Set(
        filtered
          .filter(e => guessStudentId(e.summary, students) !== null)
          .map(e => e.id)
      ))
      setStep('preview')
    } catch (err: any) {
      if (err.message === 'TOKEN_EXPIRED') {
        setError('Tokenul a expirat. Reconectează Google Calendar din Setări.')
      } else {
        setError('Eroare la încărcarea evenimentelor.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    setImporting(true)
    const toImport = events.filter(e => selected.has(e.id))
    for (const event of toImport) {
      const studentId = guessStudentId(event.summary, students)
      if (!studentId) continue
      const duration = guessDuration(event)
      const price = duration === 60 ? profile.defaultPrice60
        : duration === 90 ? profile.defaultPrice90
        : profile.defaultPrice120
      await createLesson.mutateAsync({
        studentId,
        title: event.summary,
        date: event.start.dateTime!.slice(0, 16),
        durationMinutes: duration,
        pricePerSession: price,
        status: 'done',
        paymentStatus: 'unpaid',
        googleCalendarEventId: event.id,
        notes: '',
        createdAt: new Date().toISOString(),
      })
    }
    queryClient.invalidateQueries({ queryKey: ['lessons'] })
    setStep('done')
    setImporting(false)
  }

  const isDark = useSelector((state: RootState) => state.ui.theme) === 'dark'
  const c = {
    bg: isDark ? '#17171f' : '#ffffff',
    bg2: isDark ? '#1a1a24' : '#f0eeea',
    bg3: isDark ? '#1e1e27' : '#e8e5e0',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    text1: isDark ? '#f0f0f2' : '#18181c',
    text2: isDark ? '#8e8e9e' : '#6a6a7a',
    text3: isDark ? '#3a3a4a' : '#c0bdb8',
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div style={{
        background: c.bg, border: `1px solid ${c.border}`,
        borderRadius: '16px', width: '100%', maxWidth: '520px',
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: c.text1 }}>
              Import din Google Calendar
            </h2>
            <p style={{ fontSize: '12px', color: c.text2, marginTop: '2px' }}>
              {step === 'select' ? 'Selectează luna' : step === 'preview' ? `${events.length} evenimente găsite` : 'Import finalizat'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text3, fontSize: '20px' }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {step === 'select' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <MonthPicker value={month} onChange={setMonth} label="Luna de importat" />
              {error && (
                <p style={{ fontSize: '12px', color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', padding: '10px 14px', borderRadius: '8px' }}>
                  {error}
                </p>
              )}
              <button
                onClick={handleFetch}
                disabled={loading}
                style={{
                  background: '#c8fb57', color: '#0a0a0f', border: 'none',
                  borderRadius: '8px', padding: '10px', fontSize: '13px',
                  fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Se încarcă...' : 'Încarcă evenimente'}
              </button>
            </div>
          )}

          {step === 'preview' && (
            <div>
              {events.length === 0 ? (
                <p style={{ fontSize: '13px', color: c.text2, textAlign: 'center', padding: '20px 0' }}>
                  Niciun eveniment găsit în această lună
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: c.text2 }}>
                      {selected.size} din {events.length} selectate
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setSelected(new Set(events.map(e => e.id)))}
                        style={{ fontSize: '11px', color: '#c8fb57', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Toate
                      </button>
                      <button
                        onClick={() => setSelected(new Set())}
                        style={{ fontSize: '11px', color: c.text2, background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Niciuna
                      </button>
                    </div>
                  </div>
                  {events.map(event => {
                    const studentId = guessStudentId(event.summary, students)
                    const student = students.find(s => s.id === studentId)
                    const isSelected = selected.has(event.id)
                    const duration = guessDuration(event)
                    const date = event.start.dateTime
                      ? new Date(event.start.dateTime).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })
                      : '—'
                    const time = event.start.dateTime
                      ? new Date(event.start.dateTime).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
                      : '—'

                    return (
                      <div
                        key={event.id}
                        onClick={() => {
                          const next = new Set(selected)
                          if (next.has(event.id)) next.delete(event.id)
                          else next.add(event.id)
                          setSelected(next)
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                          background: isSelected ? (isDark ? 'rgba(200,251,87,0.08)' : 'rgba(200,251,87,0.12)') : c.bg2,
                          border: `1px solid ${isSelected ? 'rgba(200,251,87,0.3)' : c.border}`,
                          transition: 'all 0.12s',
                        }}
                      >
                        <div style={{
                          width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                          background: isSelected ? '#c8fb57' : 'transparent',
                          border: `2px solid ${isSelected ? '#c8fb57' : c.text3}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {isSelected && <span style={{ fontSize: '10px', color: '#0a0a0f', fontWeight: 700 }}>✓</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 500, color: c.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {event.summary}
                          </p>
                          <p style={{ fontSize: '11px', color: c.text2, marginTop: '2px' }}>
                            {date} · {time} · {duration} min
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          {student ? (
                            <span style={{ fontSize: '11px', background: 'rgba(200,251,87,0.1)', color: '#c8fb57', padding: '2px 8px', borderRadius: '20px' }}>
                              {student.name.split(' ')[0]}
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: c.text3 }}>
                              Necunoscut
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>✓</div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: c.text1 }}>Import finalizat!</p>
              <p style={{ fontSize: '13px', color: c.text2, marginTop: '6px' }}>
                {selected.size} lecții au fost adăugate
              </p>
            </div>
          )}
        </div>

        <div style={{
          padding: '16px 24px', borderTop: `1px solid ${c.border}`,
          display: 'flex', gap: '10px',
        }}>
          {step === 'preview' && (
            <>
              <button
                onClick={() => setStep('select')}
                style={{
                  flex: 1, background: c.bg2, border: `1px solid ${c.border}`,
                  borderRadius: '8px', padding: '10px', fontSize: '13px',
                  fontWeight: 500, color: c.text2, cursor: 'pointer',
                }}
              >
                Înapoi
              </button>
              <button
                onClick={handleImport}
                disabled={importing || selected.size === 0}
                style={{
                  flex: 2, background: '#c8fb57', color: '#0a0a0f', border: 'none',
                  borderRadius: '8px', padding: '10px', fontSize: '13px',
                  fontWeight: 600, cursor: importing || selected.size === 0 ? 'not-allowed' : 'pointer',
                  opacity: importing || selected.size === 0 ? 0.5 : 1,
                }}
              >
                {importing ? 'Se importă...' : `Importă ${selected.size} lecții`}
              </button>
            </>
          )}
          {step === 'done' && (
            <button
              onClick={onClose}
              style={{
                flex: 1, background: '#c8fb57', color: '#0a0a0f', border: 'none',
                borderRadius: '8px', padding: '10px', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Gata
            </button>
          )}
          {step === 'select' && (
            <button
              onClick={onClose}
              style={{
                flex: 1, background: c.bg2, border: `1px solid ${c.border}`,
                borderRadius: '8px', padding: '10px', fontSize: '13px',
                fontWeight: 500, color: c.text2, cursor: 'pointer',
              }}
            >
              Anulează
            </button>
          )}
        </div>
      </div>
    </div>
  )
}