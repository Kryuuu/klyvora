'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AIWorkflowGenerator() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Subscription / Limits Logic
  const [isLimitReached, setIsLimitReached] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkLimits()
  }, [])

  async function checkLimits() {
    setIsChecking(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Prototype Logic: Check if they are Free User relying purely on total workflows
    const { count } = await supabase
        .from('workflows')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    // For this prototype, if count >= 3, they hit Free Limit. (Assume no pro table yet)
    if (count >= 3) {
      setIsLimitReached(true)
    }
    setIsChecking(false)
  }

  async function handleGenerate(e) {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to generate workflow')
      }

      const { workflow } = json.data
      
      // 1. Save Workflow
      const { data: newWf, error: wfError } = await supabase
        .from('workflows')
        .insert([{ user_id: user.id, tittle: workflow.title, category: workflow.category }])
        .select()
        .single()

      if (wfError) throw new Error("Failed saving database: " + wfError.message)

      // 2. Save Generated Tasks connected to this workflow
      const taskInserts = workflow.tasks.map(taskTitle => ({
         workflow_id: newWf.id,
         tittle: taskTitle,
         status: 'todo'
      }))

      if (taskInserts.length > 0) {
         const { error: tErr } = await supabase.from('tasks').insert(taskInserts)
         if (tErr) console.error("Task Insert Error:", tErr.message)
      }

      // Success
      router.push(`/workflows/${newWf.id}`)
      router.refresh()

    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (isChecking) {
      return <div className="flex justify-center p-20"><span className="spinner border-purple-500 border-t-transparent w-10 h-10"></span></div>
  }

  if (isLimitReached) {
    return (
        <div className="max-w-2xl mx-auto mt-10">
            <Card glow className="text-center p-12 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-3xl font-black text-white mb-4">Free Plan Limit Reached</h2>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">You have used up your free quota of 3 automated AI workflows. Upgrade to Pro for unlimited generation and advanced features.</p>
                <Link href="/subscription" className="w-full sm:w-auto">
                    <Button variant="primary" className="w-full text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)]">Upgrade to Pro</Button>
                </Link>
                <Link href="/dashboard" className="mt-6 text-sm text-gray-500 hover:text-white transition-colors">Return to Dashboard</Link>
            </Card>
        </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-20 lg:pb-0">
      <div className="text-center mb-10 pt-4">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">AI Engine</h1>
        <p className="text-gray-400">Transform your words into fully functioning automated workflows.</p>
      </div>

      <Card glow className="p-2 sm:p-4 border-2 border-[#272737] focus-within:border-purple-500/50 transition-colors">
        <form onSubmit={handleGenerate} className="flex flex-col relative">
          
          <textarea
            className="w-full bg-transparent p-4 sm:p-6 text-xl lg:text-2xl text-white placeholder-gray-600 focus:outline-none resize-none min-h-[200px]"
            placeholder="e.g. 'I want to extract data from daily invoices in my email and sync them to a database sheet every morning...'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            autoFocus
          />
          
          {error && <p className="text-red-400 text-sm px-6 mb-4">{error}</p>}
          
          <div className="flex justify-between items-center p-4 border-t border-[#272737] mt-2">
             <div className="flex items-center text-xs text-gray-500 font-medium tracking-widest uppercase">
                 <span className="w-2 h-2 rounded-full bg-purple-500 mr-2 animate-pulse" />
                 KlyVora AI active
             </div>
             <Button type="submit" isLoading={loading} className="px-6 py-2">
               Generate
             </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 opacity-70">
         <div className="p-4 border border-[#272737] rounded-xl flex items-start gap-3 bg-[#16161e]">
             <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             <p className="text-sm text-gray-400">"Create a social media content planner that drafts 3 tweets a day about AI."</p>
         </div>
         <div className="p-4 border border-[#272737] rounded-xl flex items-start gap-3 bg-[#16161e]">
             <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             <p className="text-sm text-gray-400">"Sync my customer support tickets to Slack and alert me if wait time is high."</p>
         </div>
      </div>
    </div>
  )
}
