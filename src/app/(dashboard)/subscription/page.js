'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'
import { createClient } from '@/lib/supabaseClient'
import { getClientSessionUser } from '@/lib/authClient'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [checking, setChecking] = useState(true)
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', variant: 'primary' })
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      setChecking(true)
      const user = await getClientSessionUser(supabase)
      if (user) {
        setUser(user)
        const { data: sub } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle()
        setSubscription(sub)
      }
      setChecking(false)
    }

    loadData()
  }, [supabase])

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payment', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      const data = await res.json()
      if (data.token) {
        if (!window.snap) {
          throw new Error('Payment script is still loading. Please try again in a moment.')
        }

        window.snap.pay(data.token, {
          onSuccess: () => {
            setModal({ isOpen: true, title: 'Payment Success', message: 'Your neural tiers have been expanded successfully.', variant: 'primary' })
            setTimeout(() => window.location.reload(), 2000)
          },
          onPending: () => {
            setModal({ isOpen: true, title: 'Payment Pending', message: 'The upgrade signal is still processing.', variant: 'primary' })
          },
          onError: () => {
            setModal({ isOpen: true, title: 'Expansion Failed', message: 'Could not verify the payment signal.', variant: 'danger' })
          },
          onClose: () => {},
        })
      } else {
        throw new Error(data.error || 'Failed to initialize payment')
      }
    } catch (err) {
      setModal({ isOpen: true, title: 'System Error', message: err.message, variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Card className="rounded-[30px] p-8 text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl border border-white/10 bg-white/[0.04] animate-pulse" />
          <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Verifying subscription</div>
        </Card>
      </div>
    )
  }

  const isPro = subscription?.plan === 'pro' && subscription?.status === 'active'

  const freeFeatures = ['3 active clusters', 'Standard AI synthesis', 'Community support']
  const proFeatures = ['Unlimited operational clusters', 'Priority neural processing', 'Full integration support', 'Advanced command center layouts']

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-8 animate-fade-in">
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        confirmText="Acknowledge"
      />

      <div className="text-center space-y-4">
        <Badge status="pro">Neural tier selection</Badge>
        <h1 className="text-5xl font-semibold tracking-tight text-white">Upgrade to Pro</h1>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-400">Unlock a more powerful KlyVora workspace with unlimited clusters, priority processing, and full integration support.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[34px] p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Current status</div>
              <h2 className="mt-2 text-3xl font-semibold text-white">{isPro ? 'Pro Operator' : 'Free Operator'}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">Your current plan determines how many clusters you can operate and which synthesis features remain available.</p>
            </div>
            <Badge status={isPro ? 'done' : 'neutral'}>{isPro ? 'Pro active' : 'Free plan'}</Badge>
          </div>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Logged identity</div>
            <div className="mt-2 truncate text-lg text-white">{user?.email}</div>
          </div>

          <div className="mt-8 space-y-3">
            {freeFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                {feature}
              </div>
            ))}
          </div>
        </Card>

        <Card className="relative overflow-hidden rounded-[34px] p-8 border-cyan-400/20 bg-cyan-400/[0.05]">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-[80px]" />
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">Pro plan</div>
                <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white">Unlimited</h2>
                <p className="mt-2 text-sm text-slate-400">Everything you need for a premium operational workspace.</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-semibold text-white">Rp49k</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.26em] text-slate-500">One-time upgrade</div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {proFeatures.map((feature) => (
                <div key={feature} className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  {feature}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleCheckout} isLoading={loading} className="h-14 flex-1 text-xs font-semibold uppercase tracking-[0.22em]">
                {isPro ? 'Plan already active' : 'Upgrade to Pro'}
              </Button>
              <div className="flex-1 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-xs uppercase tracking-[0.24em] text-slate-500">
                Priority neural processing and unlimited operational clusters.
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-[34px] p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Comparison</div>
            <h3 className="mt-2 text-2xl font-semibold text-white">Free vs Pro</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
              <div className="text-lg font-medium text-white">Free</div>
              <div className="mt-3 text-3xl font-semibold text-white">$0</div>
              <div className="mt-4 space-y-2 text-sm text-slate-400">
                <div>3 operational clusters</div>
                <div>Standard synthesis speed</div>
                <div>Basic support</div>
              </div>
            </div>
            <div className="rounded-[26px] border border-cyan-400/20 bg-cyan-400/[0.06] p-5">
              <div className="text-lg font-medium text-white">Pro</div>
              <div className="mt-3 text-3xl font-semibold text-white">Rp49k</div>
              <div className="mt-4 space-y-2 text-sm text-slate-200">
                <div>Unlimited operational clusters</div>
                <div>Priority neural processing</div>
                <div>Full integration support</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />
    </div>
  )
}
