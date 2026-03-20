import { useMemo } from 'react'
import { format, parseISO, differenceInMinutes, subDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { storage } from '../../lib/storage'
import { PieChart, BarChart3, Clock } from 'lucide-react'

export function Statistics() {
  const entries = storage.getEntriesLocal()
  const today = format(new Date(), 'yyyy-MM-dd')
  
  const stats = useMemo(() => {
    const todayEntries = entries.filter(e => e.date === today)
    
    let totalMinutes = 0
    const activityMap: Record<string, number> = {}

    todayEntries.forEach(e => {
      const start = parseISO(`${e.date}T${e.startTime}`)
      const end = parseISO(`${e.date}T${e.endTime}`)
      const minutes = differenceInMinutes(end, start)
      
      totalMinutes += minutes
      
      // Group by content (simple categorization for now)
      const category = e.content.split('\n')[0].slice(0, 10)
      activityMap[category] = (activityMap[category] || 0) + minutes
    })

    const sortedActivities = Object.entries(activityMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    const weekData = Array.from({ length: 7 }).map((_, i) => {
      const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
      const dayEntries = entries.filter(e => e.date === date)
      const dailyMinutes = dayEntries.reduce((acc, e) => {
        const start = parseISO(`${e.date}T${e.startTime}`)
        const end = parseISO(`${e.date}T${e.endTime}`)
        return acc + differenceInMinutes(end, start)
      }, 0)
      
      const dayLabel = format(subDays(new Date(), 6 - i), 'EEEEEE', { locale: ja })
      return { mins: dailyMinutes, label: dayLabel }
    })

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold tracking-tight text-white px-1">統計</h2>

      {/* Summary Card */}
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between">
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
        
        <div className="mt-8 space-y-4">
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all duration-1000 ease-out"
              style={{ width: `${Math.min((stats.totalMinutes / 600) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-bold">
            Target: 10 Hours
          </p>
        </div>
      </div>

      {/* Activity List */}
      <div className="grid gap-4">
        <div className="flex items-center gap-2 px-1 mb-1">
          <BarChart3 size={18} className="text-blue-400" />
          <h3 className="text-sm font-bold text-slate-300">アクティビティ上位</h3>
        </div>
        
        {stats.activities.length > 0 ? (
          stats.activities.map(([name, mins]: [string, number], i: number) => (
            <div 
              key={name}
              className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:text-blue-400 transition-colors">
                  0{i + 1}
                </div>
                <span className="text-sm font-medium text-slate-200 truncate max-w-[150px]">
                  {name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">
                  {Math.floor(mins / 60)}h {mins % 60}m
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(37,99,235,0.8)]" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
            <Clock size={40} className="mx-auto text-slate-700 mb-4 opacity-50" />
            <p className="text-sm text-slate-500">まだ今日のデータがありません</p>
          </div>
        )}
      </div>

      {/* Weekly Vision (Placeholder with premium feel) */}
      <div className="bg-gradient-to-br from-blue-600/20 to-transparent p-6 rounded-[2rem] border border-blue-500/20 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4">
          <div className="bg-blue-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-tighter">
            Weekly Data
          </div>
        </div>
        <h3 className="text-lg font-bold mb-1">週次推移</h3>
        <p className="text-xs text-slate-400 mb-6">過去7日間のトレンド</p>
        
        <div className="flex items-end justify-between h-24 gap-2 px-1">
          {stats.weekData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className={cn(
                  "w-full rounded-t-lg transition-all duration-1000",
                  i === 6 ? "bg-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.5)]" : "bg-white/10"
                )}
                style={{ height: `${(d.mins / stats.maxMins) * 100 || 5}%` }}
              />
              <span className="text-[8px] font-bold text-slate-600">
                {d.label}
              </span>
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
