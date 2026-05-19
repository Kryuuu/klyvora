import { redirect } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()

  let user = null

  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    user = data.user
  } catch {
    // Token is invalid/expired — force sign out to clear stale cookies
    await supabase.auth.signOut().catch(() => {})
    user = null
  }

  if (!user) {
    redirect('/login')
  }

  const [profileRes, subscriptionRes] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', user.id).maybeSingle(),
    supabase.from('subscriptions').select('plan, status').eq('user_id', user.id).maybeSingle(),
  ])

  const profileName = profileRes.data?.name || user.email.split('@')[0]
  const isDev = user.email === process.env.NEXT_PUBLIC_DEVELOPER_EMAIL
  const plan = subscriptionRes.data?.plan === 'pro' && subscriptionRes.data?.status === 'active' ? 'pro' : 'free'

  return (
    <AppShell userEmail={profileName} plan={plan} isDev={isDev}>
      {children}
    </AppShell>
  )
}
