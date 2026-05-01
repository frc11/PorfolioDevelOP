'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    AnimatePresence,
    motion,
    useInView,
    useReducedMotion,
} from 'framer-motion'
import { Mail, CheckCircle2, Cloud, Puzzle, Zap, MessageCircle, CreditCard, BarChart2, FileText, Send, CalendarDays, Receipt } from 'lucide-react'

interface IntegrationItem {
    id: string
    name: string
    mark: 'zap' | 'message' | 'credit' | 'mail' | 'chart' | 'file' | 'send' | 'cloud' | 'check' | 'puzzle' | 'calendar' | 'receipt'
    color: string
    colorRgb: string
    description: string
}

const INTEGRATIONS: IntegrationItem[] = [
    {
        id: 'n8n',
        name: 'n8n',
        mark: 'zap',
        color: '#f97316',
        colorRgb: '249,115,22',
        description: 'Automatización de flujos',
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        mark: 'message',
        color: '#25d366',
        colorRgb: '37,211,102',
        description: 'Mensajería instantánea',
    },
    {
        id: 'mercadopago',
        name: 'Mercado Pago',
        mark: 'credit',
        color: '#00b1ea',
        colorRgb: '0,177,234',
        description: 'Cobros y pagos online',
    },
    {
        id: 'gmail',
        name: 'Gmail',
        mark: 'mail',
        color: '#ea4335',
        colorRgb: '234,67,53',
        description: 'Correo y notificaciones',
    },
    {
        id: 'sheets',
        name: 'Google Sheets',
        mark: 'chart',
        color: '#34a853',
        colorRgb: '52,168,83',
        description: 'Datos y reportes vivos',
    },
    {
        id: 'notion',
        name: 'Notion',
        mark: 'file',
        color: '#ffffff',
        colorRgb: '255,255,255',
        description: 'Documentación y operación',
    },
    {
        id: 'slack',
        name: 'Slack',
        mark: 'send',
        color: '#e01e5a',
        colorRgb: '224,30,90',
        description: 'Alertas para el equipo',
    },
    {
        id: 'tiendanube',
        name: 'Tiendanube',
        mark: 'cloud',
        color: '#7b2fff',
        colorRgb: '123,47,255',
        description: 'Pedidos de e-commerce',
    },
    {
        id: 'stripe',
        name: 'Stripe',
        mark: 'check',
        color: '#635bff',
        colorRgb: '99,91,255',
        description: 'Pagos internacionales',
    },
    {
        id: 'hubspot',
        name: 'HubSpot',
        mark: 'puzzle',
        color: '#ff7a59',
        colorRgb: '255,122,89',
        description: 'Seguimiento comercial',
    },
    {
        id: 'calendar',
        name: 'Calendar',
        mark: 'calendar',
        color: '#4285f4',
        colorRgb: '66,133,244',
        description: 'Agenda y reservas',
    },
    {
        id: 'afip',
        name: 'AFIP',
        mark: 'receipt',
        color: '#f59e0b',
        colorRgb: '245,158,11',
        description: 'Facturación y gestión fiscal',
    },
]

const MARK_ICONS: Record<string, React.ReactNode> = {
    zap:      <Zap size={18} strokeWidth={1.5} />,
    message:  <MessageCircle size={18} strokeWidth={1.5} />,
    credit:   <CreditCard size={18} strokeWidth={1.5} />,
    mail:     <Mail size={18} strokeWidth={1.5} />,
    chart:    <BarChart2 size={18} strokeWidth={1.5} />,
    file:     <FileText size={18} strokeWidth={1.5} />,
    send:     <Send size={18} strokeWidth={1.5} />,
    cloud:    <Cloud size={18} strokeWidth={1.5} />,
    check:    <CheckCircle2 size={18} strokeWidth={1.5} />,
    puzzle:   <Puzzle size={18} strokeWidth={1.5} />,
    calendar: <CalendarDays size={18} strokeWidth={1.5} />,
    receipt:  <Receipt size={18} strokeWidth={1.5} />,
}

const MARQUEE_SPEED = 44

const CIRCUIT_PATHS = [
    'M0 72H130L158 44H278L302 20H392',
    'M0 132H190L220 102H342L372 72H520',
    'M22 210H166L202 174H310L342 142H468L494 116H578',
    'M0 286H108L148 246H250L286 210H420',
    'M310 20V58H420L448 86H556',
    'M232 104V146H364L396 178H520',
    'M120 248V294H268L306 332H430',
]

