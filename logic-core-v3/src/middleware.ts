import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

const { auth } = NextAuth(authConfig)
import { NextResponse } from 'next/server'

const LOGIN_PATH = '/login'
const ADMIN_PATH = '/admin'
const DASHBOARD_PATH = '/dashboard'
const ONBOARDING_PATH = '/bienvenida'
const ADMIN_ROLE = 'SUPER_ADMIN'
const USER_ROLE = 'ORG_MEMBER'
const IMPERSONATION_COOKIE = 'impersonation-token'

function isSafeCallbackUrl(value: string | null) {
  return Boolean(value && value.startsWith('/') && !value.startsWith('//'))
}

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const role = session?.user?.role
  const onboardingCompleted = session?.user?.onboardingCompleted
  const isAuthenticated = Boolean(session?.user)
  const isImpersonating = Boolean(req.cookies.get(IMPERSONATION_COOKIE)?.value)

  const pathname = nextUrl.pathname
  const callbackUrl = nextUrl.searchParams.get('callbackUrl')

  const isLoginRoute = pathname === LOGIN_PATH
  const isAdminRoute = pathname.startsWith(ADMIN_PATH)
  const isDashboardRoute = pathname.startsWith(DASHBOARD_PATH)
  const isOnboardingRoute = pathname.startsWith(ONBOARDING_PATH)

  if (!isAuthenticated && (isAdminRoute || isDashboardRoute || isOnboardingRoute)) {
    const loginUrl = new URL(LOGIN_PATH, nextUrl)
    loginUrl.searchParams.set('callbackUrl', `${pathname}${nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  if (!isAuthenticated) {
    return NextResponse.next()
  }

  if (isLoginRoute) {
    if (isSafeCallbackUrl(callbackUrl) && callbackUrl !== LOGIN_PATH) {
      return NextResponse.redirect(new URL(callbackUrl as string, nextUrl))
    }

    if (role === ADMIN_ROLE) {
      return NextResponse.redirect(new URL(ADMIN_PATH, nextUrl))
    }

    return NextResponse.redirect(
      new URL(onboardingCompleted ? DASHBOARD_PATH : ONBOARDING_PATH, nextUrl)
    )
  }

  if (isAdminRoute && role !== ADMIN_ROLE) {
    return NextResponse.redirect(
      new URL(onboardingCompleted ? DASHBOARD_PATH : ONBOARDING_PATH, nextUrl)
    )
  }

  if (isDashboardRoute && role !== USER_ROLE && !(role === ADMIN_ROLE && isImpersonating)) {
    return NextResponse.redirect(new URL(role === ADMIN_ROLE ? ADMIN_PATH : LOGIN_PATH, nextUrl))
  }

  if (isOnboardingRoute) {
    if (role === ADMIN_ROLE && !isImpersonating) {
      return NextResponse.redirect(new URL(ADMIN_PATH, nextUrl))
    }

    if (role === USER_ROLE && onboardingCompleted) {
      return NextResponse.redirect(new URL(DASHBOARD_PATH, nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login', '/bienvenida'],
}
