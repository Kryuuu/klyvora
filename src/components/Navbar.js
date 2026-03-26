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
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0f0f14]/80 backdrop-blur-xl px-6 h-16 flex items-center justify-between">
      <div className="flex items-center space-x-4">
         <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Telemetry Active</span>
      </div>

      <div className="flex items-center space-x-6">
        {userEmail && (
          <div className="hidden sm:flex flex-col items-end">
             <span className="text-xs font-bold text-white tracking-tight leading-none mb-1">{userEmail.split('@')[0]}</span>
             <span className="text-[10px] text-zinc-500 font-medium tracking-tight">{userEmail}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-3 pl-6 border-l border-white/5 h-8">
           <div className="h-8 w-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-[11px] font-bold text-purple-400">
             {userEmail ? userEmail[0].toUpperCase() : 'U'}
           </div>
           
           <Button 
             variant="ghost"
             onClick={handleLogout}
             isLoading={isLoggingOut}
             className="h-8 px-3 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 hover:text-white"
           >
             Logout
           </Button>
        </div>
      </div>
    </header>
  )
}
