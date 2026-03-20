import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Copy, Trash2 } from 'lucide-react'
import { storage } from '../../lib/storage'
import type { LogEntry } from '../../lib/storage'

export function RecordsList() {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true)
      const all = await storage.getEntries()
      const todayEntries = all
        .filter(e => e.date === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
      setEntries(todayEntries)
      setLoading(false)
    }
    fetchEntries()
  }, [today])

  const handleDelete = async (id: string) => {
    if (!confirm('削除してもよろしいですか？')) return
    await storage.deleteEntry(id)
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
    <section className="space-y-6 pb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold tracking-tight text-white">今日の記録</h2>
        <button
          onClick={copyAsMarkdown}
          className="flex items-center gap-2 text-xs font-semibold text-slate-100 border border-white/20 px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
        >
          <Copy size={14} />
          Markdown出力
        </button>
      </div>

      {loading ? (
        <div className="bg-white/5 p-16 rounded-[2rem] border border-white/10 text-center backdrop-blur-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-400 font-medium text-sm">読み込み中...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white/5 p-16 rounded-[2rem] border border-dashed border-white/10 text-center backdrop-blur-sm">
          <p className="text-slate-500 font-medium">記録がありません</p>
        </div>
      ) : (
        <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-blue-500/50 before:via-white/10 before:to-transparent">
          {entries.map(entry => (
            <div key={entry.id} className="relative group">
              {/* Timeline Node */}
              <div className="absolute -left-[27px] top-1.5 w-[14px] h-[14px] rounded-full bg-blue-500 border-2 border-slate-900 shadow-[0_0_10px_rgba(59,130,246,0.6)] z-10 group-hover:scale-125 transition-transform duration-300" />
              
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-xl transition-all duration-300 hover:bg-white/15 hover:border-white/30">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-lg border border-blue-400/20">
                    {entry.startTime} - {entry.endTime}
                  </span>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-slate-100 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                {entry.memo && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <p className="text-sm text-slate-400 italic">
                      {entry.memo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
