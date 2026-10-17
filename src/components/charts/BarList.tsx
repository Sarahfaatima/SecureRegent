import { EmptyState } from '../ui/Card'

export interface BarListItem {
  key: string
  label: string
  value: number
  display: string
  onClick?: () => void
}

/** Horizontal bar rows: label, proportional bar, formatted value. Rows are buttons when drillable. */
export function BarList({ items, color, labelWidth = 'w-28' }: { items: BarListItem[]; color: string; labelWidth?: string }) {
  if (items.length === 0) return <EmptyState />
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const body = (
          <>
            <span className={`${labelWidth} shrink-0 truncate text-left text-xs text-slate-600`} title={item.label}>{item.label}</span>
            <span className="h-2 flex-1 rounded-sm bg-slate-100">
              <span className="block h-2 rounded-sm" style={{ width: `${(item.value / max) * 100}%`, background: color }} />
            </span>
            <span className="tabular w-24 shrink-0 text-right text-xs font-semibold text-navy">{item.display}</span>
          </>
        )
        return (
          <li key={item.key}>
            {item.onClick ? (
              <button type="button" onClick={item.onClick} className="flex w-full items-center gap-2 rounded px-1 py-1 hover:bg-slate-50">{body}</button>
            ) : (
              <div className="flex items-center gap-2 px-1 py-1">{body}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
