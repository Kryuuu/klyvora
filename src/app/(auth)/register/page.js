'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', variant: 'primary', onConfirm: () => {} })
  
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
        setModal({
           isOpen: true,
           title: 'Node Registered',
           message: 'Registration successful! Node identity has been synchronized. Authorization required.',
           variant: 'success',
           onConfirm: () => router.push('/login')
        })
      }
    } catch (err) {
      setModal({ isOpen: true, title: 'Sync Error', message: 'Registration initialization failed.', variant: 'danger', onConfirm: () => {} })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0f0f14] flex items-center justify-center p-6 font-sans relative overflow-hidden isolate">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 blur-[120px] rounded-full -z-10 animate-glow-flow" style={{ animationDelay: '-5s' }} />

      <Modal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={() => { modal.onConfirm(); setModal({ ...modal, isOpen: false }); }}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        confirmText="Acknowledge Protocol"
      />

      <div className="w-full max-w-md space-y-8 animate-slide-up relative z-10">
        
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-28 h-28 mb-4 group hover:rotate-6 transition-transform relative p-4">
             <div className="absolute inset-0 bg-[#7c3aed]/5 blur-3xl rounded-full scale-0 group-hover:scale-110 transition-transform duration-1000" />
             <img src="/logo-klyvora.png" alt="KlyVora Logo" className="w-full h-full object-contain relative z-10" />
          </div>
          <div className="space-y-2">
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Register Node</h1>
             <p className="text-sm text-[#a1a1aa] font-medium max-w-xs mx-auto">Create your unique identifier to synchronize with the KlyVora neural net.</p>
          </div>
        </div>

        {/* Premium Form Card */}
        <Card className="border-[#3f3f46]/40 p-10 shadow-2xl bg-[#18181b]/60 backdrop-blur-xl rounded-[40px] relative overflow-hidden">
           {/* Decorative grid lines */}
           <div className="absolute inset-0 bg-dotted-grid opacity-5 pointer-events-none" />
           
           <form onSubmit={handleRegister} className="space-y-6 relative z-10">
            {modal.variant === 'danger' && modal.isOpen && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest text-center animate-shake">
                {modal.message}
              </div>
            )}
            
            <div className="space-y-2">
               <label className="text-[10px] font-black text-[#a1a1aa] uppercase tracking-[0.2em] ml-1">Identity Label</label>
               <Input 
                 type="text" 
                 placeholder="KlyVora"
                 value={fullName}
                 onChange={(e) => setFullName(e.target.value)}
                 className="h-14 bg-[#0f0f14]/50 border-[#3f3f46] rounded-2xl focus:scale-[1.01] transition-transform placeholder:text-zinc-700"
                 required
               />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-[#a1a1aa] uppercase tracking-[0.2em] ml-1">Interface ID (Email)</label>
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
               <label className="text-[10px] font-black text-[#a1a1aa] uppercase tracking-[0.2em] ml-1">Secure Key</label>
               <Input 
                 type="password" 
                 placeholder="••••••••"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="h-14 bg-[#0f0f14]/50 border-[#3f3f46] rounded-2xl focus:scale-[1.01] transition-transform placeholder:text-zinc-700"
                 required
                 minLength={6}
               />
            </div>
            
            <Button 
               type="submit" 
               className="w-full h-14 font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-indigo-500/20 mt-4 active:scale-95 transition-all bg-indigo-600 hover:bg-indigo-700" 
               isLoading={loading}
            >
               Initialize Sync
            </Button>
            
          </form>
        </Card>
        
        {/* Footer */}
        <p className="text-center text-sm text-[#a1a1aa] mt-8 font-medium italic">
          Already registered?{' '}
          <Link href="/login" className="text-white font-black hover:text-indigo-400 transition-colors underline decoration-indigo-500/30 underline-offset-8">
            Access Cluster
          </Link>
        </p>
      </div>
    </div>
  )
}
