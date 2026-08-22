export const vehicles = [
  { id: 'TRK-042', type: 'Compactor', route: 'Alpha 1 - Block A', status: 'On route', fuel: '78%', driver: 'Maya Chen', updated: '2 min ago', lat: 28.4735, lng: 77.5015, startLat: 28.4710, startLng: 77.4980, targetLat: 28.4750, targetLng: 77.5000 },
  { id: 'TRK-018', type: 'Roll-off', route: 'Commercial Belt', status: 'On route', fuel: '64%', driver: 'Jordan Smith', updated: '5 min ago', lat: 28.4905, lng: 77.4940, startLat: 28.4900, startLng: 77.4900, targetLat: 28.4910, targetLng: 77.4960 },
  { id: 'TRK-031', type: 'Rear loader', route: 'C Market', status: 'At depot', fuel: '92%', driver: 'Avery Johnson', updated: '8 min ago', lat: 28.4705, lng: 77.5005, startLat: 28.4705, startLng: 77.5005, targetLat: 28.4705, targetLng: 77.5005 },
  { id: 'TRK-027', type: 'Compactor', route: 'Golf Course Area', status: 'Maintenance', fuel: '31%', driver: '—', updated: '18 min ago', lat: 28.4650, lng: 77.5070, startLat: 28.4650, startLng: 77.5070, targetLat: 28.4650, targetLng: 77.5070 },
  { id: 'TRK-006', type: 'Sweeper', route: 'Knowledge Park', status: 'On route', fuel: '55%', driver: 'Noah Williams', updated: '22 min ago', lat: 28.4620, lng: 77.5250, startLat: 28.4600, startLng: 77.5210, targetLat: 28.4640, targetLng: 77.5270 },
  { id: 'TRK-055', type: 'Compactor', route: 'Tech Zone', status: 'On route', fuel: '88%', driver: 'Raj Patel', updated: '1 min ago', lat: 28.4850, lng: 77.4800, startLat: 28.4800, startLng: 77.4800, targetLat: 28.4880, targetLng: 77.4820 },
  { id: 'TRK-012', type: 'Roll-off', route: 'Eco Village', status: 'On route', fuel: '45%', driver: 'Priya Sharma', updated: '12 min ago', lat: 28.4550, lng: 77.4950, startLat: 28.4500, startLng: 77.4900, targetLat: 28.4580, targetLng: 77.4990 },
  { id: 'TRK-088', type: 'Rear loader', route: 'Omega Sector', status: 'On route', fuel: '72%', driver: 'Arjun Singh', updated: '4 min ago', lat: 28.4420, lng: 77.5150, startLat: 28.4400, startLng: 77.5100, targetLat: 28.4450, targetLng: 77.5180 },
]

export const sweepers = [
  { id: 'SWP-101', name: 'Raj Kumar', status: 'Active', lat: 28.4755, lng: 77.5035, targetLat: 28.4725, targetLng: 77.5050 },
  { id: 'SWP-102', name: 'Anita Devi', status: 'Active', lat: 28.4815, lng: 77.5220, targetLat: 28.4840, targetLng: 77.5210 },
  { id: 'SWP-103', name: 'Suresh Singh', status: 'Break', lat: 28.4730, lng: 77.5040, targetLat: 28.4730, targetLng: 77.5040 },
  { id: 'SWP-104', name: 'Meera Patel', status: 'Active', lat: 28.4520, lng: 77.4820, targetLat: 28.4540, targetLng: 77.4800 },
  { id: 'SWP-105', name: 'Vikram Das', status: 'Active', lat: 28.4950, lng: 77.4980, targetLat: 28.4970, targetLng: 77.5000 },
  { id: 'SWP-106', name: 'Sunita Sharma', status: 'Active', lat: 28.4680, lng: 77.5350, targetLat: 28.4700, targetLng: 77.5380 },
]

export const depots = [
  { id: 'DEP-01', name: 'Alpha Main Depot', lat: 28.4705, lng: 77.5005, capacity: 15, current_vehicles: 8 },
  { id: 'DEP-02', name: 'Knowledge Park Depot', lat: 28.4650, lng: 77.5070, capacity: 20, current_vehicles: 5 },
  { id: 'DEP-03', name: 'Eco Village Hub', lat: 28.4450, lng: 77.4850, capacity: 10, current_vehicles: 2 },
  { id: 'DEP-04', name: 'North Tech Depot', lat: 28.4980, lng: 77.5100, capacity: 25, current_vehicles: 12 },
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
  { id: 'BIN-109', lat: 28.4410, lng: 77.5050, fillLevel: 88, status: 'Full', source: 'Drone Survey', volumeEst: '2.8 cubic meters' },
  { id: 'BIN-110', lat: 28.4990, lng: 77.4850, fillLevel: 40, status: 'Normal', source: 'Citizen App Report', volumeEst: '1.0 cubic meters' },
  { id: 'BIN-111', lat: 28.4650, lng: 77.5350, fillLevel: 92, status: 'Full', source: 'Traffic Cam 12', volumeEst: '3.5 cubic meters' },
  { id: 'BIN-112', lat: 28.4480, lng: 77.4720, fillLevel: 60, status: 'Normal', source: 'Public Transit Dashcam', volumeEst: '1.8 cubic meters' },
]
