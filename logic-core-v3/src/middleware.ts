import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const isLoggedIn = !!session?.user

  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard')
  const isLoginRoute = nextUrl.pathname === '/login'

  // Sin sesión intentando acceder a rutas protegidas → login
  if (!isLoggedIn && (isAdminRoute || isDashboardRoute)) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  if (isLoggedIn) {
    // Ya autenticado intentando acceder a /login → redirigir a su área
    if (isLoginRoute) {
      const dest = session.user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard'
      return NextResponse.redirect(new URL(dest, nextUrl))
    }

    // Cliente intentando acceder al panel de admin
    if (isAdminRoute && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }

    // Admin intentando acceder al dashboard de cliente sin cookie de preview → redirigir al admin
    // (Si tiene cookie de preview, el middleware lo deja pasar — resolveOrgId() se encarga del resto)
    if (isDashboardRoute && session.user.role === 'SUPER_ADMIN') {
      const previewOrg = req.cookies.get('dp-preview-org')?.value
      if (!previewOrg) {
        return NextResponse.redirect(new URL('/admin', nextUrl))
      }
    }
  }

  const response = NextResponse.next()
  response.headers.set('x-pathname', nextUrl.pathname)
  return response
})

export const config = {
  matcher: [
    // V-15: Rutas protegidas
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
    // API routes protegidas (no cubiertas antes)
    '/api/admin/:path*',
    '/api/client/:path*',
  ],
}
