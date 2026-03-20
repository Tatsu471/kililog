import { useState } from 'react'
import { cn } from '../../lib/utils'
import { HourlyForm } from './HourlyForm'
import { RangeForm } from './RangeForm'

type InputMode = 'hourly' | 'range'

export function InputScreen() {
  const [mode, setMode] = useState<InputMode>('hourly')

  return (
    <div className="space-y-6">
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-sm">
        <button
          onClick={() => setMode('hourly')}
          className={cn(
            "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300",
            mode === 'hourly' 
              ? "bg-blue-600/20 text-blue-400 shadow-inner border border-white/10" 
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          定時入力
        </button>
        <button
          onClick={() => setMode('range')}
          className={cn(
            "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300",
            mode === 'range' 
              ? "bg-blue-600/20 text-blue-400 shadow-inner border border-white/10" 
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          範囲入力
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl border border-white/20">
        {mode === 'hourly' ? <HourlyForm /> : <RangeForm />}
      </div>
    </div>
  )
}
