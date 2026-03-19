import { useState } from 'react'
import { cn } from '../../lib/utils'
import { HourlyForm } from './HourlyForm'
import { RangeForm } from './RangeForm'

type InputMode = 'hourly' | 'range'

export function InputScreen() {
  const [mode, setMode] = useState<InputMode>('hourly')

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setMode('hourly')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
            mode === 'hourly' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
          )}
        >
          定時入力
        </button>
        <button
          onClick={() => setMode('range')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
            mode === 'range' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
          )}
        >
          範囲入力
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        {mode === 'hourly' ? <HourlyForm /> : <RangeForm />}
      </div>
    </div>
  )
}
