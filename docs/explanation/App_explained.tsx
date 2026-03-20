import { useState, useEffect } from 'react'
import { Clock, Database, List, Cloud, CloudOff, PieChart } from 'lucide-react'
import { cn } from './lib/utils'
import { InputScreen } from './features/input/InputScreen'
import { RecordsList } from './features/records/RecordsList'
import { DataManagement } from './features/data-management/DataManagement'
import { Statistics } from './features/statistics/Statistics'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ToastProvider } from './components/ui/Toast' // トースト通知の親コンポーネント
import { settings } from './lib/settings'
import type { DateFormat } from './lib/settings'

/**
 * App.tsx：アプリケーションのメインエントリーポイント
 * 
 * このファイルでは以下の重要な役割を担っています：
 * 1. 画面（Screen）の遷移管理
 * 2. グローバル設定（日付形式など）の反映
 * 3. ネットワーク状態（オンライン/オフライン）の監視
 * 4. 共通レイアウト（ヘッダー・ナビゲーション）の提供
 */

type Screen = 'input' | 'records' | 'stats' | 'data'

function App() {
  // 現在表示している画面をステートで管理
  const [currentScreen, setCurrentScreen] = useState<Screen>('input')
  // 日付の表示形式設定
  const [dateFormat, setDateFormat] = useState<DateFormat>(settings.get().dateFormat)
  // ネットワーク状態のフラグ
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // カスタムイベント（kirilog_settings_updated）を受け取って設定を再読込
    const handleSettingsUpdate = () => {
      setDateFormat(settings.get().dateFormat)
    }

    // ブラウザのオンライン/オフラインイベントを監視
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('kirilog_settings_updated', handleSettingsUpdate)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('kirilog_settings_updated', handleSettingsUpdate)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 設定に基づいた現在の日付表示文字列の生成
  const formattedDate = dateFormat === 'japanese' 
    ? format(new Date(), 'yyyy年M月d日 (E)', { locale: ja })
    : format(new Date(), 'yyyy/M/d EEE')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 pb-24">
      {/* 
          ヘッダー：グラスモーフィズムデザイン
          - backdrop-blur-md: 背景をぼかして高級感を演出
          - border-white/10: 控えめな境界線
      */}
      <header className="fixed top-0 left-0 right-0 p-3 border-b border-white/10 bg-slate-900/50 backdrop-blur-md z-30 flex justify-between items-center px-6">
        <div className="w-8" />
        <img src="/logo.png" alt="KiriLog" className="h-8 brightness-0 invert opacity-90" />
        
        {/* クラウド同期ステータス：オンライン時にのみ青いパルス（脈動）アニメーションを表示 */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <Cloud size={14} className="text-blue-400" />
            </div>
          ) : (
            <div className="flex items-center gap-2 px-2 py-1 bg-rose-500/10 rounded-full border border-rose-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <CloudOff size={14} className="text-rose-400" />
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto max-w-md p-4 pt-16">
        {/* 条件付きレンダリング：currentScreenの値に応じて表示を切り替え */}
        {currentScreen === 'input' && (
          <section className="space-y-4">
            <div className="text-center py-4">
              <h2 className="text-2xl font-semibold tracking-tight">
                {formattedDate}
              </h2>
            </div>
            <InputScreen />
          </section>
        )}

        {currentScreen === 'records' && (
          <RecordsList />
        )}

        {currentScreen === 'stats' && (
          <Statistics />
        )}

        {currentScreen === 'data' && (
          <DataManagement onNavigateToStats={() => setCurrentScreen('stats')} />
        )}
      </main>

      {/* 
          ボトムナビゲーション：
          - flex justify-around: アイコンを均等に配置
          - pb-8: iPhoneなどのホームインジケーターを考慮した余白
      */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-t border-white/10 flex justify-around p-3 pb-8 z-30">
        {[
          { id: 'input', icon: Clock, label: '入力' },
          { id: 'records', icon: List, label: '履歴' },
          { id: 'stats', icon: PieChart, label: '統計' },
          { id: 'data', icon: Database, label: '管理' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentScreen(item.id as Screen)}
            className={cn(
              "flex flex-col items-center gap-1.5 text-[10px] font-medium transition-all duration-300",
              currentScreen === item.id ? "text-blue-400 scale-110" : "text-slate-500 hover:text-slate-400"
            )}
          >
            <item.icon 
              size={22} 
              className={cn(currentScreen === item.id && "drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]")} 
            />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

// アプリ全体をトーストプロバイダーで包むことで、どこからでも通知を出せるようにしている
export default function AppWrapper() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  )
}
