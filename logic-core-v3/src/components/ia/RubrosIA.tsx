'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react'
import {
    BadgeCheck,
    Bell,
    Building2,
    CalendarDays,
    CheckCircle2,
    FileCheck2,
    HeartPulse,
    MessageSquareText,
    Pause,
    Play,
    Search,
    ShieldAlert,
    Star,
    Store,
    Users,
    Utensils,
    type LucideIcon,
} from 'lucide-react'

interface Rubro {
    id: number
    slug: string
    icon: LucideIcon
    label: string
    color: string       // color dominante del rubro
    colorRgb: string    // "r,g,b" para rgba()
    gradient: string    // gradiente del rubro
}

interface Automation {
    icon: LucideIcon
    title: string
    description: string
    metric: string
}

interface MockupMessage {
    from: 'client' | 'ai'
    text: string
    delay: number  // ms para la animacion typewriter
}

interface RubroContent {
    headline: string      // ultima palabra se colorea
    headlineAccent: string
    subhead: string
    automations: Automation[]
    mockupMessages: MockupMessage[]
}

const rubros: Rubro[] = [
    {
        id: 0, slug: 'restaurante',
        icon: Utensils, label: 'Restaurante',
        color: '#34a853', colorRgb: '52,168,83',
        gradient: 'linear-gradient(135deg, #34a853, #2f9e57)',
    },
    {
        id: 1, slug: 'salud',
        icon: HeartPulse, label: 'Salud',
        color: '#22c55e', colorRgb: '34,197,94',
        gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    },
    {
        id: 2, slug: 'comercio',
        icon: Store, label: 'Comercio',
        color: '#34f5c5', colorRgb: '52,245,197',
        gradient: 'linear-gradient(135deg, #34f5c5, #128c7e)',
    },
    {
        id: 3, slug: 'inmobiliaria',
        icon: Building2, label: 'Inmobiliaria',
        color: '#2fbf7a', colorRgb: '22,163,74',
        gradient: 'linear-gradient(135deg, #2fbf7a, #0fbf73)',
    },
]

