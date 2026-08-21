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

// Custom modern SVG icon for Vehicles
const createTruckIcon = () => {
  return L.divIcon({
    className: 'custom-truck-icon',
    html: `<div style="background: #10b981; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(16, 185, 129, 0.6); border: 2px solid #ffffff;">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  })
}

const truckIcon = createTruckIcon()
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
