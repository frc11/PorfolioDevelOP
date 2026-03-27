'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    AnimatePresence,
    motion,
    useAnimationFrame,
    useInView,
    useMotionValue,
    useReducedMotion,
    useSpring,
} from 'framer-motion'

interface IntegrationItem {
    id: string
    name: string
    mark: string
    color: string
    colorRgb: string
    description: string
}

const INTEGRATIONS: IntegrationItem[] = [
    {
        id: 'n8n',
        name: 'n8n',
        mark: '⚡',
        color: '#f97316',
        colorRgb: '249,115,22',
        description: 'Automatización de flujos',
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        mark: '💬',
        color: '#25d366',
        colorRgb: '37,211,102',
        description: 'Mensajería instantánea',
    },
    {
        id: 'mercadopago',
        name: 'Mercado Pago',
        mark: '💳',
        color: '#00b1ea',
        colorRgb: '0,177,234',
        description: 'Cobros y pagos online',
    },
    {
        id: 'gmail',
        name: 'Gmail',
        mark: '✉️',
        color: '#ea4335',
        colorRgb: '234,67,53',
        description: 'Correo y notificaciones',
    },
    {
        id: 'sheets',
        name: 'Google Sheets',
        mark: '📊',
        color: '#34a853',
        colorRgb: '52,168,83',
        description: 'Datos y reportes vivos',
    },
    {
        id: 'notion',
        name: 'Notion',
        mark: '📝',
        color: '#ffffff',
        colorRgb: '255,255,255',
        description: 'Documentación y operación',
    },
    {
        id: 'slack',
        name: 'Slack',
        mark: '📨',
        color: '#e01e5a',
        colorRgb: '224,30,90',
        description: 'Alertas para el equipo',
    },
    {
        id: 'tiendanube',
        name: 'Tiendanube',
        mark: '☁️',
        color: '#7b2fff',
        colorRgb: '123,47,255',
        description: 'Pedidos de e-commerce',
    },
    {
        id: 'stripe',
        name: 'Stripe',
        mark: '◈',
        color: '#635bff',
        colorRgb: '99,91,255',
        description: 'Pagos internacionales',
    },
    {
        id: 'hubspot',
        name: 'HubSpot',
        mark: '🧩',
        color: '#ff7a59',
        colorRgb: '255,122,89',
        description: 'Seguimiento comercial',
    },
    {
        id: 'calendar',
        name: 'Calendar',
        mark: '📅',
        color: '#4285f4',
        colorRgb: '66,133,244',
        description: 'Agenda y reservas',
    },
    {
        id: 'afip',
        name: 'AFIP',
        mark: '🧾',
        color: '#f59e0b',
        colorRgb: '245,158,11',
        description: 'Facturación y gestión fiscal',
    },
]

