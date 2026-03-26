'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { createClient } from "@/lib/supabaseClient"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from "@/components/ui/Badge"

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generatedData, setGeneratedData] = useState(null)
  
  const [isFreeLimit, setIsFreeLimit] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkSub() {
      setIsChecking(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data: sub } = await supabase.from('subscriptions').select('plan, status').eq('user_id', user.id).maybeSingle()
      if (sub && sub.plan === 'pro' && sub.status === 'active') {
         setIsFreeLimit(false)
         setIsChecking(false)
         return
      }

      const { count } = await supabase.from('workflows').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      if (count && count >= 3) setIsFreeLimit(true)
      setIsChecking(false)
    }
    checkSub()
  }, [supabase])

  async function generateWorkflow(e) {
    e.preventDefault()
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setGeneratedData(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Sync Profile
      await supabase.from('profiles').upsert({ id: user.id, name: user.email.split('@')[0] }, { onConflict: 'id' })

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed connecting to AI')

      const result = json 

      // DB Sync: workflows uses tittle
      const { data: newWf, error: wfError } = await supabase
        .from('workflows')
        .insert([{ user_id: user.id, tittle: result.title, category: 'AI Generated' }])
        .select()
        .single()

      if (wfError) throw wfError

      // DB Sync: tasks uses tittle
      const taskInserts = result.tasks.map(taskTitle => ({
         workflow_id: newWf.id,
         tittle: taskTitle,
         status: 'todo'
      }))
      if (taskInserts.length > 0) await supabase.from('tasks').insert(taskInserts)

      setGeneratedData(result)
      setPrompt('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (isChecking) return <div className="p-8 text-gray-500 font-medium">Verifying limit...</div>

  if (isFreeLimit) {
     return (
        <Card className="max-w-xl mx-auto p-10 text-center border-[#1e1e2a] bg-[#16161e] mt-12">
            <h2 className="text-xl font-bold text-white mb-4">Daily Limit Reached</h2>
            <p className="text-gray-400 mb-8">Operator level clusters are limited to 3 active sequences. Upgrade to Pro for unlimited telemetry.</p>
            <Link href="/subscription">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 h-11 font-bold">Upgrade Pro Access</Button>
            </Link>
        </Card>
     )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="px-1">
        <h1 className="text-2xl font-bold text-white mb-1">Assemble AI Workflow</h1>
        <p className="text-sm text-gray-400">Synthesize operational phases using neural logic.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="p-0 border-[#1e1e2a] overflow-hidden bg-[#16161e] shadow-xl">
          <div className="p-4 bg-black/20 border-b border-[#1e1e2a]">
             <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Neural Signal Input</h2>
          </div>
          <form onSubmit={generateWorkflow}>
            <textarea
              className="w-full bg-transparent p-6 text-lg text-white placeholder-gray-700 focus:outline-none resize-none h-64 lg:h-[400px] font-sans"
              placeholder="Inject operation goals here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              autoFocus
            />
            {error && <div className="mx-6 mb-4 text-red-500/80 text-xs font-bold">{error}</div>}
            <div className="p-4 border-t border-[#1e1e2a] bg-black/10">
               <Button type="submit" isLoading={loading} className="w-full bg-purple-600 hover:bg-purple-700 h-12 font-bold uppercase tracking-widest text-xs">Synthesize Cluster</Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
           {loading ? (
             <div className="p-12 text-center text-purple-500 font-medium animate-pulse">Orchestrating...</div>
           ) : generatedData ? (
             <Card className="p-0 border-[#1e1e2a] bg-[#1a1a24] overflow-hidden shadow-2xl">
                 <div className="p-6 border-b border-[#1e1e2a]">
                    <Badge className="bg-purple-500/10 text-purple-400 border-none mb-4 uppercase tracking-[0.15em] text-[10px] items-center">Synthesis Resolved</Badge>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{generatedData.title}</h2>
                 </div>
                 <div className="p-6">
                    <ul className="space-y-3">
                       {generatedData.tasks.map((task, i) => (
                           <li key={i} className="flex items-start bg-[#0f0f14] border border-[#1e1e2a] p-4 rounded-xl">
                              <span className="w-6 h-6 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center text-[10px] font-black mr-4 mt-0.5 shrink-0">0{i + 1}</span>
                              <p className="text-gray-400 text-sm font-medium leading-relaxed">{task}</p>
                           </li>
                       ))}
                    </ul>
                 </div>
                 <div className="p-4 bg-black/20 border-t border-[#1e1e2a] flex justify-end">
                    <Link href="/workflows">
                       <Button variant="outline" className="text-xs border-[#272737] h-9 px-6 font-bold hover:bg-white/5">Access Log &rarr;</Button>
                    </Link>
                 </div>
             </Card>
           ) : (
             <div className="p-12 text-center border-2 border-dashed border-[#1e1e2a] opacity-30 text-gray-500 font-medium italic">Neural Signal Required.</div>
           )}
        </div>
      </div>
    </div>
  )
}