const TOP_FLOW_PATHS = [
    'M-40 344C118 260 228 404 378 304C534 200 658 246 790 300C944 362 1064 258 1248 304C1358 332 1438 298 1490 270',
    'M-30 424C156 342 270 444 414 374C578 294 666 350 800 408C944 470 1072 362 1238 398C1366 426 1438 376 1490 348',
    'M-50 504C126 436 254 520 414 456C568 394 700 444 846 494C1008 550 1136 472 1284 498C1388 516 1456 476 1500 450',
]

const MESH_NODES = [
    { x: 0, y: 720 }, { x: 72, y: 690 }, { x: 150, y: 735 }, { x: 234, y: 674 }, { x: 320, y: 712 },
    { x: 410, y: 652 }, { x: 520, y: 704 }, { x: 628, y: 622 }, { x: 742, y: 666 }, { x: 858, y: 612 },
    { x: 972, y: 642 }, { x: 1088, y: 590 }, { x: 1206, y: 626 }, { x: 1320, y: 574 }, { x: 1440, y: 604 },
    { x: 36, y: 814 }, { x: 128, y: 780 }, { x: 242, y: 826 }, { x: 358, y: 764 }, { x: 476, y: 812 },
    { x: 600, y: 748 }, { x: 724, y: 798 }, { x: 846, y: 720 }, { x: 974, y: 772 }, { x: 1104, y: 700 },
    { x: 1234, y: 748 }, { x: 1364, y: 684 }, { x: 1480, y: 728 },
]

const MESH_LINKS = [
    [0, 1], [1, 2], [1, 3], [2, 3], [3, 4], [3, 18], [4, 5], [4, 19], [5, 6], [5, 20],
    [6, 7], [6, 21], [7, 8], [7, 22], [8, 9], [8, 23], [9, 10], [9, 24], [10, 11],
    [10, 25], [11, 12], [11, 26], [12, 13], [12, 27], [13, 14], [15, 16], [16, 17],
    [16, 2], [17, 18], [18, 19], [19, 20], [20, 21], [21, 22], [22, 23], [23, 24],
    [24, 25], [25, 26], [26, 27], [18, 5], [20, 7], [22, 9], [24, 11], [26, 13],
]

