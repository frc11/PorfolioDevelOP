import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

const LOGIN_PATH = '/login'
const ADMIN_PATH = '/admin'
const ADMIN_OS_PATH = '/admin'
const DASHBOARD_PATH = '/dashboard'
const ONBOARDING_PATH = '/bienvenida'
const SETTER_PATH = '/setter'
const ADMIN_ROLE = 'SUPER_ADMIN'
const USER_ROLE = 'ORG_MEMBER'
const SETTER_ROLE = 'SETTER'
const IMPERSONATION_COOKIE = 'impersonation-token'

function isSafeCallbackUrl(value: string | null) {
  return Boolean(value && value.startsWith('/') && !value.startsWith('//'))
}

function getLegacyAdminRedirectPath(pathname: string): string | null {
  if (pathname === ADMIN_OS_PATH || pathname.startsWith(`${ADMIN_OS_PATH}/`)) {
    return null
  }

  if (pathname === ADMIN_PATH) {
    return ADMIN_OS_PATH
  }

  if (pathname === '/admin/leads') {
    return '/admin/leads'
  }

  if (pathname === '/admin/projects') {
    return '/admin/projects'
  }

  const projectDetailMatch = pathname.match(/^\/admin\/projects\/([^/]+)$/)
  if (projectDetailMatch) {
    return `/admin/projects/${projectDetailMatch[1]}`
  }

  if (pathname === '/admin/clients') {
    return '/admin/clients'
  }

  if (pathname === '/admin/tickets') {
    return '/admin/tickets'
  }

  if (pathname === '/admin/messages') {
    return '/admin/messages'
  }

  if (pathname === '/admin/settings') {
    return '/admin/settings'
  }

  if (pathname.startsWith(`${ADMIN_PATH}/`)) {
    return ADMIN_OS_PATH
  }

  return null
}

const CHANGE_PASSWORD_PATH = '/cambiar-password'
const ALWAYS_ALLOWED = [CHANGE_PASSWORD_PATH, '/api/auth/', '/logout', '/api/']

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const role = session?.user?.role
  const onboardingCompleted = session?.user?.onboardingCompleted
  const passwordResetRequired = session?.user?.passwordResetRequired
  const isAuthenticated = Boolean(session?.user)
  const isImpersonating = Boolean(req.cookies.get(IMPERSONATION_COOKIE)?.value)

  const pathname = nextUrl.pathname
  const callbackUrl = nextUrl.searchParams.get('callbackUrl')
  const legacyAdminRedirectPath = getLegacyAdminRedirectPath(pathname)

  // Force password reset before allowing access to any protected route
  if (
    isAuthenticated &&
    passwordResetRequired &&
    !ALWAYS_ALLOWED.some(p => pathname.startsWith(p))
  ) {
    return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, nextUrl))
  }

  if (legacyAdminRedirectPath) {
    const redirectUrl = nextUrl.clone()
    redirectUrl.pathname = legacyAdminRedirectPath
    return NextResponse.redirect(redirectUrl, 308)
  }

  const isLoginRoute = pathname === LOGIN_PATH
  const isAdminRoute = pathname.startsWith(ADMIN_PATH)
  const isDashboardRoute = pathname.startsWith(DASHBOARD_PATH)
  const isOnboardingRoute = pathname.startsWith(ONBOARDING_PATH)
  const isSetterRoute = pathname.startsWith(SETTER_PATH)

  if (!isAuthenticated && (isAdminRoute || isDashboardRoute || isOnboardingRoute || isSetterRoute)) {
    const loginUrl = new URL(LOGIN_PATH, nextUrl)
    loginUrl.searchParams.set('callbackUrl', `${pathname}${nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  if (!isAuthenticated) {
    return NextResponse.next()
  }

  // LeadOS B1 — rama SETTER con retorno temprano: un setter no tiene org
  // membership, así que NUNCA debe caer en el camino ORG_MEMBER de abajo
  // (/dashboard → /bienvenida). Su única zona es /setter.
  if (role === SETTER_ROLE) {
    if (isAdminRoute || isDashboardRoute || isOnboardingRoute || isLoginRoute) {
      return NextResponse.redirect(new URL(SETTER_PATH, nextUrl))
    }
    return NextResponse.next()
  }

  // No-SETTER intentando /setter → a su zona habitual.
  if (isSetterRoute) {
    if (role === ADMIN_ROLE) {
      return NextResponse.redirect(new URL(ADMIN_PATH, nextUrl))
    }
    return NextResponse.redirect(
      new URL(onboardingCompleted ? DASHBOARD_PATH : ONBOARDING_PATH, nextUrl)
    )
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
  matcher: ['/admin/:path*', '/dashboard/:path*', '/setter/:path*', '/login', '/bienvenida', '/cambiar-password'],
}
