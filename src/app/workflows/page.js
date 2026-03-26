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
  const [newCategory, setNewCategory] = useState('Standard')
  const [creating, setCreating] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchWorkflows()
  }, [])

  async function fetchWorkflows() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Workflow Fetch Error]:', error)
    } else {
      setWorkflows(data || [])
    }
    setLoading(false)
  }

  async function handleCreateWorkflow(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    // 1. [SYNC CHECK] Ensue profile exists before inserting workflow (FK Safety)
    await supabase.from('profiles').upsert({
      id: user.id,
      name: user.email.split('@')[0]
    }, { onConflict: 'id' })

    // 2. Insert Workflow
    const { data, error } = await supabase
      .from('workflows')
      .insert([{
        user_id: user.id,
        tittle: newTitle, // Using 'tittle' as per current DB schema
        category: newCategory,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('[Workflow Creation Error]:', error)
      alert("Failed to create workflow: " + error.message)
    } else {
      setWorkflows([data, ...workflows])
      setNewTitle('')
      setNewCategory('Standard')
    }
    setCreating(false)
  }

  async function handleDeleteWorkflow(id) {
    if (!confirm('Are you sure you want to delete this sequence?')) return
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id)

    if (!error) {
      setWorkflows(workflows.filter(w => w.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 lg:p-12 space-y-12 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <Link href="/dashboard" className="text-purple-400 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">&larr; Back to Command Center</Link>
           <h1 className="text-4xl lg:text-5xl font-black text-white mt-4 italic">
             Operational <span className="text-purple-500">Log</span>
           </h1>
           <p className="text-gray-500 font-medium">Manage and deploy automated sequences natively.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
         
         {/* Creation Form */}
         <Card className="p-8 border-[#272737] bg-[#16161e] lg:sticky lg:top-8 shadow-2xl overflow-hidden relative border-t-4 border-t-purple-500">
            <h3 className="text-sm font-black text-purple-400 uppercase tracking-[.2em] mb-6">Initiate Sequence</h3>
            <form onSubmit={handleCreateWorkflow} className="space-y-6">
               <Input 
                 label="Operation Name"
                 labelClassName="text-gray-600 uppercase text-[10px] font-black tracking-widest"
                 placeholder="E.g. SaaS Onboarding Flow"
                 value={newTitle}
                 onChange={(e) => setNewTitle(e.target.value)}
                 required
                 className="bg-[#0f0f14] border-[#272737] text-white h-12 rounded-xl focus:border-purple-500"
               />
               <Input 
                 label="Operation Category"
                 labelClassName="text-gray-600 uppercase text-[10px] font-black tracking-widest"
                 placeholder="E.g. AI Automation"
                 value={newCategory}
                 onChange={(e) => setNewCategory(e.target.value)}
                 required
                 className="bg-[#0f0f14] border-[#272737] text-white h-12 rounded-xl focus:border-purple-500"
               />
               <Button type="submit" isLoading={creating} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black h-12 uppercase text-xs tracking-widest shadow-[0_10px_30px_rgba(168,85,247,0.3)]">
                  Register Operation
               </Button>
            </form>
         </Card>

         {/* Workflows List */}
         <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex justify-center p-20"><span className="animate-pulse text-purple-500 font-black uppercase tracking-widest">Scanning Log...</span></div>
            ) : workflows.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-[#272737] bg-transparent opacity-50 flex flex-col items-center">
                 <p className="text-gray-600 font-bold mb-4 italic text-lg">"The Log Is Empty. Awaiting Neural Input."</p>
                 <p className="text-xs text-gray-700 max-w-[300px] leading-relaxed">No data detected in the workflow table. Use the form on the left to initiate a sequence.</p>
              </Card>
            ) : (
              workflows.map((wf) => (
                <Card key={wf.id} className="p-6 border-[#272737] bg-[#16161e]/80 hover:bg-[#16161e] transition-all group flex justify-between items-center shadow-lg hover:shadow-purple-500/10 active:scale-[0.99] cursor-default">
                   <div>
                      <Badge status="default" className="mb-3 bg-purple-500/10 text-purple-400 border-none uppercase tracking-[0.1em] text-[9px]">{wf.category || 'Standard'}</Badge>
                      <h4 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{wf.tittle}</h4>
                      <p className="text-xs text-gray-600 mt-2">Initialized on {new Date(wf.created_at).toLocaleString()}</p>
                   </div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/tasks`}>
                         <Button variant="outline" className="text-[10px] font-black uppercase tracking-widest border-[#272737] h-8 hover:bg-white/5 transition-colors">Tasks</Button>
                      </Link>
                      <Button onClick={() => handleDeleteWorkflow(wf.id)} variant="outline" className="text-[10px] font-black uppercase tracking-widest border-[#272737] h-8 hover:bg-red-500/10 hover:text-red-500 transition-colors">Delete</Button>
                   </div>
                </Card>
              ))
            )}
         </div>
      </div>
    </div>
  )
}
