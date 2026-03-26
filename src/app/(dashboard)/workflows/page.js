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
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('[Workflows Check User]:', user)
    if (authError || !user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
       console.error('[Workflows Fetch Error Debug]:', error)
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
    if (!user) return

    // 1. [STRICT SYNC] Ensure Profile exists before Insert
    // This is the CRITICAL FIX for 'workflows_user_id_fkey' violation.
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, name: user.email.split('@')[0] }, { onConflict: 'id' })

    if (profileError) {
       console.error('[STRICT SYNC ERROR]: Workflow creation aborted because profile sync failed.', profileError)
       alert("Profile Sync Failed: " + profileError.message + " Workflow cannot be created.")
       setCreating(false)
       return // STOP
    }

    // 2. [SYNC FIX] Insert Workflow (using title column)
    const { data, error } = await supabase
      .from('workflows')
      .insert([{
        user_id: user.id,
        title: newTitle, 
        category: newCategory
      }])
      .select()
      .single()

    if (error) {
      console.error('[Workflow Create Error Debug]:', error)
      alert("Workflow DB Sync Failed: " + error.message)
    } else {
      console.log('[Workflow Create Success Debug]:', data)
      setWorkflows([data, ...workflows])
      setNewTitle('')
      setNewCategory('Standard')
    }
    setCreating(false)
  }

  async function handleDeleteWorkflow(id) {
    if (!confirm('Are you sure you want to delete this sequence?')) return
    const { error } = await supabase.from('workflows').delete().eq('id', id)
    if (!error) setWorkflows(workflows.filter(w => w.id !== id))
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-center px-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">Workflows Log</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
         <Card className="p-6 border-[#1e1e2a] bg-[#16161e]">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-6">Create New Protocol</h3>
            <form onSubmit={handleCreateWorkflow} className="space-y-4">
               <Input label="Title" placeholder="Pulse Sequence X" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
               <Input label="Category" placeholder="Standard" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} required />
               <Button type="submit" isLoading={creating} className="w-full bg-purple-600 hover:bg-purple-700 h-11 font-bold">
                  Register Pulse
               </Button>
            </form>
         </Card>

         <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="p-8 text-gray-500 font-medium italic">Loading telemetry...</div>
            ) : workflows.length === 0 ? (
              <div className="p-16 text-center rounded-xl border-dashed border-2 border-[#1e1e2a] opacity-50 font-bold uppercase tracking-widest text-xs text-gray-700">No active signals found.</div>
            ) : (
              workflows.map((wf) => (
                <Card key={wf.id} className="p-5 border-[#1e1e2a] bg-[#16161e] flex justify-between items-center group shadow-md hover:border-purple-500/20 transition-all">
                   <div>
                      <Badge className="bg-purple-500/10 text-purple-400 border-none mb-3 block w-max uppercase tracking-widest text-[8px] font-bold">{wf.category || 'Standard'}</Badge>
                      <h4 className="text-lg font-bold text-white italic tracking-tight uppercase">{wf.title}</h4>
                   </div>
                   <div className="flex gap-2">
                      <Link href={`/tasks`}>
                         <Button variant="outline" className="text-xs h-8 px-4 font-bold border-[#272737]">Tasks</Button>
                      </Link>
                      <Button onClick={() => handleDeleteWorkflow(wf.id)} variant="outline" className="text-xs h-8 px-4 font-bold border-[#272737] hover:border-red-500/10">Delete</Button>
                   </div>
                </Card>
              ))
            )}
         </div>
      </div>
    </div>
  )
}
