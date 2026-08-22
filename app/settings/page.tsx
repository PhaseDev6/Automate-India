'use client'

import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save, Server, Zap } from 'lucide-react'

export default function SettingsPage() {
  const [engineUrl, setEngineUrl] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const url = localStorage.getItem('externalEngineUrl')
    if (url) {
      setEngineUrl(url)
    }
  }, [])

  const handleSave = () => {
    if (engineUrl.trim() === '') {
      localStorage.removeItem('externalEngineUrl')
    } else {
      localStorage.setItem('externalEngineUrl', engineUrl.trim())
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto text-white h-[90vh] flex flex-col">
      <div className="mb-8 border-b border-slate-700 pb-4 shrink-0">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <SettingsIcon className="text-emerald-400" size={32} /> 
          System Configuration
        </h1>
        <p className="text-slate-400">
          Manage integrations and advanced system preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* CVRP Engine Settings */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Server size={100} />
          </div>
          
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Zap className="text-emerald-400" size={20} />
            Advanced CVRP Routing Engine
          </h2>
          
          <p className="text-sm text-slate-400 mb-6 max-w-2xl">
            By default, the map uses our blazing-fast internal Next.js greedy-heuristic solver. 
            If you want to run the true <strong>Google OR-Tools</strong> pipeline via Google Colab for the demo, 
            paste your Ngrok URL below. Leave blank to use the internal engine.
          </p>
          
          <div className="flex flex-col gap-2 mb-6 max-w-xl">
            <label className="text-sm font-semibold text-slate-300">External Engine URL (Ngrok)</label>
            <input 
              type="text" 
              value={engineUrl}
              onChange={e => setEngineUrl(e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors"
              placeholder="e.g. https://1234-abcd.ngrok-free.app"
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              <Save size={18} />
              Save Configuration
            </button>
            
            {saved && (
              <span className="text-emerald-400 text-sm font-bold animate-in fade-in slide-in-from-left-2">
                ✓ Settings saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
