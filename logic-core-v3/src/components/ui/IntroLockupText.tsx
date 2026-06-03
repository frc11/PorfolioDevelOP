"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { useEffect, useState } from "react";

import {
    LOGO_BOX_WORLD,
    computeLogoOuterScale,
    logoHvis,
} from "@/lib/logo-footprint";


// ── Timing del lockup (el orquestador Preloader/MarketingIntro los importa) ────
// Valores cómodos (lento y legible); el usuario afina. Todo en ms.
//   TEXT_LEAD_MS  → el texto arranca este tiempo ANTES del dibujado del logo.
//   WRITE_MS      → duración de la escritura (wipe izq→derecha; reveal 0→1).
//   READ_HOLD_MS  → cuánto queda quieto para leer (HOME, tras escribir, antes de borrar).
//   ERASE_MS      → duración del borrado (HOME; MARKETING no borra → sube con el toldo).
export const TEXT_LEAD_MS = 0;
export const WRITE_MS = 1500;
export const READ_HOLD_MS = 1500;
export const ERASE_MS = 1500;

const WORDMARK_TEXT = "develOP";
const SLOGAN_TEXT = "Construimos lo que imaginas";

const WORDMARK_RANGE: [number, number] = [0.0, 0.62];
const SLOGAN_RANGE: [number, number] = [0.32, 1.0];

// Offset vertical respecto del CENTRO del logo, como fracción del boxPx.
const WORDMARK_OFFSET_FRAC = 0.4;
const SLOGAN_OFFSET_FRAC = 0.42;

// Tamaño del texto PROPORCIONAL al logo (boxPx) → escala en sync con la marca
// a cualquier viewport, sin vw/rem que diverjan del tamaño real del logo.
const WORDMARK_SIZE_FRAC = 0.19; // antes 0.14 — agranda el título
const SLOGAN_SIZE_FRAC = 0.06;   // antes 0.057 — agranda el slogan
const WORDMARK_SIZE_MIN = 30;    // antes 28
const WORDMARK_SIZE_MAX = 100;   // antes 72 ← CLAVE: si no, el desktop queda capado en 72px
const SLOGAN_SIZE_MIN = 14;      // antes 13
const SLOGAN_SIZE_MAX = 34;      // antes 22

// Ancho máximo del slogan como fracción del boxPx (permite wrap prolijo).
const SLOGAN_WIDTH_FRAC = 1.15;

// Mismos tunables de footprint que LogoStrokeOverlay — mantener en sync.
const FOOTPRINT_CALIB = 1.0;
const LOGO_Y_WORLD = 0.08;

/**
 * Color del scrim (fondo sutil tras el texto) derivado del color del TEXTO por
 * luminancia: texto oscuro (home) → scrim CLARO (≈ bg claro del home); texto claro
 * (marketing) → scrim OSCURO (= velo #0a0a0a). Devuelve "r, g, b" para rgba().
 */
function bgScrimRgb(textColor: string): string {
    const hex = textColor.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return lum < 0.5 ? "250, 250, 250" : "10, 10, 10";
}

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
 * Una línea con efecto de escritura por wipe izq→derecha (clip-path nativo,
 * MotionValue-driven, sin setState por frame) + cursor que sigue el frente +
 * scrim radial feather detrás (legibilidad sobre los puntos, sin caja dura).
 * `fontSizePx` viene calculado en el padre (proporcional al logo). El slogan
 * usa `display:block` — el contenedor padre debe tener un width explícito para
 * que el block se expanda (los absolute shrink-to-fit colapsan a min-content).
 */