const rubroContent: Record<number, RubroContent> = {
    0: {
        headline: 'Tu restaurante llena mesas',
        headlineAccent: 'solo.',
        subhead: 'La IA gestiona reservas, responde WhatsApp y recuerda cumpleanos, sin que toques el celular a las 2AM.',
        automations: [
            {
                icon: CalendarDays, title: 'Reservas automaticas',
                description: 'Recibe y confirma por WhatsApp 24/7',
                metric: '\u2191 40% ocupacion'
            },
            {
                icon: Star, title: 'Respuesta a resenas',
                description: 'Google Reviews respondidas en 2 horas',
                metric: '\u2191 0.8 estrellas promedio'
            },
            {
                icon: BadgeCheck, title: 'Fidelizacion automatica',
                description: 'Descuentos en cumpleanos y fechas especiales',
                metric: '\u00D7 2 retorno de clientes'
            },
        ],
        mockupMessages: [
            { from: 'client', text: 'Tienen mesa para 4 el sabado a las 21?', delay: 0 },
            { from: 'ai', text: 'Claro. Tenemos disponibilidad. A que nombre reservo?', delay: 800 },
            { from: 'client', text: 'Garcia', delay: 1600 },
            { from: 'ai', text: 'Reserva confirmada: Garcia \u00B7 4 personas \u00B7 Sab 21hs. Te mando recordatorio el viernes.', delay: 2400 },
        ],
    },
    1: {
        headline: 'Tu consultorio sin',
        headlineAccent: 'caos.',
        subhead: 'La IA agenda turnos, manda recordatorios y filtra urgencias. Vos llegas a atender, no a administrar.',
        automations: [
            {
                icon: CalendarDays, title: 'Agenda inteligente',
                description: 'Gestiona turnos por WhatsApp sin secretaria',
                metric: '\u221260% ausencias'
            },
            {
                icon: Bell, title: 'Recordatorio de medicacion',
                description: 'Mensajes automaticos a pacientes cronicos',
                metric: '\u2191 adherencia al tratamiento'
            },
            {
                icon: ShieldAlert, title: 'Triaje de urgencias',
                description: 'Detecta sintomas urgentes y prioriza',
                metric: '0 urgencias perdidas'
            },
        ],
        mockupMessages: [
            { from: 'client', text: 'Necesito turno con la Dra. Lopez', delay: 0 },
            { from: 'ai', text: 'Es primera consulta o seguimiento?', delay: 800 },
            { from: 'client', text: 'Seguimiento', delay: 1500 },
            { from: 'ai', text: 'Perfecto. Hay lugar miercoles 10hs o jueves 17hs. Cual te viene mejor?', delay: 2300 },
        ],
    },
    2: {
        headline: 'Tu local vende aunque',
        headlineAccent: 'cierre.',
        subhead: 'La IA responde consultas de productos, toma pedidos y recupera carritos abandonados, a las 3AM si hace falta.',
        automations: [
            {
                icon: MessageSquareText, title: 'Catalogo interactivo',
                description: 'Stock, tallas y precios al instante',
                metric: '\u221280% consultas sin respuesta'
            },
            {
                icon: FileCheck2, title: 'Seguimiento de pedidos',
                description: 'El cliente sabe donde esta su compra',
                metric: '\u221270% llamadas de seguimiento'
            },
            {
                icon: CheckCircle2, title: 'Recuperacion de carritos',
                description: 'Mensaje automatico al comprador indeciso',
                metric: '\u2191 25% conversion'
            },
        ],
        mockupMessages: [
            { from: 'client', text: 'Tienen la campera negra en talle M?', delay: 0 },
            { from: 'ai', text: 'Si. Stock disponible en M y L. Precio: $45.000. Te reservo una?', delay: 800 },
            { from: 'client', text: 'Si, la reservo', delay: 1600 },
            { from: 'ai', text: 'Reservada. Te paso el link de pago o podes pasar hoy hasta las 20hs.', delay: 2400 },
        ],
    },
    3: {
        headline: 'Tu inmobiliaria trabaja',
        headlineAccent: 'de noche.',
        subhead: 'La IA califica leads, agenda visitas y matchea propiedades, filtrando curiosos de compradores reales.',
        automations: [
            {
                icon: Users, title: 'Calificacion de leads',
                description: 'Filtra intencion real antes de llegar a vos',
                metric: '\u00D7 3 leads calificados'
            },
            {
                icon: Search, title: 'Match de propiedades',
                description: 'Cruza el pedido con tu cartera al instante',
                metric: '\u221250% tiempo de busqueda'
            },
            {
                icon: CalendarDays, title: 'Coordinacion de visitas',
                description: 'Agenda sin llamadas cruzadas',
                metric: '\u2191 35% visitas realizadas'
            },
        ],
        mockupMessages: [
            { from: 'client', text: 'Busco depto 2 amb en Yerba Buena hasta $120k', delay: 0 },
            { from: 'ai', text: 'Tengo 3 opciones. Preferis planta baja o piso alto?', delay: 800 },
            { from: 'client', text: 'Piso alto con balcon', delay: 1500 },
            { from: 'ai', text: 'Perfecto, este te va a encantar. Podes visitar manana o el jueves?', delay: 2300 },
        ],
    },
}

const AUTO_ROTATION_MS = 5000
const BACKGROUND_PARTICLES = [
    { x: 12, y: 14, size: 3, duration: 5.2, delay: 0.1 },
    { x: 28, y: 62, size: 4, duration: 6.1, delay: 0.7 },
    { x: 43, y: 34, size: 2.8, duration: 4.9, delay: 1.1 },
    { x: 58, y: 78, size: 3.4, duration: 7.4, delay: 0.4 },
    { x: 74, y: 28, size: 2.6, duration: 5.8, delay: 1.5 },
    { x: 86, y: 68, size: 3.7, duration: 6.9, delay: 0.9 },
    { x: 21, y: 86, size: 3.1, duration: 5.4, delay: 1.8 },
    { x: 92, y: 16, size: 2.4, duration: 4.6, delay: 0.3 },
]

