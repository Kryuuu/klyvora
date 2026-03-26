import { Card } from "@/components/ui/Card"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  // Fetch true statistics
  const { count: wfCount } = await supabase.from('workflows').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  const { count: taskCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'todo')

  return (
    <div className="space-y-8 flex flex-col items-center max-w-4xl mx-auto pt-4 sm:pt-10">
      
      <div className="text-center w-full mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-4">What do you want to automate today?</h1>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">Describe your goal to our AI, and we will generate a fully structured workflow sequence and actionable tasks instantly.</p>
        
        {/* Huge CTA button taking center stage */}
        <Link href="/generate" className="inline-block w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-500 transition-colors text-white font-bold rounded-2xl text-lg shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center">
               <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               Generate Workflow
            </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full h-full">
         <Card className="flex flex-col items-center justify-center text-center p-6 border-[#272737]">
             <p className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-2">Active Workflows</p>
             <h2 className="text-4xl font-black text-white">{wfCount || 0}</h2>
         </Card>
         <Card className="flex flex-col items-center justify-center text-center p-6 border-[#272737]">
             <p className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-2">Pending Tasks</p>
             <h2 className="text-4xl font-black text-purple-400">{taskCount || 0}</h2>
         </Card>
      </div>

      <div className="w-full mt-8">
         <h3 className="text-lg font-bold mb-4 border-b border-[#272737] pb-2 text-gray-300">Quick Access</h3>
         <div className="grid grid-cols-1 gap-4">
             <Link href="/workflows" className="block w-full">
                <Card className="p-5 flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer border-[#272737]">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#1e1e2a] flex justify-center items-center mr-4">
                           <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" /></svg>
                        </div>
                        <div>
                            <p className="font-bold">Manage Saved Workflows</p>
                            <p className="text-xs text-gray-500">View and edit your AI automations</p>
                        </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Card>
             </Link>
             <Link href="/tasks" className="block w-full">
                <Card className="p-5 flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer border-[#272737]">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#1e1e2a] flex justify-center items-center mr-4">
                           <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /></svg>
                        </div>
                        <div>
                            <p className="font-bold">Approve Actionable Tasks</p>
                            <p className="text-xs text-gray-500">Handle AI generated requests</p>
                        </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Card>
             </Link>
         </div>
      </div>
    </div>
  )
}
