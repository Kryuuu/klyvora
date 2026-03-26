export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      
      <img src="/logo.png" className="w-32 mb-6" />

      <h1 className="text-4xl font-bold mb-4 text-center">
        KlyVora AI Workflow
      </h1>

      <p className="text-gray-400 text-center max-w-md mb-6">
        Automate your workflow with AI agents.
      </p>

      <button className="bg-purple-600 px-6 py-3 rounded-lg">
        Get Started
      </button>

    </main>
  )
}