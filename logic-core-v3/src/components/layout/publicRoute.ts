/**
 * Single source of truth for the routes where the public marketing chrome
 * (Navbar, Shutter, Preloader) and the public chatbot widget must NOT render.
 *
 * Two lists, because there are two different reasons:
 *
 * - `PORTAL_PREFIXES` — the admin console, client dashboard, embed and setter
 *   shells. Product, not marketing: the chrome does not belong there.
 * - `CHROME_FREE_PREFIXES` — internal tooling of the redesign. Not a portal and
 *   not a product surface, but the chrome has to stay off anyway.
 *
 * Shared by `PublicOnlyComponents` (gates the chrome) and `ChatWidgetMount`
 * (gates the single chatbot mount) so the prefix list lives in exactly one
 * place instead of being duplicated per call site.
 */
export const PORTAL_PREFIXES = ['/admin', '/dashboard', '/embed', '/setter'] as const

/**
 * `/styleguide` es la página donde se JUZGA el sistema de diseño, y el chrome
 * público le pinta encima justo las anti-referencias que el sistema rechaza: la
 * barra con `backdrop-filter: blur(48px)`, la píldora del CTA con gradiente cian
 * y sombra de color, el launcher del chat y el `Shutter`. Con el chrome montado,
 * cualquier juicio sobre "superficies planas y quietas" se toma mirando
 * glassmorphism.
 */
/**
 * `/probe-escena` (PROBE-ESCENA) es la misma clase de superficie que
 * `/styleguide`: un instrumento interno donde se JUZGA cómo se ve algo. El
 * canvas ocupa la ventana entera y el chrome público le pintaría el launcher
 * del chat y la barra encima justo del objeto bajo prueba.
 */
export const CHROME_FREE_PREFIXES = ['/styleguide', '/probe-escena'] as const

export function isPortalRoute(pathname: string): boolean {
  return PORTAL_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

/**
 * Rutas sin chrome público: portales + herramientas internas.
 *
 * Es lo que consultan los dos gates. `isPortalRoute` se conserva aparte porque
 * responde otra pregunta —"¿esto es producto?"— y no todo lo que va sin chrome
 * lo es.
 */
export function isChromeFreeRoute(pathname: string): boolean {
  return (
    isPortalRoute(pathname) || CHROME_FREE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  )
}
