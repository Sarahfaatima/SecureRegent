/**
 * Data model. Every record references others by stable ID only.
 *
 * Employee ─┬─< Lead ─┬─< Quotation ──(accepted)──> Deal
 *           │         └─< Deal ─< Order ─┬─< Payment
 *           │                            └─< Invoice
 *
 * - A lead has many quotations and many deals.
 * - A deal is raised from one accepted quotation and has many orders.
 * - A payment belongs to exactly ONE order (and so, transitively, one deal);
 *   an order has many payments (instalments) and many invoices (milestones).
 */

export type Team = 'Sales' | 'Operations'
export type LeadSource = 'Google Ads' | 'Website' | 'Referral' | 'Just Dial' | 'LinkedIn' | 'Other'
export type LeadStatus = 'new' | 'qualified' | 'converted' | 'unqualified'
export type QuotationStatus = 'accepted' | 'pending' | 'rejected'
export type Priority = 'High' | 'Medium' | 'Low'
export type DealStage = 'Onboarding' | 'Documentation' | 'Processing' | 'Delivered'
export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'
export type PaymentMethod = 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque'
export type RecordKind = 'lead' | 'quotation' | 'deal' | 'order' | 'payment'

export interface Employee {
  id: string
  name: string
  team: Team
}

export interface Service {
  id: string
  name: string
  shortName: string
}

export interface Lead {
  id: string
  name: string
  company: string
  source: LeadSource
  status: LeadStatus
  ownerId: string
  serviceId: string
  createdAt: string
}

export interface Quotation {
  id: string
  leadId: string
  serviceId: string
  ownerId: string
  amount: number
  status: QuotationStatus
  createdAt: string
}

export interface Deal {
  id: string
  leadId: string
  quotationId: string
  serviceId: string
  ownerId: string
  value: number
  priority: Priority
  stage: DealStage
  createdAt: string
}

export interface Order {
  id: string
  dealId: string
  serviceId: string
  /** Sales owner of the parent deal. */
  ownerId: string
  /** Operations employee executing the order. */
  assigneeId: string
  value: number
  stagesTotal: number
  stagesDone: number
  createdAt: string
  dueDate: string
}

export interface Payment {
  id: string
  orderId: string
  serviceId: string
  ownerId: string
  amount: number
  method: PaymentMethod
  paidAt: string
}

export interface Invoice {
  id: string
  orderId: string
  serviceId: string
  ownerId: string
  amount: number
  issuedAt: string
}

export interface ActivityLog {
  id: string
  at: string
  employeeId: string
  serviceId: string
  action: string
  recordKind: RecordKind
  recordId: string
}

export interface Dataset {
  employees: Employee[]
  services: Service[]
  leads: Lead[]
  quotations: Quotation[]
  deals: Deal[]
  orders: Order[]
  payments: Payment[]
  invoices: Invoice[]
  activity: ActivityLog[]
}

export type DatePreset = 'today' | '7d' | '30d' | 'custom'

export interface DateRange {
  start: Date
  end: Date
}

export interface Filters {
  preset: DatePreset
  customStart: string
  customEnd: string
  userId: string
  serviceId: string
}
