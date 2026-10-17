/**
 * All business calculations live here; UI components only render the results.
 *
 * Definitions
 * - Scope: records whose own event date falls in the selected range (lead/quotation/deal/order
 *   `createdAt`, payment `paidAt`, invoice `issuedAt`) AND that match the user and service filters.
 *   A user matches a record when they own it; an order also matches its operations assignee.
 * - Lead cohort metrics: Qualified = status qualified|converted; Converted = status converted
 *   (the lead has >=1 deal); Unqualified = status unqualified.
 * - Conversion rate = converted leads / total leads x 100.
 * - Quote-to-deal rate = accepted quotations / quotations created x 100. Every accepted quotation has a deal.
 * - Total deal value = sum of deal values created in range.
 * - Collected revenue = sum of payments received in range.
 * - Outstanding revenue = value of all orders created up to range end minus payments received up to range end
 *   (the receivable balance at the end of the period).
 * - Revenue target = monthly target pro-rated to the range length (days / 30).
 * - Percent change vs previous equal period; a zero base yields `null` (shown as "New"), 0 -> 0 is 0%.
 */
import type {
  ActivityLog, Dataset, Deal, DateRange, Employee, Invoice, Lead, LeadSource, Order, OrderStatus,
  Payment, PaymentMethod, Priority, Quotation, QuotationStatus, RecordKind, Service, DealStage,
} from '../types'
import { dayKey, eachDayKey, inRange, rangeDays } from './dates'
import { formatDay } from './format'

export const MONTHLY_REVENUE_TARGET = 650_000

export interface Scope {
  range: DateRange
  userId: string
  serviceId: string
}

export interface ScopedData {
  leads: Lead[]
  quotations: Quotation[]
  deals: Deal[]
  orders: Order[]
  payments: Payment[]
  invoices: Invoice[]
  activity: ActivityLog[]
  /** Receivable balance at the end of the range (see header). */
  outstanding: number
  outstandingByService: Map<string, number>
}

export interface DrillSpec {
  title: string
  kind: RecordKind
  ids: string[]
}

export const ALL = 'all'

const sum = <T,>(items: T[], pick: (item: T) => number) => items.reduce((s, i) => s + pick(i), 0)
const ratio = (a: number, b: number) => (b === 0 ? 0 : (a / b) * 100)

export function groupBy<T>(items: T[], key: (item: T) => string) {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const k = key(item)
    const list = map.get(k)
    if (list) list.push(item)
    else map.set(k, [item])
  }
  return map
}

/** Percent change; null when there is no previous value to compare against. */
export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}

export function orderStatus(order: Order, now: Date): OrderStatus {
  if (order.stagesDone >= order.stagesTotal) return 'completed'
  if (new Date(order.dueDate) < now) return 'overdue'
  return order.stagesDone === 0 ? 'pending' : 'in_progress'
}

export function scopeData(ds: Dataset, scope: Scope): ScopedData {
  const { range, userId, serviceId } = scope
  const svc = (s: string) => serviceId === ALL || s === serviceId
  const owns = (id: string) => userId === ALL || id === userId
  const upTo = (iso: string) => new Date(iso).getTime() <= range.end.getTime()

  const orders = ds.orders.filter((o) => svc(o.serviceId) && (owns(o.ownerId) || owns(o.assigneeId)))
  const paymentsToDate = ds.payments.filter((p) => svc(p.serviceId) && owns(p.ownerId) && upTo(p.paidAt))
  const outstandingByService = new Map<string, number>()
  for (const o of orders) {
    if (upTo(o.createdAt)) outstandingByService.set(o.serviceId, (outstandingByService.get(o.serviceId) ?? 0) + o.value)
  }
  for (const p of paymentsToDate) {
    outstandingByService.set(p.serviceId, (outstandingByService.get(p.serviceId) ?? 0) - p.amount)
  }

  return {
    leads: ds.leads.filter((l) => svc(l.serviceId) && owns(l.ownerId) && inRange(l.createdAt, range)),
    quotations: ds.quotations.filter((q) => svc(q.serviceId) && owns(q.ownerId) && inRange(q.createdAt, range)),
    deals: ds.deals.filter((d) => svc(d.serviceId) && owns(d.ownerId) && inRange(d.createdAt, range)),
    orders: orders.filter((o) => inRange(o.createdAt, range)),
    payments: paymentsToDate.filter((p) => inRange(p.paidAt, range)),
    invoices: ds.invoices.filter((i) => svc(i.serviceId) && owns(i.ownerId) && inRange(i.issuedAt, range)),
    activity: ds.activity.filter((a) => svc(a.serviceId) && owns(a.employeeId) && inRange(a.at, range)),
    outstanding: sum([...outstandingByService.values()], (v) => v),
    outstandingByService,
  }
}

