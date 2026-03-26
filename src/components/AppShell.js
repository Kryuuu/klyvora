'use client'

import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

export function AppShell({ children, userEmail }) {
  // Mobile uses bottom nav, Desktop uses fixed sidebar.
  // Main content padded correctly for both.
  return (
    <div className="min-h-screen bg-[#0f0f14] text-gray-100 flex font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* We hide the traditional navbar on mobile to maximize space, 
            or keep it strictly for user avatar/logout at the top. */}
        <Navbar userEmail={userEmail} onMenuClick={() => {}} />
        
        <main className="flex-1 p-4 sm:p-8 w-full max-w-7xl mx-auto pb-24 lg:pb-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
