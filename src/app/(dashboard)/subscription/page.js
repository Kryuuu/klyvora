'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { createClient } from "@/lib/supabase/client"

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPlan, setCurrentPlan] = useState('checking')
  const supabase = createClient()

  useEffect(() => {
     async function loadPlan() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
             const { data: sub } = await supabase.from('subscriptions').select('plan, status').eq('user_id', user.id).maybeSingle()
             if (sub && sub.plan === 'pro' && sub.status === 'active') {
                 setCurrentPlan('pro')
             } else {
                 setCurrentPlan('free')
             }
        }
     }
     loadPlan()
  }, [])


  async function handleUpgrade() {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch('/api/payment', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Gateway connection failed')

      if (data.redirect_url) {
        // Arahkan PENGGUNA TERUS KE HALAMAN CHECKOUT MIDTRANS
        window.location.href = data.redirect_url
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge className="mb-4">Billing</Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Plans & Pricing</h1>
        <p className="text-gray-400">Upgrade to Pro to unlock advanced AI models and unlimited automated workflow runs.</p>
        
        {currentPlan !== 'checking' && (
            <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full border border-[#272737] bg-[#16161e]">
                <span className="text-gray-400 mr-2 text-sm">Account Level:</span>
                {currentPlan === 'pro' ? (
                    <span className="text-emerald-400 font-bold text-sm flex items-center"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> PRO Active</span>
                ) : (
                    <span className="text-gray-200 font-bold text-sm">Free Trial</span>
                )}
            </div>
        )}
        
        {error && (
            <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-md mx-auto">
               Payment initialization failed: {error}. Check Midtrans Server Key.
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="flex flex-col p-8 opacity-80">
          <div className="mb-4 text-2xl font-bold">Free</div>
          <div className="mb-6">
            <span className="text-4xl font-extrabold">$0</span>
            <span className="text-gray-500"> / mo</span>
          </div>
          <p className="text-gray-400 mb-8 border-b border-gray-800 pb-8 flex-1">
            Perfect to try out KlyVora basic features.
          </p>
          <ul className="space-y-4 text-sm text-gray-300 mb-8">
            <li className="flex items-center">
              <span className="mr-3 text-emerald-500">✓</span> 3 Workflows (Limit)
            </li>
            <li className="flex items-center">
              <span className="mr-3 text-emerald-500">✓</span> Free Standard Tasks
            </li>
            <li className="flex items-center text-gray-600">
              <span className="mr-3">✕</span> Unlimited Workflows unlocking
            </li>
          </ul>
          <Button variant="secondary" className="w-full" disabled>
            {currentPlan === 'free' ? '✓ Current Plan' : 'Free Tier'}
          </Button>
        </Card>

        <Card className="flex flex-col p-8 border-purple-500/30 relative overflow-hidden glow" glow>
          <div className="absolute top-0 right-0 bg-purple-600 text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
          <div className="mb-4 text-2xl font-bold text-white flex items-center">
            Pro
            <span className="ml-3 inline-flex items-center rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300">
              via Midtrans
            </span>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-extrabold gradient-text">Rp 49.000</span>
            <span className="text-gray-500"> / mo</span>
          </div>
          <p className="text-gray-400 mb-8 border-b border-gray-800 pb-8 flex-1">
            Build unconstrained automated AI pipelines.
          </p>
          <ul className="space-y-4 text-sm text-gray-300 mb-8">
            <li className="flex items-center">
              <span className="mr-3 text-emerald-500">✓</span> Unlimited AI Workflows
            </li>
            <li className="flex items-center">
              <span className="mr-3 text-emerald-500">✓</span> Unlimited Auto Tasks
            </li>
            <li className="flex items-center">
              <span className="mr-3 text-emerald-500">✓</span> Access to ALL AI Models
            </li>
          </ul>
          <Button 
            variant="primary" 
            className={`w-full text-lg ${currentPlan === 'pro' ? 'bg-emerald-600 hover:bg-emerald-600 text-white shadow-emerald-500/30 border-none' : 'shadow-[0_0_20px_rgba(168,85,247,0.4)]'}`}
            onClick={handleUpgrade}
            isLoading={loading}
            disabled={currentPlan === 'pro' || currentPlan === 'checking'}
          >
            {currentPlan === 'pro' ? '★ Pro Account Active' : (loading ? 'Connecting gateway...' : 'Upgrade Now')}
          </Button>
        </Card>
      </div>
    </div>
  )
}

function Badge({ children, className = '' }) {
    return (
      <span className={`inline-flex items-center rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-400 uppercase tracking-wider ${className}`}>
        {children}
      </span>
    )
}