/* ───────── Lead analytics ───────── */

export interface Kpis {
  totalLeads: number
  qualified: number
  converted: number
  unqualified: number
  conversionRate: number
  quotations: number
  deals: number
  invoices: number
}

export function computeKpis(s: ScopedData): Kpis {
  const converted = s.leads.filter((l) => l.status === 'converted').length
  const qualified = converted + s.leads.filter((l) => l.status === 'qualified').length
  return {
    totalLeads: s.leads.length,
    qualified,
    converted,
    unqualified: s.leads.filter((l) => l.status === 'unqualified').length,
    conversionRate: ratio(converted, s.leads.length),
    quotations: s.quotations.length,
    deals: s.deals.length,
    invoices: s.invoices.length,
  }
}

export interface FunnelStage { key: string; label: string; count: number; pct: number; ids: string[] }

export function leadFunnel(s: ScopedData): { stages: FunnelStage[]; unqualified: FunnelStage } {
  const total = s.leads.length
  const make = (key: string, label: string, leads: Lead[]): FunnelStage => ({
    key, label, count: leads.length, pct: ratio(leads.length, total), ids: leads.map((l) => l.id),
  })
  return {
    stages: [
      make('new', 'New Leads', s.leads),
      make('qualified', 'Qualified', s.leads.filter((l) => l.status === 'qualified' || l.status === 'converted')),
      make('converted', 'Converted', s.leads.filter((l) => l.status === 'converted')),
    ],
    unqualified: make('unqualified', 'Unqualified', s.leads.filter((l) => l.status === 'unqualified')),
  }
}

export interface LeadTrendPoint { key: string; label: string; new: number; qualified: number; converted: number }

export function dailyLeadTrend(s: ScopedData, range: DateRange): LeadTrendPoint[] {
  const points = new Map<string, LeadTrendPoint>(
    eachDayKey(range).map((key) => [key, { key, label: formatDay(key), new: 0, qualified: 0, converted: 0 }]),
  )
  for (const l of s.leads) {
    const p = points.get(dayKey(l.createdAt))
    if (!p) continue
    p.new++
    if (l.status === 'qualified' || l.status === 'converted') p.qualified++
    if (l.status === 'converted') p.converted++
  }
  return [...points.values()]
}

export interface SourceSlice { source: LeadSource; count: number; pct: number; ids: string[] }

export function leadSources(s: ScopedData): SourceSlice[] {
  return [...groupBy(s.leads, (l) => l.source)]
    .map(([source, leads]) => ({ source: source as LeadSource, count: leads.length, pct: ratio(leads.length, s.leads.length), ids: leads.map((l) => l.id) }))
    .sort((a, b) => b.count - a.count)
}

export function revenueTarget(s: ScopedData, range: DateRange) {
  const target = Math.round((MONTHLY_REVENUE_TARGET * rangeDays(range)) / 30)
  const achieved = sum(s.payments, (p) => p.amount)
  return { target, achieved, remaining: Math.max(0, target - achieved), pct: ratio(achieved, target) }
}

/* ───────── Quotations ───────── */

export interface ServiceQuoteRow {
  serviceId: string
  name: string
  shortName: string
  count: number
  amount: number
  accepted: number
  pending: number
  rejected: number
  conversionRate: number
  ids: string[]
}

export function serviceQuoteRows(s: ScopedData, services: Service[]): ServiceQuoteRow[] {
  const grouped = groupBy(s.quotations, (q) => q.serviceId)
  const count = (qs: Quotation[], st: QuotationStatus) => qs.filter((q) => q.status === st).length
  return services
    .map((svc) => {
      const qs = grouped.get(svc.id) ?? []
      return {
        serviceId: svc.id, name: svc.name, shortName: svc.shortName, count: qs.length,
        amount: sum(qs, (q) => q.amount), accepted: count(qs, 'accepted'), pending: count(qs, 'pending'),
        rejected: count(qs, 'rejected'), conversionRate: ratio(count(qs, 'accepted'), qs.length), ids: qs.map((q) => q.id),
      }
    })
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
}

