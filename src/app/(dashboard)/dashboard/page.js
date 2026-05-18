'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { getClientSessionUser } from '@/lib/authClient'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ workflows: 0, tasks: 0, completed: 0, pro: false })
  const [recentItems, setRecentItems] = useState([])
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      setLoading(true)
      const user = await getClientSessionUser(supabase)
      if (!user) {
        setLoading(false)
        return
      }

      const [workflowRes, taskRes, subRes] = await Promise.all([
        supabase.from('workflows').select('id, title, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('tasks').select('id, title, status, created_at, workflows ( title )').order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('plan, status').eq('user_id', user.id).maybeSingle(),
      ])

      const completed = (taskRes.data || []).filter((task) => task.status === 'done').length
      setStats({
        workflows: workflowRes.data?.length || 0,
        tasks: taskRes.data?.length || 0,
        completed,
        pro: subRes.data?.plan === 'pro' && subRes.data?.status === 'active',
      })

      const activityFeed = [
        ...(workflowRes.data || []).slice(0, 2).map((item) => ({
          label: `Cluster created: ${item.title}`,
          meta: new Date(item.created_at).toLocaleDateString(),
          tone: 'cyan',
        })),
        ...(taskRes.data || []).slice(0, 3).map((item) => ({
          label: `Task updated: ${item.title}`,
          meta: item.workflows?.title || 'Unassigned',
          tone: item.status === 'done' ? 'emerald' : 'violet',
        })),
      ].slice(0, 5)

      setRecentItems(activityFeed)
      setLoading(false)
    }
    checkAuth()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-slate-400">
        <div className="glass-card w-full max-w-4xl rounded-[32px] p-8">
          <div className="mb-6 h-4 w-32 rounded-full bg-white/10 animate-shimmer" />
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 rounded-[24px] bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">Dashboard</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Command Center</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">A premium overview of clusters, tasks, activity, and your current Pro status.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/workflows"><Button variant="secondary">Create Cluster</Button></Link>
          <Link href="/generate"><Button>Generate with AI</Button></Link>
          <Link href="/tasks"><Button variant="secondary">Add Task</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-2">
        {[
          { label: 'Total Clusters', value: stats.workflows, tone: 'from-cyan-500 to-blue-600' },
          { label: 'Active Tasks', value: stats.tasks, tone: 'from-violet-500 to-fuchsia-500' },
          { label: 'Completed Tasks', value: stats.completed, tone: 'from-emerald-500 to-cyan-400' },
          { label: 'Pro Status', value: stats.pro ? 'Enabled' : 'Free', tone: 'from-slate-200 to-slate-400' },
        ].map((item) => (
          <Card key={item.label} className="rounded-[28px] p-5">
            <div className="text-[10px] uppercase tracking-[0.26em] text-slate-500">{item.label}</div>
            <div className={`mt-4 bg-gradient-to-r ${item.tone} bg-clip-text text-4xl font-semibold text-transparent`}>{item.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="rounded-[30px] p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Progress overview</div>
              <h2 className="mt-2 text-2xl font-semibold text-white">Execution health</h2>
            </div>
            <Badge status={stats.pro ? 'pro' : 'free'}>{stats.pro ? 'Pro active' : 'Free plan'}</Badge>
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-slate-400"><span>Task completion</span><span>{stats.tasks ? Math.round((stats.completed / stats.tasks) * 100) : 0}%</span></div>
              <div className="h-3 rounded-full bg-white/5">
                <div className="h-3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" style={{ width: `${stats.tasks ? Math.round((stats.completed / stats.tasks) * 100) : 0}%` }} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {['Cluster uptime', 'AI response time', 'Workflow stability'].map((label, index) => (
                <div key={label} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</div>
                  <div className="mt-3 text-2xl font-semibold text-white">{96 - index * 2}%</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="rounded-[30px] p-6">
          <div className="mb-4 text-xs uppercase tracking-[0.28em] text-slate-500">Recent activity</div>
          <div className="space-y-3">
            {recentItems.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">No recent activity yet.</div>
            ) : recentItems.map((item) => (
              <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.meta}</div>
                  </div>
                  <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.tone === 'emerald' ? 'bg-emerald-400' : item.tone === 'violet' ? 'bg-violet-400' : 'bg-cyan-400'}`} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[28px] p-6">
          <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Quick action</div>
          <h3 className="mt-3 text-xl font-semibold text-white">Create Cluster</h3>
          <p className="mt-2 text-sm text-slate-400">Start a new operational workspace in a single flow.</p>
        </Card>
        <Card className="rounded-[28px] p-6">
          <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Quick action</div>
          <h3 className="mt-3 text-xl font-semibold text-white">Generate with AI</h3>
          <p className="mt-2 text-sm text-slate-400">Synthesize a workflow from natural language instantly.</p>
        </Card>
        <Card className="rounded-[28px] p-6">
          <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Quick action</div>
          <h3 className="mt-3 text-xl font-semibold text-white">Add Task</h3>
          <p className="mt-2 text-sm text-slate-400">Capture a mission item and slot it into a cluster.</p>
        </Card>
      </div>
    </div>
  )
}
