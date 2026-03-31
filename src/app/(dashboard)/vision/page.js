'use client'

import { useState, useEffect } from 'react'
import { createClient } from "@/lib/supabaseClient"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"

export default function VisionPage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Storage for generated assets
  const [visionResult, setVisionResult] = useState(null)
  const [visionRaw, setVisionRaw] = useState(null)

  // Subscription Checking States
  const [isFreeLimit, setIsFreeLimit] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function checkSub() {
      setIsChecking(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { 
        setIsChecking(false); 
        router.push('/login');
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

      // Check Free Tier Usage Limits
      const { count, error: countErr } = await supabase.from('vision_history').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      
      if (count && count >= 3) {
         setIsFreeLimit(true)
      }
      setIsChecking(false)
    }
    checkSub()
  }, [supabase, router])

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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
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
      // Refresh checking state to grab newest vision row count!
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
         const { count } = await supabase.from('vision_history').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
         if (count && count >= 3 && user.email !== process.env.NEXT_PUBLIC_DEVELOPER_EMAIL) {
             setIsFreeLimit(true)
         }
      }
    }
  }

  if (isChecking) return <div className="h-[80vh] flex items-center justify-center text-slate-500 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse italic">Connecting to Vision Neural Array...</div>

  if (isFreeLimit) {
     return (
        <Card className="max-w-2xl mx-auto p-12 text-center border-blue-500/30 bg-slate-900/80 backdrop-blur-3xl mt-12 shadow-2xl animate-slide-up rounded-[40px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            <Badge className="inline-block mb-6 px-4 py-1.5 font-black text-[9px] uppercase tracking-widest italic bg-red-500/10 text-red-500 border-none">Buffer Capacity Reached</Badge>
            <h2 className="text-4xl font-black text-slate-100 mb-4 italic tracking-tighter uppercase">Vision Matrix Full</h2>
            <p className="text-slate-400 mb-10 text-sm leading-relaxed max-w-sm mx-auto font-medium italic">Your free tier permits a maximum of 3 Vision Array generations. Please upgrade your status to process unlimited pixels.</p>
            <Link href="/subscription" className="w-full sm:w-auto inline-block">
                <Button className="w-full h-14 px-12 font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-blue-600/30 rounded-2xl bg-blue-600 text-white hover:bg-blue-500">Upgrade Access Protocol &rarr;</Button>
            </Link>
        </Card>
     )
  }

  return (
    <div className="space-y-12 animate-fade-in relative">
      <div className="absolute top-[-100px] right-[-10%] w-[800px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-10 gap-6">
        <div className="space-y-2">
           <h1 className="text-4xl font-black text-slate-100 italic tracking-tighter uppercase leading-none">Vision Synthesis</h1>
           <p className="text-slate-400 font-bold italic tracking-tight text-sm uppercase">Nano Banana (Gemini 2.5 Flash Image)</p>
        </div>
        <div className="flex items-center gap-4">
           <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black uppercase text-[9px] tracking-widest italic rounded-lg px-3 py-1">
              SynthID Watermarked
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Input Panel */}
        <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
           <Card className="p-0 border-slate-700 overflow-hidden bg-slate-800 shadow-xl relative flex flex-col rounded-[32px] group">
              <div className="p-6 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
                    <h2 className="text-[10px] font-black text-slate-100 uppercase tracking-[0.3em]">Texture Directive</h2>
                 </div>
              </div>
              
              <form onSubmit={handleGenerate} className="flex-1 flex flex-col">
                <textarea
                  className="flex-1 min-h-[250px] w-full bg-transparent p-8 text-xl text-slate-100 placeholder-slate-600 focus:outline-none resize-none font-sans font-medium italic !leading-relaxed"
                  placeholder="Describe your vision matrix here. E.g. 'A futuristic city skyline at midnight with glowing blue neon lights, highly detailed, 8k resolution...'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                />
                
                {error && (
                  <div className="mx-8 mb-6 text-red-400 font-bold uppercase tracking-widest text-[9px] bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                    {error}
                  </div>
                )}
                
                <div className="p-6 bg-slate-900 border-t border-slate-700 flex flex-col space-y-3">
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">Inference powered natively by Gemini's multimodal reasoning protocol.</p>
                   <Button 
                     type="submit" 
                     disabled={loading}
                     className="w-full h-14 font-black uppercase text-[11px] tracking-[0.4em] rounded-[20px] bg-blue-600 text-white hover:bg-blue-500 border-none shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02]"
                   >
                     {loading ? 'Synthesizing...' : 'Generate Vision Array'}
                   </Button>
                </div>
              </form>
           </Card>
        </div>

        {/* Display Panel */}
        <div className="lg:col-span-12 xl:col-span-7">
           {loading ? (
             <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-800 border-2 border-dashed border-slate-700 rounded-[32px] shadow-sm">
                 <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin mb-6" />
                 <h3 className="text-xl font-black text-slate-100 uppercase tracking-widest italic">Nano Banana Array Wakeup</h3>
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">Connecting to Gemini Inference...</p>
             </div>
           ) : visionResult ? (
             <div className="h-full flex flex-col group animate-slide-up">
                <div className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-[32px] overflow-hidden flex items-center justify-center p-4 relative shadow-2xl">
                   {/* Generated Image Preview Box */}
                   <img 
                     src={visionResult} 
                     alt="Synthesized AI Vision" 
                     className="max-h-[600px] w-auto h-auto rounded-2xl object-contain z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-[1.01]"
                   />
                </div>
                
                <div className="mt-6 flex justify-between items-center bg-slate-800 border border-slate-700 p-6 rounded-[24px]">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Right-click image to save matrix permanently.</p>
                   <Button 
                     onClick={() => { setPrompt(''); setVisionResult(null); }}
                     variant="outline"
                     className="text-[10px] font-black uppercase tracking-widest hover:bg-slate-700"
                   >
                     Clear Buffer
                   </Button>
                </div>
             </div>
           ) : visionRaw ? (
             <div className="h-full min-h-[500px] flex flex-col bg-slate-800 border border-slate-700 rounded-[32px] p-8">
                <h3 className="text-xl font-black text-slate-100 uppercase tracking-widest italic mb-4">Raw Matrix Received</h3>
                <p className="text-sm text-slate-400 mb-6 font-medium">The Gemini API successfully reasoned on your request, but its output lacks the expected Base64 Image string in the `inlineData` node.</p>
                <div className="flex-1 bg-slate-900 rounded-xl p-6 overflow-auto border border-slate-700 font-mono text-xs text-blue-400">
                  <pre>{JSON.stringify(visionRaw, null, 2)}</pre>
                </div>
             </div>
           ) : (
             <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-20 text-center rounded-[32px] border border-slate-700 bg-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-dotted-grid opacity-10" />
                <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center mb-8 rotate-12 transition-transform hover:rotate-0 duration-500 shadow-xl group-hover:scale-110 z-10">
                   <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-xl font-black text-slate-100 uppercase tracking-widest italic z-10">Neural Vision Array</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-6 max-w-xs leading-relaxed italic z-10">Initiate a prompt sequence to wake the serverless GPU network.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
