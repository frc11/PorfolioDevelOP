"use client"
import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export const WebDevelopmentScrollReveal = () => {
    const containerRef = useRef<HTMLElement>(null)

    // Track scroll progress through this container
    // We use ["start end", "end start"] to track the entire trajectory (element entering bottom -> element leaving top)
    // Cohesion: With a 300vh container, the "sticky phase" starts exactly at 0.25 (when top hits top) 
    // and ends at 0.75 (when bottom hits bottom).
    // offset: ["start start", "end end"] means scrollYProgress is 0 when top hits top (sticky start)
    // and 1 when bottom hits bottom (sticky end). 
    // This gives us a perfectly predictable 0-1 range for the sticky phase.
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    // Phrase 1: Reveal from 0.05 to 0.25
    const color1 = useTransform(scrollYProgress, [0.05, 0.15, 0.25, 0.35], ["rgb(39, 39, 42)", "rgb(255, 255, 255)", "rgb(255, 255, 255)", "rgb(39, 39, 42)"])
    const shadow1 = useTransform(scrollYProgress, [0.05, 0.15, 0.25, 0.35], ["drop-shadow(0 0 0px rgba(255,255,255,0))", "drop-shadow(0 0 30px rgba(255,255,255,0.6))", "drop-shadow(0 0 30px rgba(255,255,255,0.6))", "drop-shadow(0 0 0px rgba(255,255,255,0))"])
    const opacity1 = useTransform(scrollYProgress, [0.05, 0.15, 0.25, 0.35], [1, 1, 1, 0])

    // Phrase 2: Reveal from 0.35 to 0.55
    const color2 = useTransform(scrollYProgress, [0.35, 0.45, 0.55, 0.65], ["rgb(39, 39, 42)", "rgb(255, 255, 255)", "rgb(255, 255, 255)", "rgb(39, 39, 42)"])
    const shadow2 = useTransform(scrollYProgress, [0.35, 0.45, 0.55, 0.65], ["drop-shadow(0 0 0px rgba(255,255,255,0))", "drop-shadow(0 0 30px rgba(255,255,255,0.6))", "drop-shadow(0 0 30px rgba(255,255,255,0.6))", "drop-shadow(0 0 0px rgba(255,255,255,0))"])
    const opacity2 = useTransform(scrollYProgress, [0.35, 0.45, 0.55, 0.65], [1, 1, 1, 0])

    // Phrase 3: Reveal from 0.65 to 0.90
    const color3Base = useTransform(scrollYProgress, [0.65, 0.75, 1], ["rgb(39, 39, 42)", "rgb(255, 255, 255)", "rgb(255, 255, 255)"])
    const color3Special = useTransform(scrollYProgress, [0.70, 0.85, 1], ["rgb(39, 39, 42)", "rgb(34, 211, 238)", "rgb(34, 211, 238)"])
    const shadow3Special = useTransform(scrollYProgress, [0.70, 0.85, 1], ["drop-shadow(0 0 0px rgba(34,211,238,0))", "drop-shadow(0 0 40px rgba(34,211,238,0.8))", "drop-shadow(0 0 40px rgba(34,211,238,0.8))"])
    const opacity3 = useTransform(scrollYProgress, [0.65, 0.75, 1], [1, 1, 1])

    return (
        <section
            ref={containerRef}
            className="w-full relative z-10 h-[300vh] bg-black"
        >
            <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center h-full">

                    {/* Phrase 1 */}
                    <motion.h2
                        className="absolute text-5xl md:text-[8rem] font-black text-center tracking-tighter w-full leading-none px-4"
                        style={{ opacity: opacity1, color: color1, filter: shadow1 }}
                    >
                        El diseño no es <br className="md:hidden" />cómo se ve.
                    </motion.h2>

                    {/* Phrase 2 */}
                    <motion.h2
                        className="absolute text-5xl md:text-[8rem] font-black text-center tracking-tighter w-full leading-none px-4"
                        style={{ opacity: opacity2, color: color2, filter: shadow2 }}
                    >
                        Es cómo funciona.
                    </motion.h2>

                    {/* Phrase 3 */}
                    <motion.h2
                        className="absolute text-5xl md:text-[8rem] font-black text-center tracking-tighter w-full leading-none px-4"
                        style={{ opacity: opacity3 }}
                    >
                        <motion.span style={{ color: color3Base }}>Y cómo </motion.span>
                        <motion.span style={{ color: color3Special, filter: shadow3Special }}>convierte.</motion.span>
                    </motion.h2>

                </div>
            </div>
        </section>
    )
}
