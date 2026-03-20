

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'キャンセル',
  isDestructive = false,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-semibold text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-300"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
              isDestructive 
                ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/20' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
