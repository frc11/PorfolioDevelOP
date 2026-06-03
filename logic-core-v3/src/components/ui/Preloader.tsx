"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion/react";
import { usePathname } from "next/navigation";

import { usePreloader } from "@/context/PreloaderContext";
import { shouldRunMarketingIntro } from "@/lib/marketing-routes";
import { shouldRunHomeIntro, markHomeIntroConsumed } from "@/lib/home-routes";
import { MarketingIntro } from "@/components/ui/MarketingIntro";
import {
    TEXT_LEAD_MS,
    WRITE_MS,
    READ_HOLD_MS,
    ERASE_MS,
} from "@/components/ui/IntroLockupText";

type PreloaderProps = {
    isHomePage?: boolean;
    onPreloaderComplete?: () => void;
};

// ── Tunables del intro (Emil-style: ease-out, props GPU) ──────────────────────
const VEIL_FADE_SECONDS = 1.4; // paso 1: negro → blanco (lento; el canvas queda oculto)
const STEP_DELAY_SECONDS = 0.15; // delay entre pasos (tras el velo, antes del fade-in)
const COMPRESS_SECONDS = 0.78; // paso 3: introProgress 0→1 (logo→derecha + dots + blanco)
const LOGO_READY_TIMEOUT_MS = 2500; // tope del readiness gate (no colgar si el SVG tarda)
// R3 — reveal del logo (desktop): trazo NEGRO → relleno → crossfade al chrome, en la
// ventana `text` (ANTES de flying). Mobile/reduced: pop como antes (sin regresión).
const HOME_STROKE_SECONDS = 0.85; // dibujado del contorno 2D negro
const HOME_FILL_SECONDS = 0.45; // relleno (color del fill blanco→negro)
const HOME_CROSSFADE_SECONDS = 0.4; // crossfade 2D→chrome (layerOpacity 1→0)
const HOME_DOTS_REVEAL_SECONDS = 0.55; // reveal aleatorio de puntos
const HOME_CANVAS_FADEIN_SECONDS = 0.4; // fade corto del canvas (post-fx) sobre el blanco
// Lockup de texto ("develOP" + slogan): el timing (lead-in / escritura / hold de
// lectura / borrado) está centralizado en IntroLockupText (TEXT_LEAD_MS, WRITE_MS,
// READ_HOLD_MS, ERASE_MS). El texto arranca un toque ANTES del dibujado, queda quieto
// para leer y se BORRA (lento) ANTES del flying. READ_HOLD_MS también es el hold
// centrado (mouse-follow) previo a la traslación.
// ──────────────────────────────────────────────────────────────────────────────
const VEIL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const HOME_STROKE_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];
const COMPRESS_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const MOBILE_BREAKPOINT = 768;

/**
 * Orquestador del intro (SOLO home). Ya NO monta 3D: el logo y los puntos viven
 * en el único canvas full-bleed del Hero. Secuencia ESTRICTA, cada paso tras el
 * anterior (con await):
 *   1) negro → blanco (velo, canvas oculto)
 *   2) fade-in de puntos+logo (canvasReveal 0→1)  ← recién con la pantalla blanca
 *   3) hold centrado → movimiento/compresión (introProgress 0→1)
 *   4) contenido (gate del Hero) → done
 *
 * El SCROLL LOCK lo posee el Hero (html+body overflow + lenis.stop hasta 'done');
 * además hay un lock pre-hidratación en el <head> del layout (solo home).
 *
 * Home-only: en rutas no-home el preloader NO corre (route B deferida).
 */
