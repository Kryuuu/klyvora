'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Button } from './ui/Button'

export function Navbar({ userEmail, onMenuToggle }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0f0f14]/80 backdrop-blur-md border-b border-[#3f3f46] px-4 md:px-8 h-16 flex items-center justify-between">
      {/* Mobile Menu Toggle */}
      <div className="flex items-center">
        <button 
          onClick={onMenuToggle}
          className="md:hidden p-2 -ml-2 text-[#a1a1aa] hover:text-[#fafafa] rounded-md transition-colors mr-4"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-4 ml-auto">
        <span className="hidden sm:inline-block text-sm text-[#a1a1aa] font-medium">{userEmail}</span>
        
        <div className="h-6 w-px bg-[#3f3f46] hidden sm:block mx-2" />
        
        <Button 
          variant="ghost" 
          onClick={handleLogout} 
          isLoading={isLoggingOut}
          className="text-sm px-3"
        >
          Log out
        </Button>
      </div>
    </header>
  )
}
