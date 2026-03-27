'use client'

import React, { useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Building2, Car, Dumbbell, HeartPulse, Sparkles, Utensils } from 'lucide-react'

interface RubroData {
    id: string
    label: string
    color: string
    colorRgb: string
    headline: string
    problema: string
    solucion: string
    resultado: string
    icon: React.ComponentType<{ className?: string }>
}

const rubros: RubroData[] = [
    {
        id: 'concesionaria',
        label: 'Concesionaria',
        color: '#818cf8',
        colorRgb: '129,140,248',
        headline: 'Tu concesionaria sigue vendiendo incluso cuando el salón está cerrado.',
        problema: 'Clientes comparan modelos y precios fuera de horario y se van con quien sí muestra un catálogo ordenado.',
        solucion: 'Diseñamos una vitrina digital con filtros, fichas claras y consulta directa lista para pasar al equipo comercial.',
        resultado: 'Más contactos calientes sin depender del horario del showroom.',
        icon: Car,
    },
    {
        id: 'clinica',
        label: 'Salud',
        color: '#4ade80',
        colorRgb: '74,222,128',
        headline: 'Tu clínica consigue pacientes mientras vos seguís atendiendo.',
        problema: 'Quien necesita turno rápido no quiere buscar teléfonos perdidos ni esperar respuesta manual.',
        solucion: 'Mostramos especialidades, horarios y accesos clave en una experiencia que transmite orden y confianza.',
        resultado: 'Menos fricción para reservar, más pacientes confirmados.',
        icon: HeartPulse,
    },
    {
        id: 'gimnasio',
        label: 'Fitness',
        color: '#f59e0b',
        colorRgb: '245,158,11',
        headline: 'Tu gimnasio convierte interés en inscripción sin repetir siempre lo mismo.',
        problema: 'La gente pregunta precios, horarios y clases por todos lados y se enfría antes de decidir.',
        solucion: 'Centralizamos propuesta, beneficios y agenda para que la decisión ocurra en pocos clics.',
        resultado: 'Más alumnos llegan con intención real de empezar.',
        icon: Dumbbell,
    },
    {
        id: 'restaurante',
        label: 'Gastronomía',
        color: '#fb923c',
        colorRgb: '251,146,60',
        headline: 'Tu restaurante se reserva mejor cuando la experiencia ya abre el apetito antes de llegar.',
        problema: 'Si la carta está desordenada o vieja, la búsqueda termina en otro lugar más claro.',
        solucion: 'Creamos una presencia que ordena menú, reservas y ubicación para que todo se entienda al instante.',
        resultado: 'Más reservas y una marca más consistente en cada búsqueda.',
        icon: Utensils,
    },
    {
        id: 'inmobiliaria',
        label: 'Real Estate',
        color: '#38bdf8',
        colorRgb: '56,189,248',
        headline: 'Tu inmobiliaria destaca propiedades con una lectura mucho más seria que un feed suelto.',
        problema: 'Publicar solo en redes diluye oportunidades y hace que cada propiedad pierda contexto.',
        solucion: 'Diseñamos un catálogo propio con jerarquía, filtros y consultas listas para convertir interés en visita.',
        resultado: 'Más descubrimiento, más autoridad y mejores consultas.',
        icon: Building2,
    },
]

const panelVariants = {
    initial: {
        opacity: 0,
        y: 24,
        maskImage: 'linear-gradient(to top, transparent 0%, transparent 26%, black 58%, black 100%)',
        WebkitMaskImage: 'linear-gradient(to top, transparent 0%, transparent 26%, black 58%, black 100%)',
        maskSize: '100% 220%',
        WebkitMaskSize: '100% 220%',
        maskPosition: '0% 100%',
        WebkitMaskPosition: '0% 100%',
    },
    animate: {
        opacity: 1,
        y: 0,
        maskImage: 'linear-gradient(to top, transparent 0%, transparent 26%, black 58%, black 100%)',
        WebkitMaskImage: 'linear-gradient(to top, transparent 0%, transparent 26%, black 58%, black 100%)',
        maskSize: '100% 220%',
        WebkitMaskSize: '100% 220%',
        maskPosition: '0% 0%',
        WebkitMaskPosition: '0% 0%',
        transition: {
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
            when: 'beforeChildren',
            staggerChildren: 0.08,
        },
    },
    exit: {
        opacity: 0,
        y: -16,
        transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
    },
}

