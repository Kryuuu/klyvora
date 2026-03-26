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

    const { data: wfData } = await supabase.from('workflows').select('id, tittle').eq('user_id', user.id)
    setWorkflows(wfData || [])
    if (wfData?.length > 0) setSelectedWorkflowId(wfData[0].id)

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
       console.error('[Task Error]:', error)
    } else {
       setTasks(taskData || [])
    }
    setLoading(false)
  }

  async function handleCreateTask(e) {
    e.preventDefault()
    if (!newTitle.trim() || !selectedWorkflowId) return
    setCreating(true)
    
    // DB column: tittle
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

    if (!error) {
       setTasks([data, ...tasks])
       setNewTitle('')
    }
    setCreating(false)
  }

  async function toggleTaskStatus(id, currentStatus) {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done'
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', id)
    if (!error) {
       setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t))
    }
  }

  async function handleDeleteTask(id) {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) {
       setTasks(tasks.filter(t => t.id !== id))
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Matrix Task Log</h1>
          <p className="text-sm text-gray-400">Coordinate individual objectives.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
         <Card className="p-6 border-[#1e1e2a] bg-[#16161e] lg:sticky lg:top-8 shadow-2xl overflow-hidden relative border-t border-purple-500/20">
            <h3 className="text-sm font-bold text-white mb-6">New Task Pulse</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
               <div>
                  <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2 font-bold">Assign to Cluster</label>
                  <select 
                    value={selectedWorkflowId} 
                    onChange={(e) => setSelectedWorkflowId(e.target.value)}
                    className="w-full bg-[#0f0f14] border border-[#272737] text-white h-11 rounded-xl px-4 focus:outline-none focus:border-purple-500 font-medium text-sm"
                    required
                  >
                    {workflows.map(wf => (
                      <option key={wf.id} value={wf.id}>{wf.tittle}</option>
                    ))}
                  </select>
               </div>
               <Input 
                 label="Task Objective"
                 placeholder="Pulse Objective X"
                 value={newTitle}
                 onChange={(e) => setNewTitle(e.target.value)}
                 required
               />
               <Button type="submit" isLoading={creating} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold h-11">
                  Add to Matrix
               </Button>
            </form>
         </Card>

         <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="p-8 text-gray-500 font-medium italic">Scanning matrix...</div>
            ) : tasks.length === 0 ? (
              <div className="p-16 text-center border-dashed border-[#1e1e2a] opacity-50 flex flex-col items-center">
                 <p className="text-gray-500 font-medium italic underline decoration-purple-500/10 underline-offset-8">Awaiting operational objective input.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <Card key={task.id} className={`p-5 border-[#1e1e2a] bg-[#16161e] flex justify-between items-center group shadow-lg border-l-4 ${task.status === 'done' ? 'border-l-emerald-500 opacity-60' : 'border-l-purple-500'}`}>
                   <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <Badge className={`${task.status === 'done' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'} border-none text-[9px] uppercase tracking-widest font-black`}>
                            {task.status === 'done' ? 'Resolved' : 'Active'}
                         </Badge>
                         <span className="text-[10px] text-gray-700 font-black uppercase tracking-widest italic truncate max-w-[150px]">Cluster: {task.workflows?.tittle}</span>
                      </div>
                      <h4 className={`text-lg font-bold transition-all ${task.status === 'done' ? 'text-gray-600 line-through' : 'text-white group-hover:text-purple-400'}`}>
                         {task.tittle}
                      </h4>
                   </div>
                   <div className="flex gap-2">
                      <Button 
                         onClick={() => toggleTaskStatus(task.id, task.status)}
                         variant="outline" 
                         className={`text-xs h-8 border-[#272737] hover:bg-emerald-500/10 hover:text-emerald-400 px-4 font-bold transition-all`}
                      >
                         {task.status === 'done' ? 'Reactivate' : 'Resolve'}
                      </Button>
                      <Button onClick={() => handleDeleteTask(task.id)} variant="outline" className="text-xs h-8 border-[#272737] hover:bg-red-500/10 hover:text-red-500 px-4 font-bold transition-all">Delete</Button>
                   </div>
                </Card>
              ))
            )}
         </div>
      </div>
    </div>
  )
}
