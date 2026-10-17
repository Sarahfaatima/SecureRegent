import type {
  ActivityLog, Dataset, Deal, DealStage, Employee, Invoice, Lead, LeadSource, LeadStatus, Order,
  Payment, PaymentMethod, Priority, Quotation, QuotationStatus, Service,
} from '../types'

export const HISTORY_DAYS = 150
const DAY = 86_400_000

export const employees: Employee[] = [
  { id: 'E-01', name: 'Nancy Singh', team: 'Sales' },
  { id: 'E-02', name: 'Sneha Choudhary', team: 'Sales' },
  { id: 'E-03', name: 'Tannu Kumari', team: 'Sales' },
  { id: 'E-04', name: 'Rohit Mehra', team: 'Sales' },
  { id: 'E-05', name: 'Aditi Verma', team: 'Sales' },
  { id: 'E-06', name: 'Gaurav Pant', team: 'Operations' },
  { id: 'E-07', name: 'Srishti Upadhyay', team: 'Operations' },
  { id: 'E-08', name: 'Azam Afaroz', team: 'Operations' },
  { id: 'E-09', name: 'Karan Malhotra', team: 'Operations' },
]

interface ServiceSeed extends Service { weight: number; basePrice: number }

const serviceSeeds: ServiceSeed[] = [
  { id: 'S-PVT', name: 'Private Limited Company', shortName: 'Private Limited', weight: 26, basePrice: 14000 },
  { id: 'S-LLP', name: 'LLP Registration', shortName: 'LLP', weight: 10, basePrice: 11000 },
  { id: 'S-GST', name: 'GST Registration & Filing', shortName: 'GST', weight: 15, basePrice: 7500 },
  { id: 'S-TM', name: 'Trademark Registration', shortName: 'Trademark', weight: 12, basePrice: 9500 },
  { id: 'S-FSSAI', name: 'FSSAI License', shortName: 'FSSAI', weight: 8, basePrice: 6500 },
  { id: 'S-AC', name: 'Annual Compliance', shortName: 'Annual Compliance', weight: 11, basePrice: 18000 },
  { id: 'S-ISO', name: 'ISO Certification', shortName: 'ISO', weight: 6, basePrice: 22000 },
  { id: 'S-SI', name: 'Startup India Registration', shortName: 'Startup India', weight: 6, basePrice: 8500 },
  { id: 'S-DSC', name: 'DSC & DIN Services', shortName: 'DSC & DIN', weight: 6, basePrice: 3200 },
]

export const services: Service[] = serviceSeeds.map(({ id, name, shortName }) => ({ id, name, shortName }))

const firstNames = ['Aarav', 'Vivaan', 'Ananya', 'Ishita', 'Kabir', 'Meera', 'Rahul', 'Pooja', 'Arjun', 'Neha', 'Siddharth', 'Kavya', 'Manish', 'Divya', 'Varun', 'Riya', 'Harsh', 'Shreya', 'Nikhil', 'Tanvi']
const lastNames = ['Sharma', 'Gupta', 'Iyer', 'Reddy', 'Kapoor', 'Nair', 'Bansal', 'Joshi', 'Malhotra', 'Agarwal', 'Chopra', 'Patel', 'Rao', 'Mishra', 'Saxena']
const companyStems = ['Nexa', 'Bharat', 'Orbit', 'Zenith', 'Kiran', 'Lotus', 'Vertex', 'Sapphire', 'Urban', 'Pioneer', 'Skyline', 'Evergreen', 'Quantum', 'Indus', 'Apex']
const companyTails = ['Foods', 'Technologies', 'Traders', 'Logistics', 'Studios', 'Labs', 'Retail', 'Consulting', 'Exports', 'Solutions']
const sources: [LeadSource, number][] = [
  ['Google Ads', 34], ['Website', 24], ['Referral', 18], ['Just Dial', 10], ['LinkedIn', 9], ['Other', 5],
]
const methods: PaymentMethod[] = ['UPI', 'Bank Transfer', 'Bank Transfer', 'Card', 'Cheque']