function IntegrationsBackdrop({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
    const lineTransition = prefersReducedMotion
        ? { duration: 0 }
        : { duration: 8, repeat: Infinity, ease: 'linear' as const }
    const driftTransition = prefersReducedMotion
        ? { duration: 0 }
        : { duration: 9, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const }

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(245,158,11,0.105)_0%,rgba(249,115,22,0.04)_30%,rgba(7,7,9,0)_68%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_11%_82%,rgba(245,158,11,0.07)_0%,transparent_26%),radial-gradient(circle_at_90%_76%,rgba(249,115,22,0.065)_0%,transparent_28%)]" />
            <div
                className="absolute inset-0 opacity-[0.22]"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, rgba(245,158,11,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(249,115,22,0.06) 1px, transparent 1px)',
                    backgroundSize: '72px 72px',
                    maskImage: 'radial-gradient(ellipse at 50% 54%, rgba(0,0,0,0.36) 0%, transparent 74%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at 50% 54%, rgba(0,0,0,0.36) 0%, transparent 74%)',
                }}
            />

            <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 1440 820"
                preserveAspectRatio="none"
                role="presentation"
            >
                <defs>
                    <linearGradient id="integrationsCircuitStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(249,115,22,0)" />
                        <stop offset="38%" stopColor="rgba(245,158,11,0.42)" />
                        <stop offset="62%" stopColor="rgba(249,115,22,0.52)" />
                        <stop offset="100%" stopColor="rgba(249,115,22,0)" />
                    </linearGradient>
                    <linearGradient id="integrationsMeshStroke" x1="0%" y1="65%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(245,158,11,0.08)" />
                        <stop offset="46%" stopColor="rgba(249,115,22,0.24)" />
                        <stop offset="100%" stopColor="rgba(251,191,36,0.1)" />
                    </linearGradient>
                    <radialGradient id="integrationsNodeGlow">
                        <stop offset="0%" stopColor="rgba(251,191,36,0.98)" />
                        <stop offset="42%" stopColor="rgba(249,115,22,0.34)" />
                        <stop offset="100%" stopColor="rgba(249,115,22,0)" />
                    </radialGradient>
                    <filter id="integrationsSoftGlow" x="-80%" y="-80%" width="260%" height="260%">
                        <feGaussianBlur stdDeviation="3.2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <mask id="integrationsVerticalFade">
                        <linearGradient id="integrationsFadeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="white" stopOpacity="0.74" />
                            <stop offset="42%" stopColor="white" stopOpacity="0.34" />
                            <stop offset="100%" stopColor="white" stopOpacity="0.86" />
                        </linearGradient>
                        <rect width="1440" height="820" fill="url(#integrationsFadeGradient)" />
                    </mask>
                </defs>

                <g mask="url(#integrationsVerticalFade)">
                    <g opacity="0.58">
                        {CIRCUIT_PATHS.map((path, index) => (
                            <g key={`circuit-left-${index}`}>
                                <path d={path} fill="none" stroke="url(#integrationsCircuitStroke)" strokeWidth="1.1" />
                                <path
                                    d={path}
                                    fill="none"
                                    stroke="rgba(251,191,36,0.2)"
                                    strokeWidth="2"
                                    strokeDasharray="1 78"
                                    strokeLinecap="round"
                                />
                            </g>
                        ))}
                    </g>
                    <g opacity="0.62" transform="translate(1440 0) scale(-1 1)">
                        {CIRCUIT_PATHS.map((path, index) => (
                            <g key={`circuit-right-${index}`}>
                                <path d={path} fill="none" stroke="url(#integrationsCircuitStroke)" strokeWidth="1.1" />
                                <path
                                    d={path}
                                    fill="none"
                                    stroke="rgba(251,191,36,0.22)"
                                    strokeWidth="2"
                                    strokeDasharray="1 92"
                                    strokeLinecap="round"
                                />
                            </g>
                        ))}
                    </g>

                    <motion.g
                        opacity="0.58"
                        animate={prefersReducedMotion ? {} : { y: [0, -10, 0], opacity: [0.44, 0.62, 0.44] }}
                        transition={driftTransition}
                    >
                        {TOP_FLOW_PATHS.map((path, index) => (
                            <g key={`flow-${index}`}>
                                <path
                                    d={path}
                                    fill="none"
                                    stroke="rgba(245,158,11,0.15)"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                />
                                <motion.path
                                    d={path}
                                    fill="none"
                                    stroke="rgba(251,191,36,0.46)"
                                    strokeWidth="1.4"
                                    strokeDasharray="2 150"
                                    strokeLinecap="round"
                                    animate={prefersReducedMotion ? {} : { strokeDashoffset: [0, -304] }}
                                    transition={{ ...lineTransition, delay: index * 0.85 }}
                                />
                            </g>
                        ))}
                    </motion.g>

                    <g opacity="0.78">
                        <path
                            d="M-30 790C140 670 272 760 430 662C600 556 714 676 858 604C1034 516 1164 640 1490 542V850H-30Z"
                            fill="rgba(249,115,22,0.035)"
                        />
                        {MESH_LINKS.map(([from, to], index) => {
                            const a = MESH_NODES[from]
                            const b = MESH_NODES[to]

                            return (
                                <line
                                    key={`mesh-link-${index}`}
                                    x1={a.x}
                                    y1={a.y}
                                    x2={b.x}
                                    y2={b.y}
                                    stroke="url(#integrationsMeshStroke)"
                                    strokeWidth="1"
                                />
                            )
                        })}
                        {MESH_NODES.map((node, index) => (
                            <g key={`mesh-node-${index}`}>
                                <circle cx={node.x} cy={node.y} r="8" fill="url(#integrationsNodeGlow)" opacity="0.36" />
                                <circle cx={node.x} cy={node.y} r="2.2" fill="rgba(251,191,36,0.82)" filter="url(#integrationsSoftGlow)" />
                            </g>
                        ))}
                    </g>
                </g>
            </svg>

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,7,9,0.26)_58%,rgba(7,7,9,0.88)_100%)]" />
            <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#070709] via-[#070709]/72 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070709] via-[#070709]/72 to-transparent" />
        </div>
    )
}

