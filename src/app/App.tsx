import { useCallback } from 'react'
import { FileText, IndianRupee, Package, Users, Activity } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { SectionHeader } from '../components/ui/Card'
import { ActivitySection } from '../features/activity/ActivitySection'
import { DealSection } from '../features/deals/DealSection'
import { DetailDrawer } from '../features/drilldown/DetailDrawer'
import { LeadFunnel } from '../features/leads/LeadFunnel'
import { LeadKpis } from '../features/leads/LeadKpis'
import { LeadSources } from '../features/leads/LeadSources'
import { LeadTrend } from '../features/leads/LeadTrend'
import { TargetCard } from '../features/leads/TargetCard'
import { OrderSection } from '../features/orders/OrderSection'
import { PaymentSection } from '../features/payments/PaymentSection'
import { QuotationSection } from '../features/quotations/QuotationSection'
import type { SectionProps } from '../features/types'
import { useDashboard } from '../hooks/useDashboard'
import { useDrawerStack } from '../hooks/useDrawerStack'
import { rangeDays } from '../lib/dates'
import { buildDashboardCsv, downloadFile } from '../lib/export'
import { format } from 'date-fns'

export function App() {
  const { filters, setFilters, error, derived, dataset, index, now } = useDashboard()
  const drawer = useDrawerStack()
  const exportCsv = useCallback(() => {
    if (!derived) return
    const csv = buildDashboardCsv(derived.range, derived.kpis, derived.current, index, now)
    downloadFile(`business-analytics-${format(derived.range.start, 'yyyyMMdd')}-${format(derived.range.end, 'yyyyMMdd')}.csv`, csv)
  }, [derived, index, now])

  if (!derived) return null
  const props: SectionProps = {
    data: derived.current, range: derived.range, dataset, index, now, onDrill: drawer.openList, onOpen: drawer.openRecord,
  }
  const days = rangeDays(derived.range)
  const comparisonLabel = days === 1 ? 'previous day' : `previous ${days} days`

  return (
    <div className="mx-auto max-w-[1800px] px-4 py-5 sm:px-6">
      <Header
        filters={filters} onChange={setFilters} error={error} range={derived.range}
        employees={dataset.employees} services={dataset.services} onExport={exportCsv}
      />
      <main className="mt-5">
        <section aria-label="Lead analytics" className="flex flex-col gap-4">
          <LeadKpis {...props} kpis={derived.kpis} prevKpis={derived.prevKpis} comparisonLabel={comparisonLabel} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.6fr_1.2fr]">
            <TargetCard {...props} />
            <LeadFunnel {...props} />
            <LeadTrend {...props} />
            <LeadSources {...props} />
          </div>
        </section>
        <SectionHeader icon={<FileText size={18} aria-hidden />} title="Quotation Analytics" />
        <QuotationSection {...props} />
        <SectionHeader icon={<IndianRupee size={18} aria-hidden />} title="Deals & Revenue" />
        <DealSection {...props} />
        <SectionHeader icon={<Package size={18} aria-hidden />} title="Orders & Payments" />
        <div className="flex flex-col gap-4">
          <OrderSection {...props} />
          <PaymentSection {...props} />
        </div>
        <SectionHeader icon={<Users size={18} aria-hidden />} title="Team Activity" />
        <ActivitySection {...props} />
      </main>
      <footer className="mt-8 flex items-center gap-1.5 text-[11px] text-slate-500">
        <Activity size={12} aria-hidden /> Figures are computed from local sample data for demonstration.
      </footer>
      <DetailDrawer stack={drawer.stack} index={index} now={now} onOpen={drawer.openRecord} onBack={drawer.back} onClose={drawer.close} />
    </div>
  )
}
