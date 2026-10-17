import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface CardProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function Card({ title, subtitle, actions, children, className = '' }: CardProps) {
  return (
    <section className={`flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {(title || actions) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold text-navy">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-3 text-xs">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}

export function SectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <h2 className="mb-3 mt-8 flex items-center gap-2 text-base font-semibold text-navy">
      <span className="text-blue-600">{icon}</span>
      {title}
    </h2>
  )
}

export function EmptyState({ message = 'No records match the current filters.' }: { message?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center text-slate-500" role="status">
      <Inbox size={22} aria-hidden />
      <p className="text-xs">{message}</p>
    </div>
  )
}
