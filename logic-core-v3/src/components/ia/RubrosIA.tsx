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
        icon: '\u{1F37D}', label: 'Restaurante',
        color: '#34a853', colorRgb: '52,168,83',
        gradient: 'linear-gradient(135deg, #34a853, #2f9e57)',
    },
    {
        id: 1, slug: 'salud',
        icon: '\u{1F3E5}', label: 'Salud',
        color: '#22c55e', colorRgb: '34,197,94',
        gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    },
    {
        id: 2, slug: 'comercio',
        icon: '\u{1F3EA}', label: 'Comercio',
        color: '#34f5c5', colorRgb: '52,245,197',
        gradient: 'linear-gradient(135deg, #34f5c5, #128c7e)',
    },
    {
        id: 3, slug: 'inmobiliaria',
        icon: '\u{1F3E0}', label: 'Inmobiliaria',
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
                icon: '\u{1F4C5}', title: 'Reservas automaticas',
                description: 'Recibe y confirma por WhatsApp 24/7',
                metric: '\u2191 40% ocupacion'
            },
            {
                icon: '\u2B50', title: 'Respuesta a resenas',
                description: 'Google Reviews respondidas en 2 horas',
                metric: '\u2191 0.8 estrellas promedio'
            },
            {
                icon: '\u{1F382}', title: 'Fidelizacion automatica',
                description: 'Descuentos en cumpleanos y fechas especiales',
                metric: '\u00D7 2 retorno de clientes'
            },
        ],
        mockupMessages: [
            { from: 'client', text: 'Tienen mesa para 4 el sabado a las 21?', delay: 0 },
            { from: 'ai', text: 'Claro. Tenemos disponibilidad. A que nombre reservo?', delay: 800 },
            { from: 'client', text: 'Garcia', delay: 1600 },
            { from: 'ai', text: 'Reserva confirmada \u2713 Garcia \u00B7 4 personas \u00B7 Sab 21hs. Te mando recordatorio el viernes \u{1F37D}', delay: 2400 },
        ],
    },
    1: {
        headline: 'Tu consultorio sin',
        headlineAccent: 'caos.',
        subhead: 'La IA agenda turnos, manda recordatorios y filtra urgencias. Vos llegas a atender, no a administrar.',
        automations: [
            {
                icon: '\u{1F4CB}', title: 'Agenda inteligente',
                description: 'Gestiona turnos por WhatsApp sin secretaria',
                metric: '\u221260% ausencias'
            },
            {
                icon: '\u{1F48A}', title: 'Recordatorio de medicacion',
                description: 'Mensajes automaticos a pacientes cronicos',
                metric: '\u2191 adherencia al tratamiento'
            },
            {
                icon: '\u{1F6A8}', title: 'Triaje de urgencias',
                description: 'Detecta sintomas urgentes y prioriza',
                metric: '0 urgencias perdidas'
            },
        ],
        mockupMessages: [
            { from: 'client', text: 'Necesito turno con la Dra. Lopez', delay: 0 },
            { from: 'ai', text: 'Es primera consulta o seguimiento?', delay: 800 },
            { from: 'client', text: 'Seguimiento', delay: 1500 },
            { from: 'ai', text: 'Perfecto. Hay lugar miercoles 10hs o jueves 17hs. Cual te viene mejor? \u{1F4CB}', delay: 2300 },
        ],
    },
    2: {
        headline: 'Tu local vende aunque',
        headlineAccent: 'cierre.',
        subhead: 'La IA responde consultas de productos, toma pedidos y recupera carritos abandonados, a las 3AM si hace falta.',
        automations: [
            {
                icon: '\u{1F6D2}', title: 'Catalogo interactivo',
                description: 'Stock, tallas y precios al instante',
                metric: '\u221280% consultas sin respuesta'
            },
            {
                icon: '\u{1F4E6}', title: 'Seguimiento de pedidos',
                description: 'El cliente sabe donde esta su compra',
                metric: '\u221270% llamadas de seguimiento'
            },
            {
                icon: '\u{1F504}', title: 'Recuperacion de carritos',
                description: 'Mensaje automatico al comprador indeciso',
                metric: '\u2191 25% conversion'
            },
        ],
        mockupMessages: [
            { from: 'client', text: 'Tienen la campera negra en talle M?', delay: 0 },
            { from: 'ai', text: 'Si. Stock disponible en M y L. Precio: $45.000. Te reservo una?', delay: 800 },
            { from: 'client', text: 'Si, la reservo', delay: 1600 },
            { from: 'ai', text: 'Reservada \u2713 Te paso el link de pago o podes pasar hoy hasta las 20hs \u{1F4E6}', delay: 2400 },
        ],
    },
    3: {
        headline: 'Tu inmobiliaria trabaja',
        headlineAccent: 'de noche.',
        subhead: 'La IA califica leads, agenda visitas y matchea propiedades, filtrando curiosos de compradores reales.',
        automations: [
            {
                icon: '\u{1F50D}', title: 'Calificacion de leads',
                description: 'Filtra intencion real antes de llegar a vos',
                metric: '\u00D7 3 leads calificados'
            },
            {
                icon: '\u{1F3D8}', title: 'Match de propiedades',
                description: 'Cruza el pedido con tu cartera al instante',
                metric: '\u221250% tiempo de busqueda'
            },
            {
                icon: '\u{1F4C5}', title: 'Coordinacion de visitas',
                description: 'Agenda sin llamadas cruzadas',
                metric: '\u2191 35% visitas realizadas'
            },
        ],
        mockupMessages: [
            { from: 'client', text: 'Busco depto 2 amb en Yerba Buena hasta $120k', delay: 0 },
            { from: 'ai', text: 'Tengo 3 opciones. Preferis planta baja o piso alto?', delay: 800 },
            { from: 'client', text: 'Piso alto con balcon', delay: 1500 },
            { from: 'ai', text: 'Perfecto, este te va a encantar. Podes visitar manana o el jueves? \u{1F3E0}', delay: 2300 },
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
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '100px',
                    padding: '8px 16px',
                    marginTop: '24px',
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
                                    backgroundColor: `rgba(${r.colorRgb}, 0.09)`,
                                    borderColor: `rgba(${r.colorRgb}, 0.3)`,
                                    boxShadow: `0 0 18px rgba(${r.colorRgb}, 0.12)`,
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
                        <span style={{ fontSize: '26px' }}>{r.icon}</span>
                        <span style={{
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
            {/* PartÃ­culas decorativas de fondo */}
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
                                        {/* Ãcono */}
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

                    {/* â”€â”€ COLUMNA DERECHA (Prompt 3) â”€â”€ */}
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
                                width: '100%',
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
                                    {'\u{1F916}'}
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
                                height: '260px',
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

                {/* Linea decorativa inferior */}
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

