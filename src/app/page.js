'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

export default function Home() {
  const router = useRouter()

  const features = [
    {
      title: 'AI Synthesis Engine',
      description: 'Generate structured workflows and operational clusters from a single prompt.',
    },
    {
      title: 'Clusters',
      description: 'Organize projects into elegant neural workspaces with real-time visibility.',
    },
    {
      title: 'Tasks',
      description: 'Track mission progress with a clean execution board built for speed.',
    },
    {
      title: 'Goals',
      description: 'Keep objectives aligned across teams with a focused command surface.',
    },
    {
      title: 'Upgrade Pro',
      description: 'Unlock unlimited operational clusters and priority processing capacity.',
    },
  ]

  const faqs = [
    {
      question: 'Does KlyVora change my backend workflow?',
      answer: 'No. This redesign only touches the frontend presentation, layout, and component styling.',
    },
    {
      question: 'Can I still use Supabase, Midtrans, and AI routes as before?',
      answer: 'Yes. The current auth, payment, and API routes remain intact and are not rewritten here.',
    },
    {
      question: 'Is the dashboard responsive?',
      answer: 'Yes. The shell, cards, and page sections are adapted for mobile, tablet, and desktop.',
    },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-dotted-grid opacity-30 pointer-events-none" />
      <div className="absolute left-1/2 top-0 h-[680px] w-[680px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[120px] animate-glow-pulse pointer-events-none" />
      <div className="absolute right-0 top-40 h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-[110px] animate-float pointer-events-none" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between gap-10">
        <section className="grid items-center gap-10 pb-12 pt-6 lg:grid-cols-[1.1fr_0.9fr] lg:pb-0 lg:pt-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-300 backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
              Neural workspace orchestrator
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Orchestrate Your Workflow with Neural Precision
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                KlyVora is an AI-powered workflow workspace for clusters, tasks, goals, synthesis, and Pro upgrades. Shape operations in a premium glass interface designed for modern product teams.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => router.push('/register')} className="h-14 px-8 text-sm font-semibold uppercase tracking-[0.22em]">
                Get Started
              </Button>
              <Button variant="secondary" onClick={() => router.push('/login')} className="h-14 px-8 text-sm font-semibold uppercase tracking-[0.18em]">
                View Demo / Explore Features
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {['AI workflow generation', 'Glass dashboard UI', 'Mobile-first workflow control'].map((item) => (
                <div key={item} className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-300 backdrop-blur-xl">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Card className="relative overflow-hidden rounded-[34px] p-0">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Dashboard Preview</div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Live orchestration mockup</div>
                </div>
                <Badge status="doing">Live</Badge>
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'Clusters', value: '18', accent: 'from-cyan-500 to-blue-600' },
                  { label: 'Active Tasks', value: '42', accent: 'from-violet-500 to-fuchsia-500' },
                  { label: 'Goals', value: '09', accent: 'from-emerald-500 to-cyan-400' },
                  { label: 'Pro Status', value: 'Online', accent: 'from-slate-200 to-slate-400' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[10px] uppercase tracking-[0.26em] text-slate-500">{stat.label}</div>
                    <div className={`mt-3 bg-gradient-to-r ${stat.accent} bg-clip-text text-3xl font-semibold text-transparent`}>{stat.value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-4">
                <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
                  <span>Progress Overview</span>
                  <span>78%</span>
                </div>
                <div className="space-y-3">
                  {[78, 64, 52].map((value, index) => (
                    <div key={index} className="h-3 rounded-full bg-white/5">
                      <div className="h-3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 animate-shimmer" style={{ width: `${value}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section id="features" className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-300">Product features</div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Built for neural operations.</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-400">Everything is tuned for a premium SaaS feel: fast scanning cards, clear hierarchy, light motion, and an intentional dark glass aesthetic.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="rounded-[30px] p-6 transition-transform duration-300 hover:-translate-y-1">
                <div className="mb-4 h-11 w-11 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-400/20 to-violet-500/20" />
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-[30px] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Pricing preview</div>
                <h3 className="mt-2 text-2xl font-semibold text-white">Free vs Pro</h3>
              </div>
              <Badge status="pro">Recommended</Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                <div className="text-sm font-medium text-white">Free</div>
                <div className="mt-3 text-3xl font-semibold text-white">$0</div>
                <ul className="mt-4 space-y-2 text-sm text-slate-400">
                  <li>Up to 3 operational clusters</li>
                  <li>Core AI synthesis</li>
                  <li>Standard support</li>
                </ul>
              </div>
              <div className="rounded-[26px] border border-cyan-400/20 bg-cyan-400/[0.06] p-5 shadow-[0_0_0_1px_rgba(34,211,238,0.08)]">
                <div className="text-sm font-medium text-white">Pro</div>
                <div className="mt-3 text-3xl font-semibold text-white">Rp49k</div>
                <ul className="mt-4 space-y-2 text-sm text-slate-300">
                  <li>Unlimited operational clusters</li>
                  <li>Priority neural processing</li>
                  <li>Full integration support</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="rounded-[30px] p-6">
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">FAQ</div>
            <div className="mt-4 space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-base font-medium text-white">{faq.question}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <footer className="pb-10 pt-4">
          <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-lg font-semibold text-white">KlyVora</div>
              <div className="text-sm text-slate-500">Neural workspace orchestration for modern teams.</div>
            </div>
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Premium SaaS dashboard experience</div>
          </div>
        </footer>
      </div>
    </main>
  )
}