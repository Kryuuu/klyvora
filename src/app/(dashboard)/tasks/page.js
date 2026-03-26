'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('')
  const [creating, setCreating] = useState(false)
  
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
    }
    setCreating(false)
  }

  async function toggleStatus(id, current) {
    const next = current === 'todo' ? 'doing' : current === 'doing' ? 'done' : 'todo'
    const { error } = await supabase.from('tasks').update({ status: next }).eq('id', id)
    if (!error) setTasks(tasks.map(t => t.id === id ? { ...t, status: next } : t))
  }

  async function handleDelete(id) {
    if (!confirm('Are you certain you wish to delete this task?')) return
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) setTasks(tasks.filter(t => t.id !== id))
  }

  return (
    <div className="space-y-10 animate-fade-in relative">
      {/* 🌌 Atmospheric background for Tool UI */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full -z-10 pointer-events-none" />

      {/* Header Section: Modern Tool UI style */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#3f3f46]/50">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Objectives</h1>
          <p className="text-[#a1a1aa] text-sm font-medium">Neural operational tracking for your sequences.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-3 py-1 rounded-lg bg-[#18181b] border border-[#3f3f46] text-[#a1a1aa] text-[10px] font-bold uppercase tracking-wider">
              {tasks.length} Active Nodes
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
         
         {/* Sidebar Form: Re-styled as a floating control card */}
         <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
            <Card className="p-6 bg-[#18181b]/60 border-[#3f3f46]/50 backdrop-blur-md shadow-2xl rounded-3xl group">
               <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-4 bg-[#7c3aed] rounded-full" />
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">Initialization</h3>
               </div>
               
               <form onSubmit={handleCreateTask} className="space-y-5">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest ml-1">Parent workflow</label>
                     <select 
                       value={selectedWorkflowId} 
                       onChange={(e) => setSelectedWorkflowId(e.target.value)}
                       className="w-full bg-[#0f0f14] border border-[#3f3f46] text-white h-12 rounded-2xl px-4 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] text-sm transition-all font-medium appearance-none"
                       style={{ backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233f3f46'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1rem' }}
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
                       placeholder="e.g. Authenticate API Key"
                       value={newTitle}
                       onChange={(e) => setNewTitle(e.target.value)}
                       className="h-12 border-[#3f3f46] bg-[#0f0f14] rounded-2xl focus:scale-[1.02] transition-transform"
                       required
                     />
                  </div>

                  <Button type="submit" isLoading={creating} className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-purple-500/20 group-hover:scale-[1.02] transition-all">
                     Add to Queue
                  </Button>
               </form>
            </Card>

            <div className="px-4 py-3 rounded-2xl border border-[#3f3f46]/30 bg-white/2">
               <p className="text-[10px] text-[#a1a1aa] leading-relaxed italic text-center font-medium">Click icon to toggle operational status.</p>
            </div>
         </div>

         {/* Task List: Modern Linear-style list with premium hover effects */}
         <div className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="py-20 text-center text-[#a1a1aa] text-xs font-black uppercase tracking-[0.5em] animate-pulse">Scanning Neural Network...</div>
            ) : tasks.length === 0 ? (
              <div className="py-32 text-center border-2 border-dashed border-[#3f3f46]/50 rounded-[40px] flex flex-col items-center justify-center space-y-4">
                 <div className="w-16 h-16 rounded-full bg-[#18181b] flex items-center justify-center text-[#3f3f46]">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                 </div>
                 <p className="text-[#a1a1aa] font-bold uppercase tracking-widest text-xs">No active nodes detected</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, idx) => (
                  <Card 
                    key={task.id} 
                    className={`p-1.5 pr-6 rounded-[24px] flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-500 border-[#3f3f46]/30 group hover:border-[#7c3aed]/40 hover:bg-[#18181b] ${task.status === 'done' ? 'opacity-40 grayscale-[0.8] scale-[0.98]' : 'bg-[#18181b]/40 backdrop-blur-sm shadow-xl'}`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                     {/* Status Toggle Area */}
                     <div className="flex items-center gap-4 flex-1">
                        <button 
                           onClick={() => toggleStatus(task.id, task.status)}
                           className={`w-12 h-12 rounded-[20px] m-1 transition-all duration-300 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 ${
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
                              <span className="text-[9px] font-black text-[#7c3aed] uppercase tracking-widest">{task.workflows?.title}</span>
                              <span className="w-1 h-1 rounded-full bg-[#3f3f46]" />
                              <span className="text-[9px] font-bold text-[#a1a1aa] uppercase tracking-wider">ID-{task.id.slice(0, 4)}</span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex items-center justify-end gap-6 h-full pl-16 sm:pl-0 pb-4 sm:pb-0">
                        <Badge status={task.status} className="h-7 px-4 shadow-sm border border-white/5 font-extrabold italic uppercase rounded-lg">
                           {task.status === 'doing' ? 'Operational' : task.status}
                        </Badge>
                        <Button onClick={() => handleDelete(task.id)} variant="ghost" className="p-3 bg-red-500/0 hover:bg-red-500/10 text-[#3f3f46] hover:text-red-500 rounded-2xl transition-all hover:rotate-12" title="Decommission Node">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </Button>
                     </div>
                  </Card>
                ))}
              </div>
            )}
         </div>
      </div>
    </div>
  )
}
