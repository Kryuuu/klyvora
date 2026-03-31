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

  const templates = [
    { title: "SaaS Onboarding", prompt: "Create a complete user onboarding workflow for a SaaS application including email verification, profile setup, and tutorial walkthrough." },
    { title: "E-commerce Ops", prompt: "Generate an automated logistics workflow for an online store covering order processing, inventory sync, shipping label generation, and customer notification." },
    { title: "Content Engine", prompt: "Build a high-performance content marketing sequence from keyword research to blog writing, social media distribution, and performance tracking." },
    { title: "DevOps Pipeline", prompt: "Construct a CI/CD automated pipeline sequence for a cloud-native microservice from code commit to staging deploy and monitoring." }
  ]

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
    if (e) e.preventDefault()
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

      // --- DEBUG TOKEN USAGE ---
      if (result.debug?.tokens) {
         console.log('[AI DEBUG] Execution Token Usage:', result.debug.tokens)
      }

      setGeneratedData(result)
      setPrompt('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const useTemplate = (tPrompt) => {
    setPrompt(tPrompt)
    // Optional: auto trigger generate? User better off seeing it fill first
  }

  if (isChecking) return <div className="h-[80vh] flex items-center justify-center text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse italic">Accessing Synthesis Matrix...</div>

  if (isFreeLimit) {
     return (
        <Card className="max-w-2xl mx-auto p-12 text-center border-[#7c3aed]/30 bg-[#12121a]/80 backdrop-blur-3xl mt-12 shadow-2xl animate-slide-up rounded-[40px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent" />
            <Badge status="danger" className="inline-block mb-6 px-4 py-1.5 font-black text-[9px] uppercase tracking-widest italic bg-red-500/10 text-red-500 border-none">Matrix Cluster Full</Badge>
            <h2 className="text-4xl font-black text-white mb-4 italic tracking-tighter uppercase">Neural Capacity Reached</h2>
            <p className="text-[#a1a1aa] mb-10 text-sm leading-relaxed max-w-sm mx-auto font-medium italic">Your account cluster is currently running at maximum capacity for the free tier. Upgrade for unlimited telemetry.</p>
            <Link href="/subscription" className="w-full sm:w-auto inline-block">
                <Button className="w-full h-14 px-12 font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-purple-600/30 rounded-2xl">Upgrade Access Protocol &rarr;</Button>
            </Link>
        </Card>
     )
  }

  return (
    <div className="space-y-12 animate-fade-in pb-20 relative">
       {/* 🪐 Deep Space Background Elements */}
       <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#7c3aed]/10 to-transparent blur-[120px] rounded-full -z-10 pointer-events-none" />

      {/* Header with Technical Glow */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#3f3f46]/30 pb-10 gap-6">
        <div className="space-y-2">
           <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Synthesis Engine</h1>
           <p className="text-[#a1a1aa] font-bold italic tracking-tight text-sm uppercase opacity-60">Neural orchestration using Gemini 2.0 pulse logic.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest animate-pulse">Neural Signal: Connected</span>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic">Matrix v.04</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Input Directive Panel */}
        <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
           <Card className="p-0 border-[#3f3f46]/40 overflow-hidden bg-[#18181b]/60 backdrop-blur-xl shadow-2xl relative flex flex-col rounded-[32px] group">
              <div className="absolute inset-0 bg-dotted-grid opacity-5 pointer-events-none" />
              <div className="p-6 bg-black/40 border-b border-[#3f3f46]/30 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,1)]" />
                    <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Objective Input</h2>
                 </div>
                 <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest border border-white/5 px-3 py-1 rounded-full">Manual Register</div>
              </div>
              <form onSubmit={generateWorkflow} className="flex-1 flex flex-col">
                <textarea
                  className="flex-1 min-h-[350px] w-full bg-transparent p-10 text-xl text-white placeholder-zinc-800 focus:outline-none resize-none font-sans font-medium italic !leading-relaxed transition-all"
                  placeholder="Inject pulse sequence logic here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                {error && <div className="mx-10 mb-6 text-red-500 font-black uppercase tracking-widest text-[9px] bg-red-500/5 p-4 rounded-2xl border border-red-500/20 leading-relaxed italic animate-shake">{error}</div>}
                <div className="p-8 bg-black/40">
                   <Button type="submit" isLoading={loading} className="w-full h-16 font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl shadow-purple-600/20 italic rounded-[22px] hover:scale-[1.02] transition-transform">
                      Synthesize Pulse Protocol
                   </Button>
                </div>
              </form>
           </Card>

           {/* Templates Grid */}
           <div className="space-y-4">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Available Prototypes</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {templates.map((t, i) => (
                    <button 
                      key={i} 
                      onClick={() => useTemplate(t.prompt)}
                      className="text-left p-5 rounded-[22px] bg-[#18181b]/30 border border-[#3f3f46]/30 hover:border-[#7c3aed]/40 hover:bg-[#18181b]/60 transition-all group flex flex-col gap-2 relative overflow-hidden active:scale-95"
                    >
                       <div className="h-full w-1 absolute left-0 top-0 bg-[#7c3aed] opacity-0 group-hover:opacity-100 transition-opacity" />
                       <h4 className="text-[11px] font-black text-white uppercase italic tracking-tighter group-hover:text-[#7c3aed] transition-colors">{t.title}</h4>
                       <p className="text-[9px] font-medium text-zinc-600 line-clamp-1 leading-relaxed italic tracking-tight">{t.prompt}</p>
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Neural Output Area */}
        <div className="lg:col-span-12 xl:col-span-7 flex flex-col min-h-[600px]">
           {loading ? (
             <div className="h-full flex flex-col items-center justify-center space-y-8 animate-pulse">
                 <div className="relative">
                    <div className="w-32 h-32 rounded-full border border-purple-500/10 flex items-center justify-center">
                       <div className="w-24 h-24 rounded-full border-2 border-dashed border-purple-500/40 animate-spin-slow" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-8 h-8 bg-[#7c3aed] rounded-lg shadow-[0_0_30px_rgba(124,58,237,0.8)] animate-ping" />
                    </div>
                 </div>
                 <div className="text-center">
                    <h3 className="text-2xl font-black text-white mb-2 italic tracking-tighter uppercase leading-none">Synthesis Active</h3>
                    <p className="text-[#7c3aed] text-[10px] font-black uppercase tracking-[0.5em] italic">Constructing Cluster Geometry</p>
                 </div>
             </div>
           ) : generatedData ? (
             <Card className="p-0 border-[#7c3aed]/30 overflow-hidden bg-[#18181b]/80 backdrop-blur-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] h-full flex flex-col rounded-[40px] animate-slide-up">
                 <div className="bg-gradient-to-br from-[#7c3aed]/10 via-transparent to-transparent p-12 border-b border-[#3f3f46]/30 relative">
                    <div className="flex justify-between items-start mb-8">
                       <Badge className="bg-emerald-500 text-black border-none px-4 py-1.5 font-black text-[9px] uppercase tracking-widest italic rounded-lg">Synthesis Resolved</Badge>
                       <div className="flex flex-col items-end">
                          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest opacity-40">Matrix Audit ID: #{Math.floor(Math.random() * 99999)}</span>
                          {generatedData.debug?.tokens && (
                            <span className="text-[10px] font-bold text-blue-400 mt-2 bg-blue-500/10 px-2 py-1 rounded">
                               Debug Tokens: {generatedData.debug.tokens.totalTokenCount} (P: {generatedData.debug.tokens.promptTokenCount} | C: {generatedData.debug.tokens.candidatesTokenCount})
                            </span>
                          )}
                       </div>
                    </div>
                    <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase underline decoration-[#7c3aed] decoration-8 underline-offset-8 decoration-skip-ink-0 leading-none">{generatedData.title}</h2>
                 </div>
                 <div className="p-10 flex-1 overflow-y-auto">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {generatedData.tasks.map((task, i) => (
                           <li key={i} className="flex flex-col bg-[#0f0f14]/80 border border-[#3f3f46]/40 p-6 rounded-[28px] group/item hover:border-[#7c3aed]/50 transition-all duration-500">
                              <div className="flex items-center gap-3 mb-3">
                                 <span className="text-[10px] font-black text-[#7c3aed] opacity-40 group-hover/item:opacity-100 transition-opacity uppercase tracking-widest italic">Node 0{i + 1}</span>
                              </div>
                              <p className="text-white text-base font-bold leading-snug italic tracking-tight group-hover/item:text-purple-400 transition-colors">{task}</p>
                           </li>
                       ))}
                    </ul>
                 </div>
                 <div className="p-8 md:p-10 border-t border-[#3f3f46]/30 flex flex-col sm:flex-row justify-between items-center bg-black/40 gap-6">
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest max-w-[200px] leading-relaxed text-center sm:text-left">Neural sequence has been injected into your Clusters database.</p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <Button 
                          onClick={() => setGeneratedData(null)}
                          variant="ghost" 
                          className="h-12 sm:h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-[#3f3f46] hover:bg-white/5 w-full sm:w-auto"
                        >
                          New Synthesis
                        </Button>
                        <Link href="/workflows" className="w-full sm:w-auto">
                          <Button className="w-full h-12 sm:h-14 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] bg-[#7c3aed] text-white hover:bg-[#8b5cf6] shadow-xl shadow-purple-500/20 italic border-none">
                              Verify Cluster &rarr;
                          </Button>
                        </Link>
                    </div>
                 </div>
             </Card>
           ) : (
             <div className="h-full flex flex-col items-center justify-center p-20 text-center rounded-[48px] border-2 border-dashed border-[#3f3f46]/20 bg-[#18181b]/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-dotted-grid opacity-[0.03]" />
                <div className="w-32 h-32 rounded-[32px] bg-[#18181b] border border-[#3f3f46]/30 flex items-center justify-center mb-8 shadow-inner group transition-all hover:rotate-6 hover:scale-110 duration-500">
                   <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   </div>
                </div>
                <h3 className="text-xl font-black text-white/20 uppercase tracking-[0.5em] italic">Neural Matrix Required</h3>
                <p className="hidden md:block text-[10px] font-bold text-zinc-700 uppercase tracking-[0.3em] mt-8 max-w-xs leading-relaxed italic">Select a prototype from the sidebar or inject custom sequence logic to begin.</p>
                <div className="mt-8 flex gap-2">
                   {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#3f3f46]/30 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />)}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
