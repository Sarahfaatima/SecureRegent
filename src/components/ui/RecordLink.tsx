import type { RecordKind } from '../../types'

export interface OpenRecord { kind: RecordKind; id: string }
export type OpenRecordFn = (record: OpenRecord) => void

/** Clickable record reference that opens the detail drawer. */
export function RecordLink({ kind, id, onOpen }: OpenRecord & { onOpen: OpenRecordFn }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onOpen({ kind, id }) }}
      className="font-medium text-blue-600 hover:underline"
    >
      {id}
    </button>
  )
}

export function UserCell({ name }: { name: string }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-semibold text-blue-700">{name[0]}</span>
      <span>{name}</span>
    </span>
  )
}
