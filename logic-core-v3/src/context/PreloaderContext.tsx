"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useMotionValue, type MotionValue } from "motion/react";

export type PreloaderPhase =
    | "drawing"
    | "filling"
    | "text"
    | "waiting"
    | "flying"
    | "swapping"
    | "done";

export type PreloaderContextType = {
    phase: PreloaderPhase;
    setPhase: (phase: PreloaderPhase) => void;
    heroCanvasRect: DOMRect | null;
    setHeroCanvasRect: (rect: DOMRect) => void;
    isDone: boolean;
    /**
     * Drives the intro → hero choreography (logo X translate + dot-grid
     * compression). Animated imperatively by the Preloader orchestrator and
     * sampled per-frame inside the Hero canvas, so it never triggers a React
     * re-render. 0 = intro start (logo centred, dots sparse full-screen),
     * 1 = final hero (logo in right column, dots dense right-half).
     */
    introProgress: MotionValue<number>;
    /**
     * Fade-in SEPARADO de puntos+logo (paso aparte: tras el velo negro→blanco y
     * antes del movimiento). 0 = canvas oculto, 1 = visible. Lo anima el orquestador.
     */
    canvasReveal: MotionValue<number>;
    /**
     * R3 — reveal progresivo del logo del HOME (desktop). El orquestador (Preloader)
     * las anima en la ventana `text` (ANTES de `flying`); el Hero las bindea a la
     * <LogoStrokeOverlay/> + puntos + gate del mouse-follow. Aditivas (como introProgress);
     * NO tocan el enum/flujo. Defaults seguros (overlay ausente, puntos visibles) para
     * que en mobile/reduced/automation/nav-in el hero quede en su estado final.
     */
    logoStrokeProgress: MotionValue<number>; // 0→1 dibujado del contorno 2D
    logoFillProgress: MotionValue<number>; // 0→1 relleno (color bg→negro)
    logoLayerOpacity: MotionValue<number>; // 1→0 crossfade al 3D (default 0 = sin overlay)
    dotsReveal: MotionValue<number>; // 0→1 reveal aleatorio de puntos (default 1 = visibles)
    /**
     * Texto del lockup del intro ("develOP" + slogan) — efecto de escritura. 0→1
     * escribe (junto al dibujado del logo), 1→0 borra (HOME, antes del flying).
     * Aditiva como las de arriba; NO toca el enum/flujo. Default 0 = sin texto (el
     * hero final no lo muestra: automation/nav-in/mobile-reduced quedan limpios).
     */
    textReveal: MotionValue<number>;
    /**
     * Readiness gate del logo: el canvas del Hero llama markLogoReady() cuando el
     * SVG está cargado + extruido; el orquestador hace await de waitForLogoReady()
     * antes de levantar el velo (evita el "punto/spinner" previo al logo).
     */
    markLogoReady: () => void;
    waitForLogoReady: () => Promise<void>;
};

export const PreloaderContext = createContext<PreloaderContextType | undefined>(
    undefined,
);

// Headless automation (Playwright/Puppeteer/headless Chrome) reliably stalls
// the preloader because runSequence depends on RAF + canvas paint + getBoundingClientRect.
// Visual-qa screenshots were getting stuck on the full-screen black overlay.
// This jumps phase straight to "done" only when running under automation,
// leaving the real-user preloader experience untouched.
export function isAutomationEnvironment(): boolean {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
        return false;
    }

    if (navigator.webdriver === true) {
        return true;
    }

    try {
        const params = new URLSearchParams(window.location.search);
        return params.get("e2e") === "1";
    } catch {
        return false;
    }
}

export function PreloaderProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [phase, setPhaseState] = useState<PreloaderPhase>("drawing");
    const [heroCanvasRect, setHeroCanvasRectState] = useState<DOMRect | null>(
        null,
    );
    const introProgress = useMotionValue(0);
    const canvasReveal = useMotionValue(0);
    // R3 — reveal del logo (defaults seguros: overlay ausente, puntos visibles).
    const logoStrokeProgress = useMotionValue(0);
    const logoFillProgress = useMotionValue(0);
    const logoLayerOpacity = useMotionValue(0);
    const dotsReveal = useMotionValue(1);
    const textReveal = useMotionValue(0); // texto del lockup (default 0 = sin texto)
    const logoReadyRef = useRef(false);
    const logoReadyResolversRef = useRef<Array<() => void>>([]);

    const markLogoReady = useCallback(() => {
        if (logoReadyRef.current) return;
        logoReadyRef.current = true;
        logoReadyResolversRef.current.forEach((resolve) => resolve());
        logoReadyResolversRef.current = [];
    }, []);

    const waitForLogoReady = useCallback(
        () =>
            logoReadyRef.current
                ? Promise.resolve()
                : new Promise<void>((resolve) => {
                      logoReadyResolversRef.current.push(resolve);
                  }),
        [],
    );

    useEffect(() => {
        if (isAutomationEnvironment()) {
            setPhaseState("done");
        }
    }, []);

    const setPhase = useCallback((nextPhase: PreloaderPhase) => {
        setPhaseState(nextPhase);
    }, []);

    const setHeroCanvasRect = useCallback((rect: DOMRect) => {
        setHeroCanvasRectState(rect);
    }, []);

    const isDone = phase === "done";

    return (
        <PreloaderContext.Provider
            value={{
                phase,
                setPhase,
                heroCanvasRect,
                setHeroCanvasRect,
                isDone,
                introProgress,
                canvasReveal,
                logoStrokeProgress,
                logoFillProgress,
                logoLayerOpacity,
                dotsReveal,
                textReveal,
                markLogoReady,
                waitForLogoReady,
            }}
        >
            {children}
        </PreloaderContext.Provider>
    );
}

export function usePreloader() {
    const context = useContext(PreloaderContext);

    if (context === undefined) {
        throw new Error("usePreloader must be used within a PreloaderProvider");
    }

    return context;
}
