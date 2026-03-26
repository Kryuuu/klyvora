'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getDashboardData() {
      // We still map authentication and basic checks, removing stats
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      
      // Kept user profile sync check invisible
      await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      setLoading(false)
    }
    getDashboardData()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-[#a1a1aa] text-sm animate-pulse">
        Initializing Workspace...
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-6">
      
      {/* 🟣 WORKSPACE HERO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#3f3f46]">
        <div className="space-y-1 animate-slide-up">
           <h1 className="text-2xl font-semibold tracking-tight text-[#fafafa]">Build AI Workflows</h1>
           <p className="text-sm text-[#a1a1aa]">Create and automate tasks using AI agents.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <Link href="/generate">
              <Button className="px-5 py-2 text-sm">
                 New Workflow
              </Button>
           </Link>
        </div>
      </div>

      {/* 🟣 QUICK ACTIONS */}
      <div className="flex flex-wrap items-center gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
         <Link href="/generate">
            <Button variant="secondary" className="text-xs px-3 py-1.5 h-auto font-medium shadow-sm">
               <svg className="w-3.5 h-3.5 mr-2 text-[#a1a1aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
               Create workflow
            </Button>
         </Link>
         
         <Link href="/workflows">
            <Button variant="secondary" className="text-xs px-3 py-1.5 h-auto font-medium shadow-sm">
               <svg className="w-3.5 h-3.5 mr-2 text-[#a1a1aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
               View workflows
            </Button>
         </Link>

         <Link href="/generate">
            <Button variant="ghost" className="text-xs px-3 py-1.5 h-auto font-medium flex items-center bg-[#7c3aed]/10 text-[#7c3aed] hover:bg-[#7c3aed]/20">
               <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               Generate with AI
            </Button>
         </Link>
      </div>

      {/* 🟣 WORKFLOW PREVIEW AREA (n8n editor style) */}
      <div className="flex-1 w-full rounded-2xl border border-[#3f3f46] bg-[#0f0f14] bg-dotted-grid bg-[length:16px_16px] relative overflow-hidden flex items-center justify-center isolate group animate-fade-in shadow-inner" style={{ animationDelay: '200ms' }}>
         
         {/* Subtle editor grid overlay glow */}
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f0f14]/80 pointer-events-none" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#7c3aed]/5 blur-[80px] rounded-full pointer-events-none transition-opacity group-hover:bg-[#7c3aed]/10" />

         {/* Placeholder Center */}
         <div className="relative z-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[#18181b] border border-[#3f3f46] flex items-center justify-center mb-6 shadow-xl text-[#3f3f46] group-hover:text-[#a1a1aa] transition-colors">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <p className="text-lg font-medium text-[#fafafa] mb-2 tracking-tight">Start building your workflow</p>
            <p className="text-sm text-[#a1a1aa] max-w-sm">
               Drop nodes here or click the "+" button to initiate a new automated sequence in your workspace.
            </p>
         </div>

         {/* Mock Editor Toolbar (Decorative) */}
         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#18181b] border border-[#3f3f46] p-1.5 rounded-xl shadow-lg">
            <button className="p-2 text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] rounded-lg transition-colors cursor-not-allowed">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </button>
            <div className="w-px h-4 bg-[#3f3f46]" />
            <button className="p-2 text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] rounded-lg transition-colors cursor-not-allowed">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <button className="p-2 text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] rounded-lg transition-colors cursor-not-allowed">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </button>
         </div>

      </div>
    </div>
  )
}
