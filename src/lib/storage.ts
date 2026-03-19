import { isWithinInterval, parseISO } from 'date-fns'

export interface LogEntry {
  id: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  content: string
  memo?: string
}

const STORAGE_KEY = 'kirilog_entries'

export const storage = {
  getEntries: (): LogEntry[] => {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  },

  saveEntry: (entry: LogEntry): void => {
    const entries = storage.getEntries()
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...entries, entry]))
  },

  updateEntry: (id: string, updatedEntry: Partial<LogEntry>): void => {
    const entries = storage.getEntries()
    const updatedEntries = entries.map(e => e.id === id ? { ...e, ...updatedEntry } : e)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries))
  },

  deleteEntry: (id: string): void => {
    const entries = storage.getEntries()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.filter(e => e.id !== id)))
  },

  findOverlapping: (date: string, startTime: string, endTime: string): LogEntry[] => {
    const entries = storage.getEntries()
    const currentStart = parseISO(`${date}T${startTime}`)
    const currentEnd = parseISO(`${date}T${endTime}`)

    return entries.filter(e => {
      if (e.date !== date) return false
      const start = parseISO(`${e.date}T${e.startTime}`)
      const end = parseISO(`${e.date}T${e.endTime}`)
      
      return (
        isWithinInterval(currentStart, { start, end }) ||
        isWithinInterval(currentEnd, { start, end }) ||
        isWithinInterval(start, { start: currentStart, end: currentEnd })
      )
    })
  }
}
