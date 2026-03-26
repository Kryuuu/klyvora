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
    
    console.log('[DEBUG] Starting registration for:', email)

    // 1. Auth Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      console.error('[Auth Error]:', authError)
      setError(authError.message)
      setLoading(false)
      return
    }

    const { user } = authData

    if (user) {
      console.log('[DEBUG] User created, syncing profile...', user.id)
      
      // 2. [CRITICAL] AUTO-PROFILE UPSERT
      // To prevent FK errors on workflows, we ensure profile exists IMMEDIATELY
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, // Primary Key usually matches Auth UUID
          name: fullName || email.split('@')[0],
          created_at: new Date().toISOString()
        }, { onConflict: 'id' })

      if (profileError) {
        console.error('[Profile Error]:', profileError)
        setError("Account created, but profile sync failed: " + profileError.message)
        setLoading(false)
        return
      }

      console.log('[DEBUG] Profile successfully synced!')
      alert('Registration successful! Please check your email for confirmation.')
      router.push('/login')
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#0a0a0f]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Get Started <span className="text-purple-500 underline decoration-purple-500/30 underline-offset-8">KlyVora</span>
          </h1>
          <p className="text-gray-500 font-medium">Create your AI automation hub</p>
        </div>

        <Card className="p-8 border-[#272737] bg-[#16161e] shadow-[0_20px_50px_rgba(168,85,247,0.1)]">
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
                {error}
              </div>
            )}
            
            <Input 
              label="Full Name" 
              labelClassName="text-gray-400 font-bold uppercase text-[10px] tracking-widest"
              type="text" 
              placeholder="Elon Musk"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input 
              label="Email Address" 
              labelClassName="text-gray-400 font-bold uppercase text-[10px] tracking-widest"
              type="email" 
              placeholder="user@klyvora.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input 
              label="Secure Password" 
              labelClassName="text-gray-400 font-bold uppercase text-[10px] tracking-widest"
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(168,85,247,0.3)]" 
              isLoading={loading}
            >
              Initialize Account
            </Button>
            
            <p className="text-center text-sm text-gray-500 mt-8">
              Already using KlyVora?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-bold">
                Log In
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}
