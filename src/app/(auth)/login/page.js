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
    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#09090b] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-purple-400 shadow-2xl shadow-purple-500/20 mb-6">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter mb-2">Login Node</h1>
          <p className="text-sm text-zinc-500 font-medium">Identify yourself to access the KlyVora matrix.</p>
        </div>

        <Card className="p-10 border border-white/5 bg-[#12121a]/60 backdrop-blur-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-[10px] uppercase font-black tracking-widest text-center animate-fade-in shadow-lg shadow-danger/10">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
               <Input 
                 label="Neural Identifier" 
                 type="email" 
                 placeholder="user@klyvora.ai"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="bg-[#09090b]/50 border-white/5 focus:border-purple-500 h-12"
                 required
               />
               
               <Input 
                 label="Secure Protocol Key" 
                 type="password" 
                 placeholder="••••••••"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="bg-[#09090b]/50 border-white/5 focus:border-purple-500 h-12"
                 required
               />
            </div>
            
            <Button 
               type="submit" 
               className="w-full h-14 font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-purple-600/20" 
               isLoading={loading}
            >
               Authorize Node
            </Button>
            
            <div className="text-center pt-8 border-t border-white/5 mt-4">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">New Operator?</span>
              <div className="mt-4">
                <Link href="/register">
                   <Button variant="outline" className="w-full h-12 text-[10px] uppercase font-black tracking-[0.1em]">Create Account Matrix</Button>
                </Link>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
