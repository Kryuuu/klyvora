'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

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
      <div className="flex justify-center py-20 text-[#a1a1aa] text-sm animate-pulse">
        Loading...
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* SECTION 1: Brand Header */}
      <div className="text-center md:text-left space-y-4 max-w-2xl">
         <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#7c3aed] text-white shadow-lg mb-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
         </div>
         <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#fafafa]">KlyVora AI Workflow</h1>
         <p className="text-lg text-[#a1a1aa] leading-relaxed">Turn your ideas into structured workflows using AI.</p>
      </div>

      {/* SECTION 2 & 3: Main Action and Intro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
         <Card className="flex flex-col h-full bg-[#18181b] justify-center items-center md:items-start text-center md:text-left p-8 space-y-6 border-[#3f3f46]">
            <div>
               <h3 className="text-xl font-bold text-[#fafafa] mb-2">Start Building</h3>
               <p className="text-[#a1a1aa] text-sm">Create a new automated sequence in seconds.</p>
            </div>
            <Link href="/generate" className="w-full sm:w-auto">
               <Button className="w-full text-base font-semibold px-8 py-3.5">
                  Generate Workflow
               </Button>
            </Link>
         </Card>

         <Card className="flex flex-col h-full p-8 border-[#3f3f46]">
            <h3 className="text-lg font-bold text-[#fafafa] mb-3">About KlyVora</h3>
            <p className="text-[#a1a1aa] text-sm leading-relaxed">
               KlyVora helps you automate tasks using AI-powered workflows. Create, manage, and scale your workflow easily without complex coding requirements. The system connects your logic seamlessly.
            </p>
         </Card>
      </div>

      {/* SECTION 4: Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="flex flex-col items-center justify-center p-8 border-[#3f3f46]">
             <span className="text-sm font-medium text-[#a1a1aa] mb-2">Total Workflows</span>
             <span className="text-5xl font-bold text-[#fafafa]">{stats.workflows}</span>
          </Card>
          
          <Card className="flex flex-col items-center justify-center p-8 border-[#3f3f46]">
             <span className="text-sm font-medium text-[#a1a1aa] mb-2">Total Tasks</span>
             <span className="text-5xl font-bold text-[#fafafa]">{stats.tasks}</span>
          </Card>
      </div>
    </div>
  )
}
