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
      console.error('[Register Error Debug]:', authError)
      setError(authError.message)
      setLoading(false)
      return
    }

    const { user } = authData
    console.log('[Register Session Debug]:', user)

    if (user) {
      console.log('[SCHEMA SYNC] JIT Profile Sync for user:', user.id)
      
      // 2. [SYNC FIX] Profiles table (id, name, created_at)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: fullName || email.split('@')[0]
        }, { onConflict: 'id' })

      if (profileError) {
        console.error('[Profile Sync Error]:', profileError)
        setError("Account created, but profile failed: " + profileError.message)
        setLoading(false)
        return
      }

      alert('Registration successful! Please check your email.')
      router.push('/login')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#0a0a0f]">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create Account</h1>
          <p className="text-sm text-gray-400">Join KlyVora AI Workflow</p>
        </div>

        <Card className="p-8 border-[#1e1e2a] bg-[#16161e]">
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            
            <Input 
              label="Operator Name" 
              type="text" 
              placeholder="Name..."
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input 
              label="Email Address" 
              type="email" 
              placeholder="user@klyvora.ai"
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
              minLength={6}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold h-11" 
              isLoading={loading}
            >
              Sign Up
            </Button>
            
            <div className="text-center text-sm text-gray-400 mt-6 pt-6 border-t border-[#272737]">
              Already using KlyVora?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                Log In
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
