'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
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
                lock: true // Ensure the user can't interrupt the scroll
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
        }, 2000);

        setTimeout(() => {
            executeScroll(targetId);

            // Cleanup & Reveal
            setTimeout(() => {
                setIsAnimating(false);
                if (lenis) lenis.start();
                clearTimeout(safetyTimer);
            }, 600);

        }, 500);
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
                setTimeout(() => executeScroll(hash), 300);
                setTimeout(() => executeScroll(hash), 600);

                setTimeout(() => {
                    setIsAnimating(false);
                }, 800);
            }, 500);
            return;
        }

        // SCENARIO 2: ROUTE NAVIGATION (e.g. "/contact", "/web-development")
        if (target.startsWith('/')) {
            // If we are already on this page, do nothing (or simple scroll to top)
            if (pathname === target) return;

            setIsAnimating(true);

            // 1. Shutter Close
            setTimeout(() => {
                router.push(target);

                // 2. Shutter Open (after delay)
                setTimeout(() => {
                    setIsAnimating(false);
                }, 800);
            }, 500);
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