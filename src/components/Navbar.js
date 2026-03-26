'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Button } from './ui/Button'

export function Navbar({ userEmail, plan, onMenuToggle }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0f0f14]/40 backdrop-blur-xl border-b border-[#3f3f46]/30 px-6 md:px-12 h-20 flex items-center justify-between">
      {/* Mobile Menu Toggle */}
      <div className="flex items-center md:hidden">
        <button 
          onClick={onMenuToggle}
          className="p-2.5 -ml-2 text-[#a1a1aa] hover:text-white rounded-xl bg-[#18181b] border border-[#3f3f46]/50 transition-all active:scale-90 shadow-lg"
        >
          <svg className="w-5 h-5 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      <div className="flex items-center space-x-6 ml-auto group">
        <div className="flex items-center gap-4">
           {plan === 'pro' ? (
             <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] font-black uppercase italic tracking-widest shadow-lg shadow-purple-500/20 border border-white/20">
                PRO NODE
             </div>
           ) : (
             <div className="px-3 py-1 rounded-lg bg-[#18181b] text-zinc-500 text-[9px] font-black uppercase italic tracking-widest border border-[#3f3f46]">
                FREE PLAN
             </div>
           )}
           <div className="flex flex-col items-end border-r border-[#3f3f46]/50 pr-4">
              <span className="hidden sm:inline-block text-[9px] text-[#a1a1aa] font-black uppercase tracking-[0.2em] opacity-50">Authorized as</span>
              <span className="hidden sm:inline-block text-xs text-white font-bold tracking-tight">{userEmail}</span>
           </div>
        </div>
        
        <button 
          onClick={handleLogout} 
          disabled={isLoggingOut}
          className="relative px-5 h-11 rounded-2xl bg-[#18181b]/50 border border-[#3f3f46]/50 text-[10px] font-black uppercase tracking-widest text-[#a1a1aa] hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all active:scale-95 flex items-center gap-3 shadow-xl overflow-hidden group/btn"
        >
           {isLoggingOut ? (
             <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
           ) : (
             <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
           )}
           <span>{isLoggingOut ? 'Disconnecting' : 'Sign Out'}</span>
        </button>
      </div>
    </header>
  )
}
