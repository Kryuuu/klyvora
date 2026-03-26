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
        tasks: 0 // Simplification as requested
      })
      setLoading(false)
    }
    getDashboardData()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-zinc-500 font-bold uppercase tracking-[0.4em] text-xs">
        <span className="animate-pulse">Loading Matrix...</span>
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-page pb-20">
      {/* Welcome Section */}
      <section className="relative p-12 rounded-[32px] overflow-hidden border border-white/5 bg-[#12121a] shadow-inner">
         <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-purple-600/10 to-transparent" />
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="space-y-3">
               <Badge className="bg-purple-500/10 text-purple-400 border-none px-4 py-1.5 font-bold text-[10px] items-center mb-6">User Profile Authenticated</Badge>
               <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  Welcome back, <span className="text-purple-500">{profile?.name || user?.email?.split('@')[0]}</span>
               </h1>
               <p className="text-zinc-500 font-medium max-w-sm leading-relaxed">Cluster is active. Ready to synthesize neural operational sequences.</p>
            </div>
            <Link href="/generate">
               <Button className="h-16 px-10 shadow-lg shadow-purple-600/20 font-bold uppercase tracking-widest text-xs btn-premium">
                  Create Workflow +
               </Button>
            </Link>
         </div>
      </section>

      {/* Stats Cards Grid (rounded-2xl) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { label: 'Total Workflows', value: stats.workflows, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { label: 'Total Tasks', value: stats.tasks, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
            { label: 'Active Clusters', value: stats.workflows, icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
          ].map((stat, i) => (
            <Card key={i} className="group relative overflow-hidden bg-zinc-900/30 border border-white/5 hover:border-purple-500/20 rounded-2xl p-8 transition-base">
               <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-purple-500 transition-base group-hover:scale-110">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                  </div>
                  <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest leading-none">{stat.label}</h3>
               </div>
               <p className="text-4xl font-bold text-white tracking-tighter">{stat.value}</p>
            </Card>
          ))}
      </div>

      {/* Recent Workflows */}
      <div className="space-y-6 pt-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
             <h3 className="text-lg font-bold text-white tracking-tight">Recent Workflows</h3>
             <Link href="/workflows" className="text-xs text-purple-400 hover:text-purple-300 font-bold transition-colors">See All &rarr;</Link>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
             {recentWorkflows.length === 0 ? (
                <div className="p-20 text-center rounded-[32px] border-2 border-dashed border-white/10 bg-white/2 opacity-30">
                   <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs tracking-[0.3em]">No Active Telemetry</p>
                </div>
             ) : (
                recentWorkflows.map(wf => (
                   <Card key={wf.id} className="p-0 border-white/5 bg-zinc-900/20 hover:bg-zinc-900/40 relative group overflow-hidden rounded-2xl transition-base">
                      <div className="p-8 flex justify-between items-center">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-purple-400 border border-white/5 transition-base group-hover:rotate-6">
                               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <div>
                               <h4 className="font-bold text-lg text-white group-hover:text-purple-400 tracking-tight transition-colors">{wf.title}</h4>
                               <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{wf.category || 'Cluster Mainframe'}</p>
                            </div>
                         </div>
                         <Badge status="done" className="bg-emerald-500/10 text-emerald-400 border-none px-4 py-1.5 font-bold text-[9px] h-6 flex items-center">Linked</Badge>
                      </div>
                   </Card>
                ))
             )}
          </div>
      </div>
    </div>
  )
}
