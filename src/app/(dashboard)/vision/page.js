'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabaseClient'
import { getClientSessionUser } from '@/lib/authClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'

export default function VisionPage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [visionResult, setVisionResult] = useState(null)
  const [visionRaw, setVisionRaw] = useState(null)
  const [isFreeLimit, setIsFreeLimit] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [showLimitModal, setShowLimitModal] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function checkSub() {
      setIsChecking(true)
      const user = await getClientSessionUser(supabase)
      if (!user) {
        setIsChecking(false)
        return
      }

      const isDeveloper = user.email === process.env.NEXT_PUBLIC_DEVELOPER_EMAIL
      if (isDeveloper) {
        setIsChecking(false)
        return
      }

      const { data: sub } = await supabase.from('subscriptions').select('plan, status').eq('user_id', user.id).maybeSingle()
      if (sub && sub.plan === 'pro' && sub.status === 'active') {
        setIsFreeLimit(false)
        setIsChecking(false)
        return
      }

      const { count } = await supabase.from('vision_history').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      if (count && count >= 3) setIsFreeLimit(true)
      setIsChecking(false)
    }

    checkSub()
  }, [supabase, router])

  useEffect(() => {
    if (isFreeLimit) {
      setShowLimitModal(true)
    }
  }, [isFreeLimit])

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)
    setVisionResult(null)
    setVisionRaw(null)

    try {
      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Syntax Server Timeout. Please check Gemini API status.')
      }

      if (json.imageBase64) {
        setVisionResult(`data:image/png;base64,${json.imageBase64}`)
      } else if (json.isRaw) {
        setVisionRaw(json.rawOutput)
      } else {
        throw new Error('Image parsing failed. Did not receive expected Base64 format.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      const user = await getClientSessionUser(supabase)
      if (user) {
        const { count } = await supabase.from('vision_history').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
        if (count && count >= 3 && user.email !== process.env.NEXT_PUBLIC_DEVELOPER_EMAIL) {
          setIsFreeLimit(true)
        }
      }
    }
  }

  if (isChecking) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Card className="rounded-[30px] p-8 text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl border border-white/10 bg-white/[0.04] animate-pulse" />
          <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Connecting to vision array</div>
        </Card>
      </div>
    )
  }

  if (isFreeLimit) {
    return (
      <>
        <Modal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          onConfirm={() => router.push('/subscription')}
          title="Free Limit Reached"
          message="Your free plan has reached its vision generation limit. Upgrade to Pro for unlimited image synthesis and priority processing."
          confirmText="Upgrade Pro"
          cancelText="Later"
          variant="danger"
        />
        <Card className="mx-auto mt-8 max-w-3xl rounded-[34px] p-8 text-center sm:p-12">
          <Badge status="danger" className="mb-6">Buffer capacity reached</Badge>
          <h2 className="text-4xl font-semibold tracking-tight text-white">Vision Matrix Full</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">Your free tier permits a maximum of 3 vision generations. Upgrade to process unlimited visuals.</p>
          <Link href="/subscription" className="mt-8 inline-flex">
            <Button className="h-12 px-6 text-xs font-semibold uppercase tracking-[0.22em]">Upgrade Access Protocol</Button>
          </Link>
        </Card>
      </>
    )
  }

  return (
    <div className="space-y-8 pb-8 animate-fade-in relative">
      <div className="absolute right-[-8%] top-[-80px] h-[520px] w-[720px] rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none" />

      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">Vision synthesis</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Image Command Studio</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Generate high quality visuals through a polished prompt studio, then inspect the result in a premium preview panel.</p>
        </div>
        <Badge status="doing">SynthID watermarked</Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[34px] p-0 overflow-hidden">
          <div className="border-b border-white/10 px-6 py-4">
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Prompt studio</div>
          </div>
          <form onSubmit={handleGenerate} className="flex flex-col">
            <textarea
              className="min-h-[360px] w-full resize-none bg-transparent px-6 py-6 text-base leading-7 text-white outline-none placeholder:text-slate-600"
              placeholder="Describe your vision: mood, palette, subject, framing, and style..."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              disabled={loading}
            />
            {error && <div className="mx-6 mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}
            <div className="border-t border-white/10 p-6">
              <Button type="submit" isLoading={loading} className="h-14 w-full text-xs font-semibold uppercase tracking-[0.28em]">
                {loading ? 'Synthesizing...' : 'Generate Vision Array'}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="rounded-[34px] p-0 overflow-hidden">
          <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Preview</div>
              <div className="mt-1 text-lg font-medium text-white">Result panel</div>
            </div>
            <Badge status={loading ? 'doing' : visionResult || visionRaw ? 'done' : 'neutral'}>{loading ? 'Generating' : visionResult || visionRaw ? 'Ready' : 'Idle'}</Badge>
          </div>

          <div className="min-h-[520px] p-6">
            {loading ? (
              <div className="flex h-full min-h-[460px] flex-col items-center justify-center text-center">
                <div className="relative mb-6 h-24 w-24 rounded-full border border-white/10">
                  <div className="absolute inset-4 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin" />
                  <div className="absolute inset-8 rounded-full bg-cyan-400/20 blur-md animate-pulse" />
                </div>
                <div className="text-2xl font-semibold text-white">Neural rendering active</div>
                <div className="mt-2 text-xs uppercase tracking-[0.28em] text-slate-500">Connecting to multimodal inference</div>
              </div>
            ) : visionResult ? (
              <div className="space-y-5">
                <div className="rounded-[30px] border border-white/10 bg-slate-950/60 p-4">
                  <Image
                    src={visionResult}
                    alt="Synthesized AI Vision"
                    width={1024}
                    height={1024}
                    unoptimized
                    className="max-h-[620px] w-full rounded-[22px] object-contain"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Right-click or long-press to save the generated image.</p>
                  <Button variant="secondary" onClick={() => { setPrompt(''); setVisionResult(null) }} className="h-11 px-5 text-[10px] font-semibold uppercase tracking-[0.22em]">
                    Clear Buffer
                  </Button>
                </div>
              </div>
            ) : visionRaw ? (
              <div className="space-y-4">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-xl font-semibold text-white">Raw Matrix Received</div>
                  <p className="mt-2 text-sm leading-7 text-slate-400">The API returned a valid payload, but it did not contain the expected Base64 image string.</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 font-mono text-xs text-cyan-300 overflow-auto">
                  <pre>{JSON.stringify(visionRaw, null, 2)}</pre>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-[30px] border border-dashed border-white/10 bg-white/[0.02] text-center">
                <div className="mb-6 h-20 w-20 rounded-[28px] border border-white/10 bg-white/[0.03] flex items-center justify-center">
                  <svg className="h-8 w-8 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-2xl font-semibold text-white">Neural Vision Array</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">Enter a prompt to wake the image synthesis pipeline and render a premium visual output.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
