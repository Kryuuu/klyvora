'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { getClientSessionUser } from '@/lib/authClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generatedData, setGeneratedData] = useState(null)
  const [isFreeLimit, setIsFreeLimit] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [showLimitModal, setShowLimitModal] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const templates = [
    { title: 'E-commerce', prompt: 'Build an automated ecommerce workflow with order handling, inventory sync, fulfillment, and customer notifications.' },
    { title: 'DevOps', prompt: 'Create a deployment workflow that covers commit validation, test execution, rollout, monitoring, and rollback readiness.' },
    { title: 'Content', prompt: 'Generate a content production system from research to drafting, publishing, distribution, and analytics review.' },
    { title: 'Startup', prompt: 'Design a lean startup execution workflow for launch planning, activation, growth tracking, and retention loops.' },
    { title: 'Personal Productivity', prompt: 'Assemble a personal operating system for prioritization, planning, deep work, and weekly review.' },
  ]

  useEffect(() => {
    async function checkSub() {
      setIsChecking(true)
      const user = await getClientSessionUser(supabase)
      if (!user) {
        setIsChecking(false)
        return
      }

      const { data: sub } = await supabase.from('subscriptions').select('plan, status').eq('user_id', user.id).maybeSingle()
      if (sub && sub.plan === 'pro' && sub.status === 'active') {
        setIsFreeLimit(false)
        setIsChecking(false)
        return
      }

      const { count } = await supabase.from('workflows').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      if (count && count >= 3) setIsFreeLimit(true)
      setIsChecking(false)
    }

    checkSub()
  }, [supabase])

  useEffect(() => {
    if (isFreeLimit) {
      setShowLimitModal(true)
    }
  }, [isFreeLimit])

  async function generateWorkflow(e) {
    if (e) e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)
    setGeneratedData(null)

    try {
      const user = await getClientSessionUser(supabase)
      if (!user) {
        setError('Your session is not ready. Refresh the page and try again.')
        return
      }

      await supabase.from('profiles').upsert({ id: user.id, name: user.email.split('@')[0] }, { onConflict: 'id' })

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed connecting to AI engine')

      const result = json
      const { data: newWf, error: wfError } = await supabase
        .from('workflows')
        .insert([{ user_id: user.id, title: result.title, category: 'AI Generated' }])
        .select()
        .single()

      if (wfError) throw wfError

      const taskInserts = result.tasks.map((taskTitle) => ({ workflow_id: newWf.id, title: taskTitle, status: 'todo' }))
      if (taskInserts.length > 0) await supabase.from('tasks').insert(taskInserts)

      if (result.debug?.tokens) {
        console.log('[AI DEBUG] Execution Token Usage:', result.debug.tokens)
      }

      setGeneratedData(result)
      setPrompt('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const applyTemplate = (templatePrompt) => {
    setPrompt(templatePrompt)
  }

  if (isChecking) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Card className="rounded-[30px] p-8 text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl border border-white/10 bg-white/[0.04] animate-pulse" />
          <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Accessing synthesis matrix</div>
        </Card>
      </div>
    )
  }

  if (isFreeLimit) {
    return (
      <>
        <Modal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          onConfirm={() => router.push('/subscription')}
          title="Free Limit Reached"
          message="Your free plan has reached its workflow capacity. Upgrade to Pro to continue generating and injecting workflows without interruption."
          confirmText="Upgrade Pro"
          cancelText="Later"
          variant="danger"
        />
        <Card className="mx-auto mt-8 max-w-3xl rounded-[34px] p-8 text-center sm:p-12">
          <Badge status="danger" className="mb-6">Matrix Cluster Full</Badge>
          <h2 className="text-4xl font-semibold tracking-tight text-white">Neural Capacity Reached</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">Your free tier is at maximum capacity. Upgrade to unlock unlimited workflow synthesis and priority neural processing.</p>
          <Link href="/subscription" className="mt-8 inline-flex">
            <Button className="h-12 px-6 text-xs font-semibold uppercase tracking-[0.22em]">Upgrade Access Protocol</Button>
          </Link>
        </Card>
      </>
    )
  }

  return (
    <div className="space-y-8 pb-8 animate-fade-in relative">
      <div className="absolute left-1/2 top-[-120px] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none" />

      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">AI synthesis</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Command Center</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Turn a prompt into a structured workflow, then inject it into your clusters with a polished premium interface.</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-400">
          Neural signal active
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <button
            key={template.title}
            onClick={() => applyTemplate(template.prompt)}
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-slate-300 transition-all hover:border-cyan-400/30 hover:bg-cyan-400/[0.06]"
          >
            {template.title}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[34px] p-0 overflow-hidden">
          <div className="border-b border-white/10 px-6 py-4">
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Prompt input</div>
          </div>
          <form onSubmit={generateWorkflow} className="flex flex-col">
            <textarea
              className="min-h-[360px] w-full resize-none bg-transparent px-6 py-6 text-base leading-7 text-white outline-none placeholder:text-slate-600"
              placeholder="Describe the workflow you want KlyVora to synthesize..."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              disabled={loading}
            />
            {error && <div className="mx-6 mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}
            <div className="border-t border-white/10 p-6">
              <Button type="submit" isLoading={loading} className="h-14 w-full text-xs font-semibold uppercase tracking-[0.28em]">
                Synthesize Workflow
              </Button>
            </div>
          </form>
        </Card>

        <Card className="rounded-[34px] p-0 overflow-hidden">
          <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Generated result</div>
              <div className="mt-1 text-lg font-medium text-white">AI output panel</div>
            </div>
            <Badge status={loading ? 'doing' : generatedData ? 'done' : 'neutral'}>{loading ? 'Generating' : generatedData ? 'Ready' : 'Idle'}</Badge>
          </div>

          <div className="min-h-[520px] p-6">
            {loading ? (
              <div className="flex h-full min-h-[460px] flex-col items-center justify-center text-center">
                <div className="relative mb-6 h-24 w-24 rounded-full border border-white/10">
                  <div className="absolute inset-4 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin" />
                  <div className="absolute inset-8 rounded-full bg-cyan-400/20 blur-md animate-pulse" />
                </div>
                <div className="text-2xl font-semibold text-white">Synthesis active</div>
                <div className="mt-2 text-xs uppercase tracking-[0.28em] text-slate-500">Constructing cluster geometry</div>
              </div>
            ) : generatedData ? (
              <div className="space-y-6">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Cluster title</div>
                  <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">{generatedData.title}</h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {generatedData.tasks.map((task, index) => (
                    <div key={index} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-[10px] uppercase tracking-[0.26em] text-slate-500">Node {String(index + 1).padStart(2, '0')}</div>
                      <div className="mt-3 text-sm leading-6 text-white">{task}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs uppercase tracking-[0.26em] text-slate-500">Your workflow has been inserted into the database.</p>
                    <div className="flex gap-3">
                      <Button variant="secondary" onClick={() => setGeneratedData(null)} className="h-11 px-5 text-[10px] font-semibold uppercase tracking-[0.22em]">New synthesis</Button>
                      <Link href="/workflows">
                        <Button className="h-11 px-5 text-[10px] font-semibold uppercase tracking-[0.22em]">Inject to Cluster</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-[30px] border border-dashed border-white/10 bg-white/[0.02] text-center">
                <div className="mb-6 h-20 w-20 rounded-[28px] border border-white/10 bg-white/[0.03] flex items-center justify-center">
                  <svg className="h-8 w-8 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-2xl font-semibold text-white">Neural Matrix ready</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">Pick a template or write your own objective. KlyVora will synthesize the workflow and save it to your cluster list.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
