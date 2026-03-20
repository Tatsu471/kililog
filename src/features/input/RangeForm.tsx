import { useState } from 'react'
import { format } from 'date-fns'
import { storage } from '../../lib/storage'

export function RangeForm() {
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [content, setContent] = useState('')
  const [memo, setMemo] = useState('')

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || submitting) return

    setSubmitting(true)
    try {
      const date = format(new Date(), 'yyyy-MM-dd')
      const overlaps = storage.findOverlapping(date, startTime, endTime)

      if (overlaps.length > 0) {
        const confirmMsg = `その時間帯には既に以下の記録があります：\n${overlaps.map(o => `・${o.startTime}-${o.endTime}: ${o.content}`).join('\n')}\n\n上書きしますか？（キャンセルで既存データへ追記、どちらも選ばない場合は中止）`
        const result = confirm(confirmMsg)
        
        if (result) {
          for (const o of overlaps) {
            await storage.deleteEntry(o.id)
          }
        } else {
          const appendResult = confirm('既存のデータに内容を追記しますか？')
          if (appendResult) {
            const target = overlaps[0]
            await storage.updateEntry(target.id, { 
              content: `${target.content}\n${content}`,
              memo: memo ? `${target.memo || ''}\n${memo}`.trim() : target.memo
            })
            setContent('')
            setMemo('')
            alert('追記しました')
            return
          } else {
            return
          }
        }
      }

      const newEntry = {
        id: crypto.randomUUID(),
        date,
        startTime,
        endTime,
        content,
        memo: memo.trim() || undefined
      }

      await storage.saveEntry(newEntry)
      setContent('')
      setMemo('')
      alert('記録しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
    </form>
  )
}
