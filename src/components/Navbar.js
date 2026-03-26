'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Button } from './ui/Button'

export function Navbar({ userEmail }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md px-6 h-16 flex items-center justify-between">
      <div className="flex items-center space-x-4">
         <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
         <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Neural Link: Active</span>
      </div>

      <div className="flex items-center space-x-6">
        {userEmail && (
          <div className="hidden sm:flex flex-col items-end">
             <span className="text-xs font-black text-white uppercase tracking-tight">{userEmail.split('@')[0]}</span>
             <span className="text-[10px] text-zinc-600 font-bold">{userEmail}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-3 pl-6 border-l border-white/5">
           <div className="h-8 w-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-black text-purple-400 group cursor-pointer hover:border-purple-500/50 transition-all">
             {userEmail ? userEmail[0].toUpperCase() : 'U'}
           </div>
           
           <Button 
             variant="ghost"
             onClick={handleLogout}
             isLoading={isLoggingOut}
             className="h-8 px-3 text-[10px] font-black uppercase tracking-widest hover:text-danger transition-colors"
           >
             Logout
           </Button>
        </div>
      </div>
    </header>
  )
}
