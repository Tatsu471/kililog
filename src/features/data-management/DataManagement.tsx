import { Download } from 'lucide-react'
import { storage } from '../../lib/storage'

export function DataManagement() {
  const exportCsv = () => {
    const entries = storage.getEntries()
    if (entries.length === 0) {
      alert('データがありません')
      return
    }

    const headers = ['id', 'date', 'startTime', 'endTime', 'content', 'memo']
    const csvContent = [
      headers.join(','),
      ...entries.map(e => [
        `"${e.id}"`,
        `"${e.date}"`,
        `"${e.startTime}"`,
        `"${e.endTime}"`,
        `"${e.content.replace(/"/g, '""')}"`,
        `"${(e.memo || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `kirilog_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section className="space-y-8 pb-12">
      <h2 className="text-xl font-bold tracking-tight text-white px-1">データ管理</h2>
      
      <div className="grid gap-6">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 shadow-2xl">
          <h3 className="text-lg font-bold mb-3 text-white">データのバックアップ</h3>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed">
            これまでの全記録をCSV形式で保存します。定期的なバックアップをお勧めします。
          </p>
          <button
            onClick={exportCsv}
            className="w-full flex items-center justify-center gap-3 bg-slate-100/10 text-white py-4 rounded-2xl font-bold border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all duration-300 backdrop-blur-sm group"
          >
            <Download size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
            CSVをダウンロード
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-lg font-bold mb-3 text-slate-300">統計（準備中）</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            1週間の稼働状況などを可視化する予定です。
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
            <span className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Coming Soon</span>
          </div>
        </div>
      </div>
    </section>
  )
}