export interface StatusSlice { status: QuotationStatus; count: number; amount: number; ids: string[] }

export function quotationStatusBreakdown(s: ScopedData): StatusSlice[] {
  return (['accepted', 'pending', 'rejected'] as const).map((status) => {
    const qs = s.quotations.filter((q) => q.status === status)
    return { status, count: qs.length, amount: sum(qs, (q) => q.amount), ids: qs.map((q) => q.id) }
  })
}

export const quoteToDealRate = (s: ScopedData) => ratio(s.quotations.filter((q) => q.status === 'accepted').length, s.quotations.length)

/* ───────── Deals & revenue ───────── */

export interface ServiceDealRow { serviceId: string; shortName: string; name: string; deals: number; revenue: number; ids: string[] }

export function dealsByService(s: ScopedData, services: Service[]): ServiceDealRow[] {
  const grouped = groupBy(s.deals, (d) => d.serviceId)
  return services
    .map((svc) => {
      const ds = grouped.get(svc.id) ?? []
      return { serviceId: svc.id, shortName: svc.shortName, name: svc.name, deals: ds.length, revenue: sum(ds, (d) => d.value), ids: ds.map((d) => d.id) }
    })
    .filter((r) => r.deals > 0)
    .sort((a, b) => b.revenue - a.revenue)
}

export interface PriorityRow { priority: Priority; deals: number; revenue: number; pct: number; ids: string[] }

export function priorityBreakdown(s: ScopedData): PriorityRow[] {
  const total = sum(s.deals, (d) => d.value)
  return (['High', 'Medium', 'Low'] as const).map((priority) => {
    const ds = s.deals.filter((d) => d.priority === priority)
    const revenue = sum(ds, (d) => d.value)
    return { priority, deals: ds.length, revenue, pct: ratio(revenue, total), ids: ds.map((d) => d.id) }
  })
}

export interface RevenuePoint { key: string; label: string; revenue: number; collected: number }

export function dailyRevenue(s: ScopedData, range: DateRange): RevenuePoint[] {
  const points = new Map<string, RevenuePoint>(
    eachDayKey(range).map((key) => [key, { key, label: formatDay(key), revenue: 0, collected: 0 }]),
  )
  for (const d of s.deals) {
    const p = points.get(dayKey(d.createdAt))
    if (p) p.revenue += d.value
  }
  for (const pay of s.payments) {
    const p = points.get(dayKey(pay.paidAt))
    if (p) p.collected += pay.amount
  }
  return [...points.values()]
}

export function revenueTotals(s: ScopedData) {
  const dealValue = sum(s.deals, (d) => d.value)
  const collected = sum(s.payments, (p) => p.amount)
  return { dealValue, collected, outstanding: s.outstanding, collectionRate: ratio(collected, dealValue) }
}

export interface StageRow { stage: DealStage; deals: number; value: number; ids: string[] }

export function dealStageBreakdown(s: ScopedData): StageRow[] {
  return (['Onboarding', 'Documentation', 'Processing', 'Delivered'] as const).map((stage) => {
    const ds = s.deals.filter((d) => d.stage === stage)
    return { stage, deals: ds.length, value: sum(ds, (d) => d.value), ids: ds.map((d) => d.id) }
  })
}

/* ───────── Orders & payments ───────── */

export const ORDER_STATUSES: OrderStatus[] = ['completed', 'in_progress', 'pending', 'overdue']

export interface OrderStatusRow { status: OrderStatus; count: number; ids: string[] }

export function orderStatusBreakdown(s: ScopedData, now: Date): OrderStatusRow[] {
  return ORDER_STATUSES.map((status) => {
    const os = s.orders.filter((o) => orderStatus(o, now) === status)
    return { status, count: os.length, ids: os.map((o) => o.id) }
  })
}

export interface ServiceOrderRow {
  serviceId: string
  shortName: string
  total: number
  counts: Record<OrderStatus, number>
  ids: Record<OrderStatus, string[]>
}

