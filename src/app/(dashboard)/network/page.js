'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from "@/lib/supabaseClient"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"

export default function NetworkPage() {
  const supabase = createClient()
  const [user, setUser] = useState(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const [network, setNetwork] = useState([])
  
  const [activeChat, setActiveChat] = useState(null) // { friend_id, friend_name }
  const [directMessages, setDirectMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    let mounted = true
    async function loadData() {
       const { data: { user } } = await supabase.auth.getUser()
       if (!user) return
       setUser(user)
       
       await refreshNetwork(user.id)
    }
    loadData()
    return () => { mounted = false }
  }, [supabase])

  // Scroll to bottom of DM
  useEffect(() => {
     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [directMessages])

  // DM Real-time Listener
  useEffect(() => {
    if (!user || !activeChat) return
    
    // Load existing DMs
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

    const channel = supabase.channel(`dm-${user.id}-${activeChat.friend_id}`)
      .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'direct_messages' }, 
          (payload) => {
             // Only append if it belongs to this active chat
             const p = payload.new
             if ( (p.sender_id === user.id && p.receiver_id === activeChat.friend_id) || 
                  (p.sender_id === activeChat.friend_id && p.receiver_id === user.id) ) {
                
                setDirectMessages((current) => {
                   if (current.some(m => m.id === p.id)) return current
                   return [...current, p]
                })
             }
          }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, user, activeChat])

  const refreshNetwork = async (uid = user?.id) => {
      const { data } = await supabase.rpc('get_my_friends')
      if (data) setNetwork(data)
  }

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
      alert('Neural link request sent!')
      setSearchResults(searchResults.filter(u => u.id !== receiverId))
      refreshNetwork()
  }

  const handleAcceptFriend = async (friendId) => {
      // Find the specific friendship row bridging me and friendId
      // Status update needs ID. We can use supabase update where requester = friendId and receiver = me
      await supabase.from('friendships')
          .update({ status: 'accepted' })
          .eq('requester_id', friendId)
          .eq('receiver_id', user.id)
      
      refreshNetwork()
  }

  const handleSendDM = async (e) => {
      e.preventDefault()
      if (!newMessage.trim() || !activeChat || !user) return

      setIsSending(true)
      const content = newMessage.trim()
      setNewMessage('')
      
      const { data: insertedMsg } = await supabase.from('direct_messages').insert([{
         sender_id: user.id,
         receiver_id: activeChat.friend_id,
         content: content
      }]).select().single()

      if (insertedMsg) {
         setDirectMessages(prev => {
            if (prev.some(m => m.id === insertedMsg.id)) return prev
            return [...prev, insertedMsg]
         })
      }
      setIsSending(false)
  }

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const myFriends = network.filter(n => n.friendship_status === 'accepted')
  const pendingRequests = network.filter(n => n.friendship_status === 'pending' && !n.is_requester)

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 animate-fade-in relative z-10 w-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Left Pane: Network Hub */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
         {/* Search Box */}
         <Card className="p-5 bg-slate-900 shadow-2xl rounded-3xl border-slate-800">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-widest mb-4">Discover Connections</h2>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
               <input 
                 type="text" 
                 placeholder="Search username..." 
                 value={searchQuery}
                 onChange={(e)=>setSearchQuery(e.target.value)}
                 className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
               />
               <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-sm font-bold shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all">
                  {isSearching ? '...' : 'Find'}
               </button>
            </form>

            <div className="space-y-2">
               {searchResults.map(res => (
                  <div key={res.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/50">
                     <span className="text-xs font-bold text-slate-300">@{res.username}</span>
                     <button onClick={() => handleAddFriend(res.id)} className="text-[10px] uppercase font-black tracking-wider bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                        Connect
                     </button>
                  </div>
               ))}
               {searchResults.length === 0 && !isSearching && searchQuery && <p className="text-xs text-slate-500 italic text-center py-2">No neural signatures found.</p>}
            </div>
         </Card>

         {/* Pending Approvals */}
         {pendingRequests.length > 0 && (
            <Card className="p-5 bg-slate-900 shadow-2xl rounded-3xl border-amber-500/20">
               <h2 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                  Pending Signals <Badge className="bg-amber-500 text-amber-950">{pendingRequests.length}</Badge>
               </h2>
               <div className="space-y-2">
                  {pendingRequests.map(req => (
                     <div key={req.friend_id} className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <span className="text-xs font-bold text-amber-200">@{req.friend_name}</span>
                        <button onClick={() => handleAcceptFriend(req.friend_id)} className="text-[10px] uppercase font-black tracking-wider bg-amber-500/20 hover:bg-amber-500 text-amber-500 hover:text-amber-950 px-3 py-1.5 rounded-lg transition-colors">
                           Accept
                        </button>
                     </div>
                  ))}
               </div>
            </Card>
         )}

         {/* Active Friendlist */}
         <Card className="p-5 flex-1 bg-slate-900 shadow-2xl rounded-3xl border-slate-800 flex flex-col min-h-[300px]">
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-widest mb-4">Neural Network</h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
               {myFriends.length === 0 ? (
                  <p className="text-xs font-medium text-slate-500 text-center italic mt-10">Your network is empty.</p>
               ) : (
                  myFriends.map(friend => (
                     <div 
                        key={friend.friend_id} 
                        onClick={() => setActiveChat(friend)}
                        className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border transition-all ${
                           activeChat?.friend_id === friend.friend_id 
                              ? 'bg-indigo-600/20 border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.15)]' 
                              : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                     >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg font-black text-white text-xs uppercase">
                           {friend.friend_name.substring(0, 1)}
                        </div>
                        <span className={`text-sm font-bold ${activeChat?.friend_id === friend.friend_id ? 'text-indigo-300' : 'text-slate-300'}`}>
                           @{friend.friend_name}
                        </span>
                     </div>
                  ))
               )}
            </div>
         </Card>
      </div>

      {/* Right Pane: Private Tunnel (DM) */}
      <Card className="w-full lg:w-2/3 h-full flex flex-col bg-slate-900 shadow-2xl rounded-[32px] border-slate-800 relative overflow-hidden">
         {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
               <svg className="w-16 h-16 mb-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
               <p className="text-xs font-black uppercase tracking-[0.3em] text-center italic text-slate-400">Select a neural node<br/>to establish direct tunnel.</p>
            </div>
         ) : (
            <>
               {/* DM Header */}
               <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center font-black text-white text-sm uppercase shadow-lg shadow-indigo-500/30 line-clamp-1">
                        {activeChat.friend_name.substring(0, 1)}
                     </div>
                     <div>
                        <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest line-clamp-1">@{activeChat.friend_name}</h3>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> ENCRYPTED TUNNEL SECURE</p>
                     </div>
                  </div>
               </div>

               {/* Messages Area */}
               <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative z-10">
                  <div className="absolute inset-0 bg-dotted-grid opacity-5 pointer-events-none" />
                  {directMessages.length === 0 ? (
                     <p className="text-xs font-bold uppercase tracking-widest text-slate-600 italic text-center mt-20">Tunnel Empty. Say Hello.</p>
                  ) : (
                     directMessages.map(msg => {
                        const isMe = msg.sender_id === user.id
                        return (
                           <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-slide-up`} style={{ animationFillMode: 'both' }}>
                              <div 
                                 className={`px-4 py-2.5 rounded-[18px] shadow-lg max-w-[80%] text-sm font-medium ${
                                    isMe 
                                      ? 'bg-indigo-600 text-indigo-50 rounded-tr-sm shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                                 }`}
                              >
                                 {msg.content}
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mt-1">{formatTime(msg.created_at)}</span>
                           </div>
                        )
                     })
                  )}
                  <div ref={messagesEndRef} />
               </div>

               {/* Input Box */}
               <div className="p-4 bg-slate-900 border-t border-slate-800 relative z-20">
                  <form onSubmit={handleSendDM} className="flex gap-3">
                     <div className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl flex items-center px-4 py-1.5 shadow-inner focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                        <input
                           type="text"
                           value={newMessage}
                           onChange={(e) => setNewMessage(e.target.value)}
                           placeholder="Transmit message..."
                           className="flex-1 w-full bg-transparent border-none text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-0 text-sm font-medium py-1.5"
                           disabled={isSending}
                        />
                     </div>
                     <button 
                       type="submit" 
                       disabled={isSending || !newMessage.trim()}
                       className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300 ${
                         newMessage.trim() 
                           ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
                           : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                       }`}
                     >
                         <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                     </button>
                  </form>
               </div>
            </>
         )}
      </Card>
    </div>
  )
}
