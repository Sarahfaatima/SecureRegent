import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string
  icon: LucideIcon
  change: number | null
  comparisonLabel: string
  /** For metrics where a decrease is good (e.g. unqualified leads). */
  invertTone?: boolean
  detail?: { value: string; label: string }
  onClick: () => void
}

function Change({ change, invertTone, comparisonLabel }: Pick<KpiCardProps, 'change' | 'invertTone' | 'comparisonLabel'>) {
  if (change === null) {
    return <span className="text-xs text-slate-500"><span className="font-semibold text-blue-700">New</span> vs {comparisonLabel}</span>
  }
  const up = change > 0
  const good = change === 0 ? null : up !== !!invertTone
  const Icon = change === 0 ? Minus : up ? ArrowUpRight : ArrowDownRight
  const tone = good === null ? 'text-slate-500' : good ? 'text-emerald-600' : 'text-red-600'
  return (
    <span className="text-xs text-slate-500">
      <span className={`inline-flex items-center gap-0.5 font-semibold ${tone}`}>
        <Icon size={13} aria-hidden />
        <span className="tabular">{up ? '+' : ''}{+change.toFixed(1)}%</span>
        <span className="sr-only">{up ? 'increase' : change < 0 ? 'decrease' : 'no change'}</span>
      </span>{' '}
      vs {comparisonLabel}
    </span>
  )
}

export function KpiCard({ label, value, icon: Icon, change, comparisonLabel, invertTone, detail, onClick }: KpiCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}: ${value}. View records`}
      className="flex min-w-0 flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3.5 text-left shadow-sm transition-colors hover:border-blue-300"
    >
      <span className="flex items-center gap-2 text-xs text-slate-600">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-50 text-blue-600"><Icon size={14} aria-hidden /></span>
        {label}
      </span>
      <span className="flex items-end justify-between gap-2">
        <span className="tabular text-2xl font-bold leading-none text-navy">{value}</span>
        {detail && (
          <span className="text-right leading-tight">
            <span className="tabular block text-xs font-semibold text-navy">{detail.value}</span>
            <span className="text-[11px] text-slate-500">{detail.label}</span>
          </span>
        )}
      </span>
      <Change change={change} invertTone={invertTone} comparisonLabel={comparisonLabel} />
    </button>
  )
}
