'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { vehicles as initialVehicles, wasteBins, sweepers as initialSweepers, depots } from '../lib/mockData'
import L from 'leaflet'

// --- Custom Icons ---

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

const createSweeperIcon = () => {
  return L.divIcon({
    className: 'custom-sweeper-icon',
    html: `<div style="background: #f59e0b; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(245, 158, 11, 0.6); border: 2px solid #ffffff;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M4 10h16"/><path d="M12 10v10"/><path d="M8 22l4-10 4 10"/></svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  })
}

const createDepotIcon = () => {
  return L.divIcon({
    className: 'custom-depot-icon',
    html: `<div style="background: #3b82f6; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(59, 130, 246, 0.6); border: 2px solid #ffffff;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/></svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  })
}

const createBinIcon = (fillLevel: number) => {
  const intensity = fillLevel / 100;
  const borderWidth = Math.max(1, intensity * 4);
  const shadowSpread = Math.max(5, intensity * 25);
  const borderColor = `rgba(239, 68, 68, ${Math.max(0.4, intensity)})`;
  const iconColor = fillLevel >= 80 ? '#ef4444' : '#94a3b8';

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

const truckIcon = createTruckIcon()
const sweeperIcon = createSweeperIcon()
const depotIcon = createDepotIcon()

export default function InteractiveMap({ height = '400px' }: { height?: string }) {
  const [mounted, setMounted] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  
  // Live states for GPS simulation
  const [liveVehicles, setLiveVehicles] = useState(initialVehicles)
  const [liveSweepers, setLiveSweepers] = useState(initialSweepers)
  const [triggerRender, setTriggerRender] = useState(0) // Used to force re-render for path drawing
  
  // Store all routes globally so everyone can move
  const allRoutesRef = useRef<{ [key: string]: [number, number][] }>({})

  useEffect(() => {
    setMounted(true)
    
    // Fetch routes for all vehicles and sweepers that are active
    const fetchAllRoutes = async () => {
      const activeAgents = [
        ...initialVehicles.filter(v => v.targetLat !== v.lat),
        ...initialSweepers.filter(s => s.targetLat !== s.lat)
      ]

      for (const agent of activeAgents) {
        try {
          // Add a small delay to avoid hitting OSRM rate limits
          await new Promise(r => setTimeout(r, 200)) 
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${agent.lng},${agent.lat};${agent.targetLng},${agent.targetLat}?overview=full&geometries=geojson`)
          const data = await res.json()
          if (data.routes && data.routes[0]) {
            const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]])
            allRoutesRef.current[agent.id] = coords
          }
        } catch (e) {
          console.error(`Error fetching route for ${agent.id}:`, e)
        }
      }
    }
    
    fetchAllRoutes()
  }, [])

  // Live GPS Simulation Interval (Continuous Movement for ALL active agents)
  useEffect(() => {
    const interval = setInterval(() => {
      
      // Move Trucks
      setLiveVehicles(prev => prev.map(v => {
        const route = allRoutesRef.current[v.id]
        if (route && route.length > 0) {
          // Jump ahead 1-2 points to simulate a slower, realistic GPS location ping
          const jumpAmount = Math.min(Math.floor(Math.random() * 2) + 1, route.length);
          const newPos = route[jumpAmount - 1];
          // Shrink the route line as we consume points
          allRoutesRef.current[v.id] = route.slice(jumpAmount);
          return { ...v, lat: newPos[0], lng: newPos[1] };
        } else {
          // Idle drift
          const jitterLat = (Math.random() - 0.5) * 0.00005;
          const jitterLng = (Math.random() - 0.5) * 0.00005;
          return { ...v, lat: v.lat + jitterLat, lng: v.lng + jitterLng };
        }
      }))

      // Move Sweepers
      setLiveSweepers(prev => prev.map(s => {
        const route = allRoutesRef.current[s.id]
        if (route && route.length > 0) {
          // Sweepers are walking, so they move slower (jump 1 point maximum)
          const jumpAmount = 1;
          const newPos = route[jumpAmount - 1];
          allRoutesRef.current[s.id] = route.slice(jumpAmount);
          return { ...s, lat: newPos[0], lng: newPos[1] };
        } else {
          // Idle drift
          const jitterLat = (Math.random() - 0.5) * 0.00005;
          const jitterLng = (Math.random() - 0.5) * 0.00005;
          return { ...s, lat: s.lat + jitterLat, lng: s.lng + jitterLng };
        }
      }))
      
      setTriggerRender(prev => prev + 1) // Force update to redraw selected path
    }, 2000);

    return () => clearInterval(interval);
  }, [])

  if (!mounted) return <div style={{ height, width: '100%', background: '#1e293b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>

  const center: [number, number] = [28.4728, 77.5028]
  const selectedPath = selectedAgentId ? allRoutesRef.current[selectedAgentId] : []

  return (
    <div style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%', zIndex: 0 }} onClick={() => setSelectedAgentId(null)}>
        {/* Dark theme tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Only draw path if an agent is selected and has remaining route */}
        {selectedPath && selectedPath.length > 0 && (
          <Polyline positions={selectedPath} color="#10b981" weight={5} opacity={0.8} />
        )}

        {/* Render Depots */}
        {depots.map((d) => (
          <Marker key={d.id} position={[d.lat, d.lng]} icon={depotIcon}>
            <Popup>
              <strong>{d.name}</strong><br/>
              Capacity: {d.current_vehicles} / {d.capacity} trucks
            </Popup>
          </Marker>
        ))}

        {/* Render Sweepers */}
        {liveSweepers.map((s) => (
          <Marker 
            key={s.id} 
            position={[s.lat, s.lng]} 
            icon={sweeperIcon}
            eventHandlers={{
              click: () => setSelectedAgentId(s.id)
            }}
          >
            <Popup>
              <strong>{s.name}</strong> ({s.id})<br/>
              Role: Street Sweeper<br/>
              Status: {s.status}
            </Popup>
          </Marker>
        ))}

        {/* Render Trucks */}
        {liveVehicles.map((v) => (
          <Marker 
            key={v.id} 
            position={[v.lat, v.lng]} 
            icon={truckIcon}
            eventHandlers={{
              click: () => setSelectedAgentId(v.id)
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

        {/* Render Waste Bins */}
        {wasteBins.map((bin) => (
          <Marker key={bin.id} position={[bin.lat, bin.lng]} icon={createBinIcon(bin.fillLevel)}>
            <Popup>
              <strong>{bin.id}</strong><br/>
              Severity/Fill: {bin.fillLevel}%<br/>
              Status: {bin.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
