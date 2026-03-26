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
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      const { user } = authData
      if (user) {
        await supabase.from('profiles').upsert({ id: user.id, name: fullName || email.split('@')[0] }, { onConflict: 'id' })
        alert('Registration successful! Please check your email for confirmation.')
        router.push('/login')
      }
    } catch (err) {
      setError('Registration initialization failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0f0f14] flex items-center justify-center p-6 selection:bg-purple-500/30">
      
      <div className="w-full max-w-sm animate-page space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-purple-400 shadow-xl shadow-purple-500/10 mb-6">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight underline decoration-purple-500/20 underline-offset-8">New Operator</h1>
          <p className="text-[11px] text-zinc-600 font-extrabold uppercase tracking-[0.2em] pt-4">Neural Cluster Activation</p>
        </div>

        {/* Card Form (Glass Effect) */}
        <Card className="p-8 border-white/5 bg-zinc-900/30 backdrop-blur-2xl rounded-2xl shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold text-center animate-fade">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
               <Input 
                 label="Full Identifier Name" 
                 type="text" 
                 placeholder="Elon Musk"
                 value={fullName}
                 onChange={(e) => setFullName(e.target.value)}
                 className="bg-black/20 border-white/5 h-12 rounded-xl focus:border-purple-500/50"
                 required
               />

               <Input 
                 label="Protocol: Email Address" 
                 type="email" 
                 placeholder="name@cluster.ai"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="bg-black/20 border-white/5 h-12 rounded-xl focus:border-purple-500/50"
                 required
               />
               
               <Input 
                 label="Secret Activation Key" 
                 type="password" 
                 placeholder="••••••••"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="bg-black/20 border-white/5 h-12 rounded-xl focus:border-purple-500/50"
                 required
                 minLength={6}
               />
            </div>
            
            <Button 
               type="submit" 
               className="w-full h-12 font-bold uppercase text-[11px] tracking-widest btn-premium shadow-lg shadow-purple-600/10 italic" 
               isLoading={loading}
            >
               Execute Initialization
            </Button>
            
            <div className="pt-8 border-t border-white/5 mt-4 flex items-center justify-center">
              <Link href="/login" className="text-xs font-bold text-zinc-500 hover:text-purple-400 transition-colors">
                Already Active? <span className="underline decoration-purple-500/20 underline-offset-4 ml-1">Re-Authorize Node</span>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
