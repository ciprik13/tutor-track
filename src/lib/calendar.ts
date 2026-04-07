export interface CalendarEvent {
  id: string
  summary: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  description?: string
}

export async function fetchCalendarEvents(
  token: string,
  month: string
): Promise<CalendarEvent[]> {
  const [year, m] = month.split('-').map(Number)
  const timeMin = new Date(year, m - 1, 1).toISOString()
  const timeMax = new Date(year, m, 0, 23, 59, 59).toISOString()

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (response.status === 401) throw new Error('TOKEN_EXPIRED')
  if (!response.ok) throw new Error('Failed to fetch calendar events')

  const data = await response.json()
  return data.items ?? []
}