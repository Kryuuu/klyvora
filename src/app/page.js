'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6 relative">
      {/* Background Dots Canvas */}
      <div className="absolute inset-0 bg-dotted-grid pointer-events-none opacity-40" />

      <div className="max-w-4xl w-full text-center z-10 animate-fade-in relative">
        
        {/* Logo Section */}
        <div className="flex justify-center mb-10">
           <div className="w-24 h-24 flex items-center justify-center bg-slate-800 border border-slate-700 shadow-sm rounded-2xl">
              <img 
                src="/logo-klyvora.png" 
                alt="KlyVora Collective" 
                className="w-14 h-14 object-contain" 
              />
           </div>
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-6">
           <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-1">
              Neural Synthesis v2.4 Active
           </Badge>
        </div>

        {/* Clean Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-100 tracking-tight mb-8 leading-tight">
           Unleash the power of <br />
           <span className="text-blue-500">KlyVora AI</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
           The next-generation neural matrix for automated AI workflows. 
           Connect, synthesize, and deploy with ease.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <Button 
             onClick={() => router.push('/login')}
             className="w-full sm:w-auto h-12 px-8 text-base shadow-md"
           >
             Initialize Interface &rarr;
           </Button>
           
           <Button 
             variant="outline"
             onClick={() => router.push('/register')}
             className="w-full sm:w-auto h-12 px-8 text-base"
           >
             Register New Node
           </Button>
        </div>

        {/* Trust/Social Proof */}
        <div className="mt-24 pt-8 border-t border-slate-800">
           <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Integrated with global neural clusters</p>
        </div>
      </div>
    </main>
  )
}