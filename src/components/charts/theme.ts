import type { LeadSource, OrderStatus, QuotationStatus } from '../../types'

export const COLORS = {
  blue: '#2563eb',
  green: '#16a34a',
  amber: '#f59e0b',
  violet: '#7c3aed',
  red: '#dc2626',
  teal: '#0891b2',
  slate: '#94a3b8',
  grid: '#e2e8f0',
  axis: '#64748b',
}

export const sourceColors: Record<LeadSource, string> = {
  'Google Ads': COLORS.blue,
  Website: COLORS.green,
  Referral: COLORS.amber,
  'Just Dial': COLORS.violet,
  LinkedIn: COLORS.teal,
  Other: COLORS.slate,
}

export const orderStatusColors: Record<OrderStatus, string> = {
  completed: COLORS.green,
  in_progress: COLORS.blue,
  pending: COLORS.amber,
  overdue: COLORS.red,
}

export const quotationStatusColors: Record<QuotationStatus, string> = {
  accepted: COLORS.green,
  pending: COLORS.amber,
  rejected: COLORS.red,
}

export const axisProps = {
  stroke: COLORS.axis,
  fontSize: 11,
  tickLine: false,
  axisLine: { stroke: COLORS.grid },
} as const

export const tooltipProps = {
  contentStyle: { fontSize: 12, borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: 'none', padding: '6px 10px' },
  labelStyle: { color: '#0f1f3d', fontWeight: 600, marginBottom: 2 },
  cursor: { stroke: '#cbd5e1', fill: '#f1f5f9' },
} as const
