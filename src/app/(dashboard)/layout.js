'use client'

import { AppShell } from '@/components/AppShell'
import { createClient } from '@/lib/supabaseClient'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null)
  const [profileName, setProfileName] = useState('')
  const [plan, setPlan] = useState('free')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        // Fetch Profile & Plan in Parallel
        const [profRes, subRes] = await Promise.all([
           supabase.from('profiles').select('name').eq('id', user.id).maybeSingle(),
           supabase.from('subscriptions').select('plan, status').eq('user_id', user.id).maybeSingle()
        ])

        if (profRes.data?.name) setProfileName(profRes.data.name)
        else setProfileName(user.email.split('@')[0])

        if (subRes.data && subRes.data.plan === 'pro' && subRes.data.status === 'active') {
          setPlan('pro')
        }
      } else {
        router.push('/login')
      }
      setLoading(false)
    }
    checkUser()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0f] text-purple-500 font-medium animate-pulse uppercase tracking-[0.2em] text-xs">
        Initializing Secure Connection...
      </div>
    )
  }

  if (!user) return null

  return (
    <AppShell userEmail={profileName} plan={plan}>
      {children}
    </AppShell>
  )
}
