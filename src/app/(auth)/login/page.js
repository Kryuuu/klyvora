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
      setError('An unexpected error occurred during neural authorization.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#09090b] flex items-center justify-center p-6 selection:bg-purple-500/30">
      
      <div className="w-full max-w-md animate-fade-in divide-y divide-white/5">
        
        {/* Header Section */}
        <div className="text-center pb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-purple-400 shadow-xl shadow-purple-500/20 mb-2">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Login</h1>
          <p className="text-sm text-zinc-500 font-medium italic">Login to your KlyVora account</p>
        </div>

        {/* Card Form */}
        <div className="pt-8 px-2">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[10px] uppercase font-black tracking-widest text-center animate-fade-in">
                {error}
              </div>
            )}
            
            <div className="space-y-5">
               <Input 
                 label="Neural Identifier" 
                 type="email" 
                 placeholder="name@cluster.ai"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="bg-black/40 border-white/5 h-12 rounded-xl focus:border-purple-500/50"
                 required
               />
               
               <Input 
                 label="Secure Protocol Key" 
                 type="password" 
                 placeholder="••••••••"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="bg-black/40 border-white/5 h-12 rounded-xl focus:border-purple-500/50"
                 required
               />
            </div>
            
            <Button 
               type="submit" 
               className="w-full h-14 font-black uppercase text-xs tracking-[0.2em] italic shadow-lg shadow-purple-600/20" 
               isLoading={loading}
            >
               Authorize Node
            </Button>
            
            <div className="relative py-4 flex items-center justify-center">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
               <span className="relative bg-[#09090b] px-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">External Link</span>
            </div>

            <div className="text-center">
              <Link href="/register">
                 <Button variant="ghost" className="text-xs font-black text-zinc-500 hover:text-purple-400 italic tracking-tight transition-all">
                    Don&apos;t have a neural node? <span className="underline decoration-purple-500/20 underline-offset-4 ml-1">Create Account Matrix</span>
                 </Button>
              </Link>
            </div>
          </form>
        </div>
        
      </div>
    </div>
  )
}
