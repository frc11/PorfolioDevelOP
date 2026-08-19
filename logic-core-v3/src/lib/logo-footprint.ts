// ════════════════════════════════════════════════════════════════════════════
//  FOOTPRINT DEL LOGO — HAY DOS CALIBRACIONES. CUÁL ES CUÁL Y CUÁL MANDA.
// ════════════════════════════════════════════════════════════════════════════
//
// Las dos resuelven el mismo problema —hacer coincidir el SVG 2D con el mesh 3D
// de `HeroArtifact`— pero suponen geometrías DISTINTAS y no son intercambiables.
// Elegir la equivocada no rompe el build: desalinea el logo en runtime.
//
// ── CALIBRACIÓN A · canvas FULL-SCREEN (histórica, intro viejo) ─────────────
//   `logoHvis()` + `computeLogoOuterScale()`, más abajo.
//   Supone un canvas que ocupa toda la ventana y un logo CENTRADO en él, y
//   hardcodea la cámara de cada layout (`isSplitLayout`).
//   Consumidores: `LogoStrokeOverlay`, `IntroLockupText`, `BrandedIntroCanvas`.
//   ⚠ Diverge del Hero legacy en dos puntos ya documentados: el Hero legacy
//   reimplementa la fórmula de escala SIN el clamp de width-fit, y usa Y=0.02
//   en mobile contra el 0.08 que asume la overlay. No se tocó — es deuda del
//   camino viejo, que muere con él.
//
// ── CALIBRACIÓN B · canvas IN-BOX (S3, el hero nuevo) ───────────────────────
//   `HERO_INBOX_CAMERA` + `heroInboxLogoScale()`, abajo de todo.
//   Supone un canvas que llena una caja CUADRADA del layout (la columna del
//   artefacto), no la ventana. La usa `HeroCanvas`.
//   Su trabajo es UNO solo: **el encuadre del 3D dentro de su caja** — qué
//   fracción de la caja ocupa el logo. Reemplazó a una fórmula ad-hoc
//   (`clamp(1.02, aspect·0.78, 1.28)`) que además suponía una cámara declarada
//   en otro archivo; acá la cámara y la escala salen de la MISMA constante, así
//   que no pueden divergir. Eso es justamente lo frágil de la calibración A.
//
// ── QUIÉN MANDA — ya no hay contrato entre el 2D y el 3D ───────────────────
//   ⚠ S3b: **la coincidencia exacta 2D↔3D dejó de ser un requisito.** Existía
//   para sostener la "entrega" del logo desde el preloader hacia el hero, y esa
//   entrega se eliminó: el preloader es un momento cerrado que sube y
//   desaparece, sin handoff.
//   Hoy el 2D del hero es un ESTADO DE CARGA y una red de seguridad, y el
//   reemplazo por el 3D es un cambio simple: **el 2D no tiene que calzar con
//   nada.** Si el 3D se encuadra distinto que el SVG, no es un bug.
//   Las dos calibraciones no compiten: A resuelve un overlay 2D sobre un canvas
//   full-screen (camino viejo), B resuelve el encuadre del 3D en su caja. Lo
//   único que sigue valiendo es no mezclarlas — elegir la equivocada no rompe
//   el build, desencuadra el logo en runtime.
// ════════════════════════════════════════════════════════════════════════════

// El SVG es 1024×1024; HeroArtifact lo escala 0.007 → la "caja 1024" mide
// 0.007×1024 = 7.168 unidades de mundo. Sobre eso va el outerScale (responsive).
// Es la constante que comparten las DOS calibraciones.

export const LOGO_BOX_WORLD = 7.168; // 0.007 × 1024

// El logo no debe ocupar más que esta fracción del ancho VISIBLE (clave en mobile,
// donde el viewport es angosto y la fórmula derivada de la altura lo agranda).
const LOGO_WIDTH_MARGIN = 0.86;

