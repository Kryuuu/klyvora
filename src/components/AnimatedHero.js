'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function AnimatedHero() {
  const ref = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Mouse position tracking
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth springs for 3D tilt
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { damping: 30, stiffness: 200 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { damping: 30, stiffness: 200 })

  // Background gradient parallax
  const bgX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-30, 30]), { damping: 50, stiffness: 100 })
  const bgY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-30, 30]), { damping: 50, stiffness: 100 })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleMouseMove = (e) => {
    if (isMobile || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    // Calculate normalized position between -0.5 and 0.5
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }

  // Pre-generate random particles for stable render
  const [particles] = useState(() => 
    Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 12,
      delay: Math.random() * 5
    }))
  )

  return (
    <section 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1200 }}
      className="relative p-8 md:p-16 overflow-hidden border border-white/5 bg-[#12121a]/40 shadow-inner rounded-[32px] flex items-center justify-center lg:justify-start transition-smooth mb-16"
    >
      {/* 1. Background Gradient Parallax */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none"
        style={{ x: bgX, y: bgY }}
      >
         <div className="absolute top-[-40%] right-[-20%] w-[900px] h-[900px] bg-gradient-to-bl from-[#7c3aed]/15 via-transparent to-transparent blur-[120px] rounded-full" />
      </motion.div>

      {/* 2. Subtle Particles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-purple-400/30"
            style={{ 
              width: p.size, 
              height: p.size, 
              left: `${p.x}%`, 
              top: `${p.y}%` 
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              opacity: [0.1, 0.5, 0.1]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20 w-full max-w-6xl mx-auto">
        
        {/* Text Content Area */}
        <div className="flex-1 space-y-7 text-center md:text-left order-2 md:order-1 relative z-10">
           <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full mb-2 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">System Active</span>
           </div>
           
           <div className="space-y-3">
               <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-white tracking-tight leading-[1.1]">
                  Welcome to <br className="hidden md:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#a855f7]">KlyVora</span>
               </h1>
               
               <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-lg mx-auto md:mx-0 leading-relaxed text-balance">
                  Generate AI-powered workflows to automate your tasks efficiently. Turn complex ideas into structured logic instantly.
               </p>
           </div>

           <div className="pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <Link href="/generate" className="w-full sm:w-auto z-20">
                 <Button className="w-full h-14 px-8 bg-purple-600 hover:bg-purple-700 text-white font-extrabold uppercase tracking-widest text-[11px] rounded-xl shadow-[0_0_30px_rgba(124,58,237,0.25)] hover:shadow-[0_0_40px_rgba(124,58,237,0.4)] transition-all border border-purple-500/30">
                    Generate Workflow &rarr;
                 </Button>
              </Link>
           </div>
        </div>

        {/* 3 & 4. Interactive Logo & Glow Breathing */}
        <div className="flex-1 flex justify-center order-1 md:order-2 z-10 w-full md:w-auto">
          <motion.div
            style={!isMobile ? { rotateX, rotateY, transformStyle: "preserve-3d" } : {}}
            animate={isHovered && !isMobile ? { scale: 1.05 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative w-48 h-48 md:w-64 md:h-64 cursor-pointer group"
          >
             {/* Glow Breathing Effect */}
             <motion.div 
               className="absolute inset-0 rounded-[40px] bg-[#7c3aed]/30 blur-3xl"
               animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.8, 1.2, 0.8] }}
               transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
             />
             
             {/* Glass Container */}
             <div className="absolute inset-0 rounded-[40px] bg-gradient-to-tr from-purple-900/40 to-[#0f0f14]/80 border border-white/10 shadow-2xl flex items-center justify-center backdrop-blur-2xl overflow-hidden shadow-purple-900/30">
                {/* Tech grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 mix-blend-overlay" />
                
                {/* Logo SVG with 3D Pop (TranslateZ) */}
                <svg 
                   className="w-24 h-24 md:w-32 md:h-32 text-purple-400 drop-shadow-[0_0_20px_rgba(124,58,237,0.6)] filter transition-all duration-300 relative z-10" 
                   fill="none" 
                   stroke="currentColor" 
                   viewBox="0 0 24 24" 
                   style={!isMobile ? { transform: "translateZ(60px)" } : {}}
                >
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
             </div>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
