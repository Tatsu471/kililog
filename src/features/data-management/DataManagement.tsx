import { Download } from 'lucide-react'
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
    <section className="space-y-6">
      <h2 className="text-lg font-medium text-slate-700">データ管理</h2>
      
      <div className="grid gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold mb-2">データのバックアップ</h3>
          <p className="text-sm text-slate-500 mb-6">
            これまでの全記録をCSV形式で保存します。
          </p>
          <button
            onClick={exportCsv}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-xl font-semibold hover:bg-slate-900 transition-colors"
          >
            <Download size={20} />
            CSVをダウンロード
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm opacity-50">
          <h3 className="font-semibold mb-2">統計（準備中）</h3>
          <p className="text-sm text-slate-500">
            1週間の稼働状況などを可視化する予定です。
          </p>
        </div>
      </div>
    </section>
  )
}
