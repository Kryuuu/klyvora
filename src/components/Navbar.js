'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function Navbar({ onMenuClick, userEmail }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-[#272737] px-4 py-3 flex items-center justify-between lg:px-6">
      <div className="flex items-center space-x-4">
        {/* Mobile Hamburger */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative w-8 h-8">
            <Image 
              src="/logo.png" 
              alt="KlyVora Logo" 
              fill 
              className="object-contain" 
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">KlyVora</span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {userEmail && (
          <div className="hidden md:flex flex-col items-end">
             <span className="text-sm font-medium text-gray-200">{userEmail.split('@')[0]}</span>
             <span className="text-xs text-gray-500">{userEmail}</span>
          </div>
        )}
        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer">
          {userEmail ? userEmail[0].toUpperCase() : 'U'}
        </div>
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          {isLoggingOut ? '...' : 'Logout'}
        </button>
      </div>
    </header>
  )
}
