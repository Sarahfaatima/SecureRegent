import type { DataIndex } from '../data'
import type { RecordKind } from '../types'
import { orderStatus } from './metrics'

/** Uniform, display-ready summary of any record type, used by drill-down lists. */
export interface RecordSummary {
  kind: RecordKind
  id: string
  title: string
  subtitle: string
  status: string
  amount: number | null
  date: string
}

export function describeRecord(kind: RecordKind, id: string, idx: DataIndex, now: Date): RecordSummary | undefined {
  const service = (sid: string) => idx.service.get(sid)?.name ?? sid
  switch (kind) {
    case 'lead': {
      const l = idx.lead.get(id)
      return l && { kind, id, title: l.name, subtitle: `${l.company} · ${l.source}`, status: l.status, amount: null, date: l.createdAt }
    }
    case 'quotation': {
      const q = idx.quotation.get(id)
      return q && { kind, id, title: service(q.serviceId), subtitle: `Lead ${q.leadId}`, status: q.status, amount: q.amount, date: q.createdAt }
    }
    case 'deal': {
      const d = idx.deal.get(id)
      return d && { kind, id, title: service(d.serviceId), subtitle: `Lead ${d.leadId} · ${d.priority} priority`, status: d.stage, amount: d.value, date: d.createdAt }
    }
    case 'order': {
      const o = idx.order.get(id)
      return o && { kind, id, title: service(o.serviceId), subtitle: `Deal ${o.dealId} · ${o.stagesDone}/${o.stagesTotal} stages`, status: orderStatus(o, now), amount: o.value, date: o.createdAt }
    }
    case 'payment': {
      const p = idx.payment.get(id)
      return p && { kind, id, title: service(p.serviceId), subtitle: `Order ${p.orderId} · ${p.method}`, status: 'received', amount: p.amount, date: p.paidAt }
    }
  }
}

export const KIND_LABEL: Record<RecordKind, string> = {
  lead: 'Lead', quotation: 'Quotation', deal: 'Deal', order: 'Order', payment: 'Payment',
}
