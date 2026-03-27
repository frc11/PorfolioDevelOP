'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'

interface FAQItem {
    question: string
    answer: string
}

const faqItems: FAQItem[] = [
    {
        question: '¿Cuánto tiempo lleva estar usando el sistema?',
        answer:
            'En 30 días ya está funcionando el módulo principal. Arrancamos por el cuello de botella más costoso y desde ahí expandimos sin detener la operación.',
    },
    {
        question: '¿Qué pasa si el sistema se cae?',
        answer:
            'Trabajamos con monitoreo activo, backups automáticos y recuperación controlada. Si algo se degrada, lo detectamos antes de que termine afectando al negocio.',
    },
    {
        question: '¿Mis empleados van a poder usarlo sin capacitación extensa?',
        answer:
            'Sí. Diseñamos interfaces operativas simples y guiadas. Aun así incluimos onboarding para que el equipo gane confianza desde el primer día.',
    },
    {
        question: '¿Se puede conectar con WhatsApp, Mercado Pago o AFIP?',
        answer:
            'Sí. Las integraciones críticas se diseñan desde el inicio para que pedidos, cobros, facturación y notificaciones convivan en un mismo flujo.',
    },
    {
        question: '¿Qué pasa si necesito cambiar algo después del lanzamiento?',
        answer:
            'El sistema queda preparado para iterar. Mantenimiento, mejoras y nuevas funcionalidades se pueden sumar sin volver a empezar desde cero.',
    },
    {
        question: '¿Es para empresas pequeñas o solo para estructuras grandes?',
        answer:
            'Es para empresas que ya sienten el costo de operar con herramientas improvisadas. Si Excel y WhatsApp ya no alcanzan, el momento llegó.',
    },
]

function DecryptText({
    text,
    start,
}: {
    text: string
    start: boolean
}) {
    const reducedMotion = useReducedMotion()
    const [display, setDisplay] = useState('')
    const symbols = useMemo(() => ['#', '!', '*', '&', '%', '$', '@', '+'], [])

    useEffect(() => {
        if (!start) return
        if (reducedMotion) return

        let frame = 0
        let raf = 0
        const totalFrames = 42

        const tick = () => {
            frame += 1
            const progress = frame / totalFrames
            const revealIndex = Math.floor(progress * text.length)

            const next = text
                .split('')
                .map((char, index) => {
                    if (char === ' ') return ' '
                    if (index < revealIndex) return text[index]
                    return symbols[(frame + index) % symbols.length]
                })
                .join('')

            setDisplay(next)

            if (frame < totalFrames) {
                raf = requestAnimationFrame(tick)
            } else {
                setDisplay(text)
            }
        }

        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [start, reducedMotion, symbols, text])

    const output = reducedMotion && start ? text : display

    return <>{output}</>
}

function SecurityIcon() {
    const reducedMotion = useReducedMotion()
    const wrapperRef = useRef<HTMLDivElement>(null)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const rotateX = useSpring(useTransform(mouseY, [-1, 1], [10, -10]), { stiffness: 180, damping: 18, mass: 0.6 })
    const rotateY = useSpring(useTransform(mouseX, [-1, 1], [-10, 10]), { stiffness: 180, damping: 18, mass: 0.6 })

    const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if (reducedMotion || !wrapperRef.current) return
        const bounds = wrapperRef.current.getBoundingClientRect()
        const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
        const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1
        mouseX.set(x)
        mouseY.set(y)
    }

    const reset = () => {
        mouseX.set(0)
        mouseY.set(0)
    }

    return (
        <div
            ref={wrapperRef}
            onMouseMove={handleMove}
            onMouseLeave={reset}
            className="relative mx-auto w-full max-w-[20rem] perspective-[1200px]"
        >
            <motion.div
                style={{ rotateX: reducedMotion ? 0 : rotateX, rotateY: reducedMotion ? 0 : rotateY }}
                className="relative mx-auto grid aspect-square w-[16rem] place-items-center rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(15,23,42,0.28)_45%,rgba(15,23,42,0.75)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
            >
                <div className="absolute inset-4 rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_50%_30%,rgba(125,211,252,0.18),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.16),rgba(2,6,23,0.56))]" />
                <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.18),transparent_34%)]" />

                <motion.div
                    animate={reducedMotion ? {} : { y: [0, -6, 0] }}
                    transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-10"
                >
                    <svg width="124" height="146" viewBox="0 0 124 146" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M62 7L106 23V61C106 96 83 121 62 136C41 121 18 96 18 61V23L62 7Z"
                            fill="url(#shieldBody)"
                            stroke="rgba(255,255,255,0.24)"
                            strokeWidth="2"
                        />
                        <path
                            d="M62 25C73 25 82 34 82 45V56H88C91 56 94 59 94 62V92C94 95 91 98 88 98H36C33 98 30 95 30 92V62C30 59 33 56 36 56H42V45C42 34 51 25 62 25Z"
                            fill="url(#lockBody)"
                        />
                        <path
                            d="M50 56V45C50 38 55 33 62 33C69 33 74 38 74 45V56"
                            stroke="#d8f4ff"
                            strokeWidth="5"
                            strokeLinecap="round"
                        />
                        <circle cx="62" cy="74" r="7" fill="#03111d" />
                        <rect x="59" y="73" width="6" height="13" rx="3" fill="#03111d" />
                        <defs>
                            <linearGradient id="shieldBody" x1="20" y1="18" x2="99" y2="130" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#dff7ff" stopOpacity="0.45" />
                                <stop offset="0.32" stopColor="#2563eb" stopOpacity="0.28" />
                                <stop offset="0.68" stopColor="#0f172a" stopOpacity="0.9" />
                                <stop offset="1" stopColor="#020617" />
                            </linearGradient>
                            <linearGradient id="lockBody" x1="34" y1="33" x2="90" y2="105" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#f8fdff" stopOpacity="0.8" />
                                <stop offset="0.4" stopColor="#94a3b8" stopOpacity="0.45" />
                                <stop offset="1" stopColor="#0f172a" />
                            </linearGradient>
                        </defs>
                    </svg>
                </motion.div>
            </motion.div>
        </div>
    )
}

