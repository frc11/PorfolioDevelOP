'use client'

import React from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

type PricingTier = {
    name: string
    subtitle: string
    price: string
    unit: string
    desc: string
    items: string[]
    accent: string
    accentRgb: string
    highlight?: boolean
    badge?: string
    microLabel: string
}

const TIERS: PricingTier[] = [
    {
        name: 'Base',
        subtitle: 'Para arrancar rapido',
        price: '$490',
        unit: 'USD',
        desc: 'Landing profesional para validar oferta y empezar a captar desde Google.',
        items: ['1 pagina principal', 'SEO local inicial', 'Boton WhatsApp + formulario', 'Carga rapida mobile'],
        accent: '#22d3ee',
        accentRgb: '34,211,238',
        microLabel: 'Salida rapida en semanas',
    },
    {
        name: 'Completa',
        subtitle: 'La opcion mas elegida',
        price: '$980',
        unit: 'USD',
        desc: 'La mejor relacion precio-resultado para vender mas sin complejidad innecesaria.',
        items: ['Hasta 6 paginas', 'SEO local + estructura avanzada', 'Integraciones (WhatsApp, pagos)', 'Panel editable + analitica'],
        accent: '#8b5cf6',
        accentRgb: '139,92,246',
        highlight: true,
        badge: 'MAS ELEGIDA',
        microLabel: 'Equilibrio ideal costo/impacto',
    },
    {
        name: 'Escala',
        subtitle: 'Para operar mas grande',
        price: '$1.690',
        unit: 'USD',
        desc: 'Sumamos automatizaciones y capas extra para equipos con mas volumen.',
        items: ['Todo lo de Completa', 'Automatizaciones de ventas', 'Embudo y seguimiento de leads', 'Soporte prioritario 30 dias'],
        accent: '#06b6d4',
        accentRgb: '6,182,212',
        microLabel: 'Pensado para crecer sin freno',
    },
]

type MoneyGlyph = {
    top?: string
    right?: string
    left?: string
    bottom?: string
    size: string
    rotate: number
    delay: number
    fromX: number
    fromY: number
    driftX: number
    driftY: number
    driftRotate: number
    opacity: number
    blur: string
    stroke: string
}

const MONEY_GLYPHS: MoneyGlyph[] = [
    // Fragmentados en bordes
    {
        top: '-16%',
        left: '-7%',
        size: 'clamp(16rem,24vw,26rem)',
        rotate: -12,
        delay: 0,
        fromX: 280,
        fromY: 190,
        driftX: 14,
        driftY: -16,
        driftRotate: 2,
        opacity: 0.06,
        blur: '2px',
        stroke: 'rgba(34,211,238,0.18)',
    },
    {
        top: '12%',
        right: '-10%',
        size: 'clamp(14rem,20vw,22rem)',
        rotate: 16,
        delay: 0.35,
        fromX: -220,
        fromY: 130,
        driftX: -10,
        driftY: 12,
        driftRotate: -2,
        opacity: 0.065,
        blur: '2px',
        stroke: 'rgba(139,92,246,0.2)',
    },
    {
        bottom: '-20%',
        left: '18%',
        size: 'clamp(18rem,26vw,30rem)',
        rotate: -7,
        delay: 0.18,
        fromX: 140,
        fromY: -190,
        driftX: 10,
        driftY: -14,
        driftRotate: 1.8,
        opacity: 0.055,
        blur: '2px',
        stroke: 'rgba(34,211,238,0.16)',
    },
    {
        bottom: '-15%',
        right: '-6%',
        size: 'clamp(15rem,22vw,24rem)',
        rotate: 9,
        delay: 0.5,
        fromX: -180,
        fromY: -170,
        driftX: -12,
        driftY: 10,
        driftRotate: -1.7,
        opacity: 0.06,
        blur: '2px',
        stroke: 'rgba(139,92,246,0.16)',
    },
    // Completos pedidos (izquierda y arriba derecha inclinado)
    {
        top: '44%',
        left: '5%',
        size: 'clamp(9rem,13vw,14rem)',
        rotate: -8,
        delay: 0.12,
        fromX: 210,
        fromY: -20,
        driftX: 8,
        driftY: -10,
        driftRotate: 1.3,
        opacity: 0.09,
        blur: '1px',
        stroke: 'rgba(34,211,238,0.26)',
    },
    {
        top: '6%',
        right: '6%',
        size: 'clamp(10rem,14vw,16rem)',
        rotate: 24,
        delay: 0.26,
        fromX: -250,
        fromY: 170,
        driftX: -9,
        driftY: 9,
        driftRotate: -1.4,
        opacity: 0.092,
        blur: '1px',
        stroke: 'rgba(139,92,246,0.28)',
    },
    // Refuerzos intermedios
    {
        top: '20%',
        left: '26%',
        size: 'clamp(6rem,9vw,10rem)',
        rotate: -14,
        delay: 0.42,
        fromX: 120,
        fromY: 70,
        driftX: 6,
        driftY: -8,
        driftRotate: 1.1,
        opacity: 0.045,
        blur: '1.5px',
        stroke: 'rgba(34,211,238,0.16)',
    },
]

