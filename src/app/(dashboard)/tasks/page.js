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
    const newStatus = currentStatus === 'done' ? 'todo' : 'done'
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', id)
    if (!error) setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t))
  }

  async function handleDeleteTask(id) {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) setTasks(tasks.filter(t => t.id !== id))
  }

  return (
    <div className="space-y-12 animate-slide-up pb-20">
      <div className="flex justify-between items-end border-b border-white/5 pb-10">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Matrix Tasks</h1>
          <p className="text-zinc-500 font-medium">Coordinate individual pulse objectives within clusters.</p>
        </div>
        <div className="flex items-center gap-4">
           <Badge className="bg-purple-500/10 text-purple-400 border-none px-4 py-1.5 font-black text-[9px] uppercase tracking-widest italic">{tasks.length} Operational Units</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
         <Card className="p-8 border-white/5 bg-[#12121a] lg:sticky lg:top-24">
            <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.4em] mb-8">Objective Injection</h3>
            <form onSubmit={handleCreateTask} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Assign Cluster</label>
                  <select 
                    value={selectedWorkflowId} 
                    onChange={(e) => setSelectedWorkflowId(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 text-white h-12 rounded-2xl px-4 focus:outline-none focus:border-purple-500 font-bold text-sm appearance-none"
                    required
                  >
                    {workflows.map(wf => (
                      <option key={wf.id} value={wf.id}>{wf.title}</option>
                    ))}
                  </select>
               </div>
               <Input 
                 label="Protocol Detail"
                 placeholder="Specific objective..."
                 value={newTitle}
                 onChange={(e) => setNewTitle(e.target.value)}
                 className="bg-zinc-900 border-white/5 h-12"
                 required
               />
               <Button type="submit" isLoading={creating} className="w-full h-14 font-black uppercase tracking-widest text-xs shadow-purple-600/20">
                  Register Task
               </Button>
            </form>
         </Card>

         <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="p-20 text-center text-zinc-600 font-black uppercase tracking-widest text-xs animate-pulse italic">Scanning Neural Grid...</div>
            ) : tasks.length === 0 ? (
              <div className="p-24 text-center rounded-[32px] border-2 border-dashed border-white/5 opacity-30 flex flex-col items-center">
                 <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-xs">Signal Matrix Empty</p>
              </div>
            ) : (
              tasks.map((task) => (
                <Card key={task.id} className={`p-0 border-white/5 bg-zinc-900/10 hover:bg-zinc-900/20 relative group transition-all duration-300 ${task.status === 'done' ? 'opacity-50' : ''}`}>
                   <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                      <div className="flex items-center gap-6">
                         <button 
                            onClick={() => toggleTaskStatus(task.id, task.status)}
                            className={`w-8 h-8 rounded-xl border transition-all flex items-center justify-center ${
                              task.status === 'done' 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'bg-transparent border-white/10 hover:border-purple-500 text-transparent'
                            }`}
                         >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                         </button>
                         <div className="space-y-1">
                            <h4 className={`text-xl font-black italic tracking-tight uppercase transition-all ${task.status === 'done' ? 'text-zinc-600 line-through' : 'text-white'}`}>
                               {task.title}
                            </h4>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Linked Cluster: {task.workflows?.title}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6 pl-14 sm:pl-0">
                         <Badge status={task.status === 'done' ? 'done' : 'default'} className="px-3 font-black text-[8px] tracking-widest">{task.status}</Badge>
                         <Button onClick={() => handleDeleteTask(task.id)} variant="ghost" className="w-10 h-10 p-0 rounded-xl hover:bg-danger/10 text-zinc-700 hover:text-danger hover:scale-110 transition-all">
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
