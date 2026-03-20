import { useState } from 'react'
import { format } from 'date-fns'
import { storage } from '../../lib/storage'
import { useToast } from '../../components/ui/Toast'
import { ConfirmModal } from '../../components/ui/ConfirmModal'

export function RangeForm() {
  const toast = useToast()
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [content, setContent] = useState('')
  const [memo, setMemo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Modal State
  const [showOverlapModal, setShowOverlapModal] = useState(false)
  const [overlapData, setOverlapData] = useState<{
    date: string,
    startTime: string,
    endTime: string,
    content: string,
    memo: string,
    msg: string
  } | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!content.trim() || submitting) return

    setSubmitting(true)
    try {
      const date = format(new Date(), 'yyyy-MM-dd')
      const overlaps = storage.findOverlapping(date, startTime, endTime)

      if (overlaps.length > 0) {
        const confirmMsg = `その時間帯には既に以下の記録があります：\n${overlaps.map(o => `・${o.startTime}-${o.endTime}: ${o.content}`).join('\n')}\n\n「自動調整」して保存しますか？\n（既存の記録を短縮・分割して、新しい記録を優先します）\n\n※[キャンセル] を押すと、既存の記録へ「追記」するか選択できます。`
        
        setOverlapData({ date, startTime, endTime, content, memo, msg: confirmMsg })
        setShowOverlapModal(true)
        setSubmitting(false)
        return
      }

      await executeSave(date, startTime, endTime, content, memo)
    } catch (err) {
      toast.error('エラーが発生しました')
      console.error(err)
      setSubmitting(false)
    }
  }

  const executeSave = async (date: string, st: string, et: string, c: string, m: string) => {
    const newEntry = {
      id: crypto.randomUUID(),
      date,
      startTime: st,
      endTime: et,
      content: c,
      memo: m.trim() || undefined
    }

    await storage.saveEntry(newEntry)
    setContent('')
    setMemo('')
    toast.success('記録しました')
    setSubmitting(false)
  }

  const handleSmartResolve = async () => {
    if (!overlapData) return
    setSubmitting(true)
    setShowOverlapModal(false)
    try {
      await storage.resolveConflicts(
        overlapData.date, 
        overlapData.startTime, 
        overlapData.endTime, 
        overlapData.content, 
        overlapData.memo, 
        'smart'
      )
      await executeSave(
        overlapData.date, 
        overlapData.startTime, 
        overlapData.endTime, 
        overlapData.content, 
        overlapData.memo
      )
      toast.success('自動調整して記録しました')
    } catch (err) {
      toast.error('保存に失敗しました')
      setSubmitting(false)
    } finally {
      setOverlapData(null)
    }
  }

  const handleAppendResolve = async () => {
    if (!overlapData) return
    setSubmitting(true)
    setShowOverlapModal(false)
    try {
      await storage.resolveConflicts(
        overlapData.date, 
        overlapData.startTime, 
        overlapData.endTime, 
        overlapData.content, 
        overlapData.memo, 
        'append'
      )
      toast.success('既存の記録に追記しました')
      setContent('')
      setMemo('')
    } catch (err) {
      toast.error('保存に失敗しました')
    } finally {
      setSubmitting(false)
      setOverlapData(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-400 mb-2 ml-1">
            開始時刻
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-400 mb-2 ml-1">
            終了時刻
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:dark]"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-slate-400 mb-2 ml-1">
          行動内容
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-4 bg-black/20 border border-white/10 rounded-2xl text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none min-h-[120px] transition-all"
          placeholder="何をしていましたか？"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-400 mb-2 ml-1">
          メモ（任意）
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full p-4 bg-black/20 border border-white/10 rounded-2xl text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none min-h-[80px] text-sm transition-all"
          placeholder="補足事項など"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? '記録中...' : '記録する'}
      </button>

      <ConfirmModal
        isOpen={showOverlapModal}
        title="時間帯の重複"
        message={overlapData?.msg || ''}
        confirmLabel="自動調整する"
        cancelLabel="既存の記録へ追記"
        onConfirm={handleSmartResolve}
        onCancel={handleAppendResolve}
      />
    </form>
  )
}
