'use client'

import { Truck, ChevronRight } from 'lucide-react'

function MapMarker({ label, x, y, muted = false }: { label: string; x: string; y: string; muted?: boolean }) {
  return (
    <div className={`map-marker ${muted ? 'marker-muted' : ''}`} style={{ left: x, top: y, transform: 'translate(-50%, -100%)' }}>
      <span className="marker-pin" style={{ width: '32px', height: '32px' }}><Truck size={16} /></span>
      <span style={{ fontSize: '11px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{label}</span>
    </div>
  )
}

export default function MapPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
      <div className="page-heading">
        <div>
          <h1>Live Operations Map</h1>
          <p className="subheading">Real-time vehicle activity across Metro City</p>
        </div>
      </div>

      <section className="panel map-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div className="map-stage" style={{ flex: 1, margin: 0, height: 'auto', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: '11px 11px 0 0' }}>
          <div className="map-overlay map-title" style={{ fontSize: '12px' }}><span className="live-pulse" style={{ width: '8px', height: '8px' }} />Live tracking <span className="map-time">Updated just now</span></div>
          
          <div className="map-roads road-one" style={{ top: '35%', height: '24px' }} />
          <div className="map-roads road-two" style={{ top: '65%', height: '18px' }} />
          <div className="map-roads road-three" style={{ top: '20%', height: '14px', width: '120%' }} />
          <div className="map-roads road-four" style={{ top: '80%', height: '12px', width: '100%' }} />
          <div className="map-water" style={{ height: '200%', top: '-50%', width: '150px' }} />
          
          <span className="map-district district-one" style={{ fontSize: '12px' }}>NORTH LOOP</span>
          <span className="map-district district-two" style={{ fontSize: '12px' }}>DOWNTOWN</span>
          <span className="map-district district-three" style={{ fontSize: '12px' }}>RIVER DISTRICT</span>
          
          <MapMarker label="TRK-042" x="31%" y="32%" />
          <MapMarker label="TRK-018" x="67%" y="43%" />
          <MapMarker label="TRK-006" x="76%" y="72%" />
          <MapMarker label="TRK-031" x="47%" y="67%" muted />
          <MapMarker label="TRK-012" x="25%" y="60%" />
          <MapMarker label="TRK-055" x="55%" y="25%" muted />
          <MapMarker label="TRK-089" x="80%" y="35%" />
          <MapMarker label="TRK-092" x="15%" y="45%" />
          <MapMarker label="TRK-024" x="40%" y="85%" muted />
        </div>
        <div className="map-footer" style={{ padding: '16px 24px', fontSize: '12px' }}>
          <div><span className="legend-dot green-fill" style={{ width: '10px', height: '10px' }} />On route <strong style={{ fontSize: '14px' }}>14</strong></div>
          <div><span className="legend-dot gray-fill" style={{ width: '10px', height: '10px' }} />At depot <strong style={{ fontSize: '14px' }}>3</strong></div>
          <div><span className="legend-dot amber-fill" style={{ width: '10px', height: '10px' }} />Maintenance <strong style={{ fontSize: '14px' }}>1</strong></div>
          <span className="map-total" style={{ fontSize: '12px' }}>24 total vehicles <ChevronRight size={16} /></span>
        </div>
      </section>
    </div>
  )
}
