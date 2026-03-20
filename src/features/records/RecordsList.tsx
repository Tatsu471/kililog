import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Copy, Trash2, Pencil, Save, X } from 'lucide-react'
import { storage } from '../../lib/storage'
import type { LogEntry } from '../../lib/storage'
import { useToast } from '../../components/ui/Toast'
import { ConfirmModal } from '../../components/ui/ConfirmModal'

export function RecordsList() {
  const toast = useToast()
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editMemo, setEditMemo] = useState('')
  
  // Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

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

  const confirmDelete = async () => {
    if (!deleteTargetId) return
    await storage.deleteEntry(deleteTargetId)
    setEntries(entries.filter(e => e.id !== deleteTargetId))
    setDeleteTargetId(null)
    toast.success('削除しました')
  }

  const handleStartEdit = (entry: LogEntry) => {
    setEditingId(entry.id)
    setEditContent(entry.content)
    setEditMemo(entry.memo || '')
  }

  const handleUpdate = async (id: string) => {
    if (!editContent.trim()) {
      toast.error('内容を入力してください')
      return
    }

    await storage.updateEntry(id, { content: editContent, memo: editMemo })
    setEntries(entries.map(e => e.id === id ? { ...e, content: editContent, memo: editMemo } : e))
    setEditingId(null)
    toast.success('更新しました')
  }

  const copyAsMarkdown = () => {
    if (entries.length === 0) return
    
    let md = '| 時間帯 | 行動内容 | メモ |\n| :--- | :--- | :--- |\n'
    entries.forEach(e => {
      md += `| ${e.startTime} - ${e.endTime} | ${e.content.replace(/\n/g, '<br>')} | ${e.memo?.replace(/\n/g, '<br>') || ''} |\n`
    })

    navigator.clipboard.writeText(md)
    toast.success('Markdown形式でコピーしました')
  }

  return (
    <section className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    {editingId === entry.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(entry.id)}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors p-1"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-slate-500 hover:text-slate-400 transition-colors p-1"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(entry)}
                          className="text-slate-500 hover:text-blue-400 transition-colors p-1"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(entry.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editingId === entry.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                      rows={3}
                      placeholder="内容を入力してください"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editMemo}
                      onChange={(e) => setEditMemo(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-slate-400 focus:outline-none focus:border-blue-500/50 transition-all"
                      placeholder="メモ（任意）"
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-slate-100 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                    {entry.memo && (
                      <div className="mt-4 pt-3 border-t border-white/5">
                        <p className="text-sm text-slate-400 italic">
                          {entry.memo}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="記録の削除"
        message="この記録を削除してもよろしいですか？"
        confirmLabel="削除する"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </section>
  )
}
