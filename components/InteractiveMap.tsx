'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { vehicles, wasteBins } from '../lib/mockData'
import L from 'leaflet'

// Fix for default Leaflet marker icons in Next.js
const createIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

const truckIcon = createIcon('blue')
const binFullIcon = createIcon('red')
const binWarningIcon = createIcon('orange')
const binEmptyIcon = createIcon('green')

export default function InteractiveMap() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div style={{ height: '400px', width: '100%', background: '#1e293b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>

  // Center on Alpha 1 C Market, Greater Noida
  const center: [number, number] = [28.4728, 77.5028]

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        {/* Dark theme tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {vehicles.map((v) => (
          <Marker key={v.id} position={[v.lat, v.lng]} icon={truckIcon}>
            <Popup>
              <strong>{v.id}</strong> ({v.type})<br/>
              Status: {v.status}<br/>
              Fuel: {v.fuel}<br/>
              Driver: {v.driver}
            </Popup>
          </Marker>
        ))}

        {wasteBins.map((bin) => {
          let icon = binEmptyIcon
          if (bin.fillLevel >= 90) icon = binFullIcon
          else if (bin.fillLevel >= 70) icon = binWarningIcon

          return (
            <Marker key={bin.id} position={[bin.lat, bin.lng]} icon={icon}>
              <Popup>
                <strong>{bin.id}</strong><br/>
                Fill Level: {bin.fillLevel}%<br/>
                Status: {bin.status}
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
