'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"

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
      const { data: { user } } = await supabase.auth.getUser()
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
        // @ts-ignore
        window.snap.pay(data.token, {
          onSuccess: (result) => { 
            setModal({ isOpen: true, title: 'Payment Success', message: 'Mission accomplished. Your neural tiers have been expanded.', variant: 'primary' });
            setTimeout(() => window.location.reload(), 2000);
          },
          onPending: (result) => { 
            setModal({ isOpen: true, title: 'Payment Pending', message: 'Expansion signal is being processed. Please wait.', variant: 'primary' });
          },
          onError: (result) => { 
            setModal({ isOpen: true, title: 'Expansion Failed', message: 'Mission failed. Could not verify expansion signal.', variant: 'danger' });
          },
          onClose: () => { console.log('Snap Closed') }
        })
      } else {
        throw new Error(data.error || 'Failed to initialize payment')
      }
    } catch (err) {
      setModal({ isOpen: true, title: 'System Error', message: err.message, variant: 'danger' });
    } finally {
      setLoading(false)
    }
  }

  if (checking) return <div className="p-8 text-zinc-500 font-black uppercase tracking-[0.4em] text-xs animate-pulse italic">Verifying Neural Subscription...</div>

  const isPro = subscription?.plan === 'pro' && subscription?.status === 'active'

  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-slide-up pb-24">
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
        <Badge className="bg-purple-500/10 text-purple-400 border-none px-6 py-2 font-black italic tracking-[0.2em] text-[10px]">Neural Tier Selection</Badge>
        <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase underline decoration-purple-500/20 underline-offset-[12px]">Pro Access Engine</h1>
        <p className="text-zinc-500 max-w-lg mx-auto font-medium italic">Upgrade to the pro-tier to unlock unlimited neural throughput across all clusters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
        <Card className="p-10 border-white/5 bg-[#0a0a0f] border-t-4 border-t-purple-500 flex flex-col justify-between h-full min-h-[400px] shadow-2xl">
          <div className="space-y-8">
            <div className="space-y-2">
               <Badge status={isPro ? 'done' : 'default'} className="px-4 font-black uppercase tracking-widest text-[9px]">Identity Verification</Badge>
               <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{isPro ? 'Pro Operator' : 'Free Operator'}</h2>
            </div>
            <p className="text-zinc-500 leading-relaxed font-medium italic opacity-80">Your neural node is currently restricted to the Level-1 Operator tier (Max 3 Active Clusters). Upgrade to expand throughput.</p>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col space-y-2">
             <span className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.3em] leading-none">Logged Identifier</span>
             <p className="text-xs text-white font-black italic opacity-50 truncate tracking-tight">{user?.email}</p>
          </div>
        </Card>

        {!isPro ? (
          <Card className="p-10 border-purple-500/20 bg-purple-600/5 shadow-3xl shadow-purple-600/10 flex flex-col justify-between h-full min-h-[400px] relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full translate-x-12 translate-y-[-12px] group-hover:bg-purple-600/20 transition-all duration-700" />
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                   <div>
                      <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1">Unlimited</h2>
                      <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Protocol Expansion</p>
                   </div>
                   <div className="text-right">
                      <span className="text-4xl font-black text-white italic tracking-tighter underline decoration-purple-500/40">Rp49k</span>
                      <span className="text-[9px] text-zinc-600 block font-black uppercase tracking-widest mt-2 italic">Standard Single Charge</span>
                   </div>
                </div>
                <ul className="space-y-5 mb-12">
                  {['Unlimited Neural Clusters', 'Access to Gemini 2.0 Force', 'Priority Signal Response', 'Full Operational Audit Log'].map((feat, i) => (
                    <li key={i} className="flex items-center text-xs font-black italic text-zinc-400 uppercase tracking-tight">
                      <div className="w-5 h-5 rounded-lg bg-purple-500/20 flex items-center justify-center mr-4">
                         <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>
             </div>
             <Button onClick={handleCheckout} isLoading={loading} className="w-full h-16 bg-purple-500 hover:bg-purple-600 font-black uppercase text-xs tracking-[0.3em] shadow-purple-600/30 italic">
                Initialize Expansion Signal
             </Button>
          </Card>
        ) : (
          <Card className="p-12 border-emerald-500/20 bg-emerald-500/5 shadow-2xl h-full flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 rounded-[32px] bg-emerald-500/10 flex items-center justify-center mb-10 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                 <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
             </div>
             <h3 className="text-3xl font-black text-white mb-4 italic tracking-tighter uppercase italic">Maximum Capacity: ONLINE</h3>
             <p className="text-sm text-zinc-600 font-medium italic max-w-xs mx-auto">Your neural cluster is currently running at unlimited operational capacity. All protocols are unrestricted.</p>
          </Card>
        )}
      </div>

      <script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} async></script>
    </div>
  )
}
