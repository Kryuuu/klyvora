'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { getClientSessionUser } from '@/lib/authClient'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function NetworkPage() {
  const supabase = createClient()
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [network, setNetwork] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [directMessages, setDirectMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)

  const refreshNetwork = useCallback(async () => {
    const { data } = await supabase.rpc('get_my_friends')
    if (data) setNetwork(data)
  }, [supabase])

  useEffect(() => {
    let mounted = true

    async function loadData() {
      const user = await getClientSessionUser(supabase)
      if (!user) return
      setUser(user)

      if (!mounted) return
      await refreshNetwork(user.id)
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [supabase, refreshNetwork])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [directMessages])

  useEffect(() => {
    if (!user || !activeChat) return

    const loadDMs = async () => {
      const { data } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeChat.friend_id}),and(sender_id.eq.${activeChat.friend_id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) setDirectMessages(data.reverse())
    }

    loadDMs()

    const channel = supabase
      .channel(`dm-${user.id}-${activeChat.friend_id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
        const message = payload.new
        if (
          (message.sender_id === user.id && message.receiver_id === activeChat.friend_id) ||
          (message.sender_id === activeChat.friend_id && message.receiver_id === user.id)
        ) {
          setDirectMessages((current) => {
            if (current.some((item) => item.id === message.id)) return current
            return [...current, message]
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user, activeChat])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setIsSearching(true)

    const { data } = await supabase.rpc('search_users_by_username', { search_term: searchQuery.trim() })
    setSearchResults(data || [])
    setIsSearching(false)
  }

  const handleAddFriend = async (receiverId) => {
    await supabase.from('friendships').insert([{ requester_id: user.id, receiver_id: receiverId, status: 'pending' }])
    setSearchResults(searchResults.filter((item) => item.id !== receiverId))
    refreshNetwork()
  }

  const handleAcceptFriend = async (friendId) => {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('requester_id', friendId).eq('receiver_id', user.id)
    refreshNetwork()
  }

  const handleSendDM = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat || !user) return

    setIsSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    const { data: insertedMsg } = await supabase.from('direct_messages').insert([
      {
        sender_id: user.id,
        receiver_id: activeChat.friend_id,
        content,
      },
    ]).select().single()

    if (insertedMsg) {
      setDirectMessages((prev) => {
        if (prev.some((item) => item.id === insertedMsg.id)) return prev
        return [...prev, insertedMsg]
      })
    }

    setIsSending(false)
  }

  const formatTime = (isoString) => new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const myFriends = useMemo(() => network.filter((item) => item.friendship_status === 'accepted'), [network])
  const pendingRequests = useMemo(() => network.filter((item) => item.friendship_status === 'pending' && !item.is_requester), [network])

  return (
    <div className="relative z-10 flex h-[calc(100vh-140px)] w-full flex-col gap-6 animate-fade-in lg:flex-row">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[120px] -z-10" />

      <div className="flex w-full flex-col gap-6 lg:w-1/3">
        <Card className="rounded-[30px] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Discover</div>
              <h2 className="mt-2 text-xl font-semibold text-white">Connections</h2>
            </div>
            <Badge status="doing">Online</Badge>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search username..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
            />
            <Button type="submit" className="h-12 px-4 text-[10px] font-semibold uppercase tracking-[0.22em]">
              {isSearching ? '...' : 'Find'}
            </Button>
          </form>

          <div className="mt-4 space-y-2">
            {searchResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <span className="text-sm text-white">@{result.username}</span>
                <Button variant="secondary" onClick={() => handleAddFriend(result.id)} className="h-9 px-3 text-[10px] font-semibold uppercase tracking-[0.22em]">
                  Connect
                </Button>
              </div>
            ))}
            {searchResults.length === 0 && !isSearching && searchQuery && (
              <p className="py-2 text-center text-xs text-slate-500">No neural signatures found.</p>
            )}
          </div>
        </Card>

        {pendingRequests.length > 0 && (
          <Card className="rounded-[30px] p-5 border-amber-400/20">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-amber-300">Pending</div>
                <h2 className="mt-2 text-xl font-semibold text-white">Signals</h2>
              </div>
              <Badge status="warning">{pendingRequests.length}</Badge>
            </div>
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <div key={request.friend_id} className="flex items-center justify-between rounded-2xl border border-amber-400/10 bg-amber-400/[0.05] p-3">
                  <span className="text-sm text-amber-100">@{request.friend_name}</span>
                  <Button variant="secondary" onClick={() => handleAcceptFriend(request.friend_id)} className="h-9 px-3 text-[10px] font-semibold uppercase tracking-[0.22em]">
                    Accept
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="flex min-h-[300px] flex-1 flex-col rounded-[30px] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Network</div>
              <h2 className="mt-2 text-xl font-semibold text-white">My connections</h2>
            </div>
            <Badge status="pro">{myFriends.length}</Badge>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {myFriends.length === 0 ? (
              <p className="mt-10 text-center text-xs text-slate-500 italic">Your network is empty.</p>
            ) : (
              myFriends.map((friend) => (
                <button
                  key={friend.friend_id}
                  onClick={() => setActiveChat(friend)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all ${activeChat?.friend_id === friend.friend_id ? 'border-cyan-400/30 bg-cyan-400/[0.08]' : 'border-white/10 bg-white/[0.03] hover:border-cyan-400/20 hover:bg-cyan-400/[0.05]'}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-semibold text-slate-950">
                    {friend.friend_name.substring(0, 1)}
                  </div>
                  <span className={`text-sm ${activeChat?.friend_id === friend.friend_id ? 'text-cyan-200' : 'text-slate-200'}`}>@{friend.friend_name}</span>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="relative flex h-full w-full flex-col overflow-hidden rounded-[32px] p-0 lg:w-2/3">
        {!activeChat ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 h-16 w-16 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
              <svg className="h-8 w-8 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <p className="max-w-sm text-xs uppercase tracking-[0.3em] text-slate-500">Select a neural node to establish direct tunnel.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/70 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-semibold text-slate-950">
                  {activeChat.friend_name.substring(0, 1)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white line-clamp-1">@{activeChat.friend_name}</h3>
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Encrypted tunnel secure
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              <div className="absolute inset-0 bg-dotted-grid opacity-5 pointer-events-none" />
              {directMessages.length === 0 ? (
                <p className="mt-20 text-center text-xs uppercase tracking-[0.28em] text-slate-500">Tunnel empty. Say hello.</p>
              ) : (
                directMessages.map((message) => {
                  const isMe = message.sender_id === user.id
                  return (
                    <div key={message.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-slide-up`} style={{ animationFillMode: 'both' }}>
                      <div className={`max-w-[80%] rounded-[18px] px-4 py-2.5 text-sm shadow-lg ${isMe ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'border border-white/10 bg-white/[0.04] text-slate-100'}`}>
                        {message.content}
                      </div>
                      <span className="mt-1.5 px-2 text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-500">{formatTime(message.created_at)}</span>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 bg-slate-950/70 p-4 sm:p-6">
              <form onSubmit={handleSendDM} className="flex gap-3">
                <div className="flex flex-1 items-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-1.5 shadow-inner transition-all focus-within:border-cyan-400/40 focus-within:ring-1 focus-within:ring-cyan-400/20">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    placeholder="Transmit message..."
                    className="w-full flex-1 border-none bg-transparent py-1.5 text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-0"
                    disabled={isSending}
                  />
                </div>
                <Button
                  type="submit"
                  isLoading={isSending}
                  disabled={!newMessage.trim()}
                  className="h-12 w-12 rounded-xl px-0 text-[10px] font-semibold uppercase tracking-[0.22em]"
                >
                  Send
                </Button>
              </form>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
