'use client'

import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

export function AppShell({ children, userEmail }) {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex font-sans selection:bg-purple-500/30">
      {/* Permanent Desktop Sidebar */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px] relative">
        {/* Background Decorative Glow (Subtle) */}
        <div className="pointer-events-none fixed top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full z-0" />
        
        <Navbar userEmail={userEmail} onMenuClick={() => {}} />
        
        <main className="flex-1 relative z-10 p-4 sm:p-8 md:p-12 w-full max-w-7xl mx-auto pb-32 lg:pb-12 animate-fade-in">
           <div className="animate-slide-up">
              {children}
           </div>
        </main>
      </div>
    </div>
  )
}
