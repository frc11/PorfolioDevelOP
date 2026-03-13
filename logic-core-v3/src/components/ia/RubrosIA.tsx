'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react'

interface Rubro {
    id: number
    slug: string
    icon: string
    label: string
    color: string       // color dominante del rubro
    colorRgb: string    // "r,g,b" para rgba()
    gradient: string    // gradiente del rubro
}

interface Automation {
    icon: string
    title: string
    description: string
    metric: string
}

interface MockupMessage {
    from: 'client' | 'ai'
    text: string
    delay: number  // ms para la animación typewriter
}

interface RubroContent {
    headline: string      // última palabra se colorea
    headlineAccent: string
    subhead: string
    automations: Automation[]
    mockupMessages: MockupMessage[]
}

const rubros: Rubro[] = [
    {
        id: 0, slug: 'restaurante',
        icon: '🍽', label: 'Restaurante',
        color: '#f97316', colorRgb: '249,115,22',
        gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
    },
    {
        id: 1, slug: 'salud',
        icon: '🏥', label: 'Salud',
        color: '#22c55e', colorRgb: '34,197,94',
        gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    },
    {
        id: 2, slug: 'comercio',
        icon: '🏪', label: 'Comercio',
        color: '#00e5ff', colorRgb: '0,229,255',
        gradient: 'linear-gradient(135deg, #00e5ff, #0891b2)',
    },
    {
        id: 3, slug: 'inmobiliaria',
        icon: '🏠', label: 'Inmobiliaria',
        color: '#a855f7', colorRgb: '168,85,247',
        gradient: 'linear-gradient(135deg, #a855f7, #7b2fff)',
    },
]

