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
      setError(authError.message)
      setLoading(false)
      return
    }

    const { user } = authData
    if (user) {
      // 2. Profile Sync
      await supabase.from('profiles').upsert({
         id: user.id,
         name: user.email.split('@')[0]
      }, { onConflict: 'id' })

      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#0a0a0f]">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">KlyVora AI</h1>
          <p className="text-sm text-gray-400">Sign in to your account to manage workflows</p>
        </div>

        <Card className="p-8 border-[#1e1e2a] bg-[#16161e]">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <Button 
               type="submit" 
               className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 h-11" 
               isLoading={loading}
            >
               Sign In
            </Button>
            
            <div className="text-center text-sm text-gray-400 mt-6 pt-6 border-t border-[#272737]">
              Don't have an account?{' '}
              <Link href="/register" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                Create Account
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
