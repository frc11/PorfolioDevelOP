"use client"
import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export const WebDevelopmentScrollReveal = () => {
    const containerRef = useRef<HTMLElement>(null)

    // Track scroll progress through this container
    // We use ["start end", "end start"] to track the entire trajectory (element entering bottom -> element leaving top)
    // Cohesion: With a 300vh container, the "sticky phase" starts exactly at 0.25 (when top hits top) 
    // and ends at 0.75 (when bottom hits bottom).
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    // Phrase 1 (0.25 to 0.38) - Shows right when it begins sticking, fades out by 0.40
    const opacity1 = useTransform(scrollYProgress, [0.25, 0.35, 0.40], [1, 1, 0])
    const y1 = useTransform(scrollYProgress, [0.25, 0.35, 0.40], [0, 0, -50])

    // Phrase 2 (0.40 to 0.58) - Fades in at 0.40, stays until 0.55, fades out by 0.60
    const opacity2 = useTransform(scrollYProgress, [0.38, 0.43, 0.55, 0.60], [0, 1, 1, 0])
    const y2 = useTransform(scrollYProgress, [0.38, 0.43, 0.55, 0.60], [50, 0, 0, -50])

    // Phrase 3 (0.60 to 0.75) - Fades in at 0.60, stays until 0.75 (the end of the sticky phase)
    const opacity3 = useTransform(scrollYProgress, [0.58, 0.63, 0.75], [0, 1, 1])
    const y3 = useTransform(scrollYProgress, [0.58, 0.63, 0.75], [50, 0, 0])
    const scale3 = useTransform(scrollYProgress, [0.58, 0.63, 0.75], [0.90, 1, 1])

    return (
        <section
            ref={containerRef}
            // Ampliamos la altura a 300vh para que el efecto tenga tiempo de leerse cómodamente
            className="w-full relative z-10 h-[300vh] bg-transparent"
        >
            {/* Sticky container that stays fixed while scrolling through the section */}
            <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">

                {/* Subtle radial dark glow behind the text to guarantee contrast against bright backgrounds without hard edges */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] md:w-[80vw] h-[150vw] md:h-[80vw] bg-[radial-gradient(circle_at_center,rgba(3,0,20,0.8)_0%,transparent_70%)] pointer-events-none" />

                {/* Background decorative glow that breathes slightly */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="w-[500px] h-[500px] bg-cyan-600/30 rounded-full blur-[120px]" />
                </motion.div>

                {/* The 3 Phrases */}
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex flex-col items-center justify-center h-full">

                    {/* Phrase 1 */}
                    <motion.h2
                        className="absolute text-5xl md:text-7xl lg:text-8xl font-black text-center tracking-tighter w-full text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] px-4 leading-tight"
                        style={{ opacity: opacity1, y: y1 }}
                    >
                        El diseño no es <br className="md:hidden" />cómo se ve.
                    </motion.h2>

                    {/* Phrase 2 */}
                    <motion.h2
                        className="absolute text-5xl md:text-7xl lg:text-8xl font-black text-center tracking-tighter w-full text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] px-4 leading-tight"
                        style={{ opacity: opacity2, y: y2 }}
                    >
                        Es cómo funciona.
                    </motion.h2>

                    {/* Phrase 3 */}
                    <motion.h2
                        className="absolute text-5xl md:text-7xl lg:text-8xl font-black text-center tracking-tighter w-full text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white drop-shadow-[0_10px_30px_rgba(34,211,238,0.5)] px-4 leading-tight"
                        style={{ opacity: opacity3, y: y3, scale: scale3 }}
                    >
                        Y cómo convierte.
                    </motion.h2>

                </div>
            </div>
        </section>
    )
}
