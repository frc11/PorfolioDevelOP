'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useLenis } from '@/components/layout/SmoothScroll'; // Asegúrate que la ruta sea correcta

interface TransitionContextType {
    isAnimating: boolean;
    triggerTransition: (targetId: string) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export function TransitionProvider({ children }: { children: ReactNode }) {
    const [isAnimating, setIsAnimating] = useState(false);
    const lenis = useLenis();

    const triggerTransition = (targetId: string) => {
        if (isAnimating) return;

        setIsAnimating(true);

        // FASE 1: MATAR LA INERCIA (Inmediato)
        if (lenis) {
            // .stop() congela el scroll y evita que el usuario interactúe
            lenis.stop();
        }

        // Timer de seguridad por si algo falla
        const safetyTimer = setTimeout(() => {
            setIsAnimating(false);
            if (lenis) lenis.start();
        }, 2000);

        // FASE 2: EL TELETRANSPORTE (500ms - cuando la animación cubre la pantalla)
        setTimeout(() => {
            const element = document.getElementById(targetId);

            if (element && lenis) {
                // AQUÍ ESTÁ LA SOLUCIÓN:
                // Usamos lenis.scrollTo con 'immediate: true'.
                // Esto hace dos cosas:
                // 1. Mueve el scroll instantáneamente sin animación suavizada.
                // 2. Resetea la velocidad interna de Lenis a 0 (mata la inercia residual).

                // Calcular offset para centrar secciones específicas
                let offset = 0;
                if (targetId === 'servicios' || targetId === 'porque-develop') {
                    // Centrar el elemento en el viewport
                    // Offset negativo mueve el scroll hacia arriba (mostrando más arriba del elemento)
                    // Offset positivo mueve el scroll hacia abajo (entrando en el elemento)
                    // lenis.scrollTo(element) lleva el top del elemento al top del viewport.
                    // Queremos: (TopElement + ElementHeight/2) - (WindowHeight/2)
                    // Lenis va a TopElement.
                    // Adjustment = (ElementHeight/2) - (WindowHeight/2)

                    const windowHeight = window.innerHeight;
                    const elementHeight = element.offsetHeight;
                    offset = (elementHeight - windowHeight) / 2;
                }

                lenis.scrollTo(element, {
                    offset: offset,
                    immediate: true,
                    force: true,
                    lock: true // Bloquea el scroll durante el frame (seguridad extra)
                });
            } else if (element) {
                // Fallback por si Lenis no está cargado (raro, pero posible)
                const shouldCenter = targetId === 'servicios' || targetId === 'porque-develop';
                element.scrollIntoView({
                    behavior: 'auto',
                    block: shouldCenter ? 'center' : 'start'
                });
            }

            // FASE 3: EL REVEAL (Limpieza)
            // Esperamos un poco más para que la animación de "salida" ocurra
            // mientras ya estamos en la nueva posición estática.
            setTimeout(() => {
                setIsAnimating(false);
                if (lenis) lenis.start(); // Reactivamos Lenis desde velocidad 0
                clearTimeout(safetyTimer);
            }, 600); // Ajusta este tiempo según la duración de tu animación de salida

        }, 500); // Tiempo que tarda tu animación en cubrir la pantalla
    };

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