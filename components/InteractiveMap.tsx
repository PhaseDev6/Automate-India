'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { vehicles as initialVehicles, wasteBins, sweepers as initialSweepers, depots } from '../lib/mockData'
import L from 'leaflet'
import { Zap } from 'lucide-react'

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

// Helper function to move smoothly towards a target coordinate
function moveTowards(currentLat: number, currentLng: number, targetLat: number, targetLng: number, speed: number) {
  const dx = targetLat - currentLat;
  const dy = targetLng - currentLng;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist <= speed) {
    return { lat: targetLat, lng: targetLng, arrived: true };
  }
  
  const ratio = speed / dist;
  return { 
    lat: currentLat + dx * ratio, 
    lng: currentLng + dy * ratio, 
    arrived: false 
  };
}

export default function InteractiveMap({ height = '400px' }: { height?: string }) {
  const [mounted, setMounted] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  
  // Live states
  const [liveVehicles, setLiveVehicles] = useState(initialVehicles)
  const [liveSweepers, setLiveSweepers] = useState(initialSweepers)
  const [liveDetections, setLiveDetections] = useState<any[]>([])
  const [triggerRender, setTriggerRender] = useState(0) 
  
  // Advanced Simulation State
  const agentStateRef = useRef<{ 
    [key: string]: { 
      route: [number, number][]; 
      targetIndex: number; 
      direction: number; 
      idleTicks: number; 
    } 
  }>({})

  // CVRP RL Engine State
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optError, setOptError] = useState<string|null>(null)

  const triggerOptimization = async () => {
    setIsOptimizing(true)
    setOptError(null)
    
    try {
      const payload = {
        depot: { lat: depots[0].lat, lng: depots[0].lng },
        vehicles: liveVehicles.map(v => ({ id: v.id, lat: v.lat, lng: v.lng, capacity: 100 })),
        hotspots: wasteBins.filter(b => b.fillLevel > 50).map(b => ({ id: b.id, lat: b.lat, lng: b.lng, demand: b.fillLevel }))
      }

      // Check for external engine in settings, default to internal Next.js API
      const externalUrl = localStorage.getItem('externalEngineUrl')
      const targetUrl = externalUrl ? `${externalUrl}/optimize-routes` : '/api/optimize-routes'

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to connect to CVRP Engine')
      const data = await res.json()

      if (data.status === 'success') {
        // Apply new routes to vehicles
        for (const [vId, newRoute] of Object.entries(data.routes)) {
          if (Array.isArray(newRoute) && newRoute.length > 0) {
            agentStateRef.current[vId] = {
              route: newRoute as [number, number][],
              targetIndex: 1,
              direction: 1,
              idleTicks: 0
            }
          }
        }
        alert('Fleet Optimized! Vehicles are now rerouting.')
      } else {
        throw new Error(data.message || 'Optimization failed')
      }
    } catch (e: any) {
      setOptError(e.message)
    } finally {
      setIsOptimizing(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    
    // Fetch and initialize routes
    const fetchAllRoutes = async () => {
      const activeAgents = [
        ...initialVehicles.filter(v => v.targetLat !== v.lat),
        ...initialSweepers.filter(s => s.targetLat !== s.lat)
      ]

      for (const agent of activeAgents) {
        try {
          await new Promise(r => setTimeout(r, 200)) 
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${agent.lng},${agent.lat};${agent.targetLng},${agent.targetLat}?overview=full&geometries=geojson`)
          const data = await res.json()
          if (data.routes && data.routes[0]) {
            const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]])
            agentStateRef.current[agent.id] = {
              route: coords,
              targetIndex: 1, // Start moving towards index 1
              direction: 1,   // 1 = forward, -1 = backward
              idleTicks: 0
            }
          }
        } catch (e) {
          console.error(`Error fetching route for ${agent.id}:`, e)
        }
      }
    }
    
    fetchAllRoutes()
  }, [])

  // Smooth Simulation Interval (Runs every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      
      const simulateAgentMove = (agent: any, isSweeper: boolean) => {
        const state = agentStateRef.current[agent.id]
        
        // If agent has no route, just drift slightly
        if (!state || !state.route || state.route.length === 0) {
          return {
            ...agent,
            lat: agent.lat + (Math.random() - 0.5) * 0.00002,
            lng: agent.lng + (Math.random() - 0.5) * 0.00002
          }
        }

        // If agent is currently clearing trash or at depot (idle)
        if (state.idleTicks > 0) {
          state.idleTicks -= 1;
          // Jitter slightly while working/idle
          return {
            ...agent,
            lat: agent.lat + (Math.random() - 0.5) * 0.00002,
            lng: agent.lng + (Math.random() - 0.5) * 0.00002,
            status: state.targetIndex >= state.route.length - 1 && state.direction === 1 ? 'Clearing Waste' : 'At Depot'
          }
        }

        // Agent is moving
        const targetPoint = state.route[state.targetIndex];
        // Trucks move ~15m per tick, Sweepers move ~3m per tick
        const speed = isSweeper ? 0.00003 : 0.00015; 
        
        const moveRes = moveTowards(agent.lat, agent.lng, targetPoint[0], targetPoint[1], speed);

        // If they reached the current sub-waypoint
        if (moveRes.arrived) {
          state.targetIndex += state.direction;

          // Reached the very end of the route (Trash spot)
          if (state.targetIndex >= state.route.length) {
            state.direction = -1; // Turn around
            state.targetIndex = state.route.length - 2;
            state.idleTicks = 8; // Spend 8 seconds clearing the trash
          } 
          // Reached the very beginning of the route (Depot)
          else if (state.targetIndex < 0) {
            state.direction = 1; // Turn around
            state.targetIndex = 1;
            state.idleTicks = 8; // Spend 8 seconds unloading at depot
          }
        }

        return {
          ...agent,
          lat: moveRes.lat,
          lng: moveRes.lng,
          status: 'On route'
        }
      }

      setLiveVehicles(prev => prev.map(v => simulateAgentMove(v, false)))
      setLiveSweepers(prev => prev.map(s => simulateAgentMove(s, true)))
      
      setTriggerRender(prev => prev + 1) // Force update to redraw selected path
    }, 1000); // 1 second interval for ultra-smooth movement

    // Polling for Live Telemetry from Debug Page
    const telemetryInterval = setInterval(() => {
      try {
        const stored = localStorage.getItem('recentDetections')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLiveDetections(parsed)
          }
        }
      } catch(e) {}
    }, 2000)

    return () => {
      clearInterval(interval)
      clearInterval(telemetryInterval)
    }
  }, [])

  if (!mounted) return <div style={{ height, width: '100%', background: '#1e293b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>

  const center: [number, number] = [28.4728, 77.5028]
  
  // Calculate the traveled and remaining path lines to draw for the selected agent
  let traveledPath: [number, number][] = [];
  let remainingPath: [number, number][] = [];
  
  if (selectedAgentId && agentStateRef.current[selectedAgentId]) {
    const state = agentStateRef.current[selectedAgentId];
    if (state.direction === 1) {
      // Moving forward
      traveledPath = state.route.slice(0, state.targetIndex + 1);
      remainingPath = state.route.slice(state.targetIndex);
    } else {
      // Moving backward
      traveledPath = state.route.slice(state.targetIndex, state.route.length).reverse();
      remainingPath = state.route.slice(0, state.targetIndex + 1).reverse();
    }
  }

  return (
    <div style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
      
      {/* Clean Floating Action Button for Optimization */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
        <button 
          onClick={triggerOptimization}
          disabled={isOptimizing}
          className={`px-4 py-3 rounded-full font-bold text-sm flex justify-center items-center gap-2 transition-all shadow-lg backdrop-blur-md ${
            isOptimizing ? 'bg-slate-800/80 cursor-not-allowed text-emerald-500 animate-pulse' : 'bg-slate-900/90 border border-slate-700 hover:bg-emerald-600 hover:border-emerald-500 text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]'
          }`}
        >
          {isOptimizing ? (
            <><div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"/> Calculating Routes...</>
          ) : (
            <><Zap size={16} className="text-emerald-400" /> Optimize Fleet Routes</>
          )}
        </button>
        {optError && <div className="absolute top-full mt-2 right-0 whitespace-nowrap text-xs text-red-400 bg-red-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-red-500/30 shadow-lg">{optError}</div>}
      </div>

      <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%', zIndex: 0 }} onClick={() => setSelectedAgentId(null)}>
        {/* Dark theme tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Draw traveled path line (Faded gray, dashed) */}
        {traveledPath && traveledPath.length > 0 && (
          <Polyline positions={traveledPath} color="#64748b" weight={4} opacity={0.5} dashArray="5, 10" />
        )}
        
        {/* Draw remaining path line (Bright emerald, solid) */}
        {remainingPath && remainingPath.length > 0 && (
          <Polyline positions={remainingPath} color="#10b981" weight={5} opacity={0.9} />
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
              Status: <span className={s.status === 'Clearing Waste' ? 'text-emerald-500 font-bold' : ''}>{s.status}</span>
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
              Status: <span className={v.status === 'Clearing Waste' ? 'text-emerald-500 font-bold' : ''}>{v.status}</span><br/>
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

        {/* Render Live AI Detections (Pulsing Red Dots) */}
        {liveDetections.map((detection) => (
          <CircleMarker 
            key={detection.id} 
            center={[detection.lat, detection.lng]}
            radius={8}
            pathOptions={{ 
              color: '#ef4444', 
              fillColor: '#ef4444', 
              fillOpacity: 0.6,
              weight: 2,
              className: 'animate-ping' // Tailwind pulse effect on SVG
            }}
          >
            <Popup className="custom-popup">
              <div className="font-sans text-sm min-w-[200px]">
                <div className="font-bold border-b border-slate-200 pb-1 mb-2 text-red-600">
                  ⚠️ Live AI Detection
                </div>
                <div className="grid grid-cols-2 gap-1 mb-2">
                  <span className="text-slate-500 font-semibold">Severity:</span>
                  <span className="text-right font-bold text-red-500">{detection.severity_score}%</span>
                  <span className="text-slate-500 font-semibold">Vol:</span>
                  <span className="text-right">{detection.volume_estimate || 'Unknown'}</span>
                </div>
                <div className="text-xs text-slate-600 bg-slate-100 p-2 rounded">
                  {detection.analysis_summary}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
