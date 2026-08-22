export const vehicles = [
  { id: 'TRK-042', type: 'Compactor', route: 'Alpha 1 - Block A', status: 'On route', fuel: '78%', driver: 'Maya Chen', updated: '2 min ago', lat: 28.4735, lng: 77.5015, startLat: 28.4710, startLng: 77.4980, targetLat: 28.4750, targetLng: 77.5000 },
  { id: 'TRK-018', type: 'Roll-off', route: 'Commercial Belt', status: 'On route', fuel: '64%', driver: 'Jordan Smith', updated: '5 min ago', lat: 28.4715, lng: 77.5040, startLat: 28.4690, startLng: 77.5010, targetLat: 28.4730, targetLng: 77.5020 },
  { id: 'TRK-031', type: 'Rear loader', route: 'C Market', status: 'At depot', fuel: '92%', driver: 'Avery Johnson', updated: '8 min ago', lat: 28.4705, lng: 77.5005, startLat: 28.4705, startLng: 77.5005, targetLat: 28.4705, targetLng: 77.5005 },
  { id: 'TRK-027', type: 'Compactor', route: 'Golf Course Area', status: 'Maintenance', fuel: '31%', driver: '—', updated: '18 min ago', lat: 28.4650, lng: 77.5070, startLat: 28.4650, startLng: 77.5070, targetLat: 28.4650, targetLng: 77.5070 },
  { id: 'TRK-006', type: 'Sweeper', route: 'Knowledge Park', status: 'On route', fuel: '55%', driver: 'Noah Williams', updated: '22 min ago', lat: 28.4780, lng: 77.4950, startLat: 28.4780, startLng: 77.4910, targetLat: 28.4725, targetLng: 77.5050 },
]

export const sweepers = [
  { id: 'SWP-101', name: 'Raj Kumar', status: 'Active', lat: 28.4755, lng: 77.5035, targetLat: 28.4725, targetLng: 77.5050 },
  { id: 'SWP-102', name: 'Anita Devi', status: 'Active', lat: 28.4715, lng: 77.5020, targetLat: 28.4740, targetLng: 77.5010 },
  { id: 'SWP-103', name: 'Suresh Singh', status: 'Break', lat: 28.4730, lng: 77.5040, targetLat: 28.4730, targetLng: 77.5040 },
]

export const depots = [
  { id: 'DEP-01', name: 'Alpha 1 Main Depot', lat: 28.4705, lng: 77.5005, capacity: 15, current_vehicles: 8 },
  { id: 'DEP-02', name: 'Knowledge Park Depot', lat: 28.4650, lng: 77.5070, capacity: 20, current_vehicles: 5 },
]

export const wasteBins = [
  { id: 'BIN-101', lat: 28.4730, lng: 77.5020, fillLevel: 95, status: 'Full', source: 'CCTV Camera 4A', volumeEst: '3.2 cubic meters' },
  { id: 'BIN-102', lat: 28.4850, lng: 77.4910, fillLevel: 85, status: 'Full', source: 'Satellite Imagery', volumeEst: '2.1 cubic meters' },
  { id: 'BIN-103', lat: 28.4610, lng: 77.5135, fillLevel: 10, status: 'Empty', source: 'Public Transit Dashcam', volumeEst: '0.2 cubic meters' },
  { id: 'BIN-104', lat: 28.4925, lng: 77.5050, fillLevel: 80, status: 'Warning', source: 'Citizen App Report', volumeEst: '2.5 cubic meters' },
  { id: 'BIN-105', lat: 28.4680, lng: 77.4850, fillLevel: 100, status: 'Full', source: 'CCTV Camera 2B', volumeEst: '4.0 cubic meters (Overflow)' },
  { id: 'BIN-106', lat: 28.4810, lng: 77.5210, fillLevel: 65, status: 'Normal', source: 'Traffic Cam 9', volumeEst: '2.0 cubic meters' },
  { id: 'BIN-107', lat: 28.4550, lng: 77.4980, fillLevel: 90, status: 'Full', source: 'Citizen App Report', volumeEst: '3.0 cubic meters' },
  { id: 'BIN-108', lat: 28.4790, lng: 77.4820, fillLevel: 75, status: 'Warning', source: 'Satellite Imagery', volumeEst: '2.2 cubic meters' },
]
