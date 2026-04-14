'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, type Variants, useInView, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Building2, Car, Dumbbell, HeartPulse, Pause, Play, Sparkles, Utensils } from 'lucide-react'

interface RubroData {
    id: string
    label: string
    color: string
    colorRgb: string
    domain: string
    headline: string
    problema: string
    solucion: string
    resultado: string
    mockSubtitle: string
    mockItems: Array<{ title: string; description: string }>
    mockResult: string
    icon: React.ComponentType<{ className?: string }>
}

const rubros: RubroData[] = [
    {
        id: 'concesionaria',
        label: 'Concesionaria',
        color: '#818cf8',
        colorRgb: '129,140,248',
        domain: 'autonorte.com.ar',
        headline: 'Tu concesionaria sigue vendiendo incluso cuando el salón está cerrado.',
        problema: 'Clientes comparan modelos y precios fuera de horario y se van con quien sí muestra un catálogo ordenado.',
        solucion: 'Diseñamos una vitrina digital con filtros, fichas claras y consulta directa lista para pasar al equipo comercial.',
        resultado: 'Más contactos calientes sin depender del horario del showroom.',
        mockSubtitle: 'Embudo de test drive activo',
        mockItems: [
            { title: 'Stock en vivo', description: 'Modelos, versiones y financiación actualizados' },
            { title: 'Pre-calificación', description: 'Formulario de toma y simulador de cuota' },
            { title: 'Prueba de manejo', description: 'Agenda automática con confirmación inmediata' },
        ],
        mockResult: 'Más consultas listas para cerrar en salón',
        icon: Car,
    },
    {
        id: 'clinica',
        label: 'Salud',
        color: '#4ade80',
        colorRgb: '74,222,128',
        domain: 'tuclinica.com.ar',
        headline: 'Tu clínica consigue pacientes mientras vos seguís atendiendo.',
        problema: 'Quien necesita turno rápido no quiere buscar teléfonos perdidos ni esperar respuesta manual.',
        solucion: 'Mostramos especialidades, horarios y accesos clave en una experiencia que transmite orden y confianza.',
        resultado: 'Menos fricción para reservar, más pacientes confirmados.',
        mockSubtitle: 'Flujo de turnos de alta conversión',
        mockItems: [
            { title: 'Especialidades clave', description: 'Prioridad visual para servicios más buscados' },
            { title: 'Turnos en 1 paso', description: 'CTA directo a WhatsApp o agenda online' },
            { title: 'Confianza médica', description: 'Equipo, ubicación y cobertura bien explicados' },
        ],
        mockResult: 'Más pacientes confirmados sin saturar recepción',
        icon: HeartPulse,
    },
    {
        id: 'gimnasio',
        label: 'Fitness',
        color: '#f59e0b',
        colorRgb: '245,158,11',
        domain: 'studiofit.com.ar',
        headline: 'Tu gimnasio convierte interés en inscripción sin repetir siempre lo mismo.',
        problema: 'La gente pregunta precios, horarios y clases por todos lados y se enfría antes de decidir.',
        solucion: 'Centralizamos propuesta, beneficios y agenda para que la decisión ocurra en pocos clics.',
        resultado: 'Más alumnos llegan con intención real de empezar.',
        mockSubtitle: 'Sistema de membresías que convierte',
        mockItems: [
            { title: 'Planes claros', description: 'Comparador simple de membresías y beneficios' },
            { title: 'Clase de prueba', description: 'Reserva automática con recordatorio previo' },
            { title: 'Prueba social', description: 'Resultados reales y comunidad visible' },
        ],
        mockResult: 'Más altas nuevas y menos consultas repetidas',
        icon: Dumbbell,
    },
    {
        id: 'restaurante',
        label: 'Gastronomía',
        color: '#fb923c',
        colorRgb: '251,146,60',
        domain: 'sazonurbana.com.ar',
        headline: 'Tu restaurante se reserva mejor cuando la experiencia ya abre el apetito antes de llegar.',
        problema: 'Si la carta está desordenada o vieja, la búsqueda termina en otro lugar más claro.',
        solucion: 'Creamos una presencia que ordena menú, reservas y ubicación para que todo se entienda al instante.',
        resultado: 'Más reservas y una marca más consistente en cada búsqueda.',
        mockSubtitle: 'Motor de reservas y carta digital',
        mockItems: [
            { title: 'Menú optimizado', description: 'Platos estrella visibles y filtros por categoría' },
            { title: 'Reserva rápida', description: 'Mesa en segundos con confirmación automática' },
            { title: 'Ubicación directa', description: 'Mapa, horarios y contacto sin fricción' },
        ],
        mockResult: 'Más reservas directas y mejor ticket promedio',
        icon: Utensils,
    },
    {
        id: 'inmobiliaria',
        label: 'Inmobiliaria',
        color: '#38bdf8',
        colorRgb: '56,189,248',
        domain: 'urbanprop.com.ar',
        headline: 'Tu inmobiliaria destaca propiedades con una lectura mucho más seria que un feed suelto.',
        problema: 'Publicar solo en redes diluye oportunidades y hace que cada propiedad pierda contexto.',
        solucion: 'Diseñamos un catálogo propio con jerarquía, filtros y consultas listas para convertir interés en visita.',
        resultado: 'Más descubrimiento, más autoridad y mejores consultas.',
        mockSubtitle: 'Catálogo inteligente para visitas',
        mockItems: [
            { title: 'Filtros avanzados', description: 'Búsqueda por zona, rango y tipo de propiedad' },
            { title: 'Ficha completa', description: 'Planos, amenities y costos en contexto' },
            { title: 'Visita agendada', description: 'Formulario calificado para vender más rápido' },
        ],
        mockResult: 'Más consultas calificadas y visitas concretadas',
        icon: Building2,
    },
]

