import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' })

export const metadata = {
  title: "KlyVora | Neural Automation Workspace",
  description: "The next-generation AI-powered automation workspace for seamless neural workflow orchestration.",
  icons: {
    icon: "/logo-klyvora.png",
    shortcut: "/logo-klyvora.png",
    apple: "/logo-klyvora.png",
  },
  openGraph: {
    title: "KlyVora",
    description: "Modern AI-powered workflow automation.",
    images: [{ url: "/logo-klyvora.png" }],
  }
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
