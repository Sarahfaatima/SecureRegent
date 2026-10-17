import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BarList } from '../../components/charts/BarList'
import { Legend } from '../../components/charts/Legend'
import { axisProps, COLORS, tooltipProps } from '../../components/charts/theme'
import { DataTable, type Column } from '../../components/tables/DataTable'
import { Badge } from '../../components/ui/Badge'
import { Card, EmptyState } from '../../components/ui/Card'
import { formatINR, formatINRCompact, formatPercent } from '../../lib/format'
import {
  dailyRevenue, dealsByService, dealStageBreakdown, priorityBreakdown, revenueTotals, type PriorityRow,
} from '../../lib/metrics'
import type { SectionProps } from '../types'

export function DealSection({ data, range, dataset, onDrill }: SectionProps) {
  const byService = useMemo(() => dealsByService(data, dataset.services), [data, dataset.services])
  const priorities = useMemo(() => priorityBreakdown(data), [data])
  const trend = useMemo(() => dailyRevenue(data, range), [data, range])
  const totals = useMemo(() => revenueTotals(data), [data])
  const stages = useMemo(() => dealStageBreakdown(data), [data])
  const maxDeals = Math.max(...byService.map((r) => r.deals), 1)
  const maxRevenue = Math.max(...byService.map((r) => r.revenue), 1)

  const priorityColumns: Column<PriorityRow>[] = [
    { key: 'priority', header: 'Priority', render: (r) => <Badge value={r.priority} /> },
    { key: 'deals', header: 'Deals', align: 'right', render: (r) => r.deals },
    { key: 'revenue', header: 'Revenue', align: 'right', render: (r) => formatINR(r.revenue) },
    { key: 'pct', header: '%', align: 'right', render: (r) => formatPercent(r.pct) },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
      <Card title="Deals Created vs Deal Revenue" subtitle="By service; each measure uses its own scale">
        {byService.length === 0 ? <EmptyState /> : (
          <ul className="flex flex-col gap-1">
            <li className="grid grid-cols-[6rem_1fr_1fr] gap-3 px-1 text-[11px] font-medium text-slate-500">
              <span>Service</span><span>Deals</span><span>Revenue</span>
            </li>
            {byService.map((r) => (
              <li key={r.serviceId}>
                <button
                  type="button"
                  onClick={() => onDrill({ title: `Deals: ${r.name}`, kind: 'deal', ids: r.ids })}
                  className="grid w-full grid-cols-[6rem_1fr_1fr] items-center gap-3 rounded px-1 py-1 text-xs hover:bg-slate-50"
                >
                  <span className="truncate text-left text-slate-600" title={r.name}>{r.shortName}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 rounded-sm" style={{ width: `${(r.deals / maxDeals) * 70}%`, minWidth: 2, background: COLORS.blue }} />
                    <span className="tabular font-semibold text-navy">{r.deals}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 rounded-sm" style={{ width: `${(r.revenue / maxRevenue) * 55}%`, minWidth: 2, background: COLORS.amber }} />
                    <span className="tabular font-semibold text-navy">{formatINRCompact(r.revenue)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Revenue by Service Category" subtitle="Deal value created">
        <BarList
          color={COLORS.blue}
          items={byService.map((r) => ({
            key: r.serviceId, label: r.shortName, value: r.revenue,
            display: `${formatINRCompact(r.revenue)} (${formatPercent(totals.dealValue ? (r.revenue / totals.dealValue) * 100 : 0, 0)})`,
            onClick: () => onDrill({ title: `Deals: ${r.name}`, kind: 'deal', ids: r.ids }),
          }))}
        />
      </Card>

      <Card title="Priority Breakdown">
        <DataTable
          columns={priorityColumns} rows={priorities.filter(() => data.deals.length > 0)} rowKey={(r) => r.priority}
          caption="Deals and revenue by priority"
          onRowClick={(r) => onDrill({ title: `${r.priority} priority deals`, kind: 'deal', ids: r.ids })}
        />
        <h4 className="mb-1 mt-4 text-xs font-semibold text-navy">Deal Stages</h4>
        <ul>
          {stages.map((s) => (
            <li key={s.stage}>
              <button
                type="button"
                onClick={() => onDrill({ title: `Deals in ${s.stage}`, kind: 'deal', ids: s.ids })}
                className="flex w-full items-center gap-2 rounded px-1 py-1 text-xs hover:bg-slate-50"
              >
                <Badge value={s.stage} />
                <span className="tabular ml-auto font-semibold text-navy">{s.deals}</span>
                <span className="tabular w-16 text-right text-slate-500">{formatINRCompact(s.value)}</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Daily Revenue Trend" subtitle="Deal value created vs payments collected" actions={<Legend items={[{ label: 'Deal value', color: COLORS.blue }, { label: 'Collected', color: COLORS.green }]} />}>
        {data.deals.length === 0 && data.payments.length === 0 ? <EmptyState /> : (
          <div className="h-44" role="img" aria-label="Line chart of daily deal value and collected revenue">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <CartesianGrid stroke={COLORS.grid} vertical={false} />
                <XAxis dataKey="label" {...axisProps} minTickGap={24} />
                <YAxis {...axisProps} tickFormatter={formatINRCompact} />
                <Tooltip {...tooltipProps} formatter={(v) => formatINR(Number(v))} />
                <Line isAnimationActive={false} type="monotone" dataKey="revenue" name="Deal value" stroke={COLORS.blue} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line isAnimationActive={false} type="monotone" dataKey="collected" name="Collected" stroke={COLORS.green} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
          <div><dt className="text-slate-500">Total deal value</dt><dd className="tabular text-sm font-bold text-navy">{formatINR(totals.dealValue)}</dd></div>
          <div><dt className="text-slate-500">Collected</dt><dd className="tabular text-sm font-bold text-emerald-700">{formatINR(totals.collected)}</dd></div>
          <div><dt className="text-slate-500">Outstanding</dt><dd className="tabular text-sm font-bold text-amber-700">{formatINR(totals.outstanding)}</dd></div>
        </dl>
        <p className="mt-2 text-[11px] text-slate-500">Outstanding is the receivable balance of all orders at the end of the selected range.</p>
      </Card>
    </div>
  )
}
