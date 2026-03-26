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
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        setSubscription(sub)
      }
      setChecking(false)
    }
    loadData()
  }, [supabase])

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()

      if (data.token) {
        // @ts-ignore
        window.snap.pay(data.token, {
          onSuccess: (result) => {
            console.log('Payment Success:', result)
            alert('Payment successful! Your PRO status will be activated shortly.')
            window.location.reload()
          },
          onPending: (result) => {
            console.log('Payment Pending:', result)
            alert('Payment pending. Please complete the transaction.')
          },
          onError: (result) => {
            console.error('Payment Error:', result)
            alert('Payment failed. Please try again.')
          },
          onClose: () => {
            console.log('Payment Popup Closed')
          }
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

  if (checking) {
    return <div className="flex justify-center p-20 font-black uppercase text-purple-500 tracking-widest animate-pulse">Checking Status...</div>
  }

  const isPro = subscription?.plan === 'pro' && subscription?.status === 'active'

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in p-4 lg:p-12">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl lg:text-6xl font-black text-white italic tracking-tighter uppercase">
          Pro <span className="text-purple-500">Access</span> Engine
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto font-medium">Unlock the full potential of KlyVora with unlimited AI generations and advanced operational routing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* Current Plan Card */}
        <Card className="p-8 border-[#272737] bg-[#16161e] border-l-4 border-l-purple-500 flex flex-col justify-between">
          <div>
            <Badge status={isPro ? 'done' : 'default'} className="mb-4 bg-purple-500/10 text-purple-400 border-none uppercase tracking-widest text-[9px] font-black">
              Current Terminal Status
            </Badge>
            <h2 className="text-3xl font-black text-white uppercase italic">{isPro ? 'Pro Active' : 'Free Operator'}</h2>
            <p className="text-gray-500 mt-4 text-sm leading-relaxed">
              {isPro 
                ? 'Your terminal is running with unlimited neural throughput. ALL systems are operational.' 
                : 'You are currently on the limited operator tier (3 active workflows max).'}
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-[#272737]">
            <span className="text-gray-600 uppercase text-[10px] font-black tracking-widest block mb-2">Authenticated Identity</span>
            <p className="text-xs text-gray-400 font-mono truncate">{user?.email}</p>
          </div>
        </Card>

        {/* Upgrade Card */}
        {!isPro && (
          <Card glow className="p-8 border-purple-500/30 bg-purple-500/5 glow shadow-2xl flex flex-col justify-between relative overflow-hidden" glow>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl"></div>
            <div>
              <div className="flex justify-between items-start mb-6">
                 <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Unlimited</h2>
                 <div className="text-right">
                    <span className="text-4xl font-black text-white italic">Rp49k</span>
                    <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-widest">Single Charge</span>
                 </div>
              </div>
              <ul className="space-y-4 mb-8">
                {['Unlimited Workflows', 'Full Gemini 2.0 Access', 'Pro-Tier Routing', 'Priority Node Execution'].map((feat, i) => (
                  <li key={i} className="flex items-center text-sm font-bold text-gray-300">
                    <svg className="w-4 h-4 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <Button 
               onClick={handleCheckout} 
               isLoading={loading} 
               className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white font-black uppercase text-xs tracking-[0.2em] shadow-[0_10px_30px_rgba(168,85,247,0.3)]"
            >
               Upgrade Operations
            </Button>
          </Card>
        )}

      </div>
      
      {/* Midtrans Scripts */}
      <script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} async></script>
    </div>
  )
}
