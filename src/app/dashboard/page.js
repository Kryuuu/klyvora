'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
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

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // 1. Fetch Profile (ERD: id, name, Create_at)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      
      setProfile(profileData)

      // 2. Fetch Stats & Recent Workflows (ERD: workflows uses tittle)
      const { data: workflows } = await supabase
        .from('workflows')
        .select('*, tasks(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const { count: taskCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        // Indirect count for simplified view
      
      setRecentWorkflows(workflows?.slice(0, 3) || [])
      setStats({
        workflows: workflows?.length || 0,
        tasks: 0 // Will be calculated if needed
      })
      
      setLoading(false)
    }

    getDashboardData()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0f] font-black uppercase tracking-[0.5em] text-purple-500 animate-pulse italic text-xs">
        Connecting to Neural Hub...
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20 lg:pb-0 font-sans max-w-7xl mx-auto">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <Badge status="default" className="bg-purple-500/10 text-purple-400 border-none mb-4 uppercase tracking-[0.2em] text-[9px] font-black italic">Operator Verified</Badge>
           <h1 className="text-4xl lg:text-6xl font-black text-white italic tracking-tighter uppercase">
             Command <span className="text-purple-500">Center</span>
           </h1>
           <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Welcome back, {profile?.name || user?.email.split('@')[0]}</p>
        </div>
        <Link href="/generate">
           <Button className="h-14 px-8 bg-purple-600 hover:bg-purple-700 text-white font-black uppercase text-xs tracking-widest shadow-[0_10px_30px_rgba(168,85,247,0.3)]">
             New Operation +
           </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card glow className="p-8 border-[#272737] bg-gradient-to-br from-[#16161e] to-[#0f0f14] shadow-2xl overflow-hidden relative group">
             <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12">
                <svg className="w-40 h-40 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <p className="text-xs font-black text-gray-600 uppercase tracking-[0.3em] mb-4 italic">Neural Workflows</p>
             <div className="flex items-end gap-2">
                <span className="text-6xl font-black text-white italic tracking-tighter">{stats.workflows}</span>
                <span className="text-purple-500 text-xs font-black uppercase tracking-widest mb-2 italic">Active sequences</span>
             </div>
          </Card>
          <Card className="p-8 border-[#272737] bg-[#16161e]/50 shadow-xl border-l-4 border-l-purple-500 flex flex-col justify-between">
             <div>
                <p className="text-xs font-black text-gray-600 uppercase tracking-[0.3em] mb-4 italic">Operational Identity</p>
                <p className="text-xs text-gray-400 font-mono italic opacity-70 truncate">{user?.id}</p>
             </div>
             <p className="text-xs text-purple-400 font-black mt-6 tracking-widest uppercase italic">Secure Connection Established</p>
          </Card>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#272737] pb-4">
             <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] italic leading-none">Recent Operational Signal</h3>
             <Link href="/workflows" className="text-[10px] text-purple-500 font-black uppercase tracking-widest hover:text-white transition-colors">Manifest &rarr;</Link>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
             {recentWorkflows.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-dashed border-[#272737] bg-transparent opacity-40">
                   <p className="text-gray-500 font-black uppercase tracking-widest text-[10px] italic">No active telemetry... Start a new build.</p>
                </div>
             ) : (
                recentWorkflows.map(wf => (
                   <Card key={wf.id} className="p-6 border-[#272737] bg-[#16161e] hover:bg-[#1a1a24] transition-all flex justify-between items-center group shadow-lg">
                      <div className="flex items-center gap-6">
                         <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/10 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-glow">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                         </div>
                         <div>
                            <h4 className="text-xl font-black text-white italic group-hover:translate-x-1 transition-all uppercase tracking-tighter">{wf.tittle}</h4>
                            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1 italic">{wf.category || 'Standard Node'}</p>
                         </div>
                      </div>
                      <Badge status="done" className="bg-emerald-500/10 text-emerald-400 border-none uppercase tracking-widest text-[8.5px] font-black italic">Online</Badge>
                   </Card>
                ))
             )}
          </div>
      </div>
    </div>
  )
}
