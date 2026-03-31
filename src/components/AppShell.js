'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

export function AppShell({ children, userEmail, plan, isDev }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800 bg-slate-900/95 backdrop-blur-3xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Navbar 
          userEmail={userEmail} 
          plan={plan} 
          isDev={isDev}
          onMenuToggle={() => setIsSidebarOpen(true)} 
        />
        <main className="flex-1 overflow-y-auto w-full">
           <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
             {children}
           </div>
        </main>
      </div>
    </div>
  )
}
