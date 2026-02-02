import { useRef, Suspense } from 'react'
import { motion, useInView } from 'framer-motion'
import { useThemeSection } from '@/hooks/useThemeObserver'
import { Canvas } from '@react-three/fiber'
import { NeuralNetwork } from '@/components/canvas/NeuralNetwork'
import { Environment } from '@react-three/drei'
import { HyperText } from '@/components/ui/HyperText'

export function SoftwareEcosystem() {
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, {
        once: false,
        margin: '-20%'
    });

    // Trigger dark mode
    useThemeSection(isInView, 'dark');

    return (
        <section ref={ref} className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col items-center justify-center">

            {/* 3D Background - Absolute */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                    <Suspense fallback={null}>
                        <NeuralNetwork />
                        <ambientLight intensity={0.5} />
                        <Environment preset="city" />
                    </Suspense>
                </Canvas>
                {/* Gradient vignette for aesthetic interaction with dark mode */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black pointer-events-none" />
            </div>

            {/* Content Overlay - Z-10 */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-24 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="flex flex-col gap-12"
                >
                    {/* Floating Terminal Text 1 */}
                    <div className="self-start">
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-4 rounded-sm inline-block"
                        >
                            <p className="text-xs text-zinc-500 font-mono mb-1">// ARCHITECTURE</p>
                            <h3 className="text-2xl md:text-4xl font-mono text-white tracking-tighter">
                                <HyperText text="SCALABLE SYSTEMS" delay={500} />
                            </h3>
                        </motion.div>
                    </div>

                    {/* Center Title */}
                    <div className="self-center text-center my-12 mix-blend-difference">
                        <h2 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 tracking-tighter uppercase opacity-90">
                            <HyperText text="NEURAL ARCHITECTURE" className="text-white" delay={200} duration={1500} />
                        </h2>
                    </div>

                    {/* Floating Terminal Text 2 */}
                    <div className="self-end text-right">
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-4 rounded-sm inline-block"
                        >
                            <p className="text-xs text-zinc-500 font-mono mb-1">// INTELLIGENCE</p>
                            <h3 className="text-2xl md:text-4xl font-mono text-white tracking-tighter">
                                <HyperText text="AI INTEGRATION" delay={800} />
                            </h3>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