const ease = [0.16, 1, 0.3, 1] as const
const centerHoverBand = '-45% 0px -45% 0px'

const PremiumPricingCard = ({
    tier,
    index,
    prefersReducedMotion,
    centerMode,
}: {
    tier: PricingTier
    index: number
    prefersReducedMotion: boolean
    centerMode: boolean
}) => {
    const cardRef = React.useRef<HTMLDivElement>(null)
    const centered = useInView(cardRef, { amount: 0, margin: centerHoverBand })
    const centerActive = centerMode && centered
    const borderGlow = `0 0 26px rgba(${tier.accentRgb},0.34), inset 0 0 14px rgba(${tier.accentRgb},0.16)`

    return (
        <motion.div
            ref={cardRef}
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            animate={centerActive ? { scale: 1.05, y: -2 } : { scale: 1, y: 0 }}
            whileHover={prefersReducedMotion || centerMode ? {} : { scale: 1.05, y: -2 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{
                duration: prefersReducedMotion ? 0 : 0.65,
                delay: prefersReducedMotion ? 0 : index * 0.08,
                ease,
            }}
            className="group/pricing-card relative h-full will-change-transform transition-transform duration-150 ease-out"
            style={{ zIndex: centerActive ? 20 : 1 }}
        >
            <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 rounded-[1.9rem] opacity-0 blur-[24px] transition-opacity duration-150 group-hover/pricing-card:opacity-100 ${centerActive ? 'opacity-100' : ''}`}
                style={{
                    background: `radial-gradient(circle at 50% 50%, rgba(${tier.accentRgb},0.38) 0%, transparent 72%)`,
                }}
            />

            <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 z-20 rounded-[1.9rem] opacity-0 transition-opacity duration-150 group-hover/pricing-card:opacity-100 ${centerActive ? 'opacity-100' : ''}`}
                style={{
                    background:
                        `radial-gradient(80% 60% at 0% 0%, rgba(${tier.accentRgb},0.22) 0%, transparent 58%), ` +
                        `radial-gradient(70% 55% at 100% 0%, rgba(${tier.accentRgb},0.2) 0%, transparent 60%), ` +
                        `radial-gradient(75% 58% at 0% 100%, rgba(${tier.accentRgb},0.16) 0%, transparent 64%)`,
                }}
            />

            <span
                aria-hidden="true"
                className={`pointer-events-none absolute left-6 right-6 top-0 z-30 h-[2px] origin-left scale-x-0 rounded-full transition-transform duration-220 ease-out group-hover/pricing-card:scale-x-100 ${centerActive ? 'scale-x-100' : ''}`}
                style={{
                    background: `linear-gradient(90deg, transparent, rgba(${tier.accentRgb},0.95), transparent)`,
                }}
            />
            <span
                aria-hidden="true"
                className={`pointer-events-none absolute bottom-0 left-6 right-6 z-30 h-[2px] origin-right scale-x-0 rounded-full transition-transform duration-220 ease-out group-hover/pricing-card:scale-x-100 ${centerActive ? 'scale-x-100' : ''}`}
                style={{
                    background: `linear-gradient(90deg, transparent, rgba(${tier.accentRgb},0.95), transparent)`,
                }}
            />
            <span
                aria-hidden="true"
                className={`pointer-events-none absolute bottom-6 right-0 top-6 z-30 w-[2px] origin-top scale-y-0 rounded-full transition-transform duration-220 ease-out group-hover/pricing-card:scale-y-100 ${centerActive ? 'scale-y-100' : ''}`}
                style={{
                    background: `linear-gradient(180deg, transparent, rgba(${tier.accentRgb},0.95), transparent)`,
                }}
            />
            <span
                aria-hidden="true"
                className={`pointer-events-none absolute bottom-6 left-0 top-6 z-30 w-[2px] origin-bottom scale-y-0 rounded-full transition-transform duration-220 ease-out group-hover/pricing-card:scale-y-100 ${centerActive ? 'scale-y-100' : ''}`}
                style={{
                    background: `linear-gradient(180deg, transparent, rgba(${tier.accentRgb},0.95), transparent)`,
                }}
            />

            <article
                className={`relative flex h-full min-h-[36rem] flex-col overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(165deg,rgba(7,13,27,0.94)_0%,rgba(4,9,20,0.97)_55%,rgba(2,6,16,0.96)_100%)] shadow-[0_20px_58px_rgba(0,0,0,0.48)] transition-colors duration-150 ${tier.highlight ? 'pt-16' : 'p-7 sm:p-8'} ${tier.highlight ? 'px-7 pb-7 sm:px-8 sm:pb-8' : ''}`}
                style={{
                    borderColor: tier.highlight ? `rgba(${tier.accentRgb},0.72)` : 'rgba(255,255,255,0.11)',
                    boxShadow: tier.highlight
                        ? `0 24px 62px rgba(0,0,0,0.56), 0 0 0 1px rgba(${tier.accentRgb},0.32)`
                        : '0 20px 58px rgba(0,0,0,0.48)',
                }}
            >
                {tier.highlight && (
                    <div
                        className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-11 items-center justify-center border-b"
                        style={{
                            borderBottomColor: `rgba(${tier.accentRgb},0.4)`,
                            background: `linear-gradient(180deg, rgba(${tier.accentRgb},0.82) 0%, rgba(${tier.accentRgb},0.56) 100%)`,
                            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.28), 0 10px 20px rgba(${tier.accentRgb},0.18)`,
                        }}
                    >
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/95">
                            Opcion mas elegida
                        </span>
                    </div>
                )}

                <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 transition-opacity duration-150 group-hover/pricing-card:opacity-100 ${centerActive ? 'opacity-100' : ''}`}
                    style={{
                        background: `linear-gradient(135deg, rgba(${tier.accentRgb},0.16) 0%, transparent 42%, rgba(${tier.accentRgb},0.12) 100%)`,
                        opacity: centerActive ? 1 : tier.highlight ? 1 : 0.65,
                    }}
                />

                <div className="relative z-10">
                    <div className="flex flex-col gap-3 min-[361px]:flex-row min-[361px]:items-start min-[361px]:justify-between">
                        <div className="min-w-0">
                            <p className="text-[11px] font-extrabold uppercase tracking-[0.26em] text-white/90">{tier.name}</p>
                            <p className="mt-2 text-sm leading-6 text-white/58 max-[360px]:text-[15px] max-[360px]:leading-[1.5]">{tier.subtitle}</p>
                        </div>
                        <span className="inline-flex w-fit items-center justify-center text-center rounded-full border border-white/12 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/62 max-[360px]:w-full max-[360px]:rounded-[0.8rem] max-[360px]:px-2.5 max-[360px]:py-1.5 max-[360px]:text-[9px] max-[360px]:tracking-[0.14em]">
                            {tier.microLabel}
                        </span>
                    </div>

                    <div className="mt-7 flex items-end gap-2">
                        <span className="text-[clamp(2.45rem,5vw,3.7rem)] font-black leading-none tracking-[-0.05em] text-white">{tier.price}</span>
                        <span className="pb-2 text-sm text-white/55">{tier.unit}</span>
                    </div>

                    <p className="mt-4 text-[15px] leading-7 text-white/68">{tier.desc}</p>
                </div>

                <ol className="relative z-10 mt-7 flex-1 space-y-3">
                    {tier.items.map((item, itemIndex) => (
                        <li
                            key={`${tier.name}-${item}`}
                            className="flex items-start gap-3 rounded-[0.95rem] border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white/72 transition-colors duration-150 group-hover/pricing-card:border-white/15"
                        >
                            <span
                                className="mt-[2px] inline-grid h-5 min-h-5 w-5 min-w-5 place-items-center rounded-full border text-[10px] font-bold"
                                style={{
                                    borderColor: `rgba(${tier.accentRgb},0.5)`,
                                    color: tier.accent,
                                    boxShadow: tier.highlight ? borderGlow : 'none',
                                }}
                            >
                                {itemIndex + 1}
                            </span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ol>

                <div className="relative z-10 mt-5">
                    <a
                        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%20DevelOP%2C%20quiero%20el%20plan%20${encodeURIComponent(tier.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-12 w-full items-center justify-center rounded-[0.95rem] border border-white/15 bg-black/30 text-[12px] font-extrabold uppercase tracking-[0.2em] text-white/90 transition-all duration-150 hover:border-white/28"
                        style={{
                            textDecoration: 'none',
                            boxShadow: tier.highlight ? `0 0 0 1px rgba(${tier.accentRgb},0.34), 0 0 26px rgba(${tier.accentRgb},0.24)` : 'none',
                        }}
                    >
                        Activar plan
                    </a>
                </div>
            </article>
        </motion.div>
    )
}

export const PricingSection = () => {
    const prefersReducedMotion = useReducedMotion()
    const [isBelowLg, setIsBelowLg] = React.useState(false)

    React.useEffect(() => {
        const media = window.matchMedia('(max-width: 1023.98px)')
        const sync = () => setIsBelowLg(media.matches)
        sync()

        media.addEventListener('change', sync)
        return () => media.removeEventListener('change', sync)
    }, [])

    return (
        <section
            id="pricing-section"
            className="relative z-10 w-full overflow-hidden bg-[#020716] px-4 py-20 md:py-24 lg:flex lg:min-h-screen lg:items-center lg:py-24"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(130% 84% at 50% 0%, rgba(34,211,238,0.12) 0%, rgba(2,7,22,0) 58%), radial-gradient(95% 76% at 80% 100%, rgba(139,92,246,0.14) 0%, rgba(2,7,22,0) 70%)',
                }}
            />

            {MONEY_GLYPHS.map((glyph, index) => (
                <motion.div
                    key={`money-glyph-${index}`}
                    aria-hidden="true"
                    initial={
                        prefersReducedMotion
                            ? { x: 0, y: 0, scale: 1, opacity: 1 }
                            : { x: glyph.fromX, y: glyph.fromY, scale: 0.92, opacity: 0 }
                    }
                    whileInView={
                        prefersReducedMotion
                            ? { x: 0, y: 0, scale: 1, opacity: 1 }
                            : { x: 0, y: 0, scale: 1, opacity: 1 }
                    }
                    transition={{
                        duration: prefersReducedMotion ? 0 : 1.8,
                        ease,
                        delay: prefersReducedMotion ? 0 : glyph.delay,
                    }}
                    viewport={{ once: true, amount: 0.25 }}
                    className="pointer-events-none absolute select-none"
                    style={{
                        top: glyph.top,
                        right: glyph.right,
                        left: glyph.left,
                        bottom: glyph.bottom,
                    }}
                >
                    <motion.span
                        animate={
                            prefersReducedMotion
                                ? { x: 0, y: 0, rotate: glyph.rotate }
                                : {
                                    x: [0, glyph.driftX, 0],
                                    y: [0, glyph.driftY, 0],
                                    rotate: [glyph.rotate, glyph.rotate + glyph.driftRotate, glyph.rotate],
                                }
                        }
                        transition={{
                            duration: prefersReducedMotion ? 0 : 10 + index * 1.2,
                            repeat: prefersReducedMotion ? 0 : Infinity,
                            ease: 'easeInOut',
                            delay: prefersReducedMotion ? 0 : glyph.delay + 0.2,
                        }}
                        className="block font-black"
                        style={{
                            fontSize: glyph.size,
                            lineHeight: 1,
                            color: `rgba(255,255,255,${glyph.opacity})`,
                            filter: `blur(${glyph.blur})`,
                            textShadow: '0 0 80px rgba(34,211,238,0.2), 0 0 120px rgba(139,92,246,0.18)',
                            WebkitTextStroke: `1px ${glyph.stroke}`,
                        }}
                    >
                        $
                    </motion.span>
                </motion.div>
            ))}

            <div className="relative z-10 mx-auto w-full max-w-[1240px] px-[clamp(14px,4vw,30px)]">
                <motion.div
                    initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.55, ease }}
                    className="mx-auto mb-12 max-w-4xl text-center lg:mb-14"
                >
                    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200/80">
                        [ Pricing estrategico ]
                    </span>
                    <h2 className="mt-5 text-balance text-[clamp(2rem,4.4vw,3.85rem)] font-black leading-[0.94] tracking-[-0.045em] text-white">
                        Invertis una vez. Tu web factura todos los dias.
                    </h2>
                    <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/62 md:text-base">
                        Elegi el nivel de profundidad segun tu etapa actual. Mismo criterio premium en los tres planes, con distinta potencia de crecimiento.
                    </p>
                </motion.div>

                <div className="relative grid grid-cols-1 gap-7 md:gap-8 lg:gap-5 overflow-visible lg:grid-cols-3">
                    {TIERS.map((tier, index) => (
                        <PremiumPricingCard
                            key={tier.name}
                            tier={tier}
                            index={index}
                            prefersReducedMotion={!!prefersReducedMotion}
                            centerMode={isBelowLg}
                        />
                    ))}
                </div>

                <p className="mt-8 text-center text-xs text-white/36">
                    Sin letra chica. Ajustamos alcance y etapas segun tu negocio.
                </p>
            </div>
        </section>
    )
}