export default function Preloader({
    isHomePage = true,
    onPreloaderComplete,
}: PreloaderProps) {
    const {
        isDone,
        setPhase,
        introProgress,
        canvasReveal,
        logoStrokeProgress,
        logoFillProgress,
        logoLayerOpacity,
        dotsReveal,
        textReveal,
        waitForLogoReady,
    } = usePreloader();
    const pathname = usePathname();
    const isHome = isHomePage && pathname === "/";
    const veilRef = useRef<HTMLDivElement>(null);
    const isCancelledRef = useRef(false);
    const timeoutIdsRef = useRef<number[]>([]);

    useEffect(() => {
        // Solo home; bajo automation el contexto ya saltó a `done`.
        if (!isHome || isDone) {
            return;
        }

        isCancelledRef.current = false;

        const wait = (ms: number) =>
            new Promise<void>((resolve) => {
                const id = window.setTimeout(resolve, ms);
                timeoutIdsRef.current.push(id);
            });

        const finish = () => {
            onPreloaderComplete?.();
            setPhase("done");
        };

        const run = async () => {
            // Gate: SOLO hard-load / URL directa a "/" (NO client-nav).
            // Si llegamos por nav (marketing→home), setPhase('done') al toque → Hero
            // queda en estado final limpio y el Shutter cubre la transición.
            if (!shouldRunHomeIntro()) {
                finish();
                return;
            }

            const veil = veilRef.current;
            const reduced = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

            // PASO 0 — negro + readiness gate (el velo no se levanta hasta que el
            // SVG del logo está cargado/extruido, o vence el timeout).
            setPhase("drawing");
            await Promise.race([waitForLogoReady(), wait(LOGO_READY_TIMEOUT_MS)]);
            if (isCancelledRef.current) return;

            // PASO 1 — negro → blanco (LENTO). El canvas (puntos+logo) queda OCULTO
            // (canvasReveal sigue en 0): solo se revela la pantalla blanca.
            setPhase("filling");
            if (veil) {
                await animate(
                    veil,
                    { opacity: 0 },
                    {
                        duration: reduced ? 0.3 : VEIL_FADE_SECONDS,
                        ease: VEIL_EASE,
                    },
                );
            }
            if (isCancelledRef.current) return;

            // PASO 2 — recién con la pantalla blanca, aparición del logo + puntos.
            await wait(reduced ? 0 : STEP_DELAY_SECONDS * 1000);
            if (isCancelledRef.current) return;
            setPhase("text");

            if (!isMobile && !reduced) {
                // DESKTOP (R3): reveal progresivo CENTRADO antes de flying.
                //   trazo NEGRO → relleno negro → crossfade al chrome; puntos random.
                // El canvas se hace visible al instante: el 3D queda TAPADO por la
                // overlay (mask blanca) y los puntos arrancan ocultos (dotsReveal 0)
                // → no hay "pop" hasta que cada pieza aparece sola.
                logoLayerOpacity.set(1);
                logoStrokeProgress.set(0);
                logoFillProgress.set(0);
                dotsReveal.set(0);
                textReveal.set(0);

                // Lead-in: el texto arranca PRIMERO y se escribe (lento) un toque antes
                // del dibujado — el canvas/puntos/trazo entran recién tras TEXT_LEAD_MS.
                void animate(textReveal, 1, {
                    duration: WRITE_MS / 1000,
                    ease: VEIL_EASE,
                });
                await wait(TEXT_LEAD_MS);
                if (isCancelledRef.current) return;

                // Canvas visible con fade CORTO (la pantalla es blanca → evita el
                // "pop" del vignette/post-fx en los bordes). El 3D sigue tapado por la
                // overlay y los puntos arrancan en dotsReveal=0 → no hay pop de logo/puntos.
                void animate(canvasReveal, 1, {
                    duration: HOME_CANVAS_FADEIN_SECONDS,
                    ease: VEIL_EASE,
                });
                void animate(dotsReveal, 1, {
                    duration: HOME_DOTS_REVEAL_SECONDS,
                    ease: "linear",
                });
                await animate(logoStrokeProgress, 1, {
                    duration: HOME_STROKE_SECONDS,
                    ease: HOME_STROKE_EASE,
                });
                if (isCancelledRef.current) return;
                await animate(logoFillProgress, 1, {
                    duration: HOME_FILL_SECONDS,
                    ease: VEIL_EASE,
                });
                if (isCancelledRef.current) return;
                // Crossfade: la overlay 2D se desvanece → revela el chrome (que el
                // Hero mantuvo HEAD-ON mientras layerOpacity>0 → no asoma silueta).
                await animate(logoLayerOpacity, 0, {
                    duration: HOME_CROSSFADE_SECONDS,
                    ease: VEIL_EASE,
                });
                if (isCancelledRef.current) return;
                // Hold de lectura: texto escrito + logo centrado (mouse-follow) — da
                // tiempo a leer antes de borrar/trasladar.
                await wait(READ_HOLD_MS);
                if (isCancelledRef.current) return;
                // El texto se BORRA (wipe en reversa, lento) ANTES del flying — NO lo
                // sigue: queda centrado, se borra, y recién entonces el logo se traslada.
                await animate(textReveal, 0, {
                    duration: ERASE_MS / 1000,
                    ease: VEIL_EASE,
                });
            } else if (isMobile && !reduced) {
                // MOBILE non-reduced: pintado NEGRO simple antes de revelar contenido.
                // Sin puntos random (mobile no monta dots), sin window de mouse-follow.
                // El canvas in-box aparece al instante; la overlay tapa el chrome hasta
                // el crossfade instantáneo → 3D quieto sin borde asomando.
                canvasReveal.set(1);
                logoLayerOpacity.set(1);
                logoStrokeProgress.set(0);
                logoFillProgress.set(0);
                textReveal.set(0);

                // Lead-in: el texto arranca PRIMERO (un toque antes del dibujado).
                void animate(textReveal, 1, {
                    duration: WRITE_MS / 1000,
                    ease: VEIL_EASE,
                });
                await wait(TEXT_LEAD_MS);
                if (isCancelledRef.current) return;

                await animate(logoStrokeProgress, 1, {
                    duration: HOME_STROKE_SECONDS,
                    ease: HOME_STROKE_EASE,
                });
                if (isCancelledRef.current) return;
                await animate(logoFillProgress, 1, {
                    duration: HOME_FILL_SECONDS,
                    ease: VEIL_EASE,
                });
                if (isCancelledRef.current) return;
                // Crossfade instantáneo en mobile (sin ventana de 2s: el 3D aparece
                // junto con el contenido en swapping).
                logoLayerOpacity.set(0);
                if (isCancelledRef.current) return;
                // Hold de lectura y luego el texto se BORRA (wipe en reversa, lento)
                // antes de que entre el contenido (mobile no tiene flying; igual no
                // debe persistir sobre el hero real).
                await wait(READ_HOLD_MS);
                if (isCancelledRef.current) return;
                await animate(textReveal, 0, {
                    duration: ERASE_MS / 1000,
                    ease: VEIL_EASE,
                });
            } else {
                // REDUCED motion (cualquier plataforma): pop rápido sin overlay.
                await animate(canvasReveal, 1, {
                    duration: 0.25,
                    ease: VEIL_EASE,
                });
                if (isCancelledRef.current) return;
                await wait(100);
            }
            if (isCancelledRef.current) return;
            setPhase("waiting");

            // PASO 3 — recién con el fade-in terminado, movimiento/compresión
            // (logo centro→derecha + dots densifican/migran + capa blanca scaleX),
            // todo con el MISMO introProgress. En mobile nada se traslada.
            if (!isMobile) {
                setPhase("flying");
                await animate(introProgress, 1, {
                    duration: reduced ? 0.3 : COMPRESS_SECONDS,
                    ease: COMPRESS_EASE,
                });
                if (isCancelledRef.current) return;
            }

            // PASO 4 — recién con la compresión TERMINADA entra el contenido
            // (gate del Hero: swapping || done) y cerramos.
            setPhase("swapping");
            await wait(reduced ? 120 : 240);
            if (isCancelledRef.current) return;

            markHomeIntroConsumed(); // solo al terminar (no en early-exit de client-nav)
            finish();
        };

        void run();

        return () => {
            isCancelledRef.current = true;
            timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
            timeoutIdsRef.current = [];
        };
    }, [
        isHome,
        isDone,
        onPreloaderComplete,
        setPhase,
        introProgress,
        canvasReveal,
        logoStrokeProgress,
        logoFillProgress,
        logoLayerOpacity,
        dotsReveal,
        textReveal,
        waitForLogoReady,
    ]);

    // Route B — rama marketing (gate de disparo: SOLO hard-load / URL directa, NO
    // client-nav). Los hooks del home ya corrieron arriba (no-op cuando no es home).
    // En SSR el gate devuelve isMarketingRoute → el velo va en el primer paint.
    if (shouldRunMarketingIntro(pathname)) {
        return <MarketingIntro />;
    }

    if (!isHome || isDone) {
        return null;
    }

    // Guard de render: en client-nav el módulo home-routes cargó desde otra ruta
    // → shouldRunHomeIntro()=false → no renderizar el velo (evita flash negro sobre
    // el Shutter). En SSR (sin window) no aplica → el velo va en el primer paint.
    if (typeof window !== "undefined" && !shouldRunHomeIntro()) {
        return null;
    }

    // Velo negro: opaco en `drawing`, se desvanece (opacity 1→0) en `filling`.
    // pointer-events:none para no bloquear nada una vez transparente.
    return (
        <div
            ref={veilRef}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[9999] bg-[#0a0a0a]"
        />
    );
}
