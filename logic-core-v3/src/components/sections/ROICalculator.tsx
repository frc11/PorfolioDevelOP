"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { animate, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

function SliderField({
    label,
    value,
    min,
    max,
    suffix = '',
    prefix = '',
    onChange,
}: {
    label: string
    value: number
    min: number
    max: number
    suffix?: string
    prefix?: string
    onChange: (value: number) => void
}) {
    const progress = ((value - min) / (max - min)) * 100

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
                <label className="max-w-[24rem] text-sm font-semibold leading-relaxed text-zinc-300">
                    {label}
                </label>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 font-mono text-xs tracking-[0.2em] text-cyan-300">
                    {prefix}{value}{suffix}
                </span>
            </div>

            <div className="relative">
                <div className="h-3 rounded-full border border-white/5 bg-black/50">
                    <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,rgba(8,145,178,0.8),rgba(34,211,238,1))] shadow-[0_0_18px_rgba(34,211,238,0.45)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div
                    className="pointer-events-none absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-cyan-300 bg-white shadow-[0_0_18px_rgba(34,211,238,0.7)]"
                    style={{ left: `calc(${progress}% - 12px)` }}
                >
                    <div className="absolute inset-[6px] rounded-full bg-cyan-400" />
                </div>

                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(event) => onChange(Number(event.target.value))}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
            </div>

            <div className="flex justify-between text-[10px] uppercase tracking-[0.18em] text-white/22">
                <span>{prefix}{min}{suffix}</span>
                <span>{prefix}{max}{suffix}</span>
            </div>
        </div>
    )
}

function DigitColumn({ digit, height = 72 }: { digit: string; height?: number }) {
    const y = useSpring(0, { stiffness: 180, damping: 24, mass: 0.8 })
    const digits = useMemo(() => ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], [])

    useEffect(() => {
        if (digit === ',' || digit === '$') return
        y.set(-Number(digit) * height)
    }, [digit, height, y])

    if (digit === ',' || digit === '$') {
        return (
            <span
                className="inline-flex items-center justify-center font-black leading-none text-white"
                style={{ height }}
            >
                {digit}
            </span>
        )
    }

    return (
        <span
            className="relative inline-flex overflow-hidden font-black leading-none text-white"
            style={{ height, width: '0.72em' }}
        >
            <motion.span style={{ y }} className="absolute left-0 top-0 flex flex-col">
                {digits.map((value) => (
                    <span
                        key={value}
                        className="inline-flex items-center justify-center"
                        style={{ height }}
                    >
                        {value}
                    </span>
                ))}
            </motion.span>
        </span>
    )
}

function AnimatedCounter({ value }: { value: number }) {
    const formatted = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
    }).format(Math.round(value))

    const characters = `$${formatted}`.split('')

    return (
        <div className="flex items-center justify-center gap-[0.02em]">
            {characters.map((char, index) => (
                <DigitColumn key={`${char}-${index}`} digit={char} />
            ))}
        </div>
    )
}

