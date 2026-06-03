'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { usePathname } from 'next/navigation';

interface SmoothScrollProps {
    children: React.ReactNode;
}

// Tipar el contexto correctamente
const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
    return useContext(LenisContext);
}

export function SmoothScroll({ children }: SmoothScrollProps) {
    const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
    const pathname = usePathname();

    // Prevent the browser from auto-restoring scroll position on reload so the
    // preloader always runs from the top and the logo handoff lands correctly.
    useEffect(() => {
        history.scrollRestoration = 'manual';
    }, []);

    useEffect(() => {
        const isPortal = pathname && (pathname.startsWith('/admin') || pathname.startsWith('/dashboard'));

        if (isPortal) {
            return;
        }

        const isHome = pathname === '/';

        // On the home route, force the page to the top before Lenis initialises
        // so the preloader overlay covers the correct position and the hero logo
        // slot is measured from scroll 0.
        if (isHome) {
            window.scrollTo(0, 0);
        }

        const isTouchLikeDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

        // Keep native scroll physics on touch devices to avoid section jump/bounce artifacts.
        if (isTouchLikeDevice) {
            return;
        }

        const lenis = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            syncTouch: false,
            wheelMultiplier: 1,
            touchMultiplier: 1,
            overscroll: false,
        });

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLenisInstance(lenis);

        // Sync Lenis's internal scroll state to 0 for the home route so it
        // agrees with the window.scrollTo(0,0) above (Lenis tracks its own
        // virtual scroll position independently of the DOM scroll).
        if (isHome) {
            lenis.scrollTo(0, { immediate: true });
        }

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            setLenisInstance(null);
        };
    }, [pathname]);

    return (
        <LenisContext.Provider value={lenisInstance}>
            {children}
        </LenisContext.Provider>
    );
}
