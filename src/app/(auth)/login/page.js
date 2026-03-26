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
      console.log('[DEBUG] User logged in:', user)
      
      // 2. [SYNC CHECK] Ensure profile exists in DB
      // We upsert here to catch any legacy users who don't have a profile yet
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
           id: user.id, // Primary Key
           user_id: user.id, // Matching schema req
           name: user.user_metadata?.full_name || 'Existing User'
        }, { onConflict: 'id' })

      if (profileError) {
        console.error('[Profile Sync Warning]:', profileError)
        // We don't necessarily block login, but log it
      }

      router.push('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#0f0f14]">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">
            Welcome back to <span className="text-purple-500">KlyVora</span>
          </h1>
          <p className="text-gray-400">Continue orchestrating your AI</p>
        </div>

        <Card className="p-8 border-[#272737] bg-[#16161e]">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            
            <Input 
              label="Email Address" 
              labelClassName="text-gray-300"
              type="email" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#0f0f14] border-[#272737] text-white"
            />
            
            <Input 
              label="Password" 
              labelClassName="text-gray-300"
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[#0f0f14] border-[#272737] text-white"
            />
            
            <Button 
              type="submit" 
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 shadow-[0_0_15px_rgba(189,85,247,0.3)]" 
              isLoading={loading}
            >
              Log In
            </Button>
            
            <p className="text-center text-sm text-gray-400 mt-6">
              New here?{' '}
              <Link href="/register" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                Create an account
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}
