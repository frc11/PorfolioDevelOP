// Gate de disparo del intro del HOME: SOLO hard-load / URL directa a "/".
// Mismo patrón que marketing-routes.ts (ENTRY_PATHNAME + consumed flag).
//
// HOME_ENTRY_PATHNAME: capturado al cargar el módulo JS en el browser (scope de módulo,
// antes de cualquier client-nav). Se resetea solo en hard reload.

const HOME_ENTRY_PATHNAME: string | null =
    typeof window !== "undefined" ? window.location.pathname : null;

let homeIntroConsumed = false;

/**
 * ¿Debe correr el intro del home?
 * - true  → hard-load / URL directa a "/" y no consumido aún.
 * - false → llegamos por client-nav (entryPathname !== '/') o ya corrió este ciclo.
 *
 * SSR-safe: sin window devuelve true (el Preloader gatea por `isHome` por separado;
 * el velo va en el primer paint). En hidratación de hard-load: ENTRY_PATHNAME === '/',
 * resultado true → sin mismatch. En client-nav: ENTRY_PATHNAME !== '/' → false.
 */
export function shouldRunHomeIntro(): boolean {
    if (typeof window === "undefined") {
        return true; // SSR: asumir hard-load (el Preloader lo gatea por isHome)
    }
    return HOME_ENTRY_PATHNAME === "/" && !homeIntroConsumed;
}

/**
 * Llamar al TERMINAR la animación (no antes). Así, navigate-away + navigate-back
 * no dispara el intro de nuevo (ENTRY_PATHNAME sigue siendo '/', pero consumed=true).
 */
export function markHomeIntroConsumed(): void {
    homeIntroConsumed = true;
}