function Header({ isInView, reducedMotion }: { isInView: boolean, reducedMotion: boolean | null }) {
    const startOpacity = reducedMotion ? 1 : 0;
    const startY = reducedMotion ? 0 : -16;

    return (
        <div style={{ textAlign: 'center', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div
                initial={{ opacity: startOpacity, y: startY }}
                animate={(isInView || reducedMotion) ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0 }}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: '1px solid rgba(0,255,136,0.3)',
                    color: '#00ff88',
                    padding: '6px 16px',
                    borderRadius: '100px',
                    fontSize: '11px',
                    letterSpacing: '0.25em',
                    fontWeight: 600,
                    marginBottom: '24px',
                    background: 'rgba(0,255,136,0.14)'
                }}
            >
                [ IA APLICADA A TU RUBRO ]
            </motion.div>
            <motion.h2
                initial={{ opacity: startOpacity, y: startY }}
                animate={(isInView || reducedMotion) ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
                style={{
                    fontSize: 'clamp(30px,4vw,52px)',
                    fontWeight: 900,
                    color: '#ffffff',
                    margin: '0 0 16px 0',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                }}
            >
                Tu negocio, automatizado.
            </motion.h2>
            <motion.p
                initial={{ opacity: startOpacity, y: startY }}
                animate={(isInView || reducedMotion) ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.24 }}
                style={{
                    fontSize: '16px',
                    color: 'rgba(255,255,255,0.62)',
                    margin: 0
                }}
            >
                Elegi tu rubro y mira que hace la IA por vos.
            </motion.p>

            <motion.div
                initial={{ opacity: startOpacity, scale: reducedMotion ? 1 : 0.9 }}
                animate={(isInView || reducedMotion) ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(6,12,20,0.78)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    borderRadius: '100px',
                    padding: '8px 16px',
                    marginTop: '24px',
                    boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
                }}
            >
                <div style={{ display: 'flex' }}>
                    {['#00ff88', '#0fbf73', '#34a853'].map((c, i) => (
                        <div key={i} style={{
                            width: '24px', height: '24px',
                            borderRadius: '50%',
                            background: c,
                            border: '2px solid #080810',
                            marginLeft: i === 0 ? 0 : '-6px',
                            position: 'relative',
                            zIndex: 3 - i,
                        }} />
                    ))}
                </div>
                <span style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)',
                }}>
                    <strong style={{
                        color: 'white',
                        fontWeight: 700,
                    }}>+47 negocios</strong> ya automatizados en Tucuman
                </span>
            </motion.div>
        </div>
    )
}

