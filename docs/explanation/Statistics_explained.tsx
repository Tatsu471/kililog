import { useMemo } from 'react'
import { format, parseISO, differenceInMinutes, subDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { storage } from '../../lib/storage'
import { PieChart, BarChart3, Clock } from 'lucide-react'

/**
 * Statistics.tsx：データ分析ダッシュボード
 * 
 * このファイルでは、記録された生データを「役立つ情報」に変換・可視化しています。
 * React の useMemo を使って、不要な再計算を防ぎつつ効率的に集計を行っています。
 */

export function Statistics() {
  // ローカルにキャッシュされている全記録を取得
  const entries = storage.getEntriesLocal()
  const today = format(new Date(), 'yyyy-MM-dd')
  
  /**
   * stats: 集計ロジック
   * - 記録の配列を一度走査し、今日の合計時間と、内容別（カテゴリ別）の時間を集計します。
   */
  const stats = useMemo(() => {
    const todayEntries = entries.filter(e => e.date === today)
    
    let totalMinutes = 0
    const activityMap: Record<string, number> = {}

    todayEntries.forEach(e => {
      const start = parseISO(`${e.date}T${e.startTime}`)
      const end = parseISO(`${e.date}T${e.endTime}`)
      // date-fns を使って開始と終了の「差分（分）」を計算
      const minutes = differenceInMinutes(end, start)
      
      totalMinutes += minutes
      
      // 内容の1行目をカテゴリとしてカウント
      const category = e.content.split('\n')[0].slice(0, 10)
      activityMap[category] = (activityMap[category] || 0) + minutes
    })

    // 活動時間の多い順にソートし、上位5件を抽出
    const sortedActivities = Object.entries(activityMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    /**
     * 週次データの生成
     * - 今日から遡って7日分のそれぞれの合計時間を計算
     */
    const weekData = Array.from({ length: 7 }).map((_, i) => {
      // subDays(new Date(), X) で過去の日付を生成
      const d = subDays(new Date(), 6 - i)
      const dateStr = format(d, 'yyyy-MM-dd')
      const dayEntries = entries.filter(e => e.date === dateStr)
      const dailyMinutes = dayEntries.reduce((acc, e) => {
        const start = parseISO(`${e.date}T${e.startTime}`)
        const end = parseISO(`${e.date}T${e.endTime}`)
        return acc + differenceInMinutes(end, start)
      }, 0)
      
      return { 
        mins: dailyMinutes, 
        label: format(d, 'EEEEEE', { locale: ja }) // 月, 火, 水...
      }
    })

    // グラフの基準となる最大値（最低10時間に設定）
    const maxMins = Math.max(...weekData.map(d => d.mins), 600)

    return {
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      activities: sortedActivities,
      weekData,
      maxMins
    }
  }, [entries, today])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold tracking-tight text-white px-1">統計</h2>

      {/* サマリーカード：今日の合計稼働時間を強調 */}
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">今日の合計稼働</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white tracking-tighter">
                {stats.totalHours}
              </span>
              <span className="text-lg font-bold text-slate-500">時間</span>
            </div>
          </div>
          <div className="p-4 bg-blue-500/20 rounded-2xl text-blue-400">
            <PieChart size={32} />
          </div>
        </div>
        
        {/* 進捗バー：目標時間（10時間）に対してどれくらい埋まったかを視覚化 */}
        <div className="mt-8 space-y-4">
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out"
              style={{ width: `${Math.min((stats.totalMinutes / 600) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 
          週次推移グラフ：CSSの height と flexbox を使用 
          - d.mins / stats.maxMins で棒グラフの高さを動的に決定
      */}
      <div className="bg-white/10 p-6 rounded-[2rem] border border-white/10">
        <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">週次推移</h3>
        <div className="flex items-end justify-between h-24 gap-2">
          {stats.weekData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className={cn(
                  "w-full rounded-t-lg transition-all duration-1000",
                  i === 6 ? "bg-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.5)]" : "bg-white/10"
                )}
                style={{ height: `${(d.mins / stats.maxMins) * 100 || 5}%` }}
              />
              <span className="text-[10px] text-slate-500">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
