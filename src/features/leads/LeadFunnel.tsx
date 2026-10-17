import { Card, EmptyState } from '../../components/ui/Card'
import { COLORS } from '../../components/charts/theme'
import { formatPercent } from '../../lib/format'
import { leadFunnel } from '../../lib/metrics'
import type { SectionProps } from '../types'

const stageColors = [COLORS.blue, COLORS.green, COLORS.amber]

export function LeadFunnel({ data, onDrill }: SectionProps) {
  const { stages, unqualified } = leadFunnel(data)
  const open = (label: string, ids: string[]) => onDrill({ title: `${label} leads`, kind: 'lead', ids })
  return (
    <Card title="Lead Funnel" subtitle="Share of new leads reaching each stage">
      {stages[0].count === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col items-center gap-1">
          {stages.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => open(s.label, s.ids)}
              aria-label={`${s.label}: ${s.count} leads, ${formatPercent(s.pct)}`}
              className="flex h-14 flex-col items-center justify-center text-white"
              style={{
                width: `${Math.max(36, 100 - i * 24)}%`, background: stageColors[i],
                clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
              }}
            >
              <span className="text-[11px] font-medium">{s.label}</span>
              <span className="tabular text-sm font-bold leading-tight">{s.count}</span>
              <span className="tabular text-[10px] opacity-90">{formatPercent(s.pct)}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => open(unqualified.label, unqualified.ids)}
            className="mt-2 w-full rounded border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
          >
            Unqualified <span className="tabular font-semibold text-navy">{unqualified.count}</span> ({formatPercent(unqualified.pct)})
          </button>
        </div>
      )}
    </Card>
  )
}
