"use client";

import { createContext, useCallback, useContext, useState } from "react";

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

export function PreloaderProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [phase, setPhaseState] = useState<PreloaderPhase>("drawing");
    const [heroCanvasRect, setHeroCanvasRectState] = useState<DOMRect | null>(
        null,
    );

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
