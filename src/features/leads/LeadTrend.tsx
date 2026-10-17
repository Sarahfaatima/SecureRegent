import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, EmptyState } from '../../components/ui/Card'
import { Legend } from '../../components/charts/Legend'
import { axisProps, COLORS, tooltipProps } from '../../components/charts/theme'
import { dailyLeadTrend } from '../../lib/metrics'
import type { SectionProps } from '../types'

const series = [
  { key: 'new', label: 'New Leads', color: COLORS.blue },
  { key: 'qualified', label: 'Qualified', color: COLORS.green },
  { key: 'converted', label: 'Converted', color: COLORS.amber },
] as const

export function LeadTrend({ data, range }: SectionProps) {
  const points = useMemo(() => dailyLeadTrend(data, range), [data, range])
  return (
    <Card title="Daily Lead Trend" subtitle="Leads grouped by the day they were created" actions={<Legend items={series.map((s) => ({ label: s.label, color: s.color }))} />}>
      {data.leads.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="h-52" role="img" aria-label="Line chart of daily new, qualified and converted leads">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid stroke={COLORS.grid} vertical={false} />
              <XAxis dataKey="label" {...axisProps} minTickGap={24} />
              <YAxis {...axisProps} allowDecimals={false} />
              <Tooltip {...tooltipProps} />
              {series.map((s) => (
                <Line isAnimationActive={false} key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={points.length <= 14} activeDot={{ r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
