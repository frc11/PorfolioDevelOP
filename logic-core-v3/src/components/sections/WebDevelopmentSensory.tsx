"use client"
import React from 'react'
import { motion } from 'framer-motion'

export const WebDevelopmentSensory = () => {
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
                            Diseño que <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">Cautiva.</span>
                        </h2>

                        <div className="h-1 w-20 bg-cyan-500 mb-8 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

                        <p className="text-lg md:text-xl text-zinc-300/90 leading-relaxed drop-shadow-md">
                            No solo construimos sitios, creamos experiencias que atrapan. Optimizamos cada milisegundo y cada píxel para que tus usuarios no quieran irse.
                        </p>

                        <div className="mt-10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center animate-pulse">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-cyan-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest font-mono">
                                Retención Sensorial 98%
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
                        {/* Glow Ambiental de Fondo */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-cyan-500/20 rounded-full blur-[100px] z-0 pointer-events-none" />

                        {/* Contenedor de Cristal */}
                        <div className="relative z-10 w-full bg-white/[0.05] backdrop-blur-xl border border-white/10 p-4 rounded-[2.5rem] shadow-2xl shadow-cyan-500/10">
                            {/* Reflexión superior del cristal */}
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent z-20" />

                            <div className="w-full relative rounded-[2rem] overflow-hidden bg-black shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-auto object-cover opacity-90 transition-opacity duration-1000 scale-[1.02]"
                                    src="/Woman_engrossed_in_screen_delpmaspu_.mp4"
                                />

                                {/* Filtro Cyan muy sutil sobre el video para igualar estética */}
                                <div className="absolute inset-0 bg-cyan-900/10 mix-blend-color pointer-events-none" />
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
