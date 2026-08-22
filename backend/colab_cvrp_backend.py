# UrbanSweep - Google Colab CVRP Routing Engine (OR-Tools)
# -------------------------------------------------------------
# INSTRUCTIONS FOR HACKATHON DEMO:
# 1. Open Google Colab (colab.research.google.com) and create a New Notebook.
# 2. Create a Code Cell and paste the pip installs from STEP 1 below. Run it.
# 3. Get a FREE ngrok authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken
# 4. Create a second Code Cell, paste STEP 2 below, insert your authtoken, and run it.
# 5. Copy the public ngrok URL it prints out, and paste it into your UrbanSweep Map Dashboard!

# ==========================================
# STEP 1: RUN THIS IN THE FIRST CELL
# ==========================================
# !pip install ortools fastapi uvicorn pyngrok nest-asyncio pydantic requests

# ==========================================
# STEP 2: RUN THIS IN THE SECOND CELL
# ==========================================
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn
from pyngrok import ngrok
import nest_asyncio
import requests
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import math

app = FastAPI(title="UrbanSweep CVRP Routing Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Coordinate(BaseModel):
    lat: float
    lng: float

class Vehicle(BaseModel):
    id: str
    lat: float
    lng: float
    capacity: int

class Hotspot(BaseModel):
    id: str
    lat: float
    lng: float
    demand: int

class CVRPPayload(BaseModel):
    depot: Coordinate
    vehicles: List[Vehicle]
    hotspots: List[Hotspot]

def get_osrm_matrix(coords):
    # OSRM takes lon,lat
    coords_str = ";".join([f"{c[1]},{c[0]}" for c in coords])
    url = f"http://router.project-osrm.org/table/v1/driving/{coords_str}"
    response = requests.get(url)
    data = response.json()
    if data["code"] != "Ok":
        raise Exception("OSRM Matrix Failed")
    # Convert float durations (seconds) to integers for OR-Tools
    return [[int(x) for x in row] for row in data["durations"]]

def get_osrm_route(coords):
    if len(coords) < 2: return []
    coords_str = ";".join([f"{c[1]},{c[0]}" for c in coords])
    url = f"http://router.project-osrm.org/route/v1/driving/{coords_str}?overview=full&geometries=geojson"
    response = requests.get(url)
    data = response.json()
    if data["code"] != "Ok":
        return []
    # Return as [lat, lng]
    return [[c[1], c[0]] for c in data["routes"][0]["geometry"]["coordinates"]]

@app.post("/optimize-routes")
def optimize_routes(payload: CVRPPayload):
    # If no hotspots, return empty
    if not payload.hotspots:
        return {"status": "no_hotspots", "routes": {}}

    # 1. Build Index Map
    # Index 0: Depot
    # Index 1..V: Vehicles (Start points)
    # Index V+1..V+H: Hotspots
    num_vehicles = len(payload.vehicles)
    num_hotspots = len(payload.hotspots)
    
    locations = [[payload.depot.lat, payload.depot.lng]]
    for v in payload.vehicles:
        locations.append([v.lat, v.lng])
    for h in payload.hotspots:
        locations.append([h.lat, h.lng])

    # 2. Get Distance/Time Matrix from OSRM
    print(f"Fetching OSRM Matrix for {len(locations)} points...")
    time_matrix = get_osrm_matrix(locations)

    # 3. Setup Demands & Capacities
    demands = [0] + [0]*num_vehicles + [h.demand for h in payload.hotspots]
    vehicle_capacities = [v.capacity for v in payload.vehicles]

    # Vehicle Start/End nodes
    # Each vehicle i starts at index (i+1) and ends at index 0 (Depot)
    starts = [i + 1 for i in range(num_vehicles)]
    ends = [0 for _ in range(num_vehicles)]

    # 4. Initialize OR-Tools Routing Model
    manager = pywrapcp.RoutingIndexManager(len(locations), num_vehicles, starts, ends)
    routing = pywrapcp.RoutingModel(manager)

    def time_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return time_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(time_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    def demand_callback(from_index):
        from_node = manager.IndexToNode(from_index)
        return demands[from_node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,  # null capacity slack
        vehicle_capacities,  # vehicle maximum capacities
        True,  # start cumul to zero
        'Capacity'
    )

    # Allow dropping nodes (if capacity is exceeded, penalty applies)
    penalty = 100000
    for node in range(num_vehicles + 1, len(locations)):
        routing.AddDisjunction([manager.NodeToIndex(node)], penalty)

    # 5. Solve using Guided Local Search
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    search_parameters.local_search_metaheuristic = routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    search_parameters.time_limit.seconds = 3

    print("Solving CVRP with Google OR-Tools...")
    solution = routing.SolveWithParameters(search_parameters)

    if not solution:
        return {"status": "error", "message": "No solution found."}

    # 6. Parse Solution and Generate Real Paths
    optimized_routes = {}
    
    for vehicle_id_idx in range(num_vehicles):
        index = routing.Start(vehicle_id_idx)
        vehicle_node_sequence = []
        
        while not routing.IsEnd(index):
            node_index = manager.IndexToNode(index)
            vehicle_node_sequence.append(locations[node_index])
            index = solution.Value(routing.NextVar(index))
        
        # Add the Depot (end node)
        node_index = manager.IndexToNode(index)
        vehicle_node_sequence.append(locations[node_index])

        # If a vehicle only has Start -> End (Depot), it did no work.
        if len(vehicle_node_sequence) > 2:
            vehicle_obj = payload.vehicles[vehicle_id_idx]
            print(f"Fetching real street route for {vehicle_obj.id} with {len(vehicle_node_sequence)} waypoints...")
            
            # Fetch complete multi-stop geometry from OSRM
            full_route_geometry = get_osrm_route(vehicle_node_sequence)
            optimized_routes[vehicle_obj.id] = full_route_geometry
            
    return {
        "status": "success",
        "routes": optimized_routes
    }

@app.get("/")
def health_check():
    return {"status": "online", "message": "UrbanSweep CVRP Engine is listening!"}

# ==========================================
# STEP 3: Setup Ngrok Tunnel (REPLACE THIS TOKEN!)
# ==========================================
NGROK_AUTH_TOKEN = "YOUR_NGROK_AUTHTOKEN_HERE" 
ngrok.set_auth_token(NGROK_AUTH_TOKEN)

public_url = ngrok.connect(8000).public_url
print("\n" + "="*50)
print(f"🚀 YOUR CVRP ENGINE URL IS: {public_url}")
print(f"👉 PASTE THIS URL INTO YOUR NEXT.JS MAP DASHBOARD")
print("="*50 + "\n")

import asyncio
nest_asyncio.apply()
config = uvicorn.Config(app, host="0.0.0.0", port=8000)
server = uvicorn.Server(config)
# Run using event loop for colab
loop = asyncio.get_event_loop()
loop.create_task(server.serve())
