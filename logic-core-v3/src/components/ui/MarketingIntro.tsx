"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

import { useLenis } from "@/components/layout/SmoothScroll";

import { isAutomationEnvironment } from "@/context/PreloaderContext";
import { markIntroConsumed } from "@/lib/marketing-routes";
import { BrandedIntroCanvas } from "@/components/ui/BrandedIntroCanvas";
import { LogoStrokeOverlay } from "@/components/ui/LogoStrokeOverlay";
import { IntroLockupText, WRITE_MS, TEXT_LEAD_MS } from "@/components/ui/IntroLockupText";

// ── Tunables del intro branded de marketing (R4 calibra) ──────────────────────
const MARKETING_VEIL_COLOR = "#0a0a0a"; // backdrop oscuro/neutro (= máscara del 2D)
const MARKETING_STROKE_COLOR = "#f4f4f5"; // trazo BLANCO (contrasta el fondo oscuro)
const MARKETING_SETTLE_MS = 420; // el 3D asienta (opacity/y) TAPADO antes del trazo
const MARKETING_DOTS_REVEAL_SECONDS = 0.55; // R2: reveal aleatorio por-punto (linear → stagger limpio)
const MARKETING_STROKE_SECONDS = 0.85; // dibujado del contorno (stroke-dashoffset)
const MARKETING_FILL_SECONDS = 0.45; // relleno del logo (color del fill: bg→blanco)
const MARKETING_CROSSFADE_SECONDS = 0.4; // crossfade 2D→3D (overlay opacity 1→0)
const MARKETING_INTERACT_MS = 1000; // ventana interactiva (mouse-follow) post-crossfade [acortada 2000→1000: el desktop marketing tardaba demasiado en irse — tunable]
// Lockup de texto: timing (lead-in + escritura, lento) centralizado en IntroLockupText
// (TEXT_LEAD_MS, WRITE_MS). El texto arranca un toque ANTES del trazo y NO se borra →
// queda sólido y SUBE con el toldo.
const MARKETING_LIFT_SECONDS = 0.8; // toldo sube (translateY 0→-100%)
const MARKETING_LIFT_EASE: [number, number, number, number] = [0.4, 0, 0.6, 1]; // ease-in-out
const MARKETING_READY_TIMEOUT_MS = 2500; // tope del readiness gate (no colgar)
const MARKETING_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const MARKETING_STROKE_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];
// ──────────────────────────────────────────────────────────────────────────────

// Patrón "blessed" (suscripción a matchMedia) — lint-clean. false en SSR / primer
// render cliente (sin mismatch), resuelve tras montar.
function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const update = () => setMatches(mediaQuery.matches);
        update();
        mediaQuery.addEventListener("change", update);
        return () => mediaQuery.removeEventListener("change", update);
    }, [query]);

    return matches;
}

/**
 * Route B — overlay del intro branded en páginas de marketing.
 *
 * Velo oscuro (`#0a0a0a`, `z-[9999]`, `pointer-events:none`, SIN scroll lock / SIN
 * force-top). Dentro: el `<BrandedIntroCanvas/>` (3D + puntos) + el
 * `<LogoStrokeOverlay/>` (trazado 2D que se dibuja y hace crossfade al 3D).
 *
 * Secuencia LOCAL (no toca el `phase` global ni la readiness del contexto):
 *   readiness → settle (3D asienta TAPADO) → trazo + relleno (color bg→blanco) +
 *   puntos → crossfade 2D→3D → mouse-follow ON → ~2s interactivos → fade-out.
 *
 * - Animaciones por MotionValues (sin re-render por frame, sin clobber). El único
 *   React state que dispara render es `done`/`mouseFollowEnabled`, seteados async
 *   tras los awaits → no son set-state-in-effect sincrónicos.
 * - reduced-motion: sin trazo (logo directo), corto, sin parallax. Automation: salta.
 */
