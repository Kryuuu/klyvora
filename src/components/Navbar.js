'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'

const breadcrumbs = {
  dashboard: 'Dashboard',
  workflows: 'Clusters',
  tasks: 'Tasks',
  generate: 'AI Synthesis',
  vision: 'Vision',
  community: 'Community',
  network: 'Network',
  subscription: 'Subscription',
}

export function Navbar({ userEmail, plan, isDev, onMenuToggle, onCommandOpen }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const currentSection = breadcrumbs[pathname.split('/').filter(Boolean)[0] || 'dashboard'] || 'Workspace'
  const notificationItems = [
    { title: 'AI synthesis completed', meta: '2m ago' },
    { title: 'Task board updated', meta: '14m ago' },
    { title: 'Pro status synced', meta: 'Just now' },
  ]

  async function handleLogout() {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-slate-950/70 px-4 sm:px-6 lg:px-8 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center md:hidden">
            <button 
              onClick={onMenuToggle}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 text-slate-300 transition-colors hover:bg-white/8 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>

          <div className="hidden min-w-0 flex-col gap-1 md:flex">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
              <span>Neural Workspace</span>
              <span className="soft-divider h-px w-10" />
              <span>{currentSection}</span>
            </div>
            <div className="truncate text-sm text-slate-200">{userEmail}</div>
          </div>
        </div>

        <button 
          onClick={onCommandOpen}
          className="hidden min-w-[240px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-slate-400 transition-all hover:border-cyan-400/30 hover:bg-cyan-400/[0.05] md:flex"
        >
          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 5a6 6 0 100 12 6 6 0 000-12z" /></svg>
          <span className="flex-1">Search or jump to...</span>
          <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Ctrl K</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setNotificationsOpen((value) => !value)}
            className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 text-slate-300 transition-colors hover:bg-white/8 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" /></svg>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
          </button>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
            {isDev ? (
              <Badge status="danger" className="border-red-400/20 bg-red-400/10 text-red-200">SYS_DEV</Badge>
            ) : (
              <Badge status={plan === 'pro' ? 'pro' : 'free'}>{plan === 'pro' ? 'Pro' : 'Free'}</Badge>
            )}
          </div>

          <button
            onClick={() => setProfileOpen((value) => !value)}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 transition-colors hover:bg-white/8"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-semibold text-slate-950">
              {userEmail?.[0]?.toUpperCase() || 'K'}
            </div>
            <div className="hidden min-w-0 text-left sm:block">
              <div className="truncate text-sm font-medium text-white">{userEmail}</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Profile</div>
            </div>
          </button>
        </div>
      </div>

      {notificationsOpen && (
        <div className="absolute right-4 top-[76px] z-40 w-[320px] overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/95 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Notifications</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Recent activity feed</div>
            </div>
            <button onClick={() => setNotificationsOpen(false)} className="text-xs text-slate-500 hover:text-white">Close</button>
          </div>
          <div className="space-y-2">
            {notificationItems.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-sm text-slate-100">{item.title}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{item.meta}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {profileOpen && (
        <div className="absolute right-4 top-[76px] z-40 w-[240px] overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/95 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 mb-2">
            <div className="text-sm font-medium text-white truncate">{userEmail}</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{plan === 'pro' ? 'Pro operator' : 'Free operator'}</div>
          </div>
          <div className="space-y-1">
            <button onClick={() => router.push('/subscription')} className="w-full rounded-2xl px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white">Upgrade plan</button>
            <button onClick={handleLogout} disabled={isLoggingOut} className="w-full rounded-2xl px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50">
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
