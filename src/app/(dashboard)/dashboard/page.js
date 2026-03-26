'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
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
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      console.log('[Dashboard User Debug]:', user)
      if (authError) {
         console.error('[Dashboard User Error Check]:', authError)
         router.push('/login')
         return
      }

      if (!user) {
        router.push('/login')
        return
      }

      // 1. [SYNC FIX] Profiles table (id, name, created_at)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      
      console.log('[Dashboard Profile Debug]:', profile)
      if (profileError) console.error('[Dashboard Profile Error Check]:', profileError)
      
      setProfile(profile)

      // 2. [SYNC FIX] Workflows table (title, user_id, created_at)
      const { data: workflows, error: wfError } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      console.log('[Dashboard Workflows Debug]:', workflows)
      if (wfError) console.error('[Dashboard Workflows Error Check]:', wfError)
      
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
      <div className="flex h-screen items-center justify-center bg-[#0a0a0f] text-gray-500 font-medium">
        Loading Command Center...
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end gap-6">
        <div>
           <Badge status="default" className="bg-purple-500/10 text-purple-400 border-none mb-4 uppercase tracking-[0.2em] text-[10px] items-center">Verified Operator</Badge>
           <h1 className="text-3xl font-bold text-white tracking-tight">Command Center</h1>
           <p className="text-sm text-gray-400 mt-2">Welcome, {profile?.name || user?.email}</p>
        </div>
        <Link href="/generate">
           <Button className="bg-purple-600 hover:bg-purple-700 h-11 px-8 font-bold text-sm">Create Workflow +</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 border-[#1e1e2a] bg-[#16161e]">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Total Workflows</h3>
             <p className="text-4xl font-bold text-white">{stats.workflows}</p>
          </Card>
          <Card className="p-6 border-[#1e1e2a] bg-[#16161e]">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Operational Node</h3>
             <p className="text-xs text-gray-500 font-mono truncate">{profile?.id}</p>
          </Card>
      </div>

      <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[#1e1e2a] pb-4">
             <h3 className="text-sm font-bold text-white">Recent Workflows</h3>
             <Link href="/workflows" className="text-xs text-purple-400 hover:text-purple-300 font-bold transition-colors">See All &rarr;</Link>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
             {recentWorkflows.length === 0 ? (
                <div className="p-12 text-center rounded-xl border border-dashed border-[#1e1e2a] text-gray-600 italic">
                   No active telemetry clusters found.
                </div>
             ) : (
                recentWorkflows.map(wf => (
                   <Card key={wf.id} className="p-5 border-[#1e1e2a] bg-[#16161e] flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-purple-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                         </div>
                         <div>
                            <h4 className="font-bold text-white">{wf.title}</h4>
                            <p className="text-xs text-gray-500">{wf.category || 'Cluster Alpha'}</p>
                         </div>
                      </div>
                      <Badge status="done" className="bg-emerald-500/10 text-emerald-400 border-none uppercase tracking-widest text-[9px] font-bold">Online</Badge>
                   </Card>
                ))
             )}
          </div>
      </div>
    </div>
  )
}
