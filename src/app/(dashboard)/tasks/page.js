'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { getClientSessionUser } from '@/lib/authClient'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

const statusColumns = [
  { key: 'todo', label: 'Normal', tone: 'slate' },
  { key: 'doing', label: 'Operational', tone: 'cyan' },
  { key: 'done', label: 'Mission Completed', tone: 'emerald' },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('')
  const [creating, setCreating] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const user = await getClientSessionUser(supabase)
      if (!user) {
        setLoading(false)
        return
      }

      const { data: wfData } = await supabase.from('workflows').select('id, title, created_at').eq('user_id', user.id).order('created_at', { ascending: false })
      setWorkflows(wfData || [])
      if (wfData?.length > 0) setSelectedWorkflowId(wfData[0].id)

      const { data: taskData } = await supabase.from('tasks').select('*, workflows ( title )').order('created_at', { ascending: false })
      setTasks(taskData || [])
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  async function handleCreateTask(e) {
    e.preventDefault()
    if (!newTitle.trim() || !selectedWorkflowId) return

    setCreating(true)

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ workflow_id: selectedWorkflowId, title: newTitle, status: 'todo' }])
      .select('*, workflows ( title )')
      .single()

    if (!error) {
      setTasks([data, ...tasks])
      setNewTitle('')
      setShowAddForm(false)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('klyvora:toast', { detail: { message: 'Task created successfully.', variant: 'success' } }))
      }
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('klyvora:toast', { detail: { message: 'Task creation failed.', variant: 'danger' } }))
    }

    setCreating(false)
  }

  async function toggleStatus(id, current) {
    const next = current === 'todo' ? 'doing' : current === 'doing' ? 'done' : 'todo'
    const { error } = await supabase.from('tasks').update({ status: next }).eq('id', id)
    if (!error) setTasks(tasks.map((task) => (task.id === id ? { ...task, status: next } : task)))
  }

  async function handleDelete(id) {
    if (id) {
      setDeleteId(id)
      setShowDeleteModal(true)
      return
    }

    if (!deleteId) return
    const { error } = await supabase.from('tasks').delete().eq('id', deleteId)
    if (!error) {
      setTasks(tasks.filter((task) => task.id !== deleteId))
      setShowDeleteModal(false)
      setDeleteId(null)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('klyvora:toast', { detail: { message: 'Task deleted.', variant: 'success' } }))
      }
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('klyvora:toast', { detail: { message: 'Could not delete task.', variant: 'danger' } }))
    }
  }

  const groupedTasks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const filteredTasks = normalizedQuery
      ? tasks.filter((task) => `${task.title} ${task.workflows?.title || ''}`.toLowerCase().includes(normalizedQuery))
      : tasks

    return statusColumns.reduce((accumulator, column) => {
      accumulator[column.key] = filteredTasks.filter((task) => task.status === column.key)
      return accumulator
    }, {})
  }, [tasks, searchQuery])

  const totals = {
    all: tasks.length,
    todo: tasks.filter((task) => task.status === 'todo').length,
    doing: tasks.filter((task) => task.status === 'doing').length,
    done: tasks.filter((task) => task.status === 'done').length,
  }

  return (
    <div className="space-y-8 animate-fade-in relative pb-10">
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeleteId(null)
        }}
        onConfirm={handleDelete}
        title="Delete Mission"
        message="This removes the task from the board permanently. Continue?"
        confirmText="Delete Task"
        variant="danger"
      />

      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">Tasks</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Mission Board</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Track operational nodes in a clean Kanban surface without changing the existing status update logic.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="w-full sm:w-72">
            <Input placeholder="Search tasks or clusters..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
          </div>
          <Button onClick={() => setShowAddForm((value) => !value)} className="h-12 px-6 text-xs font-semibold uppercase tracking-[0.22em]">
            {showAddForm ? 'Close form' : 'Add Task'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'All', value: totals.all },
          { label: 'Normal', value: totals.todo },
          { label: 'Operational', value: totals.doing },
          { label: 'Mission Completed', value: totals.done },
        ].map((item) => (
          <Card key={item.label} className="rounded-[28px] p-5">
            <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{item.label}</div>
            <div className="mt-3 text-3xl font-semibold text-white">{item.value}</div>
          </Card>
        ))}
      </div>

      {showAddForm && (
        <Card className="rounded-[32px] p-6 sm:p-8">
          <div className="mb-4 text-xs uppercase tracking-[0.28em] text-slate-500">Create new mission</div>
          <form onSubmit={handleCreateTask} className="grid gap-4 md:grid-cols-[0.7fr_1.3fr_auto] md:items-end">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Cluster</label>
              <select
                value={selectedWorkflowId}
                onChange={(event) => setSelectedWorkflowId(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none transition-all focus:border-cyan-400/40"
                required
              >
                {workflows.map((workflow) => (
                  <option key={workflow.id} value={workflow.id}>{workflow.title}</option>
                ))}
              </select>
            </div>

            <Input
              label="Mission objective"
              placeholder="e.g. Map JSON response data"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              required
            />

            <Button type="submit" isLoading={creating} className="h-12 px-6 text-xs font-semibold uppercase tracking-[0.22em]">
              Register Task
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="min-h-[420px] rounded-[32px] bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {statusColumns.map((column) => (
            <Card key={column.key} className="flex min-h-[520px] flex-col rounded-[32px] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">{column.label}</div>
                  <h2 className="mt-2 text-xl font-semibold text-white">{groupedTasks[column.key].length} items</h2>
                </div>
                <Badge status={column.key === 'done' ? 'done' : column.key === 'doing' ? 'doing' : 'neutral'}>
                  {column.label}
                </Badge>
              </div>

              <div className="flex-1 space-y-3">
                {groupedTasks[column.key].length === 0 ? (
                  <div className="flex h-full min-h-[240px] items-center justify-center rounded-[24px] border border-dashed border-white/10 px-6 text-center text-sm text-slate-500">
                    No missions in this lane.
                  </div>
                ) : groupedTasks[column.key].map((task) => (
                  <div key={task.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-white/20">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => toggleStatus(task.id, task.status)}
                        className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-all ${task.status === 'done' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : task.status === 'doing' ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200' : 'border-white/10 bg-white/[0.03] text-slate-300'}`}
                        title="Toggle status"
                      >
                        {task.status === 'done' ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        ) : task.status === 'doing' ? (
                          <span className="h-2.5 w-2.5 rounded-full bg-current" />
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge status={task.status === 'done' ? 'done' : task.status === 'doing' ? 'doing' : 'neutral'}>
                            {task.status === 'done' ? 'Mission Completed' : task.status === 'doing' ? 'Operational' : 'Normal'}
                          </Badge>
                          <Badge status="neutral">Priority standard</Badge>
                        </div>
                        <h3 className={`mt-3 text-base font-medium ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-white'}`}>{task.title}</h3>
                        <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">{task.workflows?.title || 'Unassigned cluster'}</div>
                        <div className="mt-2 text-xs text-slate-500">
                          Due date: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleDelete(task.id)}
                        variant="ghost"
                        className="h-10 w-10 shrink-0 p-0 text-slate-500 hover:text-red-300"
                        title="Delete task"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
