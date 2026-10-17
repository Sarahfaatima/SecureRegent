import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BarList } from '../../components/charts/BarList'
import { Gauge } from '../../components/charts/Gauge'
import { axisProps, COLORS, quotationStatusColors, tooltipProps } from '../../components/charts/theme'
import { DataTable, type Column } from '../../components/tables/DataTable'
import { Badge } from '../../components/ui/Badge'
import { Card, EmptyState } from '../../components/ui/Card'
import { formatINR, formatINRCompact, formatPercent } from '../../lib/format'
import { quotationStatusBreakdown, quoteToDealRate, serviceQuoteRows, type ServiceQuoteRow } from '../../lib/metrics'
import type { SectionProps } from '../types'

export function QuotationSection({ data, dataset, onDrill }: SectionProps) {
  const rows = useMemo(() => serviceQuoteRows(data, dataset.services), [data, dataset.services])
  const statuses = useMemo(() => quotationStatusBreakdown(data), [data])
  const rate = quoteToDealRate(data)
  const drill = (r: ServiceQuoteRow) => onDrill({ title: `Quotations: ${r.name}`, kind: 'quotation', ids: r.ids })
  const totalAmount = rows.reduce((s, r) => s + r.amount, 0)

  const columns: Column<ServiceQuoteRow>[] = [
    { key: 'name', header: 'Service', render: (r) => r.name },
    { key: 'count', header: 'Quotations', align: 'right', render: (r) => r.count },
    { key: 'amount', header: 'Quoted Amount', align: 'right', render: (r) => formatINR(r.amount) },
    { key: 'accepted', header: 'Accepted', align: 'right', render: (r) => r.accepted },
    { key: 'pending', header: 'Pending', align: 'right', render: (r) => r.pending },
    { key: 'rejected', header: 'Rejected', align: 'right', render: (r) => r.rejected },
    { key: 'rate', header: 'Conv.', align: 'right', render: (r) => formatPercent(r.conversionRate) },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-[1fr_1fr_1.6fr_0.8fr]">
      <Card title="Quotations by Service" subtitle="Number of quotations created">
        {rows.length === 0 ? <EmptyState /> : (
          <div className="h-56" role="img" aria-label="Bar chart of quotations by service">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 16, right: 4, bottom: 0, left: -24 }}>
                <CartesianGrid stroke={COLORS.grid} vertical={false} />
                <XAxis dataKey="shortName" {...axisProps} interval={0} angle={-30} textAnchor="end" height={56} />
                <YAxis {...axisProps} allowDecimals={false} />
                <Tooltip {...tooltipProps} />
                <Bar isAnimationActive={false} dataKey="count" name="Quotations" fill={COLORS.blue} radius={[4, 4, 0, 0]} maxBarSize={28} cursor="pointer" onClick={(r) => drill(r as unknown as ServiceQuoteRow)} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card title="Quotation Value by Service" subtitle={`Total quoted ${formatINR(totalAmount)}`}>
        <BarList
          color={COLORS.teal}
          labelWidth="w-24"
          items={rows.slice().sort((a, b) => b.amount - a.amount).map((r) => ({
            key: r.serviceId, label: r.shortName, value: r.amount,
            display: `${formatINRCompact(r.amount)} (${formatPercent(totalAmount ? (r.amount / totalAmount) * 100 : 0, 0)})`,
            onClick: () => drill(r),
          }))}
        />
      </Card>

      <Card title="Service Wise Quotation Details" subtitle="Select a row to list its quotations">
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.serviceId} caption="Quotation details by service" onRowClick={drill} maxHeight="max-h-72" />
      </Card>

      <Card title="Quote to Deal Conversion">
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Gauge
            percent={rate}
            label="Quote to deal conversion rate"
            caption={`${statuses[0].count} deals / ${data.quotations.length} quotations`}
            onClick={() => onDrill({ title: 'Accepted quotations', kind: 'quotation', ids: statuses[0].ids })}
          />
          <ul className="w-full">
            {statuses.map((s) => (
              <li key={s.status}>
                <button
                  type="button"
                  onClick={() => onDrill({ title: `${s.status[0].toUpperCase()}${s.status.slice(1)} quotations`, kind: 'quotation', ids: s.ids })}
                  className="flex w-full items-center gap-2 rounded px-1 py-1 text-xs hover:bg-slate-50"
                >
                  <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: quotationStatusColors[s.status] }} />
                  <Badge value={s.status} />
                  <span className="tabular ml-auto font-semibold text-navy">{s.count}</span>
                  <span className="tabular w-16 text-right text-slate-500">{formatINRCompact(s.amount)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  )
}
