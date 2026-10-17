import type { DataIndex } from '../data'
import type { OpenRecordFn } from '../components/ui/RecordLink'
import type { DateRange, Dataset } from '../types'
import type { DrillSpec, Kpis, ScopedData } from '../lib/metrics'

/** Props shared by every dashboard section component. */
export interface SectionProps {
  data: ScopedData
  range: DateRange
  dataset: Dataset
  index: DataIndex
  now: Date
  onDrill: (spec: DrillSpec) => void
  onOpen: OpenRecordFn
}

export interface KpiSectionProps extends SectionProps {
  kpis: Kpis
  prevKpis: Kpis
  comparisonLabel: string
}
