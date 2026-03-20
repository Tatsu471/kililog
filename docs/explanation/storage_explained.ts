import { supabase } from './supabase'
import { parseISO, isWithinInterval } from 'date-fns'

/**
 * storage.ts：データ同期・管理の心臓部
 * 
 * このファイルでは、Supabase（クラウド）とlocalStorage（ローカル）を併用した
 * ハイブリッドなデータストレージ戦略を実装しています。
 */

export interface LogEntry {
  id: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  content: string
  memo?: string
}

const STORAGE_KEY = 'kirilog_entries'

// DBのカラム名（スネークケース）とコード内のプロパティ（キャメルケース）を相互変換する
const mapFromDB = (record: any): LogEntry => ({
  id: record.id,
  date: record.date,
  startTime: record.start_time.slice(0, 5),
  endTime: record.end_time.slice(0, 5),
  content: record.content,
  memo: record.memo
})

const mapToDB = (entry: LogEntry) => ({
  id: entry.id,
  date: entry.date,
  start_time: entry.startTime,
  end_time: entry.endTime,
  content: entry.content,
  memo: entry.memo
})

export const storage = {
  /**
   * getEntries: データの取得
   * 1. Supabaseからデータを取得
   * 2. 成功したらlocalStorageも更新
   * 3. 失敗（オフライン等）した場合はlocalStorageから読み込み
   */
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

  /**
   * saveEntry: 新規保存
   * - クラウドへの保存を試みつつ、必ずローカルにバックアップを保存するように finally ブロックを使用
   */
  saveEntry: async (entry: LogEntry): Promise<void> => {
    try {
      const { error } = await supabase
        .from('logs')
        .insert([mapToDB(entry)])

      if (error) throw error
    } catch (error) {
      console.error('Failed to save to Supabase:', error)
    } finally {
      // ネットワークに関わらずローカルの状態を更新し、UIに反映させる
      const entries = storage.getEntriesLocal()
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...entries, entry]))
    }
  },

  /**
   * findOverlapping: 時間の重複チェック
   * - date-fns の isWithinInterval を使い、新しい記録が既存の記録と被っていないか判定
   */
  findOverlapping: (date: string, startTime: string, endTime: string): LogEntry[] => {
    const entries = storage.getEntriesLocal()
    const currentStart = parseISO(`${date}T${startTime}`)
    const currentEnd = parseISO(`${date}T${endTime}`)

    return entries.filter(e => {
      if (e.date !== date) return false
      const start = parseISO(`${e.date}T${e.startTime}`)
      const end = parseISO(`${e.date}T${e.endTime}`)
      
      // AがBの中に含まれる、またはBがAの中に含まれるケースを網羅
      return (
        isWithinInterval(currentStart, { start, end }) ||
        isWithinInterval(currentEnd, { start, end }) ||
        isWithinInterval(start, { start: currentStart, end: currentEnd })
      )
    })
  },

  getEntriesLocal: (): LogEntry[] => {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }
}
