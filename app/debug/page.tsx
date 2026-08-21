'use client'

import { useState, useRef } from 'react'

export default function DebugPage() {
  const [ngrokUrl, setNgrokUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Reset previous results
      setResult(null)
      setError(null)
    }
  }

  const runInference = async () => {
    if (!ngrokUrl) {
      setError("Please enter your Ngrok backend URL first.")
      return
    }
    if (!imageFile) {
      setError("Please upload an image to analyze.")
      return
    }

    setLoading(true)
    setError(null)

    // Format URL correctly (remove trailing slash)
    const formattedUrl = ngrokUrl.trim().replace(/\/$/, '')
    
    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const response = await fetch(`${formattedUrl}/analyze-image`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      console.error(err)
      setError(`Connection failed. Ensure Colab is running and ngrok URL is correct. Details: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <div className="mb-8 border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <span className="text-emerald-400 mr-3">⚡</span> 
          UrbanSweep AI Vision Debugger
        </h1>
        <p className="text-slate-400">
          Raw inference view. Connects directly to the Google Colab T4 GPU backend running YOLOv8.
        </p>
      </div>

      {/* Connection Setup */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Colab Ngrok API URL
        </label>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="https://1234-abcd.ngrok-free.app"
            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 font-mono text-sm"
            value={ngrokUrl}
            onChange={(e) => setNgrokUrl(e.target.value)}
          />
          <button 
            className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg font-medium transition-colors"
            onClick={() => {
              // Quick test connection
              if(ngrokUrl) window.open(ngrokUrl, '_blank')
            }}
          >
            Test Link
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Make sure you have clicked "Visit Site" on the ngrok warning page at least once before running API calls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Image Input */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex-1 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Input Source (CCTV / Citizen Photo)</h2>
            
            <div 
              className="flex-1 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center relative overflow-hidden bg-slate-900 min-h-[300px] cursor-pointer hover:border-emerald-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain" />
              ) : (
                <div className="text-center p-6">
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-slate-400">Click to upload a test image</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            <button 
              onClick={runInference}
              disabled={loading || !imageFile}
              className={`mt-6 w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all ${
                loading ? 'bg-emerald-600/50 cursor-not-allowed' : 
                (!imageFile || !ngrokUrl) ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 
                'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing YOLOv8 Inference...
                </>
              ) : (
                'Run YOLOv8 Vision Analysis'
              )}
            </button>
            
            {error && (
              <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: JSON Output */}
        <div className="bg-[#0d1117] p-6 rounded-xl border border-slate-700 flex flex-col h-[600px]">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400 font-mono flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            Raw JSON Telemetry
          </h2>
          
          <div className="flex-1 overflow-auto bg-black rounded-lg p-4 font-mono text-sm">
            {result ? (
              <pre className="text-green-400 whitespace-pre-wrap break-all">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <p>Waiting for inference data...</p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs opacity-50">
                  <div>Model: YOLOv8n</div>
                  <div>Provider: Google Colab T4</div>
                  <div>Format: JSON</div>
                  <div>Latency: -- ms</div>
                </div>
              </div>
            )}
          </div>
          
          {result && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-slate-800 p-3 rounded text-center">
                <div className="text-xs text-slate-400">Total Items</div>
                <div className="text-2xl font-bold">{result.total_items_detected}</div>
              </div>
              <div className="bg-slate-800 p-3 rounded text-center">
                <div className="text-xs text-slate-400">Severity</div>
                <div className="text-2xl font-bold text-red-400">{result.calculated_severity}%</div>
              </div>
              <div className="bg-slate-800 p-3 rounded text-center">
                <div className="text-xs text-slate-400">Status</div>
                <div className="text-sm font-bold mt-1 text-emerald-400">{result.recommendation}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
