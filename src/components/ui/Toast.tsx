import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void
    error: (msg: string) => void
    info: (msg: string) => void
  }
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 3000)
  }, [removeToast])

  const toast = {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    info: (msg: string) => addToast(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-xs px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{ animation: 'toast-in 0.3s ease-out' }}
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-2xl pointer-events-auto",
              t.type === 'success' && "bg-emerald-500/20 border-emerald-500/20 text-emerald-400",
              t.type === 'error' && "bg-rose-500/20 border-rose-500/20 text-rose-400",
              t.type === 'info' && "bg-blue-500/20 border-blue-500/20 text-blue-400"
            )}
          >
            <style>{`
              @keyframes toast-in {
                from { transform: translateY(1rem); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>
            {t.type === 'success' && <CheckCircle2 size={18} />}
            {t.type === 'error' && <AlertCircle size={18} />}
            {t.type === 'info' && <Info size={18} />}
            <p className="text-sm font-medium flex-1 leading-tight">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context.toast
}