function WipeLine({
    text,
    color,
    reveal,
    range,
    variant,
    fontSizePx,
}: {
    text: string;
    color: string;
    reveal: MotionValue<number>;
    range: [number, number];
    variant: "wordmark" | "slogan";
    fontSizePx: number;
}) {
    const lineProgress = useTransform(reveal, range, [0, 1]);
    const clip = useTransform(lineProgress, (v) => `inset(0 ${(1 - v) * 100}% 0 0)`);
    const caretLeft = useTransform(lineProgress, (v) => `${v * 100}%`);
    const caretOpacity = useTransform(lineProgress, (v) =>
        v > 0.002 && v < 0.998 ? 1 : 0,
    );
    // Scrim: entra rápido al arrancar la escritura (0→0.18) y queda presente todo
    // el rato que el texto está visible; en HOME se desvanece con el borrado.
    const scrimOpacity = useTransform(lineProgress, [0, 0.18], [0, 1]);

    const isWordmark = variant === "wordmark";

    // Scrim sólido-al-centro → transparente en los bordes (feather, sin borde duro).
    // El título (grande/grueso) necesita menos; el slogan (chico) un poco más.
    const rgb = bgScrimRgb(color);
    const scrimAlpha = isWordmark ? 0.7 : 0.92;
    const scrimBg = `radial-gradient(ellipse 80% 96% at 50% 50%, rgba(${rgb}, ${scrimAlpha}) 0%, rgba(${rgb}, ${scrimAlpha * 0.8}) 52%, rgba(${rgb}, 0) 100%)`;

    return (
        <span
            className={`relative ${isWordmark ? "inline-block whitespace-nowrap" : "block text-center"}`}
            style={{
    color,
    fontFamily: "var(--font-geist-sans), sans-serif",
    fontWeight: isWordmark ? 900 : 600,
    letterSpacing: isWordmark ? "-0.02em" : "0.01em",
    fontSize: fontSizePx,
    lineHeight: isWordmark ? 1.0 : 1.45,
}}
        >
            {/* Scrim radial feather (legibilidad sobre los puntos). Detrás del texto;
                escala con la fuente (inset en em). Opacidad atada a la escritura. */}
            <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute block"
                style={{
                    top: "-0.5em",
                    bottom: "-0.5em",
                    left: "-1.2em",
                    right: "-1.2em",
                    background: scrimBg,
                    opacity: scrimOpacity,
                    zIndex: 0,
                    willChange: "opacity",
                }}
            />
            <motion.span
                className={isWordmark ? "relative inline-block" : "relative block text-center"}
                style={{
                    clipPath: clip,
                    WebkitClipPath: clip,
                    willChange: "clip-path",
                    zIndex: 1,
                }}
            >
                {text}
            </motion.span>
            <motion.span
                aria-hidden="true"
                className="absolute bottom-0 top-0"
                style={{ left: caretLeft, opacity: caretOpacity, zIndex: 2 }}
            >
                <span
                    className="block h-full"
                    style={{
                        width: 2,
                        background: color,
                        animation: "intro-lockup-caret 1s steps(1) infinite",
                    }}
                />
            </motion.span>
        </span>
    );
}

/**
 * Texto del lockup del intro (compartido HOME + MARKETING): "develOP" ARRIBA
 * del logo y el slogan ABAJO, escritos con wipe izq→derecha + cursor — todo
 * MotionValue-driven (sin setState por frame). Posición ABSOLUTA relativa al
 * footprint del logo → NO mueve ni redimensiona el logo. Client-only.
 *
 * El tamaño del texto es proporcional al boxPx del logo (escala en sync con la
 * marca a cualquier viewport). Tunables: *_SIZE_FRAC y *_OFFSET_FRAC arriba.
 */
export function IntroLockupText({
    isSplitLayout,
    color,
    reveal,
    canvasSizePx,
}: {
    isSplitLayout: boolean;
    color: string;
    reveal: MotionValue<number>;
    canvasSizePx?: { w: number; h: number };
}) {
    const isClient = useIsClient();
    if (!isClient) {
        return null;
    }

    const w = canvasSizePx?.w ?? window.innerWidth;
    const h = canvasSizePx?.h ?? window.innerHeight;
    const scale = computeLogoOuterScale(w, h, isSplitLayout);
    const Hvis = logoHvis(isSplitLayout);
    const boxPx = LOGO_BOX_WORLD * scale * (h / Hvis) * FOOTPRINT_CALIB;
    const yOffsetPx = -(LOGO_Y_WORLD / Hvis) * h;

    const wordmarkFontPx = Math.min(
        WORDMARK_SIZE_MAX,
        Math.max(WORDMARK_SIZE_MIN, Math.round(boxPx * WORDMARK_SIZE_FRAC)),
    );
    const sloganFontPx = Math.min(
        SLOGAN_SIZE_MAX,
        Math.max(SLOGAN_SIZE_MIN, Math.round(boxPx * SLOGAN_SIZE_FRAC)),
    );
    const sloganMaxWidthPx = Math.round(boxPx * SLOGAN_WIDTH_FRAC);

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
            <div className="relative" style={{ transform: `translateY(${yOffsetPx}px)` }}>
                <div
                    className="absolute left-1/2 -translate-x-1/2 text-center"
                    style={{ bottom: boxPx * WORDMARK_OFFSET_FRAC }}
                >
                    <WipeLine
                        text={WORDMARK_TEXT}
                        color={color}
                        reveal={reveal}
                        range={WORDMARK_RANGE}
                        variant="wordmark"
                        fontSizePx={wordmarkFontPx}
                    />
                </div>
                {/* Width explícito para que el block span se expanda: los absolute
                    shrink-to-fit colapsan a min-content sin un width en el contenedor. */}
                <div
                    className="absolute left-1/2 -translate-x-1/2 text-center uppercase"
                    style={{ top: boxPx * SLOGAN_OFFSET_FRAC, width: sloganMaxWidthPx }}
                >
                    <WipeLine
                        text={SLOGAN_TEXT}
                        color={color}
                        reveal={reveal}
                        range={SLOGAN_RANGE}
                        variant="slogan"
                        fontSizePx={sloganFontPx}
                    />
                </div>
            </div>
            <style>{`@keyframes intro-lockup-caret{0%,50%{opacity:1}51%,100%{opacity:0}}`}</style>
        </div>
    );
}

export default IntroLockupText;
