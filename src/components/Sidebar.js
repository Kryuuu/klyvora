'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Generate AI', href: '/generate', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { name: 'Workflows', href: '/workflows', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { name: 'Tasks', href: '/tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { name: 'Subscription', href: '/subscription', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 z-50 h-screen w-64 border-r border-[#27273a] bg-[#0f0f14] shadow-xl">
        <div className="flex flex-col h-full px-4 py-8">
          <Link href="/dashboard" className="px-4 mb-12 flex items-center space-x-3 transition-opacity hover:opacity-80">
             <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-purple-400 flex items-center justify-center">
                 <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <span className="text-xl font-bold text-white tracking-tight">KlyVora</span>
          </Link>
          
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl transform transition-all duration-200 group ${
                    isActive
                      ? 'bg-purple-600/10 text-purple-500'
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <svg className={`w-5 h-5 group-hover:scale-110 transition-transform ${isActive ? 'text-purple-500' : 'text-zinc-600 group-hover:text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d={item.icon} />
                  </svg>
                  <span className="ml-3.5 text-sm font-semibold tracking-tight">{item.name}</span>
                  {isActive && <div className="ml-auto w-1 h-4 rounded-full bg-purple-500" />}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto border-t border-white/5 pt-6 px-4">
             <div className="p-4 rounded-2xl bg-white/3 border border-white/5 text-center transition-all hover:border-purple-500/20">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center justify-center space-x-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                   <p className="text-xs text-zinc-400 font-semibold tracking-tight">System Operational</p>
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav Fix */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f14]/80 backdrop-blur-xl border-t border-white/5 pb-safe px-4 py-2 h-16">
         <ul className="flex justify-around items-center h-full">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <li key={item.name} className="flex-1">
                  <Link
                    href={item.href}
                    className={`flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 ${
                      isActive ? 'text-purple-500' : 'text-zinc-500'
                    }`}
                  >
                    <svg className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d={item.icon} />
                    </svg>
                    <span className="text-[9px] font-bold tracking-tight">{item.name.split(' ')[0]}</span>
                  </Link>
                </li>
              )
            })}
         </ul>
      </nav>
    </>
  )
}
