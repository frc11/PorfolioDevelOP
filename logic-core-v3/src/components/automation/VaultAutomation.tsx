'use client'

import React, { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

type PricingTier = {
    name: string
    price: string
    unit: string
    desc: string
    items: string[]
    audience: string
    setup: string
    roi: string
    accentRgb: string
    highlight?: boolean
}

const TIERS: PricingTier[] = [
    {
        name: 'Basico',
        price: '$199',
        unit: 'USD/mes',
        desc: '1 automatizacion activa. Ideal para empezar con el flujo que mas duele.',
        items: ['WhatsApp + 1 app', 'Flujo configurado y lanzado', 'Monitoreo incluido', 'Soporte por WhatsApp'],
        audience: 'Pymes que quieren validar rapido',
        setup: '4-7 dias',
        roi: '60-90 dias',
        accentRgb: '245,158,11',
    },
    {
        name: 'Crecimiento',
        price: '$499',
        unit: 'USD/mes',
        desc: '3 o mas integraciones activas. Para empresas que quieren automatizar en serio.',
        items: ['3+ integraciones', 'Claude AI conversacional', 'Reportes automaticos', 'Soporte prioritario'],
        audience: 'Equipos con operaciones diarias intensas',
        setup: '7-14 dias',
        roi: '45-75 dias',
        accentRgb: '249,115,22',
        highlight: true,
    },
    {
        name: 'Escala',
        price: 'A medida',
        unit: '',
        desc: 'Grandes volumenes, multiples equipos o flujos complejos. Presupuesto personalizado.',
        items: ['Flujos ilimitados', 'SLA garantizado', 'Integracion con ERP/CRM', 'Account manager dedicado'],
        audience: 'Empresas multi-sede o alto volumen',
        setup: '2-5 semanas',
        roi: 'ROI proyectado por flujo',
        accentRgb: '251,146,60',
    },
]

export default function VaultAutomation() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, {
        once: true,
        amount: 0.1,
    })
    const shouldReduceMotion = useReducedMotion()

    return (
        <section
            id="pricing"
            ref={sectionRef}
            style={{
                padding: 'clamp(80px, 12vh, 140px) clamp(20px, 5vw, 80px)',
                background: '#030308',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: '-80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '800px',
                    height: '500px',
                    background: 'radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, rgba(245,158,11,0.04) 40%, transparent 65%)',
                    filter: 'blur(100px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />

            <div
                style={{
                    maxWidth: '1100px',
                    margin: '0 auto',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <motion.div
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{ textAlign: 'center', marginBottom: '34px' }}
                >
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: '1px solid rgba(245,158,11,0.25)',
                            background: 'rgba(245,158,11,0.07)',
                            borderRadius: '100px',
                            padding: '6px 16px',
                            marginBottom: '18px',
                        }}
                    >
                        <span
                            style={{
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                background: '#f59e0b',
                                boxShadow: '0 0 6px rgba(245,158,11,0.9)',
                            }}
                        />
                        <span
                            style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.2em',
                                color: 'rgba(245,158,11,0.85)',
                                textTransform: 'uppercase',
                                fontFamily: 'ui-monospace, monospace',
                            }}
                        >
                            PRICING
                        </span>
                    </div>

                    <h2
                        style={{
                            fontSize: 'clamp(34px, 5.5vw, 60px)',
                            fontWeight: 900,
                            lineHeight: 1.05,
                            letterSpacing: '-0.03em',
                            margin: '0 0 12px',
                            color: 'white',
                        }}
                    >
                        Planes para automatizar sin friccion
                    </h2>

                    <p
                        style={{
                            fontSize: '15px',
                            color: 'rgba(255,255,255,0.44)',
                            maxWidth: '640px',
                            margin: '0 auto',
                            lineHeight: 1.6,
                        }}
                    >
                        Elegi un alcance inicial, medimos impacto real y escalamos sobre resultados.
                    </p>
                </motion.div>

                <motion.div
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
                        {TIERS.map((tier) => (
                            <motion.div
                                key={tier.name}
                                whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.012 }}
                                transition={{ duration: 0.1, ease: 'linear' }}
                                style={{
                                    borderRadius: '20px',
                                    padding: 'clamp(22px, 2.3vw, 32px)',
                                    background: tier.highlight
                                        ? `linear-gradient(135deg, rgba(${tier.accentRgb},0.16) 0%, rgba(${tier.accentRgb},0.06) 48%, rgba(96,65,255,0.08) 100%)`
                                        : `linear-gradient(145deg, rgba(${tier.accentRgb},0.085) 0%, rgba(${tier.accentRgb},0.03) 55%, rgba(255,255,255,0.01) 100%)`,
                                    border: `1px solid rgba(${tier.accentRgb},${tier.highlight ? 0.34 : 0.22})`,
                                    boxShadow: tier.highlight
                                        ? `0 0 0 1px rgba(${tier.accentRgb},0.22), 0 0 42px rgba(${tier.accentRgb},0.18), 0 14px 32px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.11)`
                                        : `0 0 0 1px rgba(${tier.accentRgb},0.1), 0 0 26px rgba(${tier.accentRgb},0.1), 0 10px 26px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)`,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    minHeight: '430px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                    cursor: 'none',
                                    transition: 'background 90ms linear, border-color 90ms linear, box-shadow 90ms linear',
                                }}
                            >
                                <div
                                    aria-hidden="true"
                                    style={{
                                        position: 'absolute',
                                        inset: '-35%',
                                        background: `conic-gradient(from 240deg at 65% 30%, transparent 0deg, rgba(${tier.accentRgb},0.26) 70deg, transparent 145deg, rgba(114,84,255,0.24) 220deg, transparent 360deg)`,
                                        opacity: tier.highlight ? 0.88 : 0.58,
                                        filter: 'blur(34px)',
                                        pointerEvents: 'none',
                                    }}
                                />

                                {tier.highlight && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '2px',
                                            background: `linear-gradient(90deg, transparent, rgba(${tier.accentRgb},1), transparent)`,
                                        }}
                                    />
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', position: 'relative', zIndex: 1 }}>
                                    <p style={{ fontSize: '11px', fontWeight: 700, color: `rgba(${tier.accentRgb},0.86)`, letterSpacing: '0.15em', margin: 0, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                                        {tier.name}
                                    </p>
                                    <span
                                        style={{
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            letterSpacing: '0.12em',
                                            color: tier.highlight ? '#ffd79a' : 'rgba(255,255,255,0.58)',
                                            border: `1px solid rgba(${tier.accentRgb},0.32)`,
                                            background: `rgba(${tier.accentRgb},0.12)`,
                                            borderRadius: '100px',
                                            padding: '3px 9px',
                                            textTransform: 'uppercase',
                                            fontFamily: 'monospace',
                                        }}
                                    >
                                        {tier.highlight ? 'Recomendado' : 'Plan estable'}
                                    </span>
                                </div>

                                <div style={{ marginBottom: '2px', position: 'relative', zIndex: 1 }}>
                                    <span style={{ fontSize: 'clamp(30px, 3.6vw, 44px)', fontWeight: 900, color: 'white', letterSpacing: '-0.035em', fontFamily: 'monospace', lineHeight: 1 }}>
                                        {tier.price}
                                    </span>
                                    {tier.unit && <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginLeft: '7px' }}>{tier.unit}</span>}
                                </div>

                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.58)', lineHeight: 1.65, margin: 0, position: 'relative', zIndex: 1 }}>
                                    {tier.desc}
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '2px', position: 'relative', zIndex: 1 }}>
                                    <div style={{ border: `1px solid rgba(${tier.accentRgb},0.28)`, background: `rgba(${tier.accentRgb},0.13)`, borderRadius: '10px', padding: '8px 10px' }}>
                                        <p style={{ margin: '0 0 3px', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', fontFamily: 'monospace' }}>
                                            Setup
                                        </p>
                                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: `rgba(${tier.accentRgb},0.95)` }}>{tier.setup}</p>
                                    </div>
                                    <div style={{ border: `1px solid rgba(${tier.accentRgb},0.28)`, background: `rgba(${tier.accentRgb},0.13)`, borderRadius: '10px', padding: '8px 10px' }}>
                                        <p style={{ margin: '0 0 3px', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', fontFamily: 'monospace' }}>
                                            Retorno
                                        </p>
                                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: `rgba(${tier.accentRgb},0.95)` }}>{tier.roi}</p>
                                    </div>
                                </div>

                                <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.36)', fontFamily: 'monospace', position: 'relative', zIndex: 1 }}>
                                    Ideal para: <span style={{ color: `rgba(${tier.accentRgb},0.78)` }}>{tier.audience}</span>
                                </p>

                                <ul style={{ listStyle: 'none', padding: 0, margin: '2px 0 0', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, position: 'relative', zIndex: 1 }}>
                                    {tier.items.map((item) => (
                                        <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '13px', color: 'rgba(255,255,255,0.67)', lineHeight: 1.45 }}>
                                            <span
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    borderRadius: '50%',
                                                    background: `radial-gradient(circle, rgba(${tier.accentRgb},0.9), rgba(${tier.accentRgb},0.25))`,
                                                    boxShadow: `0 0 10px rgba(${tier.accentRgb},0.35)`,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#070709',
                                                    fontSize: '10px',
                                                    fontWeight: 900,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                v
                                            </span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>

                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <a
                                        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5493816223508'}?text=Hola%20DevelOP%2C%20quiero%20consultar%20el%20plan%20${encodeURIComponent(tier.name)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '100%',
                                            textDecoration: 'none',
                                            padding: '11px 14px',
                                            borderRadius: '11px',
                                            border: `1px solid rgba(${tier.accentRgb},0.36)`,
                                            background: `linear-gradient(135deg, rgba(${tier.accentRgb},0.2), rgba(${tier.accentRgb},0.08))`,
                                            color: tier.highlight ? '#ffd79a' : `rgba(${tier.accentRgb},0.95)`,
                                            fontSize: '11px',
                                            letterSpacing: '0.12em',
                                            textTransform: 'uppercase',
                                            fontWeight: 800,
                                            fontFamily: 'monospace',
                                            cursor: 'none',
                                        }}
                                    >
                                        Quiero este alcance
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '14px' }}>
                        Primera automatizacion sin costo · Sin contrato largo
                    </p>
                </motion.div>
            </div>
        </section>
    )
}

