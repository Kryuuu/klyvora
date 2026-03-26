'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('')
  const [creating, setCreating] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedWorkflows, setExpandedWorkflows] = useState([])
  
  const [deleteId, setDeleteId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: wfData } = await supabase.from('workflows').select('id, title').eq('user_id', user.id)
    setWorkflows(wfData || [])
    if (wfData?.length > 0) setSelectedWorkflowId(wfData[0].id)

    const { data: taskData } = await supabase.from('tasks').select('*, workflows ( title )').order('created_at', { ascending: false })
    setTasks(taskData || [])
    setLoading(false)
  }

  async function handleCreateTask(e) {
    e.preventDefault()
    if (!newTitle.trim() || !selectedWorkflowId) return
    setCreating(true)
    
    const { data, error } = await supabase.from('tasks').insert([{ workflow_id: selectedWorkflowId, title: newTitle, status: 'todo' }]).select('*, workflows ( title )').single()

    if (!error) {
      setTasks([data, ...tasks])
      setNewTitle('')
      setShowAddForm(false)
      // Expand the workflow group where the new task was added
      const wfTitle = data.workflows?.title
      if (wfTitle && !expandedWorkflows.includes(wfTitle)) {
        setExpandedWorkflows([...expandedWorkflows, wfTitle])
      }
    }
    setCreating(false)
  }

  async function toggleStatus(id, current) {
    const next = current === 'todo' ? 'doing' : current === 'doing' ? 'done' : 'todo'
    const { error } = await supabase.from('tasks').update({ status: next }).eq('id', id)
    if (!error) setTasks(tasks.map(t => t.id === id ? { ...t, status: next } : t))
  }

  async function handleDelete(id) {
    if (id) {
       setDeleteId(id)
       setShowDeleteModal(true)
       return
    }

    if (!deleteId) return
    const { error } = await supabase.from('tasks').delete().eq('id', deleteId)
    if (!error) {
      setTasks(tasks.filter(t => t.id !== deleteId))
      setShowDeleteModal(false)
      setDeleteId(null)
    }
  }

  const toggleExpand = (wfTitle) => {
    if (expandedWorkflows.includes(wfTitle)) {
      setExpandedWorkflows(expandedWorkflows.filter(t => t !== wfTitle))
    } else {
      setExpandedWorkflows([...expandedWorkflows, wfTitle])
    }
  }

  // Group tasks by workflow
  const groupedTasks = tasks.reduce((acc, task) => {
    const wfTitle = task.workflows?.title || 'Unassigned'
    if (!acc[wfTitle]) acc[wfTitle] = []
    acc[wfTitle].push(task)
    return acc
  }, {})

  return (
    <div className="space-y-10 animate-fade-in relative pb-20">
      <Modal 
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteId(null); }}
        onConfirm={handleDelete}
        title="Decommission Node"
        message="Are you certain you wish to delete this operational node? This sequence data will be purged."
        confirmText="Purge Node"
        variant="danger"
      />
      {/* 🌌 Atmospheric background */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full -z-10 pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#3f3f46]/50">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Objectives</h1>
          <p className="text-[#a1a1aa] text-sm font-medium italic">Neural operational tracking clustered by sequence.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-3 py-1 rounded-lg bg-[#18181b] border border-[#3f3f46] text-[#a1a1aa] text-[10px] font-bold uppercase tracking-wider">
              {tasks.length} Total Nodes
           </div>
           <Button 
             onClick={() => setShowAddForm(!showAddForm)}
             variant={showAddForm ? 'secondary' : 'default'}
             className="h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-purple-500/10"
           >
             {showAddForm ? 'Cancel Init' : 'Register Task +'}
           </Button>
        </div>
      </div>

      {/* Inline Floating Add Form */}
      {showAddForm && (
        <Card className="animate-slide-up bg-[#18181b]/80 border-[#7c3aed]/30 backdrop-blur-2xl p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-dotted-grid opacity-5 pointer-events-none" />
           <div className="relative z-10 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-8">
                 <div className="w-1.5 h-5 bg-[#7c3aed] rounded-full" />
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Initialize Operational Node</h3>
              </div>
              
              <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest ml-1">Select cluster</label>
                    <select 
                      value={selectedWorkflowId} 
                      onChange={(e) => setSelectedWorkflowId(e.target.value)}
                      className="w-full bg-[#0f0f14] border border-[#3f3f46] text-white h-14 rounded-2xl px-4 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] text-sm transition-all font-bold appearance-none"
                      style={{ backgroundPosition: 'right 1.2rem center', backgroundRepeat: 'no-repeat', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233f3f46'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1.2rem' }}
                      required
                    >
                      {workflows.map(wf => (
                        <option key={wf.id} value={wf.id}>{wf.title}</option>
                      ))}
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest ml-1">Definition</label>
                    <Input 
                      placeholder="e.g. Map JSON response data"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="h-14 border-[#3f3f46] bg-[#0f0f14] rounded-2xl font-medium focus:scale-[1.01] transition-transform"
                      required
                    />
                 </div>

                 <div className="md:col-span-2 pt-2">
                    <Button type="submit" isLoading={creating} className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-purple-500/20 active:scale-95 transition-all">
                       Inject to Network
                    </Button>
                 </div>
              </form>
           </div>
        </Card>
      )}

      {/* Task Groups Section */}
      <div className="space-y-6">
         {loading ? (
            <div className="py-20 text-center text-[#a1a1aa] text-xs font-black uppercase tracking-[0.5em] animate-pulse">Scanning Neural Network...</div>
         ) : Object.keys(groupedTasks).length === 0 ? (
            <div className="py-32 text-center border-2 border-dashed border-[#3f3f46]/30 rounded-[40px] flex flex-col items-center justify-center space-y-4">
               <p className="text-[#a1a1aa] font-bold uppercase tracking-widest text-xs">No active clusters detected</p>
            </div>
         ) : (
            Object.entries(groupedTasks).map(([wfTitle, wfTasks], gIdx) => {
              const isOpen = expandedWorkflows.includes(wfTitle);
              return (
                <div key={wfTitle} className={`animate-slide-up bg-[#18181b]/30 rounded-[32px] border transition-all duration-300 ${isOpen ? 'border-[#7c3aed]/30 bg-[#18181b]/50' : 'border-[#3f3f46]/30 hover:border-[#3f3f46]/60'}`} style={{ animationDelay: `${gIdx * 100}ms` }}>
                   {/* Collapsible Header */}
                   <button 
                     onClick={() => toggleExpand(wfTitle)}
                     className="w-full p-6 flex items-center justify-between group/header"
                   >
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isOpen ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-500/20 scale-110' : 'bg-[#27272a] text-[#a1a1aa] group-hover/header:rotate-12'}`}>
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div className="text-left">
                           <h2 className={`text-lg font-black uppercase italic tracking-tighter leading-tight transition-colors ${isOpen ? 'text-white' : 'text-[#a1a1aa] group-hover/header:text-white'}`}>{wfTitle}</h2>
                           <span className="text-[10px] font-bold text-[#3f3f46] uppercase tracking-widest">{wfTasks.length} NODES LINKED</span>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-4">
                        <div className="px-3 py-1 rounded-full border border-white/5 bg-white/2 hidden sm:block">
                           <span className="text-[9px] font-black text-[#a1a1aa] uppercase tracking-widest">Operation Cluster #{gIdx + 1}</span>
                        </div>
                        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#7c3aed]' : 'text-[#3f3f46]'}`}>
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                     </div>
                   </button>

                   {/* Expandable Content */}
                   <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                      <div className="p-6 pt-0 space-y-3">
                        {wfTasks.map((task, idx) => (
                           <Card 
                             key={task.id} 
                             className={`p-1.5 pr-6 rounded-[24px] flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-500 border-[#3f3f46]/20 group/task hover:border-[#7c3aed]/40 hover:bg-[#18181b]/80 shadow-inner ${task.status === 'done' ? 'opacity-40 grayscale-[0.8] scale-[0.98]' : 'bg-[#0f0f14]/50'}`}
                           >
                              <div className="flex items-center gap-4 flex-1">
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); toggleStatus(task.id, task.status); }}
                                    className={`w-12 h-12 rounded-[20px] m-1 transition-all duration-300 flex items-center justify-center shrink-0 shadow-inner group-hover/task:scale-110 ${
                                      task.status === 'done' 
                                        ? 'bg-emerald-500 text-white' 
                                        : task.status === 'doing'
                                        ? 'bg-[#7c3aed] text-white shadow-[0_0_20px_rgba(124,58,237,0.5)]'
                                        : 'bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#3f3f46]'
                                    }`}
                                 >
                                    {task.status === 'done' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    {task.status === 'doing' && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                                    {task.status === 'todo' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>}
                                 </button>

                                 <div className="py-2">
                                    <h4 className={`text-base font-bold tracking-tight transition-all ${task.status === 'done' ? 'text-[#a1a1aa] line-through decoration-emerald-500/50' : 'text-white'}`}>
                                       {task.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                       <span className="text-[9px] font-bold text-[#a1a1aa] uppercase tracking-[0.2em]">Operational Unit #{task.id.slice(0, 4)}</span>
                                    </div>
                                 </div>
                              </div>
                              
                              <div className="flex items-center justify-end gap-6 h-full pl-16 sm:pl-0 pb-4 sm:pb-0">
                                 <Badge status={task.status} className="h-7 px-4 shadow-sm border border-white/5 font-extrabold italic uppercase rounded-lg text-[10px]">
                                    {task.status === 'doing' ? 'Operational' : task.status}
                                 </Badge>
                                 <Button onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }} variant="ghost" className="p-3 bg-red-500/0 hover:bg-red-500/10 text-[#3f3f46] hover:text-red-500 rounded-2xl transition-all hover:rotate-12" title="Decommission Node">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                 </Button>
                              </div>
                           </Card>
                        ))}
                      </div>
                   </div>
                </div>
              );
            })
         )}
      </div>
    </div>
  )
}
