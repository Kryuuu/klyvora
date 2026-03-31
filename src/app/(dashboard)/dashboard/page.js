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
      <div className="flex h-[80vh] items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col space-y-8 animate-fade-in">
      
      {/* Header Section */}
      <div className="flex justify-between items-end border-b border-slate-800 pb-6">
        <div>
           <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Home</h1>
           <p className="text-slate-400 mt-2">Manage your workflows and daily tasks.</p>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
         <Card className="flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <h3 className="font-semibold text-slate-100 text-lg mb-1">Create Workflow</h3>
              <p className="text-sm text-slate-400 mb-6">Start building a new automated sequence from scratch.</p>
            </div>
            <Link href="/generate">
               <Button className="w-full">Get Started</Button>
            </Link>
         </Card>

         <Card className="flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </div>
              <h3 className="font-semibold text-slate-100 text-lg mb-1">Execution History</h3>
              <p className="text-sm text-slate-400 mb-6">Review the status and logs of your past workflow runs.</p>
            </div>
            <Link href="/workflows">
               <Button variant="secondary" className="w-full">View History</Button>
            </Link>
         </Card>

         <Card className="flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <h3 className="font-semibold text-slate-100 text-lg mb-1">Task Management</h3>
              <p className="text-sm text-slate-400 mb-6">Check pending tasks that require your immediate input.</p>
            </div>
            <Link href="/tasks">
               <Button variant="secondary" className="w-full">Go to Tasks</Button>
            </Link>
         </Card>
      </div>
    </div>
  )
}
