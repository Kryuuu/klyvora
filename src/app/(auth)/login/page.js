'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      const { user } = authData
      if (user) {
        // Sync profile just in case
        await supabase.from('profiles').upsert({ id: user.id, name: user.email.split('@')[0] }, { onConflict: 'id' })
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f14] px-4">
      <div className="w-full max-w-md bg-[#18181b] p-8 rounded-2xl shadow-lg space-y-6">
        
        {/* Logo */}
        <div className="flex justify-center">
          <img src="/logo.png" alt="KlyVora Logo" className="w-20" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-white">
          Welcome Back
        </h1>

        {/* Subtitle */}
        <p className="text-center text-gray-400 text-sm">
          Login to your KlyVora account
        </p>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-[#0f0f14] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-sans"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-[#0f0f14] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-sans"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/register">
            <span className="text-purple-500 hover:text-purple-400 transition cursor-pointer">Register</span>
          </Link>
        </p>
      </div>
    </div>
  )
}