const rubroContent: Record<number, RubroContent> = {
    0: {
        headline: 'Tu restaurante llena mesas',
        headlineAccent: 'solo.',
        subhead: 'La IA gestiona reservas, responde WhatsApp y recuerda cumpleaños — sin que toques el celular a las 2AM.',
        automations: [
            {
                icon: '📅', title: 'Reservas automáticas',
                description: 'Recibe y confirma por WhatsApp 24/7',
                metric: '↑ 40% ocupación'
            },
            {
                icon: '⭐', title: 'Respuesta a reseñas',
                description: 'Google Reviews respondidas en 2 horas',
                metric: '↑ 0.8 estrellas promedio'
            },
            {
                icon: '🎂', title: 'Fidelización automática',
                description: 'Descuentos en cumpleaños y fechas especiales',
                metric: '× 2 retorno de clientes'
            },
        ],
        mockupMessages: [
            { from: 'client', text: '¿Tienen mesa para 4 el sábado a las 21?', delay: 0 },
            { from: 'ai', text: '¡Claro! Tenemos disponibilidad. ¿A qué nombre reservo?', delay: 800 },
            { from: 'client', text: 'García', delay: 1600 },
            { from: 'ai', text: 'Reserva confirmada ✓ García · 4 personas · Sáb 21hs. Te mando recordatorio el viernes 🍽', delay: 2400 },
        ],
    },
    1: {
        headline: 'Tu consultorio sin',
        headlineAccent: 'caos.',
        subhead: 'La IA agenda turnos, manda recordatorios y filtra urgencias — vos llegás a atender, no a administrar.',
        automations: [
            {
                icon: '📋', title: 'Agenda inteligente',
                description: 'Gestiona turnos por WhatsApp sin secretaria',
                metric: '−60% ausencias'
            },
            {
                icon: '💊', title: 'Recordatorio de medicación',
                description: 'Mensajes automáticos a pacientes crónicos',
                metric: '↑ adherencia al tratamiento'
            },
            {
                icon: '🚨', title: 'Triaje de urgencias',
                description: 'Detecta síntomas urgentes y prioriza',
                metric: '0 urgencias perdidas'
            },
        ],
        mockupMessages: [
            { from: 'client', text: 'Necesito turno con la Dra. López', delay: 0 },
            { from: 'ai', text: '¿Es primera consulta o seguimiento?', delay: 800 },
            { from: 'client', text: 'Seguimiento', delay: 1500 },
            { from: 'ai', text: 'Perfecto. Hay lugar miércoles 10hs o jueves 17hs. ¿Cuál te viene mejor? 📋', delay: 2300 },
        ],
    },
    2: {
        headline: 'Tu local vende aunque',
        headlineAccent: 'cierre.',
        subhead: 'La IA responde consultas de productos, toma pedidos y recupera carritos abandonados — a las 3AM si hace falta.',
        automations: [
            {
                icon: '🛒', title: 'Catálogo interactivo',
                description: 'Stock, tallas y precios al instante',
                metric: '−80% consultas sin respuesta'
            },
            {
                icon: '📦', title: 'Seguimiento de pedidos',
                description: 'El cliente sabe dónde está su compra',
                metric: '−70% llamadas de seguimiento'
            },
            {
                icon: '🔄', title: 'Recuperación de carritos',
                description: 'Mensaje automático al comprador indeciso',
                metric: '↑ 25% conversión'
            },
        ],
        mockupMessages: [
            { from: 'client', text: '¿Tienen la campera negra en talle M?', delay: 0 },
            { from: 'ai', text: '¡Sí! Stock disponible en M y L. Precio: $45.000. ¿Te reservo una?', delay: 800 },
            { from: 'client', text: 'Sí, la reservo', delay: 1600 },
            { from: 'ai', text: 'Reservada ✓ Te paso el link de pago o podés pasar hoy hasta las 20hs 📦', delay: 2400 },
        ],
    },
    3: {
        headline: 'Tu inmobiliaria trabaja',
        headlineAccent: 'de noche.',
        subhead: 'La IA califica leads, agenda visitas y matchea propiedades — filtrando curiosos de compradores reales.',
        automations: [
            {
                icon: '🔍', title: 'Calificación de leads',
                description: 'Filtra intención real antes de llegar a vos',
                metric: '× 3 leads calificados'
            },
            {
                icon: '🏘', title: 'Match de propiedades',
                description: 'Cruza el pedido con tu cartera al instante',
                metric: '−50% tiempo de búsqueda'
            },
            {
                icon: '📅', title: 'Coordinación de visitas',
                description: 'Agenda sin llamadas cruzadas',
                metric: '↑ 35% visitas realizadas'
            },
        ],
        mockupMessages: [
            { from: 'client', text: 'Busco depto 2 amb en Yerba Buena hasta $120k', delay: 0 },
            { from: 'ai', text: 'Tengo 3 opciones. ¿Preferís planta baja o piso alto?', delay: 800 },
            { from: 'client', text: 'Piso alto con balcón', delay: 1500 },
            { from: 'ai', text: 'Perfecto, este te va a encantar. ¿Podés visitar mañana o el jueves? 🏠', delay: 2300 },
        ],
    },
}

function Header({ isInView, reducedMotion }: { isInView: boolean, reducedMotion: boolean | null }) {
    const startOpacity = reducedMotion ? 1 : 0;
    const startY = reducedMotion ? 0 : -16;

    return (
        <div style={{ textAlign: 'center', marginBottom: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                    background: 'rgba(0,255,136,0.06)'
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
                    color: 'rgba(255,255,255,0.4)',
                    margin: 0
                }}
            >
                Elegí tu rubro y mirá qué hace la IA por vos.
            </motion.p>

            <motion.div
                initial={{ opacity: startOpacity, scale: reducedMotion ? 1 : 0.9 }}
                animate={(isInView || reducedMotion) ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '100px',
                    padding: '8px 16px',
                    marginTop: '24px',
                }}
            >
                <div style={{ display: 'flex' }}>
                    {['#00ff88', '#7b2fff', '#f97316'].map((c, i) => (
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
                    }}>+47 negocios</strong> ya automatizados en Tucumán
                </span>
            </motion.div>
        </div>
    )
}

