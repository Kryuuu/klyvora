'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />

      <div className="max-w-4xl w-full text-center z-10 animate-slide-up">
        {/* Logo Section */}
        <div className="flex justify-center mb-12">
           <div className="w-20 h-20 rounded-[28px] bg-gradient-to-tr from-purple-600 to-purple-400 shadow-2xl shadow-purple-500/30 flex items-center justify-center transform hover:rotate-12 transition-transform duration-500 cursor-pointer">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
           </div>
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-6">
           <Badge className="bg-purple-500/10 text-purple-400 border-none px-6 py-2 rounded-full font-black italic tracking-[0.2em] text-[10px] uppercase">
              Neural Synthesis v2.4 Active
           </Badge>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter mb-8 leading-[0.95] md:leading-[0.9]">
           UNLEASH THE POWER OF <br />
           <span className="text-purple-500 underline decoration-purple-500/20 underline-offset-[12px]">KLYVORA AI</span>
        </h1>

        {/* Subtitle */}
        <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12 italic leading-relaxed">
           The next-generation neural matrix for automated AI workflows. 
           Connect, synthesize, and scale your operational clusters with Gemini 2.0 pulse logic.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
           <Button 
             onClick={() => router.push('/login')}
             className="w-full sm:w-auto h-16 px-12 text-sm font-black uppercase tracking-[0.2em] italic shadow-purple-600/30"
           >
             Initialize Interface &rarr;
           </Button>
           
           <Button 
             variant="outline"
             onClick={() => router.push('/register')}
             className="w-full sm:w-auto h-16 px-12 text-sm font-black uppercase tracking-[0.1em] italic border-white/5 hover:bg-white/5"
           >
             Register New Node
           </Button>
        </div>

        {/* Trust/Social Proof */}
        <div className="mt-24 pt-12 border-t border-white/5 opacity-40">
           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Integrated with Neural Network clusters worldwide</p>
        </div>
      </div>
    </main>
  )
}