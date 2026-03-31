'use client'

import { AppShell } from '@/components/AppShell'
import { createClient } from '@/lib/supabaseClient'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null)
  const [profileName, setProfileName] = useState('')
  const [plan, setPlan] = useState('free')
  const [isDev, setIsDev] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        if (user.email === process.env.NEXT_PUBLIC_DEVELOPER_EMAIL) setIsDev(true)

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
      <div className="flex h-screen items-center justify-center bg-slate-900 text-slate-400">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <AppShell userEmail={profileName} plan={plan} isDev={isDev}>
      {children}
    </AppShell>
  )
}
