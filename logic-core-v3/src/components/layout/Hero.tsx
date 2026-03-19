"use client"

import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Environment, ContactShadows } from '@react-three/drei'
import { EffectComposer, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import { HeroArtifact } from '@/components/3d/HeroArtifact'
import { DotMatrixMesh } from '@/components/canvas/DotMatrix'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'

const HERO_KEYWORDS = [
    "Software a Medida",
    "Inteligencia Artificial",
    "Automatizaciones n8n",
    "Sistemas Escalables",
]

/**
 * MobileTouchHandler
 * Maps 'touchmove' events to the R3F state pointer, enabling
 * the 3D rotation logic in children components (HeroArtifact) to work on touch.
 */
function MobileTouchHandler() {
    const { pointer } = useThree()

    useEffect(() => {
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0]
                pointer.x = (touch.clientX / window.innerWidth) * 2 - 1
                pointer.y = -(touch.clientY / window.innerHeight) * 2 + 1
            }
        }

        window.addEventListener('touchmove', handleTouchMove, { passive: true })

        return () => {
            window.removeEventListener('touchmove', handleTouchMove)
        }
    }, [pointer])

    return null
}

export function Hero() {
    return (
        <section className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative overflow-hidden bg-[radial-gradient(circle_at_50%_0%,#ffffff_0%,#f4f4f5_100%)] pb-32 md:pb-0" id="inicio">
            {/* Task 1: Film Grain Layer */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
                 style={{ 
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                 }} 
            />

            {/* Task 2: Technical Grid with Animation (Visibility Improved) */}
            <motion.div 
                animate={{ translateY: [0, 64] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-[linear-gradient(to_right,#0000000c_1px,transparent_1px),linear-gradient(to_bottom,#0000000c_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" 
            />

            {/* COLUMN LEFT: TEXT */}
            <div className="flex flex-col justify-center px-8 md:px-24 order-2 md:order-1 text-zinc-900 z-10 relative">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="space-y-8"
                >
                    {/* Badge */}
                    <div className="flex items-center gap-2 text-cyan-600 font-mono text-[10px] tracking-[0.5em] uppercase">
                        <span className="w-1 h-1 bg-cyan-600 rounded-full shadow-[0_0_8px_#0891b2]" />
                        Exclusive_Digital_Partnership
                    </div>

                    {/* H1 Metallic Upgrade with Reveal Animation */}
                    <h1 className="text-5xl md:text-[4rem] lg:text-[4.5rem] font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-zinc-400 via-zinc-600 to-zinc-900 drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)] py-2">
                        <div className="overflow-hidden">
                            <motion.span
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                                className="block"
                            >
                                Transformamos tu empresa
                            </motion.span>
                        </div>
                        <div className="overflow-hidden">
                            <motion.span
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                                className="block h-[1.1em] md:h-[1em]"
                            >
                                con{' '}
                                <TypewriterText
                                    words={HERO_KEYWORDS}
                                    typingSpeed={70}
                                    deletingSpeed={40}
                                    pauseDuration={2000}
                                    className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-cyan-700"
                                />
                            </motion.span>
                        </div>
                    </h1>

                    {/* Elite Consultative Subtitle with Keyword Glow */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="text-zinc-500 font-light text-lg md:text-xl max-w-2xl mt-6 tracking-wide leading-relaxed"
                    >
                        Diseñamos <strong className="text-zinc-900 font-semibold">ecosistemas digitales de alto impacto</strong>. 
                        Desde arquitectura de <span className="text-cyan-600/90 font-medium drop-shadow-[0_0_10px_rgba(8,145,178,0.3)]">Software</span>{' '}
                        hasta agentes de <span className="text-cyan-600/90 font-medium drop-shadow-[0_0_10px_rgba(8,145,178,0.3)]">IA Generativa</span> y automatización estratégica.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                        className="flex flex-col w-full md:flex-row md:w-auto gap-4 pt-4"
                    >
                        <MagneticCta>
                            Iniciar Proyecto
                        </MagneticCta>
                        <MagneticCta>
                            Explorar Servicios
                        </MagneticCta>
                    </motion.div>

                    {/* Micro-copy */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.3 }}
                        className="text-zinc-500 text-xs tracking-wide"
                    >
                        ✦ Auditoría de viabilidad gratuita
                    </motion.p>
                </motion.div>
            </div>

            {/* COLUMN RIGHT: 3D ARTIFACT */}
            <div
                className="relative h-[50vh] md:h-screen w-full order-1 md:order-2 overflow-hidden flex items-center justify-center bg-zinc-50"
            >
                <Canvas camera={{ position: [0, 0, 15], fov: 35 }} gl={{ alpha: true, powerPreference: "high-performance", antialias: false, stencil: false, depth: true }} dpr={[1, 1.5]}>
                    <MobileTouchHandler />
                    <Suspense fallback={null}>
                        {/* Background Dot Matrix */}
                        <DotMatrixMesh />

                        {/* Lighting Setup */}
                        <ambientLight intensity={1.5} />
                        <Environment preset="studio" />

                        {/* 3D Logo (Front) */}
                        <HeroArtifact />

                        {/* Contact Shadows for depth */}
                        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={15} blur={2} far={4} color="#000000" />

                        {/* Post-Processing Effects */}
                        <EffectComposer enableNormalPass={false}>
                            <ChromaticAberration offset={[0.0015, 0.0015]} />
                            <Noise opacity={0.05} premultiply />
                            <Vignette eskil={false} offset={0.1} darkness={0.5} />
                        </EffectComposer>
                    </Suspense>
                </Canvas>
            </div>

            {/* Bottom Fade (Integration with Dark Section) */}
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-zinc-950 to-transparent z-20 pointer-events-none" />
        </section>
    )
}
