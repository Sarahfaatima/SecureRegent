import { differenceInCalendarDays, endOfDay, format, isValid, parseISO, startOfDay, subDays } from 'date-fns'
import type { DatePreset, DateRange, Filters } from '../types'

export const PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'custom', label: 'Custom Date Range' },
]

export const toInputDate = (d: Date) => format(d, 'yyyy-MM-dd')

export interface RangeResult {
  range: DateRange | null
  error: string | null
}

/** Resolves the active filter into an inclusive day range, validating custom input. */
export function resolveRange(filters: Filters, now: Date): RangeResult {
  const end = endOfDay(now)
  switch (filters.preset) {
    case 'today':
      return { range: { start: startOfDay(now), end }, error: null }
    case '7d':
      return { range: { start: startOfDay(subDays(now, 6)), end }, error: null }
    case '30d':
      return { range: { start: startOfDay(subDays(now, 29)), end }, error: null }
    case 'custom': {
      const start = parseISO(filters.customStart)
      const stop = parseISO(filters.customEnd)
      if (!isValid(start) || !isValid(stop)) return { range: null, error: 'Select both a start and an end date.' }
      if (start > stop) return { range: null, error: 'Start date must be on or before the end date.' }
      if (stop > end) return { range: null, error: 'End date cannot be in the future.' }
      return { range: { start: startOfDay(start), end: endOfDay(stop) }, error: null }
    }
  }
}

export const rangeDays = (range: DateRange) => differenceInCalendarDays(range.end, range.start) + 1

/** The equally long period immediately before `range`. */
export function previousRange(range: DateRange): DateRange {
  const days = rangeDays(range)
  return { start: startOfDay(subDays(range.start, days)), end: endOfDay(subDays(range.start, 1)) }
}

export const inRange = (iso: string, range: DateRange) => {
  const t = new Date(iso).getTime()
  return t >= range.start.getTime() && t <= range.end.getTime()
}

export function formatRange(range: DateRange) {
  const same = differenceInCalendarDays(range.end, range.start) === 0
  return same ? format(range.start, 'd MMM yyyy') : `${format(range.start, 'd MMM')} – ${format(range.end, 'd MMM yyyy')}`
}

/** Every calendar day in the range, as yyyy-MM-dd keys. */
export function eachDayKey(range: DateRange): string[] {
  const days = rangeDays(range)
  return Array.from({ length: days }, (_, i) => format(subDays(range.end, days - 1 - i), 'yyyy-MM-dd'))
}

export const dayKey = (iso: string) => format(new Date(iso), 'yyyy-MM-dd')
