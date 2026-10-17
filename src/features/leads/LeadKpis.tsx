import { CheckCircle2, FileText, Filter, Receipt, Target, UserCheck, UserX, Users } from 'lucide-react'
import { KpiCard } from '../../components/ui/KpiCard'
import { formatNumber, formatPercent } from '../../lib/format'
import { pctChange, type Kpis } from '../../lib/metrics'
import type { KpiSectionProps } from '../types'

export function LeadKpis({ data, kpis, prevKpis, comparisonLabel, onDrill }: KpiSectionProps) {
  const ofTotal = (n: number) => formatPercent(kpis.totalLeads ? (n / kpis.totalLeads) * 100 : 0)
  const leadIds = (pred: (s: string) => boolean) => data.leads.filter((l) => pred(l.status)).map((l) => l.id)
  const invoicedOrderIds = [...new Set(data.invoices.map((i) => i.orderId))]

  const cards: {
    label: string; key: keyof Kpis; icon: typeof Users; value: string; invertTone?: boolean
    detail?: { value: string; label: string }; drill: Parameters<KpiSectionProps['onDrill']>[0]
  }[] = [
    { label: 'Total Leads', key: 'totalLeads', icon: Users, value: formatNumber(kpis.totalLeads), drill: { title: 'All leads', kind: 'lead', ids: leadIds(() => true) } },
    { label: 'Qualified Leads', key: 'qualified', icon: CheckCircle2, value: formatNumber(kpis.qualified), detail: { value: ofTotal(kpis.qualified), label: 'Qualified %' }, drill: { title: 'Qualified leads', kind: 'lead', ids: leadIds((s) => s === 'qualified' || s === 'converted') } },
    { label: 'Converted Leads', key: 'converted', icon: UserCheck, value: formatNumber(kpis.converted), detail: { value: ofTotal(kpis.converted), label: 'Conversion %' }, drill: { title: 'Converted leads', kind: 'lead', ids: leadIds((s) => s === 'converted') } },
    { label: 'Unqualified Leads', key: 'unqualified', icon: UserX, value: formatNumber(kpis.unqualified), invertTone: true, detail: { value: ofTotal(kpis.unqualified), label: 'Unqualified %' }, drill: { title: 'Unqualified leads', kind: 'lead', ids: leadIds((s) => s === 'unqualified') } },
    { label: 'Conversion Rate', key: 'conversionRate', icon: Filter, value: formatPercent(kpis.conversionRate), drill: { title: 'Converted leads', kind: 'lead', ids: leadIds((s) => s === 'converted') } },
    { label: 'Quotations Created', key: 'quotations', icon: FileText, value: formatNumber(kpis.quotations), drill: { title: 'Quotations created', kind: 'quotation', ids: data.quotations.map((q) => q.id) } },
    { label: 'Deals Created', key: 'deals', icon: Target, value: formatNumber(kpis.deals), drill: { title: 'Deals created', kind: 'deal', ids: data.deals.map((d) => d.id) } },
    { label: 'Invoices Generated', key: 'invoices', icon: Receipt, value: formatNumber(kpis.invoices), drill: { title: 'Orders invoiced in this period', kind: 'order', ids: invoicedOrderIds } },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 md:grid-cols-4 2xl:grid-cols-8">
      {cards.map((c) => (
        <KpiCard
          key={c.key}
          label={c.label}
          value={c.value}
          icon={c.icon}
          detail={c.detail}
          invertTone={c.invertTone}
          change={pctChange(kpis[c.key], prevKpis[c.key])}
          comparisonLabel={comparisonLabel}
          onClick={() => onDrill(c.drill)}
        />
      ))}
    </div>
  )
}
