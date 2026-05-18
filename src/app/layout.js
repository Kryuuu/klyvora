import "./globals.css"

export const metadata = {
  title: "KlyVora | Neural Automation Workspace",
  description: "The next-generation AI-powered automation workspace for seamless neural workflow orchestration.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
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
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-cyan-400/30 selection:text-white">
        {children}
      </body>
    </html>
  )
}
