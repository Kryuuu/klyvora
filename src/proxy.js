import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function getSupabaseCookieNames(request) {
  return request.cookies
    .getAll()
    .filter((cookie) => (
      cookie.name === 'supabase-auth-token' ||
      cookie.name.startsWith('supabase-auth-token.') ||
      (cookie.name.startsWith('sb-') && cookie.name.includes('auth-token'))
    ))
    .map((cookie) => cookie.name)
}

export async function proxy(request) {
  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isProtectedAppRoute = !isAuthRoute && pathname !== '/'
  const sessionCookieNames = getSupabaseCookieNames(request)
  const hasCookie = sessionCookieNames.length > 0

  // No cookie + protected route → redirect to login (fast path, no Supabase call)
  if (!hasCookie && isProtectedAppRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Has cookie → validate with Supabase to prevent stale token redirect loops
  if (hasCookie) {
    let response = NextResponse.next()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Forward cookie updates to the request (for downstream server components)
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value)
            })
            // Also set on the response (for the browser)
            response = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // This call refreshes the token if needed and updates cookies via setAll
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      // Token is invalid/expired — nuke all Supabase cookies and redirect to login
      if (isProtectedAppRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        const redirectResponse = NextResponse.redirect(url)

        // Delete all stale Supabase auth cookies
        sessionCookieNames.forEach((name) => {
          redirectResponse.cookies.delete(name)
        })

        return redirectResponse
      }

      // On public routes (/ , /login, /register), just clear cookies and continue
      sessionCookieNames.forEach((name) => {
        response.cookies.delete(name)
      })
      return response
    }

    // Valid session + trying to visit auth page → redirect to dashboard
    if (isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    return response
  }

  // No cookie + public route → just continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