const AUTO_ROTATION_MS = 5000
const PROGRESS_TICK_MS = 80
const HEADLINE_ACCENT = 'para tu negocio específico.'

const panelVariants = {
    initial: {
        opacity: 0,
        y: 24,
        scale: 0.986,
        filter: 'blur(6px)',
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] as const,
            when: 'beforeChildren',
            staggerChildren: 0.07,
        },
    },
    exit: {
        opacity: 0,
        y: -14,
        scale: 0.992,
        transition: { duration: 0.24, ease: [0.4, 0, 1, 1] as const },
    },
} as Variants

const itemVariants = {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
} as Variants

function RubroMockItem({
    title,
    description,
    index,
    rubro,
    prefersReduced,
    centerActivate,
}: {
    title: string
    description: string
    index: number
    rubro: RubroData
    prefersReduced: boolean
    centerActivate: boolean
}) {
    const itemRef = useRef<HTMLDivElement>(null)
    const isCentered = useInView(itemRef, { margin: '-45% 0px -45% 0px', amount: 0.08 })
    const isActive = centerActivate && isCentered

    return (
        <motion.div
            ref={itemRef}
            initial={false}
            animate={centerActivate ? { x: isActive ? 3 : 0 } : undefined}
            whileHover={
                prefersReduced
                    ? {}
                    : {
                        x: 3,
                        borderColor: `rgba(${rubro.colorRgb},0.38)`,
                        backgroundColor: `rgba(${rubro.colorRgb},0.12)`,
                    }
            }
            transition={{ duration: 0.08, ease: 'linear' }}
            className="group relative flex items-start justify-between gap-3 overflow-hidden rounded-[1.15rem] border border-white/[0.07] bg-white/[0.02] px-4 py-4"
            style={{
                borderColor: isActive ? `rgba(${rubro.colorRgb},0.38)` : 'rgba(255,255,255,0.07)',
                backgroundColor: isActive ? `rgba(${rubro.colorRgb},0.12)` : 'rgba(255,255,255,0.02)',
            }}
        >
            <div
                className="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
                style={{ background: `linear-gradient(180deg, rgba(${rubro.colorRgb},0), rgba(${rubro.colorRgb},0.8), rgba(${rubro.colorRgb},0))` }}
            />
            <div className="min-w-0 pl-2">
                <div className="text-sm font-semibold transition-colors duration-75" style={{ color: isActive ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,1)' }}>
                    {title}
                </div>
                <div
                    className="mt-1 min-h-[4.6rem] break-words text-sm leading-6 transition-colors duration-75"
                    style={{ color: isActive ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.5)' }}
                >
                    {description}
                </div>
            </div>
            <div
                className="shrink-0 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em]"
                style={{
                    borderColor: isActive ? `rgba(${rubro.colorRgb},0.44)` : `rgba(${rubro.colorRgb},${0.14 + index * 0.06})`,
                    background: isActive ? `rgba(${rubro.colorRgb},0.2)` : `rgba(${rubro.colorRgb},${0.08 + index * 0.02})`,
                    color: rubro.color,
                }}
            >
                +{index + 1}
            </div>
        </motion.div>
    )
}

function RubroMockup({
    rubro,
    prefersReduced,
    centerActivate,
}: {
    rubro: RubroData
    prefersReduced: boolean
    centerActivate: boolean
}) {
    const Icon = rubro.icon
    const resultRef = useRef<HTMLDivElement>(null)
    const isResultCentered = useInView(resultRef, { margin: '-45% 0px -45% 0px', amount: 0.08 })
    const isResultActive = centerActivate && isResultCentered

    return (
        <motion.div
            whileHover={prefersReduced ? {} : { y: -2 }}
            transition={{ duration: 0.08, ease: 'linear' }}
            className="overflow-hidden rounded-[2rem] border bg-white/[0.02] shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl lg:h-full"
            style={{
                borderColor: `rgba(${rubro.colorRgb},0.2)`,
                boxShadow: `0 24px 80px rgba(0,0,0,0.38), 0 0 48px rgba(${rubro.colorRgb},0.14)`,
            }}
        >
            <div className="flex items-center gap-2 border-b border-white/[0.05] bg-white/[0.03] px-5 py-4">
                {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
                    <div key={color} className="h-2.5 w-2.5 rounded-full" style={{ background: color, opacity: 0.86 }} />
                ))}
                <div
                    className="mx-auto inline-flex max-w-[10rem] items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] sm:max-w-[16rem] sm:px-4 sm:text-[10px] sm:tracking-[0.24em]"
                    style={{
                        borderColor: `rgba(${rubro.colorRgb},0.2)`,
                        background: `rgba(${rubro.colorRgb},0.1)`,
                        color: `rgba(${rubro.colorRgb},0.95)`,
                    }}
                >
                    <div className="h-2 w-2 rounded-full" style={{ background: rubro.color, boxShadow: `0 0 10px rgba(${rubro.colorRgb},0.8)` }} />
                    <span className="truncate">{rubro.domain}</span>
                </div>
            </div>

            <div className="relative p-5 md:p-6">
                <div
                    className="pointer-events-none absolute right-3 top-3 h-32 w-32 rounded-full blur-3xl"
                    style={{ background: `radial-gradient(circle, rgba(${rubro.colorRgb},0.26) 0%, transparent 72%)` }}
                />

                <div
                    className="relative overflow-hidden rounded-[1.55rem] border border-white/[0.05] bg-[#060912]/90 p-5"
                    style={{ boxShadow: `inset 0 0 0 1px rgba(${rubro.colorRgb},0.08)` }}
                >
                    <div
                        className="pointer-events-none absolute inset-x-0 top-0 h-px"
                        style={{ background: `linear-gradient(90deg, transparent, rgba(${rubro.colorRgb},0.65), transparent)` }}
                    />

                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex items-center gap-3">
                            <div
                                className="grid h-11 w-11 place-items-center rounded-[1rem] border bg-white/[0.03]"
                                style={{
                                    borderColor: `rgba(${rubro.colorRgb},0.24)`,
                                    boxShadow: `0 0 14px rgba(${rubro.colorRgb},0.2)`,
                                }}
                            >
                                <Icon className="size-5 text-white/90" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] uppercase tracking-[0.3em] text-white/35">{rubro.label}</div>
                                <div className="mt-1 min-h-[1.6rem] break-words text-sm text-white/70">{rubro.mockSubtitle}</div>
                            </div>
                        </div>
                        <div
                            className="rounded-full border px-2.5 py-1.5 text-[9px] uppercase tracking-[0.2em] sm:shrink-0 sm:px-3 sm:text-[10px] sm:tracking-[0.24em]"
                            style={{
                                borderColor: `rgba(${rubro.colorRgb},0.34)`,
                                background: `rgba(${rubro.colorRgb},0.16)`,
                                color: rubro.color,
                                boxShadow: `0 0 18px rgba(${rubro.colorRgb},0.24)`,
                            }}
                        >
                            Activo
                        </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                        {['Conversión', 'Narrativa clara', 'Lead-ready'].map((pill) => (
                            <div
                                key={pill}
                                className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em]"
                                style={{
                                    borderColor: `rgba(${rubro.colorRgb},0.24)`,
                                    background: `rgba(${rubro.colorRgb},0.11)`,
                                    color: `rgba(${rubro.colorRgb},0.95)`,
                                }}
                            >
                                {pill}
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-3">
                        {rubro.mockItems.map(({ title, description }, index) => (
                            <RubroMockItem
                                key={title}
                                title={title}
                                description={description}
                                index={index}
                                rubro={rubro}
                                prefersReduced={prefersReduced}
                                centerActivate={centerActivate}
                            />
                        ))}
                    </div>

                    <motion.div
                        ref={resultRef}
                        initial={false}
                        animate={centerActivate ? { y: isResultActive ? -1 : 0 } : undefined}
                        whileHover={
                            prefersReduced
                                ? {}
                                : {
                                    y: -1,
                                    borderColor: `rgba(${rubro.colorRgb},0.45)`,
                                }
                        }
                        transition={{ duration: 0.08, ease: 'linear' }}
                        className="mt-4 flex items-start justify-between gap-3 rounded-[1.3rem] border px-4 py-4"
                        style={{
                            borderColor: isResultActive ? `rgba(${rubro.colorRgb},0.45)` : `rgba(${rubro.colorRgb},0.24)`,
                            background: `linear-gradient(140deg, rgba(${rubro.colorRgb},0.2), rgba(255,255,255,0.02) 48%, rgba(${rubro.colorRgb},0.08))`,
                            boxShadow: isResultActive ? `0 0 28px rgba(${rubro.colorRgb},0.22)` : `0 0 24px rgba(${rubro.colorRgb},0.16)`,
                        }}
                    >
                        <div className="min-w-0">
                            <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Resultado esperado</div>
                            <div className="mt-2 min-h-[3.9rem] break-words text-base font-semibold text-white">{rubro.mockResult}</div>
                        </div>
                        <div
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border"
                            style={{
                                borderColor: `rgba(${rubro.colorRgb},0.38)`,
                                background: `rgba(${rubro.colorRgb},0.16)`,
                                color: rubro.color,
                            }}
                        >
                            <ArrowUpRight className="size-4" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}

type NarrativeCardProps = {
    rubro: RubroData
    centerActivate: boolean
    desktopHoverEnabled: boolean
}

function ProblemNarrativeCard({ rubro, centerActivate, desktopHoverEnabled }: NarrativeCardProps) {
    const blockRef = useRef<HTMLDivElement>(null)
    const isCentered = useInView(blockRef, { margin: '-45% 0px -45% 0px', amount: 0.08 })
    const isActive = centerActivate && isCentered

    return (
        <motion.div
            ref={blockRef}
            initial={false}
            animate={centerActivate ? { x: isActive ? 3 : 0 } : undefined}
            whileHover={
                desktopHoverEnabled
                    ? {
                        x: 3,
                        borderColor: 'rgba(248,113,113,0.52)',
                        backgroundColor: 'rgba(248,113,113,0.14)',
                        boxShadow: '0 0 34px rgba(248,113,113,0.26)',
                    }
                    : {}
            }
            transition={{ duration: 0.08, ease: 'linear' }}
            className="rounded-[1.4rem] border border-red-400/15 bg-red-400/[0.05] p-5"
            style={{
                borderColor: isActive ? 'rgba(248,113,113,0.52)' : 'rgba(248,113,113,0.15)',
                backgroundColor: isActive ? 'rgba(248,113,113,0.14)' : 'rgba(248,113,113,0.05)',
                boxShadow: isActive ? '0 0 34px rgba(248,113,113,0.26)' : 'none',
            }}
        >
            <div className="text-[11px] uppercase tracking-[0.26em] text-red-300/75">El problema</div>
            <p
                className="mt-3 min-h-[6.6rem] break-words text-sm leading-7 md:min-h-[5.8rem] md:text-base"
                style={{ color: isActive ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.55)' }}
            >
                {rubro.problema}
            </p>
        </motion.div>
    )
}

function SolutionNarrativeCard({ rubro, centerActivate, desktopHoverEnabled }: NarrativeCardProps) {
    const blockRef = useRef<HTMLDivElement>(null)
    const isCentered = useInView(blockRef, { margin: '-45% 0px -45% 0px', amount: 0.08 })
    const isActive = centerActivate && isCentered

    return (
        <motion.div
            ref={blockRef}
            initial={false}
            animate={centerActivate ? { x: isActive ? 3 : 0 } : undefined}
            whileHover={
                desktopHoverEnabled
                    ? {
                        x: 3,
                        borderColor: `rgba(${rubro.colorRgb},0.52)`,
                        backgroundColor: `rgba(${rubro.colorRgb},0.14)`,
                        boxShadow: `0 0 34px rgba(${rubro.colorRgb},0.28)`,
                    }
                    : {}
            }
            transition={{ duration: 0.08, ease: 'linear' }}
            className="rounded-[1.4rem] border p-5"
            style={{
                borderColor: isActive ? `rgba(${rubro.colorRgb},0.52)` : `rgba(${rubro.colorRgb},0.2)`,
                background: isActive ? `rgba(${rubro.colorRgb},0.14)` : `rgba(${rubro.colorRgb},0.06)`,
                boxShadow: isActive ? `0 0 34px rgba(${rubro.colorRgb},0.28)` : 'none',
            }}
        >
            <div className="text-[11px] uppercase tracking-[0.26em]" style={{ color: rubro.color }}>
                La solución
            </div>
            <p
                className="mt-3 min-h-[6.6rem] break-words text-sm leading-7 md:min-h-[5.8rem] md:text-base"
                style={{ color: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.66)' }}
            >
                {rubro.solucion}
            </p>
        </motion.div>
    )
}

function ResultNarrativeCard({ rubro, centerActivate, desktopHoverEnabled }: NarrativeCardProps) {
    const blockRef = useRef<HTMLDivElement>(null)
    const isCentered = useInView(blockRef, { margin: '-45% 0px -45% 0px', amount: 0.08 })
    const isActive = centerActivate && isCentered

    return (
        <motion.div
            ref={blockRef}
            initial={false}
            animate={centerActivate ? { x: isActive ? 3 : 0 } : undefined}
            whileHover={
                desktopHoverEnabled
                    ? {
                        x: 3,
                        boxShadow: `0 0 34px rgba(${rubro.colorRgb},0.3)`,
                        borderColor: `rgba(${rubro.colorRgb},0.5)`,
                    }
                    : {}
            }
            transition={{ duration: 0.08, ease: 'linear' }}
            className="min-h-[4.9rem] rounded-[1.4rem] border px-5 py-4 text-sm font-semibold md:min-h-[4.3rem] md:text-base"
            style={{
                borderColor: isActive ? `rgba(${rubro.colorRgb},0.5)` : `rgba(${rubro.colorRgb},0.26)`,
                background: isActive
                    ? `linear-gradient(135deg, rgba(${rubro.colorRgb},0.24), rgba(${rubro.colorRgb},0.12))`
                    : `linear-gradient(135deg, rgba(${rubro.colorRgb},0.18), rgba(${rubro.colorRgb},0.08))`,
                color: rubro.color,
                boxShadow: isActive ? `0 0 34px rgba(${rubro.colorRgb},0.3)` : undefined,
            }}
        >
            <span className="break-words">{rubro.resultado}</span>
        </motion.div>
    )
}

export default function WebDevelopmentByRubro() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, amount: 0.1 })
    const prefersReduced = useReducedMotion()
    const [isTabletOrMobile, setIsTabletOrMobile] = useState(false)
    const [activeRubro, setActiveRubro] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [progress, setProgress] = useState(0)
    const [labelRipples, setLabelRipples] = useState<Array<{ id: number; rubroId: string; x: number; y: number; size: number }>>([])
    const rippleIdRef = useRef(0)
    const rubro = rubros[activeRubro]
    const Icon = rubro.icon
    const centerHoverByViewport = isTabletOrMobile
    const desktopHoverEnabled = !prefersReduced && !isTabletOrMobile
    const isAutoPaused = isPaused || prefersReduced

    useEffect(() => {
        if (typeof window === 'undefined') return

        const mediaQuery = window.matchMedia('(max-width: 1023px)')
        const syncViewport = () => setIsTabletOrMobile(mediaQuery.matches)
        syncViewport()

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', syncViewport)
            return () => mediaQuery.removeEventListener('change', syncViewport)
        }

        mediaQuery.addListener(syncViewport)
        return () => mediaQuery.removeListener(syncViewport)
    }, [])

    const pushLabelRipple = (event: React.MouseEvent<HTMLButtonElement>, rubroId: string) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height) * 1.3
        const x = event.clientX - rect.left - size / 2
        const y = event.clientY - rect.top - size / 2
        rippleIdRef.current += 1
        const id = rippleIdRef.current

        setLabelRipples((prev) => [...prev, { id, rubroId, x, y, size }])
        window.setTimeout(() => {
            setLabelRipples((prev) => prev.filter((ripple) => ripple.id !== id))
        }, 560)
    }

    useEffect(() => {
        if (isAutoPaused) return

        let elapsed = 0
        const timer = window.setInterval(() => {
            elapsed += PROGRESS_TICK_MS
            const next = Math.min(elapsed / AUTO_ROTATION_MS, 1)
            setProgress(next)

            if (next >= 1) {
                window.clearInterval(timer)
                setProgress(0)
                setActiveRubro((prev) => (prev + 1) % rubros.length)
            }
        }, PROGRESS_TICK_MS)

        return () => window.clearInterval(timer)
    }, [activeRubro, isAutoPaused])

    return (
        <section ref={sectionRef} className="relative overflow-hidden bg-[#020312] px-4 py-[clamp(80px,12vh,140px)]">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-7px); }
                }

                @keyframes rubroRipple {
                    0% {
                        transform: scale(0.15);
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 0;
                    }
                }
            `}</style>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(120% 84% at 50% 0%, rgba(34,211,238,0.15) 0%, rgba(2,3,18,0) 58%), radial-gradient(92% 76% at 82% 96%, rgba(139,92,246,0.14) 0%, rgba(2,3,18,0) 70%), linear-gradient(180deg, rgba(2,3,18,0.9) 0%, rgba(2,3,18,1) 100%)',
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.14]"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(118deg, rgba(148,163,184,0.09) 0 1px, transparent 1px 42px), repeating-linear-gradient(0deg, rgba(34,211,238,0.06) 0 1px, transparent 1px 54px)',
                    maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.82) 26%, transparent 88%)',
                }}
            />
            <motion.div
                aria-hidden="true"
                initial={false}
                animate={
                    prefersReduced
                        ? { opacity: 0.46, x: 0, y: 0, scale: 1 }
                        : { opacity: [0.32, 0.54, 0.36], x: [-18, 16, -14], y: [-14, 8, -8], scale: [1, 1.06, 0.98] }
                }
                transition={prefersReduced ? { duration: 0 } : { duration: 15, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                className="pointer-events-none absolute -left-24 top-[-8%] h-[34rem] w-[34rem] rounded-full blur-[120px]"
                style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.34) 0%, rgba(34,211,238,0.08) 44%, transparent 76%)' }}
            />
            <motion.div
                aria-hidden="true"
                initial={false}
                animate={
                    prefersReduced
                        ? { opacity: 0.4, x: 0, y: 0, scale: 1 }
                        : { opacity: [0.28, 0.46, 0.3], x: [12, -18, 10], y: [10, -16, 9], scale: [1.02, 0.95, 1.04] }
                }
                transition={prefersReduced ? { duration: 0 } : { duration: 18, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                className="pointer-events-none absolute -right-16 bottom-[-12%] h-[36rem] w-[36rem] rounded-full blur-[130px]"
                style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, rgba(167,139,250,0.08) 46%, transparent 76%)' }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-[8%] left-1/2 w-[34rem] -translate-x-1/2 blur-[86px]"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.12) 0%, rgba(34,211,238,0.04) 36%, transparent 72%)',
                    opacity: 0.74,
                }}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={`${rubro.id}-glow`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'linear' }}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-[8%] h-[34rem] w-[60rem] -translate-x-1/2 blur-[120px]"
                    style={{
                        background:
                            `radial-gradient(ellipse, rgba(34,211,238,0.15) 0%, rgba(${rubro.colorRgb},0.1) 34%, rgba(255,255,255,0.02) 48%, transparent 72%)`,
                    }}
                />
            </AnimatePresence>

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
                        className="pb-[0.06em] pr-[0.04em] text-[clamp(2.2rem,5vw,4.4rem)] font-black leading-[0.99] tracking-[-0.05em] text-white"
                    >
                        <span className="block">Una web que trabaja</span>
                        <span className="relative mt-1 block overflow-visible sm:inline-block sm:pr-2">
                            <motion.span
                                initial={prefersReduced ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0.92 }}
                                animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
                                transition={{ duration: prefersReduced ? 0 : 0.95, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
                                style={{ transformOrigin: 'left center' }}
                                className="block max-w-full whitespace-normal bg-gradient-to-r pb-3 from-white via-cyan-200 to-violet-200 bg-clip-text text-transparent sm:whitespace-nowrap"
                            >
                                {HEADLINE_ACCENT}
                            </motion.span>

                            {!prefersReduced && (
                                <motion.span
                                    aria-hidden="true"
                                    initial={{ left: '0%', opacity: 0 }}
                                    animate={
                                        isInView
                                            ? { left: '100%', opacity: [0, 1, 1, 0] }
                                            : {}
                                    }
                                    transition={{
                                        duration: 0.95,
                                        delay: 0.26,
                                        ease: [0.16, 1, 0.3, 1],
                                        times: [0, 0.08, 0.84, 1],
                                    }}
                                    className="pointer-events-none absolute inset-y-[12%] z-10 w-[2px] rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.9)]"
                                />
                            )}
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
                    className="mb-10 flex flex-wrap items-center gap-3"
                >
                    {rubros.map((item, index) => {
                        const ActiveIcon = item.icon
                        const isActive = index === activeRubro

                        return (
                            <motion.button
                                key={item.id}
                                onClick={(event) => {
                                    pushLabelRipple(event, item.id)
                                    setActiveRubro(index)
                                    setProgress(0)
                                }}
                                whileHover={
                                    prefersReduced
                                        ? {}
                                        : {
                                            y: -2,
                                            scale: 1.02,
                                            borderColor: `rgba(${item.colorRgb},0.4)`,
                                            backgroundColor: `rgba(${item.colorRgb},${isActive ? 0.2 : 0.12})`,
                                            color: item.color,
                                            boxShadow: `0 0 28px rgba(${item.colorRgb},0.24)`,
                                        }
                                }
                                whileTap={prefersReduced ? {} : { scale: 0.985 }}
                                transition={{ duration: 0.07, ease: 'linear' }}
                                className="relative inline-flex items-center gap-3 overflow-hidden rounded-full border px-4 py-3 text-sm font-semibold transition-[border-color,background-color,color,box-shadow] duration-100"
                                style={{
                                    borderColor: isActive ? `rgba(${item.colorRgb},0.38)` : 'rgba(255,255,255,0.09)',
                                    backgroundColor: isActive ? `rgba(${item.colorRgb},0.16)` : 'rgba(255,255,255,0.03)',
                                    color: isActive ? item.color : 'rgba(255,255,255,0.56)',
                                    boxShadow: isActive ? `0 0 30px rgba(${item.colorRgb},0.18)` : 'none',
                                }}
                            >
                                {labelRipples
                                    .filter((ripple) => ripple.rubroId === item.id)
                                    .map((ripple) => (
                                        <span
                                            key={ripple.id}
                                            className="pointer-events-none absolute rounded-full"
                                            style={{
                                                left: `${ripple.x}px`,
                                                top: `${ripple.y}px`,
                                                width: `${ripple.size}px`,
                                                height: `${ripple.size}px`,
                                                background: `radial-gradient(circle, rgba(${item.colorRgb},0.42) 0%, rgba(${item.colorRgb},0.18) 36%, rgba(${item.colorRgb},0) 72%)`,
                                                animation: 'rubroRipple 560ms cubic-bezier(0.16,1,0.3,1) forwards',
                                            }}
                                        />
                                    ))}

                                {isActive && (
                                    <span
                                        className="pointer-events-none absolute inset-y-0 left-0 rounded-full"
                                        style={{
                                            width: `${progress * 100}%`,
                                            background: `linear-gradient(90deg, rgba(${item.colorRgb},0.32), rgba(${item.colorRgb},0.08))`,
                                        }}
                                    />
                                )}

                                <span className="relative z-10 inline-flex items-center gap-3">
                                    <ActiveIcon className={`size-4 ${isActive ? 'animate-[float_2.7s_ease-in-out_infinite]' : ''}`} />
                                    {item.label}
                                </span>
                            </motion.button>
                        )
                    })}

                    <motion.button
                        onClick={() => {
                            if (prefersReduced) return
                            setIsPaused((prev) => !prev)
                            setProgress(0)
                        }}
                        whileHover={prefersReduced ? {} : { y: -2 }}
                        whileTap={prefersReduced ? {} : { scale: 0.98 }}
                        transition={{ duration: 0.07, ease: 'linear' }}
                        className="inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold"
                        style={{
                            borderColor: `rgba(${rubro.colorRgb},0.3)`,
                            background: `rgba(${rubro.colorRgb},0.12)`,
                            color: rubro.color,
                            boxShadow: `0 0 24px rgba(${rubro.colorRgb},0.14)`,
                        }}
                        aria-label={isAutoPaused ? 'Reanudar rotación de rubros' : 'Pausar rotación de rubros'}
                    >
                        {isAutoPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
                        {isAutoPaused ? 'Reanudar' : 'Pausar'}
                    </motion.button>
                </motion.div>

                <div className="relative mb-2 flex h-16 items-center overflow-visible md:h-0 md:mb-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`mobile-index-${activeRubro}`}
                            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.92 }}
                            animate={prefersReduced ? { opacity: 1 } : { opacity: 0.9, y: 0, scale: 1 }}
                            exit={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -8, scale: 1.04 }}
                            transition={{ duration: prefersReduced ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] }}
                            className="pointer-events-none absolute left-2 top-0 text-[clamp(4.5rem,18vw,6.5rem)] font-black leading-none text-transparent opacity-90 md:hidden"
                            style={{ WebkitTextStroke: `1.8px rgba(${rubro.colorRgb},0.2)` }}
                            aria-hidden="true"
                        >
                            0{activeRubro + 1}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={rubro.id}
                        variants={prefersReduced ? undefined : panelVariants}
                        initial={prefersReduced ? false : 'initial'}
                        animate={prefersReduced ? undefined : 'animate'}
                        exit={prefersReduced ? undefined : 'exit'}
                        className="relative grid min-h-[1860px] content-start items-start gap-8 sm:min-h-[1660px] md:min-h-0 lg:min-h-[760px] lg:grid-cols-[0.95fr_1.05fr] lg:gap-14"
                    >
                        <div
                            className="pointer-events-none absolute left-1/2 top-1/2 z-0 hidden -translate-x-1/2 -translate-y-1/2 text-[clamp(10rem,24vw,22rem)] font-black leading-none text-transparent opacity-80 md:block"
                            style={{ WebkitTextStroke: `1px rgba(${rubro.colorRgb},0.16)` }}
                            aria-hidden="true"
                        >
                            0{activeRubro + 1}
                        </div>

                        <motion.div variants={prefersReduced ? undefined : itemVariants} className="relative z-10">
                            <div className="relative z-10">
                                <motion.div
                                    variants={prefersReduced ? undefined : itemVariants}
                                    className="mb-5 inline-flex items-center gap-3 rounded-full border px-4 py-2 backdrop-blur-xl"
                                    style={{
                                        borderColor: `rgba(${rubro.colorRgb},0.24)`,
                                        background: `rgba(${rubro.colorRgb},0.12)`,
                                        boxShadow: `0 0 18px rgba(${rubro.colorRgb},0.14)`,
                                    }}
                                >
                                    <span style={{ color: rubro.color }}>
                                        <Icon className="size-4 animate-[float_2.7s_ease-in-out_infinite]" />
                                    </span>
                                    <span className="text-[11px] uppercase tracking-[0.28em]" style={{ color: rubro.color }}>
                                        {rubro.label}
                                    </span>
                                </motion.div>

                                <motion.h3
                                    variants={prefersReduced ? undefined : itemVariants}
                                    className="min-h-[10.75rem] max-w-xl text-[clamp(1.8rem,3.6vw,3.2rem)] font-black leading-[0.96] tracking-[-0.05em] text-white sm:min-h-[9.8rem] lg:min-h-[8.8rem]"
                                >
                                    {rubro.headline}
                                </motion.h3>

                                <motion.div variants={prefersReduced ? undefined : itemVariants} className="mt-8 space-y-4">
                                    <ProblemNarrativeCard
                                        rubro={rubro}
                                        centerActivate={centerHoverByViewport}
                                        desktopHoverEnabled={desktopHoverEnabled}
                                    />

                                    <SolutionNarrativeCard
                                        rubro={rubro}
                                        centerActivate={centerHoverByViewport}
                                        desktopHoverEnabled={desktopHoverEnabled}
                                    />

                                    <ResultNarrativeCard
                                        rubro={rubro}
                                        centerActivate={centerHoverByViewport}
                                        desktopHoverEnabled={desktopHoverEnabled}
                                    />
                                </motion.div>

                            </div>
                        </motion.div>

                        <motion.div variants={prefersReduced ? undefined : itemVariants} className="relative z-10 lg:h-full">
                            <RubroMockup rubro={rubro} prefersReduced={prefersReduced} centerActivate={centerHoverByViewport} />
                        </motion.div>
                    </motion.div>
                </AnimatePresence>

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : {}}
                    transition={{ duration: prefersReduced ? 0 : 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-16 h-px origin-left"
                    style={{
                        background: `linear-gradient(90deg, transparent, rgba(${rubro.colorRgb},0.24) 28%, rgba(${rubro.colorRgb},0.5) 50%, rgba(${rubro.colorRgb},0.24) 72%, transparent)`,
                    }}
                />
            </div>
        </section>
    )
}
