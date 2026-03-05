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

    // Phrase 1 (0% to 33%)
    const opacity1 = useTransform(scrollYProgress, [0, 0.3, 0.35], [1, 1, 0])
    const y1 = useTransform(scrollYProgress, [0, 0.3, 0.35], [0, 0, -50])

    // Phrase 2 (33% to 66%)
    const opacity2 = useTransform(scrollYProgress, [0.3, 0.35, 0.6, 0.65], [0, 1, 1, 0])
    const y2 = useTransform(scrollYProgress, [0.3, 0.35, 0.6, 0.65], [50, 0, 0, -50])

    // Phrase 3 (66% to 100%)
    const opacity3 = useTransform(scrollYProgress, [0.6, 0.65, 0.8], [0, 1, 1])
    const y3 = useTransform(scrollYProgress, [0.6, 0.65, 0.8], [50, 0, 0])

    return (
        <section
            ref={containerRef}
            // Height is 150vh to give enough scroll distance for the effect
            className="w-full relative z-10 h-[150vh] bg-void"
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
                        className="absolute text-5xl md:text-7xl lg:text-8xl font-black text-center tracking-tighter w-full text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-300 px-4"
                        style={{ opacity: opacity1, y: y1 }}
                    >
                        El diseño no es solo <br className="hidden md:block" /> cómo se ve.
                    </motion.h2>

                    {/* Phrase 2 */}
                    <motion.h2
                        className="absolute text-5xl md:text-7xl lg:text-8xl font-black text-center tracking-tighter w-full text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-300 px-4"
                        style={{ opacity: opacity2, y: y2 }}
                    >
                        Es cómo funciona.
                    </motion.h2>

                    {/* Phrase 3 */}
                    <motion.h2
                        className="absolute text-5xl md:text-7xl lg:text-8xl font-black text-center tracking-tighter w-full text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200 drop-shadow-[0_0_30px_rgba(34,211,238,0.8)] px-4"
                        style={{ opacity: opacity3, y: y3 }}
                    >
                        Y cómo convierte.
                    </motion.h2>

                </div>
            </div>
        </section>
    )
}
