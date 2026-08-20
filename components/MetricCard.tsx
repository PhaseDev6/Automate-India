import React from 'react'

export function MetricCard({ label, value, unit, change, context, icon }: { label: string; value: string; unit?: string; change: string; context: string; icon: React.ReactNode }) {
  return <div className="metric-card"><div className="metric-top"><span className="metric-icon">{icon}</span><span className="metric-change">{change}</span></div><span className="metric-label">{label}</span><div className="metric-value">{value}<small>{unit}</small></div><span className="metric-context">{context}</span></div>
}
