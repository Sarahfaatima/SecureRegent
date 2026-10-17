import { useMemo, useState, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import type { DataIndex } from '../../data'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/Card'
import { SearchInput, Select } from '../../components/ui/Controls'
import { Drawer } from '../../components/ui/Drawer'
import type { OpenRecord, OpenRecordFn } from '../../components/ui/RecordLink'
import { formatDate, formatDateTime, formatINR, statusLabel } from '../../lib/format'
import type { DrillSpec } from '../../lib/metrics'
import { orderStatus } from '../../lib/metrics'
import { describeRecord, KIND_LABEL, type RecordSummary } from '../../lib/records'

export type DrawerView = { type: 'list'; spec: DrillSpec } | { type: 'record'; record: OpenRecord }

interface DetailDrawerProps {
  stack: DrawerView[]
  index: DataIndex
  now: Date
  onOpen: OpenRecordFn
  onBack: () => void
  onClose: () => void
}

function RecordRows({ items, onOpen, empty }: { items: RecordSummary[]; onOpen: OpenRecordFn; empty?: string }) {
  if (items.length === 0) return <EmptyState message={empty} />
  return (
    <ul className="divide-y divide-slate-100 rounded-md border border-slate-200">
      {items.map((r) => (
        <li key={`${r.kind}-${r.id}`}>
          <button type="button" onClick={() => onOpen({ kind: r.kind, id: r.id })} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50">
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-blue-600">{r.id}</span>
                <span className="truncate text-navy">{r.title}</span>
              </span>
              <span className="block truncate text-[11px] text-slate-500">{r.subtitle} · {formatDate(r.date)}</span>
            </span>
            {r.amount !== null && <span className="tabular text-xs font-semibold text-navy">{formatINR(r.amount)}</span>}
            {r.status !== 'received' && <Badge value={r.status} />}
            <ChevronRight size={14} aria-hidden className="text-slate-400" />
          </button>
        </li>
      ))}
    </ul>
  )
}

function ListView({ spec, index, now, onOpen }: { spec: DrillSpec; index: DataIndex; now: Date; onOpen: OpenRecordFn }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const all = useMemo(
    () => spec.ids.map((id) => describeRecord(spec.kind, id, index, now)).filter((r): r is RecordSummary => r !== undefined),
    [spec, index, now],
  )
  const statuses = useMemo(() => [...new Set(all.map((r) => r.status))], [all])
  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter((r) => (status === 'all' || r.status === status) && (!q || `${r.id} ${r.title} ${r.subtitle}`.toLowerCase().includes(q)))
  }, [all, query, status])
  const total = items.reduce((s, r) => s + (r.amount ?? 0), 0)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex-1"><SearchInput value={query} onChange={setQuery} label={`Search ${KIND_LABEL[spec.kind].toLowerCase()} records`} /></div>
        {statuses.length > 1 && (
          <Select label="Filter by status" value={status} onChange={setStatus} className="h-8"
            options={[{ value: 'all', label: 'All statuses' }, ...statuses.map((s) => ({ value: s, label: statusLabel(s) }))]} />
        )}
      </div>
      <p className="text-xs text-slate-500">
        {items.length} {KIND_LABEL[spec.kind].toLowerCase()}{items.length === 1 ? '' : 's'}
        {all.some((r) => r.amount !== null) && <> · total <span className="tabular font-semibold text-navy">{formatINR(total)}</span></>}
      </p>
      <RecordRows items={items} onOpen={onOpen} empty="No records match your search." />
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </section>
  )
}

function Facts({ facts }: { facts: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
      {facts.map(([k, v]) => (
        <div key={k}><dt className="text-slate-500">{k}</dt><dd className="mt-0.5 font-medium text-navy">{v}</dd></div>
      ))}
    </dl>
  )
}

