"use client"

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Environment, ContactShadows } from '@react-three/drei'
import { EffectComposer, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import { HeroArtifact } from '@/components/3d/HeroArtifact'
import { DotMatrix } from '@/components/canvas/DotMatrix'

export function Hero() {
    return (
        <section className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative overflow-hidden bg-zinc-50" id="hero">

            {/* COLUMN LEFT: TEXT */}
            <div className="flex flex-col justify-center px-8 md:px-24 order-2 md:order-1 text-zinc-900 z-10 relative">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="space-y-8"
                >
                    <div className="flex items-center gap-2 text-cyan-600 font-mono text-[10px] tracking-[0.5em] uppercase">
                        <span className="w-1 h-1 bg-cyan-600 rounded-full shadow-[0_0_8px_#0891b2]" />
                        Exclusive_Digital_Partnership
                    </div>

                    <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter leading-[0.85] text-zinc-900">
                        devel
                        <span className="text-transparent bg-clip-text bg-gradient-to-r pr-2 from-zinc-600 to-zinc-900">
                            OP
                        </span>
                    </h1>

                    <p className="text-zinc-600 text-lg md:text-xl max-w-lg leading-relaxed font-light">
                        No solo desarrollamos soluciones a medida. Construimos la <strong className="text-zinc-900 font-bold">presencia digital</strong> de tu negocio con ingeniería de vanguardia y diseño de lujo.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <button className="bg-zinc-900 text-white px-10 py-5 text-xs font-bold uppercase tracking-widest hover:bg-cyan-600 transition-colors duration-500 cursor-pointer">
                            Empezar Proyecto
                        </button>
                        <button className="border border-zinc-300 px-10 py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors cursor-pointer text-zinc-600 hover:text-zinc-900 hover:border-zinc-400">
                            Nuestra Metodología
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* COLUMN RIGHT: 3D ARTIFACT */}
            <div
                className="relative h-[50vh] md:h-screen w-full order-1 md:order-2 overflow-hidden flex items-center justify-center bg-zinc-50"
            >
                <Canvas camera={{ position: [0, 0, 15], fov: 35 }} gl={{ alpha: true, powerPreference: "high-performance", antialias: false, stencil: false, depth: true }} dpr={[1, 1.5]}>
                    <Suspense fallback={null}>
                        {/* Background Dot Matrix */}
                        <DotMatrix />

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
