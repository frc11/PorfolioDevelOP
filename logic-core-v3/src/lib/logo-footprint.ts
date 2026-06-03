// Footprint del logo compartido por el 3D (HeroArtifact en CenteredLogo) y el 2D
// (LogoStrokeOverlay) para que ENCAJEN: misma escala, mismo centro, mismo tamaño.
//
// El SVG es 1024×1024; HeroArtifact lo escala 0.007 → la "caja 1024" mide
// 0.007×1024 = 7.168 unidades de mundo. Sobre eso va el outerScale (responsive).

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
