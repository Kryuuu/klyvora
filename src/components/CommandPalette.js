'use client'

import { useMemo, useState } from 'react'
import { Card } from './ui/Card'

const defaultItems = [
  { label: 'Dashboard', href: '/dashboard', hint: 'Overview' },
  { label: 'Clusters', href: '/workflows', hint: 'Workspace grid' },
  { label: 'Tasks', href: '/tasks', hint: 'Mission board' },
  { label: 'Generate', href: '/generate', hint: 'AI command center' },
  { label: 'Vision', href: '/vision', hint: 'Image synthesis' },
  { label: 'Subscription', href: '/subscription', hint: 'Upgrade Pro' },
]

export function CommandPalette({ isOpen, onClose, onNavigate, items = defaultItems }) {
  const [query, setQuery] = useState('')

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return items
    return items.filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(normalized))
  }, [items, query])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-slate-950/75 px-4 pt-24 backdrop-blur-md">
      <button aria-label="Close command palette" className="absolute inset-0 cursor-default" onClick={onClose} />
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
            <button onClick={onClose} className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500 hover:text-white">Esc</button>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-3 sm:p-4">
          <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Quick navigation</div>
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <button
                key={item.href}
                onClick={() => onNavigate(item.href)}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition-all hover:border-cyan-400/30 hover:bg-cyan-400/[0.06]"
              >
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-xs text-slate-500">{item.hint}</div>
                </div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Go</span>
              </button>
            ))}
            {filteredItems.length === 0 && (
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
  )
}