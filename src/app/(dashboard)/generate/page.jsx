'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from "@/components/ui/Badge"

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generatedData, setGeneratedData] = useState(null) // Holds {title, tasks}
  
  // Subscription Guard
  const [isFreeLimit, setIsFreeLimit] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkSub() {
      setIsChecking(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // Ambil status berlangganan asli dari database
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', user.id)
        .maybeSingle()

      // Jika pengguna langganan aktif, langsung lepas limit
      if (sub && sub.plan === 'pro' && sub.status === 'active') {
         setIsFreeLimit(false)
         setIsChecking(false)
         return
      }

      // Jika trial atau gratis, berlakukan max 3 workflows
      const { count } = await supabase
        .from('workflows')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (count >= 3) {
        setIsFreeLimit(true)
      }
      setIsChecking(false)
    }
    checkSub()
  }, [])

  async function generateWorkflow(e) {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)
    setGeneratedData(null)

    try {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser()

      // 2. Call backend /api/ai
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed connecting to AI')

      // Output from strictly-typed API
      const result = json // { title, tasks }

      // 3. Insert workflow (user_id, tittle)
      const { data: newWf, error: wfError } = await supabase
        .from('workflows')
        .insert([{ user_id: user.id, tittle: result.title, category: 'AI Generated' }])
        .select()
        .single()

      if (wfError) throw new Error("Database error (Workflows): " + wfError.message)

      // 4. Insert tasks (workflow_id, tittle)
      const taskInserts = result.tasks.map(taskTitle => ({
         workflow_id: newWf.id,
         tittle: taskTitle,
         status: 'todo'
      }))

      if (taskInserts.length > 0) {
         const { error: tErr } = await supabase.from('tasks').insert(taskInserts)
         if (tErr) throw new Error("Database error (Tasks): " + tErr.message)
      }

      // 5. Display UI Result
      setGeneratedData(result)
      setPrompt('') // clear prompt for next use

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Subscription Gate UX
  if (isChecking) {
     return <div className="flex justify-center p-20"><span className="spinner border-purple-500 border-t-transparent w-10 h-10"></span></div>
  }

  if (isFreeLimit) {
     return (
        <div className="max-w-2xl mx-auto mt-10 p-4">
            <Card glow className="text-center p-10 flex flex-col items-center border-[#272737]">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-2xl font-black text-white mb-3">Upgrade to Pro to use AI</h2>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto text-sm">Your free plan allows a maximum of 3 active workflows. Unlock unlimited AI access and advanced workflow generation routing.</p>
                <Link href="/subscription" className="w-full sm:w-auto">
                    <Button variant="primary" className="w-full shadow-[0_0_15px_rgba(168,85,247,0.3)]">View Pro Plans</Button>
                </Link>
            </Card>
        </div>
     )
  }

  return (
    <div className="animate-fade-in pb-20 lg:pb-0 h-full">

      <div className="mb-8 pl-1">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Build Workflow</h1>
        <p className="text-gray-400">Describe what you want to achieve, and the Gemini AI will automatically orchestrate the steps.</p>
      </div>

      {/* Split Layout: Desktop Left/Right, Mobile Top/Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start h-full">

        {/* LEFT COMPONENT: Input Section */}
        <Card className="p-0 border-[#272737] overflow-hidden lg:sticky lg:top-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-[#16161e]">
          <div className="p-4 bg-black/40 border-b border-[#272737] flex items-center">
             <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse mr-3"></span>
             <h2 className="font-bold text-gray-200">Terminal Prompt</h2>
          </div>
          <form onSubmit={generateWorkflow}>
            <textarea
              id="prompt"
              className="w-full bg-transparent p-6 text-xl text-white placeholder-gray-600 focus:outline-none resize-none h-64 lg:h-[400px]"
              placeholder="E.g., I want to create an automated onboarding sequence for new SaaS customers..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              autoFocus
            />
            
            {error && (
              <div className="mx-6 mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                 {error}
              </div>
            )}
            
            <div className="p-4 border-t border-[#272737] bg-black/20">
               <Button type="submit" isLoading={loading} className="w-full lg:py-4 px-6 font-bold shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  Generate Workflow
               </Button>
            </div>
          </form>
        </Card>

        {/* RIGHT COMPONENT: Output Section */}
        <div className="h-full flex flex-col">
           {loading ? (
             <Card className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-dashed border-[#272737] bg-transparent">
                 <div className="relative mb-6">
                    <span className="absolute inset-0 rounded-full blur-[20px] bg-purple-500/30 animate-pulse"></span>
                    <span className="spinner border-purple-500 w-12 h-12 relative z-10" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2 animate-pulse">Synthesizing Logic</h3>
                 <p className="text-gray-500 text-sm">Engine is connecting to Gemini. Extracting operational phases from your goal...</p>
             </Card>
           ) : generatedData ? (
             <Card glow className="p-0 border border-purple-500/30 overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                 <div className="bg-gradient-to-r from-purple-500/20 to-transparent p-6 border-b border-[#272737]">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-3 block w-max">Successfully Saved</Badge>
                    <h2 className="text-2xl font-black text-white">{generatedData.title}</h2>
                 </div>
                 <div className="p-6">
                    <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">Orchestrated Tasks List</h3>
                    <ul className="space-y-3">
                       {generatedData.tasks.map((task, i) => (
                           <li key={i} className="flex items-start bg-[#0f0f14] border border-[#272737] p-4 rounded-xl">
                              <div className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold mr-4 mt-0.5 shrink-0">
                                 {i + 1}
                              </div>
                              <p className="text-gray-200 mt-0.5 font-medium">{task}</p>
                           </li>
                       ))}
                    </ul>
                 </div>
                 <div className="p-4 bg-black/40 border-t border-[#272737] flex justify-end">
                    <Link href="/workflows">
                       <Button variant="secondary" className="text-sm">View in Dashboard &rarr;</Button>
                    </Link>
                 </div>
             </Card>
           ) : (
             <div className="h-full min-h-[300px] lg:min-h-[500px] flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-[#272737] bg-transparent opacity-50">
                <svg className="w-12 h-12 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                <p className="text-gray-500 text-sm">Awaiting neural input. Your structured AI sequence will assemble here.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
