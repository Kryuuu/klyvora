'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', variant: 'primary' })
  
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setModal({ isOpen: true, title: 'Auth Error', message: authError.message, variant: 'danger' })
        setLoading(false)
        return
      }

      const { user } = authData
      if (user) {
        await supabase.from('profiles').upsert({ id: user.id, name: user.email.split('@')[0] }, { onConflict: 'id' })
        router.push('/dashboard')
      }
    } catch (err) {
      setModal({ isOpen: true, title: 'Sync Failure', message: 'Neural link synchronization failed.', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0f0f14] flex items-center justify-center p-6 font-sans relative overflow-hidden isolate">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#7c3aed]/10 blur-[120px] rounded-full -z-10 animate-glow-flow" />

      <Modal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        confirmText="Acknowledge Protocol"
      />

      <div className="w-full max-w-md space-y-8 animate-slide-up relative z-10">
        
        {/* Header: Immersive Branding */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-28 h-28 mb-4 group hover:rotate-6 transition-transform relative p-4">
             <div className="absolute inset-0 bg-[#7c3aed]/5 blur-3xl rounded-full scale-0 group-hover:scale-110 transition-transform duration-1000" />
             <img src="/logo-klyvora.png" alt="KlyVora Logo" className="w-full h-full object-contain relative z-10" />
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
            {modal.isOpen && modal.variant === 'danger' && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest text-center animate-shake">
                {modal.message}
              </div>
            )}
            
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[#a1a1aa] uppercase tracking-[0.2em] ml-1">Email</label>
               <Input 
                 type="email" 
                 placeholder="Klyvora@gmail.com"
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
               className="w-full h-14 font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-purple-500/10 mt-4 active:scale-95 transition-all bg-[#7c3aed] hover:bg-[#8b5cf6]" 
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
