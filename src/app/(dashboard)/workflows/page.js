'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Standard')
  const [creating, setCreating] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchWorkflows()
  }, [])

  async function fetchWorkflows() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase.from('workflows').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setWorkflows(data || [])
    setLoading(false)
  }

  async function handleCreateWorkflow(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').upsert({ id: user.id, name: user.email.split('@')[0] }, { onConflict: 'id' })

    const { data, error } = await supabase.from('workflows').insert([{ user_id: user.id, title: newTitle, category: newCategory }]).select().single()

    if (!error) {
      setWorkflows([data, ...workflows])
      setNewTitle('')
      setNewCategory('Standard')
    }
    setCreating(false)
  }

  async function handleDeleteWorkflow(id) {
    if (!confirm('Are you sure you want to delete this sequence?')) return
    const { error } = await supabase.from('workflows').delete().eq('id', id)
    if (!error) setWorkflows(workflows.filter(w => w.id !== id))
  }

  return (
    <div className="space-y-12 animate-slide-up pb-20">
      <div className="flex justify-between items-end border-b border-white/5 pb-10">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Matrix Workflows</h1>
          <p className="text-zinc-500 font-medium">Manage and monitor all active automated clusters.</p>
        </div>
        <div className="flex items-center gap-4">
           <Badge className="bg-purple-500/10 text-purple-400 border-none px-4 py-1.5 font-black text-[9px] uppercase tracking-widest italic">{workflows.length} Clusters Online</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
         {/* Creation Card */}
         <Card className="p-8 border-white/5 bg-[#12121a] lg:sticky lg:top-24">
            <h3 className="text-xs font-black text-purple-400 uppercase tracking-[0.3em] mb-8">New Protocol</h3>
            <form onSubmit={handleCreateWorkflow} className="space-y-6">
               <Input 
                 label="Protocol Name" 
                 placeholder="Pulse Sequence Alpha" 
                 value={newTitle} 
                 onChange={(e) => setNewTitle(e.target.value)} 
                 className="bg-zinc-900 border-white/5 h-12"
                 required 
               />
               <Input 
                 label="Category Classification" 
                 placeholder="Standard" 
                 value={newCategory} 
                 onChange={(e) => setNewCategory(e.target.value)} 
                 className="bg-zinc-900 border-white/5 h-12"
                 required 
               />
               <Button type="submit" isLoading={creating} className="w-full h-14 font-black text-xs uppercase tracking-widest shadow-purple-600/20">
                  Register Protocol
               </Button>
            </form>
         </Card>

         {/* Workflows Grid */}
         <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full p-20 text-center text-zinc-600 font-black uppercase tracking-widest text-xs animate-pulse italic">Scanning Telemetry clusters...</div>
            ) : workflows.length === 0 ? (
              <div className="col-span-full p-24 text-center rounded-[32px] border-2 border-dashed border-white/5 opacity-30 flex flex-col items-center">
                 <svg className="w-16 h-16 text-zinc-700 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.703 2.11a2 2 0 01-1.922 1.36h-1.266a2 2 0 01-1.922-1.36l-.703-2.11a2 2 0 00-1.96-1.414l-2.387.477a2 2 0 00-1.022.547L3 18.252V12m16.428 3.428A10.158 10.158 0 0118 12M3 18.252a10.033 10.033 0 01-1.89-6.252h2.89a2 2 0 002-2V4.5M3 18.252A10.033 10.033 0 005.11 21.012M12 21.012a9.969 9.969 0 004.89-1.26m0 0a9.969 9.969 0 01-4.89 1.26m0 0a9.969 9.969 0 01-4.89-1.26M12 21.012c-1.82 0-3.524-.486-4.996-1.341m9.992 0c1.472-.855 3.176-1.341 4.996-1.341M3 12a9.969 9.969 0 014.89-1.26m0 0a9.969 9.969 0 014.89 1.26m0 0a9.969 9.969 0 014.89-1.26M3 12c1.82 0 3.524.486 4.996 1.341m9.992 0c-1.472.855-3.176 1.341-4.996 1.341" /></svg>
                 <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-xs">No Matrix Chains Identified</p>
              </div>
            ) : (
              workflows.map((wf) => (
                <Card key={wf.id} className="p-0 border-white/5 bg-zinc-900/20 hover:bg-zinc-900/40 relative group overflow-hidden border-t-2 border-t-transparent hover:border-t-purple-500 transition-all duration-500">
                   <div className="p-8 space-y-6">
                      <div className="flex justify-between items-start">
                         <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-purple-500 border border-white/5 transition-transform group-hover:scale-110 group-hover:rotate-12">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                         </div>
                         <Badge status="done" className="bg-emerald-500/10 text-emerald-400 border-none px-3 font-black text-[8px] flex items-center">Active</Badge>
                      </div>
                      
                      <div className="space-y-1">
                         <h4 className="text-xl font-black text-white italic tracking-tighter uppercase group-hover:text-purple-400 transition-colors truncate">{wf.title}</h4>
                         <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{wf.category || 'Pulse Cluster'}</p>
                      </div>

                      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                         <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">{new Date(wf.created_at).toLocaleDateString()}</span>
                         <div className="flex gap-2">
                            <Link href="/tasks">
                               <Button variant="ghost" className="w-9 h-9 p-0 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                               </Button>
                            </Link>
                            <Button 
                               onClick={() => handleDeleteWorkflow(wf.id)} 
                               variant="ghost" 
                               className="w-9 h-9 p-0 rounded-xl hover:bg-danger/10 text-zinc-700 hover:text-danger hover:scale-110 transition-all"
                            >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </Button>
                         </div>
                      </div>
                   </div>
                </Card>
              ))
            )}
         </div>
      </div>
    </div>
  )
}
