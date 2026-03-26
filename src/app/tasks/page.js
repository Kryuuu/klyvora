'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    if (!user) {
      router.push('/login')
      return
    }

    // 1. Fetch Workflows for the select dropdown (SCHEMA SYNC: tittle)
    const { data: wfData } = await supabase
      .from('workflows')
      .select('id, tittle')
      .eq('user_id', user.id)
    
    setWorkflows(wfData || [])
    if (wfData?.length > 0) setSelectedWorkflowId(wfData[0].id)

    // 2. Fetch Tasks with joined workflow info (SCHEMA SYNC: tittle)
    const { data: taskData, error } = await supabase
      .from('tasks')
      .select(`
        *,
        workflows (
          tittle
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Task Fetch Error]:', error)
    } else {
      setTasks(taskData || [])
    }
    setLoading(false)
  }

  async function handleCreateTask(e) {
    e.preventDefault()
    if (!newTitle.trim() || !selectedWorkflowId) return
    
    setCreating(true)
    
    // SCHEMA SYNC: table 'tasks' uses 'tittle'
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        workflow_id: selectedWorkflowId,
        tittle: newTitle,
        status: 'todo'
      }])
      .select(`
        *,
        workflows (
          tittle
        )
      `)
      .single()

    if (error) {
      console.error('[Schema Conflict]: Task creation failed:', error.message)
      alert("Failed sync with DB: " + error.message)
    } else {
      setTasks([data, ...tasks])
      setNewTitle('')
    }
    setCreating(false)
  }

  async function toggleTaskStatus(id, currentStatus) {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done'
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error) {
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t))
    }
  }

  async function handleDeleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (!error) {
      setTasks(tasks.filter(t => t.id !== id))
    }
  }

  return (
    <div className="animate-fade-in pb-20 lg:pb-0 h-full max-w-7xl mx-auto space-y-12">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
        <div className="space-y-2">
           <Badge status="default" className="bg-purple-500/10 text-purple-400 border-none uppercase tracking-[0.2em] text-[9px] font-black italic">Operational Log</Badge>
           <h1 className="text-4xl lg:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
             Task <span className="text-purple-500">Matrix</span>
           </h1>
           <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2 italic">Coordinate individual objectives within sequences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
         
         {/* Form Create */}
         <Card className="p-8 border-[#272737] bg-[#16161e] lg:sticky lg:top-8 shadow-2xl overflow-hidden relative border-t-4 border-t-purple-500">
            <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-8 italic">Inject Task Pulse</h3>
            <form onSubmit={handleCreateTask} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-gray-700 uppercase text-[10px] font-black tracking-widest italic">Assign to Cluster</label>
                  <select 
                    value={selectedWorkflowId} 
                    onChange={(e) => setSelectedWorkflowId(e.target.value)}
                    className="w-full bg-[#0f0f14] border border-[#272737] text-white h-12 rounded-xl px-4 focus:outline-none focus:border-purple-500 text-sm font-bold italic"
                    required
                  >
                    {workflows.map(wf => (
                      <option key={wf.id} value={wf.id}>{wf.tittle}</option>
                    ))}
                  </select>
               </div>
               <Input 
                 label="Task Objective"
                 labelClassName="text-gray-700 uppercase text-[10px] font-black tracking-widest italic"
                 placeholder="Specific goal..."
                 value={newTitle}
                 onChange={(e) => setNewTitle(e.target.value)}
                 required
               />
               <Button type="submit" isLoading={creating} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black h-14 uppercase text-xs tracking-[0.2em] shadow-[0_10px_30px_rgba(168,85,247,0.3)] mt-4">
                  Register Task
               </Button>
            </form>
         </Card>

         {/* Tasks List */}
         <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex justify-center p-20 animate-pulse text-purple-500 font-black uppercase tracking-widest italic text-xs">Scanning Matrix...</div>
            ) : tasks.length === 0 ? (
              <Card className="p-16 text-center border-dashed border-[#272737] bg-transparent opacity-40 flex flex-col items-center">
                 <p className="text-gray-600 font-black text-lg italic tracking-[0.1em] uppercase">Matrix Node Empty.</p>
                 <p className="text-[10px] text-gray-700 max-w-[300px] leading-relaxed mt-4 font-black uppercase tracking-widest underline decoration-purple-500/20">Awaiting operational objective input.</p>
              </Card>
            ) : (
              tasks.map((task) => (
                <Card key={task.id} className={`p-6 border-[#272737] bg-[#16161e] transition-all group flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-lg border-l-4 ${task.status === 'done' ? 'border-l-emerald-500 opacity-60' : 'border-l-purple-500'} gap-6`}>
                   <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                         <Badge className={`${task.status === 'done' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'} border-none uppercase tracking-[0.1em] text-[8px] font-black`}>
                            {task.status === 'done' ? 'Resolved' : 'Active Pulse'}
                         </Badge>
                         <span className="text-[10px] text-gray-700 font-black uppercase tracking-widest italic truncate max-w-[150px]">Cluster: {task.workflows?.tittle}</span>
                      </div>
                      <h4 className={`text-xl font-black italic uppercase tracking-tighter transition-all leading-none ${task.status === 'done' ? 'text-gray-600 line-through decoration-emerald-500/50' : 'text-white group-hover:text-purple-400'}`}>
                         {task.tittle}
                      </h4>
                   </div>
                   <div className="flex gap-4 w-full sm:w-auto">
                      <Button 
                         onClick={() => toggleTaskStatus(task.id, task.status)}
                         variant="outline" 
                         className={`flex-1 text-[10px] font-black uppercase tracking-widest border-[#272737] h-10 transition-all italic ${task.status === 'done' ? 'hover:bg-purple-500/10 hover:text-purple-400' : 'hover:bg-emerald-500/10 hover:text-emerald-400'}`}
                      >
                         {task.status === 'done' ? 'Reactivate' : 'Resolve'}
                      </Button>
                      <Button onClick={() => handleDeleteTask(task.id)} variant="outline" className="flex-1 text-[10px] font-black uppercase tracking-widest border-[#272737] h-10 hover:bg-red-500/10 hover:text-red-500 transition-all italic">Purge</Button>
                   </div>
                </Card>
              ))
            )}
         </div>
      </div>
    </div>
  )
}