export const ROICalculator = () => {
    const [teamSize, setTeamSize] = useState(5)
    const [manualHours, setManualHours] = useState(15)
    const [hourlyRate, setHourlyRate] = useState(20)
    const [isOptimized, setIsOptimized] = useState(false)

    const monthlyLoss = teamSize * manualHours * hourlyRate * 4
    const optimizedLoss = monthlyLoss * 0.15
    const moneySaved = monthlyLoss - optimizedLoss

    const animatedValue = useMotionValue(monthlyLoss)
    const [displayedValue, setDisplayedValue] = useState(monthlyLoss)
    const rotation = useMotionValue(0)
    const rotatingBorder = useTransform(rotation, (value) => `conic-gradient(from ${value}deg, rgba(34,211,238,0.95), rgba(123,47,255,0.8), rgba(34,197,94,0.8), rgba(34,211,238,0.95))`)
    const particleConfigs = useMemo(
        () => [
            { duration: 3.2, delay: 0.1 },
            { duration: 4.1, delay: 0.8 },
            { duration: 3.6, delay: 1.4 },
            { duration: 4.6, delay: 0.5 },
            { duration: 3.9, delay: 1.9 },
        ],
        []
    )

    useEffect(() => {
        const controls = animate(rotation, 360, {
            duration: 14,
            ease: 'linear',
            repeat: Infinity,
        })
        return controls.stop
    }, [rotation])

    useEffect(() => {
        const targetValue = isOptimized ? moneySaved : monthlyLoss
        const controls = animate(animatedValue, targetValue, {
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (latest) => setDisplayedValue(Math.round(latest)),
        })
        return controls.stop
    }, [animatedValue, isOptimized, moneySaved, monthlyLoss])

    return (
        <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-32">
            <div className="mb-14 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-4 text-3xl font-black tracking-tight text-white md:text-5xl lg:text-6xl"
                >
                    ¿Cuánto pierde tu negocio
                    <br className="hidden md:block" />
                    por no estar automatizado?
                </motion.h2>
                <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 md:text-lg">
                    Mové los controles y descubrí cuánto dinero estás dejando ir cada mes por hacer las cosas a mano.
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative grid grid-cols-1 gap-10 overflow-hidden rounded-[2.5rem] border border-white/10 bg-zinc-950/80 p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] backdrop-blur-3xl lg:grid-cols-2 lg:gap-16 lg:p-12"
            >
                <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-cyan-900/20 blur-[100px]" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-900/20 blur-[100px]" />

                <div className="relative z-10 flex flex-col space-y-10">
                    <div className="flex flex-col gap-10 rounded-[1.8rem] border border-white/[0.08] bg-white/[0.04] p-6">
                        <SliderField
                            label="¿Cuántas personas trabajan en tu negocio?"
                            value={teamSize}
                            min={1}
                            max={100}
                            onChange={setTeamSize}
                        />

                        <SliderField
                            label="¿Cuántas horas semanales se pierden en tareas repetitivas?"
                            value={manualHours}
                            min={1}
                            max={40}
                            suffix="h"
                            onChange={setManualHours}
                        />

                        <SliderField
                            label="¿Cuánto vale la hora de trabajo promedio? (USD)"
                            value={hourlyRate}
                            min={5}
                            max={150}
                            prefix="$"
                            onChange={setHourlyRate}
                        />
                    </div>

                    <motion.div
                        className={`mt-2 flex items-center justify-between rounded-[1.4rem] border p-5 transition-colors duration-500 ${
                            isOptimized
                                ? 'border-green-500/40 bg-green-500/[0.08]'
                                : 'border-red-500/20 bg-red-500/[0.06]'
                        }`}
                        layout
                    >
                        <div>
                            <h4 className="mb-1 text-lg font-bold text-white">
                                Simular con develOP
                            </h4>
                            <p className={`text-sm transition-colors duration-500 ${isOptimized ? 'text-green-400/80' : 'text-zinc-500'}`}>
                                Automatizaciones + IA trabajando por vos
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOptimized(!isOptimized)}
                            className={`relative flex h-10 w-20 items-center rounded-full border-2 px-1 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                                isOptimized
                                    ? 'border-green-400 bg-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                                    : 'border-red-500/30 bg-black/50 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                            }`}
                        >
                            <motion.div
                                className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg ${
                                    isOptimized ? 'shadow-[0_0_15px_rgba(34,197,94,0.8)]' : 'opacity-80'
                                }`}
                                animate={{ x: isOptimized ? 36 : 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                {isOptimized && (
                                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                                )}
                            </motion.div>
                        </button>
                    </motion.div>
                </div>

                <motion.div
                    className="relative z-10 flex h-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 p-8 shadow-inner"
                    animate={{
                        borderColor: isOptimized ? 'rgba(34,197,94,0.32)' : 'rgba(239,68,68,0.3)',
                        backgroundColor: isOptimized ? 'rgba(5,46,22,0.18)' : 'rgba(69,10,10,0.18)',
                    }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                        {isOptimized ? (
                            <div className="absolute -bottom-20 flex h-full w-full justify-between px-10 opacity-30">
                                {particleConfigs.map((config, i) => (
                                    <motion.div
                                        key={`particle-${i}`}
                                        className="h-12 w-1 rounded-full bg-gradient-to-t from-transparent to-green-400 blur-[2px]"
                                        animate={{ y: [-100, -600], opacity: [0, 1, 0] }}
                                        transition={{
                                            duration: config.duration,
                                            repeat: Infinity,
                                            delay: config.delay,
                                            ease: "linear"
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                className="h-96 w-96 rounded-full bg-red-600/10 blur-[100px]"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />
                        )}
                    </div>

                    <div className="relative z-10 flex w-full flex-col items-center">
                        <div className="mb-6 flex items-center gap-3">
                            {!isOptimized ? (
                                <motion.div
                                    className="h-3 w-3 rounded-full bg-red-500"
                                    animate={{ opacity: [1, 0.3, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            ) : (
                                <motion.div
                                    className="h-3 w-3 rounded-full bg-green-400"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            )}
                            <h3 className={`text-sm font-mono uppercase tracking-widest transition-colors duration-500 md:text-base ${
                                isOptimized ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {isOptimized ? 'LO QUE RECUPERÁS CON develOP' : 'LO QUE PERDÉS CADA MES'}
                            </h3>
                        </div>

                        <div className="relative w-full max-w-[34rem]">
                            <motion.div
                                style={{ background: rotatingBorder }}
                                className="absolute inset-0 rounded-[2rem] p-px"
                            >
                                <div className="h-full w-full rounded-[2rem] bg-transparent" />
                            </motion.div>

                            <div className="relative rounded-[2rem] bg-[#070b14]/90 px-6 py-10 backdrop-blur-xl md:px-8 md:py-12">
                                <div className={`absolute inset-0 rounded-[2rem] blur-3xl transition-colors duration-700 ${
                                    isOptimized ? 'bg-green-500/10' : 'bg-red-500/10'
                                }`} />

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="mb-3 text-[11px] uppercase tracking-[0.24em] text-white/30">
                                        Resultado mensual
                                    </div>
                                    <div className="relative text-[clamp(2.8rem,7vw,5.5rem)] font-black tracking-[-0.06em] tabular-nums">
                                        <div className={`absolute inset-0 blur-xl opacity-35 ${
                                            isOptimized ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                            <AnimatedCounter value={displayedValue} />
                                        </div>
                                        <div className={`relative z-10 ${
                                            isOptimized ? 'text-white' : 'text-red-300'
                                        }`}>
                                            <AnimatedCounter value={displayedValue} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 rounded-lg border border-white/5 bg-black/40 px-4 py-2 text-xs font-mono text-zinc-500">
                            {isOptimized
                                ? 'Basado en 85% de optimización promedio'
                                : 'Basado en 100% de las horas indicadas'
                            }
                        </div>

                        {isOptimized && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="w-full overflow-hidden"
                            >
                                <div className="flex w-full flex-col justify-center gap-3 md:flex-row">
                                    <div className="flex flex-1 flex-col items-center gap-3 rounded-xl border border-violet-500/25 bg-violet-950/30 p-4 text-center">
                                        <svg className="h-9 w-9 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        <div>
                                            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-violet-300">Agentes IA</p>
                                            <p className="text-[11px] leading-relaxed text-zinc-400">Toman el 40% del análisis y decisiones rutinarias</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-1 flex-col items-center gap-3 rounded-xl border border-cyan-500/25 bg-cyan-950/30 p-4 text-center">
                                        <svg className="h-9 w-9 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        <div>
                                            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-cyan-300">N8N</p>
                                            <p className="text-[11px] leading-relaxed text-zinc-400">Elimina el 100% del data entry manual</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-1 flex-col items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-950/30 p-4 text-center">
                                        <svg className="h-9 w-9 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                        <div>
                                            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-300">Software a medida</p>
                                            <p className="text-[11px] leading-relaxed text-zinc-400">Reduce 35% de fricción operativa</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="mt-8 flex w-full flex-col items-center">
                            <button
                                className={`group flex w-full max-w-md items-center justify-center gap-3 rounded-full py-4 font-bold uppercase tracking-widest transition-all duration-500 ${
                                    isOptimized
                                        ? 'border border-green-400 bg-green-500/10 text-green-100 shadow-[0_0_40px_rgba(34,197,94,0.22)] hover:bg-green-500 hover:text-black'
                                        : 'border border-red-500/40 bg-zinc-900 text-red-400 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-red-400 hover:text-red-300'
                                }`}
                            >
                                {isOptimized ? 'Agendar demo gratuita' : 'Quiero dejar de perder este dinero'}
                                <svg className="h-5 w-5 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </button>
                            <p className="mt-4 text-center text-[11px] text-zinc-500 md:text-xs">
                                Te mostramos cómo funciona para tu negocio. Sin costo, sin compromiso.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    )
}