function FAQItemRow({
    item,
    index,
    isOpen,
    onToggle,
    isInView,
}: {
    item: FAQItem
    index: number
    isOpen: boolean
    onToggle: () => void
    isInView: boolean
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.28 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-white/8"
        >
            <button
                onClick={onToggle}
                className="group flex w-full items-start justify-between gap-5 py-6 text-left"
            >
                <div className="flex-1">
                    <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-cyan-200/42">
                        [ Q{String(index + 1).padStart(2, '0')} ]
                    </div>
                    <div className="mt-3 text-[clamp(1rem,1.5vw,1.1rem)] font-semibold leading-relaxed text-white transition-colors duration-300 group-hover:text-cyan-100">
                        {item.question}
                    </div>
                </div>

                <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-white/55 transition-all duration-300 ${
                    isOpen
                        ? 'border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-100'
                        : 'border-white/10 bg-white/[0.03]'
                }`}>
                    {isOpen ? '−' : '+'}
                </div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <p className="max-w-2xl pb-6 pr-10 text-sm leading-8 text-white/52 md:text-[15px]">
                            {item.answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default function VaultSoftware() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden bg-[#030308] px-[clamp(20px,5vw,80px)] py-[clamp(80px,12vh,140px)]"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 h-[34rem] w-[60rem] -translate-x-1/2 blur-[130px]"
                style={{ background: 'radial-gradient(ellipse at center top, rgba(99,102,241,0.14) 0%, rgba(34,211,238,0.08) 38%, transparent 74%)' }}
            />

            <div className="relative z-10 mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.05] px-4 py-2"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-200">
                        [ Seguridad y bóveda ]
                    </span>
                </motion.div>

                <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-slate-950/50 p-[clamp(24px,4vw,40px)] shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
                    <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
                        <div className="relative">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
                                className="text-[clamp(2.4rem,6vw,5.4rem)] font-black leading-[0.9] tracking-[-0.07em] text-white"
                            >
                                <DecryptText text="Seguridad Bank-Grade" start={isInView} />
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 16 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                className="mt-6 max-w-xl text-base leading-8 text-white/48 md:text-lg"
                            >
                                La infraestructura, los permisos y la trazabilidad se diseñan como una capa de defensa real. No vendemos una sensación visual de seguridad: construimos una operación protegida de extremo a extremo.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 18 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.65, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
                                className="mt-10 grid gap-3"
                            >
                                {[
                                    'Roles y accesos segmentados por perfil operativo',
                                    'Backups automáticos y observabilidad continua',
                                    'Conexiones protegidas y datos críticos auditables',
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-3 border-t border-white/8 pt-4 text-sm text-white/62 md:text-[15px]">
                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/15 bg-cyan-300/[0.08] text-[11px] text-cyan-100">
                                            ✓
                                        </span>
                                        {item}
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        <div className="relative">
                            <SecurityIcon />
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.72, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-14"
                    >
                        <div className="mb-4 text-[11px] font-mono uppercase tracking-[0.26em] text-white/28">
                            Preguntas de seguridad y operación
                        </div>
                        <div className="border-t border-white/8">
                            {faqItems.map((item, index) => (
                                <FAQItemRow
                                    key={item.question}
                                    item={item}
                                    index={index}
                                    isOpen={openIndex === index}
                                    onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                                    isInView={isInView}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