export function ordersByService(s: ScopedData, services: Service[], now: Date): ServiceOrderRow[] {
  const grouped = groupBy(s.orders, (o) => o.serviceId)
  return services
    .map((svc) => {
      const os = grouped.get(svc.id) ?? []
      const counts = { completed: 0, in_progress: 0, pending: 0, overdue: 0 }
      const ids: Record<OrderStatus, string[]> = { completed: [], in_progress: [], pending: [], overdue: [] }
      for (const o of os) {
        const st = orderStatus(o, now)
        counts[st]++
        ids[st].push(o.id)
      }
      return { serviceId: svc.id, shortName: svc.shortName, total: os.length, counts, ids }
    })
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total)
}

export interface CollectionPoint { key: string; label: string; collected: number }

export function dailyCollections(s: ScopedData, range: DateRange): CollectionPoint[] {
  const points = new Map<string, CollectionPoint>(eachDayKey(range).map((key) => [key, { key, label: formatDay(key), collected: 0 }]))
  for (const p of s.payments) {
    const point = points.get(dayKey(p.paidAt))
    if (point) point.collected += p.amount
  }
  return [...points.values()]
}

export interface MethodRow { method: PaymentMethod; amount: number; count: number; ids: string[] }

export function paymentMethods(s: ScopedData): MethodRow[] {
  return [...groupBy(s.payments, (p) => p.method)]
    .map(([method, ps]) => ({ method: method as PaymentMethod, amount: sum(ps, (p) => p.amount), count: ps.length, ids: ps.map((p) => p.id) }))
    .sort((a, b) => b.amount - a.amount)
}

export interface OutstandingRow { serviceId: string; shortName: string; amount: number }

export function outstandingRows(s: ScopedData, services: Service[]): OutstandingRow[] {
  return services
    .map((svc) => ({ serviceId: svc.id, shortName: svc.shortName, amount: s.outstandingByService.get(svc.id) ?? 0 }))
    .filter((r) => r.amount > 0)
    .sort((a, b) => b.amount - a.amount)
}

/* ───────── Team activity ───────── */

export interface SalesRow {
  employee: Employee
  leads: number
  qualified: number
  converted: number
  conversionRate: number
  quotations: number
  deals: number
  dealValue: number
  revenue: number
  leadIds: string[]
}

export function salesActivity(s: ScopedData, employees: Employee[]): SalesRow[] {
  const leadsBy = groupBy(s.leads, (l) => l.ownerId)
  const quotesBy = groupBy(s.quotations, (q) => q.ownerId)
  const dealsBy = groupBy(s.deals, (d) => d.ownerId)
  const paysBy = groupBy(s.payments, (p) => p.ownerId)
  return employees
    .filter((e) => e.team === 'Sales')
    .map((employee) => {
      const leads = leadsBy.get(employee.id) ?? []
      const deals = dealsBy.get(employee.id) ?? []
      const converted = leads.filter((l) => l.status === 'converted').length
      return {
        employee, leads: leads.length, qualified: leads.filter((l) => l.status === 'qualified').length + converted, converted,
        conversionRate: ratio(converted, leads.length), quotations: (quotesBy.get(employee.id) ?? []).length,
        deals: deals.length, dealValue: sum(deals, (d) => d.value), revenue: sum(paysBy.get(employee.id) ?? [], (p) => p.amount),
        leadIds: leads.map((l) => l.id),
      }
    })
    .filter((r) => r.leads + r.quotations + r.deals + r.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
}

export interface OpsRow {
  employee: Employee
  orders: number
  stagesCompleted: number
  pendingStages: number
  overdue: number
  orderIds: string[]
}

export function operationsActivity(s: ScopedData, employees: Employee[], now: Date): OpsRow[] {
  const ordersBy = groupBy(s.orders, (o) => o.assigneeId)
  return employees
    .filter((e) => e.team === 'Operations')
    .map((employee) => {
      const os = ordersBy.get(employee.id) ?? []
      return {
        employee, orders: os.length, stagesCompleted: sum(os, (o) => o.stagesDone),
        pendingStages: sum(os, (o) => o.stagesTotal - o.stagesDone),
        overdue: os.filter((o) => orderStatus(o, now) === 'overdue').length, orderIds: os.map((o) => o.id),
      }
    })
    .filter((r) => r.orders > 0)
    .sort((a, b) => b.orders - a.orders)
}
