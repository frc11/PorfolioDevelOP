"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export const WebDevelopmentSensory = () => {
    const [isHoveringVideo, setIsHoveringVideo] = useState(false)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        })
    }

    return (
        <section className="py-24 relative z-10 w-full bg-transparent overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Columna Izquierda: Texto Persuasivo */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col justify-center max-w-xl mx-auto lg:mx-0"
                    >
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6 leading-tight">
                            Como te ven, <span className="text-cyan-500">te compran.</span>
                        </h2>

                        <div className="h-1 w-20 bg-cyan-500 mb-8 rounded-full" />

                        <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed">
                            En el mercado digital, el diseño de tu web es tu local comercial. Si tu página es genérica o lenta, el cliente asume que tu servicio también lo es. Diseñamos experiencias visuales de lujo que elevan el estatus de tu marca y generan confianza instantánea.
                        </p>

                        <div className="mt-10 flex items-center gap-4">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">
                                [ RETENCIÓN VISUAL & UI PREMIUM ]
                            </span>
                        </div>
                    </motion.div>

                    {/* Columna Derecha: Contenedor Glassmorphism con Video */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="relative w-full max-w-2xl mx-auto lg:mx-0 flex justify-center lg:justify-end"
                    >
                        {/* Contenedor de Cristal Limpio (Smoked Glass Premium) */}
                        <div
                            className={`relative w-full bg-[#0A0A0A]/80 border border-white/[0.05] backdrop-blur-2xl p-2 md:p-3 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-all duration-300 ${isHoveringVideo ? 'cursor-none' : ''}`}
                            onMouseEnter={() => setIsHoveringVideo(true)}
                            onMouseLeave={() => setIsHoveringVideo(false)}
                            onMouseMove={handleMouseMove}
                        >
                            {/* Default Cursor Override (Custom Crystal Circle) */}
                            <AnimatePresence>
                                {isHoveringVideo && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        transition={{ duration: 0.15 }}
                                        className="pointer-events-none absolute z-50 w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xs uppercase flex items-center justify-center shadow-lg"
                                        style={{
                                            left: mousePosition.x,
                                            top: mousePosition.y,
                                            x: "-50%",
                                            y: "-50%"
                                        }}
                                    >
                                        PLAY
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="w-full relative rounded-[1.5rem] overflow-hidden bg-[#0A0A0A] pointer-events-none">
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-auto object-cover opacity-90 transition-opacity duration-1000 scale-[1.02] mix-blend-luminosity"
                                    src="/video/Woman_engrossed_in_screen_delpmaspu_.mp4"
                                />
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
