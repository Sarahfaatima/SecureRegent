import { CalendarDays, Download } from 'lucide-react'
import type { DateRange, Employee, Filters, Service } from '../../types'
import { formatRange, PRESETS, toInputDate } from '../../lib/dates'
import { NOW } from '../../data'
import { ALL } from '../../lib/metrics'
import { Select } from '../ui/Controls'

interface HeaderProps {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
  error: string | null
  range: DateRange
  employees: Employee[]
  services: Service[]
  onExport: () => void
}

const dateInput = 'h-9 rounded-md border border-slate-300 bg-white px-2 text-xs text-navy'

export function Header({ filters, onChange, error, range, employees, services, onExport }: HeaderProps) {
  const today = toInputDate(NOW)
  return (
    <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-xl font-bold text-navy sm:text-2xl">Business Performance &amp; Revenue Analytics</h1>
        <p className="mt-1 text-xs text-slate-500">Track your leads, conversions, quotations, deals, revenue and operations in one place.</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <CalendarDays size={14} aria-hidden className="text-blue-600" />
          <span>Showing {formatRange(range)}</span>
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Select
            label="Date range"
            value={filters.preset}
            options={PRESETS.map((p) => ({ value: p.id, label: p.label }))}
            onChange={(v) => onChange({ preset: v as Filters['preset'] })}
          />
          <Select
            label="Filter by user"
            value={filters.userId}
            options={[{ value: ALL, label: 'All Users' }, ...employees.map((e) => ({ value: e.id, label: `${e.name} (${e.team})` }))]}
            onChange={(userId) => onChange({ userId })}
            className="max-w-44"
          />
          <Select
            label="Filter by department or service"
            value={filters.serviceId}
            options={[{ value: ALL, label: 'All Services' }, ...services.map((s) => ({ value: s.id, label: s.name }))]}
            onChange={(serviceId) => onChange({ serviceId })}
            className="max-w-48"
          />
          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Download size={14} aria-hidden /> Export CSV
          </button>
        </div>
        {filters.preset === 'custom' && (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <label className="flex items-center gap-1.5 text-xs text-slate-600">
              Start
              <input
                type="date" className={dateInput} value={filters.customStart} max={today}
                aria-invalid={!!error} onChange={(e) => onChange({ customStart: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-600">
              End
              <input
                type="date" className={dateInput} value={filters.customEnd} min={filters.customStart} max={today}
                aria-invalid={!!error} onChange={(e) => onChange({ customEnd: e.target.value })}
              />
            </label>
          </div>
        )}
        {error && <p role="alert" className="text-xs font-medium text-red-600 lg:text-right">{error} Showing the last valid range.</p>}
      </div>
    </header>
  )
}
