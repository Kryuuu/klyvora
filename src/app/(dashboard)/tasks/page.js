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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#fafafa]">Tasks</h1>
          <p className="text-[#a1a1aa] text-sm mt-1">Track actions required for your workflows.</p>
        </div>
        <Badge className="py-1.5 px-3">{tasks.length} Total Tasks</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
         {/* Sidebar Form */}
         <Card className="lg:col-span-1 lg:sticky lg:top-24 bg-[#18181b] border-[#3f3f46]">
            <h3 className="text-sm font-semibold text-[#fafafa] mb-4">Add New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-[#a1a1aa] mb-1.5">Linked Workflow</label>
                  <select 
                    value={selectedWorkflowId} 
                    onChange={(e) => setSelectedWorkflowId(e.target.value)}
                    className="w-full bg-[#0f0f14] border border-[#3f3f46] text-[#fafafa] h-11 rounded-xl px-4 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] text-sm transition-colors"
                    required
                  >
                    {workflows.map(wf => (
                      <option key={wf.id} value={wf.id}>{wf.title}</option>
                    ))}
                  </select>
               </div>
               <Input 
                 label="Task Description"
                 placeholder="e.g. Map JSON response"
                 value={newTitle}
                 onChange={(e) => setNewTitle(e.target.value)}
                 required
               />
               <Button type="submit" isLoading={creating} className="w-full text-sm">
                  Add Task
               </Button>
            </form>
         </Card>

         {/* Task List (Linear style) */}
         <div className="lg:col-span-3 space-y-3">
            {loading ? (
              <div className="py-20 text-center text-[#a1a1aa] text-sm animate-pulse">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-[#3f3f46] rounded-2xl">
                 <p className="text-[#a1a1aa] text-sm">No tasks assigned yet.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <Card key={task.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${task.status === 'done' ? 'opacity-50 bg-[#18181b]/50' : 'bg-[#18181b]'}`}>
                   <div className="flex items-start sm:items-center gap-4 flex-1">
                      <button 
                         onClick={() => toggleStatus(task.id, task.status)}
                         className={`w-5 h-5 mt-0.5 sm:mt-0 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                           task.status === 'done' 
                             ? 'bg-emerald-500 border-emerald-500 text-white' 
                             : task.status === 'doing'
                             ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-[#7c3aed]'
                             : 'bg-transparent border-[#3f3f46] hover:border-[#a1a1aa]'
                         }`}
                      >
                         {task.status === 'done' && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                         {task.status === 'doing' && <div className="w-1.5 h-1.5 rounded-sm bg-[#7c3aed]" />}
                      </button>
                      <div className="space-y-1">
                         <h4 className={`text-base font-medium ${task.status === 'done' ? 'text-[#a1a1aa] line-through' : 'text-[#fafafa]'}`}>
                            {task.title}
                         </h4>
                         <p className="text-xs text-[#a1a1aa] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3f3f46]" />
                            {task.workflows?.title}
                         </p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-4 pl-9 sm:pl-0">
                      <Badge status={task.status}>{task.status}</Badge>
                      <Button onClick={() => handleDelete(task.id)} variant="ghost" className="p-2 h-auto text-[#a1a1aa] hover:text-red-500 hover:bg-red-500/10" title="Delete Task">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </Button>
                   </div>
                </Card>
              ))
            )}
         </div>
      </div>
    </div>
  )
}