function RecordView({ record, index, now, onOpen }: { record: OpenRecord; index: DataIndex; now: Date; onOpen: OpenRecordFn }) {
  const emp = (id: string) => index.employee.get(id)?.name ?? id
  const svc = (id: string) => index.service.get(id)?.name ?? id
  const rows = (kind: OpenRecord['kind'], ids: string[]) =>
    ids.map((id) => describeRecord(kind, id, index, now)).filter((r): r is RecordSummary => r !== undefined)
  const link = (kind: OpenRecord['kind'], id: string) => (
    <button type="button" onClick={() => onOpen({ kind, id })} className="text-blue-600 hover:underline">{id}</button>
  )

  switch (record.kind) {
    case 'lead': {
      const l = index.lead.get(record.id)
      if (!l) return <EmptyState message="Record not found." />
      return (
        <>
          <Facts facts={[['Company', l.company], ['Source', l.source], ['Status', <Badge key="s" value={l.status} />], ['Service', svc(l.serviceId)], ['Owner', emp(l.ownerId)], ['Created', formatDateTime(l.createdAt)]]} />
          <Section title="Quotations"><RecordRows items={rows('quotation', (index.quotationsByLead.get(l.id) ?? []).map((q) => q.id))} onOpen={onOpen} empty="No quotations for this lead." /></Section>
          <Section title="Deals"><RecordRows items={rows('deal', (index.dealsByLead.get(l.id) ?? []).map((d) => d.id))} onOpen={onOpen} empty="No deals for this lead." /></Section>
        </>
      )
    }
    case 'quotation': {
      const q = index.quotation.get(record.id)
      if (!q) return <EmptyState message="Record not found." />
      const deals = (index.dealsByLead.get(q.leadId) ?? []).filter((d) => d.quotationId === q.id)
      return (
        <>
          <Facts facts={[['Service', svc(q.serviceId)], ['Amount', formatINR(q.amount)], ['Status', <Badge key="s" value={q.status} />], ['Lead', link('lead', q.leadId)], ['Owner', emp(q.ownerId)], ['Created', formatDateTime(q.createdAt)]]} />
          <Section title="Resulting deal"><RecordRows items={rows('deal', deals.map((d) => d.id))} onOpen={onOpen} empty="This quotation has not become a deal." /></Section>
          <Section title="Other quotations for this lead"><RecordRows items={rows('quotation', (index.quotationsByLead.get(q.leadId) ?? []).filter((x) => x.id !== q.id).map((x) => x.id))} onOpen={onOpen} empty="No other quotations." /></Section>
        </>
      )
    }
    case 'deal': {
      const d = index.deal.get(record.id)
      if (!d) return <EmptyState message="Record not found." />
      const orders = index.ordersByDeal.get(d.id) ?? []
      const payments = orders.flatMap((o) => index.paymentsByOrder.get(o.id) ?? [])
      const paid = payments.reduce((s, p) => s + p.amount, 0)
      return (
        <>
          <Facts facts={[['Service', svc(d.serviceId)], ['Deal value', formatINR(d.value)], ['Stage', <Badge key="st" value={d.stage} />], ['Priority', <Badge key="p" value={d.priority} />], ['Lead', link('lead', d.leadId)], ['Quotation', link('quotation', d.quotationId)], ['Collected', formatINR(paid)], ['Balance', formatINR(Math.max(0, d.value - paid))], ['Owner', emp(d.ownerId)], ['Created', formatDateTime(d.createdAt)]]} />
          <Section title="Orders"><RecordRows items={rows('order', orders.map((o) => o.id))} onOpen={onOpen} empty="No orders yet." /></Section>
          <Section title="Payments"><RecordRows items={rows('payment', payments.map((p) => p.id))} onOpen={onOpen} empty="No payments received." /></Section>
        </>
      )
    }
    case 'order': {
      const o = index.order.get(record.id)
      if (!o) return <EmptyState message="Record not found." />
      const payments = index.paymentsByOrder.get(o.id) ?? []
      const invoices = index.invoicesByOrder.get(o.id) ?? []
      const paid = payments.reduce((s, p) => s + p.amount, 0)
      return (
        <>
          <Facts facts={[['Service', svc(o.serviceId)], ['Order value', formatINR(o.value)], ['Status', <Badge key="s" value={orderStatus(o, now)} />], ['Progress', `${o.stagesDone} of ${o.stagesTotal} stages`], ['Deal', link('deal', o.dealId)], ['Due', formatDate(o.dueDate)], ['Collected', formatINR(paid)], ['Balance', formatINR(o.value - paid)], ['Sales owner', emp(o.ownerId)], ['Operations', emp(o.assigneeId)]]} />
          <Section title="Invoices">
            {invoices.length === 0 ? <EmptyState message="No invoices generated." /> : (
              <ul className="divide-y divide-slate-100 rounded-md border border-slate-200 text-xs">
                {invoices.map((i) => (
                  <li key={i.id} className="flex items-center justify-between px-3 py-2"><span className="font-medium text-navy">{i.id}</span><span className="text-slate-500">{formatDate(i.issuedAt)}</span><span className="tabular font-semibold">{formatINR(i.amount)}</span></li>
                ))}
              </ul>
            )}
          </Section>
          <Section title="Payments"><RecordRows items={rows('payment', payments.map((p) => p.id))} onOpen={onOpen} empty="No payments received." /></Section>
        </>
      )
    }
    case 'payment': {
      const p = index.payment.get(record.id)
      if (!p) return <EmptyState message="Record not found." />
      const order = index.order.get(p.orderId)
      return (
        <Facts facts={[['Amount', formatINR(p.amount)], ['Method', p.method], ['Service', svc(p.serviceId)], ['Received', formatDateTime(p.paidAt)], ['Order', link('order', p.orderId)], ['Deal', order ? link('deal', order.dealId) : '–'], ['Recorded by', emp(p.ownerId)]]} />
      )
    }
  }
}

export function DetailDrawer({ stack, index, now, onOpen, onBack, onClose }: DetailDrawerProps) {
  const view = stack[stack.length - 1]
  if (!view) return <Drawer open={false} title="" onClose={onClose}>{null}</Drawer>
  const title = view.type === 'list' ? view.spec.title : `${KIND_LABEL[view.record.kind]} ${view.record.id}`
  const subtitle = view.type === 'list' ? 'Select a record for details' : undefined
  return (
    <Drawer open title={title} subtitle={subtitle} onClose={onClose} onBack={stack.length > 1 ? onBack : undefined}>
      {view.type === 'list'
        ? <ListView key={title} spec={view.spec} index={index} now={now} onOpen={onOpen} />
        : <RecordView record={view.record} index={index} now={now} onOpen={onOpen} />}
    </Drawer>
  )
}
