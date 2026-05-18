'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { getClientSessionUser } from '@/lib/authClient'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const renderMessageWithTags = (text) => {
  if (!text) return null
  const regex = /(@\w+)/g
  const parts = text.split(regex)
  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return (
        <span key={index} className="mx-0.5 rounded-md border border-cyan-400/20 bg-cyan-400/10 px-1.5 py-0.5 font-semibold text-cyan-200">
          {part}
        </span>
      )
    }
    return part
  })
}

export default function CommunityPage() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [user, setUser] = useState(null)
  const [profileName, setProfileName] = useState('')
  const [userPlan, setUserPlan] = useState('free')
  const [isSending, setIsSending] = useState(false)
  const [now, setNow] = useState(0)

  const supabase = createClient()
  const messagesEndRef = useRef(null)

  const isMasterAdmin = user?.email === 'snowtz638@gmail.com' || user?.email === process.env.NEXT_PUBLIC_DEVELOPER_EMAIL

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    let mounted = true

    async function initializeChat() {
      const user = await getClientSessionUser(supabase)
      if (!user) return
      setUser(user)

      const [profRes, subRes] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', user.id).maybeSingle(),
        supabase.from('subscriptions').select('plan, status').eq('user_id', user.id).maybeSingle(),
      ])

      const finalName = profRes.data?.name || user.email.split('@')[0]
      setProfileName(finalName)

      if (subRes.data && subRes.data.plan === 'pro' && subRes.data.status === 'active') {
        setUserPlan('pro')
      } else {
        setUserPlan('free')
      }

      const { data: chatHistory } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (chatHistory && mounted) {
        setMessages(chatHistory.reverse())
        setTimeout(scrollToBottom, 150)
      }
    }

    initializeChat()

    const sweepInterval = setInterval(() => {
      setNow(Date.now())
    }, 60000)

    return () => {
      mounted = false
      clearInterval(sweepInterval)
    }
  }, [supabase])

  useEffect(() => {
    const channel = supabase
      .channel('global-chat')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages((current) => {
            if (current.some((item) => item.id === payload.new.id)) return current
            return [...current, payload.new]
          })
          setTimeout(scrollToBottom, 100)
        } else if (payload.eventType === 'DELETE') {
          setMessages((current) => current.filter((item) => item.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    setIsSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    const { data: insertedMsg, error } = await supabase.from('messages').insert([
      {
        user_id: user.id,
        author_name: profileName,
        author_email: user.email,
        author_plan: userPlan || 'free',
        content,
      },
    ]).select().single()

    if (error) {
      setNewMessage(content)
    } else if (insertedMsg) {
      setMessages((prev) => {
        if (prev.some((item) => item.id === insertedMsg.id)) return prev
        return [...prev, insertedMsg]
      })
      setTimeout(scrollToBottom, 100)
    }

    setIsSending(false)
  }

  const handleDeleteMessage = async (msgId) => {
    if (!isMasterAdmin) return
    setMessages((current) => current.filter((item) => item.id !== msgId))
    await supabase.from('messages').delete().eq('id', msgId)
  }

  const handlePurgeAll = async () => {
    if (!isMasterAdmin || !window.confirm('WARNING: Are you sure you want to annihilate all neural transmissions? This cannot be undone.')) return
    setIsSending(true)
    setMessages([])
    await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    setIsSending(false)
  }

  const formatTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const visibleMessages = isMasterAdmin ? messages : messages.filter((message) => (now - new Date(message.created_at).getTime()) < 5 * 60 * 1000)

  const stats = useMemo(() => ({
    messages: visibleMessages.length,
    plan: userPlan,
    realtime: 'active',
  }), [visibleMessages.length, userPlan])

  return (
    <div className="relative z-10 flex h-[calc(100vh-140px)] w-full flex-col gap-6 animate-fade-in">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[120px] -z-10" />

      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">Community</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Global Nexus</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Realtime transmission room for everyone in the workspace. Messages remain ephemeral for standard users.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isMasterAdmin && (
            <Button variant="danger" onClick={handlePurgeAll} disabled={isSending || messages.length === 0} className="h-11 px-4 text-[10px] font-semibold uppercase tracking-[0.22em]">
              Purge All
            </Button>
          )}
          <Badge status="doing">Realtime active</Badge>
          <Badge status={stats.plan === 'pro' ? 'pro' : 'free'}>{stats.plan === 'pro' ? 'Pro' : 'Free'}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Visible messages', value: stats.messages },
          { label: 'Current plan', value: stats.plan === 'pro' ? 'Pro' : 'Free' },
          { label: 'Realtime', value: 'Active' },
        ].map((item) => (
          <Card key={item.label} className="rounded-[28px] p-5">
            <div className="text-[10px] uppercase tracking-[0.26em] text-slate-500">{item.label}</div>
            <div className="mt-3 text-3xl font-semibold text-white">{item.value}</div>
          </Card>
        ))}
      </div>

      <Card className="relative flex flex-1 flex-col overflow-hidden rounded-[32px] p-0">
        <div className="absolute inset-0 bg-dotted-grid opacity-10 pointer-events-none" />

        <div className="relative z-20 flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {visibleMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-20 opacity-50">
              <svg className="mb-4 h-12 w-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
              <p className="text-center text-xs uppercase tracking-[0.28em] text-slate-500">Nexus is silent. Start the first transmission.</p>
            </div>
          ) : (
            visibleMessages.map((message, index) => {
              const isMe = user?.id === message.user_id
              const isMsgSysDev = message.author_email === 'snowtz638@gmail.com' || message.author_email === process.env.NEXT_PUBLIC_DEVELOPER_EMAIL
              const msgPlan = message.author_plan || 'free'

              return (
                <div key={message.id || index} className={`group flex max-w-full flex-col ${isMe ? 'items-end' : 'items-start'} animate-slide-up`} style={{ animationFillMode: 'both' }}>
                  <div className={`mb-1.5 flex items-center gap-2 px-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{message.author_name}</span>
                    {isMsgSysDev ? (
                      <Badge status="danger">SYS_DEV</Badge>
                    ) : msgPlan === 'pro' ? (
                      <Badge status="pro">Pro</Badge>
                    ) : (
                      <Badge status="free">Free</Badge>
                    )}
                  </div>

                  <div className={`flex items-center gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`max-w-[85%] rounded-[20px] px-5 py-3.5 shadow-lg sm:max-w-md ${isMe ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : isMsgSysDev ? 'border border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-50' : 'border border-white/10 bg-white/[0.04] text-slate-100'}`}>
                      <p className="text-sm leading-relaxed md:text-base">
                        {renderMessageWithTags(message.content)}
                      </p>
                    </div>

                    {isMasterAdmin && (
                      <button onClick={() => handleDeleteMessage(message.id)} title="Erase record" className="opacity-0 transition-opacity group-hover:opacity-100 rounded-full p-2 text-red-300 hover:bg-red-400/10 hover:text-red-200">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>

                  <span className="mt-1.5 px-2 text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-500">{formatTime(message.created_at)}</span>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="relative z-20 border-t border-white/10 bg-slate-950/70 p-4 sm:p-6">
          <form onSubmit={handleSendMessage} className="flex items-end gap-3">
            <div className="flex flex-1 items-center rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-2 shadow-inner transition-all focus-within:border-cyan-400/40 focus-within:ring-1 focus-within:ring-cyan-400/20">
              <input
                type="text"
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                placeholder="Broadcast to global nexus (use @username to tag)..."
                className="w-full flex-1 border-none bg-transparent py-2 text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-0"
                disabled={isSending}
              />
            </div>
            <Button
              type="submit"
              isLoading={isSending}
              disabled={!newMessage.trim()}
              className="h-12 w-12 rounded-full px-0 text-[10px] font-semibold uppercase tracking-[0.22em]"
            >
              Send
            </Button>
          </form>
          <p className="mt-3 text-center text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-500">Press Enter to broadcast</p>
        </div>
      </Card>
    </div>
  )
}
