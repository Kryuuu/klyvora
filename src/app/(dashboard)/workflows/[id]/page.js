'use client'

import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { use } from 'react'
import { Button } from "@/components/ui/Button"

export default function WorkflowDetailsPage({ params }) {
  const unwrappedParams = use(params)
  const id = unwrappedParams.id

  const [workflow, setWorkflow] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchWorkflow() {
      const { data } = await supabase
        .from('workflows')
        .select(`
            *,
            tasks (*)
        `)
        .eq('id', id)
        .single()
      
      if (data) {
        setWorkflow(data)
      }
      setLoading(false)
    }
    fetchWorkflow()
  }, [id, supabase])

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/workflows">
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </Link>
          <div>
             {loading ? (
                <div className="h-8 w-48 bg-[#272737] blur-sm mt-1 animate-pulse rounded"></div>
             ) : (
                <h1 className="text-3xl font-bold tracking-tight mb-1">{workflow?.tittle || 'Workflow Details'}</h1>
             )}
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Dashboard / Workflows</span>
              {workflow && <Badge status="default">{workflow.category}</Badge>}
            </div>
          </div>
        </div>
      </div>

      {!loading && workflow && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <Card className="flex items-center p-6 border-l-4 border-l-emerald-500">
             <div className="flex-1">
                 <p className="text-emerald-400 text-sm font-bold uppercase mb-1">Generated Tasks</p>
                 <h2 className="text-3xl font-black">{workflow.tasks?.length || 0}</h2>
             </div>
             <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
             </div>
         </Card>
         <Card className="flex items-center p-6 border-l-4 border-l-purple-500">
             <div className="flex-1">
                 <p className="text-purple-400 text-sm font-bold uppercase mb-1">Completed</p>
                 <h2 className="text-3xl font-black">{workflow.tasks?.filter(t => t.status === 'done').length || 0}</h2>
             </div>
             <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
         </Card>
      </div>
      )}

      <Card className="!p-0 overflow-hidden border-[#272737]">
        <div className="p-6 border-b border-[#272737] bg-[#16161e]/50 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center">
               <svg className="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
               AI Generated Instructions
            </h2>
        </div>
        
        {loading ? (
           <div className="p-10 flex justify-center"><span className="spinner border-purple-500 w-8 h-8"/></div>
        ) : workflow?.tasks?.length > 0 ? (
           <ul className="divide-y divide-[#272737]">
             {workflow.tasks.map((task, i) => (
                <li key={task.id} className="p-6 hover:bg-white/5 transition-colors flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-black flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    {/* Handle custom schema tittle vs title for tasks as well */}
                    <h3 className="text-lg font-bold text-white mb-1">{task.tittle || task.title || 'Action Step'}</h3>
                    <p className="text-sm text-gray-400 mb-3">System generated intervention step.</p>
                    <Badge status={task.status}>{task.status}</Badge>
                  </div>
                </li>
             ))}
           </ul>
        ) : (
           <div className="p-12 text-center text-gray-500">
               No tasks generated string found for this workflow.
           </div>
        )}
      </Card>
      
    </div>
  )
}
