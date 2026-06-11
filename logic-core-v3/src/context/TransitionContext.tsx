'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useRef, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLenis } from '@/components/layout/SmoothScroll'; // Asegúrate que la ruta sea correcta

interface TransitionContextType {
    isAnimating: boolean;
    triggerTransition: (target: string) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export function TransitionProvider({ children }: { children: ReactNode }) {
    const [isAnimating, setIsAnimating] = useState(false);
    const isManualTransition = useRef(false); // Flag to track if navigation was triggered by us
    const router = useRouter();
    const pathname = usePathname();
    const lenis = useLenis();

    const [isPending, startTransition] = useTransition();
    const pendingRouteReveal = useRef(false);

    const executeScroll = (targetId: string) => {
        const element = document.getElementById(targetId);
        if (element && lenis) {
            let offset = 0;
            if (targetId === 'servicios' || targetId === 'caracteristicas') {
                const windowHeight = window.innerHeight;
                const elementHeight = element.offsetHeight;
                offset = (elementHeight - windowHeight) / 2;
            }

            lenis.scrollTo(element, {
                offset: offset,
                immediate: true,
                force: true,
                lock: false
            });
        } else if (element) {
            const shouldCenter = targetId === 'servicios' || targetId === 'caracteristicas';
            element.scrollIntoView({
                behavior: 'auto',
                block: shouldCenter ? 'center' : 'start'
            });
        }
    };

    const triggerScrollTo = (targetId: string) => {
        setIsAnimating(true);

        if (lenis) lenis.stop();
        const safetyTimer = setTimeout(() => {
            setIsAnimating(false);
            if (lenis) lenis.start();
        }, 1000);

        setTimeout(() => {
            executeScroll(targetId);

            // Cleanup & Reveal
            setTimeout(() => {
                setIsAnimating(false);
                if (lenis) lenis.start();
                clearTimeout(safetyTimer);
            }, 300);

        }, 300);
    };

    const triggerTransition = (target: string) => {
        if (isAnimating) return;
        isManualTransition.current = true; // Mark as manual transition

        // SCENARIO 1: HASH NAVIGATION (e.g. "/#portfolio", "#portfolio")
        if (target.includes('#')) {
            const [path, hash] = target.split('#');
            // hash is "portfolio"
            // path is "/" or "/contact" or empty "" (if "#portfolio" passed)

            // 1. Check if we are already on the target path
            const isSamePath = (path === '' || path === pathname || (path === '/' && pathname === '/'));

            if (isSamePath) {
                // Simple Scroll on current page
                triggerScrollTo(hash);
                return;
            }

            // 2. Different Page -> Navigate then (Next.js auto-scrolls to ID if it exists)
            setIsAnimating(true);
            setTimeout(() => {
                router.push(target); // Navigate to full path with hash (e.g. "/#servicios") as fallback

                // Attempt to ENFORCE our custom scroll offset multiple times against browser default
                setTimeout(() => executeScroll(hash), 10);
                setTimeout(() => executeScroll(hash), 150);
                setTimeout(() => executeScroll(hash), 300);

                setTimeout(() => {
                    setIsAnimating(false);
                }, 400);
            }, 300);
            return;
        }

        // SCENARIO 2: ROUTE NAVIGATION (e.g. "/contact", "/web-development")
        if (target.startsWith('/')) {
            if (pathname === target) return;

            setIsAnimating(true);                 // cierra shutter (0.3s)
            pendingRouteReveal.current = true;

            // navega cuando el shutter ya cerró; isPending queda true hasta que
            // la ruta nueva esté lista, y el effect de abajo abre el shutter ahí.
            setTimeout(() => {
                startTransition(() => {
                    router.push(target);
                });
            }, 300);

            // red de seguridad: nunca quedarse cerrado para siempre si algo se cuelga
            setTimeout(() => {
                if (pendingRouteReveal.current) {
                    pendingRouteReveal.current = false;
                    setIsAnimating(false);
                }
            }, 8000);
            return;
        }

        // Fallback or Legacy ID only passed
        triggerScrollTo(target);
    };

    // Listen for Browser Back/Forward Events
    useEffect(() => {
        // If it was a manual click, we already handled the animation. Reset flag.
        if (isManualTransition.current) {
            isManualTransition.current = false;
            return;
        }

        // Browser Back/Forward: Do nothing (Instant Transition)
        // This prevents the "jarring" effect of seeing the new page before the shutter closes.
    }, [pathname]);

    // Route reveal: open the shutter only once the new route has finished loading
    // (Suspense-aware via useTransition's isPending — waits for dev compile / RSC).
    // The reveal is deferred to the next frame so the new route has painted before the
    // shutter fades, and so setState isn't called synchronously inside the effect body.
    useEffect(() => {
        if (!pendingRouteReveal.current || isPending) return;

        const frame = requestAnimationFrame(() => {
            pendingRouteReveal.current = false;
            setIsAnimating(false);
        });
        return () => cancelAnimationFrame(frame);
    }, [isPending]);

    return (
        <TransitionContext.Provider value={{ isAnimating, triggerTransition }}>
            {children}
        </TransitionContext.Provider>
    );
}

export function useTransitionContext() {
    const context = useContext(TransitionContext);
    if (context === undefined) {
        throw new Error('useTransitionContext must be used within a TransitionProvider');
    }
    return context;
}
