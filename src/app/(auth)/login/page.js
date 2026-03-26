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
    
    try {
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
        await supabase.from('profiles').upsert({ id: user.id, name: user.email.split('@')[0] }, { onConflict: 'id' })
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0f0f14] flex items-center justify-center p-6 animate-fade-in font-sans">
      <div className="w-full max-w-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#7c3aed] mb-4">
             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight">Log in to KlyVora</h1>
          <p className="text-sm text-[#a1a1aa]">Enter your details to access your timeline.</p>
        </div>

        {/* Clean Form Card */}
        <Card className="border-[#3f3f46] p-6 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm mb-4">
                {error}
              </div>
            )}
            
            <Input 
              label="Email address" 
              type="email" 
              placeholder="you@example.com"
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
               className="w-full font-semibold outline-none py-3 mt-2" 
               isLoading={loading}
            >
               Continue
            </Button>
          </form>
        </Card>
        
        {/* Footer */}
        <p className="text-center text-sm text-[#a1a1aa] mt-6">
          New to KlyVora?{' '}
          <Link href="/register" className="text-[#fafafa] font-medium hover:underline underline-offset-4 cursor-pointer">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  )
}
