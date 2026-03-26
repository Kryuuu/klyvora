'use client'

import { useState, useEffect } from 'react'
import { createClient } from "@/lib/supabaseClient"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
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
      if (!user) { setIsChecking(false); return }
      
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
      if (!user) { router.push('/login'); return }

      // Enforce Profile Sync
      await supabase.from('profiles').upsert({ id: user.id, name: user.email.split('@')[0] }, { onConflict: 'id' })

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed connecting to AI engine')

      const result = json 

      const { data: newWf, error: wfError } = await supabase.from('workflows').insert([{ user_id: user.id, title: result.title, category: 'AI Generated' }]).select().single()

      if (wfError) throw wfError

      const taskInserts = result.tasks.map(taskTitle => ({ workflow_id: newWf.id, title: taskTitle, status: 'todo' }))
      if (taskInserts.length > 0) await supabase.from('tasks').insert(taskInserts)

      setGeneratedData(result)
      setPrompt('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (isChecking) return <div className="p-8 text-zinc-500 font-black uppercase tracking-[0.4em] text-xs animate-pulse italic">Accessing Synthesis Matrix...</div>

  if (isFreeLimit) {
     return (
        <Card className="max-w-2xl mx-auto p-12 text-center border-white/5 bg-[#12121a] mt-12 shadow-2xl animate-slide-up">
            <Badge status="danger" className="inline-block mb-6 px-4 py-1.5 font-black text-[9px] uppercase tracking-widest italic">Matrix Cluster Full</Badge>
            <h2 className="text-3xl font-black text-white mb-4 italic tracking-tighter">Neural Capacity Reached</h2>
            <p className="text-zinc-500 mb-10 text-sm leading-relaxed max-w-sm mx-auto font-medium italic">Your account cluster is currently running at maximum capacity for the free tier. Upgrade for unlimited telemetry.</p>
            <Link href="/subscription" className="w-full sm:w-auto inline-block">
                <Button className="w-full h-14 px-12 font-black uppercase text-[10px] tracking-widest shadow-purple-600/20">Upgrade Access Protocol &rarr;</Button>
            </Link>
        </Card>
     )
  }

  return (
    <div className="space-y-12 animate-slide-up pb-20 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-end border-b border-white/5 pb-10">
        <div className="space-y-2">
           <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">AI Synthesis Engine</h1>
           <p className="text-zinc-500 font-medium italic">Orchestrate operational sequences using Gemini 2.0 pulse logic.</p>
        </div>
        <Badge className="bg-purple-500/10 text-purple-400 border-none px-4 py-1.5 font-black text-[9px] uppercase tracking-widest italic">Neural Connection: Active</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch flex-1 min-h-[500px]">
        <Card className="p-0 border-white/5 overflow-hidden bg-[#12121a] shadow-2xl relative flex flex-col">
          <div className="p-4 bg-black/60 border-b border-white/5 flex items-center justify-between">
             <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">Objective Directive Input</h2>
             <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,1)]" />
          </div>
          <form onSubmit={generateWorkflow} className="flex-1 flex flex-col">
            <textarea
              className="flex-1 w-full bg-transparent p-10 text-xl text-white placeholder-zinc-800 focus:outline-none resize-none font-sans font-medium italic !leading-relaxed"
              placeholder="Inject pulse sequence logic..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              autoFocus
            />
            {error && <div className="mx-10 mb-6 text-danger font-black uppercase tracking-widest text-[9px] bg-danger/5 p-4 rounded-xl border border-danger/20 leading-relaxed italic">{error}</div>}
            <div className="p-6 border-t border-white/5 bg-black/40">
               <Button type="submit" isLoading={loading} className="w-full h-16 font-black uppercase text-xs tracking-[0.2em] shadow-purple-600/30 italic">Synthesize Pulse Protocol</Button>
            </div>
          </form>
        </Card>

        <div className="flex flex-col h-full">
           {loading ? (
             <Card className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-white/5 bg-transparent opacity-60">
                 <div className="relative mb-10">
                    <span className="absolute inset-0 rounded-full blur-[20px] bg-purple-600/30 animate-pulse" />
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-800 border-t-purple-500" />
                 </div>
                 <h3 className="text-xl font-black text-white mb-2 italic tracking-tighter uppercase animate-pulse">Synthesis in Progress</h3>
                 <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] italic">Orchestrating Pulse Cluster Matrix</p>
             </Card>
           ) : generatedData ? (
             <Card className="p-0 border-purple-500/20 overflow-hidden bg-zinc-900/10 shadow-3xl h-full flex flex-col">
                 <div className="bg-gradient-to-r from-purple-500/10 to-transparent p-10 border-b border-white/5">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none mb-6 px-4 py-1.5 font-black text-[9px] uppercase tracking-widest italic">Synthesis Resolved</Badge>
                    <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase underline decoration-purple-500/30 underline-offset-8">{generatedData.title}</h2>
                 </div>
                 <div className="p-10 flex-1 overflow-y-auto">
                    <ul className="space-y-6">
                       {generatedData.tasks.map((task, i) => (
                           <li key={i} className="flex items-start bg-zinc-900/40 border border-white/5 p-6 rounded-[24px] group hover:border-purple-500/30 transition-all duration-300 transform hover:-translate-x-1">
                              <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 text-purple-400 flex items-center justify-center text-[12px] font-black mr-6 mt-0.5 shrink-0 group-hover:bg-purple-500 group-hover:text-white group-hover:rotate-12 transition-all">0{i + 1}</span>
                              <p className="text-zinc-400 text-sm font-medium leading-relaxed italic mt-1.5 tracking-tight group-hover:text-white transition-colors">{task}</p>
                           </li>
                       ))}
                    </ul>
                 </div>
                 <div className="p-6 bg-black/60 border-t border-white/5 flex justify-end">
                    <Link href="/workflows">
                       <Button variant="ghost" className="text-[10px] uppercase font-black tracking-[0.3em] h-12 px-10 transition-all hover:bg-white/5 italic">Verify Access Audit &rarr;</Button>
                    </Link>
                 </div>
             </Card>
           ) : (
             <div className="h-full flex flex-col items-center justify-center p-20 text-center rounded-[40px] border-2 border-dashed border-white/5 bg-transparent opacity-30 shadow-inner">
                <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center mb-10">
                   <svg className="w-10 h-10 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <p className="text-zinc-700 font-bold uppercase tracking-[0.5em] text-xs">Neural Signal Required</p>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