function TabSelector({ rubros, active, setActive, isInView, reducedMotion }: { rubros: Rubro[], active: number, setActive: (id: number) => void, isInView: boolean, reducedMotion: boolean | null }) {
    const startOpacity = reducedMotion ? 1 : 0;
    const startY = reducedMotion ? 0 : 20;

    return (
        <div className="grid grid-cols-2 lg:flex lg:flex-row justify-center gap-4 mb-20">
            {rubros.map((r, index) => {
                const isActive = active === r.id
                const bg = isActive ? `rgba(${r.colorRgb}, 0.12)` : 'rgba(255,255,255,0.03)'
                const border = isActive ? `1px solid rgba(${r.colorRgb}, 0.4)` : '1px solid rgba(255,255,255,0.08)'
                const shadow = isActive ? `0 0 20px rgba(${r.colorRgb}, 0.15)` : 'none'
                const color = isActive ? r.color : 'rgba(255,255,255,0.4)'

                return (
                    <motion.button
                        key={r.id}
                        initial={{ opacity: startOpacity, y: startY }}
                        animate={(isInView || reducedMotion) ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.25 + index * 0.07, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => setActive(r.id)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="relative overflow-hidden"
                        style={{
                            background: bg,
                            border: border,
                            boxShadow: shadow,
                            borderRadius: '14px',
                            padding: 'clamp(14px,2vh,20px) clamp(16px,2vw,24px)',
                            cursor: 'pointer',
                            transition: 'all 250ms ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <span style={{ fontSize: '26px' }}>{r.icon}</span>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: color,
                            transition: 'color 250ms'
                        }}>
                            {r.label}
                        </span>

                        {isActive && (
                            <>
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
        // Reset al cambiar rubro
        setVisible([])
        setTyping(false)

        const timers: ReturnType<typeof setTimeout>[] = []

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                                ? `rgba(${rubro.colorRgb}, 0.12)`
                                : 'rgba(255,255,255,0.08)',
                            border: isAI
                                ? `1px solid rgba(${rubro.colorRgb}, 0.2)`
                                : '1px solid rgba(255,255,255,0.1)',
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
                        background: `rgba(${rubro.colorRgb}, 0.08)`,
                        border: `1px solid rgba(${rubro.colorRgb}, 0.15)`,
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
    const rubro = rubros[active]

    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, {
        once: true,
        amount: 0.15,
    })
    const reducedMotion = useReducedMotion()

    const particles = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 4 + Math.random() * 4,
        delay: Math.random() * 3,
    })), [])

    return (
        <section
            id="casos"
            ref={sectionRef}
            style={{
                padding: 'clamp(80px,12vh,140px) clamp(20px,5vw,80px)',
                background: '#080810',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Partículas decorativas de fondo */}
            {particles.map((p, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    left: `${p.x}%`, top: `${p.y}%`,
                    width: `${p.size}px`, height: `${p.size}px`,
                    borderRadius: '50%',
                    background: `rgba(${rubro.colorRgb}, 0.4)`,
                    boxShadow: `0 0 ${p.size * 3}px rgba(${rubro.colorRgb}, 0.3)`,
                    animation: reducedMotion ? 'none' : `floatParticle ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
                    transition: 'background 600ms, box-shadow 600ms',
                    pointerEvents: 'none',
                    zIndex: 0,
                }} />
            ))}

            {/* Glow ambiental — color del rubro activo */}
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

            <div style={{
                position: 'relative', zIndex: 1,
                maxWidth: '1200px', margin: '0 auto'
            }}>
                <Header isInView={isInView} reducedMotion={reducedMotion} />
                <TabSelector
                    rubros={rubros}
                    active={active}
                    setActive={setActive}
                    isInView={isInView}
                    reducedMotion={reducedMotion}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[clamp(32px,4vw,60px)] mt-[clamp(32px,4vh,52px)] items-start">
                    {/* ── COLUMNA IZQUIERDA ── */}
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
                                fontSize: 'clamp(26px, 3.5vw, 44px)',
                                fontWeight: 900,
                                lineHeight: 1.15,
                                color: 'white',
                                marginBottom: '14px',
                            }}>
                                {rubroContent[active].headline}{' '}
                                <span style={{ color: rubro.color }}>
                                    {rubroContent[active].headlineAccent}
                                </span>
                            </h3>

                            {/* Subhead */}
                            <p style={{
                                fontSize: 'clamp(14px, 1.5vw, 16px)',
                                color: 'rgba(255,255,255,0.45)',
                                lineHeight: 1.7,
                                marginBottom: 'clamp(24px, 3vh, 36px)',
                                maxWidth: '480px',
                            }}>
                                {rubroContent[active].subhead}
                            </p>

                            {/* Automation List */}
                            <div>
                                {rubroContent[active].automations.map((auto, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: i * 0.09,
                                            ease: [0.16, 1, 0.3, 1]
                                        }}
                                        style={{
                                            display: 'flex',
                                            gap: '14px',
                                            alignItems: 'flex-start',
                                            padding: '16px 0',
                                            borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                            position: 'relative',
                                        }}
                                    >
                                        {/* Ícono */}
                                        <div style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '10px',
                                            background: `rgba(${rubro.colorRgb}, 0.12)`,
                                            border: `1px solid rgba(${rubro.colorRgb}, 0.22)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '20px',
                                            flexShrink: 0,
                                        }}>
                                            {auto.icon}
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
                                                    background: `rgba(${rubro.colorRgb}, 0.12)`,
                                                    color: rubro.color,
                                                    border: `1px solid rgba(${rubro.colorRgb}, 0.25)`,
                                                    borderRadius: '100px',
                                                    padding: '3px 10px',
                                                    whiteSpace: 'nowrap',
                                                    flexShrink: 0,
                                                }}>
                                                    {auto.metric}
                                                </span>
                                            </div>

                                            <p style={{
                                                fontSize: '13px',
                                                color: 'rgba(255,255,255,0.4)',
                                                margin: 0,
                                                lineHeight: 1.5,
                                            }}>
                                                {auto.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* ── COLUMNA DERECHA (Prompt 3) ── */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                maxWidth: '380px',
                                margin: '0 auto',
                                boxShadow: `0 0 60px rgba(${rubro.colorRgb}, 0.08), 0 24px 64px rgba(0,0,0,0.5)`,
                            }}
                        >
                            {/* Header del chat */}
                            <div style={{
                                background: 'rgba(255,255,255,0.04)',
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
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
                                    fontSize: '16px',
                                    flexShrink: 0,
                                }}>
                                    🤖
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
                                        ● En línea ahora
                                    </p>
                                </div>
                            </div>

                            {/* Área de mensajes */}
                            <div style={{
                                padding: '16px',
                                minHeight: '260px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                            }}>
                                <VisibleMessages
                                    messages={rubroContent[active].mockupMessages}
                                    rubro={rubro}
                                />
                            </div>

                            {/* Input fake */}
                            <div style={{
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                padding: '12px 16px',
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'center',
                            }}>
                                <div style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '100px',
                                    padding: '10px 16px',
                                    fontSize: '12px',
                                    color: 'rgba(255,255,255,0.2)',
                                }}>
                                    Escribí tu mensaje...
                                </div>
                                <div style={{
                                    width: '36px', height: '36px',
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${rubro.color}, rgba(${rubro.colorRgb},0.6))`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                }}>
                                    ↑
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* LÍNEA DECORATIVA INFERIOR */}
                <motion.div
                    initial={{ scaleX: reducedMotion ? 1 : 0 }}
                    animate={(isInView || reducedMotion) ? { scaleX: 1 } : {}}
                    transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        height: '1px',
                        background: `linear-gradient(90deg, transparent, rgba(${rubro.colorRgb}, 0.4), transparent)`,
                        transformOrigin: 'left center',
                        marginTop: 'clamp(48px, 6vh, 72px)',
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
