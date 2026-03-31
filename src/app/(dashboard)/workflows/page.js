'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [initMode, setInitMode] = useState(null) // null, 'manual', 'ai'
  
  const [deleteId, setDeleteId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
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
      setInitMode(null)
    }
    setCreating(false)
  }

  async function handleDeleteWorkflow(id) {
    if (id) {
       setDeleteId(id)
       setShowDeleteModal(true)
       return
    }
    
    if (!deleteId) return

    try {
      // 1. Resolve Foreign Key Constraint: Delete associated tasks first
      const { error: tasksError } = await supabase.from('tasks').delete().eq('workflow_id', deleteId)
      
      if (tasksError) {
        console.error('Failed to clear associated tasks:', tasksError)
        alert('Failed to delete associated tasks before workflow deletion.')
        return
      }

      // 2. Safely delete the workflow
      const { error } = await supabase.from('workflows').delete().eq('id', deleteId)
      
      if (error) {
        console.error('Delete error:', error)
        alert(`Failed to delete: ${error.message}`)
        return
      }
      
      setWorkflows(workflows.filter(w => w.id !== deleteId))
      setShowDeleteModal(false)
      setDeleteId(null)
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred while deleting.')
    }
  }

  const resetInit = () => {
    setShowCreateModal(false)
    setInitMode(null)
    setNewTitle('')
  }

  return (
    <div className="space-y-12 animate-fade-in relative">
      <Modal 
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteId(null); }}
        onConfirm={handleDeleteWorkflow}
        title="Decommission Cluster"
        message="Are you certain you want to decommission this sequence? This operation cannot be reversed."
        confirmText="Confirm Deletion"
        cancelText="Abort"
        variant="danger"
      />
      
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#7c3aed]/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      {/* Header: Technical & Bold */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#3f3f46]/50">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Clusters</h1>
          <p className="text-[#a1a1aa] text-sm font-medium italic">High-level neural workflow management.</p>
        </div>
        <Button 
          onClick={showCreateModal ? resetInit : () => setShowCreateModal(true)}
          className={`h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all ${showCreateModal ? 'bg-zinc-800 text-white' : 'bg-[#7c3aed] text-white shadow-purple-500/20'}`}
        >
          {showCreateModal ? 'Deactivate init' : 'Initialize +'}
        </Button>
      </div>

      {/* Hero-style Inline Creation Choice */}
      {showCreateModal && (
        <Card className="p-8 bg-[#18181b]/60 border-[#7c3aed]/40 backdrop-blur-xl rounded-[32px] animate-slide-up shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-dotted-grid opacity-5 pointer-events-none" />
           
           {!initMode ? (
             <div className="relative z-10 space-y-8">
                <div className="space-y-2">
                   <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Select Initialization Mode</h3>
                   <p className="text-xs text-[#a1a1aa] font-bold uppercase tracking-widest">Choose how you want to build your neural cluster</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <button 
                     onClick={() => setInitMode('manual')}
                     className="p-8 rounded-[24px] bg-[#0f0f14] border border-[#3f3f46] hover:border-white transition-all text-left flex flex-col gap-4 group/mode"
                   >
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white group-hover/mode:bg-white group-hover/mode:text-black transition-colors">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </div>
                      <div>
                         <h4 className="font-black text-white uppercase italic tracking-tighter">Custom Cluster</h4>
                         <p className="text-[10px] text-[#a1a1aa] font-bold uppercase tracking-widest mt-1">Build your own neural sequence</p>
                      </div>
                   </button>

                   <Link 
                     href="/generate"
                     className="p-8 rounded-[24px] bg-gradient-to-br from-[#7c3aed]/20 to-indigo-600/20 border border-[#7c3aed]/50 hover:border-[#7c3aed] transition-all text-left flex flex-col gap-4 group/ai"
                   >
                      <div className="w-12 h-12 rounded-xl bg-[#7c3aed] flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover/ai:scale-110 transition-transform">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <div>
                         <h4 className="font-black text-white uppercase italic tracking-tighter">AI Generator</h4>
                         <p className="text-[10px] text-purple-300 font-bold uppercase tracking-widest mt-1">Autonomous cluster synthesis</p>
                      </div>
                   </Link>
                </div>
             </div>
           ) : initMode === 'manual' ? (
             <div className="relative z-10 max-w-md animate-fade-in">
                <button onClick={() => setInitMode(null)} className="text-[10px] font-black text-[#a1a1aa] uppercase tracking-[0.2em] mb-6 hover:text-white flex items-center gap-2">
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                   Back to mode
                </button>
                <h3 className="text-lg font-black text-white uppercase mb-6 italic tracking-tight underline decoration-[#7c3aed] decoration-4 underline-offset-8">Manual Registration</h3>
                <form onSubmit={handleCreateWorkflow} className="flex flex-col sm:flex-row gap-4 items-end">
                   <div className="flex-1 w-full">
                      <Input 
                        label="Cluster Label" 
                        placeholder="e.g. Data Synthesis Alpha" 
                        value={newTitle} 
                        onChange={(e) => setNewTitle(e.target.value)} 
                        className="h-12 bg-[#0f0f14] border-[#3f3f46] rounded-2xl"
                        required 
                      />
                   </div>
                   <Button type="submit" isLoading={creating} className="h-12 px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                      Register
                   </Button>
                </form>
             </div>
           ) : null}
        </Card>
      )}

      {/* Workflows Grid Collection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {loading ? (
           <div className="col-span-full py-20 text-center text-[#a1a1aa] text-sm font-black uppercase tracking-[0.6em] animate-pulse">Syncing Telemetry...</div>
         ) : workflows.length === 0 ? (
           <div className="col-span-full py-32 text-center border-2 border-dashed border-[#3f3f46]/50 rounded-[40px] flex flex-col items-center justify-center space-y-4">
              <p className="text-[#a1a1aa] font-bold uppercase tracking-widest text-xs">No active clusters found</p>
              <Button onClick={() => setShowCreateModal(true)} variant="ghost" className="text-xs text-[#7c3aed] font-black uppercase underline">Begin Init</Button>
           </div>
         ) : (
           workflows.map((wf, idx) => (
             <Card 
                key={wf.id} 
                className="p-0 bg-[#18181b]/40 border-[#3f3f46]/30 hover:border-[#7c3aed]/50 backdrop-blur-md rounded-[32px] transition-all duration-500 overflow-hidden group hover:translate-y-[-8px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                style={{ animationDelay: `${idx * 80}ms` }}
             >
                <div className="p-8 flex flex-col h-full justify-between">
                   <div className="space-y-6">
                      <div className="flex justify-between items-start">
                         <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center text-white shadow-xl shadow-purple-500/20 group-hover:rotate-12 transition-transform overflow-hidden p-3 transition-all">
                            <img src="/logo-klyvora.png" alt="Logo" className="w-full h-full object-cover" />
                         </div>
                         <Badge status="done" className="bg-[#7c3aed]/10 text-[#7c3aed] italic font-black uppercase text-[9px] px-4 py-1 rounded-lg">Operational</Badge>
                      </div>
                      
                      <div className="space-y-1">
                         <h4 className="text-xl font-black text-white tracking-tight group-hover:text-purple-400 transition-colors uppercase leading-tight py-2 border-l-2 border-[#7c3aed] pl-4">{wf.title}</h4>
                         <p className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-[0.2em]">{new Date(wf.created_at).toLocaleDateString()}</p>
                      </div>
                   </div>

                   <div className="mt-10 pt-6 border-t border-[#3f3f46]/40 flex gap-4">
                      <Link href="/tasks" className="flex-1">
                         <Button variant="secondary" className="w-full h-11 rounded-2xl font-bold uppercase tracking-widest text-[9px] bg-transparent border border-[#3f3f46] hover:bg-white/5">
                            Manage Tasks
                         </Button>
                      </Link>
                      <Button 
                         onClick={() => handleDeleteWorkflow(wf.id)} 
                         variant="ghost" 
                         className="w-11 h-11 p-0 rounded-2xl bg-red-500/0 hover:bg-red-500/10 text-[#3f3f46] hover:text-red-500 transition-all hover:scale-110"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </Button>
                   </div>
                </div>
             </Card>
           ))
         )}
      </div>
    </div>
  )
}
