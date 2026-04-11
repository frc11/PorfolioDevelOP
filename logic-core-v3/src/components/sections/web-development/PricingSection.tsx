'use client'

import React, { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type PricingTier = {
    name: string
    subtitle: string
    price: string
    unit: string
    desc: string
    items: string[]
    colorRgb: string
    color: string
    highlight?: boolean
    badge?: string
}

const TIERS: PricingTier[] = [
    {
        name: 'Base',
        subtitle: 'Para arrancar rapido',
        price: '$490',
        unit: 'USD',
        desc: 'Landing profesional para validar oferta y empezar a captar desde Google.',
        items: ['1 pagina principal', 'SEO local inicial', 'Boton WhatsApp + formulario', 'Carga rapida mobile'],
        colorRgb: '0,229,255',
        color: '#00e5ff',
    },
    {
        name: 'Completa',
        subtitle: 'La opcion mas elegida',
        price: '$980',
        unit: 'USD',
        desc: 'La mejor relacion precio-resultado para vender mas sin complejidad innecesaria.',
        items: ['Hasta 6 paginas', 'SEO local + estructura avanzada', 'Integraciones (WhatsApp, pagos)', 'Panel editable + analitica'],
        colorRgb: '123,47,255',
        color: '#7b2fff',
        highlight: true,
        badge: 'MAS ELEGIDA',
    },
    {
        name: 'Escala',
        subtitle: 'Para operar mas grande',
        price: '$1.690',
        unit: 'USD',
        desc: 'Sumamos automatizaciones y capas extra para equipos con mas volumen.',
        items: ['Todo lo de Completa', 'Automatizaciones de ventas', 'Embudo y seguimiento de leads', 'Soporte prioritario 30 dias'],
        colorRgb: '0,229,255',
        color: '#00e5ff',
    },
]

export const PricingSection = () => {
    const prefersReducedMotion = useReducedMotion()
    const [hoveredTier, setHoveredTier] = useState<number | null>(null)

    return (
        <section
            id="pricing-section"
            className="relative z-10 w-full overflow-hidden bg-[#030014] px-4"
            style={{ padding: 'clamp(64px, 10vh, 120px) 0' }}
        >
            <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 clamp(20px, 5vw, 40px)' }}>
                <motion.div
                    initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.55 }}
                    style={{ marginBottom: 'clamp(28px, 4vh, 44px)' }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '1px',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)',
                            marginBottom: 'clamp(24px, 3vh, 34px)',
                            position: 'relative',
                        }}
                    >
                        <span
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                                background: '#030014',
                                padding: '0 14px',
                                fontSize: '10px',
                                letterSpacing: '0.2em',
                                color: 'rgba(0,229,255,0.7)',
                                fontFamily: 'monospace',
                                textTransform: 'uppercase',
                            }}
                        >
                            Planes
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        {TIERS.map((tier, index) => (
                            <motion.div
                                key={tier.name}
                                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.35 }}
                                transition={{ duration: prefersReducedMotion ? 0 : 0.55, delay: prefersReducedMotion ? 0 : index * 0.08 }}
                                onHoverStart={() => setHoveredTier(index)}
                                onHoverEnd={() => setHoveredTier(null)}
                                style={{
                                    borderRadius: '20px',
                                    padding: '36px 30px 30px',
                                    background: tier.highlight
                                        ? hoveredTier === index
                                            ? 'rgba(76,29,149,0.28)'
                                            : 'rgba(76,29,149,0.2)'
                                        : hoveredTier === index
                                            ? '#18181b'
                                            : '#0A0A0F',
                                    border: tier.highlight
                                        ? hoveredTier === index
                                            ? '1px solid rgba(139,92,246,0.9)'
                                            : '1px solid rgba(139,92,246,0.75)'
                                        : hoveredTier === index
                                            ? `1px solid rgba(${tier.colorRgb},0.4)`
                                            : '1px solid rgba(255,255,255,0.08)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    minHeight: '560px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    boxShadow: tier.highlight ? '0 24px 60px rgba(0,0,0,0.8)' : '0 12px 30px rgba(0,0,0,0.45)',
                                    transition: 'background-color 220ms ease, border-color 220ms ease',
                                }}
                            >
                                {tier.badge && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '14px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            padding: '5px 14px',
                                            borderRadius: '999px',
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            letterSpacing: '0.16em',
                                            color: 'rgb(212 212 216)',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            textTransform: 'uppercase',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {tier.badge}
                                    </div>
                                )}

                                <p style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.18em', margin: tier.badge ? '24px 0 8px' : '0 0 8px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                                    {tier.name}
                                </p>
                                <p style={{ fontSize: '14px', color: 'rgb(161 161 170)', margin: '0 0 16px' }}>{tier.subtitle}</p>
                                <div style={{ marginBottom: '12px' }}>
                                    <span style={{ fontSize: '56px', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', fontFamily: 'monospace', lineHeight: 1 }}>{tier.price}</span>
                                    <span style={{ fontSize: '14px', color: 'rgb(161 161 170)', marginLeft: '6px' }}>{tier.unit}</span>
                                </div>
                                <p style={{ fontSize: '16px', color: 'rgb(161 161 170)', lineHeight: 1.6, margin: '0 0 22px' }}>{tier.desc}</p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '11px' }}>
                                    {tier.items.map((item) => (
                                        <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '15px', color: 'rgba(255,255,255,0.62)' }}>
                                            <span style={{ color: tier.color, fontSize: '12px', fontWeight: 700 }}>✓</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>

                                <a
                                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%20DevelOP%2C%20quiero%20el%20plan%20${encodeURIComponent(tier.name)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`mt-auto inline-flex h-[54px] w-full items-center justify-center rounded-[14px] text-[13px] font-extrabold uppercase tracking-[0.12em] transition-colors duration-300 ${tier.highlight
                                            ? 'border border-violet-500 bg-violet-600 text-white hover:bg-violet-500'
                                            : 'border border-white/15 bg-transparent text-zinc-200 hover:border-white/30 hover:bg-zinc-900'
                                        }`}
                                    style={{
                                        textDecoration: 'none',
                                    }}
                                >
                                    Elegir plan
                                </a>
                            </motion.div>
                        ))}
                    </div>

                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.26)', textAlign: 'center', marginTop: '16px' }}>
                        Sin letra chica. Podemos ajustar alcance y pagos segun tu negocio.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
