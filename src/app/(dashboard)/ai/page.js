'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function AIGeneratorPage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate')
      }

      setResults([data.result, ...results])
      setPrompt('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 flex flex-col h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">AI Generator</h1>
        <p className="text-gray-400">Generate tasks, workflows, or content automatically using AI.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Input Panel */}
        <Card className="flex flex-col flex-shrink-0 lg:w-1/3">
          <form onSubmit={handleGenerate} className="flex flex-col h-full">
            <label htmlFor="prompt" className="text-sm font-medium text-gray-300 mb-2">
              Describe what you want to automate
            </label>
            <textarea
              id="prompt"
              rows={8}
              className="w-full bg-[#0f0f14] border border-[#272737] rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none mb-4 flex-1"
              placeholder="e.g. Create a workflow that checks my email every morning for invoices, extracts the total amount, and creates a task for me to approve..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            
            <div className="mt-auto">
              <Button type="submit" isLoading={loading} className="w-full text-lg shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate with AI
              </Button>
            </div>
          </form>
        </Card>

        {/* Results Panel */}
        <div className="flex-1 bg-[#16161e]/50 rounded-2xl border border-[#272737] p-6 overflow-y-auto w-full">
          <h2 className="text-lg font-semibold mb-4 text-gray-300 sticky top-0 bg-[#0f0f14]/80 backdrop-blur-md pb-2 z-10">
            Generated Output
          </h2>
          
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <div className="w-16 h-16 rounded-full bg-[#272737] flex items-center justify-center mb-4">
                 <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p>Your generated content will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((res, i) => (
                <div key={i} className="glass-card rounded-xl p-6 relative group animate-fade-in border border-purple-500/10">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => navigator.clipboard.writeText(res)} 
                      className="text-gray-400 hover:text-white bg-[#0f0f14] rounded-md p-1.5 border border-[#272737]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{res}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
