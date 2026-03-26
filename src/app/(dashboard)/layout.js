import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <AppShell userEmail={user.email}>{children}</AppShell>
}
