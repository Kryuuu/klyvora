'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <img 
        src="/logo.png" 
        alt="KlyVora Logo" 
        className="w-24 sm:w-32 mb-6"
      />

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center">
        KlyVora AI Workflow
      </h1>

      {/* Subtitle */}
      <p className="text-gray-400 text-center max-w-md mb-8 text-sm sm:text-base">
        Automate your workflow with powerful AI agents.  
        Build smarter, faster, and scale effortlessly.
      </p>

      {/* Button */}
      <button 
        onClick={() => router.push('/login')}
        className="bg-purple-600 hover:bg-purple-700 transition px-6 py-3 rounded-lg text-sm sm:text-base"
      >
        Get Started
      </button>

    </main>
  )
}