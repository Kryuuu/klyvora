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
        {/* Logo Section with Neural Bloom */}
        <div className="flex justify-center mb-16 relative group">
           {/* Neural Pulse Backdrop */}
           <div className="absolute inset-0 bg-purple-600/20 blur-[80px] rounded-full scale-150 animate-pulse-slow" />
           <div className="absolute inset-0 bg-indigo-500/10 blur-[40px] rounded-full scale-110 animate-glow-flow" />
           
           <div className="relative z-10 w-32 h-32 flex items-center justify-center transform transition-all duration-1000 group-hover:scale-110 group-hover:rotate-[360deg]">
              {/* Outer Ring Decoration */}
              <div className="absolute inset-0 border border-purple-500/20 rounded-[40px] rotate-45 group-hover:border-purple-500/50 transition-colors duration-700" />
              <div className="absolute inset-0 border border-indigo-500/10 rounded-[40px] -rotate-12 group-hover:border-indigo-500/30 transition-colors duration-700 delay-100" />
              
              <img 
                src="/logo-klyvora.png" 
                alt="KlyVora Collective" 
                className="w-20 h-20 object-contain drop-shadow-[0_0_30px_rgba(124,58,237,0.4)]" 
              />
           </div>
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-6">
           <Badge className="bg-purple-500/10 text-purple-400 border-none px-6 py-2 rounded-full font-black italic tracking-[0.2em] text-[10px] uppercase">
              Neural Synthesis v2.4 Active
           </Badge>
        </div>

        {/* Title with Gradient Polish */}
        <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter mb-8 leading-[0.95] md:leading-[0.85] uppercase">
           Unleash the <br />
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-indigo-400 animate-gradient-x underline decoration-purple-500/20 underline-offset-[20px]">KLYVORA AI</span>
        </h1>

        {/* Subtitle */}
        <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12 italic leading-relaxed">
           The next-generation neural matrix for automated AI workflows. 
           Connect, synthesize.
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