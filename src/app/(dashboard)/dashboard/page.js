'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function DashboardPage() {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ workflows: 0, tasks: 0 })
  const [recentWorkflows, setRecentWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getDashboardData() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      setProfile(profile)

      const { data: workflows } = await supabase.from('workflows').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setRecentWorkflows(workflows?.slice(0, 3) || [])
      setStats({
        workflows: workflows?.length || 0,
        tasks: 0 // Placeholder
      })
      setLoading(false)
    }
    getDashboardData()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center text-zinc-500 font-black uppercase tracking-[0.4em] text-xs">
        <span className="animate-pulse">Accessing Neural Cache...</span>
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-slide-up pb-20">
      {/* Welcome Banner */}
      <section className="relative p-10 rounded-[32px] overflow-hidden border border-white/5 bg-[#0a0a0f] shadow-2xl">
         <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-purple-600/10 to-transparent" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3">
               <Badge className="bg-purple-500/10 text-purple-400 border-none px-4 py-1.5 rounded-xl italic">Operator Online</Badge>
               <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">
                  Welcome back, <span className="text-purple-500">{profile?.name || 'User'}</span>
               </h1>
               <p className="text-zinc-500 font-medium max-w-sm leading-relaxed">System status: All clusters operational. Ready for neural synthesis.</p>
            </div>
            <Link href="/generate">
               <Button className="h-16 px-10 shadow-purple-600/30 font-black italic uppercase tracking-widest text-xs">
                  Begin Synthesis +
               </Button>
            </Link>
         </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { label: 'Active Clusters', value: stats.workflows, icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'text-purple-500' },
            { label: 'Neural Protocols', value: 'v2.4 stable', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z', color: 'text-zinc-500' },
            { label: 'Matrix Node ID', value: profile?.id?.slice(0, 8), icon: 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-2.105-3.14c-1.121-1.121-1.815-2.668-1.815-4.379c0-3.517 1.009-6.799 2.753-9.571m11.137 15.903l-3.325-3.325c-.201-.201-.325-.478-.325-.783V11a2 2 0 114 0v3.4c0 .305-.124.582-.325.783L18.137 18.529', color: 'text-emerald-500' }
          ].map((stat, i) => (
            <Card key={i} className="group relative overflow-hidden bg-zinc-900/30 border border-white/5 hover:border-white/10 p-8">
               <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-4 translate-y-[-4px] group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500">
                  <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={stat.icon} /></svg>
               </div>
               <div className="flex items-center space-x-4 mb-6">
                  <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${stat.color}`}>
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                  </div>
                  <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{stat.label}</h3>
               </div>
               <p className="text-3xl font-black text-white tracking-tighter italic">{stat.value}</p>
            </Card>
          ))}
      </div>

      {/* List Section */}
      <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
             <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,1)]" />
                <h3 className="text-lg font-black text-white italic tracking-tight uppercase">Recent Telemetry</h3>
             </div>
             <Link href="/workflows">
                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-purple-400">View Global Access &rarr;</Button>
             </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
             {recentWorkflows.length === 0 ? (
                <div className="p-20 text-center rounded-[32px] border border-dashed border-white/10 bg-white/2 opacity-30">
                   <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-xs">No Matrix Clusters Logged</p>
                </div>
             ) : (
                recentWorkflows.map(wf => (
                   <Card key={wf.id} className="p-0 border-white/5 bg-zinc-900/20 hover:bg-zinc-900/40 relative group overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="p-6 flex justify-between items-center">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-purple-500 border border-white/5">
                               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <div>
                               <h4 className="font-black text-white italic tracking-tight uppercase text-lg group-hover:text-purple-400 transition-colors">{wf.title}</h4>
                               <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Classification: {wf.category || 'Pulse Cluster'}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-6">
                            <Badge status="done" className="bg-emerald-500/10 text-emerald-400 border-none px-3 font-black text-[9px] h-6 flex items-center">Linked</Badge>
                            <Link href="/tasks">
                               <Button variant="ghost" className="w-10 h-10 p-0 rounded-xl hover:bg-white/10">
                                  <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                               </Button>
                            </Link>
                         </div>
                      </div>
                   </Card>
                ))
             )}
          </div>
      </div>
    </div>
  )
}
