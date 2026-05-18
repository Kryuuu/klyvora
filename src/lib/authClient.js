'use client'

export async function getClientSessionUser(supabase) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.user || null
}
