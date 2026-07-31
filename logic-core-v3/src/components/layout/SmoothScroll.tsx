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

        // Este forzado a scroll 0 existía para que el velo del intro tapara la
        // posición correcta y el slot del logo del hero se midiera desde 0.
        // B2-S1 borró esa coreografía: no hay velo ni logo que medir. Lo único
        // que seguía haciendo era pisar el scroll nativo al hash — el navegador
        // aterrizaba en la sección y este efecto la devolvía al tope.
        //
        // Se conserva para la entrada SIN ancla (que sí debe empezar arriba, y
        // acompaña a `history.scrollRestoration = 'manual'`) y se saltea cuando
        // la URL trae un destino.
        //
        // ⚠ Esto es NECESARIO pero NO SUFICIENTE para que `/#portfolio`,
        // `/#nosotros` y `/#servicios` aterricen en carga fría. Quedan dos causas
        // medidas, las dos fuera del alcance de B2-S2 y ambas en el terreno que
        // B3/B4 rediseña:
        //
        //  1. `app/page.tsx` monta las secciones con `next/dynamic` + placeholder.
        //     Cuando el navegador resuelve el hash, el destino todavía es un
        //     placeholder sin caja: no hay a dónde saltar. Medido en build de
        //     producción — el documento pasa de ~16.200px a ~21.500px a medida
        //     que las secciones montan.
        //  2. `#nosotros` está declarado DOS veces (`About.tsx`, variante mobile
        //     y desktop). `getElementById` devuelve la primera, que en desktop
        //     está en `display:none` — el navegador apunta a un elemento sin caja.
        //
        // Se intentó un reintento por rAF acá y se descartó: no aterrizaba de
        // forma reproducible y le peleaba el control a Lenis. El arreglo real es
        // que el destino exista con caja cuando el hash se resuelve.
        const hasHashTarget = window.location.hash.length > 1;

        if (isHome && !hasHashTarget) {
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
        // virtual scroll position independently of the DOM scroll). Mismo gate:
        // con ancla en la URL no hay nada que sincronizar a 0 — Lenis lee la
        // posición real del documento al construirse.
        if (isHome && !hasHashTarget) {
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
