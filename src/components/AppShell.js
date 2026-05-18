'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { Card } from './ui/Card'
import { Toast } from './Toast'

const quickLinks = [
  { label: 'Dashboard', href: '/dashboard', hint: 'Overview' },
  { label: 'Clusters', href: '/workflows', hint: 'Workspace grid' },
  { label: 'Tasks', href: '/tasks', hint: 'Mission board' },
  { label: 'Generate', href: '/generate', hint: 'AI synthesis' },
  { label: 'Vision', href: '/vision', hint: 'Image synthesis' },
  { label: 'Subscription', href: '/subscription', hint: 'Upgrade Pro' },
]

export function AppShell({ children, userEmail, plan, isDev }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [query, setQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsCommandOpen(true)
      }

      if (event.key === 'Escape') {
        setIsCommandOpen(false)
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const filteredLinks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return quickLinks
    return quickLinks.filter((link) => `${link.label} ${link.hint}`.toLowerCase().includes(normalizedQuery))
  }, [query])

  const handleNavigate = (href) => {
    router.push(href)
    setIsSidebarOpen(false)
    setIsCommandOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-transparent text-slate-100">
      <Toast />
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[290px] border-r border-white/10 bg-slate-950/80 backdrop-blur-2xl transition-transform duration-300 ease-out md:static md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <Navbar 
          userEmail={userEmail} 
          plan={plan} 
          isDev={isDev}
          pathname={pathname}
          onMenuToggle={() => setIsSidebarOpen(true)} 
          onCommandOpen={() => setIsCommandOpen(true)}
        />
        <main className="flex-1 overflow-y-auto w-full">
           <div className="p-4 sm:p-6 lg:p-8 w-full max-w-[1500px] mx-auto">
             {children}
           </div>
        </main>
      </div>

      {isCommandOpen && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center bg-slate-950/75 px-4 pt-24 backdrop-blur-md">
          <button aria-label="Close command palette" className="absolute inset-0 cursor-default" onClick={() => setIsCommandOpen(false)} />
          <Card className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[30px] p-0">
            <div className="border-b border-white/10 p-4 sm:p-5">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 5a6 6 0 100 12 6 6 0 000-12z" /></svg>
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search pages, actions, or destinations..."
                  className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                />
                <button onClick={() => setIsCommandOpen(false)} className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500 hover:text-white">Esc</button>
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-3 sm:p-4">
              <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Quick navigation</div>
              <div className="space-y-2">
                {filteredLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavigate(link.href)}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition-all hover:border-cyan-400/30 hover:bg-cyan-400/[0.06]"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{link.label}</div>
                      <div className="text-xs text-slate-500">{link.hint}</div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Go</span>
                  </button>
                ))}
                {filteredLinks.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">
                    No matching destinations.
                  </div>
                )}
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-400">
                Tip: use <span className="text-white">Ctrl + K</span> to open this palette anywhere in KlyVora.
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
