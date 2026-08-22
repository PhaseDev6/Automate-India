'use client'

import { useState, useRef, useEffect } from 'react'

export default function DebugPage() {
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clear previous results on mount
  useEffect(() => {
    localStorage.removeItem('recentDetections')
  }, [])

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
      setImageFiles(filesArray)
      setResults([])
      setCurrentIndex(0)
    }
  }

  const runBatchInference = async () => {
    if (imageFiles.length === 0) return

    setIsProcessing(true)
    const newResults: any[] = []
    
    // Simulate mapping random lat/lng in Greater Noida for the test images
    const baseLat = 28.4728
    const baseLng = 77.5028

    for (let i = 0; i < imageFiles.length; i++) {
      setCurrentIndex(i)
      const file = imageFiles[i]
      
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`/api/analyze-trash`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error("API Error")
        const data = await response.json()
        
        // Add mock location data to the telemetry
        const detection = {
          ...data,
          id: `det-${Date.now()}-${i}`,
          filename: file.name,
          lat: baseLat + (Math.random() - 0.5) * 0.04,
          lng: baseLng + (Math.random() - 0.5) * 0.04,
          timestamp: new Date().toISOString()
        }
        
        newResults.push(detection)
        setResults([...newResults]) // Trigger re-render

        // Sync with the Live Map via localStorage
        localStorage.setItem('recentDetections', JSON.stringify(newResults))
        
        // Artificial delay so judges can see the stream processing
        await new Promise(r => setTimeout(r, 1500))
        
      } catch (err: any) {
        console.error("Failed on file:", file.name, err)
      }
    }
    
    setIsProcessing(false)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto text-white h-[90vh] flex flex-col">
      <div className="mb-6 border-b border-slate-700 pb-4 shrink-0">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <span className="text-emerald-400 mr-3">✨</span> 
          Batch AI Vision Telemetry
        </h1>
        <p className="text-slate-400">
          Upload a folder of images to simulate a real-time stream of camera feeds being analyzed. 
          Results will be synced instantly to the Live Map as pulsing red dots.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        
        {/* Control Panel */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-4 text-slate-200">Data Source</h2>
          
          <div 
            className="flex-1 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center bg-slate-900 cursor-pointer hover:border-emerald-500 transition-colors p-6 text-center mb-4"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-4xl mb-3">📁</div>
            <p className="text-slate-300 font-semibold mb-1">Upload Image Folder</p>
            <p className="text-slate-500 text-sm">Select a directory containing test images</p>
            
            {/* The webkitdirectory attribute allows folder selection */}
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              // @ts-ignore
              webkitdirectory="true"
              directory="true"
              multiple
              onChange={handleFolderChange}
            />
          </div>

          {imageFiles.length > 0 && (
            <div className="mb-4 bg-slate-900 p-3 rounded border border-slate-700 text-sm text-slate-300 flex justify-between items-center">
              <span>{imageFiles.length} images loaded</span>
              {isProcessing && <span className="text-emerald-400 animate-pulse">Processing {currentIndex + 1} / {imageFiles.length}...</span>}
            </div>
          )}

          <button 
            onClick={runBatchInference}
            disabled={isProcessing || imageFiles.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-lg ${
              isProcessing ? 'bg-slate-700 cursor-not-allowed text-emerald-400' : 
              imageFiles.length === 0 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 
              'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]'
            }`}
          >
            {isProcessing ? (
              <><div className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" /> Analyzing Stream...</>
            ) : (
              '🚀 Start Batch Inference'
            )}
          </button>
        </div>

        {/* Results Stream */}
        <div className="bg-[#0d1117] p-6 rounded-xl border border-slate-700 lg:col-span-2 flex flex-col h-full overflow-hidden">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400 font-mono flex items-center gap-2 shrink-0">
            <span className={`w-3 h-3 rounded-full bg-emerald-500 ${isProcessing ? 'animate-pulse' : ''}`}></span>
            Live Telemetry Feed
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {results.length === 0 && !isProcessing && (
              <div className="h-full flex items-center justify-center text-slate-600 font-mono">
                Awaiting data stream...
              </div>
            )}
            
            {results.map((res, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-sm shadow-md animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="flex justify-between items-start mb-2 border-b border-slate-800 pb-2">
                  <div className="text-emerald-400 font-bold">Image: {res.filename}</div>
                  <div className="text-slate-500 text-xs">{new Date(res.timestamp).toLocaleTimeString()}</div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                  <div>
                    <div className="text-slate-500 text-xs mb-1">Severity</div>
                    <div className={`font-bold ${res.severity_score > 70 ? 'text-red-400' : 'text-emerald-400'}`}>{res.severity_score}%</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs mb-1">Volume Est.</div>
                    <div className="text-slate-300">{res.volume_estimate}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs mb-1">Dispatch</div>
                    <div className={res.dispatch_required ? 'text-red-400 font-bold' : 'text-slate-400'}>
                      {res.dispatch_required ? 'REQUIRED' : 'NO'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs mb-1">Mapped Coordinates</div>
                    <div className="text-slate-400 text-xs truncate">[{res.lat.toFixed(4)}, {res.lng.toFixed(4)}]</div>
                  </div>
                </div>
                
                <div className="text-slate-400 text-xs mt-2 bg-black p-2 rounded">
                  {res.analysis_summary}
                </div>
              </div>
            ))}
            
            {/* Scroll anchor */}
            {isProcessing && (
              <div className="text-center py-4">
                <div className="inline-block w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
