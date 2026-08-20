'use client'

import Link from 'next/link'
import { Gauge, Map, Truck, Zap, ChevronRight, MoreHorizontal } from 'lucide-react'
import { MetricCard } from '../components/MetricCard'

function MapMarker({ label, x, y, muted = false }: { label: string; x: string; y: string; muted?: boolean }) {
  return <div className={`map-marker ${muted ? 'marker-muted' : ''}`} style={{ left: x, top: y }}><span className="marker-pin"><Truck size={13} /></span><span>{label}</span></div>
}

import dynamic from 'next/dynamic'
const MapComponent = dynamic(() => import('../components/InteractiveMap'), { ssr: false })

export default function Dashboard() {
  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow accent-eyebrow">Thursday, June 12, 2025</p><h1>Good morning, Alex</h1><p className="subheading">Here&apos;s what&apos;s happening across your operations today.</p></div>
      </div>

      <div className="metric-grid">
        <MetricCard label="Active vehicles" value="18" change="+3.2%" context="vs. last week" icon={<Truck size={18} />} />
        <MetricCard label="Routes completed" value="64" change="+8.4%" context="vs. last week" icon={<Map size={18} />} />
        <MetricCard label="Collection volume" value="82.4" unit="t" change="+5.1%" context="vs. last week" icon={<Gauge size={18} />} />
        <MetricCard label="Fuel efficiency" value="94.8" unit="%" change="+1.8%" context="vs. last week" icon={<Zap size={18} />} />
      </div>

      <div className="dashboard-grid">
        <section className="panel map-panel">
          <div className="panel-header"><div><h2>Live operations</h2><p>Alpha 1 C Market, Greater Noida</p></div><button className="outline-button"><Map size={15} />Open full map</button></div>
          <MapComponent />
          <div className="map-footer" style={{ marginTop: '1rem' }}><div><span className="legend-dot green-fill" />On route <strong>14</strong></div><div><span className="legend-dot gray-fill" />At depot <strong>3</strong></div><div><span className="legend-dot amber-fill" />Maintenance <strong>1</strong></div><span className="map-total">24 total vehicles <ChevronRight size={14} /></span></div>
        </section>

        <section className="panel activity-panel">
          <div className="panel-header"><div><h2>Today&apos;s activity</h2><p>Collection progress by hour</p></div><button className="more-button"><MoreHorizontal size={18} /></button></div>
          <div className="activity-chart">
            <div className="chart-y"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
            <div className="chart-bars">{[35, 48, 42, 67, 76, 82, 73, 91, 88, 69, 52, 39].map((height, index) => <div className="bar-column" key={index}><div className="bar-track"><div className="bar-fill" style={{ height: `${height}%` }} /></div><span>{['6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p'][index]}</span></div>)}</div>
          </div>
          <div className="activity-total"><div><span className="eyebrow">Collected so far</span><strong>82.4 <small>tonnes</small></strong></div><span className="trend-badge">On track</span></div>
        </section>
      </div>
    </>
  )
}
