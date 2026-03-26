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
       console.error('[Workflow Error]:', error)
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

    // Ensure Profile Sync minimal
    await supabase.from('profiles').upsert({ id: user.id, name: user.email.split('@')[0] }, { onConflict: 'id' })

    const { data, error } = await supabase
      .from('workflows')
      .insert([{
        user_id: user.id,
        tittle: newTitle, // DB column: tittle
        category: newCategory
      }])
      .select()
      .single()

    if (!error) {
      setWorkflows([data, ...workflows])
      setNewTitle('')
      setNewCategory('Standard')
    }
    setCreating(false)
  }

  async function handleDeleteWorkflow(id) {
    if (!confirm('Are you sure you want to delete this workflow?')) return
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id)

    if (!error) {
      setWorkflows(workflows.filter(w => w.id !== id))
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Workflows Log</h1>
          <p className="text-sm text-gray-400">Manage all automated sequences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
         <Card className="p-6 border-[#1e1e2a] bg-[#16161e]">
            <h3 className="text-sm font-bold text-white mb-6">New Workflow</h3>
            <form onSubmit={handleCreateWorkflow} className="space-y-4">
               <Input 
                 label="Workflow Title"
                 placeholder="Pulse Sequence X"
                 value={newTitle}
                 onChange={(e) => setNewTitle(e.target.value)}
                 required
               />
               <Input 
                 label="Category"
                 placeholder="Standard"
                 value={newCategory}
                 onChange={(e) => setNewCategory(e.target.value)}
                 required
               />
               <Button type="submit" isLoading={creating} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold h-11">
                  Create Pulse
               </Button>
            </form>
         </Card>

         <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="p-8 text-gray-500 font-medium italic">Loading signals...</div>
            ) : workflows.length === 0 ? (
              <div className="p-16 text-center rounded-xl border-2 border-dashed border-[#1e1e2a] opacity-50 flex flex-col items-center">
                 <p className="text-gray-500 font-medium">No active signals in the current cluster.</p>
              </div>
            ) : (
              workflows.map((wf) => (
                <Card key={wf.id} className="p-5 border-[#1e1e2a] bg-[#16161e] flex justify-between items-center group">
                   <div>
                      <Badge className="bg-purple-500/10 text-purple-400 border-none mb-3 block w-max uppercase tracking-widest text-[8px] font-bold">{wf.category || 'Standard'}</Badge>
                      <h4 className="text-lg font-bold text-white">{wf.tittle}</h4>
                   </div>
                   <div className="flex gap-2">
                      <Link href={`/tasks`}>
                         <Button variant="outline" className="text-xs h-8 border-[#272737] hover:bg-white/5 px-4 font-bold">Tasks</Button>
                      </Link>
                      <Button onClick={() => handleDeleteWorkflow(wf.id)} variant="outline" className="text-xs h-8 border-[#272737] hover:bg-red-500/10 hover:text-red-500 px-4 font-bold transition-all">Delete</Button>
                   </div>
                </Card>
              ))
            )}
         </div>
      </div>
    </div>
  )
}
