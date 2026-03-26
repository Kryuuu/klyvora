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
      console.error('[Login Auth Error Debug]:', authError)
      setError(authError.message)
      setLoading(false)
      return
    }

    const { user } = authData
    console.log('[Login Session Debug]:', user)

    if (user) {
      // 2. [STRICT SYNC] Enforce Profile Sync before redirect
      // This ensures 'workflows_user_id_fkey' won't fail because the row already exists.
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
           id: user.id,
           name: user.email.split('@')[0]
        }, { onConflict: 'id' })

      if (profileError) {
         console.error('[STRICT SYNC ERROR]: Session authenticated but profile sync failed.', profileError)
         setError("Auth success, but Profile Sync failed: " + profileError.message + " (Check RLS Policies)")
         setLoading(false)
         return // CRITICAL: DO NOT REDIRECT
      }

      console.log('[STRICT SYNC SUCCESS]: Access to node authorized for', user.id)
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#0a0a0f]">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2 italic">Kly<span className="text-purple-500">Vora</span></h1>
          <p className="text-xs text-gray-600 font-bold uppercase tracking-[0.3em]">Matrix Terminal Interface</p>
        </div>

        <Card className="p-8 border-[#1e1e2a] bg-[#16161e] shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center leading-relaxed">
                {error}
              </div>
            )}
            
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
            />
            
            <Button 
               type="submit" 
               className="w-full bg-white hover:bg-white/90 text-black font-black text-xs uppercase tracking-[0.2em] h-12 transition-all shadow-[0_10px_20px_rgba(255,255,255,0.05)]" 
               isLoading={loading}
            >
               Authorize Node
            </Button>
            
            <div className="text-center text-[10px] text-gray-700 mt-6 pt-6 border-t border-[#1e1e2a] font-black uppercase tracking-widest">
              New Neural Node?{' '}
              <Link href="/register" className="text-purple-400 hover:text-purple-300 transition-colors">
                Register
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
