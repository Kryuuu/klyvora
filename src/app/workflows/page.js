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

    // SCHEMA SYNC: table 'workflows' uses 'tittle'
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
    
    // Sync profile minimal (ERD: profiles has id, name)
    await supabase.from('profiles').upsert({
      id: user.id,
      name: user.email.split('@')[0]
    }, { onConflict: 'id' })

    // SCHEMA SYNC: table 'workflows' uses 'tittle'
    const { data, error } = await supabase
      .from('workflows')
      .insert([{
        user_id: user.id,
        tittle: newTitle, 
        category: newCategory
      }])
      .select()
      .single()

    if (error) {
      console.error('[Schema Conflict]: Workflow creation failed:', error.message)
      alert("Failed sync with DB: " + error.message)
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
    <div className="animate-fade-in pb-20 lg:pb-0 h-full max-w-7xl mx-auto space-y-12">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
        <div className="space-y-2">
           <Badge status="default" className="bg-purple-500/10 text-purple-400 border-none uppercase tracking-[.2em] text-[9px] font-black italic">Log Terminal</Badge>
           <h1 className="text-4xl lg:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
             Neural <span className="text-purple-500">Log</span>
           </h1>
           <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2 italic shadow-glow-text">Manage all created operational sequences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
         
         {/* Form Create */}
         <Card className="p-8 border-[#272737] bg-[#16161e] lg:sticky lg:top-8 shadow-2xl overflow-hidden relative border-t-4 border-t-purple-500">
            <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-8 italic">New Protocol</h3>
            <form onSubmit={handleCreateWorkflow} className="space-y-6">
               <Input 
                 label="Operation Name"
                 labelClassName="text-gray-700 uppercase text-[10px] font-black tracking-widest italic"
                 placeholder="Manual override title..."
                 value={newTitle}
                 onChange={(e) => setNewTitle(e.target.value)}
                 required
               />
               <Input 
                 label="Operation Category"
                 labelClassName="text-gray-700 uppercase text-[10px] font-black tracking-widest italic"
                 placeholder="Standard"
                 value={newCategory}
                 onChange={(e) => setNewCategory(e.target.value)}
                 required
               />
               <Button type="submit" isLoading={creating} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black h-14 uppercase text-xs tracking-[0.2em] shadow-[0_10px_30px_rgba(168,85,247,0.3)] mt-4">
                  Register Operation
               </Button>
            </form>
         </Card>

         {/* Workflows List */}
         <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex justify-center p-20 animate-pulse text-purple-500 font-black uppercase tracking-widest italic text-xs">Awaiting Signal...</div>
            ) : workflows.length === 0 ? (
              <Card className="p-16 text-center border-dashed border-[#272737] bg-transparent opacity-40 flex flex-col items-center">
                 <p className="text-gray-600 font-black text-lg italic tracking-[0.1em] uppercase">No active log found.</p>
                 <p className="text-[10px] text-gray-700 max-w-[300px] leading-relaxed mt-4 font-black uppercase tracking-widest">Awaiting manual or AI pulse injection.</p>
              </Card>
            ) : (
              workflows.map((wf) => (
                <Card key={wf.id} className="p-6 border-[#272737] bg-[#16161e] hover:bg-[#1a1a24] transition-all group flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-lg border-l-4 border-l-transparent hover:border-l-purple-500 gap-6">
                   <div className="space-y-2">
                      <Badge className="bg-purple-500/10 text-purple-400 border-none uppercase tracking-[0.1em] text-[8px] font-black">{wf.category || 'Standard'}</Badge>
                      <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter group-hover:text-purple-400 transition-colors leading-none">{wf.tittle}</h4>
                      <p className="text-[10px] text-gray-700 font-black tracking-[0.1em] uppercase mt-2 italic">Initialized: {new Date(wf.created_at).toLocaleDateString()}</p>
                   </div>
                   <div className="flex gap-4 w-full sm:w-auto">
                      <Link href={`/tasks`} className="flex-1">
                         <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest border-[#272737] h-10 hover:bg-white/5 transition-all italic">Tasks</Button>
                      </Link>
                      <Button onClick={() => handleDeleteWorkflow(wf.id)} variant="outline" className="flex-1 text-[10px] font-black uppercase tracking-widest border-[#272737] h-10 hover:bg-red-500/10 hover:text-red-500 transition-all italic">Purge</Button>
                   </div>
                </Card>
              ))
            )}
         </div>
      </div>
    </div>
  )
}
