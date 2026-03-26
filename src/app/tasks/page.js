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
  const [newTaskTitle, setNewTaskTitle] = useState('')
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

    // 1. Fetch Operations (Workflows) to populate dropdown
    const { data: wfs } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', user.id)
      .order('tittle', { ascending: true })

    if (wfs) {
       setWorkflows(wfs)
       if (wfs.length > 0) setSelectedWorkflowId(wfs[0].id)
    }

    // 2. Fetch Tasks with Workflow Join (Using tittle)
    const { data: ts, error: tsErr } = await supabase
      .from('tasks')
      .select(`
        *,
        workflows!inner ( tittle, user_id )
      `)
      .eq('workflows.user_id', user.id)
      .order('created_at', { ascending: false })

    if (tsErr) {
       console.error('[Task Fetch Error]:', tsErr)
    } else {
       setTasks(ts || [])
    }
    setLoading(false)
  }

  async function handleCreateTask(e) {
    e.preventDefault()
    if (!newTaskTitle.trim() || !selectedWorkflowId) return
    
    setCreating(true)
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        workflow_id: selectedWorkflowId,
        tittle: newTaskTitle, // Using 'tittle' as per DB
        status: 'todo',
        created_at: new Date().toISOString()
      }])
      .select(`
        *,
        workflows!inner ( tittle, user_id )
      `)
      .single()

    if (error) {
       console.error('[Task Creation Error]:', error)
       alert("Failed to create task: " + error.message)
    } else {
       setTasks([data, ...tasks])
       setNewTaskTitle('')
    }
    setCreating(false)
  }

  async function handleUpdateStatus(id, currentStatus) {
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
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) {
      setTasks(tasks.filter(t => t.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 lg:p-12 space-y-12 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <Link href="/dashboard" className="text-purple-400 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">&larr; Back to Command Center</Link>
           <h1 className="text-4xl lg:text-5xl font-black text-white mt-4 italic">
             Task <span className="text-purple-500">Matrix</span>
           </h1>
           <p className="text-gray-500 font-medium">Coordinate manual interventions across active operational clusters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
         
         {/* Task Creation Form */}
         <Card className="p-8 border-[#272737] bg-[#16161e] lg:sticky lg:top-8 shadow-2xl overflow-hidden relative border-t-4 border-t-purple-500">
            <h3 className="text-sm font-black text-purple-400 uppercase tracking-[.2em] mb-6">Append Objective</h3>
            <form onSubmit={handleCreateTask} className="space-y-6">
               <div className="space-y-2">
                 <label className="text-gray-600 uppercase text-[10px] font-black tracking-widest block pl-1">Operational Cluster</label>
                 <select 
                   className="w-full bg-[#0f0f14] border border-[#272737] rounded-xl text-white px-4 h-12 text-sm focus:outline-none focus:border-purple-500 appearance-none"
                   value={selectedWorkflowId}
                   onChange={(e) => setSelectedWorkflowId(e.target.value)}
                   required
                 >
                   {workflows.map(wf => (
                     <option key={wf.id} value={wf.id}>{wf.tittle}</option>
                   ))}
                 </select>
               </div>
               
               <Input 
                 label="Task Objective"
                 labelClassName="text-gray-600 uppercase text-[10px] font-black tracking-widest"
                 placeholder="E.g. Confirm email verification"
                 value={newTaskTitle}
                 onChange={(e) => setNewTaskTitle(e.target.value)}
                 required
                 className="bg-[#0f0f14] border-[#272737] text-white h-12 rounded-xl focus:border-purple-500"
               />
               
               <Button type="submit" isLoading={creating} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black h-12 uppercase text-xs tracking-widest shadow-[0_10px_30px_rgba(168,85,247,0.3)]">
                  Inject Task
               </Button>
            </form>
         </Card>

         {/* Tasks Feed */}
         <div className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="flex justify-center p-20"><span className="animate-pulse text-purple-500 font-black uppercase tracking-widest">Scanning Log...</span></div>
            ) : tasks.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-[#272737] bg-transparent opacity-50 flex flex-col items-center">
                 <p className="text-gray-600 font-bold mb-4 italic text-lg">"The Matrix Is Clean. No Pending Tasks."</p>
                 <p className="text-xs text-gray-700 max-w-[350px] leading-relaxed">Generated tasks from the neural engine will appear here. You can manually inject a task using the side panel.</p>
              </Card>
            ) : (
              tasks.map((t, idx) => (
                <Card key={idx} className="p-4 sm:p-6 border-[#272737] bg-[#16161e]/80 hover:bg-[#16161e] transition-all group shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                   <div className="flex items-start gap-4 flex-1">
                      <div className={`w-10 h-10 rounded shrink-0 flex items-center justify-center font-black text-xs border transition-colors ${t.status === 'done' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-[#0f0f14] text-gray-600 border-[#272737]'}`}>
                         {idx + 1}
                      </div>
                      <div>
                         <Badge className="bg-purple-500/10 text-purple-400 border-none uppercase tracking-[0.1em] text-[8px] mb-2">{t.workflows?.tittle || 'No Cluster'}</Badge>
                         <h4 className={`text-xl font-bold transition-all ${t.status === 'done' ? 'text-gray-600 line-through italic' : 'text-white'}`}>{t.tittle}</h4>
                         <p className="text-[10px] text-gray-700 mt-2 uppercase font-black tracking-widest">Added on {new Date(t.created_at).toLocaleString()}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-3 self-end sm:self-center">
                      <Button 
                        onClick={() => handleUpdateStatus(t.id, t.status)} 
                        variant="link" 
                        className={`text-[10px] font-black uppercase tracking-widest p-0 h-auto ${t.status === 'done' ? 'text-gray-600 hover:text-white' : 'text-emerald-500 hover:text-emerald-400'}`}
                      >
                         {t.status === 'done' ? 'Unlock Output' : 'Resolve Task'}
                      </Button>
                      <Button onClick={() => handleDeleteTask(t.id)} variant="outline" className="text-[10px] font-black border-[#272737] px-3 h-8 hover:bg-red-500/10 hover:text-red-500 text-gray-500 transition-colors">X</Button>
                   </div>
                </Card>
              ))
            )}
         </div>
      </div>
    </div>
  )
}
