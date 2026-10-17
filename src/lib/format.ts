import { format } from 'date-fns'

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('en-IN')

export const formatINR = (value: number) => inr.format(Math.round(value))
export const formatNumber = (value: number) => num.format(value)

/** Compact INR for axes and tight labels: ₹1.2L, ₹3.4Cr, ₹12.5K. */
export function formatINRCompact(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1e7) return `${sign}₹${+(abs / 1e7).toFixed(2)}Cr`
  if (abs >= 1e5) return `${sign}₹${+(abs / 1e5).toFixed(2)}L`
  if (abs >= 1e3) return `${sign}₹${+(abs / 1e3).toFixed(1)}K`
  return `${sign}₹${Math.round(abs)}`
}

export const formatPercent = (value: number, digits = 1) => `${+value.toFixed(digits)}%`

export const formatDate = (iso: string | Date) => format(new Date(iso), 'dd MMM yyyy')
export const formatDateTime = (iso: string | Date) => format(new Date(iso), 'dd MMM yyyy, HH:mm')
export const formatDay = (iso: string | Date) => format(new Date(iso), 'd MMM')

export const statusLabel = (status: string) =>
  status.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())
