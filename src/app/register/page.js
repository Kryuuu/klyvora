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
    
    console.log('[SCHEMA SYNC] Registering:', email)

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
      console.log('[SCHEMA SYNC] Creating profile in DB...', user.id)
      
      // 2. [SYNC FIX] Following exact ERD schema: profiles(id, name)
      // Note: Column 'Create_at' is usually handled by DB default (with capital 'C').
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: fullName || email.split('@')[0]
        }, { onConflict: 'id' })

      if (profileError) {
        console.error('[Schema Error]:', profileError)
        setError("Account created, but profile sync failed: " + profileError.message)
        setLoading(false)
        return
      }

      console.log('[SCHEMA SYNC] Registration & Profile Ready!')
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
          <p className="text-gray-500 font-medium font-sans">Initialize your AI matrix operator</p>
        </div>

        <Card className="p-8 border-[#272737] bg-[#16161e] shadow-[0_20px_50px_rgba(168,85,247,0.1)]">
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold text-center">
                {error}
              </div>
            )}
            
            <Input 
              label="Operator Name" 
              labelClassName="text-gray-400 font-black uppercase text-[10px] tracking-widest"
              type="text" 
              placeholder="Name..."
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input 
              label="Neural ID (Email)" 
              labelClassName="text-gray-400 font-black uppercase text-[10px] tracking-widest"
              type="email" 
              placeholder="user@klyvora.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input 
              label="Master Key (Password)" 
              labelClassName="text-gray-400 font-black uppercase text-[10px] tracking-widest"
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(168,85,247,0.3)]" 
              isLoading={loading}
            >
              Boot Sequence
            </Button>
            
            <p className="text-center text-sm text-gray-500 mt-8 font-sans">
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
