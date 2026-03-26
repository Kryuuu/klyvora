'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function initDashboard() {
      setLoading(true)
      
      // 1. Session Guard
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        console.warn('[Dashboard Guard] Unauthorized, redirecting...')
        router.push('/login')
        return
      }

      console.log('[DEBUG] Session Identity:', user.id)
      setUser(user)

      // 2. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
         setProfile(profileData)
      } else {
         console.warn('[DEBUG] Profile missing from DB for user:', user.id)
      }

      // 3. Fetch Recent Workflows
      const { data: wfData } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      if (wfData) {
         setWorkflows(wfData)
      }

      setLoading(false)
    }

    initDashboard()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-purple-500 font-black tracking-widest uppercase">
        <span className="animate-pulse">Loading Terminal...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 lg:p-12 space-y-12 max-w-7xl mx-auto animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-2 italic">
            Command <span className="text-purple-500">Center</span>
          </h1>
          <p className="text-gray-500 font-medium">Logged in as <span className="text-gray-300 underline">{user?.email}</span></p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Link href="/workflows" className="flex-1 md:flex-none">
            <Button variant="outline" className="w-full border-[#272737] hover:bg-white/5 transition-all text-gray-300">
               Manage All Data
            </Button>
          </Link>
          <Button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all border border-red-500/20">
             Sign Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <Card className="p-6 border-[#272737] bg-[#16161e] border-l-4 border-l-purple-500 shadow-xl overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl"></div>
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-6">User Profile</h3>
          <div className="space-y-4">
             <div>
                <span className="text-gray-600 text-[10px] uppercase font-bold tracking-widest block mb-1">Display Name</span>
                <p className="text-white text-xl font-bold">{profile?.name || 'Inert Admin'}</p>
             </div>
             <div>
                <span className="text-gray-600 text-[10px] uppercase font-bold tracking-widest block mb-1">Profile UUID</span>
                <p className="text-gray-400 font-mono text-xs">{user?.id}</p>
             </div>
          </div>
        </Card>

        {/* Quick Launch Card */}
        <Card className="p-6 border-purple-500/20 bg-purple-500/5 glow shadow-2xl overflow-hidden relative" glow>
           <div className="absolute top-0 right-0 p-3 opacity-20">
              <svg className="w-16 h-16 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14H11V21L20 10H13Z" /></svg>
           </div>
           <h3 className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] mb-6">Action Hub</h3>
           <h2 className="text-2xl font-black text-white mb-3">Initiate AI Matrix</h2>
           <p className="text-sm text-gray-500 mb-8 max-w-[200px]">Launch the orchestrator to build new sequences natively.</p>
           <Link href="/workflows">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 shadow-[0_10px_30px_rgba(168,85,247,0.4)] transition-all transform hover:scale-[1.02]">
                 Generate Workflow
              </Button>
           </Link>
        </Card>

        {/* Stats Card */}
        <Card className="p-6 border-[#272737] bg-[#16161e] shadow-xl">
           <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-6">System Health</h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-black/40 rounded-xl border border-[#272737]">
                 <span className="block text-2xl font-black text-white">{workflows.length}</span>
                 <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">Active Runs</span>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-[#272737]">
                 <span className="block text-2xl font-black text-emerald-500">STABLE</span>
                 <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">Matrix Status</span>
              </div>
           </div>
        </Card>
      </div>

      {/* Recent Workflows Feed */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-black text-white tracking-tight italic">Recent <span className="text-purple-500">Orchestrations</span></h2>
          <Link href="/workflows" className="text-purple-400 text-sm font-bold hover:underline underline-offset-4">View Operational Log &rarr;</Link>
        </div>

        {workflows.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-[#272737] rounded-3xl opacity-50">
             <p className="text-gray-500 font-medium">No sequences detected in the operational log. Start your first automation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workflows.map((wf) => (
              <Card key={wf.id} className="p-6 border-[#272737] bg-[#16161e]/50 hover:bg-[#16161e] transition-all group">
                <Badge className="bg-purple-500/10 text-purple-400 border-none mb-4 uppercase tracking-[0.1em] text-[9px]">{wf.category || 'Standard'}</Badge>
                <h4 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">{wf.tittle}</h4>
                <p className="text-xs text-gray-600 mt-2 mb-6">Generated on {new Date(wf.created_at).toLocaleDateString()}</p>
                <Link href={`/tasks`}>
                   <Button variant="link" className="p-0 h-auto text-purple-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">Inspect Clusters &rarr;</Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
