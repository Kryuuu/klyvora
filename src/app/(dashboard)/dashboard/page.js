'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadSession() {
      setLoading(true)
      
      // 1. [SESSIONS] Check user session explicitly (getUser() is safer than getSession())
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        console.warn('[Session Guard] No active session, redirecting to login...')
        router.push('/login')
        return
      }

      console.log('[DEBUG] Active User Session:', user)
      setUser(user)

      // 2. Fetch profile from DB to ensure data integrity
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
         console.warn('[Profile Fetch Error]:', profileError)
      } else {
         console.log('[DEBUG] User Profile:', profileData)
         setProfile(profileData)
      }

      setLoading(false)
    }

    loadSession()
  }, [supabase, router])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('[Logout Error]:', error)
      alert("Failed to logout: " + error.message)
    } else {
      router.push('/login')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f14]">
        <div className="text-purple-500 animate-pulse text-xl font-bold">Initializing KlyVora...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-purple-500">{profile?.name || profile?.full_name || 'Innovator'}</span>
          </h1>
          <p className="text-gray-400">Authenticated as: {user?.email}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogout} 
          className="border-[#272737] hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-[#272737] bg-[#16161e]">
          <h3 className="text-lg font-bold text-white mb-4">Account Overview</h3>
          <div className="space-y-3">
             <div className="flex justify-between text-sm">
                <span className="text-gray-500 uppercase tracking-wider font-bold">Profile ID:</span>
                <span className="text-gray-300 font-mono text-[10px] sm:text-xs">{user?.id}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-gray-500 uppercase tracking-wider font-bold">Display Name:</span>
                <span className="text-gray-300">{profile?.name || profile?.full_name || 'Not set'}</span>
             </div>
          </div>
        </Card>

        {/* Feature Teaser */}
        <Card className="p-6 border-purple-500/20 bg-[#16161e] glow" glow>
           <h3 className="text-lg font-bold text-white mb-4">AI Workflows</h3>
           <p className="text-sm text-gray-400 mb-6">Create your first automated workflow with the power of Gemini.</p>
           <Button className="w-full bg-purple-600 hover:bg-purple-700">Create New Workflow</Button>
        </Card>
      </div>
    </div>
  )
}
