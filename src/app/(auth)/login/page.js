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
      setError('Neural link synchronization failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0f0f14] flex items-center justify-center p-6 font-sans relative overflow-hidden isolate">
      {/* 🌌 Atmospheric Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#7c3aed]/10 blur-[120px] rounded-full -z-10 animate-glow-flow" />

      <div className="w-full max-w-md space-y-8 animate-slide-up relative z-10">
        
        {/* Header: Immersive Branding */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-gradient-to-br from-[#7c3aed] to-[#a855f7] mb-4 shadow-2xl shadow-purple-500/20 group hover:rotate-6 transition-transform">
             <svg className="w-10 h-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
          <div className="space-y-2">
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Access Cluster</h1>
             <p className="text-sm text-[#a1a1aa] font-medium max-w-xs mx-auto">Authorize your credentials to enter the KlyVora automation workspace.</p>
          </div>
        </div>

        {/* Premium Form Card */}
        <Card className="border-[#3f3f46]/40 p-10 shadow-2xl bg-[#18181b]/60 backdrop-blur-xl rounded-[40px] relative overflow-hidden">
           {/* Decorative grid lines */}
           <div className="absolute inset-0 bg-dotted-grid opacity-5 pointer-events-none" />
           
           <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest text-center animate-shake">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[#a1a1aa] uppercase tracking-[0.2em] ml-1">Interface ID</label>
               <Input 
                 type="email" 
                 placeholder="name@neural.link"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="h-14 bg-[#0f0f14]/50 border-[#3f3f46] rounded-2xl focus:scale-[1.01] transition-transform placeholder:text-zinc-700"
                 required
               />
            </div>
            
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[#a1a1aa] uppercase tracking-[0.2em] ml-1">Access Key</label>
               <Input 
                 type="password" 
                 placeholder="••••••••"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="h-14 bg-[#0f0f14]/50 border-[#3f3f46] rounded-2xl focus:scale-[1.01] transition-transform placeholder:text-zinc-700"
                 required
               />
            </div>
            
            <Button 
               type="submit" 
               className="w-full h-14 font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-purple-500/20 mt-4 active:scale-95 transition-all" 
               isLoading={loading}
            >
               Initialize Link
            </Button>
          </form>
        </Card>
        
        {/* Alternative Actions */}
        <p className="text-center text-sm text-[#a1a1aa] mt-8 font-medium italic">
          New to the workspace?{' '}
          <Link href="/register" className="text-white font-black hover:text-[#7c3aed] transition-colors underline decoration-purple-500/30 underline-offset-8">
            Register Node
          </Link>
        </p>

      </div>
    </div>
  )
}
