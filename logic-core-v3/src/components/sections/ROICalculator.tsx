"use client"
import React, { useState, useEffect } from 'react'
import { motion, useMotionValue, animate, AnimatePresence } from 'framer-motion'
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

    // Financial calculations
    const monthlyLoss = teamSize * manualHours * hourlyRate * 4
    // Scenario with DevelOP: we assume 85% of these hours are automated. Only 15% remains as loss.
    const optimizedLoss = monthlyLoss * 0.15
    const moneySaved = monthlyLoss - optimizedLoss

    // Number animation state
    const animatedLoss = useMotionValue(monthlyLoss)
    const [displayedValue, setDisplayedValue] = useState(monthlyLoss)

    useEffect(() => {
        // Decide target number based on the toggle
        const targetValue = isOptimized ? moneySaved : monthlyLoss

        const controls = animate(animatedLoss, targetValue, {
            duration: 0.8,
            ease: "easeOut",
            onUpdate: (latest) => {
                setDisplayedValue(Math.round(latest))
            }
        })

        return controls.stop
    }, [isOptimized, monthlyLoss, moneySaved, animatedLoss])

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(value)
    }

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

                {/* --- Columna Derecha: Salida de Datos (El Monitor Principal) --- */}
                <div
                    className={`relative z-10 hidden lg:flex flex-col justify-center items-center rounded-3xl border p-8 h-full shadow-inner overflow-hidden transition-all duration-700 ${isOptimized
                        ? 'bg-emerald-950/20 shadow-emerald-500/10 border-emerald-500/20'
                        : 'bg-red-950/20 shadow-red-500/10 border-red-500/20'
                        }`}
                >
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />

                    {/* Background interactive particles/warning glow */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                        {isOptimized ? (
                            // Ascending particles for recovery
                            <div className="absolute -bottom-20 w-full h-full flex justify-between px-10 opacity-30">
                                {[...Array(5)].map((_, i) => (
                                    <motion.div
                                        key={`particle-${i}`}
                                        className="w-1 h-12 bg-gradient-to-t from-transparent to-emerald-400 rounded-full blur-[2px]"
                                        animate={{ y: [-100, -600], opacity: [0, 1, 0] }}
                                        transition={{
                                            duration: 3 + Math.random() * 2,
                                            repeat: Infinity,
                                            delay: Math.random() * 2,
                                            ease: "linear"
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            // Warning glow pulse
                            <motion.div
                                className="w-96 h-96 bg-red-600/10 rounded-full blur-[100px]"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />
                        )}
                    </div>

                    <div className="relative z-10 flex flex-col items-center w-full">

                        {/* Dynamic Title */}
                        <div className="flex items-center gap-3 mb-6">
                            {!isOptimized ? (
                                <motion.div
                                    className="w-3 h-3 rounded-full bg-red-500"
                                    animate={{ opacity: [1, 0.3, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            ) : (
                                <motion.div
                                    className="w-3 h-3 rounded-full bg-emerald-400"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            )}
                            <h3 className={`text-sm md:text-base font-mono uppercase tracking-widest ${isOptimized ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isOptimized ? 'Capital Recuperado con DevelOP' : 'Fuga de Capital Mensual'}
                            </h3>
                        </div>

                        {/* The Giant Number */}
                        <motion.div
                            className={`text-6xl md:text-7xl lg:text-8xl font-black font-mono tracking-tighter tabular-nums drop-shadow-2xl transition-colors duration-700 ${isOptimized ? 'text-white' : 'text-white'
                                }`}
                            key={`displayedValue-${isOptimized}`} // Force a slight pop effect when context switches
                            initial={{ scale: 0.95, opacity: 0.8 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            {/* Adding a specific color glow behind the text depending on state for more depth */}
                            <span className={`absolute inset-0 blur-xl pointer-events-none opacity-40 transition-colors duration-700 ${isOptimized ? 'text-emerald-500' : 'text-red-600'}`}>
                                {formatCurrency(displayedValue)}
                            </span>
                            <span className="relative z-10">
                                {formatCurrency(displayedValue)}
                            </span>
                        </motion.div>

                        <div className="mt-8 flex gap-4 text-xs font-mono text-zinc-500 bg-black/40 px-4 py-2 rounded-lg border border-white/5 whitespace-nowrap">
                            <span>Basado en {(isOptimized ? '85' : '100')}% de las horas indicadas</span>
                        </div>

                        {/* Technical Breakdown Cards */}
                        <AnimatePresence>
                            {isOptimized && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="w-full flex-col md:flex-row flex justify-center gap-3 overflow-hidden origin-top"
                                >
                                    <div className="flex-1 bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center text-center gap-3">
                                        <svg className="w-8 h-8 text-emerald-400 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        <span className="text-[10px] md:text-[11px] text-emerald-100/90 font-medium leading-relaxed uppercase tracking-wider">
                                            Agentes de IA: <br />Asumen el 40% del análisis.
                                        </span>
                                    </div>
                                    <div className="flex-1 bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center text-center gap-3">
                                        <svg className="w-8 h-8 text-emerald-400 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        <span className="text-[10px] md:text-[11px] text-emerald-100/90 font-medium leading-relaxed uppercase tracking-wider">
                                            n8n Automation: <br />Elimina 100% de data-entry.
                                        </span>
                                    </div>
                                    <div className="flex-1 bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center text-center gap-3">
                                        <svg className="w-8 h-8 text-emerald-400 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                        <span className="text-[10px] md:text-[11px] text-emerald-100/90 font-medium leading-relaxed uppercase tracking-wider">
                                            Software Custom: <br />Reduce 35% de fricción.
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Dynamic CTA */}
                        <div className="mt-auto pt-8 w-full flex flex-col items-center">
                            <button
                                className={`group w-full max-w-md py-4 rounded-full font-bold uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-3 ${isOptimized
                                        ? 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-50 hover:text-black hover:shadow-[0_0_40px_rgba(52,211,153,0.5)] border border-emerald-400'
                                        : 'bg-zinc-900 border border-zinc-800 hover:border-red-500 text-zinc-400 hover:text-red-400 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                                    }`}
                            >
                                {isOptimized ? 'Agendar Auditoría Gratuita' : 'Detener la Fuga de Dinero'}

                                <svg className={`w-5 h-5 transform transition-transform ${isOptimized ? 'group-hover:translate-x-1' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </button>
                            <p className="text-zinc-500 text-[11px] md:text-xs mt-4 font-mono">
                                DEMOSTRACIÓN EN VIVO EN MENOS DE 48 HS. SIN COMPROMISO.
                            </p>
                        </div>

                    </div>
                </div>

            </motion.div>
        </section>
    )
}
