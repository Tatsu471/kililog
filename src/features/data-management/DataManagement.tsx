import { useState } from 'react'
import { Download, Settings as SettingsIcon } from 'lucide-react'
import { storage } from '../../lib/storage'
import { settings } from '../../lib/settings'
import type { DateFormat } from '../../lib/settings'
import { cn } from '../../lib/utils'

interface DataManagementProps {
  onNavigateToStats: () => void
}

export function DataManagement({ onNavigateToStats }: DataManagementProps) {
  const [exporting, setExporting] = useState(false)
  const currentSettings = settings.get()
  const [dateFormat, setDateFormat] = useState<DateFormat>(currentSettings.dateFormat)

  const handleDateFormatChange = (format: DateFormat) => {
    setDateFormat(format)
    settings.set({ dateFormat: format })
  }

  const exportCsv = async () => {
    setExporting(true)
    try {
      const entries = await storage.getEntries()
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
    } catch (error) {
      console.error('Export failed:', error)
      alert('エクスポートに失敗しました')
    } finally {
      setExporting(false)
    }
  }

  return (
    <section className="space-y-8 pb-12">
      <h2 className="text-xl font-bold tracking-tight text-white px-1">データ管理</h2>
      
      <div className="space-y-6">
        <section className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <SettingsIcon size={20} />
            </div>
            <h3 className="text-xl font-bold">設定</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-3 ml-1">
                日付表示形式
              </label>
              <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => handleDateFormatChange('japanese')}
                  className={cn(
                    "flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
                    dateFormat === 'japanese'
                      ? "bg-blue-600/30 text-blue-400 shadow-inner"
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  2026年3月20日 (金)
                </button>
                <button
                  onClick={() => handleDateFormatChange('slash')}
                  className={cn(
                    "flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
                    dateFormat === 'slash'
                      ? "bg-blue-600/30 text-blue-400 shadow-inner"
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  2026/3/20 Fri
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-2xl">
          <h3 className="text-lg font-bold mb-3 text-white">データのバックアップ</h3>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed">
            これまでの全記録をCSV形式で保存します。定期的なバックアップをお勧めします。
          </p>
          <button
            onClick={exportCsv}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-3 bg-slate-100/10 text-white py-4 rounded-2xl font-bold border border-white/10 hover:bg-white/10 active:scale-[0.98] transition-all duration-300 backdrop-blur-sm group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-400"></div>
            ) : (
              <Download size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
            )}
            {exporting ? '準備中...' : 'CSVをダウンロード'}
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-lg font-bold mb-3 text-slate-300">統計情報</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            今日の活動状況や週次のトレンドを確認できます。
          </p>
          <button
            onClick={onNavigateToStats}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600/20 text-blue-400 rounded-full border border-blue-500/20 hover:bg-blue-600/30 transition-all font-bold text-sm"
          >
            統計を表示する
          </button>
        </div>
      </div>
    </section>
  )
}
