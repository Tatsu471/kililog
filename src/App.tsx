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
    <div className="min-h-screen pb-20">
      <header className="p-4 border-b bg-white sticky top-0 z-10">
        <h1 className="text-xl font-bold text-center">KiriLog</h1>
      </header>

      <main className="container mx-auto max-w-md p-4">
        {currentScreen === 'input' && (
          <section className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-semibold mb-2">
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 pb-6 z-20">
        <button
          onClick={() => setCurrentScreen('input')}
          className={cn(
            "flex flex-col items-center gap-1 text-xs",
            currentScreen === 'input' ? "text-blue-600" : "text-slate-400"
          )}
        >
          <Clock size={24} />
          <span>入力</span>
        </button>
        <button
          onClick={() => setCurrentScreen('records')}
          className={cn(
            "flex flex-col items-center gap-1 text-xs",
            currentScreen === 'records' ? "text-blue-600" : "text-slate-400"
          )}
        >
          <List size={24} />
          <span>履歴</span>
        </button>
        <button
          onClick={() => setCurrentScreen('data')}
          className={cn(
            "flex flex-col items-center gap-1 text-xs",
            currentScreen === 'data' ? "text-blue-600" : "text-slate-400"
          )}
        >
          <Database size={24} />
          <span>管理</span>
        </button>
      </nav>
    </div>
  )
}

export default App
