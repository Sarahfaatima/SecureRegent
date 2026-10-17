import { statusLabel } from '../../lib/format'

const tones = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
}

type Tone = keyof typeof tones

const statusTone: Record<string, Tone> = {
  converted: 'green', qualified: 'blue', new: 'slate', unqualified: 'red',
  accepted: 'green', pending: 'amber', rejected: 'red',
  completed: 'green', in_progress: 'blue', overdue: 'red',
  High: 'red', Medium: 'amber', Low: 'green',
  Onboarding: 'slate', Documentation: 'amber', Processing: 'blue', Delivered: 'green',
}

export function Badge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${tones[statusTone[value] ?? 'slate']}`}>
      {statusLabel(value)}
    </span>
  )
}
