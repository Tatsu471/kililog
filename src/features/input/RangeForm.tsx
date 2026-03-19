import { useState } from 'react'
import { format } from 'date-fns'
import { storage } from '../../lib/storage'

export function RangeForm() {
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [content, setContent] = useState('')
  const [memo, setMemo] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    const date = format(new Date(), 'yyyy-MM-dd')
    const overlaps = storage.findOverlapping(date, startTime, endTime)

    if (overlaps.length > 0) {
      const confirmMsg = `その時間帯には既に以下の記録があります：\n${overlaps.map(o => `・${o.startTime}-${o.endTime}: ${o.content}`).join('\n')}\n\n上書きします開か？（キャンセルで既存データへ追記、どちらも選ばない場合は中止）`
      const result = confirm(confirmMsg)
      
      if (result) {
        overlaps.forEach(o => storage.deleteEntry(o.id))
      } else {
        const appendResult = confirm('既存のデータに内容を追記しますか？')
        if (appendResult) {
          const target = overlaps[0]
          storage.updateEntry(target.id, { 
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

    storage.saveEntry(newEntry)
    setContent('')
    setMemo('')
    alert('記録しました')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            開始時刻
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            終了時刻
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          行動内容
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[100px]"
          placeholder="何をしていましたか？"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          メモ（任意）
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[60px] text-sm"
          placeholder="補足事項など"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-sm hover:bg-blue-700 transition-colors"
      >
        記録する
      </button>
    </form>
  )
}
