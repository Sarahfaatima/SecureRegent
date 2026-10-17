import { useEffect, useRef, type ReactNode } from 'react'
import { ArrowLeft, X } from 'lucide-react'

interface DrawerProps {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  onBack?: () => void
  children: ReactNode
}

export function Drawer({ open, title, subtitle, onClose, onBack, children }: DrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} aria-hidden />
      <aside role="dialog" aria-modal="true" aria-label={title} className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-xl">
        <header className="flex items-start gap-2 border-b border-slate-200 px-4 py-3">
          {onBack && (
            <button type="button" onClick={onBack} aria-label="Back" className="mt-0.5 rounded p-1 text-slate-600 hover:bg-slate-100">
              <ArrowLeft size={16} aria-hidden />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-navy">{title}</h2>
            {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close details" className="rounded p-1 text-slate-600 hover:bg-slate-100">
            <X size={16} aria-hidden />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </div>
  )
}
