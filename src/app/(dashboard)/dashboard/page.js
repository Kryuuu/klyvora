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
           <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-[#7c3aed] flex items-center justify-center shadow-[0_0_50px_rgba(124,58,237,0.3)] border border-white/10 relative group">
                 <div className="absolute inset-0 bg-white/10 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                 <svg className="w-10 h-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                 Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400">KlyVora</span>
              </h1>
           </div>
           
           <div className="max-w-xl mx-auto space-y-4">
              <p className="text-lg md:text-xl text-[#a1a1aa] font-medium leading-relaxed">
                 KlyVora is an AI-powered automation workspace designed to transform complex tasks into seamless, intelligent workflows.
              </p>
           </div>
        </div>

        {/* Action Grid (Tool-UI Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full animate-fade-in" style={{ animationDelay: '300ms' }}>
           <Card className="p-6 bg-[#18181b]/40 border-[#3f3f46]/50 backdrop-blur-sm group hover:border-[#7c3aed]/50 transition-all hover:translate-y-[-4px]">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <h3 className="font-bold text-white mb-2">Build Sequence</h3>
              <p className="text-sm text-[#a1a1aa] mb-4">Start creating your first intelligent automation cluster.</p>
              <Link href="/generate">
                 <Button className="w-full text-xs py-2">Create Workflow</Button>
              </Link>
           </Card>

           <Card className="p-6 bg-[#18181b]/40 border-[#3f3f46]/50 backdrop-blur-sm group hover:border-[#7c3aed]/50 transition-all hover:translate-y-[-4px]" style={{ transitionDelay: '50ms' }}>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </div>
              <h3 className="font-bold text-white mb-2">Library</h3>
              <p className="text-sm text-[#a1a1aa] mb-4">Monitor and manage all your active neural workflows.</p>
              <Link href="/workflows">
                 <Button variant="secondary" className="w-full text-xs py-2">View History</Button>
              </Link>
           </Card>

           <Card className="p-6 bg-[#18181b]/40 border-[#3f3f46]/50 backdrop-blur-sm group hover:border-[#7c3aed]/50 transition-all hover:translate-y-[-4px]" style={{ transitionDelay: '100ms' }}>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <h3 className="font-bold text-white mb-2">Objectives</h3>
              <p className="text-sm text-[#a1a1aa] mb-4">Track operational tasks across your sequences.</p>
              <Link href="/tasks">
                 <Button variant="secondary" className="w-full text-xs py-2">Go to Tasks</Button>
              </Link>
           </Card>
        </div>

        {/* Floating Background Grid Indicator */}
        <div className="pt-20 opacity-20 pointer-events-none">
           <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[1em] text-center">Neural Workflow Interface &bull; V3.0</p>
        </div>

      </div>
    </div>
  )
}
