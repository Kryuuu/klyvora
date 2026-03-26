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
  const [success, setSuccess] = useState(false)
  
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
        data: {
          full_name: fullName,
        }
      }
    })

    if (authError) {
      console.error('[Register Error]:', authError)
      setError(authError.message)
      setLoading(false)
      return
    }

    const { user } = authData

    if (user) {
      console.log('[DEBUG] User registered:', user)
      
      // 2. [CORE FIX] Insert into PROFILES table to satisfy Foreign Key requirements
      // We upsert based on id/user_id to ensure no duplication
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, // Primary Key usually matches Auth UUID
          user_id: user.id, // Matching your requested schema
          full_name: fullName, // Existing columns in your DB
          name: fullName // Matching your requested schema
        })

      if (profileError) {
        console.error('[Profiles Sync Error]:', profileError)
        setError("Account created, but profile sync failed: " + profileError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#0f0f14]">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
            Join <span className="text-purple-500">KlyVora</span>
          </h1>
          <p className="text-gray-400">Build AI Workflows natively</p>
        </div>

        <Card className="p-8 border-[#272737] bg-[#16161e]">
          {success ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4 animate-bounce">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Done! Account Created</h3>
              <p className="text-gray-400 text-sm">Please check your email to confirm, then you can log in.</p>
              <Button onClick={() => router.push('/login')} className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                Proceed to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}
              
              <Input 
                label="Full Name" 
                labelClassName="text-gray-300"
                type="text" 
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-[#0f0f14] border-[#272737] text-white"
              />

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
                minLength={6}
                className="bg-[#0f0f14] border-[#272737] text-white"
              />
              
              <Button 
                type="submit" 
                className="w-full mt-6 bg-purple-600 hover:bg-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.3)]" 
                isLoading={loading}
              >
                Create Account
              </Button>
              
              <p className="text-center text-sm text-gray-400 mt-6">
                Already have an account?{' '}
                <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                  Log in
                </Link>
              </p>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
