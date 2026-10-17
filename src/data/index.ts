import type { Dataset, Deal, Employee, Invoice, Lead, Order, Payment, Quotation, Service } from '../types'
import { groupBy } from '../lib/metrics'
import { generateDataset } from './seed'

export interface DataIndex {
  employee: Map<string, Employee>
  service: Map<string, Service>
  lead: Map<string, Lead>
  quotation: Map<string, Quotation>
  deal: Map<string, Deal>
  order: Map<string, Order>
  payment: Map<string, Payment>
  quotationsByLead: Map<string, Quotation[]>
  dealsByLead: Map<string, Deal[]>
  ordersByDeal: Map<string, Order[]>
  paymentsByOrder: Map<string, Payment[]>
  invoicesByOrder: Map<string, Invoice[]>
}

const byId = <T extends { id: string }>(items: T[]) => new Map(items.map((i) => [i.id, i]))

export function buildIndex(ds: Dataset): DataIndex {
  return {
    employee: byId(ds.employees),
    service: byId(ds.services),
    lead: byId(ds.leads),
    quotation: byId(ds.quotations),
    deal: byId(ds.deals),
    order: byId(ds.orders),
    payment: byId(ds.payments),
    quotationsByLead: groupBy(ds.quotations, (q) => q.leadId),
    dealsByLead: groupBy(ds.deals, (d) => d.leadId),
    ordersByDeal: groupBy(ds.orders, (o) => o.dealId),
    paymentsByOrder: groupBy(ds.payments, (p) => p.orderId),
    invoicesByOrder: groupBy(ds.invoices, (i) => i.orderId),
  }
}

export const NOW = new Date()
export const dataset = generateDataset(NOW)
export const dataIndex = buildIndex(dataset)