export function MarketingIntro() {
    const isSplitLayout = useMediaQuery("(min-width: 768px)");
    const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
    // Always-true en cliente → flag isClient (false en SSR/primer render). Evita
    // SSR'ear el <Canvas> r3f; el VELO sí va en SSR (cubre el primer paint).
    const isClient = useMediaQuery("(min-width: 1px)");

    const [done, setDone] = useState(false);
    const [mouseFollowEnabled, setMouseFollowEnabled] = useState(false);

    // Lenis: ref para que el cleanup siempre use la instancia actual (sin capturar
    // stale en el closure) y sin meter lenis como dep del effect principal.
    const lenis = useLenis();
    const lenisRef = useRef(lenis);
    useEffect(() => {
        lenisRef.current = lenis;
    }, [lenis]);

    // Opacidades / progreso por MotionValue (no React state → sin clobber).
    const containerOpacity = useMotionValue(1); // velo + canvas (fade-out final)
    const canvasReveal = useMotionValue(0); // canvas (3D tapado + puntos) fade-in
    const strokeProgress = useMotionValue(0); // dibujado del contorno 2D (0→1)
    const fillProgress = useMotionValue(0); // relleno del logo (color bg→blanco, opaco)
    const overlayOpacity = useMotionValue(1); // capa 2D (1→0 = crossfade al 3D)
    const dotsReveal = useMotionValue(0); // reveal aleatorio por-punto (R2)
    const textReveal = useMotionValue(0); // lockup de texto ("develOP" + slogan): 0→1 escribe
    const liftY = useMotionValue(0); // 0..1 → toldo sube (0%→-100%)
    const liftTranslateY = useTransform(liftY, [0, 1], ["0%", "-100%"]);

    const isCancelledRef = useRef(false);
    const timeoutIdsRef = useRef<number[]>([]);

    // Readiness LOCAL (ref/promesa propios — NO los helpers del contexto).
    const readyRef = useRef(false);
    const readyResolveRef = useRef<(() => void) | null>(null);
    const markLogoReady = useCallback(() => {
        if (readyRef.current) return;
        readyRef.current = true;
        readyResolveRef.current?.();
        readyResolveRef.current = null;
    }, []);

    useEffect(() => {
        isCancelledRef.current = false;

        const reduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        const automation = isAutomationEnvironment();

        const wait = (ms: number) =>
            new Promise<void>((resolve) => {
                const id = window.setTimeout(resolve, ms);
                timeoutIdsRef.current.push(id);
            });

        const waitForLogoReady = () =>
            readyRef.current
                ? Promise.resolve()
                : new Promise<void>((resolve) => {
                      readyResolveRef.current = resolve;
                  });

        const finish = () => {
            markIntroConsumed();
            setDone(true);
        };

        const lockScroll = () => {
            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
            lenisRef.current?.stop();
        };
        const unlockScroll = () => {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            lenisRef.current?.start();
        };

        const run = async () => {
            // Scroll bloqueado desde el arranque (se libera cuando el toldo termina
            // de subir o en cleanup, garantizado).
            lockScroll();

            // Skip de automation: página visible al toque (visual-qa ve el reposo).
            if (automation) {
                unlockScroll();
                finish();
                return;
            }

            // MOBILE: solo pintado (sin 3D, sin crossfade, sin ventana de 2s).
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                if (reduced) {
                    // Mobile + reduced: lift instantáneo (texto estático, sin escritura).
                    overlayOpacity.set(0);
                    textReveal.set(1);
                    liftY.set(1);
                    unlockScroll();
                    finish();
                    return;
                }
                // Mobile non-reduced: trazo BLANCO → relleno → toldo.
                // Sin readiness gate (no hay 3D que esperar), sin settle.
                // Lead-in: el texto arranca (lento) un toque ANTES del trazo; NO se borra
                // → queda sólido y SUBE con el toldo (es hijo del root que sube).
                void animate(textReveal, 1, {
                    duration: WRITE_MS / 1000,
                    ease: MARKETING_EASE,
                });
                await wait(TEXT_LEAD_MS);
                if (isCancelledRef.current) return;
                await animate(strokeProgress, 1, {
                    duration: MARKETING_STROKE_SECONDS,
                    ease: MARKETING_STROKE_EASE,
                });
                if (isCancelledRef.current) return;
                await animate(fillProgress, 1, {
                    duration: MARKETING_FILL_SECONDS,
                    ease: MARKETING_EASE,
                });
                if (isCancelledRef.current) return;
                // El 2D relleno (blanco) NO se desvanece: queda SÓLIDO (overlayOpacity=1)
                // dentro del overlay y SUBE JUNTO con el toldo (es hijo del contenedor que
                // hace el lift). Sin fade-out separado → no desaparece antes de subir.
                await wait(300);
                if (isCancelledRef.current) return;
                await animate(liftY, 1, {
                    duration: MARKETING_LIFT_SECONDS,
                    ease: MARKETING_LIFT_EASE,
                });
                if (isCancelledRef.current) return;
                unlockScroll();
                finish();
                return;
            }

            // DESKTOP — desde aquí (desktop).
            // 1. Esperar a que el logo (SVG) esté cargado/extruido (o vencer el timeout).
            await Promise.race([waitForLogoReady(), wait(MARKETING_READY_TIMEOUT_MS)]);
            if (isCancelledRef.current) return;

            // reduced-motion desktop: sin trazo, logo directo, toldo rápido.
            if (reduced) {
                overlayOpacity.set(0); // sin capa 2D → el 3D se ve directo
                dotsReveal.set(1); // puntos todos visibles de golpe (sin stagger)
                canvasReveal.set(1);
                textReveal.set(1); // texto estático (sin escritura) → sube con el toldo
                await wait(120);
                if (isCancelledRef.current) return;
                liftY.set(1); // lift instantáneo (no animación para reduced-motion)
                unlockScroll();
                finish();
                return;
            }

            // 2. Settle: el 3D asienta (opacity/y internos) TAPADO por la máscara,
            //    con el canvas aún invisible (canvasReveal=0) → sin chrome asomando.
            await wait(MARKETING_SETTLE_MS);
            if (isCancelledRef.current) return;

            // 3. Reveal: lead-in del texto → luego canvas + puntos + trazo.
            //    El texto (BLANCO) arranca PRIMERO sobre el velo, un toque ANTES de que
            //    aparezcan canvas/puntos y arranque el trazo; NO se borra → queda sólido
            //    durante crossfade + ventana interactiva y SUBE con el toldo.
            void animate(textReveal, 1, {
                duration: WRITE_MS / 1000,
                ease: MARKETING_EASE,
            });
            await wait(TEXT_LEAD_MS);
            if (isCancelledRef.current) return;

            // Canvas visible al instante; puntos en orden ALEATORIO (dotsReveal) +
            // trazo del logo (strokeProgress), en paralelo.
            canvasReveal.set(1); // canvas visible de golpe → per-dot reveal limpio
            void animate(dotsReveal, 1, {
                duration: MARKETING_DOTS_REVEAL_SECONDS,
                ease: "linear", // lineal → stagger uniforme, sin aceleración artificial
            });
            await animate(strokeProgress, 1, {
                duration: MARKETING_STROKE_SECONDS,
                ease: MARKETING_STROKE_EASE,
            });
            if (isCancelledRef.current) return;

            // 3b. Relleno: el color del fill anima bg→blanco (logo 2D sólido). El fill
            //     es OPACO → el 3D (blanco) sigue tapado detrás hasta el crossfade.
            await animate(fillProgress, 1, {
                duration: MARKETING_FILL_SECONDS,
                ease: MARKETING_EASE,
            });
            if (isCancelledRef.current) return;

            // 4. Crossfade: la capa 2D sólida se desvanece → revela el 3D ya asentado.
            await animate(overlayOpacity, 0, {
                duration: MARKETING_CROSSFADE_SECONDS,
                ease: MARKETING_EASE,
            });
            if (isCancelledRef.current) return;

            // 5. Recién post-crossfade: habilitar mouse-follow del 3D.
            setMouseFollowEnabled(true);

            // 6. Ventana interactiva (~2s de mouse-follow).
            await wait(MARKETING_INTERACT_MS);
            if (isCancelledRef.current) return;

            // 7. TOLDO: el overlay sube revelando la página de abajo.
            await animate(liftY, 1, {
                duration: MARKETING_LIFT_SECONDS,
                ease: MARKETING_LIFT_EASE,
            });
            if (isCancelledRef.current) return;

            // 8. Unlock de scroll + unmount.
            unlockScroll();
            finish();
        };

        void run();

        return () => {
            isCancelledRef.current = true;
            // GARANTIZADO: nunca queda el scroll trabado aunque haya unmount/error.
            unlockScroll();
            timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
            timeoutIdsRef.current = [];
        };
    }, [
        markLogoReady,
        canvasReveal,
        strokeProgress,
        fillProgress,
        overlayOpacity,
        dotsReveal,
        textReveal,
        liftY,
    ]);

    if (done) {
        return null;
    }

    return (
        <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[9999]"
            // will-change:transform → el toldo (lift) compone en SU PROPIA capa GPU
            // (translateY por MotionValue) → sin jank en mobile. Baseline perf CLAUDE.md.
            style={{ backgroundColor: MARKETING_VEIL_COLOR, opacity: containerOpacity, y: liftTranslateY, willChange: "transform" }}
        >
            <motion.div className="absolute inset-0" style={{ opacity: canvasReveal }}>
                {/* Solo desktop: en mobile no hay 3D (solo pintado 2D, sin desajuste de tamaño). */}
                {isClient && isSplitLayout ? (
                    <BrandedIntroCanvas
                        isSplitLayout={isSplitLayout}
                        prefersReducedMotion={prefersReducedMotion}
                        mouseFollowEnabled={mouseFollowEnabled}
                        dotsRevealProgress={dotsReveal}
                        onLogoReady={markLogoReady}
                    />
                ) : null}
            </motion.div>

            {/* Trazado 2D (client-only, se auto-gatea): se dibuja sobre el velo y
                hace crossfade al 3D chrome ya asentado debajo. */}
            <LogoStrokeOverlay
                isSplitLayout={isSplitLayout}
                strokeColor={MARKETING_STROKE_COLOR}
                maskColor={MARKETING_VEIL_COLOR}
                strokeProgress={strokeProgress}
                fillProgress={fillProgress}
                layerOpacity={overlayOpacity}
            />

            {/* Lockup de texto del intro ("develOP" + slogan, BLANCO) sobre el logo.
                Hijo del root → SUBE con el toldo (no se borra). Mismo footprint que
                la overlay (viewport) → centrado sobre la marca. */}
            <IntroLockupText
                isSplitLayout={isSplitLayout}
                color={MARKETING_STROKE_COLOR}
                reveal={textReveal}
            />
        </motion.div>
    );
}

export default MarketingIntro;
