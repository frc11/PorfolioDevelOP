'use client';
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useThemeSection } from '@/hooks/useThemeObserver'
import { Interactive3DNetwork } from '@/components/canvas/Interactive3DNetwork'

const QUALITIES = [
    {
        id: 1,
        label: "Modernidad",
        desc: "Arquitectura Next.js 15 que supera los estándares actuales."
    },
    {
        id: 2,
        label: "Escalabilidad",
        desc: "Sistemas diseñados para crecer sin deuda técnica."
    },
    {
        id: 3,
        label: "Velocidad",
        desc: "Optimización continua y tiempos de carga instantáneos."
    },
    {
        id: 4,
        label: "UI/UX Inmersiva",
        desc: "Experiencias visuales que retienen y convierten."
    },
    {
        id: 5,
        label: "Soporte 24/7",
        desc: "Infraestructura monitoreada constantemente."
    },
    { id: 6, label: "Seguridad", desc: "Protocolos de encriptación de grado militar." },
    { id: 7, label: "Cloud Native", desc: "Despliegue serverless optimizado." },
    { id: 8, label: "AI Core", desc: "Integración de modelos neuronales predictivos." }
];

export function WhyDevelOP() {
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, {
        once: false,
        margin: '-20%'
    });

    // Trigger dark mode
    useThemeSection(isInView, 'dark');

    return (
        // Pure Container - Height and Background only
        <section ref={ref} className="relative min-h-[150vh] w-full bg-[#030712] overflow-hidden flex flex-col items-center justify-center select-none">

            {/* 3D Interactive Network - Z-0 - Absolute Inset */}
            {/* Now contains the Title internally for correct stacking */}
            <div className="absolute inset-0 z-0 w-full h-full flex items-center justify-center">
                {/* Expanded to h-full to match the [150vh] parent and prevent clipping */}
                <div className="w-full md:w-[90vw] h-full">
                    <Interactive3DNetwork qualities={QUALITIES} />
                </div>
            </div>

            {/* Vignette Overlay - Z-20 - Subtle */}
            <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,#030712_100%)] opacity-80" />

        </section>
    )
}
