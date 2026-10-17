import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BarList } from '../../components/charts/BarList'
import { axisProps, COLORS, tooltipProps } from '../../components/charts/theme'
import { DataTable, type Column } from '../../components/tables/DataTable'
import { Card, EmptyState } from '../../components/ui/Card'
import { SearchInput, Select } from '../../components/ui/Controls'
import { RecordLink } from '../../components/ui/RecordLink'
import { formatDateTime, formatINR, formatINRCompact } from '../../lib/format'
import { dailyCollections, outstandingRows, paymentMethods } from '../../lib/metrics'
import type { Payment } from '../../types'
import type { SectionProps } from '../types'

export function PaymentSection({ data, range, dataset, index, onDrill, onOpen }: SectionProps) {
  const [query, setQuery] = useState('')
  const [method, setMethod] = useState('all')
  const trend = useMemo(() => dailyCollections(data, range), [data, range])
  const methods = useMemo(() => paymentMethods(data), [data])
  const outstanding = useMemo(() => outstandingRows(data, dataset.services), [data, dataset.services])
  const collected = data.payments.reduce((s, p) => s + p.amount, 0)

  const history = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.payments
      .filter((p) => method === 'all' || p.method === method)
      .filter((p) => !q || [p.id, p.orderId, index.order.get(p.orderId)?.dealId ?? '', p.method].some((v) => v.toLowerCase().includes(q)))
      .slice()
      .reverse()
  }, [data.payments, method, query, index])

  const columns: Column<Payment>[] = [
    { key: 'id', header: 'Payment', render: (p) => <RecordLink kind="payment" id={p.id} onOpen={onOpen} /> },
    { key: 'order', header: 'Order', render: (p) => <RecordLink kind="order" id={p.orderId} onOpen={onOpen} /> },
    { key: 'service', header: 'Service', render: (p) => index.service.get(p.serviceId)?.shortName },
    { key: 'method', header: 'Method', render: (p) => p.method },
    { key: 'date', header: 'Received', render: (p) => formatDateTime(p.paidAt) },
    { key: 'amount', header: 'Amount', align: 'right', render: (p) => formatINR(p.amount) },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Payment History" subtitle={`${history.length} payments, ${formatINR(history.reduce((s, p) => s + p.amount, 0))}`}
        actions={
          <>
            <div className="w-32"><SearchInput value={query} onChange={setQuery} label="Search payments" /></div>
            <Select label="Filter payments by method" value={method} onChange={setMethod} className="h-8" options={[{ value: 'all', label: 'All methods' }, ...['UPI', 'Bank Transfer', 'Card', 'Cheque'].map((m) => ({ value: m, label: m }))]} />
          </>
        }
      >
        <DataTable columns={columns} rows={history} rowKey={(p) => p.id} caption="Payment history" maxHeight="max-h-72" emptyMessage="No payments match the current filters." />
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <Card title="Collection Trend" subtitle={`${formatINR(collected)} collected in this period`}>
          {data.payments.length === 0 ? <EmptyState /> : (
            <div className="h-40" role="img" aria-label="Bar chart of daily collections">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
                  <CartesianGrid stroke={COLORS.grid} vertical={false} />
                  <XAxis dataKey="label" {...axisProps} minTickGap={24} />
                  <YAxis {...axisProps} tickFormatter={formatINRCompact} />
                  <Tooltip {...tooltipProps} formatter={(v) => formatINR(Number(v))} />
                  <Bar isAnimationActive={false} dataKey="collected" name="Collected" fill={COLORS.green} radius={[3, 3, 0, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card title="Outstanding Payments" subtitle={`${formatINR(data.outstanding)} receivable at end of range`}>
            <BarList color={COLORS.amber} labelWidth="w-20" items={outstanding.map((r) => ({ key: r.serviceId, label: r.shortName, value: r.amount, display: formatINRCompact(r.amount) }))} />
          </Card>
          <Card title="Collections by Method">
            <BarList
              color={COLORS.violet} labelWidth="w-20"
              items={methods.map((m) => ({ key: m.method, label: m.method, value: m.amount, display: formatINRCompact(m.amount), onClick: () => onDrill({ title: `${m.method} payments`, kind: 'payment', ids: m.ids }) }))}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
