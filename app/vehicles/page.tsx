'use client'

import { useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Filter,
  MoreHorizontal,
  Search,
  Truck,
  X,
} from 'lucide-react'
import { vehicles as initialVehicles } from '../../lib/mockData'
import { StatusPill } from '../../components/StatusPill'

export default function VehiclesPage() {
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [vehicleList, setVehicleList] = useState(initialVehicles)
  const [selectedFilter, setSelectedFilter] = useState('All vehicles')

  const filteredVehicles = useMemo(() => vehicleList.filter((vehicle) => {
    const query = search.toLowerCase()
    const matchesSearch = [vehicle.id, vehicle.type, vehicle.route, vehicle.driver].some((item) => item.toLowerCase().includes(query))
    const matchesFilter = selectedFilter === 'All vehicles' || vehicle.status === selectedFilter
    return matchesSearch && matchesFilter
  }), [search, selectedFilter, vehicleList])

  function addVehicle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setVehicleList((items) => [{ id: String(form.get('id')), type: String(form.get('type')), route: 'Unassigned', status: 'At depot', fuel: '100%', driver: '—', updated: 'Just now' }, ...items])
    setAddOpen(false)
  }

  return (
    <>
      <div className="page-heading">
        <div><h1>Fleet Management</h1><p className="subheading">Manage and monitor your active vehicle fleet.</p></div>
        <button className="primary-button" onClick={() => setAddOpen(true)}><CirclePlus size={17} />Add vehicle</button>
      </div>

      <section className="panel vehicles-panel">
        <div className="panel-header table-heading">
          <div><h2>Fleet overview</h2><p>Manage and monitor your active vehicle fleet</p></div>
          <div className="table-actions">
            <div className="search-box">
              <Search size={16} /><input aria-label="Search vehicles" placeholder="Search vehicles..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <div className="filter-wrap">
              <button className="outline-button" onClick={() => setFilterOpen(!filterOpen)}><Filter size={15} />Filter<ChevronDown size={14} /></button>
              {filterOpen && (
                <div className="popover filter-popover">
                  {['All vehicles', 'On route', 'At depot', 'Maintenance'].map((filter) => (
                    <button className={selectedFilter === filter ? 'filter-active' : ''} key={filter} onClick={() => { setSelectedFilter(filter); setFilterOpen(false) }}>{filter}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Vehicle</th><th>Type</th><th>Current route</th><th>Status</th><th>Fuel level</th><th>Driver</th><th>Last update</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td><div className="vehicle-name"><span className="vehicle-icon"><Truck size={15} /></span><strong>{vehicle.id}</strong></div></td>
                  <td>{vehicle.type}</td>
                  <td>{vehicle.route}</td>
                  <td><StatusPill status={vehicle.status} /></td>
                  <td><div className="fuel-cell"><div className="fuel-bar"><span style={{ width: vehicle.fuel }} /></div>{vehicle.fuel}</div></td>
                  <td>{vehicle.driver}</td>
                  <td className="muted-cell">{vehicle.updated}</td>
                  <td><button className="more-button" aria-label={`More actions for ${vehicle.id}`}><MoreHorizontal size={17} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredVehicles.length === 0 && <div className="empty-state">No vehicles match your search.</div>}
        </div>
        <div className="table-footer">
          <span>Showing <strong>{filteredVehicles.length}</strong> of {vehicleList.length} vehicles</span>
          <div className="pagination">
            <button aria-label="Previous page"><ChevronLeft size={15} /></button><button className="page-active">1</button><button>2</button><button>3</button><span>...</span><button>5</button><button aria-label="Next page"><ChevronRight size={15} /></button>
          </div>
        </div>
      </section>

      {addOpen && (
        <div className="modal-backdrop" onMouseDown={() => setAddOpen(false)}>
          <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header"><div><h2>Add vehicle</h2><p>Add a new vehicle to your fleet.</p></div><button className="more-button" onClick={() => setAddOpen(false)}><X size={17} /></button></div>
            <form onSubmit={addVehicle}>
              <label>Vehicle ID<input name="id" placeholder="e.g. TRK-052" required /></label>
              <label>Vehicle type
                <select name="type" defaultValue="Compactor"><option>Compactor</option><option>Roll-off</option><option>Rear loader</option><option>Sweeper</option></select>
              </label>
              <div className="modal-actions"><button type="button" className="outline-button" onClick={() => setAddOpen(false)}>Cancel</button><button type="submit" className="primary-button">Add vehicle</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
