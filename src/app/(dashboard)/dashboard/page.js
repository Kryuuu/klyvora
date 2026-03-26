'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setLoading(false)
    }
    checkAuth()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-[#a1a1aa] text-xs font-bold uppercase tracking-widest animate-pulse">
        KlyVora is initializing...
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center overflow-hidden">
      
      {/* 🌌 AI Atmospheric Background */}
      <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-purple-600/10 blur-[120px] rounded-full -z-10 animate-glow-flow" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-600/5 blur-[100px] rounded-full -z-10 animate-glow-flow" style={{ animationDelay: '-5s' }} />

      {/* 🪐 Workspace Tool UI: Intro Experience */}
      <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-12 z-10">
        
        {/* Intro Section with Visual Logo */}
        <div className="space-y-6 animate-slide-up">
           <div className="flex flex-col items-center space-y-8">
              <div className="w-40 h-40 flex items-center justify-center relative group p-4">
                 <div className="absolute inset-0 bg-[#7c3aed]/5 blur-3xl rounded-full scale-0 group-hover:scale-125 transition-transform duration-1000 pointer-events-none" />
                 <img src="/logo-klyvora.png" alt="KlyVora Logo" className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-700" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
                 Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400">KlyVora</span>
              </h1>
           </div>
           
           <div className="max-w-xl mx-auto space-y-4">
              <p className="text-lg md:text-xl text-[#a1a1aa] font-medium leading-relaxed italic opacity-80">
                 KlyVora is an AI-powered automation workspace designed to transform complex tasks into seamless, intelligent workflows.
              </p>
           </div>
        </div>

        {/* Action Grid (Tool-UI Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-fade-in px-4" style={{ animationDelay: '300ms' }}>
           <Card className="p-8 bg-[#121217]/60 group border-white/5 shadow-2xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <h3 className="font-black text-white mb-3 uppercase italic tracking-tighter text-xl">Build</h3>
              <p className="text-sm text-[#a1a1aa] mb-8 font-medium italic min-h-[40px]">Initialize a new intelligent neural sequence.</p>
              <Link href="/generate">
                 <Button className="w-full h-12 text-[10px] font-black uppercase tracking-widest rounded-xl">Create Workflow</Button>
              </Link>
           </Card>

           <Card className="p-8 bg-[#121217]/60 group border-white/5 shadow-2xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </div>
              <h3 className="font-black text-white mb-3 uppercase italic tracking-tighter text-xl">Clusters</h3>
              <p className="text-sm text-[#a1a1aa] mb-8 font-medium italic min-h-[40px]">Orchestrate active operational nodes.</p>
              <Link href="/workflows">
                 <Button variant="secondary" className="w-full h-12 text-[10px] font-black uppercase tracking-widest rounded-xl">View History</Button>
              </Link>
           </Card>

           <Card className="p-8 bg-[#121217]/60 group border-white/5 shadow-2xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <h3 className="font-black text-white mb-3 uppercase italic tracking-tighter text-xl">Target</h3>
              <p className="text-sm text-[#a1a1aa] mb-8 font-medium italic min-h-[40px]">Track specific mission objectives.</p>
              <Link href="/tasks">
                 <Button variant="secondary" className="w-full h-12 text-[10px] font-black uppercase tracking-widest rounded-xl">Go to Tasks</Button>
              </Link>
           </Card>
        </div>

        {/* Floating Background Grid Indicator */}
        <div className="pt-20 opacity-20 pointer-events-none">
           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[1em] text-center italic">Neural Workflow Collective &bull; V.04</p>
        </div>

      </div>
    </div>
  )
}
