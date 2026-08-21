'use client'

import dynamic from 'next/dynamic'
import { ChevronRight } from 'lucide-react'

const MapComponent = dynamic(() => import('../../components/InteractiveMap'), { ssr: false })

export default function MapPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
      <div className="page-heading" style={{ marginBottom: '16px' }}>
        <div>
          <h1>Live Operations Map</h1>
          <p className="subheading">Real-time vehicle activity across Metro City</p>
        </div>
      </div>

      <section className="panel map-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <MapComponent height="100%" />
        </div>
        
        <div className="map-footer" style={{ padding: '16px 8px 0', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="legend-dot green-fill" style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }} />On route <strong style={{ fontSize: '14px' }}>14</strong></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="legend-dot gray-fill" style={{ width: '10px', height: '10px', background: '#64748b', borderRadius: '50%' }} />At depot <strong style={{ fontSize: '14px' }}>3</strong></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="legend-dot amber-fill" style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '50%' }} />Maintenance <strong style={{ fontSize: '14px' }}>1</strong></div>
          </div>
          <span className="map-total" style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>24 total vehicles <ChevronRight size={16} /></span>
        </div>
      </section>
    </div>
  )
}
