/**
 * Single source of truth for "portal" routes — the admin console, client
 * dashboard and embed shells — where the public marketing chrome (Navbar,
 * Shutter, Preloader) and the public chatbot widget must NOT render.
 *
 * Shared by `PublicOnlyComponents` (gates the chrome) and `ChatWidgetMount`
 * (gates the single chatbot mount) so the prefix list lives in exactly one
 * place instead of being duplicated per call site.
 */
export const PORTAL_PREFIXES = ['/admin', '/dashboard', '/embed'] as const

export function isPortalRoute(pathname: string): boolean {
  return PORTAL_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}
