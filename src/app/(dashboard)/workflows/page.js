'use client'

import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchWorkflows()
  }, [])

  async function fetchWorkflows() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setWorkflows(data)
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Workflows</h1>
          <p className="text-gray-400">Manage your active automation sequences.</p>
        </div>
        <Link href="/workflows/create" className="w-full sm:w-auto">
          <Button className="w-full">
            + Create Workflow
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="spinner border-purple-500/30 border-t-purple-500 w-10 h-10" />
        </div>
      ) : workflows.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-[#272737]">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">No workflows yet</h3>
          <p className="text-gray-400 mb-6 max-w-sm">Create your first automated workflow to start saving time.</p>
          <Link href="/workflows/create">
            <Button variant="secondary">Create your first workflow</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {workflows.map((wf) => (
            <Card key={wf.id} className="flex flex-col group transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <Badge status="default">
                  {wf.category || 'General'}
                </Badge>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/workflows/${wf.id}/edit`}>
                    <button className="text-gray-400 hover:text-purple-400 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </Link>
                  <button 
                    onClick={() => handleDelete(wf.id)}
                    className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <Link href={`/workflows/${wf.id}`}>
                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors cursor-pointer">{wf.tittle}</h3>
              </Link>
              <p className="text-gray-600 text-sm mb-6 flex-1">Category: {wf.category}</p>
              
              <div className="flex items-center justify-between text-xs pt-4 border-t border-[#272737]">
                <span className="text-gray-500">Created: {new Date(wf.created_at).toLocaleDateString()}</span>
                <span className="text-purple-500 flex items-center font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Active
                  <span className="w-2 h-2 ml-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
