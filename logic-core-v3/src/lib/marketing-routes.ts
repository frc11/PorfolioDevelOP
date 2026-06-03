// Route B — allow-list de páginas de marketing/servicio que reciben el intro
// branded (logo + puntos, centrado, fade-out) y el gate de disparo.
//
// Allow-list (fail-safe): SOLO estas rutas montan el canvas branded; jamás
// home/auth/portal. Es un superset de las service-routes del dock (incluye
// /contact, que no está en el dock) → es una preocupación propia, no duplicación.

const MARKETING_ROUTES: ReadonlySet<string> = new Set([
    "/web-development",
    "/ai-implementations",
    "/software-development",
    "/process-automation",
    "/contact",
]);

// Quita el trailing slash (salvo root) para matchear el Set de forma robusta,
// independientemente de la config de trailingSlash de Next.
function normalizePathname(pathname: string): string {
    if (pathname.length > 1 && pathname.endsWith("/")) {
        return pathname.slice(0, -1);
    }
    return pathname;
}

export function isMarketingRoute(pathname: string): boolean {
    return MARKETING_ROUTES.has(normalizePathname(pathname));
}

// ── Gate de disparo: SOLO hard-reload / URL directa, NO client-nav ────────────
// El Preloader es global y persiste entre navegaciones client-side, así que
// `isMarketingRoute(pathname)` solo no alcanza (dispararía también al navegar
// home→/web-development por el dock, pisándose con el Shutter).
//
// Capturamos la ruta de ENTRADA del documento en scope de módulo: el módulo se
// evalúa una vez por carga de documento (antes de cualquier pushState) y se
// resetea en hard reload. `introConsumed` evita re-disparar al volver a la ruta
// de entrada por client-nav.
const ENTRY_PATHNAME: string | null =
    typeof window !== "undefined"
        ? normalizePathname(window.location.pathname)
        : null;

let introConsumed = false;

/**
 * `true` solo cuando el intro branded debe correr: ruta marketing Y es la ruta de
 * entrada del documento (hard-load / URL directa) Y no se consumió todavía.
 *
 * SSR-safe: en server (sin `window`) devuelve `isMarketingRoute(pathname)` — en SSR
 * la ruta renderizada SIEMPRE es la de entrada, así el velo va en el HTML del primer
 * paint (sin flash) y en hidratación el check coincide (`entry === pathname`) sin
 * mismatch. Mutuamente excluyente con el Shutter: Shutter = client-nav, intro = hard-load.
 */
export function shouldRunMarketingIntro(pathname: string): boolean {
    if (!isMarketingRoute(pathname)) {
        return false;
    }
    if (ENTRY_PATHNAME === null) {
        return true; // SSR: la ruta renderizada es la de entrada.
    }
    return normalizePathname(pathname) === ENTRY_PATHNAME && !introConsumed;
}

export function markIntroConsumed(): void {
    introConsumed = true;
}
