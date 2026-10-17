import { useCallback, useState } from 'react'
import type { OpenRecord } from '../components/ui/RecordLink'
import type { DrawerView } from '../features/drilldown/DetailDrawer'
import type { DrillSpec } from '../lib/metrics'

/** Navigation stack for the drill-down drawer: lists open fresh, records push so Back works. */
export function useDrawerStack() {
  const [stack, setStack] = useState<DrawerView[]>([])
  const openList = useCallback((spec: DrillSpec) => setStack([{ type: 'list', spec }]), [])
  const openRecord = useCallback((record: OpenRecord) => setStack((s) => [...s, { type: 'record', record }]), [])
  const back = useCallback(() => setStack((s) => s.slice(0, -1)), [])
  const close = useCallback(() => setStack([]), [])
  return { stack, openList, openRecord, back, close }
}
