'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [checking, setChecking] = useState(true)
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
          onSuccess: (result) => { alert('Payment successful!'); window.location.reload() },
          onPending: (result) => { alert('Payment pending.') },
          onError: (result) => { alert('Payment failed.') },
          onClose: () => { console.log('Snap Closed') }
        })
      } else {
        throw new Error(data.error || 'Failed to initialize payment')
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (checking) return <div className="p-8 text-gray-500 font-medium">Verifying Neural Subscription...</div>

  const isPro = subscription?.plan === 'pro' && subscription?.status === 'active'

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Pro Access Engine</h1>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">Upgrade to the pro-tier to unlock unlimited neural throughput.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card className="p-8 border-[#1e1e2a] bg-[#16161e] border-l-4 border-l-purple-500 flex flex-col justify-between h-full min-h-[300px]">
          <div>
            <Badge status={isPro ? 'done' : 'default'} className="mb-6 bg-purple-500/10 text-purple-400 border-none font-bold text-[10px]">Current Status</Badge>
            <h2 className="text-3xl font-bold text-white mb-4 uppercase tracking-tighter">{isPro ? 'Pro Operator' : 'Free Operator'}</h2>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">Your account is currently running on the limited operator tier (3 workflows max).</p>
          </div>
          <div className="mt-8 pt-6 border-t border-[#1e1e2a] flex flex-col space-y-1">
             <span className="text-[10px] text-gray-700 font-black uppercase tracking-widest leading-none">Identity Linked</span>
             <p className="text-xs text-gray-400 font-mono italic opacity-50 truncate">{user?.email}</p>
          </div>
        </Card>

        {!isPro ? (
          <Card className="p-8 border-purple-500/30 bg-purple-500/5 shadow-2xl flex flex-col justify-between h-full min-h-[300px]">
             <div>
                <div className="flex justify-between items-start mb-8">
                   <h2 className="text-2xl font-bold text-white italic tracking-tighter uppercase">Unlimited</h2>
                   <div className="text-right">
                      <span className="text-2xl font-black text-white italic">Rp49k</span>
                      <span className="text-[10px] text-gray-600 block font-bold uppercase tracking-widest mt-1">Single Charge</span>
                   </div>
                </div>
                <ul className="space-y-3 mb-10">
                  {['Unlimited Workflows', 'Full Gemini 2.0 Logic', 'Priority Signal Response', 'Operational Node Log'].map((feat, i) => (
                    <li key={i} className="flex items-center text-xs font-bold text-gray-400">
                      <svg className="w-4 h-4 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      {feat}
                    </li>
                  ))}
                </ul>
             </div>
             <Button onClick={handleCheckout} isLoading={loading} className="w-full bg-purple-600 hover:bg-purple-700 h-14 font-black uppercase text-xs tracking-widest shadow-[0_10px_30px_rgba(168,85,247,0.3)]">
                Upgrade Operation Node
             </Button>
          </Card>
        ) : (
          <Card className="p-8 border-emerald-500/20 bg-emerald-500/5 shadow-2xl h-full flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                 <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Maximum Capacity Active</h3>
             <p className="text-sm text-gray-500 font-medium">Your cluster is currently running at unlimited operational capacity.</p>
          </Card>
        )}
      </div>

      <script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} async></script>
    </div>
  )
}
