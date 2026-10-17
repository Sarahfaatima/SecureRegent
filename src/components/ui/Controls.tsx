import { Search } from 'lucide-react'

interface Option { value: string; label: string }

export function Select({ label, value, options, onChange, className = '' }: {
  label: string; value: string; options: Option[]; onChange: (value: string) => void; className?: string
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-navy ${className}`}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function SearchInput({ value, onChange, label = 'Search records' }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <Search size={14} aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search"
        className="h-8 w-full rounded-md border border-slate-300 bg-white pl-8 pr-2 text-xs"
      />
    </label>
  )
}
