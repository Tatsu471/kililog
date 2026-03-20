import { isWithinInterval, parseISO } from 'date-fns'
import { supabase } from './supabase'

export interface LogEntry {
  id: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  content: string
  memo?: string
}

const STORAGE_KEY = 'kirilog_entries'

// Helper to map DB record to LogEntry
const mapFromDB = (record: any): LogEntry => ({
  id: record.id,
  date: record.date,
  startTime: record.start_time.slice(0, 5), // HH:mm:ss -> HH:mm
  endTime: record.end_time.slice(0, 5),   // HH:mm:ss -> HH:mm
  content: record.content,
  memo: record.memo
})

// Helper to map LogEntry to DB record
const mapToDB = (entry: LogEntry) => ({
  id: entry.id,
  date: entry.date,
  start_time: entry.startTime,
  end_time: entry.endTime,
  content: entry.content,
  memo: entry.memo
})

export const storage = {
  getEntries: async (): Promise<LogEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('date', { ascending: false })
        .order('start_time', { ascending: true })

      if (error) throw error

      const entries = (data || []).map(mapFromDB)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
      return entries
    } catch (error) {
      console.error('Failed to fetch from Supabase, using localStorage:', error)
      const localData = localStorage.getItem(STORAGE_KEY)
      return localData ? JSON.parse(localData) : []
    }
  },

  saveEntry: async (entry: LogEntry): Promise<void> => {
    try {
      const { error } = await supabase
        .from('logs')
        .insert([mapToDB(entry)])

      if (error) throw error
    } catch (error) {
      console.error('Failed to save to Supabase:', error)
    } finally {
      const entries = await storage.getEntriesLocal()
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...entries, entry]))
    }
  },

  updateEntry: async (id: string, updatedEntry: Partial<LogEntry>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('logs')
        .update(mapToDB(updatedEntry as LogEntry))
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Failed to update Supabase:', error)
    } finally {
      const entries = await storage.getEntriesLocal()
      const updatedEntries = entries.map(e => e.id === id ? { ...e, ...updatedEntry } : e)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries))
    }
  },

  deleteEntry: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('logs')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Failed to delete from Supabase:', error)
    } finally {
      const entries = await storage.getEntriesLocal()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.filter(e => e.id !== id)))
    }
  },

  // Non-sync helper for internal use / overlap check
  getEntriesLocal: (): LogEntry[] => {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  },

  findOverlapping: (date: string, startTime: string, endTime: string): LogEntry[] => {
    const entries = storage.getEntriesLocal()
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
