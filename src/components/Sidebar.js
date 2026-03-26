'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Workflows', href: '/workflows', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { name: 'Tasks', href: '/tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { name: 'Subscription', href: '/subscription', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
]

export function Sidebar({ onNavigate }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-[#18181b]">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-white/5 bg-black/20">
        <Link href="/dashboard" className="flex items-center space-x-4 group" onClick={onNavigate}>
           <div className="w-10 h-10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 relative">
              <img src="/logo-klyvora.png" alt="KlyVora Logo" className="w-full h-full object-contain" />
           </div>
           <span className="font-black text-xl tracking-tighter text-white uppercase italic group-hover:text-purple-400 transition-colors">KlyVora</span>
        </Link>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
             <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center px-3 py-2.5 rounded-xl transition-colors ${
                   isActive
                     ? 'bg-[#27272a] text-[#fafafa] font-medium'
                     : 'text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#fafafa]'
                }`}
             >
                <svg className={`w-5 h-5 mr-3 ${isActive ? 'text-[#7c3aed]' : 'text-[#a1a1aa]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.name}
             </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-[#3f3f46]">
         <div className="text-xs text-[#a1a1aa] px-2 text-center">KlyVora</div>
      </div>
    </div>
  )
}