function IntegrationPill({
    item,
    isHovered,
    isDimmed,
    interactionMode = 'hover',
    tooltipPlacement = 'below',
    onHover,
    onLeave,
    onSelect,
}: {
    item: IntegrationItem
    isHovered: boolean
    isDimmed: boolean
    interactionMode?: 'hover' | 'click'
    tooltipPlacement?: 'above' | 'below'
    onHover: (id: string) => void
    onLeave: () => void
    onSelect?: (id: string) => void
}) {
    const isClickMode = interactionMode === 'click'
    const tooltipPositionClass = tooltipPlacement === 'above'
        ? 'bottom-full mb-3'
        : 'top-full mt-3'

    return (
        <motion.div
            onPointerMove={isClickMode ? undefined : () => onHover(item.id)}
            onPointerLeave={isClickMode ? undefined : onLeave}
            onFocus={isClickMode ? undefined : () => onHover(item.id)}
            onBlur={isClickMode ? undefined : onLeave}
            onClick={isClickMode ? () => onSelect?.(item.id) : undefined}
            onKeyDown={
                isClickMode
                    ? (event) => {
                        if (event.key !== 'Enter' && event.key !== ' ') return
                        event.preventDefault()
                        onSelect?.(item.id)
                    }
                    : undefined
            }
            role={isClickMode ? 'button' : undefined}
            tabIndex={isClickMode ? 0 : undefined}
            aria-pressed={isClickMode ? isHovered : undefined}
            className={`relative shrink-0 ${isClickMode ? 'cursor-pointer select-none touch-manipulation outline-none' : ''}`}
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
                    className="relative z-10 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04]"
                    style={{
                        boxShadow: isHovered ? `0 0 26px rgba(${item.colorRgb},0.28)` : 'none',
                        color: isHovered ? item.color : 'rgba(255,255,255,0.5)',
                        transition: 'color 200ms, box-shadow 200ms',
                    }}
                >
                    {MARK_ICONS[item.mark] ?? <Zap size={18} strokeWidth={1.5} />}
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
                        className={`pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 ${tooltipPositionClass}`}
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
    const desktopCycleRef = useRef<HTMLDivElement>(null)
    const mobileTopCycleRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
    const prefersReducedMotion = useReducedMotion()
    const [hoveredId, setHoveredId] = useState<string | null>(null)
    const [cycleWidth, setCycleWidth] = useState(0)
    const [isCompactCarousel, setIsCompactCarousel] = useState(false)

    const carouselItems = useMemo(() => INTEGRATIONS, [])
    const marqueeStyle = {
        '--marquee-distance': `${Math.max(cycleWidth, 1)}px`,
        '--marquee-duration': `${Math.max(cycleWidth / MARQUEE_SPEED, 1)}s`,
        '--marquee-play-state': hoveredId || prefersReducedMotion ? 'paused' : 'running',
    } as React.CSSProperties

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 1023px)')
        const syncCompactState = () => setIsCompactCarousel(mediaQuery.matches)

        syncCompactState()
        mediaQuery.addEventListener('change', syncCompactState)

        return () => mediaQuery.removeEventListener('change', syncCompactState)
    }, [])

    useEffect(() => {
        const activeCycle = isCompactCarousel ? mobileTopCycleRef.current : desktopCycleRef.current
        if (!activeCycle) return

        const measure = () => {
            const nextWidth = activeCycle.scrollWidth
            setCycleWidth((currentWidth) => {
                if (Math.abs(currentWidth - nextWidth) < 0.5) return currentWidth
                return nextWidth
            })
        }

        measure()
        const resizeObserver = new ResizeObserver(measure)
        resizeObserver.observe(activeCycle)
        if (document.fonts) {
            document.fonts.ready.then(measure).catch(() => undefined)
        }
        window.addEventListener('resize', measure)
        return () => {
            resizeObserver.disconnect()
            window.removeEventListener('resize', measure)
        }
    }, [isCompactCarousel])

    const handleMobileSelect = (id: string) => {
        setHoveredId((current) => (current === id ? null : id))
    }

    return (
        <section
            ref={sectionRef}
            className="relative z-[1] w-full overflow-hidden bg-[#070709] px-6 py-24 md:px-12 md:py-36 lg:py-40"
        >
            <style>{`
                @keyframes integrationsMarqueeLeft {
                    from { transform: translate3d(0, 0, 0); }
                    to { transform: translate3d(calc(var(--marquee-distance) * -1), 0, 0); }
                }

                @keyframes integrationsMarqueeRightOffset {
                    from { transform: translate3d(calc(var(--marquee-distance) * -1.5), 0, 0); }
                    to { transform: translate3d(calc(var(--marquee-distance) * -0.5), 0, 0); }
                }

                .integrations-marquee-left,
                .integrations-marquee-right-offset {
                    animation-duration: var(--marquee-duration);
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                    animation-play-state: var(--marquee-play-state);
                    will-change: transform;
                    transform: translateZ(0);
                    backface-visibility: hidden;
                }

                .integrations-marquee-left {
                    animation-name: integrationsMarqueeLeft;
                }

                .integrations-marquee-right-offset {
                    animation-name: integrationsMarqueeRightOffset;
                }
            `}</style>
            <IntegrationsBackdrop prefersReducedMotion={prefersReducedMotion} />

            <div className="relative z-10 mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.65, ease: [0.16, 1, 0.3, 1] }}
                    className="mx-auto mb-14 max-w-3xl text-center"
                >
                    <div className="relative overflow-hidden mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/[0.08] px-4 py-2">
                        <motion.span
                            aria-hidden="true"
                            animate={prefersReducedMotion ? {} : { x: ['-150%', '250%'] }}
                            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 4.2, ease: 'easeInOut' }}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent)',
                                borderRadius: '100px',
                                pointerEvents: 'none',
                                display: prefersReducedMotion ? 'none' : 'block',
                            }}
                        />
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)] shrink-0" style={{ animation: prefersReducedMotion ? 'none' : 'pulse 1.8s ease-in-out infinite' }} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300 font-mono relative z-10">
                            [ Tus herramientas, conectadas ]
                        </span>
                    </div>

                    <h2 className="text-[clamp(2.6rem,6vw,5.4rem)] font-black leading-[0.9] tracking-[-0.06em] text-white">
                        Todo lo que ya usás.
                        <br />
                        <div className="relative inline-block">
                            <span className="bg-gradient-to-r from-white via-amber-200 to-orange-300 bg-clip-text text-transparent">
                                Ahora conectado.
                            </span>
                            {!prefersReducedMotion && (
                                <motion.div
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
                                    transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    style={{
                                        position: 'absolute',
                                        bottom: '-4px',
                                        left: '8%',
                                        right: '8%',
                                        height: '2px',
                                        background: 'linear-gradient(90deg, transparent, #f59e0b 40%, #f97316 60%, transparent)',
                                        transformOrigin: 'center',
                                        filter: 'blur(0.5px)',
                                    }}
                                />
                            )}
                        </div>
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/44 md:text-lg">
                        Un ecosistema que fluye de punta a punta. Cuando una integración entra en foco, el sistema entero baja el ruido para mostrar exactamente qué se activa.
                    </p>
                </motion.div>

                <div className="relative hidden overflow-hidden rounded-[2.2rem] border border-white/[0.06] bg-white/[0.02] px-0 pt-10 pb-14 backdrop-blur-xl lg:block">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-[linear-gradient(90deg,#070709,rgba(7,7,9,0))]" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-[linear-gradient(270deg,#070709,rgba(7,7,9,0))]" />

                    <div
                        style={marqueeStyle}
                        className="integrations-marquee-left flex w-max items-center px-4"
                    >
                        <div ref={desktopCycleRef} className="flex shrink-0 items-center gap-4 pr-4 md:gap-5 md:pr-5">
                            {carouselItems.map((item) => {
                                const isHovered = hoveredId === item.id
                                const isDimmed = hoveredId !== null && hoveredId !== item.id

                                return (
                                    <IntegrationPill
                                        key={`desktop-a-${item.id}`}
                                        item={item}
                                        isHovered={isHovered}
                                        isDimmed={isDimmed}
                                        onHover={setHoveredId}
                                        onLeave={() => setHoveredId(null)}
                                    />
                                )
                            })}
                        </div>
                        <div className="flex shrink-0 items-center gap-4 pr-4 md:gap-5 md:pr-5">
                            {carouselItems.map((item) => {
                                const isHovered = hoveredId === item.id
                                const isDimmed = hoveredId !== null && hoveredId !== item.id

                                return (
                                    <IntegrationPill
                                        key={`desktop-b-${item.id}`}
                                        item={item}
                                        isHovered={isHovered}
                                        isDimmed={isDimmed}
                                        onHover={setHoveredId}
                                        onLeave={() => setHoveredId(null)}
                                    />
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.06] bg-white/[0.025] px-0 py-9 backdrop-blur-xl lg:hidden">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-[linear-gradient(90deg,#070709,rgba(7,7,9,0))]" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-[linear-gradient(270deg,#070709,rgba(7,7,9,0))]" />
                    <div className="pointer-events-none absolute left-5 right-5 top-1/2 h-px bg-white/[0.06]" />

                    <div
                        style={marqueeStyle}
                        className="integrations-marquee-left flex w-max items-center px-4 pb-3"
                    >
                        <div ref={mobileTopCycleRef} className="flex shrink-0 items-center gap-3 pr-3">
                            {carouselItems.map((item) => {
                                const isHovered = hoveredId === item.id
                                const isDimmed = hoveredId !== null && hoveredId !== item.id

                                return (
                                    <IntegrationPill
                                        key={`mobile-top-a-${item.id}`}
                                        item={item}
                                        isHovered={isHovered}
                                        isDimmed={isDimmed}
                                        interactionMode="click"
                                        tooltipPlacement="below"
                                        onHover={setHoveredId}
                                        onLeave={() => setHoveredId(null)}
                                        onSelect={handleMobileSelect}
                                    />
                                )
                            })}
                        </div>
                        <div className="flex shrink-0 items-center gap-3 pr-3">
                            {carouselItems.map((item) => {
                                const isHovered = hoveredId === item.id
                                const isDimmed = hoveredId !== null && hoveredId !== item.id

                                return (
                                    <IntegrationPill
                                        key={`mobile-top-b-${item.id}`}
                                        item={item}
                                        isHovered={isHovered}
                                        isDimmed={isDimmed}
                                        interactionMode="click"
                                        tooltipPlacement="below"
                                        onHover={setHoveredId}
                                        onLeave={() => setHoveredId(null)}
                                        onSelect={handleMobileSelect}
                                    />
                                )
                            })}
                        </div>
                    </div>

                    <div
                        style={marqueeStyle}
                        className="integrations-marquee-right-offset flex w-max items-center px-4 pt-3"
                    >
                        <div className="flex shrink-0 items-center gap-3 pr-3">
                            {carouselItems.map((item) => {
                                const isHovered = hoveredId === item.id
                                const isDimmed = hoveredId !== null && hoveredId !== item.id

                                return (
                                    <IntegrationPill
                                        key={`mobile-bottom-a-${item.id}`}
                                        item={item}
                                        isHovered={isHovered}
                                        isDimmed={isDimmed}
                                        interactionMode="click"
                                        tooltipPlacement="above"
                                        onHover={setHoveredId}
                                        onLeave={() => setHoveredId(null)}
                                        onSelect={handleMobileSelect}
                                    />
                                )
                            })}
                        </div>
                        <div className="flex shrink-0 items-center gap-3 pr-3">
                            {carouselItems.map((item) => {
                                const isHovered = hoveredId === item.id
                                const isDimmed = hoveredId !== null && hoveredId !== item.id

                                return (
                                    <IntegrationPill
                                        key={`mobile-bottom-b-${item.id}`}
                                        item={item}
                                        isHovered={isHovered}
                                        isDimmed={isDimmed}
                                        interactionMode="click"
                                        tooltipPlacement="above"
                                        onHover={setHoveredId}
                                        onLeave={() => setHoveredId(null)}
                                        onSelect={handleMobileSelect}
                                    />
                                )
                            })}
                        </div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-8 flex items-start justify-between gap-4 text-[10px] uppercase tracking-[0.18em] text-white/42 font-mono sm:text-[11px] sm:tracking-[0.22em] lg:items-center lg:text-white/26"
                >
                    <div className="inline-flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" style={{ animation: 'pulse 1.8s ease-in-out infinite', boxShadow: '0 0 6px rgba(245,158,11,0.8)' }} />
                        <span className="hidden lg:inline">Hover para aislar una integración</span>
                        <span className="lg:hidden">Click para aislar una integración</span>
                    </div>
                    <div className="inline-flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" style={{ animation: 'pulse 1.8s ease-in-out infinite', boxShadow: '0 0 6px rgba(245,158,11,0.8)' }} />
                        400+ automatizaciones posibles
                    </div>
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
