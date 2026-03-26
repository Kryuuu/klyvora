'use client'

import { AppShell } from '@/components/AppShell'
import { createClient } from '@/lib/supabaseClient'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      // 1. [MANDATORY] Session check using auth.getUser()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      console.log('[Dashboard Ssession Check]:', user)
      if (error) console.error('[Dashboard Session Error]:', error)

      if (!user) {
        console.warn('[Session Shield]: Redirecting to /login')
        router.push('/login')
      } else {
        setUser(user)
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
    <AppShell userEmail={user.email}>
      {children}
    </AppShell>
  )
}
