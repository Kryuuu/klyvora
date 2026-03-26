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
      if (!user) return
      
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', user.id)
        .maybeSingle()

      if (sub && sub.plan === 'pro' && sub.status === 'active') {
         setIsFreeLimit(false)
         setIsChecking(false)
         return
      }

      const { count } = await supabase
        .from('workflows')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

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
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      console.log('[SCHEMA SYNC] JIT Profile check:', user.id)

      // Ensure profile exists (Syncing with ERD: profiles uses id and name)
      // Note: 'Create_at' is managed by Supabase DB default
      await supabase.from('profiles').upsert({
        id: user.id,
        name: user.user_metadata?.full_name || user.email.split('@')[0]
      }, { onConflict: 'id' })

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed connecting to AI')

      const result = json // { title, tasks }

      // SCHEMA SYNC: table 'workflows' uses 'tittle'
      const { data: newWf, error: wfError } = await supabase
        .from('workflows')
        .insert([{ 
           user_id: user.id, 
           tittle: result.title, 
           category: 'AI Generated' 
        }])
        .select()
        .single()

      if (wfError) throw new Error("Workflow DB Sync Failed: " + wfError.message)

      // SCHEMA SYNC: table 'tasks' uses 'tittle'
      const taskInserts = result.tasks.map(taskTitle => ({
         workflow_id: newWf.id,
         tittle: taskTitle,
         status: 'todo'
      }))

      if (taskInserts.length > 0) {
         const { error: tErr } = await supabase.from('tasks').insert(taskInserts)
         if (tErr) throw new Error("Tasks DB Sync Failed: " + tErr.message)
      }

      setGeneratedData(result)
      setPrompt('')

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (isChecking) {
     return <div className="flex justify-center p-20 animate-pulse text-purple-500 font-black uppercase tracking-widest text-[10px]">Verifying Permissions...</div>
  }

  if (isFreeLimit) {
     return (
        <div className="max-w-2xl mx-auto mt-10 p-4">
            <Card glow className="text-center p-10 flex flex-col items-center border-[#272737] bg-[#16161e]">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-2xl font-black text-white mb-3 tracking-tight italic uppercase">Operator Limit <span className="text-purple-500">Reached</span></h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm font-medium">To unlock expanded neural clusters, upgrade to Pro Access.</p>
                <Link href="/subscription" className="w-full sm:w-auto">
                    <Button variant="primary" className="w-full shadow-[0_10px_30px_rgba(168,85,247,0.3)] bg-purple-600 hover:bg-purple-700 font-black uppercase text-xs tracking-widest h-12">Upgrade Cluster Capacity</Button>
                </Link>
            </Card>
        </div>
     )
  }

  return (
    <div className="animate-fade-in pb-20 lg:pb-0 h-full max-w-7xl mx-auto">
      <div className="mb-8 pl-1">
        <h1 className="text-4xl lg:text-5xl font-black tracking-tighter mb-2 text-white italic uppercase">Build <span className="text-purple-500">Pulse</span></h1>
        <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest">SaaS Neural Assembly Engine</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start h-full pb-10">
        <Card className="p-0 border-[#272737] overflow-hidden lg:sticky lg:top-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)] bg-[#16161e]">
          <div className="p-4 bg-black/40 border-b border-[#272737] flex items-center">
             <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse mr-3"></span>
             <h2 className="font-black text-xs uppercase tracking-widest text-gray-500">Operation Directive</h2>
          </div>
          <form onSubmit={generateWorkflow}>
            <textarea
              className="w-full bg-transparent p-8 text-xl text-white placeholder-gray-800 focus:outline-none resize-none h-64 lg:h-[400px] font-sans font-bold"
              placeholder="Inject operation goals here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              autoFocus
            />
            {error && <div className="mx-6 mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest">{error}</div>}
            <div className="p-4 border-t border-[#272737] bg-black/20">
               <Button type="submit" isLoading={loading} className="w-full py-4 px-6 font-black uppercase tracking-[0.2em] text-xs h-16 bg-purple-600 hover:bg-purple-700 shadow-[0_20px_40px_rgba(168,85,247,0.2)]">Synthesize Cluster</Button>
            </div>
          </form>
        </Card>

        <div className="h-full flex flex-col">
           {loading ? (
             <Card className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-dashed border-[#272737] bg-transparent opacity-80">
                 <div className="relative mb-6">
                    <span className="absolute inset-0 rounded-full blur-[20px] bg-purple-500/30 animate-pulse"></span>
                    <span className="spinner border-purple-500 w-12 h-12 relative z-10 animate-spin" />
                 </div>
                 <h3 className="text-xl font-black text-white mb-2 italic uppercase tracking-widest animate-pulse">Orchestrating Matrix...</h3>
             </Card>
           ) : generatedData ? (
             <Card glow className="p-0 border border-purple-500/40 overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-[#16161e]">
                 <div className="bg-gradient-to-r from-purple-500/20 to-transparent p-8 border-b border-[#272737]">
                    <Badge className="bg-purple-500/20 text-purple-400 border-none mb-4 block w-max uppercase tracking-widest text-[9px] font-black italic">Synthesis Resolved</Badge>
                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">{generatedData.title}</h2>
                 </div>
                 <div className="p-8">
                    <h3 className="text-[10px] font-black tracking-[0.3em] text-gray-700 uppercase mb-8">Pulse Objectives</h3>
                    <ul className="space-y-4">
                       {generatedData.tasks.map((task, i) => (
                           <li key={i} className="flex items-start bg-[#0f0f14] border border-[#272737] p-5 rounded-2xl hover:border-purple-500/40 transition-all group">
                              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center text-[11px] font-black mr-4 mt-0.5 shrink-0 transition-all group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white">
                                 0{i + 1}
                              </div>
                              <p className="text-gray-400 mt-1 font-bold leading-relaxed">{task}</p>
                           </li>
                       ))}
                    </ul>
                 </div>
                 <div className="p-6 bg-black/40 border-t border-[#272737] flex justify-end">
                    <Link href="/workflows">
                       <Button variant="secondary" className="text-[10px] uppercase font-black tracking-widest border-[#272737] h-10 px-8">Access Log &rarr;</Button>
                    </Link>
                 </div>
             </Card>
           ) : (
             <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-[#272737] bg-transparent opacity-30">
                <p className="text-gray-700 font-black uppercase tracking-[0.4em] text-xs animate-pulse italic">Neural Signal Required</p>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
