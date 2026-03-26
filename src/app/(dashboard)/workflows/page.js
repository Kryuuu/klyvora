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
  const [creating, setCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
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

    const { data, error } = await supabase.from('workflows').insert([{ user_id: user.id, title: newTitle }]).select().single()

    if (!error) {
      setWorkflows([data, ...workflows])
      setNewTitle('')
      setShowCreateModal(false)
    }
    setCreating(false)
  }

  async function handleDeleteWorkflow(id) {
    if (!confirm('Are you sure you want to delete this sequence?')) return
    const { error } = await supabase.from('workflows').delete().eq('id', id)
    if (!error) setWorkflows(workflows.filter(w => w.id !== id))
  }

  return (
    <div className="space-y-12 animate-page pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight leading-none mb-3">Workflows</h1>
          <p className="text-zinc-500 font-medium">Manage and monitor all active automated clusters.</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(!showCreateModal)}
          className="h-12 px-8 font-bold uppercase tracking-widest text-[11px] btn-premium whitespace-nowrap rounded-lg"
        >
          {showCreateModal ? 'Cancel' : 'New Workflow +'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Inline Creation Card (Conditional) */}
         {showCreateModal && (
            <Card className="p-8 border-purple-500 bg-purple-500/5 transition-base animate-fade">
               <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-8">Initialize</h3>
               <form onSubmit={handleCreateWorkflow} className="space-y-6">
                  <Input 
                    label="Workflow Title" 
                    placeholder="E.g. Daily Synthesis" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    className="bg-black/40 border-white/5 h-12"
                    required 
                  />
                  <Button type="submit" isLoading={creating} className="w-full h-12 font-bold text-[11px] uppercase tracking-widest btn-premium">
                     Create Sequence
                  </Button>
               </form>
            </Card>
         )}

         {/* Workflows Grid Collection */}
         {loading ? (
           <div className="col-span-full p-20 text-center text-zinc-600 font-bold uppercase tracking-widest text-xs animate-pulse italic">Scanning Telemetry...</div>
         ) : workflows.length === 0 ? (
           <div className="col-span-full p-24 text-center border-2 border-dashed border-white/5 bg-transparent opacity-60 rounded-3xl flex flex-col items-center">
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs tracking-[0.3em] mb-4">No active workflow identified</p>
           </div>
         ) : (
           workflows.map((wf) => (
             <Card key={wf.id} className="p-0 border-white/5 bg-zinc-900/10 hover:bg-zinc-900/30 group transition-smooth rounded-2xl overflow-hidden">
                <div className="p-8 space-y-8">
                   <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-purple-500 border border-white/5 group-hover:scale-110 transition-smooth">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-none px-3 font-bold text-[9px] h-6 flex items-center">Active</Badge>
                   </div>
                   
                   <div className="space-y-0.5">
                      <h4 className="text-lg font-bold text-white group-hover:text-purple-400 leading-tight transition-smooth truncate">{wf.title}</h4>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Minimal Cluster</p>
                   </div>

                   <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">{new Date(wf.created_at).toLocaleDateString()}</span>
                      <div className="flex gap-4">
                         <Link href="/tasks">
                            <Button variant="ghost" className="w-8 h-8 p-0 rounded-lg hover:bg-white/5 text-zinc-800 hover:text-white transition-smooth">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </Button>
                         </Link>
                         <Button 
                            onClick={() => handleDeleteWorkflow(wf.id)} 
                            variant="ghost" 
                            className="w-8 h-8 p-0 rounded-lg hover:bg-danger/10 text-zinc-800 hover:text-danger hover:scale-110 transition-smooth"
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
  )
}
