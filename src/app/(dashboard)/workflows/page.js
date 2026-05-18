'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabaseClient'
import { getClientSessionUser } from '@/lib/authClient'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([])
  const [taskStats, setTaskStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [initMode, setInitMode] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchWorkflows() {
      setLoading(true)
      const user = await getClientSessionUser(supabase)
      if (!user) {
        setLoading(false)
        return
      }

      const { data: workflowData } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const workflowIds = (workflowData || []).map((item) => item.id)
      let taskData = []

      if (workflowIds.length > 0) {
        const response = await supabase
          .from('tasks')
          .select('id, workflow_id, status')
          .in('workflow_id', workflowIds)
        taskData = response.data || []
      }

      const statsMap = (taskData || []).reduce((accumulator, task) => {
        if (!accumulator[task.workflow_id]) {
          accumulator[task.workflow_id] = { total: 0, done: 0, doing: 0 }
        }
        accumulator[task.workflow_id].total += 1
        if (task.status === 'done') accumulator[task.workflow_id].done += 1
        if (task.status === 'doing') accumulator[task.workflow_id].doing += 1
        return accumulator
      }, {})

      setWorkflows(workflowData || [])
      setTaskStats(statsMap)
      setLoading(false)
    }

    fetchWorkflows()
  }, [supabase])

  async function handleCreateWorkflow(e) {
    e.preventDefault()
    if (!newTitle.trim()) return

    setCreating(true)

    const user = await getClientSessionUser(supabase)
    if (!user) return

    const { data, error } = await supabase
      .from('workflows')
      .insert([{ user_id: user.id, title: newTitle }])
      .select()
      .single()

    if (!error) {
      setWorkflows([data, ...workflows])
      setNewTitle('')
      setShowCreateModal(false)
      setInitMode(null)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('klyvora:toast', { detail: { message: 'Cluster created successfully.', variant: 'success' } }))
      }
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('klyvora:toast', { detail: { message: 'Cluster creation failed.', variant: 'danger' } }))
    }

    setCreating(false)
  }

  async function handleDeleteWorkflow(id) {
    if (id) {
      setDeleteId(id)
      setShowDeleteModal(true)
      return
    }

    if (!deleteId) return

    try {
      const { error: tasksError } = await supabase.from('tasks').delete().eq('workflow_id', deleteId)
      if (tasksError) {
        alert('Failed to delete associated tasks before workflow deletion.')
        return
      }

      const { error } = await supabase.from('workflows').delete().eq('id', deleteId)
      if (error) {
        alert(`Failed to delete: ${error.message}`)
        return
      }

      setWorkflows((current) => current.filter((workflow) => workflow.id !== deleteId))
      setShowDeleteModal(false)
      setDeleteId(null)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('klyvora:toast', { detail: { message: 'Cluster deleted.', variant: 'success' } }))
      }
    } catch {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('klyvora:toast', { detail: { message: 'Could not delete cluster.', variant: 'danger' } }))
      }
      alert('An unexpected error occurred while deleting.')
    }
  }

  const filteredWorkflows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    if (!normalizedQuery) return workflows
    return workflows.filter((workflow) => workflow.title.toLowerCase().includes(normalizedQuery))
  }, [workflows, searchQuery])

  const resetInit = () => {
    setShowCreateModal(false)
    setInitMode(null)
    setNewTitle('')
  }

  return (
    <div className="space-y-8 animate-fade-in relative pb-10">
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeleteId(null)
        }}
        onConfirm={handleDeleteWorkflow}
        title="Delete Cluster"
        message="This will remove the workflow and its connected tasks. The action cannot be undone."
        confirmText="Delete Cluster"
        cancelText="Cancel"
        variant="danger"
      />

      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">Clusters</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Neural Workspace Grid</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Organize each operational cluster in a refined glass card layout with progress, status, and quick actions.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search clusters..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <Button
            onClick={showCreateModal ? resetInit : () => setShowCreateModal(true)}
            className="h-12 px-6 text-xs font-semibold uppercase tracking-[0.22em]"
          >
            {showCreateModal ? 'Close creator' : 'Create Cluster'}
          </Button>
        </div>
      </div>

      {showCreateModal && (
        <Card className="rounded-[32px] p-6 sm:p-8">
          {!initMode ? (
            <div className="space-y-6">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Initialization mode</div>
                <h2 className="mt-2 text-2xl font-semibold text-white">Choose how to build the cluster</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  onClick={() => setInitMode('manual')}
                  className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-left transition-all hover:border-cyan-400/30 hover:bg-cyan-400/[0.05]"
                >
                  <div className="mb-4 h-12 w-12 rounded-2xl bg-white/5" />
                  <div className="text-lg font-medium text-white">Manual Cluster</div>
                  <p className="mt-2 text-sm text-slate-400">Start with a custom title and build from scratch.</p>
                </button>
                <Link
                  href="/generate"
                  className="rounded-[28px] border border-cyan-400/20 bg-cyan-400/[0.06] p-6 text-left transition-all hover:border-cyan-400/40"
                >
                  <div className="mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600" />
                  <div className="text-lg font-medium text-white">AI Generator</div>
                  <p className="mt-2 text-sm text-slate-400">Use the synthesis engine to draft a structured workflow.</p>
                </Link>
              </div>
            </div>
          ) : (
            <div className="max-w-xl space-y-5">
              <button onClick={() => setInitMode(null)} className="text-xs uppercase tracking-[0.28em] text-slate-500 hover:text-white">Back</button>
              <form onSubmit={handleCreateWorkflow} className="space-y-4">
                <Input
                  label="Cluster label"
                  placeholder="e.g. Data Synthesis Alpha"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  required
                />
                <Button type="submit" isLoading={creating} className="h-12 px-6 text-xs font-semibold uppercase tracking-[0.22em]">
                  Register Cluster
                </Button>
              </form>
            </div>
          )}
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-72 rounded-[32px] bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <Card className="rounded-[32px] border border-dashed border-white/10 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <svg className="h-8 w-8 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
          <h2 className="text-2xl font-semibold text-white">No clusters yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">Create your first neural workspace cluster or use the AI generator to accelerate setup.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => setShowCreateModal(true)} className="h-12 px-6 text-xs font-semibold uppercase tracking-[0.22em]">Create Cluster</Button>
            <Link href="/generate"><Button variant="secondary" className="h-12 px-6 text-xs font-semibold uppercase tracking-[0.22em]">Open Generator</Button></Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredWorkflows.map((workflow) => {
            const stat = taskStats[workflow.id] || { total: 0, done: 0, doing: 0 }
            const progress = stat.total ? Math.round((stat.done / stat.total) * 100) : 0

            return (
              <Card key={workflow.id} className="group relative overflow-hidden rounded-[32px] p-0 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-white">
                        <Image src="/logo-klyvora.png" alt="KlyVora" width={28} height={28} className="h-7 w-7 object-contain" />
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Operational cluster</div>
                        <h3 className="mt-1 text-xl font-semibold text-white">{workflow.title}</h3>
                      </div>
                    </div>

                    <div className="relative">
                      <button onClick={() => setOpenMenuId(openMenuId === workflow.id ? null : workflow.id)} className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 text-slate-400 transition-colors hover:text-white">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6h.01M12 12h.01M12 18h.01" /></svg>
                      </button>
                      {openMenuId === workflow.id && (
                        <div className="absolute right-0 top-12 z-10 w-44 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
                          <Link href="/tasks" className="block rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">View tasks</Link>
                          <button onClick={() => handleDeleteWorkflow(workflow.id)} className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200">Delete cluster</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2">
                    <Badge status="operational">Operational</Badge>
                    <Badge status={stat.total ? 'doing' : 'neutral'}>{stat.total ? `${stat.total} tasks` : 'No tasks yet'}</Badge>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/5">
                      <div className="h-3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-3">
                        <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Completed</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{stat.done}</div>
                      </div>
                      <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-3">
                        <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">In motion</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{stat.doing}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Link href="/tasks" className="flex-1">
                      <Button variant="secondary" className="h-11 w-full text-xs font-semibold uppercase tracking-[0.22em]">Open tasks</Button>
                    </Link>
                    <Button onClick={() => handleDeleteWorkflow(workflow.id)} variant="danger" className="h-11 px-4 text-xs font-semibold uppercase tracking-[0.22em]">Delete</Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
