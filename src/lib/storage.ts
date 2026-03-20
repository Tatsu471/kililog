import { parseISO, isWithinInterval } from 'date-fns'
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
const mapFromDB = (record: Record<string, unknown>): LogEntry => ({
  id: record.id as string,
  date: record.date as string,
  startTime: (record.start_time as string).slice(0, 5), // HH:mm:ss -> HH:mm
  endTime: (record.end_time as string).slice(0, 5),   // HH:mm:ss -> HH:mm
  content: record.content as string,
  memo: record.memo as string | undefined
})

// Helper to map LogEntry to DB record (total or partial)
const mapToDB = (entry: Partial<LogEntry>) => {
  const mapped: Record<string, any> = {}
  if (entry.id) mapped.id = entry.id
  if (entry.date) mapped.date = entry.date
  if (entry.startTime) mapped.start_time = entry.startTime
  if (entry.endTime) mapped.end_time = entry.endTime
  if (entry.content !== undefined) mapped.content = entry.content
  if (entry.memo !== undefined) mapped.memo = entry.memo
  return mapped
}

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
      const entries = storage.getEntriesLocal()
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
      const entries = storage.getEntriesLocal()
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
      const entries = storage.getEntriesLocal()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.filter(e => e.id !== id)))
    }
  },

  // Non-sync helper for internal use / overlap check
  getEntriesLocal: (): LogEntry[] => {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  },

  // Intelligent conflict resolution
  resolveConflicts: async (
    date: string, 
    startTime: string, 
    endTime: string, 
    content: string, 
    memo: string | undefined,
    type: 'smart' | 'append'
  ): Promise<void> => {
    const overlaps = storage.findOverlapping(date, startTime, endTime)
    if (overlaps.length === 0) return

    if (type === 'append') {
      const target = overlaps[0]
      await storage.updateEntry(target.id, {
        content: `${target.content}\n${content}`,
        memo: memo ? `${target.memo || ''}\n${memo}`.trim() : target.memo
      })
      return
    }

    // Smart Resolve (Auto-Trim / Split / Delete)
    const newStart = parseISO(`${date}T${startTime}`)
    const newEnd = parseISO(`${date}T${endTime}`)

    for (const old of overlaps) {
      const oldStart = parseISO(`${old.date}T${old.startTime}`)
      const oldEnd = parseISO(`${old.date}T${old.endTime}`)

      // Case 1: Fully enveloped by new -> Delete
      if (oldStart >= newStart && oldEnd <= newEnd) {
        await storage.deleteEntry(old.id)
        continue
      }

      // Case 2: New starts during Old -> Trim Old End
      if (oldStart < newStart && oldEnd > newStart && oldEnd <= newEnd) {
        await storage.updateEntry(old.id, { endTime: startTime })
        continue
      }

      // Case 3: New ends during Old -> Trim Old Start
      if (oldStart >= newStart && oldStart < newEnd && oldEnd > newEnd) {
        await storage.updateEntry(old.id, { startTime: endTime })
        continue
      }

      // Case 4: New is inside Old -> Split Old into Two
      if (oldStart < newStart && oldEnd > newEnd) {
        // Create the "After" piece first
        const afterPiece: LogEntry = {
          id: crypto.randomUUID(),
          date: old.date,
          startTime: endTime,
          endTime: old.endTime,
          content: old.content,
          memo: old.memo
        }
        await storage.saveEntry(afterPiece)
        // Trim the original to become the "Before" piece
        await storage.updateEntry(old.id, { endTime: startTime })
      }
    }
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
