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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
      {/* 🌌 Dark Backdrop Layer */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* 🚀 Modal Body Card */}
      <Card className="max-w-md w-full p-0 border-white/10 bg-[#0f0f14] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] animate-slide-up relative rounded-[40px]">
        {/* Glow Element */}
        <div className={`absolute top-0 left-0 w-full h-1.5 ${variant === 'danger' ? 'bg-red-500' : variant === 'success' ? 'bg-emerald-500' : 'bg-[#7c3aed]'} opacity-50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]`} />
        
        <div className="p-10 text-center space-y-8">
            <div className={`w-16 h-16 mx-auto rounded-[24px] flex items-center justify-center ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : variant === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-purple-500/10 text-purple-500'} mb-4`}>
                {variant === 'danger' ? (
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                ) : variant === 'success' ? (
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                ) : (
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
            </div>
            
            <div className="space-y-3">
                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{title}</h3>
                <p className="text-zinc-500 text-sm font-medium italic leading-relaxed max-w-[280px] mx-auto">{message}</p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
                <Button 
                   onClick={() => { onConfirm(); onClose(); }}
                   className={`h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] italic ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : variant === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-[#7c3aed] hover:bg-[#8b5cf6] shadow-purple-600/20'}`}
                >
                   {confirmText}
                </Button>
                <button 
                  onClick={onClose}
                  className="h-12 rounded-2xl text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors italic"
                >
                   {cancelText}
                </button>
            </div>
        </div>
      </Card>
    </div>
  )
}
