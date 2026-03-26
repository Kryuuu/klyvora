'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { createClient } from "@/lib/supabase/client"
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ScannerPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('file') // 'file' or 'youtube'
  const [file, setFile] = useState(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  
  const supabase = createClient()

  async function handleScan(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      let mediaUrl = ''
      let type = activeTab

      if (activeTab === 'file') {
        if (!file) throw new Error("Please select a file to scan")

        // 1. Opsi Upload ke Supabase Storage (yang tadi bucketnya 'media-scanner')
        const { data: { user } } = await supabase.auth.getUser()
        
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from('media-scanner')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Get public URL or internal path
        mediaUrl = filePath
      } else {
        if (!youtubeUrl) throw new Error("Please enter a valid YouTube URL")
        mediaUrl = youtubeUrl
      }

      // 2. Call our AI Backend Route to extract data
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaUrl, type, workflowId: id })
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to scan media")

      setResult(json.data)
      setFile(null)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/workflows/${id}/edit`}>
          <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Content Scanner</h1>
          <p className="text-gray-400">Extract insights from PDF, Images, or YouTube video to be used in this Workflow.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card glow className="p-6">
          <div className="flex gap-4 mb-6 border-b border-[#272737] pb-2">
            <button 
              className={`pb-2 font-medium transition-colors ${activeTab==='file' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-500 hover:text-white'}`}
              onClick={() => setActiveTab('file')}
            >
              Upload Document / Image
            </button>
            <button 
              className={`pb-2 font-medium transition-colors ${activeTab==='youtube' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-500 hover:text-white'}`}
              onClick={() => setActiveTab('youtube')}
            >
              YouTube Link
            </button>
          </div>

          <form onSubmit={handleScan} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                Scanning Error: {error}
              </div>
            )}

            {activeTab === 'file' ? (
              <div className="border-2 border-dashed border-[#272737] rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors bg-[#0f0f14]">
                <input 
                  type="file" 
                  id="fileUpload" 
                  className="hidden" 
                  accept=".pdf,image/*" 
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <span className="font-bold text-lg mb-1">{file ? file.name : "Select PDF or Image"}</span>
                  <span className="text-gray-500 text-sm">Supports .PDF, .PNG, .JPG</span>
                </label>
              </div>
            ) : (
              <div className="bg-[#0f0f14] p-6 rounded-xl border border-[#272737]">
                <Input 
                  label="Paste YouTube Video URL" 
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-3">We will download the video CC transcript and pass it to KlyVora AI.</p>
              </div>
            )}

            <Button type="submit" isLoading={loading} className="w-full">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Run AI Scan
            </Button>
          </form>
        </Card>

        <Card className="flex flex-col h-full min-h-[400px]">
          <h3 className="font-bold text-lg mb-4 text-purple-300 border-b border-[#272737] pb-3">Extraction Results</h3>
          
          <div className="flex-1 rounded-xl bg-[#0f0f14] border border-[#272737] p-4 overflow-y-auto">
             {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <span className="spinner border-purple-500/30 border-t-purple-500 w-12 h-12" />
                  <p className="text-purple-400 font-medium animate-pulse">Neural engines analyzing media...</p>
                </div>
             ) : result ? (
               <div className="space-y-4">
                 <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-[#272737]">
                    <span>Extracted Metadata</span>
                    <span>100% Match</span>
                 </div>
                 <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">{result}</pre>
               </div>
             ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                  <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Awaiting media input...</p>
                </div>
             )}
          </div>
        </Card>
      </div>
    </div>
  )
}
