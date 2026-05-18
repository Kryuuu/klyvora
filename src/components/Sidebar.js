'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Workflows', href: '/workflows', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { name: 'Tasks', href: '/tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { name: 'Vision', href: '/vision', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { name: 'Community', href: '/community', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' },
  { name: 'Network', href: '/network', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { name: 'Subscription', href: '/subscription', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
]

export function Sidebar({ onNavigate }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-transparent">
      <div className="border-b border-white/10 px-6 py-6">
        <Link href="/dashboard" className="group flex items-center gap-3" onClick={onNavigate}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-2 transition-transform duration-300 group-hover:scale-105">
            <Image src="/logo-klyvora.png" alt="KlyVora Logo" width={28} height={28} className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight text-white">KlyVora</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Neural Workspace</div>
          </div>
        </Link>
        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
          <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Operational Status</div>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-100">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
            Online and synced
          </div>
        </div>
      </div>
      
      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
             <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={`group flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                   isActive
                     ? 'border border-cyan-400/20 bg-cyan-400/[0.08] text-white shadow-[0_14px_40px_rgba(34,211,238,0.1)]'
                     : 'border border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.03] hover:text-white'
                }`}
             >
                <svg className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-cyan-300' : 'text-slate-500 group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.name}
             </Link>
          )
        })}
      </div>

      <div className="border-t border-white/10 p-4">
         <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">KlyVora v2.4</div>
            <div className="mt-2 text-sm text-slate-200">Future-ready workspace orchestration.</div>
         </div>
      </div>
    </div>
  )
}
