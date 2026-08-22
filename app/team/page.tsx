'use client'

import { useState } from 'react'
import { vehicles, sweepers } from '../../lib/mockData'
import { Filter, Users } from 'lucide-react'

type TeamMember = {
  id: string
  name: string
  role: 'Driver' | 'Sweeper'
  status: string
  assignment: string
}

export default function TeamPage() {
  const [filter, setFilter] = useState<'All' | 'Driver' | 'Sweeper'>('All')

  // Map mock data into a unified team structure
  const allMembers: TeamMember[] = [
    ...vehicles.filter(v => v.driver && v.driver !== '—').map(v => ({
      id: v.id + '-D',
      name: v.driver,
      role: 'Driver' as const,
      status: v.status,
      assignment: v.id // The truck ID
    })),
    ...sweepers.map(s => ({
      id: s.id,
      name: s.name,
      role: 'Sweeper' as const,
      status: s.status,
      assignment: 'Street Patrol'
    }))
  ].sort((a, b) => a.name.localeCompare(b.name))

  const filteredMembers = filter === 'All' 
    ? allMembers 
    : allMembers.filter(m => m.role === filter)

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow accent-eyebrow">Personnel</p>
          <h1>Team Directory</h1>
          <p className="subheading">Manage drivers and sweepers currently on duty.</p>
        </div>
      </div>

      <div className="panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={18} className="text-slate-400" />
            <select 
              className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm outline-none text-white focus:border-emerald-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="All">All Roles</option>
              <option value="Driver">Drivers Only</option>
              <option value="Sweeper">Sweepers Only</option>
            </select>
          </div>
          <div className="text-sm text-slate-400 font-medium">
            <Users size={16} className="inline mr-2" />
            {filteredMembers.length} Members Found
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-sm">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Current Assignment</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {member.name}
                  </td>
                  <td className="py-4 text-slate-300">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${member.role === 'Driver' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="flex items-center gap-2 text-sm">
                      <span className={`w-2 h-2 rounded-full ${member.status.includes('route') || member.status === 'Active' || member.status === 'Clearing Waste' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                      {member.status === 'On route' || member.status === 'Clearing Waste' ? 'Active' : member.status}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-slate-400">
                    {member.assignment}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
