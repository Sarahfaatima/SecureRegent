import { COLORS } from './theme'

interface GaugeProps {
  percent: number
  label: string
  caption: string
  color?: string
  onClick?: () => void
}

/** Single-value ring gauge for rates. */
export function Gauge({ percent, label, caption, color = COLORS.blue, onClick }: GaugeProps) {
  const r = 52
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, percent))
  const body = (
    <>
      <svg viewBox="0 0 130 130" className="h-36 w-36" role="img" aria-label={`${label}: ${+percent.toFixed(1)}%`}>
        <circle cx="65" cy="65" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * c} ${c}`} transform="rotate(-90 65 65)"
        />
        <text x="65" y="71" textAnchor="middle" className="tabular" fontSize="22" fontWeight="700" fill="#0f1f3d">{+percent.toFixed(1)}%</text>
      </svg>
      <span className="text-xs text-slate-500">{caption}</span>
    </>
  )
  return onClick ? (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1 rounded hover:bg-slate-50">{body}</button>
  ) : (
    <div className="flex flex-col items-center gap-1">{body}</div>
  )
}
