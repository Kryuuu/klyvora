'use client'

import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

export function AppShell({ children, userEmail }) {
  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 flex font-sans selection:bg-purple-500/30">
      {/* Permanent Desktop Sidebar */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 sm:pl-64 transition-all duration-300">
        {/* Minimal Top Navigation */}
        <Navbar userEmail={userEmail} onMenuClick={() => {}} />
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-12 w-full max-w-7xl mx-auto pb-24 lg:pb-12 animate-page">
           {children}
        </main>
      </div>
    </div>
  )
}
