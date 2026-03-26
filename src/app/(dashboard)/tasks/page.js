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

  async function toggleTaskStatus(id, currentStatus) {
    const nextStatus = currentStatus === 'todo' ? 'progress' : currentStatus === 'progress' ? 'done' : 'todo'
    const { error } = await supabase.from('tasks').update({ status: nextStatus }).eq('id', id)
    if (!error) setTasks(tasks.map(t => t.id === id ? { ...t, status: nextStatus } : t))
  }

  async function handleDeleteTask(id) {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) setTasks(tasks.filter(t => t.id !== id))
  }

  return (
    <div className="space-y-12 animate-page pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-10 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Active Tasks</h1>
          <p className="text-zinc-500 font-medium">Coordinate individual pulse objectives within clusters.</p>
        </div>
        <div className="flex items-center gap-4">
           <Badge className="bg-purple-500/5 text-purple-400 border border-purple-500/20 px-4 py-1.5 font-bold text-[10px] uppercase tracking-widest leading-none">{tasks.length} Operational Units</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
         {/* Sidebar Form */}
         <Card className="lg:col-span-1 p-8 border-white/5 bg-[#12121a] lg:sticky lg:top-24 rounded-2xl">
            <h3 className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg uppercase tracking-widest mb-8 inline-block">New Entry</h3>
            <form onSubmit={handleCreateTask} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block px-1">Target Cluster</label>
                  <select 
                    value={selectedWorkflowId} 
                    onChange={(e) => setSelectedWorkflowId(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 text-white h-12 rounded-xl px-4 focus:outline-none focus:border-purple-500/50 font-semibold text-sm transition-all"
                    required
                  >
                    {workflows.map(wf => (
                      <option key={wf.id} value={wf.id}>{wf.title}</option>
                    ))}
                  </select>
               </div>
               <Input 
                 label="Task Description"
                 placeholder="Pulse objective..."
                 value={newTitle}
                 onChange={(e) => setNewTitle(e.target.value)}
                 className="bg-black/40 border-white/5 h-12"
                 required
               />
               <Button type="submit" isLoading={creating} className="w-full h-14 font-extrabold uppercase tracking-widest text-xs btn-premium shadow-lg shadow-purple-600/10">
                  Register Task
               </Button>
            </form>
         </Card>

         {/* Task Tracker (Linear style) */}
         <div className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="p-20 text-center text-zinc-600 font-bold uppercase tracking-widest text-xs animate-pulse italic">Scanning Neural Cache...</div>
            ) : tasks.length === 0 ? (
              <div className="p-24 text-center rounded-3xl border-2 border-dashed border-white/5 bg-transparent opacity-60">
                 <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs tracking-[0.3em]">No Operational Units</p>
              </div>
            ) : (
              tasks.map((task) => (
                <Card key={task.id} className={`p-0 border-white/5 bg-zinc-900/10 hover:bg-zinc-900/20 relative group transition-base rounded-2xl overflow-hidden ${task.status === 'done' ? 'opacity-50 grayscale' : ''}`}>
                   <div className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                      <div className="flex items-center gap-6">
                         {/* Linear style status indicator */}
                         <button 
                            onClick={() => toggleTaskStatus(task.id, task.status)}
                            className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center shrink-0 ${
                              task.status === 'done' 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : task.status === 'progress'
                                ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                                : 'bg-transparent border-zinc-700 hover:border-zinc-500'
                            }`}
                         >
                            {task.status === 'done' && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                            {task.status === 'progress' && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                         </button>
                         <div className="space-y-1">
                            <h4 className={`text-lg font-bold tracking-tight transition-all leading-none ${task.status === 'done' ? 'text-zinc-600 line-through' : 'text-white'}`}>
                               {task.title}
                            </h4>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Cluster: {task.workflows?.title}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6 pl-12 sm:pl-0">
                         <Badge status={task.status === 'done' ? 'done' : task.status === 'progress' ? 'progress' : 'todo'} className="px-3 font-extrabold text-[8px] tracking-widest h-6 flex items-center">{task.status}</Badge>
                         <Button onClick={() => handleDeleteTask(task.id)} variant="ghost" className="w-10 h-10 p-0 rounded-xl hover:bg-danger/10 text-zinc-800 hover:text-danger hover:scale-110 transition-base">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </Button>
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
