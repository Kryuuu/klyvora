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
    <div className="min-h-screen w-full bg-[#0f0f14] flex items-center justify-center p-6 selection:bg-purple-500/30">
      
      <div className="w-full max-w-sm animate-page space-y-8">
        
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-purple-400 shadow-xl shadow-purple-500/10 mb-6">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-sm text-zinc-500 font-medium">Log in to your KlyVora account</p>
        </div>

        {/* Card Form (Glass Effect) */}
        <Card className="p-8 border-white/5 bg-zinc-900/30 backdrop-blur-2xl rounded-2xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold text-center animate-fade">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
               <Input 
                 label="Email Address" 
                 type="email" 
                 placeholder="name@cluster.ai"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="bg-black/20 border-white/5 h-12 rounded-xl focus:border-purple-500/50"
                 required
               />
               
               <Input 
                 label="Protocol Key" 
                 type="password" 
                 placeholder="••••••••"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="bg-black/20 border-white/5 h-12 rounded-xl focus:border-purple-500/50"
                 required
               />
            </div>
            
            <Button 
               type="submit" 
               className="w-full h-12 font-bold uppercase text-[11px] tracking-widest btn-premium shadow-lg shadow-purple-600/10" 
               isLoading={loading}
            >
               Sign In
            </Button>
            
            <div className="pt-8 border-t border-white/5 mt-4 flex items-center justify-center">
              <Link href="/register" className="text-xs font-bold text-zinc-500 hover:text-purple-400 transition-colors">
                New to KlyVora? <span className="underline decoration-purple-500/20 underline-offset-4 ml-1">Create Account</span>
              </Link>
            </div>
          </form>
        </Card>
        
        <p className="text-center text-[10px] text-zinc-700 font-bold uppercase tracking-widest">Neural Operational Matrix v2.4</p>
      </div>
    </div>
  )
}
