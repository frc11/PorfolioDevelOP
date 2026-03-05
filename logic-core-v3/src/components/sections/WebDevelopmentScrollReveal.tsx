"use client"
import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export const WebDevelopmentScrollReveal = () => {
    const containerRef = useRef<HTMLElement>(null)

    // Track scroll progress through this container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    })

    // Map scroll progress to opacities for the 3 phrases
    // Phrase 1 visible early, then fades
    const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.5], [0, 1, 1, 0])
    const y1 = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.5], [50, 0, 0, -50])

    // Phrase 2 visible mid, then fades
    const opacity2 = useTransform(scrollYProgress, [0.3, 0.5, 0.7, 0.8], [0, 1, 1, 0])
    const y2 = useTransform(scrollYProgress, [0.3, 0.5, 0.7, 0.8], [50, 0, 0, -50])

    // Phrase 3 visible late, stays
    const opacity3 = useTransform(scrollYProgress, [0.6, 0.8, 1], [0, 1, 1])
    const y3 = useTransform(scrollYProgress, [0.6, 0.8, 1], [50, 0, 0])

    return (
        <section
            ref={containerRef}
            // Height is 200vh to give enough scroll distance for the effect
            className="w-full relative z-10 h-[200vh] bg-void"
        >
            {/* Sticky container that stays fixed while scrolling through the section */}
            <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">

                {/* Background decorative glow that breathes slightly */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="w-[500px] h-[500px] bg-violet-600/30 rounded-full blur-[120px]" />
                </motion.div>

                {/* The 3 Phrases */}
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex flex-col items-center justify-center h-full">

                    {/* Phrase 1 */}
                    <motion.h2
                        className="absolute text-5xl md:text-7xl lg:text-8xl font-black text-white text-center tracking-tighter w-full"
                        style={{ opacity: opacity1, y: y1 }}
                    >
                        El diseño no es solo <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-500">
                            cómo se ve.
                        </span>
                    </motion.h2>

                    {/* Phrase 2 */}
                    <motion.h2
                        className="absolute text-5xl md:text-7xl lg:text-8xl font-black text-white text-center tracking-tighter w-full"
                        style={{ opacity: opacity2, y: y2 }}
                    >
                        Es cómo <span className="italic font-serif font-medium text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">funciona.</span>
                    </motion.h2>

                    {/* Phrase 3 */}
                    <motion.h2
                        className="absolute text-5xl md:text-7xl lg:text-8xl font-black text-white text-center tracking-tighter w-full"
                        style={{ opacity: opacity3, y: y3 }}
                    >
                        Y cómo <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500 drop-shadow-[0_0_30px_rgba(167,139,250,0.3)]">
                            convierte.
                        </span>
                    </motion.h2>

                </div>
            </div>
        </section>
    )
}