const itemVariants = {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

function RubroMockup({ rubro }: { rubro: RubroData }) {
    const Icon = rubro.icon

    return (
        <div className="overflow-hidden rounded-[2rem] border border-white/[0.05] bg-white/[0.02] shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/[0.05] bg-white/[0.03] px-5 py-4">
                {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
                    <div key={color} className="h-2.5 w-2.5 rounded-full" style={{ background: color, opacity: 0.8 }} />
                ))}
                <div className="mx-auto inline-flex max-w-[16rem] items-center gap-2 rounded-full border border-white/[0.05] bg-black/20 px-4 py-1.5 text-[10px] uppercase tracking-[0.24em] text-white/30">
                    <div className="h-2 w-2 rounded-full" style={{ background: rubro.color }} />
                    tu{rubro.id}.com.ar
                </div>
            </div>

            <div className="relative p-5 md:p-6">
                <div
                    className="pointer-events-none absolute right-4 top-4 h-28 w-28 rounded-full blur-3xl"
                    style={{ background: `radial-gradient(circle, rgba(${rubro.colorRgb},0.18) 0%, transparent 72%)` }}
                />

                <div className="relative overflow-hidden rounded-[1.6rem] border border-white/[0.05] bg-[#060912]/90 p-5">
                    <div className="mb-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="grid h-11 w-11 place-items-center rounded-[1rem] border border-white/10 bg-white/[0.03]">
                                <Icon className="size-5 animate-[float_3s_ease-in-out_infinite] text-white/80" />
                            </div>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.3em] text-white/35">{rubro.label}</div>
                                <div className="mt-1 text-sm text-white/70">Landing enfocada en conversión</div>
                            </div>
                        </div>
                        <div
                            className="rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.24em]"
                            style={{
                                borderColor: `rgba(${rubro.colorRgb},0.24)`,
                                background: `rgba(${rubro.colorRgb},0.1)`,
                                color: rubro.color,
                            }}
                        >
                            Activo
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {[
                            ['Oferta principal', 'Mensaje claro arriba del fold'],
                            ['Conversión', 'CTA directo a WhatsApp o turno'],
                            ['Confianza', 'Prueba social, ubicación y contexto'],
                        ].map(([title, description], index) => (
                            <div key={title} className="flex items-center justify-between rounded-[1.15rem] border border-white/[0.05] bg-white/[0.02] px-4 py-4">
                                <div>
                                    <div className="text-sm font-semibold text-white">{title}</div>
                                    <div className="mt-1 text-sm text-white/45">{description}</div>
                                </div>
                                <div
                                    className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em]"
                                    style={{
                                        borderColor: `rgba(${rubro.colorRgb},${0.14 + index * 0.06})`,
                                        background: `rgba(${rubro.colorRgb},${0.08 + index * 0.02})`,
                                        color: rubro.color,
                                    }}
                                >
                                    +{index + 1}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div
                        className="mt-4 flex items-center justify-between rounded-[1.3rem] border px-4 py-4"
                        style={{
                            borderColor: `rgba(${rubro.colorRgb},0.18)`,
                            background: `linear-gradient(140deg, rgba(${rubro.colorRgb},0.12), rgba(255,255,255,0.02) 48%, rgba(${rubro.colorRgb},0.05))`,
                        }}
                    >
                        <div>
                            <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Resultado esperado</div>
                            <div className="mt-2 text-base font-semibold text-white">Más intención lista para convertir</div>
                        </div>
                        <ArrowUpRight className="size-5 text-white/70" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function WebDevelopmentByRubro() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, amount: 0.1 })
    const prefersReduced = useReducedMotion()
    const [activeRubro, setActiveRubro] = useState(0)
    const rubro = rubros[activeRubro]
    const Icon = rubro.icon

    return (
        <section ref={sectionRef} className="relative overflow-hidden bg-[#070709] px-4 py-[clamp(80px,12vh,140px)]">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-7px); }
                }
            `}</style>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[8%] h-[34rem] w-[60rem] -translate-x-1/2 blur-[120px]"
                style={{ background: 'radial-gradient(ellipse, rgba(34,211,238,0.08) 0%, rgba(255,255,255,0.02) 34%, transparent 68%)' }}
            />

            <div className="relative z-10 mx-auto max-w-6xl">
                <div className="mb-14">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: prefersReduced ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 backdrop-blur-xl"
                    >
                        <Sparkles className="size-4 animate-[float_3s_ease-in-out_infinite] text-cyan-200" />
                        <span className="text-[11px] uppercase tracking-[0.32em] text-cyan-200/85">[ Tu web, tu industria ]</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: prefersReduced ? 0 : 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                        className="text-[clamp(2.2rem,5vw,4.4rem)] font-black leading-[0.94] tracking-[-0.05em] text-white"
                    >
                        Una web que trabaja
                        <br />
                        <span className="bg-gradient-to-r from-white via-cyan-200 to-violet-200 bg-clip-text text-transparent">
                            para tu negocio específico.
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: prefersReduced ? 0 : 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-6 max-w-2xl text-base leading-8 text-white/48 md:text-lg"
                    >
                        Cambiamos el envoltorio genérico por una narrativa pensada para el problema real de tu rubro y para la decisión que querés provocar.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: prefersReduced ? 0 : 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-10 flex flex-wrap gap-3"
                >
                    {rubros.map((item, index) => {
                        const ActiveIcon = item.icon
                        const isActive = index === activeRubro

                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => setActiveRubro(index)}
                                whileHover={prefersReduced ? {} : { y: -2, scale: 1.02 }}
                                whileTap={prefersReduced ? {} : { scale: 0.98 }}
                                className="inline-flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-semibold transition-[border-color,background-color,color,box-shadow] duration-300"
                                style={{
                                    borderColor: isActive ? `rgba(${item.colorRgb},0.34)` : 'rgba(255,255,255,0.08)',
                                    background: isActive ? `rgba(${item.colorRgb},0.14)` : 'rgba(255,255,255,0.03)',
                                    color: isActive ? item.color : 'rgba(255,255,255,0.48)',
                                    boxShadow: isActive ? `0 0 30px rgba(${item.colorRgb},0.12)` : 'none',
                                }}
                            >
                                <ActiveIcon className="size-4 animate-[float_3s_ease-in-out_infinite]" />
                                {item.label}
                            </motion.button>
                        )
                    })}
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={rubro.id}
                        variants={prefersReduced ? undefined : panelVariants}
                        initial={prefersReduced ? false : 'initial'}
                        animate={prefersReduced ? undefined : 'animate'}
                        exit={prefersReduced ? undefined : 'exit'}
                        className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14"
                    >
                        <motion.div variants={prefersReduced ? undefined : itemVariants} className="relative">
                            <div
                                className="pointer-events-none absolute -left-4 -top-8 text-[clamp(5rem,11vw,8rem)] font-black leading-none text-transparent opacity-90"
                                style={{ WebkitTextStroke: '2px rgba(255,255,255,0.12)' }}
                            >
                                0{activeRubro + 1}
                            </div>

                            <div className="relative z-10">
                                <motion.div
                                    variants={prefersReduced ? undefined : itemVariants}
                                    className="mb-5 inline-flex items-center gap-3 rounded-full border px-4 py-2 backdrop-blur-xl"
                                    style={{
                                        borderColor: `rgba(${rubro.colorRgb},0.24)`,
                                        background: `rgba(${rubro.colorRgb},0.1)`,
                                    }}
                                >
                                    <Icon className="size-4 animate-[float_3s_ease-in-out_infinite]" style={{ color: rubro.color }} />
                                    <span className="text-[11px] uppercase tracking-[0.28em]" style={{ color: rubro.color }}>
                                        {rubro.label}
                                    </span>
                                </motion.div>

                                <motion.h3
                                    variants={prefersReduced ? undefined : itemVariants}
                                    className="max-w-xl text-[clamp(1.8rem,3.6vw,3.2rem)] font-black leading-[0.96] tracking-[-0.05em] text-white"
                                >
                                    {rubro.headline}
                                </motion.h3>

                                <motion.div variants={prefersReduced ? undefined : itemVariants} className="mt-8 space-y-4">
                                    <div className="rounded-[1.4rem] border border-red-400/15 bg-red-400/[0.05] p-5">
                                        <div className="text-[11px] uppercase tracking-[0.26em] text-red-300/75">El problema</div>
                                        <p className="mt-3 text-sm leading-7 text-white/55 md:text-base">{rubro.problema}</p>
                                    </div>

                                    <div
                                        className="rounded-[1.4rem] border p-5"
                                        style={{
                                            borderColor: `rgba(${rubro.colorRgb},0.18)`,
                                            background: `rgba(${rubro.colorRgb},0.06)`,
                                        }}
                                    >
                                        <div className="text-[11px] uppercase tracking-[0.26em]" style={{ color: rubro.color }}>
                                            La solución
                                        </div>
                                        <p className="mt-3 text-sm leading-7 text-white/62 md:text-base">{rubro.solucion}</p>
                                    </div>

                                    <div className="rounded-[1.4rem] border border-emerald-400/15 bg-emerald-400/[0.05] px-5 py-4 text-sm font-semibold text-emerald-300/85 md:text-base">
                                        {rubro.resultado}
                                    </div>
                                </motion.div>

                                <motion.a
                                    variants={prefersReduced ? undefined : itemVariants}
                                    href="#vault-section"
                                    whileHover={prefersReduced ? {} : { scale: 1.03 }}
                                    whileTap={prefersReduced ? {} : { scale: 0.98 }}
                                    className="mt-8 inline-flex items-center gap-3 rounded-full border px-6 py-4 text-[13px] font-extrabold uppercase tracking-[0.24em] text-white backdrop-blur-xl"
                                    style={{
                                        borderColor: `rgba(${rubro.colorRgb},0.28)`,
                                        background: `rgba(${rubro.colorRgb},0.12)`,
                                        boxShadow: `0 0 30px rgba(${rubro.colorRgb},0.12)`,
                                    }}
                                >
                                    Quiero mi web de {rubro.label.toLowerCase()}
                                    <ArrowUpRight className="size-4 animate-[float_3s_ease-in-out_infinite]" />
                                </motion.a>
                            </div>
                        </motion.div>

                        <motion.div variants={prefersReduced ? undefined : itemVariants}>
                            <RubroMockup rubro={rubro} />
                        </motion.div>
                    </motion.div>
                </AnimatePresence>

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : {}}
                    transition={{ duration: prefersReduced ? 0 : 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-16 h-px origin-left bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.28)_28%,rgba(34,211,238,0.45)_50%,rgba(34,211,238,0.28)_72%,transparent)]"
                />
            </div>
        </section>
    )
}
