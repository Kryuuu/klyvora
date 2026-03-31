'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Button } from './ui/Button'

export function Navbar({ userEmail, plan, isDev, onMenuToggle }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900 border-b border-slate-800 px-6 md:px-8 h-16 flex items-center justify-between">
      {/* Mobile Menu Toggle */}
      <div className="flex items-center md:hidden">
        <button 
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-100 rounded-md hover:bg-slate-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      <div className="flex items-center space-x-6 ml-auto">
        <div className="flex items-center gap-4">
           {isDev ? (
             <div className="px-3 py-0.5 rounded text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(217,70,239,0.3)] italic animate-pulse">
                SYS_DEV
             </div>
           ) : plan === 'pro' ? (
             <div className="px-2 py-0.5 rounded text-blue-400 bg-blue-500/10 border border-blue-500/20 text-xs font-semibold uppercase tracking-wider">
                Pro
             </div>
           ) : (
             <div className="px-2 py-0.5 rounded text-slate-300 bg-slate-800 border border-slate-700 text-xs font-semibold uppercase tracking-wider">
                Free
             </div>
           )}
           <div className="hidden sm:flex flex-col items-end border-r border-slate-700 pr-4">
              <span className="text-sm font-medium text-slate-100">{userEmail}</span>
           </div>
        </div>
        
        <button 
          onClick={handleLogout} 
          disabled={isLoggingOut}
          className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors flex items-center gap-2"
        >
           {isLoggingOut ? (
             <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
           ) : (
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
           )}
           <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
        </button>
      </div>
    </header>
  )
}
