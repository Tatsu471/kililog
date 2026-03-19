import { useState, useEffect } from 'react'
import { format, subHours, startOfHour } from 'date-fns'
import { storage } from '../../lib/storage'

export function HourlyForm() {
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [content, setContent] = useState('')
  const [memo, setMemo] = useState('')

  useEffect(() => {
    // 14:15 -> 13:00 - 14:00 logic
    const now = new Date()
    const lastHourStart = startOfHour(subHours(now, 1))
    const lastHourEnd = startOfHour(now)
    
    setStartTime(format(lastHourStart, 'HH:00'))
    setEndTime(format(lastHourEnd, 'HH:00'))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    const date = format(new Date(), 'yyyy-MM-dd')
    const overlaps = storage.findOverlapping(date, startTime, endTime)

    if (overlaps.length > 0) {
      const confirmMsg = `その時間帯には既に以下の記録があります：\n${overlaps.map(o => `・${o.startTime}-${o.endTime}: ${o.content}`).join('\n')}\n\n上書きしますか？（キャンセルで既存データへ追記、どちらも選ばない場合は中止）`
      const result = confirm(confirmMsg)
      
      if (result) {
        // Overwrite: delete overlaps and save new
        overlaps.forEach(o => storage.deleteEntry(o.id))
      } else {
        // Append: normally we'd ask more specific, but for now let's just append note
        const appendResult = confirm('既存のデータに内容を追記しますか？')
        if (appendResult) {
          const target = overlaps[0] // Simplify to first one
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
      <div className="flex items-center justify-between text-slate-500 mb-2">
        <span className="text-sm font-medium">対象時間</span>
        <span className="text-lg font-bold text-slate-900">{startTime} - {endTime}</span>
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
