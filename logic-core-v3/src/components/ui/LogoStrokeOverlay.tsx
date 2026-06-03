"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { useEffect, useState } from "react";

import {
    LOGO_BOX_WORLD,
    computeLogoOuterScale,
    logoHvis,
} from "@/lib/logo-footprint";

// El único path del logo (public/logodevelOP.svg, viewBox 0 0 1024 1024, un solo
// subpath sin `M` internos → stroke-draw directo).
const LOGO_PATH_D =
    "M532 700v-67q0-6 3-10l54-98q0-3 4-4l4 5q13 27 34 48 35 35 83 41a153 153 0 0 0 86-288c-62-28-134-13-178 39q-20 24-33 52l-57 127q-16 38-40 71-63 86-166 105-92 16-173-30A257 257 0 0 1 38 371a258 258 0 0 1 210-164 257 257 0 0 1 233 92q5 6 1 10l-52 93-1 1q-4 8-8 0l-7-13q-37-62-108-75-66-10-118 30-43 33-55 86-16 76 35 136 37 41 91 48 83 11 139-53 18-23 29-49l51-111q18-44 44-83a257 257 0 0 1 201-113q96-5 171 52a256 256 0 0 1 69 336 262 262 0 0 1-298 121q-8-4-7 6l-1 100 1 58q1 8-6 6H538q-7 1-6-7z";

// ── Calibración (riesgo #1; tunables) ─────────────────────────────────────────
const FOOTPRINT_CALIB = 1.0; // multiplicador fino del tamaño 2D vs el 3D
const STROKE_WIDTH = 9; // ancho del trazo visible (unidades del viewBox 1024)
// MASK_STROKE_WIDTH eliminado: el stroke de 44 unidades creaba un halo blanco visible
// sobre el canvas (vignette) en el home claro → "sticker blanco". Solo el fill alcanza
// para tapar el chrome (el path animado arranca en maskColor; chrome forzado head-on).
const FLIP_Y = false; // el SVG DOM ya queda en la misma orientación que el 3D (sin flip)
const LOGO_Y_WORLD = 0.08; // offset Y del logo 3D (CenteredLogo position[0,0.08,0])
// ──────────────────────────────────────────────────────────────────────────────

// Always-true en cliente → flag isClient (false en SSR/primer render). NUNCA SSR-ea
// medidas derivadas del viewport (size/pos), igual que el <Canvas> r3f → sin
// hydration mismatch nuevo; el velo/backdrop cubre el gap hasta el cliente.
function useIsClient(): boolean {
    const [client, setClient] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1px)");
        const update = () => setClient(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);
    return client;
}

/**
 * Capa 2D (DOM/SVG) del trazado del logo, reusable por las dos intros.
 *
 * Secuencia VISIBLE (3 drivers): el contorno se DIBUJA (`strokeProgress`, vía
 * `stroke-dashoffset` NATIVO sobre `pathLength={1}` — no la `pathLength` cara de
 * Framer, lección CLAUDE.md) → el logo se RELLENA (`fillProgress`: el COLOR del
 * relleno anima de `maskColor` (bg, invisible) → `strokeColor` (contraste); el
 * relleno es OPACO todo el tiempo, tapando el 3D que asienta detrás) → CROSSFADE
 * (`layerOpacity` 1→0): la capa 2D sólida se desvanece revelando el 3D ya quieto.
 *
 * Un path de **máscara/margen** (dark, detrás) cubre el footprint del 3D con
 * MARGEN para que no asome ningún borde durante el dibujado.
 *
 * CLIENT-ONLY: el tamaño/posición salen de la matemática de cámara (viewport-
 * dependiente) → no se SSR-ea para no meter un hydration mismatch.
 */
export function LogoStrokeOverlay({
    isSplitLayout,
    strokeColor,
    maskColor,
    strokeProgress,
    fillProgress,
    layerOpacity,
    canvasSizePx,
}: {
    isSplitLayout: boolean;
    strokeColor: string;
    maskColor: string;
    strokeProgress: MotionValue<number>;
    fillProgress: MotionValue<number>;
    layerOpacity: MotionValue<number>;
    /**
     * Tamaño REAL del canvas (px). Omitir en desktop (= full-bleed = viewport).
     * En mobile el canvas es in-box: si se usa window.innerWidth/Height el SVG
     * sale demasiado grande → pasar el BoundingClientRect del wrapper.
     */
    canvasSizePx?: { w: number; h: number };
}) {
    const isClient = useIsClient();
    const dashoffset = useTransform(strokeProgress, (p) => 1 - p);
    // El relleno cambia de COLOR (no de opacidad): bg(invisible) → contraste.
    const fillColor = useTransform(fillProgress, [0, 1], [maskColor, strokeColor]);

    if (!isClient) {
        return null;
    }

    // Footprint (client-only): matchear la caja 1024 del logo 3D (mismo outerScale).
    // canvasSizePx override: en mobile el canvas es in-box, no full-screen.
    const w = canvasSizePx?.w ?? window.innerWidth;
    const h = canvasSizePx?.h ?? window.innerHeight;
    const scale = computeLogoOuterScale(w, h, isSplitLayout);
    const Hvis = logoHvis(isSplitLayout);
    const boxPx = LOGO_BOX_WORLD * scale * (h / Hvis) * FOOTPRINT_CALIB;
    const yOffsetPx = -(LOGO_Y_WORLD / Hvis) * h; // el logo 3D está un toque arriba

    return (
        <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ opacity: layerOpacity }}
        >
            <svg
                viewBox="0 0 1024 1024"
                width={boxPx}
                height={boxPx}
                style={{
                    overflow: "visible",
                    transform: `translateY(${yOffsetPx}px) scaleY(${FLIP_Y ? -1 : 1})`,
                }}
            >
                {/* Máscara: tapa el 3D (chrome) durante el trazo. Solo fill —
                    sin stroke: el halo de 44u creaba sticker blanco sobre el
                    canvas (vignette) en el home claro. El fill es suficiente
                    porque el chrome es head-on (pointer=0,0) y el path animado
                    también arranca en maskColor tapando el interior. */}
                <path
                    d={LOGO_PATH_D}
                    fill={maskColor}
                />
                {/* Relleno del logo: OPACO siempre (tapa el 3D); su COLOR anima
                    bg→contraste = el "se rellena" visible. */}
                <motion.path d={LOGO_PATH_D} style={{ fill: fillColor }} />
                {/* Contorno visible que se DIBUJA (dashoffset nativo). */}
                <motion.path
                    d={LOGO_PATH_D}
                    pathLength={1}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={STROKE_WIDTH}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeDasharray={1}
                    style={{ strokeDashoffset: dashoffset }}
                />
            </svg>
        </motion.div>
    );
}

export default LogoStrokeOverlay;
