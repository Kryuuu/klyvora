'use client'

import React from 'react'
import { Card } from './Card'
import { Button } from './Button'

/**
 * Premium Modal Fragment
 * A sleek, neural-styled replacement for standard browser alerts/confirms.
 */
export function Modal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Proceed Protocol", 
  cancelText = "Abort",
  variant = "danger" // danger, primary, success
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <Card className="relative w-full max-w-md overflow-hidden rounded-[32px] border-white/10 p-0 shadow-[0_40px_120px_rgba(0,0,0,0.7)] animate-slide-up">
        <div className={`h-1.5 w-full ${variant === 'danger' ? 'bg-gradient-to-r from-red-500 to-orange-400' : variant === 'success' ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500'}`} />
        <div className="p-8 sm:p-10 text-center space-y-6">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border ${variant === 'danger' ? 'border-red-400/20 bg-red-400/10 text-red-200' : variant === 'success' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'}`}>
            {variant === 'danger' ? (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01M10.29 3.86l-8.43 14.5A2 2 0 003.58 21h16.84a2 2 0 001.72-2.64l-8.43-14.5a2 2 0 00-3.42 0z" /></svg>
            ) : variant === 'success' ? (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M12 22a10 10 0 100-20 10 10 0 000 20z" /></svg>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-semibold tracking-tight text-white">{title}</h3>
            <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-400">{message}</p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button 
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className={`h-12 rounded-2xl text-xs font-semibold uppercase tracking-[0.22em] ${variant === 'danger' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : variant === 'success' ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 text-slate-950' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'}`}
            >
              {confirmText}
            </Button>
            <button 
              onClick={onClose}
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.03] text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 transition-colors hover:border-white/20 hover:text-white"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
