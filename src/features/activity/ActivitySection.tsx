import { useMemo, useState } from 'react'
import { DataTable, type Column } from '../../components/tables/DataTable'
import { Card } from '../../components/ui/Card'
import { SearchInput } from '../../components/ui/Controls'
import { RecordLink, UserCell } from '../../components/ui/RecordLink'
import { formatDateTime, formatINR, formatPercent } from '../../lib/format'
import { operationsActivity, salesActivity, type OpsRow, type SalesRow } from '../../lib/metrics'
import type { ActivityLog } from '../../types'
import type { SectionProps } from '../types'

export function ActivitySection({ data, dataset, index, now, onDrill, onOpen }: SectionProps) {
  const [query, setQuery] = useState('')
  const sales = useMemo(() => salesActivity(data, dataset.employees), [data, dataset.employees])
  const ops = useMemo(() => operationsActivity(data, dataset.employees, now), [data, dataset.employees, now])
  const recent = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.activity
      .filter((a) => !q || [a.action, a.recordId, index.employee.get(a.employeeId)?.name ?? ''].some((v) => v.toLowerCase().includes(q)))
      .slice(0, 60)
  }, [data.activity, query, index])

  const salesColumns: Column<SalesRow>[] = [
    { key: 'user', header: 'User', render: (r) => <UserCell name={r.employee.name} /> },
    { key: 'leads', header: 'Leads Handled', align: 'right', render: (r) => r.leads },
    { key: 'qualified', header: 'Qualified', align: 'right', render: (r) => r.qualified },
    { key: 'converted', header: 'Converted', align: 'right', render: (r) => r.converted },
    { key: 'rate', header: 'Conv. %', align: 'right', render: (r) => formatPercent(r.conversionRate) },
    { key: 'quotes', header: 'Quotations', align: 'right', render: (r) => r.quotations },
    { key: 'deals', header: 'Deals', align: 'right', render: (r) => r.deals },
    { key: 'value', header: 'Deal Value', align: 'right', render: (r) => formatINR(r.dealValue) },
    { key: 'revenue', header: 'Revenue', align: 'right', render: (r) => formatINR(r.revenue) },
  ]
  const opsColumns: Column<OpsRow>[] = [
    { key: 'user', header: 'User', render: (r) => <UserCell name={r.employee.name} /> },
    { key: 'orders', header: 'Orders Handled', align: 'right', render: (r) => r.orders },
    { key: 'done', header: 'Stages Done', align: 'right', render: (r) => r.stagesCompleted },
    { key: 'pending', header: 'Pending', align: 'right', render: (r) => r.pendingStages },
    { key: 'overdue', header: 'Overdue', align: 'right', render: (r) => r.overdue },
  ]
  const activityColumns: Column<ActivityLog>[] = [
    { key: 'time', header: 'Time', render: (a) => <span className="whitespace-nowrap text-slate-500">{formatDateTime(a.at)}</span> },
    { key: 'employee', header: 'Employee', render: (a) => index.employee.get(a.employeeId)?.name },
    { key: 'action', header: 'Action', render: (a) => a.action },
    { key: 'record', header: 'Record', render: (a) => <RecordLink kind={a.recordKind} id={a.recordId} onOpen={onOpen} /> },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr] 2xl:grid-cols-[1.5fr_1fr_1.1fr]">
      <Card title="Sales Team Activity" subtitle="Select a row to list that user's leads" className="xl:col-span-1">
        <DataTable columns={salesColumns} rows={sales} rowKey={(r) => r.employee.id} caption="Sales team activity" maxHeight="max-h-80"
          onRowClick={(r) => onDrill({ title: `Leads handled by ${r.employee.name}`, kind: 'lead', ids: r.leadIds })} />
      </Card>
      <Card title="Operations Team Activity" subtitle="Select a row to list that user's orders">
        <DataTable columns={opsColumns} rows={ops} rowKey={(r) => r.employee.id} caption="Operations team activity" maxHeight="max-h-80"
          onRowClick={(r) => onDrill({ title: `Orders handled by ${r.employee.name}`, kind: 'order', ids: r.orderIds })} />
      </Card>
      <Card title="Recent CRM Activity" className="xl:col-span-2 2xl:col-span-1" actions={<div className="w-36"><SearchInput value={query} onChange={setQuery} label="Search activity" /></div>}>
        <DataTable columns={activityColumns} rows={recent} rowKey={(a) => a.id} caption="Recent CRM activity" maxHeight="max-h-80" />
      </Card>
    </div>
  )
}
