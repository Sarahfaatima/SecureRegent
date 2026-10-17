import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, EmptyState } from '../../components/ui/Card'
import { sourceColors, tooltipProps } from '../../components/charts/theme'
import { formatPercent } from '../../lib/format'
import { leadSources } from '../../lib/metrics'
import type { SectionProps } from '../types'

export function LeadSources({ data, onDrill }: SectionProps) {
  const slices = useMemo(() => leadSources(data), [data])
  const open = (source: string, ids: string[]) => onDrill({ title: `Leads from ${source}`, kind: 'lead', ids })
  return (
    <Card title="Lead Sources" subtitle="Where new leads come from">
      {slices.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <div className="relative h-36 w-36 shrink-0" role="img" aria-label="Donut chart of leads by source">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie isAnimationActive={false} data={slices} dataKey="count" nameKey="source" innerRadius={44} outerRadius={64} paddingAngle={2} stroke="#fff" onClick={(_, i) => open(slices[i].source, slices[i].ids)} style={{ cursor: 'pointer' }}>
                  {slices.map((s) => <Cell key={s.source} fill={sourceColors[s.source]} />)}
                </Pie>
                <Tooltip {...tooltipProps} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="tabular text-lg font-bold text-navy">{data.leads.length}</span>
              <span className="text-[10px] text-slate-500">TOTAL LEADS</span>
            </div>
          </div>
          <ul className="w-full min-w-0 flex-1">
            {slices.map((s) => (
              <li key={s.source}>
                <button type="button" onClick={() => open(s.source, s.ids)} className="flex w-full items-center gap-2 rounded px-1 py-1 text-xs hover:bg-slate-50">
                  <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: sourceColors[s.source] }} />
                  <span className="flex-1 truncate text-left text-slate-600">{s.source}</span>
                  <span className="tabular font-semibold text-navy">{s.count} ({formatPercent(s.pct)})</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