function IntegrationPill({
    item,
    isHovered,
    isDimmed,
    onHover,
    onLeave,
}: {
    item: IntegrationItem
    isHovered: boolean
    isDimmed: boolean
    onHover: (id: string) => void
    onLeave: () => void
}) {
    return (
        <motion.div
            onHoverStart={() => onHover(item.id)}
            onHoverEnd={onLeave}
            onPointerEnter={() => onHover(item.id)}
            onPointerLeave={onLeave}
            className="relative shrink-0"
        >
            <motion.div
                animate={{
                    scale: isHovered ? 1.1 : 1,
                    opacity: isDimmed ? 0.3 : 1,
                    filter: isDimmed ? 'blur(4px)' : 'blur(0px)',
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex min-w-[11.5rem] items-center gap-3 rounded-full border border-white/[0.06] bg-white/[0.03] px-5 py-4 backdrop-blur-xl md:min-w-[12.5rem]"
                style={{
                    boxShadow: isHovered ? `0 0 32px rgba(${item.colorRgb},0.22), inset 0 1px 0 rgba(255,255,255,0.08)` : 'inset 0 1px 0 rgba(255,255,255,0.06)',
                    borderColor: isHovered ? `rgba(${item.colorRgb},0.34)` : 'rgba(255,255,255,0.06)',
                }}
            >
                <div
                    className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        background: `radial-gradient(circle at 50% 50%, rgba(${item.colorRgb},0.18) 0%, transparent 68%)`,
                    }}
                />

                <div
                    className="relative z-10 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-xl"
                    style={{
                        boxShadow: isHovered ? `0 0 26px rgba(${item.colorRgb},0.28)` : 'none',
                    }}
                >
                    <span>{item.mark}</span>
                </div>

                <div className="relative z-10 min-w-0">
                    <div
                        className="truncate text-[13px] font-bold uppercase tracking-[0.18em]"
                        style={{ color: isHovered ? item.color : 'rgba(255,255,255,0.78)' }}
                    >
                        {item.name}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/28">
                        Integración activa
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.96 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 -translate-x-1/2"
                    >
                        <div className="whitespace-nowrap rounded-2xl border border-white/[0.08] bg-white/[0.06] px-4 py-2 text-[11px] text-white/75 shadow-[0_20px_50px_rgba(0,0,0,0.32)] backdrop-blur-xl">
                            {item.description}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default function IntegracionesAutomation() {
    const sectionRef = useRef<HTMLElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
    const prefersReducedMotion = useReducedMotion()
    const [hoveredId, setHoveredId] = useState<string | null>(null)
    const [halfWidth, setHalfWidth] = useState(0)

    const marqueeItems = useMemo(() => [...INTEGRATIONS, ...INTEGRATIONS], [])
    const baseX = useMotionValue(0)
    const speed = useSpring(hoveredId ? 0 : 44, {
        stiffness: 120,
        damping: 24,
        mass: 0.7,
    })

    useEffect(() => {
        const measure = () => {
            if (!trackRef.current) return
            setHalfWidth(trackRef.current.scrollWidth / 2)
        }

        measure()
        window.addEventListener('resize', measure)
        return () => window.removeEventListener('resize', measure)
    }, [])

    useAnimationFrame((_, delta) => {
        if (prefersReducedMotion || !halfWidth) return
        const current = baseX.get()
        const next = current - speed.get() * (delta / 1000)
        const wrapped = next <= -halfWidth ? next + halfWidth : next
        baseX.set(wrapped)
    })

    return (
        <section
            ref={sectionRef}
            className="relative z-[1] w-full overflow-hidden bg-[#070709] px-6 py-24 md:px-12 md:py-36 lg:py-40"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 h-[34rem] w-[64rem] -translate-x-1/2 blur-[120px]"
                style={{ background: 'radial-gradient(ellipse at center top, rgba(249,115,22,0.1) 0%, rgba(245,158,11,0.06) 34%, transparent 72%)' }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-20 bottom-0 h-[22rem] w-[22rem] rounded-full blur-[120px]"
                style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 72%)' }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 top-[28%] h-[24rem] w-[24rem] rounded-full blur-[140px]"
                style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 72%)' }}
            />

            <div className="relative z-10 mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.65, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-14 max-w-3xl"
                >
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/[0.08] px-4 py-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-300">
                            [ Tus herramientas, conectadas ]
                        </span>
                    </div>

                    <h2 className="text-[clamp(2.6rem,6vw,5.4rem)] font-black leading-[0.9] tracking-[-0.06em] text-white">
                        Todo lo que ya usás.
                        <br />
                        <span className="bg-gradient-to-r from-white via-amber-200 to-orange-300 bg-clip-text text-transparent">
                            Ahora conectado.
                        </span>
                    </h2>

                    <p className="mt-6 max-w-2xl text-base leading-8 text-white/44 md:text-lg">
                        Un ecosistema que fluye de punta a punta. Cuando una integración entra en foco, el sistema entero baja el ruido para mostrar exactamente qué se activa.
                    </p>
                </motion.div>

                <div className="relative overflow-hidden rounded-[2.2rem] border border-white/[0.06] bg-white/[0.02] px-0 py-10 backdrop-blur-xl">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-[linear-gradient(90deg,#070709,rgba(7,7,9,0))]" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-[linear-gradient(270deg,#070709,rgba(7,7,9,0))]" />

                    <motion.div
                        ref={trackRef}
                        style={{ x: prefersReducedMotion ? 0 : baseX }}
                        className="flex w-max items-center gap-4 px-4 md:gap-5"
                    >
                        {marqueeItems.map((item, index) => {
                            const isHovered = hoveredId === item.id
                            const isDimmed = hoveredId !== null && hoveredId !== item.id

                            return (
                                <IntegrationPill
                                    key={`${item.id}-${index}`}
                                    item={item}
                                    isHovered={isHovered}
                                    isDimmed={isDimmed}
                                    onHover={setHoveredId}
                                    onLeave={() => setHoveredId(null)}
                                />
                            )
                        })}
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-8 flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.24em] text-white/26"
                >
                    <span>Hover para aislar una integración</span>
                    <span>400+ automatizaciones posibles</span>
                </motion.div>

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : {}}
                    transition={{ duration: prefersReducedMotion ? 0 : 1.1, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-16 h-px origin-left bg-[linear-gradient(90deg,transparent,rgba(245,158,11,0.35)_30%,rgba(249,115,22,0.42)_50%,rgba(245,158,11,0.35)_70%,transparent)]"
                />
            </div>
        </section>
    )
}
