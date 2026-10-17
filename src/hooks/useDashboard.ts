import { useMemo, useState } from 'react'
import { dataIndex, dataset, NOW } from '../data'
import { ALL, computeKpis, scopeData } from '../lib/metrics'
import { previousRange, resolveRange, toInputDate } from '../lib/dates'
import { subDays } from 'date-fns'
import type { Filters } from '../types'

const initialFilters: Filters = {
  preset: '30d',
  customStart: toInputDate(subDays(NOW, 13)),
  customEnd: toInputDate(NOW),
  userId: ALL,
  serviceId: ALL,
}

/** Single source of truth: shared filter state plus the scoped datasets every widget derives from. */
export function useDashboard() {
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const { range, error } = useMemo(() => resolveRange(filters, NOW), [filters])
  // While a custom range is invalid we keep showing the last valid range's data.
  const [lastValid, setLastValid] = useState(range)
  if (range && range !== lastValid) setLastValid(range)
  const active = range ?? lastValid

  const derived = useMemo(() => {
    if (!active) return null
    const scope = { userId: filters.userId, serviceId: filters.serviceId }
    const prevRange = previousRange(active)
    const current = scopeData(dataset, { range: active, ...scope })
    const previous = scopeData(dataset, { range: prevRange, ...scope })
    return { range: active, prevRange, current, previous, kpis: computeKpis(current), prevKpis: computeKpis(previous) }
  }, [active, filters.userId, filters.serviceId])

  return {
    filters,
    setFilters: (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch })),
    error,
    derived,
    dataset,
    index: dataIndex,
    now: NOW,
  }
}
