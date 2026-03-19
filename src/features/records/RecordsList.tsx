import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Copy, Trash2 } from 'lucide-react'
import { storage } from '../../lib/storage'
import type { LogEntry } from '../../lib/storage'

export function RecordsList() {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    const all = storage.getEntries()
    const todayEntries = all
      .filter(e => e.date === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
    setEntries(todayEntries)
  }, [today])

  const handleDelete = (id: string) => {
    if (!confirm('削除してもよろしいですか？')) return
    storage.deleteEntry(id)
    setEntries(entries.filter(e => e.id !== id))
  }

  const copyAsMarkdown = () => {
    if (entries.length === 0) return
    
    let md = '| 時間帯 | 行動内容 | メモ |\n| :--- | :--- | :--- |\n'
    entries.forEach(e => {
      md += `| ${e.startTime} - ${e.endTime} | ${e.content.replace(/\n/g, '<br>')} | ${e.memo?.replace(/\n/g, '<br>') || ''} |\n`
    })

    navigator.clipboard.writeText(md)
    alert('Markdown形式でコピーしました')
  }

  return (
    <section className="space-y-4 pb-12">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium text-slate-700">今日の記録</h2>
        <button
          onClick={copyAsMarkdown}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Copy size={16} />
          Markdown出力
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
          <p className="text-slate-400">記録がありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm group">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {entry.startTime} - {entry.endTime}
                </span>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-slate-800 whitespace-pre-wrap">{entry.content}</p>
              {entry.memo && (
                <p className="mt-2 text-sm text-slate-500 border-l-2 border-slate-100 pl-3">
                  {entry.memo}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
