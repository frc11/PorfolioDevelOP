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
        <section className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative overflow-hidden bg-zinc-50 pb-32 md:pb-0" id="inicio">

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

                    {/* H1 with Typewriter */}
                    <h1 className="text-5xl md:text-[3.5rem] lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-zinc-900">
                        <span className="block">Transformamos tu empresa</span>
                        <span className="block">
                            con{' '}
                            <TypewriterText
                                words={HERO_KEYWORDS}
                                typingSpeed={70}
                                deletingSpeed={40}
                                pauseDuration={2000}
                                className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600"
                            />
                        </span>
                    </h1>

                    {/* Impact Paragraph */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-zinc-600 text-lg md:text-xl max-w-lg leading-relaxed font-light"
                    >
                        Desarrollamos <strong className="text-zinc-900 font-semibold">ecosistemas digitales de alto rendimiento</strong>.
                        Desde plataformas web hasta agentes de IA y automatización de flujos de trabajo.
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
