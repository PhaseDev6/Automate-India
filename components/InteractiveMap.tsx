'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
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
// Custom dynamic SVG icon for Waste Bins (Intensity based)
const createBinIcon = (fillLevel: number) => {
  // Calculate intensity (0.0 to 1.0)
  const intensity = fillLevel / 100;
  
  // The red circle border and glow scales with intensity
  const borderWidth = Math.max(1, intensity * 4); // 1px to 4px
  const shadowSpread = Math.max(5, intensity * 25); // 5px to 25px glow
  const borderColor = `rgba(239, 68, 68, ${Math.max(0.4, intensity)})`;
  const iconColor = fillLevel >= 80 ? '#ef4444' : '#94a3b8'; // Red if high, else gray

  return L.divIcon({
    className: 'custom-bin-icon',
    html: `<div style="background: #0f172a; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: ${borderWidth}px solid ${borderColor}; box-shadow: 0 0 ${shadowSpread}px rgba(239, 68, 68, ${intensity}); z-index: ${fillLevel};">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  })
}

export default function InteractiveMap() {
  const [mounted, setMounted] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [pastRoute, setPastRoute] = useState<[number, number][]>([])
  const [futureRoute, setFutureRoute] = useState<[number, number][]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!selectedVehicleId) {
      setPastRoute([])
      setFutureRoute([])
      return
    }

    const vehicle = vehicles.find(v => v.id === selectedVehicleId)
    if (!vehicle) return

    // Find the highest priority bin (hotspot)
    const targetBin = [...wasteBins].sort((a, b) => b.fillLevel - a.fillLevel)[0]

    // Fetch past route (Depot to Current)
    const fetchPastRoute = async () => {
      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${vehicle.startLng},${vehicle.startLat};${vehicle.lng},${vehicle.lat}?overview=full&geometries=geojson`)
        const data = await res.json()
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]])
          setPastRoute(coords)
        }
      } catch (e) {
        console.error("Error fetching past route:", e)
      }
    }

    // Fetch future route (Current to Bin)
    const fetchFutureRoute = async () => {
      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${vehicle.lng},${vehicle.lat};${targetBin.lng},${targetBin.lat}?overview=full&geometries=geojson`)
        const data = await res.json()
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]])
          setFutureRoute(coords)
        }
      } catch (e) {
        console.error("Error fetching future route:", e)
      }
    }

    fetchPastRoute()
    fetchFutureRoute()
  }, [selectedVehicleId])

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
        
        {pastRoute.length > 0 && <Polyline positions={pastRoute} color="#64748b" weight={4} dashArray="5, 10" />}
        {futureRoute.length > 0 && <Polyline positions={futureRoute} color="#10b981" weight={5} />}

        {vehicles.map((v) => (
          <Marker 
            key={v.id} 
            position={[v.lat, v.lng]} 
            icon={truckIcon}
            eventHandlers={{
              click: () => {
                setSelectedVehicleId(v.id)
              }
            }}
          >
            <Popup>
              <strong>{v.id}</strong> ({v.type})<br/>
              Status: {v.status}<br/>
              Fuel: {v.fuel}<br/>
              Driver: {v.driver}
            </Popup>
          </Marker>
        ))}

        {wasteBins.map((bin) => {
          return (
            <Marker key={bin.id} position={[bin.lat, bin.lng]} icon={createBinIcon(bin.fillLevel)}>
              <Popup>
                <strong>{bin.id}</strong><br/>
                Intensity/Fill: {bin.fillLevel}%<br/>
                Status: {bin.status}
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
