'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { AnimatedHero } from '@/components/AnimatedHero'

export default function DashboardPage() {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ workflows: 0, tasks: 0 })
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

      const { count: workflowCount } = await supabase.from('workflows').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      const { count: taskCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true })

      setStats({
        workflows: workflowCount || 0,
        tasks: taskCount || 0
      })
      setLoading(false)
    }
    getDashboardData()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-zinc-500 font-bold uppercase tracking-[0.4em] text-xs">
        <span className="animate-pulse">Loading Hub...</span>
      </div>
    )
  }

  return (
    <div className="space-y-16 animate-page pb-20">
      {/* Welcome Section with Premium Animations */}
      <AnimatedHero />

      {/* Stats Cards Grid (Minimalism) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { label: 'Total Workflows', value: stats.workflows, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { label: 'Total Tasks', value: stats.tasks, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' }
          ].map((stat, i) => (
            <Card key={i} className="bg-zinc-900/10 border border-white/5 p-10 transition-smooth group hover:bg-zinc-900/30 rounded-2xl">
               <div className="flex items-center space-x-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-purple-500 transition-smooth group-hover:scale-110">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                  </div>
                  <div>
                     <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{stat.label}</h3>
                     <p className="text-4xl font-bold text-white tracking-tighter">{stat.value}</p>
                  </div>
               </div>
            </Card>
          ))}
      </div>

      {/* Recent Activity Hint */}
      <div className="pt-12 border-t border-white/5 opacity-50">
         <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.4em] text-center">Neural Link Established &bull; All systems nominal</p>
      </div>
    </div>
  )
}
