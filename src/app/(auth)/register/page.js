'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { AuthExperience } from '@/components/AuthExperience'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

function getAuthErrorMessage(error) {
  const message = error?.message || 'Registration failed. Please try again.'
  const normalized = message.toLowerCase()

  if (normalized.includes('already registered') || normalized.includes('already been registered')) {
    return 'This email is already registered. Try signing in instead.'
  }

  if (normalized.includes('password')) {
    return message
  }

  return message
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', variant: 'primary', onConfirm: () => {} })

  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })

      if (authError) {
        setModal({ isOpen: true, title: 'Registration Failed', message: getAuthErrorMessage(authError), variant: 'danger', onConfirm: () => {} })
        setLoading(false)
        return
      }

      const { user, session } = authData
      if (user) {
        if (session) {
          await supabase.from('profiles').upsert({ id: user.id, name: fullName || email.split('@')[0] }, { onConflict: 'id' })
        }

        setModal({
          isOpen: true,
          title: session ? 'Account Created' : 'Confirm Your Email',
          message: session
            ? 'Your identity is synchronized. Continue to sign in.'
            : 'Registration is created. Check your email and confirm it before signing in.',
          variant: 'success',
          onConfirm: () => router.push('/login'),
        })
      }
    } catch {
      setModal({ isOpen: true, title: 'Sync Error', message: 'Registration initialization failed.', variant: 'danger', onConfirm: () => {} })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthExperience
      badge="New operator"
      title="Claim your control layer."
      description="Create a KlyVora workspace identity for automations, generated assets, task pipelines, and team network operations."
      footerText="Already have access?"
      footerHref="/login"
      footerLinkText="Sign in"
    >
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={() => {
          modal.onConfirm()
          setModal({ ...modal, isOpen: false })
        }}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        confirmText="Continue"
      />

      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0d1117]/92 shadow-[0_34px_110px_rgba(0,0,0,0.58)] backdrop-blur-xl">
        <div className="h-1 bg-gradient-to-r from-emerald-300 via-cyan-400 to-fuchsia-400" />

        <div className="border-b border-white/10 px-6 py-6 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Create account</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Register</h2>
            </div>
            <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
              Node 00
            </div>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-5 px-6 py-6 sm:px-7">
          {modal.variant === 'danger' && modal.isOpen && (
            <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-100">{modal.message}</div>
          )}

          <Input
            label="Identity label"
            type="text"
            placeholder="KlyVora"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            className="h-14 rounded-lg bg-white/[0.055]"
            required
          />

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
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            className="h-14 rounded-lg bg-white/[0.055]"
            required
            minLength={6}
          />

          <div className="grid grid-cols-3 gap-2">
            {['Profile', 'Access', 'Sync'].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {item}
              </div>
            ))}
          </div>

          <Button type="submit" isLoading={loading} className="h-14 w-full rounded-lg text-xs font-semibold uppercase tracking-[0.2em]">
            {loading ? 'Creating account' : 'Create workspace'}
          </Button>
        </form>
      </div>
    </AuthExperience>
  )
}
