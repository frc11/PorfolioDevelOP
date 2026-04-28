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

    useEffect(() => {
        const isPortal = pathname && (pathname.startsWith('/admin') || pathname.startsWith('/dashboard'));
        
        if (isPortal) {
            return;
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
