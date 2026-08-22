import { NextResponse } from 'next/server'

type Coordinate = { lat: number, lng: number }
type Vehicle = { id: string, lat: number, lng: number, capacity: number }
type Hotspot = { id: string, lat: number, lng: number, demand: number }

type Payload = {
  depot: Coordinate,
  vehicles: Vehicle[],
  hotspots: Hotspot[]
}

export async function POST(req: Request) {
  try {
    const payload: Payload = await req.json()
    
    if (!payload.hotspots || payload.hotspots.length === 0) {
      return NextResponse.json({ status: 'success', routes: {} })
    }

    // 1. Build Index Map
    // Index 0: Depot
    // Index 1..V: Vehicle Start Locations
    // Index V+1..V+H: Hotspots
    const locations: Coordinate[] = [payload.depot]
    payload.vehicles.forEach(v => locations.push({ lat: v.lat, lng: v.lng }))
    payload.hotspots.forEach(h => locations.push({ lat: h.lat, lng: h.lng }))

    // 2. Fetch OSRM Matrix (Travel Times)
    const coordsStr = locations.map(l => `${l.lng},${l.lat}`).join(';')
    const matrixRes = await fetch(`http://router.project-osrm.org/table/v1/driving/${coordsStr}`)
    
    if (!matrixRes.ok) {
      throw new Error('Failed to fetch OSRM Matrix')
    }
    
    const matrixData = await matrixRes.json()
    if (matrixData.code !== 'Ok') {
      throw new Error('OSRM Matrix returned non-Ok code')
    }
    
    const timeMatrix = matrixData.durations as number[][]

    // 3. Greedy CVRP Algorithm
    const numVehicles = payload.vehicles.length
    const numHotspots = payload.hotspots.length
    
    const unvisited = new Set<number>()
    for (let i = 0; i < numHotspots; i++) {
      unvisited.add(numVehicles + 1 + i) // Hotspot indices start after vehicles
    }

    const vehicleCapacities = payload.vehicles.map(v => v.capacity)
    const vehicleRoutes: number[][] = payload.vehicles.map(v => []) // Stores node sequences

    let activeVehicles = true

    while (unvisited.size > 0 && activeVehicles) {
      activeVehicles = false
      
      for (let v = 0; v < numVehicles; v++) {
        if (unvisited.size === 0) break

        let currentNode = vehicleRoutes[v].length === 0 ? (v + 1) : vehicleRoutes[v][vehicleRoutes[v].length - 1]
        
        // Find nearest unvisited hotspot that fits in capacity
        let bestNextNode = -1
        let minTime = Infinity

        for (const candidateNode of Array.from(unvisited)) {
          const hotspotIdx = candidateNode - (numVehicles + 1)
          const demand = payload.hotspots[hotspotIdx].demand

          if (vehicleCapacities[v] >= demand) {
            const time = timeMatrix[currentNode][candidateNode]
            if (time < minTime) {
              minTime = time
              bestNextNode = candidateNode
            }
          }
        }

        if (bestNextNode !== -1) {
          vehicleRoutes[v].push(bestNextNode)
          unvisited.delete(bestNextNode)
          const hotspotIdx = bestNextNode - (numVehicles + 1)
          vehicleCapacities[v] -= payload.hotspots[hotspotIdx].demand
          activeVehicles = true
        }
      }
    }

    // 4. Resolve full Street Geometry for the calculated routes using OSRM Route API
    const optimizedRoutes: Record<string, [number, number][]> = {}

    for (let v = 0; v < numVehicles; v++) {
      if (vehicleRoutes[v].length > 0) {
        // Sequence: Start Node -> Hotspots... -> Depot (0)
        const sequence = [v + 1, ...vehicleRoutes[v], 0]
        const sequenceCoords = sequence.map(idx => locations[idx])
        
        const routeCoordsStr = sequenceCoords.map(l => `${l.lng},${l.lat}`).join(';')
        
        try {
          const routeRes = await fetch(`http://router.project-osrm.org/route/v1/driving/${routeCoordsStr}?overview=full&geometries=geojson`)
          const routeData = await routeRes.json()
          
          if (routeData.code === 'Ok' && routeData.routes && routeData.routes[0]) {
            // Convert [lng, lat] from GeoJSON to [lat, lng] for Leaflet
            optimizedRoutes[payload.vehicles[v].id] = routeData.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]])
          }
        } catch (err) {
          console.error(`Failed to fetch route for vehicle ${v}`, err)
        }
      }
    }

    return NextResponse.json({
      status: 'success',
      routes: optimizedRoutes
    })

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
  }
}
