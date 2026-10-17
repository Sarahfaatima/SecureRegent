import { Crosshair } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { COLORS } from '../../components/charts/theme'
import { formatINR, formatPercent } from '../../lib/format'
import { MONTHLY_REVENUE_TARGET, revenueTarget } from '../../lib/metrics'
import type { SectionProps } from '../types'

export function TargetCard({ data, range }: SectionProps) {
  const t = revenueTarget(data, range)
  return (
    <Card title="Target Achievement" subtitle="Collected revenue against the pro-rated monthly target">
      <p className="text-xs text-slate-500">Monthly revenue target</p>
      <p className="tabular text-xl font-bold text-navy">{formatINR(MONTHLY_REVENUE_TARGET)}</p>
      <dl className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 text-xs">
        <dt className="flex items-center gap-1.5 text-slate-600"><span aria-hidden className="h-2 w-2 rounded-full" style={{ background: COLORS.green }} />Achieved</dt>
        <dd className="tabular text-right font-semibold text-navy">{formatINR(t.achieved)}</dd>
        <dd className="tabular w-12 text-right text-slate-500">{formatPercent(t.pct)}</dd>
        <dt className="flex items-center gap-1.5 text-slate-600"><span aria-hidden className="h-2 w-2 rounded-full bg-slate-300" />Remaining</dt>
        <dd className="tabular text-right font-semibold text-navy">{formatINR(t.remaining)}</dd>
        <dd className="tabular w-12 text-right text-slate-500">{formatPercent(Math.max(0, 100 - t.pct))}</dd>
      </dl>
      <div
        className="mt-3 h-2 rounded-sm bg-slate-100" role="progressbar" aria-label="Revenue target achieved"
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round(t.pct))}
      >
        <div className="h-2 rounded-sm" style={{ width: `${Math.min(100, t.pct)}%`, background: COLORS.green }} />
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
        <Crosshair size={13} aria-hidden /> Period target {formatINR(t.target)}
      </p>
    </Card>
  )
}
