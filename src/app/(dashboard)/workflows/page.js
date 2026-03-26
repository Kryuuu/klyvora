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
  const [creating, setCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchWorkflows()
  }, [])

  async function fetchWorkflows() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase.from('workflows').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setWorkflows(data || [])
    setLoading(false)
  }

  async function handleCreateWorkflow(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('workflows').insert([{ user_id: user.id, title: newTitle }]).select().single()

    if (!error) {
      setWorkflows([data, ...workflows])
      setNewTitle('')
      setShowCreateModal(false)
    }
    setCreating(false)
  }

  async function handleDeleteWorkflow(id) {
    if (!confirm('Are you sure you want to delete this sequence?')) return
    
    try {
      const { error } = await supabase.from('workflows').delete().eq('id', id)
      
      if (error) {
        console.error('Delete error:', error)
        alert(`Failed to delete: ${error.message}. Please check if there are tasks linked to this workflow.`)
        return
      }
      
      setWorkflows(workflows.filter(w => w.id !== id))
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred while deleting.')
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#fafafa]">Workflows</h1>
          <p className="text-[#a1a1aa] text-sm mt-1">Manage and monitor your automated sequences.</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(!showCreateModal)}
          className="whitespace-nowrap w-full sm:w-auto text-sm"
        >
          {showCreateModal ? 'Cancel' : '+ New Workflow'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Inline Creation Card */}
         {showCreateModal && (
            <Card className="animate-fade-in border-[#7c3aed]/50 bg-[#18181b]">
               <h3 className="text-sm font-semibold text-[#fafafa] mb-4">Create Workflow</h3>
               <form onSubmit={handleCreateWorkflow} className="space-y-4">
                  <Input 
                    label="Title" 
                    placeholder="E.g. Daily Data Sync" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    required 
                  />
                  <Button type="submit" isLoading={creating} className="w-full text-sm">
                     Create
                  </Button>
               </form>
            </Card>
         )}

         {/* Workflows Grid Collection */}
         {loading ? (
           <div className="col-span-full py-20 text-center text-[#a1a1aa] text-sm animate-pulse">Loading workflows...</div>
         ) : workflows.length === 0 ? (
           <div className="col-span-full py-24 text-center border border-dashed border-[#3f3f46] rounded-2xl flex flex-col items-center">
              <p className="text-[#a1a1aa] text-sm mb-4">No workflows found. Create your first one!</p>
              <Button onClick={() => setShowCreateModal(true)} variant="outline" className="text-sm">
                 + Create Workflow
              </Button>
           </div>
         ) : (
           workflows.map((wf) => (
             <Card key={wf.id} className="flex flex-col justify-between p-6">
                <div>
                   <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[#27272a] flex items-center justify-center text-[#7c3aed]">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <Badge status="done">Active</Badge>
                   </div>
                   
                   <h4 className="text-lg font-semibold text-[#fafafa] truncate mb-1">{wf.title}</h4>
                   <p className="text-xs text-[#a1a1aa]">{new Date(wf.created_at).toLocaleDateString()}</p>
                </div>

                <div className="mt-6 flex gap-2">
                   <Link href="/tasks" className="flex-1">
                      <Button variant="secondary" className="w-full text-sm">
                         View Tasks
                      </Button>
                   </Link>
                   <Button 
                      onClick={() => handleDeleteWorkflow(wf.id)} 
                      variant="ghost" 
                      className="text-[#a1a1aa] hover:text-red-500 hover:bg-red-500/10"
                      title="Delete"
                   >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </Button>
                </div>
             </Card>
           ))
         )}
      </div>
    </div>
  )
}
