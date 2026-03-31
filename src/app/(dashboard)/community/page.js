'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from "@/lib/supabaseClient"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"

// Helper to safely parse and stylize @mentions
const renderMessageWithTags = (text) => {
  if (!text) return null
  const regex = /(@\w+)/g
  const parts = text.split(regex)
  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return (
        <span key={index} className="text-blue-200 font-extrabold bg-blue-500/30 px-1 py-0.5 rounded shadow-[0_0_10px_rgba(59,130,246,0.3)] mx-0.5">
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
  const [now, setNow] = useState(Date.now())
  
  const supabase = createClient()
  const messagesEndRef = useRef(null)

  // System Developer Check (Hardcoded explicit bypass per user req)
  const isMasterAdmin = user?.email === 'snowtz638@gmail.com' || user?.email === process.env.NEXT_PUBLIC_DEVELOPER_EMAIL

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // 1. Initial Load & Auth
  useEffect(() => {
    let mounted = true

    async function initializeChat() {
       const { data: { user } } = await supabase.auth.getUser()
       if (!user) return
       setUser(user)
       
       // Fetch name and plan in parallel
       const [profRes, subRes] = await Promise.all([
          supabase.from('profiles').select('name').eq('id', user.id).maybeSingle(),
          supabase.from('subscriptions').select('plan, status').eq('user_id', user.id).maybeSingle()
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

    // Interval to trigger 5-minute sweeps
    const sweepInterval = setInterval(() => {
      setNow(Date.now())
    }, 60000)

    return () => { 
        mounted = false
        clearInterval(sweepInterval)
    }
  }, [supabase])

  // 2. Universal Real-time Listener (Insert & Delete)
  useEffect(() => {
    const channel = supabase.channel('global-chat')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'messages' }, 
          (payload) => {
             if (payload.eventType === 'INSERT') {
                 setMessages((current) => {
                    if (current.some(m => m.id === payload.new.id)) return current
                    return [...current, payload.new]
                 })
                 setTimeout(scrollToBottom, 100)
             } else if (payload.eventType === 'DELETE') {
                 // The Admin erased a message, remote wipe it instantly
                 setMessages((current) => current.filter(m => m.id !== payload.old.id))
             }
          }
      )
      .subscribe()

    return () => {
       supabase.removeChannel(channel)
    }
  }, [supabase])

  // 3. Send Logic
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    setIsSending(true)
    const content = newMessage.trim()
    setNewMessage('') // Optimistic UI clear

    const { data: insertedMsg, error } = await supabase.from('messages').insert([{ 
      user_id: user.id, 
      author_name: profileName,
      author_email: user.email,
      author_plan: userPlan || 'free',
      content: content 
    }]).select().single()

    if (error) {
       console.error("Failed to send message:", error)
       setNewMessage(content) 
    } else if (insertedMsg) {
       setMessages(prev => {
          if (prev.some(m => m.id === insertedMsg.id)) return prev
          return [...prev, insertedMsg]
       })
       setTimeout(scrollToBottom, 100)
    }
    
    setIsSending(false)
  }

  // 4. Admin Delete Action
  const handleDeleteMessage = async (msgId) => {
     if (!isMasterAdmin) return
     // Optimistically remove locally
     setMessages((current) => current.filter(m => m.id !== msgId))
     // Issue kill command to DB
     await supabase.from('messages').delete().eq('id', msgId)
  }

  // Admin Wipe All Action
  const handlePurgeAll = async () => {
     if (!isMasterAdmin || !window.confirm("WARNING: Are you sure you want to annihilate all neural transmissions? This cannot be undone.")) return
     setIsSending(true)
     setMessages([]) // Optimistic local wipe
     
     // Delete all rows where id is not null (effectively truncates the table legally via REST)
     await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000')
     setIsSending(false)
  }

  // Formatting & Filtering Calculations
  const formatTime = (isoString) => {
    const d = new Date(isoString)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // The 5-Minute Rules Engine:
  // If MasterAdmin -> Show all. Else -> Show only if age is strictly less than 5 mins.
  const visibleMessages = isMasterAdmin 
     ? messages 
     : messages.filter(msg => (now - new Date(msg.created_at).getTime()) < 5 * 60 * 1000)

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in relative z-10 w-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-6 mb-6 gap-4">
        <div className="space-y-1">
           <div className="flex items-center gap-3">
               <h1 className="text-3xl font-black text-slate-100 italic tracking-tighter uppercase leading-none">Global Nexus</h1>
               {isMasterAdmin && <Badge className="bg-red-500/10 text-red-500 border border-red-500/30 font-black uppercase tracking-widest text-[9px]">God Mode Active</Badge>}
           </div>
           
           <p className="text-slate-400 font-bold italic tracking-tight text-xs uppercase">
              {isMasterAdmin ? "Unrestricted Global Log Monitoring" : "Encrypted Neural Transmissions — Ephemeral Messages (5 Min)"}
           </p>
        </div>
        <div className="flex items-center gap-3">
           {isMasterAdmin && (
              <button 
                 onClick={handlePurgeAll}
                 disabled={isSending || messages.length === 0}
                 className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 transition-colors mr-2 disabled:opacity-50"
              >
                 <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                 <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mt-0.5">Purge All</span>
              </button>
           )}
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mt-0.5">Realtime Active</span>
           </div>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col bg-slate-900 border-slate-800 shadow-2xl rounded-[32px] overflow-hidden relative">
        <div className="absolute inset-0 bg-dotted-grid opacity-10 pointer-events-none" />
        
        {/* Messages Layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 flex flex-col relative z-20">
           {visibleMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                 <svg className="w-12 h-12 mb-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                 <p className="text-xs font-black uppercase tracking-[0.3em] text-center italic">Nexus is completely silent.<br/>Initiate the first transmission.</p>
              </div>
           ) : (
             visibleMessages.map((msg, i) => {
                const isMe = user?.id === msg.user_id
                const isMsgSysDev = msg.author_email === 'snowtz638@gmail.com' || msg.author_email === process.env.NEXT_PUBLIC_DEVELOPER_EMAIL
                const msgPlan = msg.author_plan || 'free'
                
                return (
                  <div key={msg.id || i} className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full animate-slide-up`} style={{ animationFillMode: 'both' }}>
                     {/* Name & Badge Row */}
                     <div className={`flex items-center gap-2 mb-1.5 px-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                         <span className={`text-[11px] font-black uppercase tracking-wider ${isMsgSysDev ? 'text-fuchsia-400' : 'text-slate-400'}`}>
                             {msg.author_name}
                         </span>
                         
                         {/* Dynamic Badges */}
                         {isMsgSysDev ? (
                             <Badge className="bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 text-[8px] font-black uppercase tracking-widest px-2 py-0 shadow-[0_0_10px_rgba(217,70,239,0.2)]">
                                SYS_DEV
                             </Badge>
                         ) : msgPlan === 'pro' ? (
                             <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[8px] font-bold uppercase tracking-widest px-2 py-0">
                                Pro
                             </Badge>
                         ) : (
                             <Badge className="bg-slate-800 text-slate-400 border border-slate-700 text-[8px] font-bold uppercase tracking-widest px-2 py-0">
                                Free
                             </Badge>
                         )}
                     </div>

                     {/* Message Bubble Block */}
                     <div className={`flex items-center gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                         
                         <div 
                            className={`px-5 py-3.5 rounded-[20px] shadow-lg max-w-[85%] sm:max-w-md break-words ${
                               isMe 
                                 ? isMsgSysDev 
                                     ? 'bg-gradient-to-tr from-fuchsia-700 to-fuchsia-600 border border-fuchsia-500/50 text-fuchsia-50 rounded-tr-sm shadow-[0_0_15px_rgba(192,38,211,0.2)]' 
                                     : 'bg-blue-600 text-white rounded-tr-sm' 
                                 : isMsgSysDev
                                     ? 'bg-fuchsia-900/40 text-fuchsia-100 border border-fuchsia-500/30 rounded-tl-sm shadow-[0_0_10px_rgba(192,38,211,0.1)]'
                                     : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-sm'
                            }`}
                         >
                            <p className="text-sm md:text-base font-medium leading-relaxed">
                               {renderMessageWithTags(msg.content)}
                            </p>
                         </div>

                         {/* Admin Delete Action Button */}
                         {isMasterAdmin && (
                             <button 
                                onClick={() => handleDeleteMessage(msg.id)}
                                title="Erase Record from Database"
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:bg-red-500/10 rounded-full"
                             >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                         )}

                     </div>
                     
                     {/* Timestamp */}
                     <span className={`text-[9px] font-bold tracking-widest uppercase text-slate-500 mt-1.5 px-2`}>
                        {formatTime(msg.created_at)}
                     </span>
                  </div>
                )
             })
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 relative z-20">
           <form onSubmit={handleSendMessage} className="flex items-end gap-3">
              <div className="flex-1 bg-slate-950 border border-slate-700 rounded-3xl flex items-center px-6 py-2 shadow-inner focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                 <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Broadcast to global nexus (use @username to tag)..."
                    className="flex-1 w-full bg-transparent border-none text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-0 text-sm py-2 font-medium"
                    disabled={isSending}
                 />
              </div>
              <button 
                type="submit" 
                disabled={isSending || !newMessage.trim()}
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${
                  newMessage.trim() 
                    ? isMasterAdmin ? 'bg-fuchsia-600 text-white hover:bg-fuchsia-500 hover:scale-105 shadow-[0_0_20px_rgba(192,38,211,0.5)]' : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                  {isSending ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                     <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  )}
              </button>
           </form>
           <p className="text-center mt-3 text-[9px] font-black uppercase tracking-widest text-slate-600 italic">Press Enter to Broadcast</p>
        </div>
      </Card>
    </div>
  )
}
