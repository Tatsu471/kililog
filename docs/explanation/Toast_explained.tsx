import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Toast.tsx：カスタム通知システム
 * 
 * ブラウザ標準の alert() ではなく、アプリのデザインに統一感を持たせた
 * プレミアムなトースト通知を React Context で実装しています。
 */

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

// どこのコンポーネントからでも toast.success() と呼べるようにインターフェースを定義
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

  // 指定したIDの通知を削除する
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // 新しい通知を追加し、3秒後に自動的に削除されるようにタイマーをセット
  const addToast = useCallback((message: string, type: ToastType) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 3000)
  }, [removeToast])

  // Context経由で公開する関数
  const toast = {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    info: (msg: string) => addToast(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* 
          通知の表示領域：
          - fixed bottom-24: ナビゲーションバーのすぐ上に固定
          - z-50: 常に最前面に表示
      */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-xs px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            {/* インラインスタイルでCSSキーフレームアニメーション（滑らかなスライドイン）を適用 */}
            style={{ animation: 'toast-in 0.3s ease-out' }}
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-2xl pointer-events-auto",
              // 種別（成功・失敗・情報）に応じた配色設定
              t.type === 'success' && "bg-emerald-500/20 border-emerald-500/20 text-emerald-400",
              t.type === 'error' && "bg-rose-500/20 border-rose-500/20 text-rose-400",
              t.type === 'info' && "bg-blue-500/20 border-blue-500/20 text-blue-400"
            )}
          >
            {/* Tailwind 4ではまだ標準でない複雑なアニメーションを直接CSSで記述 */}
            <style>{`
              @keyframes toast-in {
                from { transform: translateY(1rem); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>
            
            {/* Lucide Icon の切り替え */}
            {t.type === 'success' && <CheckCircle2 size={18} />}
            {t.type === 'error' && <AlertCircle size={18} />}
            {t.type === 'info' && <Info size={18} />}
            
            <p className="text-sm font-medium flex-1 leading-tight">{t.message}</p>
            
            {/* 手動で閉じられるためのボタン */}
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

// 簡単なショートカットフックを提供
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context.toast
}
