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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsChecking(false)
        return
      }
      
      const { data: sub } = await supabase.from('subscriptions').select('plan, status').eq('user_id', user.id).maybeSingle()
      if (sub && sub.plan === 'pro' && sub.status === 'active') {
         setIsFreeLimit(false)
         setIsChecking(false)
         return
      }

      const { count } = await supabase.from('workflows').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      if (count && count >= 3) setIsFreeLimit(true)
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      console.log('[Generate Step 1]: Strict Profile Syncing...')
      
      // 1. [STRICT SYNC] Enforce Profile presence for FK constraint
      // CRITICAL FIX: The entire process MUST stop if this fails.
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, name: user.email.split('@')[0] }, { onConflict: 'id' })
      
      if (profileError) {
        console.error('[STRICT SYNC ERROR]: Synthesis aborted due to profile sync failure.', profileError)
        throw new Error("Profile synchronization failed: " + profileError.message + ". (Possible RLS restriction on 'profiles' table)")
      }

      console.log('[Generate Step 2]: Profile Sync success. Requesting AI...')

      // 2. Call AI API
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed connecting to AI engine')

      const result = json 

      // 3. Insert Workflow (using title column)
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
        throw new Error("Workflow DB Sync Failed: " + wfError.message + " (Check workflows_user_id_fkey constraint)")
      }

      // 4. Insert Tasks (using title column)
      const taskInserts = result.tasks.map(taskTitle => ({
         workflow_id: newWf.id,
         title: taskTitle,
         status: 'todo'
      }))
      if (taskInserts.length > 0) await supabase.from('tasks').insert(taskInserts)

      setGeneratedData(result)
      setPrompt('')

    } catch (err) {
      console.error('[Generate Runtime Error Check]:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (isChecking) return <div className="p-8 text-gray-500 font-medium italic animate-pulse">Initializing Synthesis Matrix...</div>

  if (isFreeLimit) {
     return (
        <Card className="max-w-2xl mx-auto p-12 text-center border-[#1e1e2a] bg-[#16161e] mt-12 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Neural Capacity Reached</h2>
            <p className="text-gray-400 mb-10 text-sm leading-relaxed max-w-sm mx-auto font-medium">Your account cluster is currently running at maximum capacity for the free tier. Upgrade for unlimited telemetry.</p>
            <Link href="/subscription" className="w-full sm:w-auto inline-block">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 h-12 px-12 font-bold uppercase text-[10px] tracking-widest shadow-[0_10px_30px_rgba(168,85,247,0.2)]">Upgrade Access</Button>
            </Link>
        </Card>
     )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-7xl mx-auto">
      <div className="px-1 border-l-4 border-l-purple-500/20 pl-6">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">AI Engine</h1>
        <p className="text-sm text-gray-500 font-medium">Orchestrate operational sequences using Gemini 2.0 pulse logic.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start h-full">
        <Card className="p-0 border-[#1e1e2a] overflow-hidden bg-[#16161e] shadow-xl">
          <div className="p-4 bg-black/30 border-b border-[#1e1e2a] flex items-center justify-between">
             <h2 className="text-[10px] font-black text-gray-700 uppercase tracking-widest leading-none">Objective Directive Input</h2>
             <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
          </div>
          <form onSubmit={generateWorkflow}>
            <textarea
              className="w-full bg-transparent p-8 text-xl text-white placeholder-gray-800 focus:outline-none resize-none h-64 lg:h-[400px] font-sans font-medium"
              placeholder="Inject operation goals here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              autoFocus
            />
            {error && <div className="mx-8 mb-6 text-red-400 font-bold uppercase tracking-widest text-[9px] bg-red-500/5 p-4 rounded-xl border border-red-500/20 leading-relaxed shadow-glow-text">{error}</div>}
            <div className="p-4 border-t border-[#1e1e2a] bg-black/20">
               <Button type="submit" isLoading={loading} className="w-full h-14 bg-purple-600 hover:bg-purple-700 font-bold uppercase text-xs tracking-[0.2em] shadow-[0_10px_40px_rgba(168,85,247,0.2)]">Synthesize Pulse Sequence</Button>
            </div>
          </form>
        </Card>

        <div className="h-full flex flex-col">
           {loading ? (
             <Card className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-[#1e1e2a] bg-transparent opacity-60">
                 <div className="spinner border-purple-500 w-12 h-12 mb-6 animate-spin border-t-transparent" />
                 <h3 className="text-lg font-bold text-white mb-2 italic tracking-tight">Synthesizing Neural Matrix...</h3>
             </Card>
           ) : generatedData ? (
             <Card className="p-0 border border-purple-500/20 overflow-hidden bg-[#16161e] shadow-2xl">
                 <div className="bg-gradient-to-r from-purple-500/10 to-transparent p-8 border-b border-[#1e1e2a] flex items-center justify-between">
                    <div>
                       <Badge className="bg-emerald-500/10 text-emerald-400 border-none mb-4 block w-max uppercase tracking-widest text-[9px] font-black italic">Synthesis Resolved</Badge>
                       <h2 className="text-3xl font-bold text-white tracking-tighter italic uppercase">{generatedData.title}</h2>
                    </div>
                 </div>
                 <div className="p-8">
                    <ul className="space-y-4">
                       {generatedData.tasks.map((task, i) => (
                           <li key={i} className="flex items-start bg-[#0f0f14]/50 border border-[#1e1e2a] p-5 rounded-2xl group hover:border-purple-500/30 transition-all">
                              <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 text-purple-400 flex items-center justify-center text-[10px] font-black mr-4 shrink-0 transition-all group-hover:bg-purple-500 group-hover:text-white">0{i + 1}</span>
                              <p className="text-gray-400 text-sm font-medium leading-relaxed mt-1 italic tracking-tight">{task}</p>
                           </li>
                       ))}
                    </ul>
                 </div>
                 <div className="p-4 bg-black/40 border-t border-[#1e1e2a] flex justify-end">
                    <Link href="/workflows">
                       <Button variant="outline" className="text-[10px] uppercase font-bold tracking-widest border-[#272737] h-10 px-6 hover:bg-white/5 transition-all italic">Audit Log &rarr;</Button>
                    </Link>
                 </div>
             </Card>
           ) : (
             <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-[#1e1e2a] bg-transparent opacity-30 shadow-inner">
                <p className="text-gray-700 font-bold uppercase tracking-[0.4em] text-xs underline decoration-purple-500/10 underline-offset-8">Awaiting Pulse Signal Identification</p>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
