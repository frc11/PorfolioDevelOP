'use client';
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useThemeSection } from '@/hooks/useThemeObserver'
import { Interactive3DNetwork } from '@/components/canvas/Interactive3DNetwork'

const QUALITIES = [
    {
        id: 1,
        label: "Tecnología actual",
        desc: "Las herramientas más modernas del mercado, aplicadas a tu negocio."
    },
    {
        id: 2,
        label: "Crece con vos",
        desc: "Tu sistema se adapta cuando tu negocio crece. Sin empezar de cero."
    },
    {
        id: 3,
        label: "Entrega rápida",
        desc: "Primeros resultados en 15 días. Sin esperar meses."
    },
    {
        id: 4,
        label: "Fácil de usar",
        desc: "Tus clientes y tu equipo lo usan sin capacitación."
    },
    {
        id: 5,
        label: "Siempre disponibles",
        desc: "Respondemos rápido. Tenés un equipo técnico en tu esquina."
    },
    { id: 6, label: "Tu info, protegida", desc: "Datos seguros, backups automáticos, sin preocupaciones." },
    { id: 7, label: "Funciona en cualquier lado", desc: "Desde el celular, la tablet o la computadora de tu negocio." },
    { id: 8, label: "Con IA incluida", desc: "Inteligencia artificial integrada desde el primer día." }
];

export function WhyDevelOP() {
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, {
        once: false,
        margin: '-20%'
    });

    const isCanvasInView = useInView(ref, {
        once: false,
        margin: '1500px 0px' // Pre-load way before user sees it
    });

    // Trigger dark mode
    useThemeSection(isInView, 'dark');

    // Ref specifically for the title position (center of screen)
    const titleRef = useRef(null);
    const isTitleInView = useInView(titleRef, { once: true, margin: "-45% 0px -45% 0px", amount: 1 }); // Strict trigger: center 10%

    return (
        // Pure Container - Height and Background only
        <section ref={ref} className="relative min-h-[150vh] w-full bg-[#030712] overflow-hidden flex flex-col items-center justify-center select-none pt-48 pb-32">

            {/* Top Blur Transition */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#030712] via-[#030712]/80 to-transparent backdrop-blur-xl z-20 pointer-events-none" />

            {/* Bottom Transition to Footer - Matches Footer bg color zinc-950 */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent backdrop-blur-sm z-20 pointer-events-none" />

            {/* 3D Interactive Network - Z-0 - Absolute Inset */}
            {/* Now contains the Title internally for correct stacking */}
            <div className="absolute inset-0 z-0 w-full h-full flex items-center justify-center pt-20" id='caracteristicas'>
                {/* Expanded to h-full to match the [150vh] parent and prevent clipping */}
                <div className="w-full md:w-[90vw] h-full">
                    <Interactive3DNetwork qualities={QUALITIES} titleVisible={isInView} renderCanvas={isCanvasInView} />
                </div>
            </div>

            {/* Hidden div to track title visibility at center */}
            <div ref={titleRef} className="absolute top-1/2 left-1/2 w-px h-px pointer-events-none opacity-0" />


            {/* Vignette Overlay - Z-20 - Subtle */}
            <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,#030712_100%)] opacity-80" />

        </section>
    )
}
