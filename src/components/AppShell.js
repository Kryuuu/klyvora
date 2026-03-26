'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

export function AppShell({ children, userEmail }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <div className="min-h-screen bg-[#0f0f14] flex text-[#fafafa] font-sans">
      
      {/* Desktop Sidebar (Fixed) */}
      <div className="hidden md:block w-64 fixed inset-y-0 z-40 bg-[#18181b] border-r border-[#3f3f46]">
        <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Mobile Sidebar (Overlay) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" onClick={toggleMobileMenu} />
          {/* Sidebar Drawer */}
          <div className="relative w-64 max-w-sm h-full bg-[#18181b] border-r border-[#3f3f46]">
            <Sidebar onNavigate={toggleMobileMenu} />
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Navbar userEmail={userEmail} onMenuToggle={toggleMobileMenu} />
        
        <main className="flex-1 p-6 md:p-12 w-full max-w-6xl mx-auto lg:mt-8 animate-fade-in">
           {children}
        </main>
      </div>
    </div>
  )
}
