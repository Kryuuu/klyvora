'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // 1. Sign In
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('[Login Error]:', authError)
      setError(authError.message)
      setLoading(false)
      return
    }

    const { user } = authData

    if (user) {
      console.log('[DEBUG] User logged in:', user.id)
      
      // 2. [SYNC CHECK] Ensure profile exists in DB
      // We upsert here to catch any legacy users who don't have a profile yet
      // This is crucial to prevent Foreign Key errors when they try to save workflows
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
           id: user.id, // Primary Key
           name: user.email.split('@')[0]
        }, { onConflict: 'id' })

      if (profileError) {
        console.warn('[Profile Sync Alarm]:', profileError.message)
        // We log it but don't block login, as the user is authenticated
      }

      router.push('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#0a0a0f]">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tighter text-white">
            Kly<span className="text-purple-500">Vora</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">AI Automation SaaS Engine</p>
        </div>

        <Card className="p-8 border-[#272737] bg-[#16161e] shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
                {error}
              </div>
            )}
            
            <Input 
              label="Account Identity" 
              labelClassName="text-gray-400 font-bold uppercase text-[10px] tracking-widest"
              type="email" 
              placeholder="user@klyvora.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input 
              label="Private Password" 
              labelClassName="text-gray-400 font-bold uppercase text-[10px] tracking-widest"
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-white hover:bg-white/90 text-black font-black text-sm uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]" 
              isLoading={loading}
            >
              Sign In to Terminal
            </Button>
            
            <p className="text-center text-sm text-gray-400 mt-6">
              New to the platform?{' '}
              <Link href="/register" className="text-purple-400 hover:text-purple-300 transition-colors font-bold">
                Create Account
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}