function TabSelector({
    rubros,
    active,
    setActive,
    isInView,
    reducedMotion,
    progress,
    isAutoPaused,
    onToggleAuto,
}: {
    rubros: Rubro[]
    active: number
    setActive: (id: number) => void
    isInView: boolean
    reducedMotion: boolean | null
    progress: number
    isAutoPaused: boolean
    onToggleAuto: () => void
}) {
    const startOpacity = reducedMotion ? 1 : 0;
    const startY = reducedMotion ? 0 : 20;
    const activeRubro = rubros.find((item) => item.id === active) ?? rubros[0]

    return (
        <div className="mb-5 grid grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:items-center lg:justify-start lg:max-w-[760px]">
            {rubros.map((r, index) => {
                const isActive = active === r.id
                const bg = isActive
                    ? `linear-gradient(145deg, rgba(6,14,18,0.92), rgba(${r.colorRgb}, 0.24))`
                    : 'rgba(8,12,22,0.82)'
                const border = isActive ? `1px solid rgba(${r.colorRgb}, 0.52)` : '1px solid rgba(255,255,255,0.16)'
                const shadow = isActive ? `0 0 20px rgba(${r.colorRgb}, 0.2), 0 12px 28px rgba(0,0,0,0.35)` : '0 8px 20px rgba(0,0,0,0.28)'
                const color = isActive ? r.color : 'rgba(255,255,255,0.72)'
                const RubroIcon = r.icon

                return (
                    <motion.button
                        key={r.id}
                        initial={{ opacity: startOpacity, y: startY }}
                        animate={(isInView || reducedMotion) ? { opacity: 1, y: 0 } : {}}
                        transition={{
                            duration: 0.7,
                            delay: 0.25 + index * 0.07,
                            ease: [0.16, 1, 0.3, 1],
                            y: { duration: 0.06, ease: 'linear' },
                            backgroundColor: { duration: 0.06, ease: 'linear' },
                            borderColor: { duration: 0.06, ease: 'linear' },
                            boxShadow: { duration: 0.06, ease: 'linear' },
                            color: { duration: 0.06, ease: 'linear' },
                        }}
                        onClick={() => setActive(r.id)}
                        whileHover={
                            isActive
                                ? { y: -2 }
                                : {
                                    y: -2,
                                    backgroundColor: `rgba(${r.colorRgb}, 0.14)`,
                                    borderColor: `rgba(${r.colorRgb}, 0.4)`,
                                    boxShadow: `0 0 18px rgba(${r.colorRgb}, 0.16)`,
                                    color: r.color,
                                }
                        }
                        whileTap={{ scale: 0.97 }}
                        className="relative overflow-hidden"
                        style={{
                            background: bg,
                            border: border,
                            boxShadow: shadow,
                            borderRadius: '14px',
                            padding: 'clamp(14px,2vh,20px) clamp(16px,2vw,24px)',
                            cursor: 'default',
                            transition: 'background-color 60ms linear, border-color 60ms linear, box-shadow 60ms linear, transform 60ms linear, color 60ms linear',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: color,
                        }}
                    >
                        <span style={{
                            position: 'relative',
                            zIndex: 1,
                            width: '30px',
                            height: '30px',
                            borderRadius: '10px',
                            background: `rgba(${r.colorRgb}, 0.2)`,
                            border: `1px solid rgba(${r.colorRgb}, 0.34)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isActive ? r.color : 'rgba(255,255,255,0.75)',
                            transition: 'all 60ms linear',
                        }}>
                            <RubroIcon className="size-[15px]" />
                        </span>
                        <span style={{
                            position: 'relative',
                            zIndex: 1,
                            fontSize: '14px',
                            fontWeight: 700,
                            color: isActive ? r.color : 'inherit',
                            transition: 'color 60ms linear'
                        }}>
                            {r.label}
                        </span>

                        {isActive && (
                            <>
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: `${progress * 100}%`,
                                    background: `linear-gradient(90deg, rgba(${r.colorRgb},0.44), rgba(${r.colorRgb},0.14))`,
                                    borderRadius: 'inherit',
                                    pointerEvents: 'none'
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
                                    backgroundSize: '200% 100%',
                                    animation: 'shimmerTab 2s ease-in-out infinite',
                                    borderRadius: 'inherit',
                                    pointerEvents: 'none'
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '2px',
                                    background: r.gradient,
                                    borderRadius: '0 0 14px 14px'
                                }} />
                            </>
                        )}
                    </motion.button>
                )
            })}

            <motion.button
                initial={{ opacity: startOpacity, y: startY }}
                animate={(isInView || reducedMotion) ? { opacity: 1, y: 0 } : {}}
                transition={{
                    duration: 0.07,
                    delay: 0.56,
                    ease: 'linear',
                }}
                onClick={onToggleAuto}
                whileHover={reducedMotion ? {} : { y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold"
                style={{
                    borderColor: `rgba(${activeRubro.colorRgb},0.3)`,
                    background: `rgba(${activeRubro.colorRgb},0.2)`,
                    color: activeRubro.color,
                    boxShadow: `0 0 24px rgba(${activeRubro.colorRgb},0.14)`,
                    cursor: 'default',
                }}
                aria-label={isAutoPaused ? 'Reanudar rotacion de rubros' : 'Pausar rotacion de rubros'}
            >
                {isAutoPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
                {isAutoPaused ? 'Reanudar' : 'Pausar'}
            </motion.button>
        </div>
    )
}

function VisibleMessages({
    messages,
    rubro,
}: {
    messages: MockupMessage[]
    rubro: Rubro
}) {
    const [visible, setVisible] = useState<number[]>([])
    const [typing, setTyping] = useState(false)

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = []
        timers.push(setTimeout(() => {
            setVisible([])
            setTyping(false)
        }, 0))

        messages.forEach((msg, i) => {
            // Mostrar indicador "escribiendo..." antes de IA
            if (msg.from === 'ai') {
                timers.push(setTimeout(() => {
                    setTyping(true)
                }, msg.delay - 400))
            }

            timers.push(setTimeout(() => {
                setTyping(false)
                setVisible(prev => [...prev, i])
            }, msg.delay + 300))
        })

        return () => timers.forEach(clearTimeout)
    }, [messages])

    return (
        <>
            {messages.map((msg, i) => {
                if (!visible.includes(i)) return null
                const isAI = msg.from === 'ai'

                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            display: 'flex',
                            justifyContent: isAI ? 'flex-start' : 'flex-end',
                        }}
                    >
                        <div style={{
                            maxWidth: '78%',
                            padding: '10px 14px',
                            borderRadius: isAI
                                ? '4px 16px 16px 16px'
                                : '16px 4px 16px 16px',
                            fontSize: '13px',
                            lineHeight: 1.55,
                            background: isAI
                                ? `rgba(${rubro.colorRgb}, 0.22)`
                                : 'rgba(255,255,255,0.14)',
                            border: isAI
                                ? `1px solid rgba(${rubro.colorRgb}, 0.34)`
                                : '1px solid rgba(255,255,255,0.2)',
                            color: isAI ? 'white' : 'rgba(255,255,255,0.85)',
                        }}>
                            {msg.text}
                        </div>
                    </motion.div>
                )
            })}

            {/* Indicador "escribiendo..." */}
            {typing && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ display: 'flex', justifyContent: 'flex-start' }}
                >
                    <div style={{
                        padding: '10px 16px',
                        borderRadius: '4px 16px 16px 16px',
                        background: `rgba(${rubro.colorRgb}, 0.16)`,
                        border: `1px solid rgba(${rubro.colorRgb}, 0.26)`,
                        display: 'flex', gap: '4px', alignItems: 'center',
                    }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{
                                width: '6px', height: '6px',
                                borderRadius: '50%',
                                background: rubro.color,
                                animation: `typingDot 1.2s ${i * 0.2}s ease-in-out infinite`,
                            }} />
                        ))}
                    </div>
                </motion.div>
            )}
        </>
    )
}

export default function RubrosIA() {
    const [active, setActive] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [progress, setProgress] = useState(0)
    const [centerAutomationIdx, setCenterAutomationIdx] = useState<number | null>(null)
    const [isChatCentered, setIsChatCentered] = useState(false)
    const progressRef = useRef(0)
    const automationRefs = useRef<Array<HTMLDivElement | null>>([])
    const chatCardRef = useRef<HTMLDivElement | null>(null)
    const rubro = rubros[active]

    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, {
        once: true,
        amount: 0.15,
    })
    const reducedMotion = useReducedMotion()
    const isAutoPaused = isPaused || Boolean(reducedMotion)

    useEffect(() => {
        if (isAutoPaused || !isInView) return

        let rafId = 0
        const start = performance.now() - progressRef.current * AUTO_ROTATION_MS

        const tick = (now: number) => {
            const elapsed = now - start
            const next = Math.min(elapsed / AUTO_ROTATION_MS, 1)
            progressRef.current = next
            setProgress(next)

            if (next >= 1) {
                progressRef.current = 0
                setProgress(0)
                setActive((prev) => (prev + 1) % rubros.length)
                return
            }

            rafId = window.requestAnimationFrame(tick)
        }

        rafId = window.requestAnimationFrame(tick)
        return () => window.cancelAnimationFrame(rafId)
    }, [active, isAutoPaused, isInView])

    useEffect(() => {
        if (typeof window === 'undefined' || !isInView) return

        let rafId = 0
        const isTouchOrTablet = () => window.innerWidth <= 1024

        const updateCenterFocus = () => {
            if (!isTouchOrTablet()) {
                setCenterAutomationIdx((prev) => (prev === null ? prev : null))
                setIsChatCentered(false)
                return
            }

            const viewportCenterY = window.innerHeight / 2
            let nextAutomationIdx: number | null = null
            let bestDistance = Number.POSITIVE_INFINITY

            automationRefs.current.forEach((el, idx) => {
                if (!el) return
                const rect = el.getBoundingClientRect()
                if (rect.bottom < 0 || rect.top > window.innerHeight) return
                const centerY = rect.top + rect.height / 2
                const distance = Math.abs(centerY - viewportCenterY)

                if (distance < bestDistance) {
                    bestDistance = distance
                    nextAutomationIdx = idx
                }
            })

            if (nextAutomationIdx !== null && bestDistance < window.innerHeight * 0.34) {
                setCenterAutomationIdx((prev) => (prev === nextAutomationIdx ? prev : nextAutomationIdx))
            } else {
                setCenterAutomationIdx((prev) => (prev === null ? prev : null))
            }

            const chatEl = chatCardRef.current
            if (!chatEl) {
                setIsChatCentered(false)
                return
            }

            const chatRect = chatEl.getBoundingClientRect()
            const chatVisible = !(chatRect.bottom < 0 || chatRect.top > window.innerHeight)
            if (!chatVisible) {
                setIsChatCentered(false)
                return
            }

            const chatCenterY = chatRect.top + chatRect.height / 2
            const chatDistance = Math.abs(chatCenterY - viewportCenterY)
            setIsChatCentered(chatDistance < window.innerHeight * 0.32)
        }

        const scheduleUpdate = () => {
            cancelAnimationFrame(rafId)
            rafId = requestAnimationFrame(updateCenterFocus)
        }

        scheduleUpdate()
        window.addEventListener('scroll', scheduleUpdate, { passive: true })
        window.addEventListener('resize', scheduleUpdate)
        window.addEventListener('orientationchange', scheduleUpdate)

        return () => {
            cancelAnimationFrame(rafId)
            window.removeEventListener('scroll', scheduleUpdate)
            window.removeEventListener('resize', scheduleUpdate)
            window.removeEventListener('orientationchange', scheduleUpdate)
        }
    }, [active, isInView])

    return (
        <section
            id="casos"
            ref={sectionRef}
            style={{
                padding: 'clamp(72px,11vh,128px) clamp(20px,5vw,80px) clamp(44px,7vh,76px)',
                background: 'transparent',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '100svh',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            {/* PartÃ­culas decorativas de fondo */}
            {BACKGROUND_PARTICLES.map((p, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    left: `${p.x}%`, top: `${p.y}%`,
                    width: `${p.size}px`, height: `${p.size}px`,
                    borderRadius: '50%',
                    background: `rgba(${rubro.colorRgb}, 0.26)`,
                    boxShadow: `0 0 ${p.size * 3}px rgba(${rubro.colorRgb}, 0.18)`,
                    animation: reducedMotion ? 'none' : `floatParticle ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
                    transition: 'background 600ms, box-shadow 600ms',
                    pointerEvents: 'none',
                    zIndex: 0,
                }} />
            ))}

            {/* Glow ambiental â€” color del rubro activo */}
            <div style={{
                position: 'absolute',
                top: '-100px', left: '50%',
                transform: 'translateX(-50%)',
                width: '700px', height: '400px',
                background: `radial-gradient(ellipse, rgba(${rubro.colorRgb},0.08) 0%, transparent 65%)`,
                filter: 'blur(80px)',
                pointerEvents: 'none',
                transition: 'background 600ms ease',
                zIndex: 0,
            }} />
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: '6% 3%',
                    borderRadius: '28px',
                    background: 'linear-gradient(180deg, rgba(4,9,18,0.72) 0%, rgba(4,9,18,0.52) 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 22px 60px rgba(0,0,0,0.35)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />

            <div style={{
                position: 'relative', zIndex: 1,
                maxWidth: '1200px', margin: '0 auto', width: '100%'
            }}>
                <Header isInView={isInView} reducedMotion={reducedMotion} />
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-[clamp(18px,2.6vw,36px)] items-start">
                    <div>
                        <TabSelector
                            rubros={rubros}
                            active={active}
                            setActive={(id) => {
                                setActive(id)
                                progressRef.current = 0
                                setProgress(0)
                            }}
                            isInView={isInView}
                            reducedMotion={reducedMotion}
                            progress={progress}
                            isAutoPaused={isAutoPaused}
                            onToggleAuto={() => {
                                if (reducedMotion) return
                                setIsPaused((prev) => !prev)
                            }}
                        />

                    {/* â”€â”€ COLUMNA IZQUIERDA â”€â”€ */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {/* Headline */}
                            <h3 style={{
                                fontSize: 'clamp(24px, 3.1vw, 40px)',
                                fontWeight: 900,
                                lineHeight: 1.15,
                                color: 'white',
                                marginBottom: '10px',
                            }}>
                                {rubroContent[active].headline}{' '}
                                <span style={{ color: rubro.color }}>
                                    {rubroContent[active].headlineAccent}
                                </span>
                            </h3>

                            {/* Subhead */}
                            <p style={{
                                fontSize: 'clamp(14px, 1.5vw, 16px)',
                                color: 'rgba(255,255,255,0.66)',
                                lineHeight: 1.6,
                                marginBottom: 'clamp(16px, 2.3vh, 24px)',
                                maxWidth: '480px',
                            }}>
                                {rubroContent[active].subhead}
                            </p>

                            {/* Automation List */}
                            <div>
                                {rubroContent[active].automations.map((auto, i) => {
                                    const AutoIcon = auto.icon
                                    const isCenterActive = centerAutomationIdx === i

                                    return (
                                        <motion.div
                                        key={i}
                                        ref={(el) => {
                                            automationRefs.current[i] = el
                                        }}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={
                                            reducedMotion
                                                ? {}
                                                : {
                                                    y: -1,
                                                    x: 3,
                                                    backgroundColor: `rgba(${rubro.colorRgb}, 0.1)`,
                                                    borderColor: `rgba(${rubro.colorRgb}, 0.34)`,
                                                    boxShadow: `0 0 20px rgba(${rubro.colorRgb}, 0.16)`,
                                                }
                                        }
                                        transition={{
                                            duration: 0.5,
                                            delay: i * 0.09,
                                            ease: [0.16, 1, 0.3, 1],
                                            y: { duration: 0.06, ease: 'linear' },
                                            x: { duration: 0.06, ease: 'linear' },
                                            backgroundColor: { duration: 0.06, ease: 'linear' },
                                            borderColor: { duration: 0.06, ease: 'linear' },
                                            boxShadow: { duration: 0.06, ease: 'linear' },
                                        }}
                                        style={{
                                            display: 'flex',
                                            gap: '14px',
                                            alignItems: 'flex-start',
                                            padding: '12px 12px',
                                            border: isCenterActive
                                                ? `1px solid rgba(${rubro.colorRgb}, 0.34)`
                                                : '1px solid rgba(255,255,255,0.16)',
                                            borderRadius: '14px',
                                            background: isCenterActive
                                                ? `rgba(${rubro.colorRgb}, 0.1)`
                                                : 'rgba(8,12,22,0.84)',
                                            position: 'relative',
                                            marginBottom: '8px',
                                            boxShadow: isCenterActive
                                                ? `0 0 20px rgba(${rubro.colorRgb}, 0.16)`
                                                : '0 10px 22px rgba(0,0,0,0.28)',
                                        }}
                                    >
                                        {/* Ãcono */}
                                        <div style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '10px',
                                            background: `rgba(${rubro.colorRgb}, 0.2)`,
                                            border: `1px solid rgba(${rubro.colorRgb}, 0.34)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: rubro.color,
                                            flexShrink: 0,
                                        }}>
                                            <AutoIcon className="size-[17px]" />
                                        </div>

                                        {/* Texto */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                gap: '8px',
                                                marginBottom: '4px',
                                            }}>
                                                <span style={{
                                                    fontSize: '14px',
                                                    fontWeight: 700,
                                                    color: 'white',
                                                }}>
                                                    {auto.title}
                                                </span>

                                                {/* Metric pill */}
                                                <span style={{
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    background: `rgba(${rubro.colorRgb}, 0.22)`,
                                                    color: rubro.color,
                                                    border: `1px solid rgba(${rubro.colorRgb}, 0.38)`,
                                                    borderRadius: '100px',
                                                    padding: '3px 10px',
                                                    whiteSpace: 'nowrap',
                                                    flexShrink: 0,
                                                    transition: 'all 60ms linear',
                                                }}>
                                                    {auto.metric}
                                                </span>
                                            </div>

                                            <p style={{
                                                fontSize: '13px',
                                                color: isCenterActive ? 'rgba(220,252,231,0.9)' : 'rgba(255,255,255,0.66)',
                                                margin: 0,
                                                lineHeight: 1.5,
                                            }}>
                                                {auto.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                    </div>

                    {/* â”€â”€ COLUMNA DERECHA (Prompt 3) â”€â”€ */}
                    <div className="lg:pt-[2px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active}
                            ref={chatCardRef}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            whileHover={
                                reducedMotion
                                    ? {}
                                    : {
                                        y: -2,
                                        borderColor: `rgba(${rubro.colorRgb}, 0.28)`,
                                        boxShadow: `0 0 70px rgba(${rubro.colorRgb}, 0.12), 0 24px 64px rgba(0,0,0,0.5)`,
                                        transition: { duration: 0.07, ease: 'linear' },
                                    }
                            }
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                background: 'rgba(8,12,22,0.9)',
                                border: isChatCentered
                                    ? `1px solid rgba(${rubro.colorRgb}, 0.28)`
                                    : '1px solid rgba(255,255,255,0.16)',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                width: '100%',
                                maxWidth: '420px',
                                margin: '0 auto',
                                height: 'clamp(440px, 64vh, 620px)',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: isChatCentered
                                    ? `0 0 70px rgba(${rubro.colorRgb}, 0.12), 0 24px 64px rgba(0,0,0,0.5)`
                                    : `0 0 60px rgba(${rubro.colorRgb}, 0.08), 0 24px 64px rgba(0,0,0,0.5)`,
                                transition: 'all 70ms linear',
                            }}
                        >
                            {/* Header del chat */}
                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                borderBottom: '1px solid rgba(255,255,255,0.12)',
                                padding: '14px 18px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}>
                                {/* Avatar IA */}
                                <div style={{
                                    width: '36px', height: '36px',
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, rgba(${rubro.colorRgb},0.8), rgba(0,255,136,0.6))`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    letterSpacing: '0.08em',
                                    color: '#04130b',
                                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                                    flexShrink: 0,
                                }}>
                                    AI
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: '13px', fontWeight: 700,
                                        color: 'white', margin: 0,
                                    }}>
                                        Asistente IA · DevelOP
                                    </p>
                                    <p style={{
                                        fontSize: '11px', margin: 0,
                                        color: rubro.color,
                                    }}>
                                        {'\u25CF'} En linea ahora
                                    </p>
                                </div>
                            </div>

                            {/* Area de mensajes */}
                            <div style={{
                                padding: '16px',
                                flex: 1,
                                minHeight: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                gap: '10px',
                                overflow: 'hidden',
                            }}>
                                <VisibleMessages
                                    messages={rubroContent[active].mockupMessages}
                                    rubro={rubro}
                                />
                            </div>

                            {/* Input fake */}
                            <div style={{
                                borderTop: '1px solid rgba(255,255,255,0.12)',
                                padding: '12px 16px',
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'center',
                            }}>
                                <div style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.12)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '100px',
                                    padding: '10px 16px',
                                    fontSize: '12px',
                                    color: 'rgba(255,255,255,0.45)',
                                }}>
                                    Escribi tu mensaje...
                                </div>
                                <div style={{
                                    width: '36px', height: '36px',
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${rubro.color}, rgba(${rubro.colorRgb},0.6))`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'default',
                                }}>
                                    {'\u2191'}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                    </div>
                </div>

                {/* Linea decorativa inferior */}
                <motion.div
                    initial={{ scaleX: reducedMotion ? 1 : 0 }}
                    animate={(isInView || reducedMotion) ? { scaleX: 1 } : {}}
                    transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        height: '1px',
                        background: `linear-gradient(90deg, transparent, rgba(${rubro.colorRgb}, 0.4), transparent)`,
                        transformOrigin: 'left center',
                        marginTop: 'clamp(18px, 2.6vh, 28px)',
                        transition: 'background 600ms ease',
                    }}
                />
            </div>

            <style>{`
                @keyframes typingDot {
                    0%, 100% { opacity: 0.3; transform: translateY(0); }
                    50% { opacity: 1; transform: translateY(-3px); }
                }
                @keyframes shimmerTab {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                @keyframes floatParticle {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(8px, -12px); }
                }
            `}</style>
        </section>
    )
}

