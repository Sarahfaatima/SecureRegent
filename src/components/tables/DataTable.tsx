import type { ReactNode } from 'react'
import { EmptyState } from '../ui/Card'

export interface Column<T> {
  key: string
  header: string
  align?: 'left' | 'right'
  render: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  caption: string
  onRowClick?: (row: T) => void
  maxHeight?: string
  emptyMessage?: string
}

export function DataTable<T>({ columns, rows, rowKey, caption, onRowClick, maxHeight = 'max-h-80', emptyMessage }: DataTableProps<T>) {
  if (rows.length === 0) return <EmptyState message={emptyMessage} />
  return (
    <div className={`overflow-auto ${maxHeight}`}>
      <table className="w-full border-collapse text-xs">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-slate-200">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={`whitespace-nowrap px-2 py-2 font-medium text-slate-500 ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter') onRowClick(row) } : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              className={`border-b border-slate-100 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}
            >
              {columns.map((c) => (
                <td key={c.key} className={`px-2 py-2 text-navy ${c.align === 'right' ? 'tabular text-right' : 'text-left'}`}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
