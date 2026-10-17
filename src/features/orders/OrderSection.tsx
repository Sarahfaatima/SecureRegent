import { useMemo } from 'react'
import { Legend } from '../../components/charts/Legend'
import { COLORS, orderStatusColors } from '../../components/charts/theme'
import { Card, EmptyState } from '../../components/ui/Card'
import { statusLabel } from '../../lib/format'
import { ORDER_STATUSES, orderStatusBreakdown, ordersByService } from '../../lib/metrics'
import type { OrderStatus } from '../../types'
import type { SectionProps } from '../types'

export function OrderSection({ data, dataset, now, onDrill }: SectionProps) {
  const summary = useMemo(() => orderStatusBreakdown(data, now), [data, now])
  const rows = useMemo(() => ordersByService(data, dataset.services, now), [data, dataset.services, now])
  const stagesDone = data.orders.reduce((s, o) => s + o.stagesDone, 0)
  const stagesTotal = data.orders.reduce((s, o) => s + o.stagesTotal, 0)
  const progress = stagesTotal ? (stagesDone / stagesTotal) * 100 : 0

  const drill = (status: OrderStatus, ids: string[], service?: string) =>
    onDrill({ title: `${statusLabel(status)} orders${service ? `: ${service}` : ''}`, kind: 'order', ids })

  return (
    <Card title="Orders & Stage Progress" subtitle="Order status overall and by service" actions={<Legend items={ORDER_STATUSES.map((s) => ({ label: statusLabel(s), color: orderStatusColors[s] }))} />}>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {summary.map((s) => (
          <li key={s.status}>
            <button type="button" onClick={() => drill(s.status, s.ids)} className="w-full rounded-md border border-slate-200 p-2.5 text-left hover:border-blue-300">
              <span className="flex items-center gap-1.5 text-xs text-slate-600">
                <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: orderStatusColors[s.status] }} />{statusLabel(s.status)}
              </span>
              <span className="tabular text-xl font-bold text-navy">{s.count}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
        <span>Stage completion</span>
        <div className="h-2 flex-1 rounded-sm bg-slate-100" role="progressbar" aria-label="Stage completion across orders" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
          <div className="h-2 rounded-sm" style={{ width: `${progress}%`, background: COLORS.blue }} />
        </div>
        <span className="tabular font-semibold text-navy">{stagesDone}/{stagesTotal} stages</span>
      </div>
      {rows.length === 0 ? <EmptyState /> : (
        <ul className="mt-3 flex flex-col gap-1" aria-label="Order status by service">
          {rows.map((r) => (
            <li key={r.serviceId} className="flex items-center gap-2 px-1 py-0.5">
              <span className="w-28 shrink-0 truncate text-xs text-slate-600" title={r.shortName}>{r.shortName}</span>
              <span className="flex h-4 flex-1 gap-0.5">
                {ORDER_STATUSES.filter((s) => r.counts[s] > 0).map((s) => (
                  <button
                    key={s} type="button" onClick={() => drill(s, r.ids[s], r.shortName)}
                    aria-label={`${r.shortName}: ${r.counts[s]} ${statusLabel(s)} orders`} title={`${statusLabel(s)}: ${r.counts[s]}`}
                    className="h-4 rounded-sm text-[10px] font-semibold leading-4 text-white"
                    style={{ flexGrow: r.counts[s], background: orderStatusColors[s] }}
                  >
                    {r.counts[s]}
                  </button>
                ))}
              </span>
              <span className="tabular w-8 shrink-0 text-right text-xs font-semibold text-navy">{r.total}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
