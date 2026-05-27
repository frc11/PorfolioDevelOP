"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

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
};

export const PreloaderContext = createContext<PreloaderContextType | undefined>(
    undefined,
);

// Headless automation (Playwright/Puppeteer/headless Chrome) reliably stalls
// the preloader because runSequence depends on RAF + canvas paint + getBoundingClientRect.
// Visual-qa screenshots were getting stuck on the full-screen black overlay.
// This jumps phase straight to "done" only when running under automation,
// leaving the real-user preloader experience untouched.
function isAutomationEnvironment(): boolean {
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
