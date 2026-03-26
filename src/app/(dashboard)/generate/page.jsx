'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { createClient } from "@/lib/supabaseClient"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from "@/components/ui/Badge"

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generatedData, setGeneratedData] = useState(null)
  
  const [isFreeLimit, setIsFreeLimit] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkSub() {
      setIsChecking(true)
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      console.log('[Generate Session Check]:', user)
      if (authError) console.error('[Generate Session Error]:', authError)
      
      if (!user) {
        setIsChecking(false)
        return
      }
      
      // 1. [SYNC FIX] Check Status (using plan column)
      const { data: sub, error: subError } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (subError) console.error('[Subscription Check Error]:', subError)

      if (sub && sub.plan === 'pro' && sub.status === 'active') {
         setIsFreeLimit(false)
         setIsChecking(false)
         return
      }

      // 2. [SYNC FIX] Check free limit (max 3 workflows)
      const { count, error: countError } = await supabase
        .from('workflows')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      if (countError) console.error('[Workflow Count Error]:', countError)

      if (count && count >= 3) {
        setIsFreeLimit(true)
      }
      setIsChecking(false)
    }
    checkSub()
  }, [supabase])

  async function generateWorkflow(e) {
    e.preventDefault()
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setGeneratedData(null)

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      console.log('[Generate Run User]:', user)
      if (authError || !user) {
        router.push('/login')
        return
      }

      // 1. [SYNC FIX] Ensure Profile Sync JIT
      const { error: profileError } = await supabase.from('profiles').upsert({ 
        id: user.id, 
        name: user.email.split('@')[0] 
      }, { onConflict: 'id' })
      
      if (profileError) console.error('[Profile Sync Error]:', profileError)

      // 2. [CORE] Call AI API
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const json = await res.json()
      console.log('[AI API Result Debug]:', json)
      
      if (!res.ok) throw new Error(json.error || 'Failed connecting to AI engine')

      const result = json 

      // 3. [SYNC FIX] Insert Workflow (using title column)
      const { data: newWf, error: wfError } = await supabase
        .from('workflows')
        .insert([{ 
           user_id: user.id, 
           title: result.title, 
           category: 'AI Generated' 
        }])
        .select()
        .single()

      if (wfError) {
        console.error('[Workflow Sync Error Debug]:', wfError)
        throw new Error("Workflow DB Sync Failed: " + wfError.message)
      }

      // 4. [SYNC FIX] Insert Tasks (using title column)
      const taskInserts = result.tasks.map(taskTitle => ({
         workflow_id: newWf.id,
         title: taskTitle,
         status: 'todo'
      }))

      if (taskInserts.length > 0) {
         const { error: tErr } = await supabase.from('tasks').insert(taskInserts)
         if (tErr) console.error('[Tasks Sync Error Debug]:', tErr)
      }

      setGeneratedData(result)
      setPrompt('')

    } catch (err) {
      console.error('[Generate Catch Error]:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (isChecking) {
     return <div className="p-8 text-gray-500 font-medium italic animate-pulse">Initializing Synthesis Node...</div>
  }

  if (isFreeLimit) {
     return (
        <Card className="max-w-2xl mx-auto p-12 text-center border-[#1e1e2a] bg-[#16161e] mt-12 animate-fade-in shadow-2xl">
            <Badge status="default" className="inline-block mb-6 bg-purple-500/10 text-purple-400 border-none font-black uppercase text-[10px] items-center">Cluster Full</Badge>
            <h2 className="text-2xl font-bold text-white mb-4">Neural Capacity Reached</h2>
            <p className="text-gray-400 mb-10 max-w-sm mx-auto text-sm leading-relaxed">Your account has reached the free tier limit of 3 telemetry clusters. Upgrade to Pro for infinite throughput.</p>
            <Link href="/subscription" className="w-full sm:w-auto inline-block">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 h-12 px-12 font-bold uppercase text-xs tracking-widest">Upgrade Pro Cluster</Button>
            </Link>
        </Card>
     )
  }

  return (
    <div className="space-y-8 animate-fade-in h-full max-w-7xl mx-auto pb-10">
      <div className="px-1">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">AI Engine</h1>
        <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">Synthesize operational sequences using Gemini 2.0. Describe your objective below to begin the build process.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start h-full">
        <Card className="p-0 border-[#1e1e2a] overflow-hidden bg-[#16161e] shadow-xl relative top-0 block">
          <div className="p-4 bg-black/30 border-b border-[#1e1e2a] flex items-center justify-between">
             <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Operation Input Directive</h2>
             <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
          </div>
          <form onSubmit={generateWorkflow}>
            <textarea
              className="w-full bg-transparent p-8 text-xl text-white placeholder-gray-800 focus:outline-none resize-none h-64 lg:h-[400px] font-sans font-medium"
              placeholder="Inject pulse sequence logic..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              autoFocus
            />
            {error && <div className="mx-8 mb-6 text-red-400 font-bold uppercase tracking-widest text-[10px] bg-red-500/5 p-4 rounded-xl border border-red-500/20">{error}</div>}
            <div className="p-4 border-t border-[#1e1e2a] bg-black/20">
               <Button type="submit" isLoading={loading} className="w-full h-14 bg-purple-600 hover:bg-purple-700 font-black uppercase text-xs tracking-[0.2em] shadow-[0_10px_40px_rgba(168,85,247,0.2)]">Synthesize Matrix</Button>
            </div>
          </form>
        </Card>

        <div className="h-full flex flex-col">
           {loading ? (
             <Card className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-[#1e1e2a] bg-transparent opacity-60">
                 <div className="relative mb-8">
                    <span className="absolute inset-0 rounded-full blur-[20px] bg-purple-500/40 animate-pulse"></span>
                    <span className="spinner border-purple-500 w-12 h-12 relative z-10 animate-spin border-t-transparent" />
                 </div>
                 <h3 className="text-lg font-bold text-white mb-2 italic">Synthesizing...</h3>
                 <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Orchestrating Pulse Cluster</p>
             </Card>
           ) : generatedData ? (
             <Card className="p-0 border border-purple-500/30 overflow-hidden bg-[#16161e] shadow-2xl">
                 <div className="bg-gradient-to-r from-purple-500/10 to-transparent p-8 border-b border-[#1e1e2a]">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none mb-4 block w-max uppercase tracking-widest text-[9px] font-black italic">Synthesis Resolved</Badge>
                    <h2 className="text-3xl font-bold text-white tracking-tighter italic uppercase">{generatedData.title}</h2>
                 </div>
                 <div className="p-8">
                    <h3 className="text-[9px] font-black tracking-[0.4em] text-gray-700 uppercase mb-8">Pulse Signal Data</h3>
                    <ul className="space-y-4">
                       {generatedData.tasks.map((task, i) => (
                           <li key={i} className="flex items-start bg-[#0f0f14] border border-[#1e1e2a] p-5 rounded-2xl group hover:border-purple-500/30 transition-all">
                              <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 text-purple-400 flex items-center justify-center text-[11px] font-black mr-4 mt-0.5 shrink-0 group-hover:bg-purple-500 group-hover:text-white transition-all transform group-hover:rotate-6">0{i + 1}</span>
                              <p className="text-gray-400 text-sm font-medium leading-relaxed mt-1">{task}</p>
                           </li>
                       ))}
                    </ul>
                 </div>
                 <div className="p-4 bg-black/40 border-t border-[#1e1e2a] flex justify-end">
                    <Link href="/workflows">
                       <Button variant="outline" className="text-[10px] uppercase font-black tracking-widest border-[#272737] h-10 px-8 transition-all hover:bg-white/5">Access Log &rarr;</Button>
                    </Link>
                 </div>
             </Card>
           ) : (
             <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-[#1e1e2a] bg-transparent opacity-40">
                <p className="text-gray-700 font-bold uppercase tracking-[0.4em] text-xs underline decoration-purple-500/20 underline-offset-8">Awaiting Pulse Signal</p>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
