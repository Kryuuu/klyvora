'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // 1. Auth Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })

    if (authError) {
      console.error('[Register Auth Error Debug]:', authError)
      setError(authError.message)
      setLoading(false)
      return
    }

    const { user } = authData
    console.log('[Register User Debug]:', user)

    if (user) {
      // 2. [STRICT SYNC] Enforce Profile Sync before redirect
      // This prevents 'workflows_user_id_fkey' violation in subsequent steps.
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: fullName || email.split('@')[0]
        }, { onConflict: 'id' })

      if (profileError) {
        console.error('[STRICT SYNC ERROR]: Profile synchronization failed.', profileError)
        setError("Account created, but Profile Sync failed: " + profileError.message + " (Check RLS Policies)")
        setLoading(false)
        return // CRITICAL: STOP HERE
      }

      console.log('[STRICT SYNC SUCCESS]: Profile created for', user.id)
      alert('Registration successful! Please check your email for confirmation.')
      router.push('/login')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#0a0a0f]">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 underline decoration-purple-500/20 underline-offset-8">New Operator</h1>
          <p className="text-sm text-gray-500 font-medium">Initialize your KlyVora node</p>
        </div>

        <Card className="p-8 border-[#1e1e2a] bg-[#16161e] shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center leading-relaxed">
                {error}
              </div>
            )}
            
            <Input 
              label="Operator Name" 
              type="text" 
              placeholder="Elon Musk"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input 
              label="Neural ID (Email)" 
              type="email" 
              placeholder="user@klyvora.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input 
              label="Secret Key (Password)" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 uppercase text-xs tracking-widest shadow-[0_10px_30px_rgba(168,85,247,0.2)]" 
              isLoading={loading}
            >
              Boot Sequence
            </Button>
            
            <div className="text-center text-xs text-gray-600 mt-6 pt-6 border-t border-[#1e1e2a] font-bold uppercase tracking-widest">
              Already Online?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                Authorize
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