/** Deterministic PRNG so the dummy data is identical on every load. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateDataset(now = new Date()): Dataset {
  const rnd = mulberry32(20261019)
  const int = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1))
  const pick = <T,>(items: T[]) => items[Math.floor(rnd() * items.length)]
  const weighted = <T,>(items: [T, number][]) => {
    let roll = rnd() * items.reduce((s, [, w]) => s + w, 0)
    for (const [item, w] of items) if ((roll -= w) < 0) return item
    return items[0][0]
  }
  const iso = (ms: number) => new Date(Math.min(ms, now.getTime() - 60_000)).toISOString()
  const sales = employees.filter((e) => e.team === 'Sales')
  const ops = employees.filter((e) => e.team === 'Operations')
  const priceOf = new Map(serviceSeeds.map((s) => [s.id, s.basePrice]))

  const leads: Lead[] = []
  const quotations: Quotation[] = []
  const deals: Deal[] = []
  const orders: Order[] = []
  const payments: Payment[] = []
  const invoices: Invoice[] = []
  const activity: ActivityLog[] = []
  const seq = { l: 209000, q: 10000, d: 800, o: 2100, p: 1000, i: 6000, a: 0 }
  const log = (at: string, employeeId: string, serviceId: string, action: string, recordKind: ActivityLog['recordKind'], recordId: string) =>
    activity.push({ id: `A-${++seq.a}`, at, employeeId, serviceId, action, recordKind, recordId })

  const leadCount = HISTORY_DAYS * 3
  for (let n = 0; n < leadCount; n++) {
    // Recent days get a slightly higher volume, weekends are quieter.
    let created = now.getTime() - rnd() * HISTORY_DAYS * DAY
    const weekday = new Date(created).getDay()
    if ((weekday === 0 || weekday === 6) && rnd() < 0.6) created -= 2 * DAY
    created = Math.min(created, now.getTime() - 3_600_000)
    const ageDays = (now.getTime() - created) / DAY
    const serviceId = weighted(serviceSeeds.map((s): [string, number] => [s.id, s.weight]))
    const owner = pick(sales)
    let status: LeadStatus = weighted<LeadStatus>([['unqualified', 40], ['new', 12], ['qualified', 26], ['converted', 22]])
    if (status === 'new' && ageDays > 10) status = 'qualified'

    const lead: Lead = {
      id: `L-${++seq.l}`,
      name: `${pick(firstNames)} ${pick(lastNames)}`,
      company: `${pick(companyStems)} ${pick(companyTails)}`,
      source: weighted(sources),
      status,
      ownerId: owner.id,
      serviceId,
      createdAt: iso(created),
    }
    leads.push(lead)
    log(lead.createdAt, owner.id, serviceId, 'Lead created', 'lead', lead.id)
    if (status !== 'new') log(iso(created + 4 * 3_600_000), owner.id, serviceId, 'Lead updated', 'lead', lead.id)
    if (status !== 'qualified' && status !== 'converted') continue

    const quoteCount = int(1, 3)
    let acceptedGiven = 0
    for (let k = 0; k < quoteCount; k++) {
      const qAt = created + (k + 1) * rnd() * 3 * DAY
      const qAge = (now.getTime() - qAt) / DAY
      let qStatus: QuotationStatus
      if (status === 'converted' && (k === 0 || (acceptedGiven < 2 && rnd() < 0.15))) qStatus = 'accepted'
      else if (qAge < 8) qStatus = 'pending'
      else qStatus = rnd() < 0.7 ? 'rejected' : 'pending'
      if (qStatus === 'accepted') acceptedGiven++
      const quotation: Quotation = {
        id: `Q-${++seq.q}`,
        leadId: lead.id,
        serviceId,
        ownerId: owner.id,
        amount: Math.round(((priceOf.get(serviceId) ?? 8000) * (0.8 + rnd() * 0.7)) / 100) * 100,
        status: qStatus,
        createdAt: iso(qAt),
      }
      quotations.push(quotation)
      log(quotation.createdAt, owner.id, serviceId, 'Quotation created', 'quotation', quotation.id)
      if (qStatus !== 'accepted') continue

      const dAt = qAt + (1 + rnd() * 4) * DAY
      const value = quotation.amount
      const deal: Deal = {
        id: `D-${++seq.d}`,
        leadId: lead.id,
        quotationId: quotation.id,
        serviceId,
        ownerId: owner.id,
        value,
        priority: (value > 15000 ? weighted<Priority>([['High', 60], ['Medium', 30], ['Low', 10]]) : weighted<Priority>([['High', 25], ['Medium', 45], ['Low', 30]])),
        stage: 'Onboarding',
        createdAt: iso(dAt),
      }
      deals.push(deal)
      log(deal.createdAt, owner.id, serviceId, 'Deal created', 'deal', deal.id)

      // Split the deal value across 1-3 orders.
      const orderCount = weighted<number>([[1, 60], [2, 30], [3, 10]])
      let remaining = value
      let progressSum = 0
      for (let o = 0; o < orderCount; o++) {
        const share = o === orderCount - 1 ? remaining : Math.round((remaining / (orderCount - o)) * (0.8 + rnd() * 0.4))
        remaining -= share
        const oAt = dAt + rnd() * 3 * DAY
        const oAge = Math.max(0, (now.getTime() - oAt) / DAY)
        const stagesTotal = int(4, 6)
        const pace = 2 + rnd() * 5
        const stagesDone = rnd() < 0.08 ? 0 : Math.min(stagesTotal, Math.floor(oAge / pace))
        progressSum += stagesDone / stagesTotal
        const assignee = pick(ops)
        const order: Order = {
          id: `O-${++seq.o}`,
          dealId: deal.id,
          serviceId,
          ownerId: owner.id,
          assigneeId: assignee.id,
          value: share,
          stagesTotal,
          stagesDone,
          createdAt: iso(oAt),
          // Due dates may legitimately be in the future, so they are not clamped to "now".
          dueDate: new Date(oAt + int(12, 40) * DAY).toISOString(),
        }
        orders.push(order)
        log(order.createdAt, owner.id, serviceId, 'Order created', 'order', order.id)

        const issue = (at: number, amount: number) => {
          const invoice: Invoice = { id: `INV-${++seq.i}`, orderId: order.id, serviceId, ownerId: owner.id, amount, issuedAt: iso(at) }
          invoices.push(invoice)
          log(invoice.issuedAt, owner.id, serviceId, 'Invoice generated', 'order', order.id)
        }
        const pay = (at: number, amount: number) => {
          if (amount <= 0) return
          const payment: Payment = { id: `P-${++seq.p}`, orderId: order.id, serviceId, ownerId: owner.id, amount, method: pick(methods), paidAt: iso(at) }
          payments.push(payment)
          log(payment.paidAt, owner.id, serviceId, 'Payment recorded', 'payment', payment.id)
        }
        const advance = Math.round(share * (0.4 + rnd() * 0.2))
        issue(oAt, advance)
        if (oAge > 1 && rnd() < 0.9) pay(oAt + rnd() * 3 * DAY, advance)
        if (stagesDone >= stagesTotal / 2) {
          const mid = Math.round((share - advance) * 0.5)
          const midAt = oAt + (oAge / 2 + rnd()) * DAY
          issue(midAt, mid)
          if (rnd() < 0.85) pay(midAt + rnd() * 4 * DAY, mid)
        }
        if (stagesDone === stagesTotal) {
          const rest = share - advance - Math.round((share - advance) * 0.5)
          const doneAt = oAt + oAge * 0.8 * DAY
          issue(doneAt, rest)
          if (rnd() < 0.7) pay(doneAt + rnd() * 5 * DAY, rest)
        }
      }
      const progress = progressSum / orderCount
      const stage: DealStage = progress === 0 ? 'Onboarding' : progress < 0.4 ? 'Documentation' : progress < 1 ? 'Processing' : 'Delivered'
      deal.stage = stage
    }
  }

  const byDate = <T,>(items: T[], key: (item: T) => string) => items.sort((a, b) => key(a).localeCompare(key(b)))
  activity.sort((a, b) => b.at.localeCompare(a.at))

  return {
    employees,
    services,
    leads: byDate(leads, (l) => l.createdAt),
    quotations: byDate(quotations, (q) => q.createdAt),
    deals: byDate(deals, (d) => d.createdAt),
    orders: byDate(orders, (o) => o.createdAt),
    payments: byDate(payments, (p) => p.paidAt),
    invoices: byDate(invoices, (i) => i.issuedAt),
    activity,
  }
}
