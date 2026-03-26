import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' })

export const metadata = {
  title: "KlyVora",
  description: "Modern SaaS web app for AI-powered workflow automation.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#0f0f14] text-white selection:bg-purple-500/30">
        {children}
      </body>
    </html>
  )
}
