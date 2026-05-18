'use client'

import { useEffect, useState } from 'react'

export function Toast() {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const onToast = (event) => {
      setToast({
        message: event.detail?.message || 'Saved',
        variant: event.detail?.variant || 'neutral',
      })

      window.clearTimeout(window.__klyvoraToastTimer)
      window.__klyvoraToastTimer = window.setTimeout(() => setToast(null), 2800)
    }

    window.addEventListener('klyvora:toast', onToast)
    return () => window.removeEventListener('klyvora:toast', onToast)
  }, [])

  if (!toast) return null

  const tone = {
    success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
    danger: 'border-red-400/20 bg-red-400/10 text-red-100',
    neutral: 'border-white/10 bg-white/[0.04] text-white',
  }[toast.variant] || 'border-white/10 bg-white/[0.04] text-white'

  return (
    <div className="fixed bottom-5 right-5 z-[120] max-w-sm animate-slide-up">
      <div className={`rounded-[22px] border px-4 py-3 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl ${tone}`}>
        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">KlyVora</div>
        <div className="mt-1 text-sm font-medium">{toast.message}</div>
      </div>
    </div>
  )
}