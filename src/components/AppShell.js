'use client'

import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

export function AppShell({ children, userEmail }) {
  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 flex font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Fixed Desktop Sidebar (260px) */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 relative bg-[#0f0f14] min-h-screen transition-all duration-300">
        
        {/* Topbar (Informative & Logout) */}
        <Navbar userEmail={userEmail} onMenuClick={() => {}} />
        
        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 lg:p-12 w-full max-w-7xl mx-auto pb-32 md:pb-12 animate-page">
           {children}
        </main>
      </div>
    </div>
  )
}
