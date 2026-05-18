import { NextResponse } from 'next/server'

function hasSupabaseSessionCookie(request) {
  return request.cookies
    .getAll()
    .some((cookie) => (
      cookie.name === 'supabase-auth-token' ||
      cookie.name.startsWith('supabase-auth-token.') ||
      (cookie.name.startsWith('sb-') && cookie.name.includes('auth-token'))
    ))
}

export function proxy(request) {
  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isProtectedAppRoute = !isAuthRoute && pathname !== '/'
  const hasSession = hasSupabaseSessionCookie(request)

  if (!hasSession && isProtectedAppRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (hasSession && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
