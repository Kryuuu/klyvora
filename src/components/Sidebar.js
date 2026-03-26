'use client'

import Link from 'next/link'
import { usePathname } from 'react-navigation/next' // Incorrect import in previous turns, but I will check for correct next/navigation
import { usePathname as useNextPathname } from 'next/navigation'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Workflows', href: '/workflows', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { name: 'Tasks', href: '/tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { name: 'Subscription', href: '/subscription', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
]

export function Sidebar() {
  const pathname = useNextPathname()

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 border-r border-[#272733] bg-[#0f0f14]">
      <div className="h-full px-4 py-8 flex flex-col">
        <Link href="/dashboard" className="flex items-center ps-4 mb-12 space-x-2 group">
           <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
           </div>
           <span className="self-center text-xl font-bold whitespace-nowrap text-white tracking-tight">KlyVora</span>
        </Link>
        <ul className="space-y-2 font-medium flex-1">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center p-3 rounded-xl transition-smooth group ${
                    isActive
                      ? 'bg-purple-600/10 text-purple-500'
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <svg className={`w-5 h-5 transition-smooth ${isActive ? 'text-purple-500' : 'text-zinc-600 group-hover:text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="ms-3 text-sm font-semibold">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="mt-auto border-t border-white/5 pt-6 ms-2">
           <div className="flex items-center space-x-3 opacity-60">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Minimal Operational</span>
           </div>
        </div>
      </div>
    </aside>
  )
}
