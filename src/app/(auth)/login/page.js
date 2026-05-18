'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { AuthExperience } from '@/components/AuthExperience'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

function getAuthErrorMessage(error) {
  const message = error?.message || 'Authentication failed. Please try again.'
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid login credentials')) {
    return 'Email or password is incorrect. Check your credentials and try again.'
  }

  if (normalized.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.'
  }

  return message
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', variant: 'primary' })

  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setModal({ isOpen: true, title: 'Sign In Failed', message: getAuthErrorMessage(authError), variant: 'danger' })
        setLoading(false)
        return
      }

      const { user } = authData
      if (user) {
        await supabase.from('profiles').upsert({ id: user.id, name: user.email.split('@')[0] }, { onConflict: 'id' })
        router.push('/dashboard')
      }
    } catch {
      setModal({ isOpen: true, title: 'Sync Failure', message: 'Neural link synchronization failed.', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthExperience
      badge="Operator access"
      title="Run the room."
      description="Sign in to command workflows, AI output, team tasks, and Pro operations from a workspace that stays sharp under pressure."
      footerText="New to KlyVora?"
      footerHref="/register"
      footerLinkText="Create account"
    >
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        confirmText="Acknowledge"
      />

      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0d1117]/92 shadow-[0_34px_110px_rgba(0,0,0,0.58)] backdrop-blur-xl">
        <div className="h-1 bg-gradient-to-r from-cyan-300 via-blue-500 to-fuchsia-400" />

        <div className="border-b border-white/10 px-6 py-6 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Welcome back</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Sign in</h2>
            </div>
            <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
              Node 01
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 px-6 py-6 sm:px-7">
          {modal.isOpen && modal.variant === 'danger' && (
            <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-100">{modal.message}</div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className="h-14 rounded-lg bg-white/[0.055]"
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="h-14 rounded-lg bg-white/[0.055]"
            required
          />

          <div className="grid grid-cols-3 gap-2">
            {['Secure', 'Private', 'Fast'].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {item}
              </div>
            ))}
          </div>

          <Button type="submit" isLoading={loading} className="h-14 w-full rounded-lg text-xs font-semibold uppercase tracking-[0.2em]">
            {loading ? 'Signing in' : 'Enter workspace'}
          </Button>
        </form>
      </div>
    </AuthExperience>
  )
}
