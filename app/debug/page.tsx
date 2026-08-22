'use client'

import { useState, useRef, useEffect } from 'react'

type DetectionResult = {
  id: string;
  imagePreview: string;
  filename: string;
  severity_score: number;
  dispatch_required: boolean;
  analysis_summary: string;
}

export default function DebugPage() {
  const [images, setImages] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<DetectionResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clear local storage when mounted so old debug runs don't show on map
  useEffect(() => {
    localStorage.removeItem('live_detected_spots')
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImages(Array.from(e.target.files))
      setResults([])
      setCurrentIndex(0)
      setError(null)
    }
  }

  const runBatchInference = async () => {
    if (images.length === 0) {
      setError("Please upload images to analyze.")
      return
    }

    setIsProcessing(true)
    setError(null)
    
    // Process one by one
    for (let i = 0; i < images.length; i++) {
      setCurrentIndex(i)
      const file = images[i]
      
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`/api/analyze-trash`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error(`Server error ${response.status}`)
        const data = await response.json()

        // Create preview URL for the result list
        const previewUrl = URL.createObjectURL(file)

        const newResult: DetectionResult = {
          id: `det-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          imagePreview: previewUrl,
          filename: file.name,
          ...data
        }

        setResults(prev => [newResult, ...prev])

        // Add to LocalStorage so the Map can see it
        // Generate random coordinates in Greater Noida bounding box
        // lat: 28.45 to 28.49
        // lng: 77.48 to 77.52
        if (data.severity_score > 30) {
           const newSpot = {
             id: newResult.id,
             lat: 28.45 + Math.random() * 0.04,
             lng: 77.48 + Math.random() * 0.04,
             severity: data.severity_score,
             dispatch: data.dispatch_required,
             timestamp: Date.now()
           }
           const existingSpotsStr = localStorage.getItem('live_detected_spots')
           const existingSpots = existingSpotsStr ? JSON.parse(existingSpotsStr) : []
           existingSpots.push(newSpot)
           localStorage.setItem('live_detected_spots', JSON.stringify(existingSpots))
           
           // Dispatch a custom event for same-window updates
           window.dispatchEvent(new Event('storage'))
        }

        // Wait a small delay between requests to avoid rate limits
        await new Promise(r => setTimeout(r, 1500))

      } catch (err: any) {
        console.error(err)
        setError(`Analysis failed on ${file.name}. Continuing to next...`)
      }
    }
    
    setIsProcessing(false)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto text-white h-[90vh] flex flex-col">
      <div className="mb-6 border-b border-slate-700 pb-4 shrink-0">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <span className="text-emerald-400 mr-3">✨</span> 
          UrbanSweep AI Vision Debugger
        </h1>
        <p className="text-slate-400">
          Raw inference view. Batch process images to simulate live CCTV / Drone feeds pushing data to the map.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0 flex-1">
        
        {/* Left Column: Image Input */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex-1 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Input Source (Batch Upload)</h2>
            
            <div 
              className="flex-1 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center relative overflow-hidden bg-slate-900 min-h-[300px] cursor-pointer hover:border-emerald-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center p-6">
                <div className="text-4xl mb-4">📁</div>
                <p className="text-slate-300 font-bold mb-2">
                  {images.length > 0 ? `${images.length} images loaded` : 'Click to select image folder'}
                </p>
                <p className="text-slate-500 text-sm">
                  {images.length > 0 ? 'Ready to process' : 'Upload multiple images to simulate camera feeds'}
                </p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                multiple
                // @ts-ignore
                webkitdirectory="true"
                onChange={handleImageChange}
              />
            </div>

            <button 
              onClick={runBatchInference}
              disabled={isProcessing || images.length === 0}
              className={`mt-6 w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all ${
                isProcessing ? 'bg-emerald-600/50 cursor-not-allowed' : 
                (images.length === 0) ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 
                'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing {currentIndex + 1} of {images.length}...
                </>
              ) : (
                'Run Batch Vision Analysis'
              )}
            </button>
            
            {error && (
              <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: JSON Output / Results Grid */}
        <div className="bg-[#0d1117] p-6 rounded-xl border border-slate-700 flex flex-col h-full min-h-0">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="text-xl font-semibold text-emerald-400 font-mono flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
              Live Inference Stream
            </h2>
            <div className="text-sm text-slate-400">{results.length} processed</div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-black rounded-lg p-4 font-mono text-sm space-y-4">
            {results.length > 0 ? (
              results.map((res) => (
                <div key={res.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex gap-4 animate-in fade-in slide-in-from-top-4">
                  <div className="w-24 h-24 shrink-0 rounded bg-slate-800 overflow-hidden">
                    <img src={res.imagePreview} alt="Processed" className="w-full h-full object-cover opacity-80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="truncate font-bold text-slate-300">{res.filename}</div>
                      <div className={`text-xs px-2 py-1 rounded ${res.dispatch_required ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {res.dispatch_required ? 'DISPATCH NOW' : 'MONITOR'}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-2 mb-2">{res.analysis_summary}</div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-400/50">Location: Pushed to Map</span>
                      <span className="text-red-400 font-bold">Severity: {res.severity_score}%</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <p>Waiting for image stream...</p>
                <div className="mt-4 flex gap-8 text-xs opacity-50 justify-center">
                  <div>Model: AI Vision Engine</div>
                  <div>Format: Real-time batch</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
