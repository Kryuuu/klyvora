import { redirect } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()

  let user = null

  try {
    const userResponse = await supabase.auth.getUser()
    user = userResponse.data.user
  } catch {
    const sessionResponse = await supabase.auth.getSession()
    user = sessionResponse.data.session?.user || null
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
