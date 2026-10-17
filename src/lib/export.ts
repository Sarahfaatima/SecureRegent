import type { DataIndex } from '../data'
import type { DateRange } from '../types'
import { formatRange } from './dates'
import { orderStatus, type Kpis, type ScopedData } from './metrics'

type Cell = string | number
interface CsvSection { title: string; header: string[]; rows: Cell[][] }

const escapeCell = (cell: Cell) => {
  const text = String(cell)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(sections: CsvSection[]): string {
  return sections
    .map((s) => [[s.title], s.header, ...s.rows].map((row) => row.map(escapeCell).join(',')).join('\r\n'))
    .join('\r\n\r\n')
}

export function downloadFile(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob(['﻿' + content], { type: mime }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/** Builds one CSV containing the KPI summary plus every filtered record set. */
export function buildDashboardCsv(range: DateRange, kpis: Kpis, s: ScopedData, idx: DataIndex, now: Date): string {
  const emp = (id: string) => idx.employee.get(id)?.name ?? id
  const svc = (id: string) => idx.service.get(id)?.name ?? id
  return toCsv([
    {
      title: `Summary (${formatRange(range)})`,
      header: ['Metric', 'Value'],
      rows: [
        ['Total leads', kpis.totalLeads], ['Qualified leads', kpis.qualified], ['Converted leads', kpis.converted],
        ['Unqualified leads', kpis.unqualified], ['Conversion rate %', kpis.conversionRate.toFixed(1)],
        ['Quotations created', kpis.quotations], ['Deals created', kpis.deals], ['Invoices generated', kpis.invoices],
        ['Outstanding revenue (INR)', s.outstanding],
      ],
    },
    {
      title: 'Leads',
      header: ['Lead ID', 'Name', 'Company', 'Source', 'Status', 'Owner', 'Service', 'Created'],
      rows: s.leads.map((l) => [l.id, l.name, l.company, l.source, l.status, emp(l.ownerId), svc(l.serviceId), l.createdAt]),
    },
    {
      title: 'Quotations',
      header: ['Quotation ID', 'Lead ID', 'Service', 'Amount (INR)', 'Status', 'Owner', 'Created'],
      rows: s.quotations.map((q) => [q.id, q.leadId, svc(q.serviceId), q.amount, q.status, emp(q.ownerId), q.createdAt]),
    },
    {
      title: 'Deals',
      header: ['Deal ID', 'Lead ID', 'Quotation ID', 'Service', 'Value (INR)', 'Priority', 'Stage', 'Owner', 'Created'],
      rows: s.deals.map((d) => [d.id, d.leadId, d.quotationId, svc(d.serviceId), d.value, d.priority, d.stage, emp(d.ownerId), d.createdAt]),
    },
    {
      title: 'Orders',
      header: ['Order ID', 'Deal ID', 'Service', 'Value (INR)', 'Status', 'Stages done', 'Stages total', 'Assignee', 'Due', 'Created'],
      rows: s.orders.map((o) => [o.id, o.dealId, svc(o.serviceId), o.value, orderStatus(o, now), o.stagesDone, o.stagesTotal, emp(o.assigneeId), o.dueDate, o.createdAt]),
    },
    {
      title: 'Payments',
      header: ['Payment ID', 'Order ID', 'Deal ID', 'Service', 'Amount (INR)', 'Method', 'Paid at'],
      rows: s.payments.map((p) => [p.id, p.orderId, idx.order.get(p.orderId)?.dealId ?? '', svc(p.serviceId), p.amount, p.method, p.paidAt]),
    },
  ])
}
