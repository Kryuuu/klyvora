'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

export default function DashboardPage() {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ workflows: 0, tasks: 0 })
  const [recentWorkflows, setRecentWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    async function getDashboardData() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch Profile (ERD: id, name, Create_at)
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      setProfile(profile)

      // Fetch Workflows (ERD: tittle)
      const { data: workflows } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setRecentWorkflows(workflows?.slice(0, 3) || [])
      setStats({
        workflows: workflows?.length || 0,
        tasks: 0 // Simplification
      })
      setLoading(false)
    }
    getDashboardData()
  }, [supabase])

  if (loading) {
     return <div className="p-8 text-gray-500 font-medium">Loading Dashboard...</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back, {profile?.name || 'Operator'}!</h1>
        <p className="text-gray-400 text-sm">Monitor your automation neural networks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 border-[#1e1e2a] bg-[#16161e]">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Total Workflows</h3>
          <p className="text-4xl font-bold text-white">{stats.workflows}</p>
        </Card>
        <Card className="p-6 border-[#1e1e2a] bg-[#16161e]">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Account ID</h3>
          <p className="text-xs text-gray-400 font-mono truncate">{profile?.id}</p>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Recent Workflows</h2>
          <Link href="/workflows" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">View All &rarr;</Link>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {recentWorkflows.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-dashed border-[#1e1e2a] text-gray-600">
               No workflows found. Use Generate AI to start.
            </div>
          ) : (
            recentWorkflows.map(wf => (
              <Card key={wf.id} className="p-5 border-[#1e1e2a] bg-[#16161e] flex justify-between items-center group">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                       <h4 className="font-bold text-white">{wf.tittle}</h4>
                       <p className="text-xs text-gray-500">{wf.category || 'Standard'}</p>
                    </div>
                 </div>
                 <Badge status="done" className="bg-emerald-500/10 text-emerald-400 border-none px-2 py-0.5 text-[10px]">Active</Badge>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
