'use client'

import { usePathname } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' })

export default function RootLayout({ children }) {
  const pathname = usePathname()
  
  // Define public routes that don't need the Sidebar/Navbar
  const isPublicRoute = pathname === '/login' || pathname === '/register' || pathname === '/'

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className={`min-h-full flex flex-col bg-[#0f0f14] text-white selection:bg-purple-500/30`}>
        {isPublicRoute ? (
          <div className="flex-1 flex flex-col w-full">
            {children}
          </div>
        ) : (
          <AppShell>{children}</AppShell>
        )}
      </body>
    </html>
  )
}