// Alto visible en unidades de mundo a z=0 según la cámara de cada layout
// (desktop fov35/z15 ≈ 9.46; mobile fov30/z13 ≈ 6.97).
export function logoHvis(isSplitLayout: boolean): number {
    const fov = isSplitLayout ? 35 : 30;
    const z = isSplitLayout ? 15 : 13;
    return 2 * z * Math.tan(((fov * Math.PI) / 180) / 2);
}

/**
 * outerScale del logo centrado, con CLAMP por width-fit para que la caja del logo
 * nunca exceda el ancho del viewport (arregla el rebalse en marketing mobile).
 * `w`/`h` en píxeles (de `useThree().size` para el 3D, de `window` para el 2D —
 * ambos = el canvas full-screen, así matchean).
 */
export function computeLogoOuterScale(
    w: number,
    h: number,
    isSplitLayout: boolean,
): number {
    const refWidth = isSplitLayout ? w / 2 : w;
    const aspect = refWidth / Math.max(h, 1);
    const scale = isSplitLayout
        ? aspect < 0.8
            ? Math.max(0.52, aspect * 0.96)
            : Math.min(1.12, aspect * 1.02)
        : Math.min(1.28, Math.max(1.02, aspect * 0.78));

    // width-fit: la caja (LOGO_BOX_WORLD × scale) ≤ ancho visible × margen.
    const wVis = logoHvis(isSplitLayout) * (w / Math.max(h, 1));
    const widthFit = (wVis * LOGO_WIDTH_MARGIN) / LOGO_BOX_WORLD;
    return Math.min(scale, widthFit);
}

// ── CALIBRACIÓN B · canvas IN-BOX del hero nuevo (S3) ───────────────────────

/**
 * Cámara del canvas in-box del hero. La consume `HeroCanvas` para construir el
 * `<Canvas camera={...}>` Y `heroInboxLogoScale()` para calcular la escala, así
 * que las dos no pueden divergir: es la falla que tiene la calibración A, donde
 * `logoHvis()` hardcodea una cámara que el canvas podría cambiar sin enterarse.
 */
export const HERO_INBOX_CAMERA = { fov: 30, z: 13 } as const;

/**
 * Qué fracción del ALTO de la caja ocupa la "caja 1024" del logo.
 *
 * 1 = la caja del logo mide exactamente la caja del slot, o sea que el logo
 * llena su columna. Es el encuadre del 3D y **la perilla para cambiarlo**.
 *
 * (Se eligió 1 cuando el 3D tenía que calzar contra el SVG 2D — el SVG se
 * dibuja al 100% de su contenedor. Ese requisito murió en S3b junto con el
 * handoff; el valor se conserva porque sigue siendo un encuadre razonable, no
 * porque haya un contrato que respetar. Moverlo ya no descalza nada.)
 */
export const HERO_LOGO_BOX_FRACTION = 1;

/**
 * Escala del `<group>` que envuelve a `HeroArtifact` en el canvas in-box: la
 * que hace que su caja 1024 ocupe `HERO_LOGO_BOX_FRACTION` del alto visible.
 *
 * Derivación: a z=0 la cámara ve `hVis` unidades de alto; queremos que la caja
 * del logo ocupe `HERO_LOGO_BOX_FRACTION` de eso, y la caja mide
 * `LOGO_BOX_WORLD` a escala 1 → `scale = fracción · hVis / LOGO_BOX_WORLD`.
 *
 * Es independiente del tamaño en píxeles del canvas: el slot es CUADRADO y r3f
 * ajusta el aspect solo, así que la relación caja-logo ↔ caja-slot se conserva
 * en cualquier viewport. Por eso no toma `w`/`h` como la calibración A.
 *
 * No incluye la escala interna del propio `HeroArtifact` (que amortigua hacia 1
 * cuando `phase='done'`): esa se multiplica encima y su valor de reposo es 1.
 */
export function heroInboxLogoScale(): number {
    const hVis =
        2 *
        HERO_INBOX_CAMERA.z *
        Math.tan(((HERO_INBOX_CAMERA.fov * Math.PI) / 180) / 2);

    return (HERO_LOGO_BOX_FRACTION * hVis) / LOGO_BOX_WORLD;
}
