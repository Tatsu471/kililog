import { useState } from 'react'
import { Clock, Database, List } from 'lucide-react'
import { cn } from './lib/utils'
import { InputScreen } from './features/input/InputScreen'
import { RecordsList } from './features/records/RecordsList'
import { DataManagement } from './features/data-management/DataManagement'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

type Screen = 'input' | 'records' | 'data'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('input')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 pb-24">
      <header className="fixed top-0 left-0 right-0 p-3 border-b border-white/10 bg-slate-900/50 backdrop-blur-md z-30 flex justify-center items-center">
        <img src="/logo.png" alt="KiriLog" className="h-8 brightness-0 invert opacity-90" />
      </header>

      <main className="container mx-auto max-w-md p-4 pt-20">
        {currentScreen === 'input' && (
          <section className="space-y-6">
            <div className="text-center py-6">
              <h2 className="text-2xl font-semibold tracking-tight">
                {format(new Date(), 'yyyy年M月d日 (E)', { locale: ja })}
              </h2>
            </div>
            <InputScreen />
          </section>
        )}

        {currentScreen === 'records' && (
          <RecordsList />
        )}

        {currentScreen === 'data' && (
          <DataManagement />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-lg border-t border-white/10 flex justify-around p-3 pb-8 z-30">
        <button
          onClick={() => setCurrentScreen('input')}
          className={cn(
            "flex flex-col items-center gap-1.5 text-[10px] font-medium transition-all duration-300",
            currentScreen === 'input' ? "text-blue-400 scale-110" : "text-slate-500 hover:text-slate-400"
          )}
        >
          <Clock size={22} className={cn(currentScreen === 'input' && "drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]")} />
          <span>入力</span>
        </button>
        <button
          onClick={() => setCurrentScreen('records')}
          className={cn(
            "flex flex-col items-center gap-1.5 text-[10px] font-medium transition-all duration-300",
            currentScreen === 'records' ? "text-blue-400 scale-110" : "text-slate-500 hover:text-slate-400"
          )}
        >
          <List size={22} className={cn(currentScreen === 'records' && "drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]")} />
          <span>履歴</span>
        </button>
        <button
          onClick={() => setCurrentScreen('data')}
          className={cn(
            "flex flex-col items-center gap-1.5 text-[10px] font-medium transition-all duration-300",
            currentScreen === 'data' ? "text-blue-400 scale-110" : "text-slate-500 hover:text-slate-400"
          )}
        >
          <Database size={22} className={cn(currentScreen === 'data' && "drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]")} />
          <span>管理</span>
        </button>
      </nav>
    </div>
  )
}

export default App
