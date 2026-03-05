"use client"
import React, { useState } from 'react'
import { motion } from 'framer-motion'
// Import added just in case we need it later, keeping consistency
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'

export const ROICalculator = () => {
    // Local State for interactive controls
    const [teamSize, setTeamSize] = useState(5)
    const [manualHours, setManualHours] = useState(15)
    const [hourlyRate, setHourlyRate] = useState(20)
    const [isOptimized, setIsOptimized] = useState(false)

    // Derived properties for slider visual progress
    const teamSizeProgress = ((teamSize - 1) / 99) * 100
    const manualHoursProgress = ((manualHours - 1) / 39) * 100
    const hourlyRateProgress = ((hourlyRate - 5) / 145) * 100

    return (
        <section className="py-32 max-w-7xl mx-auto px-4 relative z-10 w-full">

            {/* Header */}
            <div className="mb-14 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4"
                >
                    Auditoría de Ineficiencia <br className="md:hidden" />
                    <span className="text-cyan-400 opacity-90 animate-pulse ml-2">
                        (En Vivo)
                    </span>
                </motion.h2>
                <p className="text-zinc-400 mt-4 text-base md:text-lg max-w-2xl mx-auto">
                    Ajuste los parámetros de su equipo y vea el impacto financiero exacto antes y después de una automatización de grado empresarial.
                </p>
            </div>

            {/* Quantum Dashboard Main Layout */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 lg:p-12 shadow-[0_0_50px_rgba(6,182,212,0.1)] relative overflow-hidden"
            >
                {/* Subtle backglows inside the glass layout */}
                <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-900/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none" />

                {/* --- Columna Izquierda: Los Controles de la Empresa --- */}
                <div className="flex flex-col space-y-12 relative z-10">

                    {/* Control 1: Empleados Implicados */}
                    <div className="flex flex-col gap-5">
                        <div className="flex justify-between items-end">
                            <label className="text-sm font-semibold text-zinc-300">
                                Tamaño del equipo
                            </label>
                            <span className="font-mono text-cyan-400 text-xs md:text-sm tracking-widest bg-cyan-900/30 px-3 py-1.5 rounded-lg border border-cyan-800/50 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                                [ {teamSize} PERSONAS ]
                            </span>
                        </div>
                        <div className="relative h-2.5 w-full bg-black rounded-full border border-white/5">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                                style={{ width: `${teamSizeProgress}%` }}
                            />
                            <input
                                type="range" min="1" max="100" value={teamSize}
                                onChange={(e) => setTeamSize(Number(e.target.value))}
                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div
                                className="absolute top-1/2 -mt-3 w-6 h-6 bg-white rounded-full shadow-[0_0_15px_rgba(34,211,238,0.6)] pointer-events-none transition-all duration-75 flex items-center justify-center border-2 border-cyan-400"
                                style={{ left: `calc(${teamSizeProgress}% - 12px)` }}
                            >
                                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Control 2: Horas manuales */}
                    <div className="flex flex-col gap-5">
                        <div className="flex justify-between items-end">
                            <label className="text-sm font-semibold text-zinc-300">
                                Horas manuales por semana
                            </label>
                            <span className="font-mono text-emerald-400 text-xs md:text-sm tracking-widest bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-800/50 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                                [ {manualHours} HORAS/SEM ]
                            </span>
                        </div>
                        <div className="relative h-2.5 w-full bg-black rounded-full border border-white/5">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                                style={{ width: `${manualHoursProgress}%` }}
                            />
                            <input
                                type="range" min="1" max="40" value={manualHours}
                                onChange={(e) => setManualHours(Number(e.target.value))}
                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div
                                className="absolute top-1/2 -mt-3 w-6 h-6 bg-white rounded-full shadow-[0_0_15px_rgba(52,211,153,0.6)] pointer-events-none transition-all duration-75 flex items-center justify-center border-2 border-emerald-400"
                                style={{ left: `calc(${manualHoursProgress}% - 12px)` }}
                            >
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Control 3: Costo Promedio por hora */}
                    <div className="flex flex-col gap-5">
                        <div className="flex justify-between items-end">
                            <label className="text-sm font-semibold text-zinc-300">
                                Costo promedio / hora
                            </label>
                            <span className="font-mono text-indigo-400 text-xs md:text-sm tracking-widest bg-indigo-900/30 px-3 py-1.5 rounded-lg border border-indigo-800/50 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                                [ ${hourlyRate} USD/H ]
                            </span>
                        </div>
                        <div className="relative h-2.5 w-full bg-black rounded-full border border-white/5">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                                style={{ width: `${hourlyRateProgress}%` }}
                            />
                            <input
                                type="range" min="5" max="150" value={hourlyRate}
                                onChange={(e) => setHourlyRate(Number(e.target.value))}
                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div
                                className="absolute top-1/2 -mt-3 w-6 h-6 bg-white rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)] pointer-events-none transition-all duration-75 flex items-center justify-center border-2 border-indigo-400"
                                style={{ left: `calc(${hourlyRateProgress}% - 12px)` }}
                            >
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Cyberpunk Optimization Toggle */}
                    <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                        <div>
                            <h4 className="text-white font-bold md:text-lg mb-1 drop-shadow-md">
                                Simular Integración DevelOP
                            </h4>
                            <p className="text-zinc-500 text-xs md:text-sm">
                                Aplica agentes IA y automatizaciones Serverless
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOptimized(!isOptimized)}
                            className={`relative w-16 h-8 md:w-20 md:h-10 rounded-full transition-all duration-500 flex items-center px-1 border-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${isOptimized
                                    ? 'bg-cyan-900/40 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                                    : 'bg-black/50 border-white/10'
                                }`}
                        >
                            <motion.div
                                className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-white shadow-lg flex items-center justify-center ${isOptimized ? 'shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'opacity-80'
                                    }`}
                                animate={{ x: isOptimized ? (typeof window !== 'undefined' && window.innerWidth >= 768 ? 36 : 28) : 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                {isOptimized && (
                                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                )}
                            </motion.div>
                        </button>
                    </div>

                </div>

                {/* --- Columna Derecha: Salida de Datos (A Desarrollar) --- */}
                <div className="relative z-10 hidden lg:flex flex-col justify-center items-center bg-black/40 rounded-3xl border border-white/5 p-8 h-full shadow-inner overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="text-zinc-500 font-mono text-sm tracking-[0.2em] flex flex-col items-center gap-4"
                    >
                        <svg className="w-8 h-8 animate-spin-slow text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        [ ESPERANDO MÓDULO DE PROYECCIÓN ]
                    </motion.div>
                </div>

            </motion.div>
        </section>
    )
}
