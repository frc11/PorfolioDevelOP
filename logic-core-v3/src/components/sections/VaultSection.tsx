"use client"
import React, { useState, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const FAQ_ITEMS = [
    {
        question: '¿Cuánto tarda en estar lista?',
        answer: 'Cuatro semanas desde la primera reunión al lanzamiento. La semana 1 es diseño y estrategia — vos aprobás antes de que construyamos nada. Las semanas 2 y 3 son construcción y pruebas. La semana 4 es lanzamiento y posicionamiento en Google.',
    },
    {
        question: '¿Tengo que actualizar la web yo mismo?',
        answer: 'No. El mantenimiento mensual incluye cambios de precios, nuevos productos y actualizaciones de contenido. Nos mandás un mensaje por WhatsApp con lo que necesitás y lo hacemos. Sin que toques nada técnico.',
    },
    {
        question: '¿Realmente voy a aparecer primero en Google?',
        answer: 'El SEO local funciona especialmente bien para negocios del NOA porque la competencia digital todavía es baja. Posicionamos tu negocio para búsquedas de tu rubro + tu ciudad. En 60 a 90 días ya notás el aumento de tráfico orgánico.',
    },
    {
        question: '¿Funciona para un negocio chico o solo para empresas grandes?',
        answer: 'Especialmente para negocios chicos y medianos. Una pyme con buena presencia web compite de igual a igual con empresas mucho más grandes. El punto de partida ideal es cuando vendés por Instagram y WhatsApp y querés dejar de depender del algoritmo.',
    },
    {
        question: '¿Qué pasa si no me gusta el diseño?',
        answer: 'Antes de construir nada, diseñamos y vos aprobás. Incluye 2 rondas de revisiones hasta que estés conforme. No empezamos a desarrollar hasta que el diseño sea exactamente lo que querés.',
    },
    {
        question: '¿La web funciona bien en el celular?',
        answer: 'Sí, y es lo primero que garantizamos. Más del 80% de las visitas vienen desde el celular. Tu web carga en menos de 2 segundos en cualquier dispositivo y con cualquier conexión de internet.',
    },
]

export const VaultSection = () => {
    const prefersReducedMotion = useReducedMotion()
    const [openIndex, setOpenIndex] = useState<number | null>(0)
    const [showForm, setShowForm] = useState(false)

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    const headerRef = useRef(null)
    const isHeaderInView = useInView(headerRef, { once: true, amount: 0.4 })

    const ctaRef = useRef(null)
    const isCtaInView = useInView(ctaRef, { once: true, amount: 0.25 })

    const footerRef = useRef(null)
    const isFooterInView = useInView(footerRef, { once: true, amount: 0.8 })

    return (
        <section id="vault-section" className="w-full bg-[#030014] relative z-10" style={{ padding: 'clamp(80px, 12vh, 140px) 0', position: 'relative', overflow: 'hidden' }}>
            <style>{`
                .faq-wrapper {
                    position: relative;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    transition: border-bottom-color 200ms;
                }
                @keyframes livePulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.4); }
                }
                .cta-whatsapp {
                    display: inline-flex; align-items: center; gap: 10px;
                    background: linear-gradient(135deg, #25d366, #128c7e);
                    color: white; font-weight: 800; border-radius: 100px;
                    padding: 14px clamp(24px,3vw,36px); font-size: 14px; letter-spacing: 0.05em;
                    box-shadow: 0 0 28px rgba(37,211,102,0.2);
                    cursor: pointer; width: fit-content; text-decoration: none;
                    transition: all 200ms;
                    text-transform: uppercase;
                }
                .cta-whatsapp:hover {
                    transform: scale(1.04);
                    box-shadow: 0 0 40px rgba(37,211,102,0.4);
                }
                .cta-secondary {
                    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
                    background: transparent; border: 1px solid rgba(255,255,255,0.15);
                    color: rgba(255,255,255,0.7); border-radius: 100px; padding: 14px 32px;
                    font-size: 14px; cursor: pointer; width: fit-content;
                    transition: all 200ms;
                    text-decoration: none;
                }
                .cta-secondary:hover {
                    border-color: rgba(255,255,255,0.3);
                    color: white;
                }
                .contact-input {
                    width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white;
                    font-size: 14px; outline: none; transition: border-color 200ms;
                }
                .contact-input:focus {
                    border-color: rgba(0,229,255,0.4);
                }
                .contact-input::placeholder {
                    color: rgba(255,255,255,0.25);
                }
            `}</style>

            {/* GLOW 1: Violet header */}
            <div aria-hidden="true" style={{
                position: 'absolute', pointerEvents: 'none',
                top: '-60px', left: '50%', transform: 'translateX(-50%)',
                width: '500px', height: '300px',
                background: 'radial-gradient(ellipse, rgba(123,47,255,0.07) 0%, transparent 60%)',
                filter: 'blur(90px)',
                willChange: 'transform',
                zIndex: 0
            }} />

            {/* GLOW 2: Cyan CTA */}
            <div aria-hidden="true" style={{
                position: 'absolute', pointerEvents: 'none',
                bottom: '80px', left: '50%', transform: 'translateX(-50%)',
                width: '700px', height: '400px',
                background: 'radial-gradient(ellipse, rgba(0,229,255,0.07) 0%, transparent 60%)',
                filter: 'blur(100px)',
                willChange: 'transform',
                zIndex: 0
            }} />

            {/* GLOW 3: Verde WhatsApp */}
            <div aria-hidden="true" style={{
                position: 'absolute', pointerEvents: 'none',
                bottom: '120px', right: '-60px',
                width: '350px', height: '350px',
                background: 'radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 65%)',
                filter: 'blur(80px)',
                willChange: 'transform',
                zIndex: 0
            }} />

            {/* LÍNEAS DECORATIVAS LATERALES */}
            <div aria-hidden="true" style={{
                position: 'absolute', pointerEvents: 'none',
                left: 'clamp(10px,3vw,40px)', top: '8%', bottom: '8%', width: '1px',
                background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.04), transparent)',
                zIndex: 0
            }} />
            <div aria-hidden="true" style={{
                position: 'absolute', pointerEvents: 'none',
                right: 'clamp(10px,3vw,40px)', top: '8%', bottom: '8%', width: '1px',
                background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.04), transparent)',
                zIndex: 0
            }} />

            <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 clamp(20px, 5vw, 40px)', position: 'relative', zIndex: 10 }}>
                {/* Header FAQ */}
                <div ref={headerRef} className="w-full">
                    <motion.div
                        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
                        animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.4 }}
                        style={{
                            display: 'inline-flex',
                            padding: '4px 12px',
                            borderRadius: '100px',
                            background: 'rgba(0,229,255,0.1)',
                            border: '1px solid rgba(0,229,255,0.2)',
                            color: '#00e5ff',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            marginBottom: '20px'
                        }}
                    >
                        [ PREGUNTAS FRECUENTES ]
                    </motion.div>

                    <h2 style={{ display: 'block', marginBottom: 'clamp(12px, 2vh, 20px)' }}>
                        <div style={{ overflow: 'hidden' }}>
                            <motion.span
                                initial={prefersReducedMotion ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
                                animate={isHeaderInView ? { clipPath: 'inset(0 0% 0 0)' } : {}}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                style={{
                                    display: 'block',
                                    fontSize: 'clamp(28px, 3.8vw, 50px)',
                                    fontWeight: 900,
                                    color: 'white',
                                    lineHeight: 1.1
                                }}
                            >
                                Lo que todo dueño de negocio
                            </motion.span>
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <motion.span
                                initial={prefersReducedMotion ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
                                animate={isHeaderInView ? { clipPath: 'inset(0 0% 0 0)' } : {}}
                                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                style={{
                                    display: 'block',
                                    fontSize: 'clamp(28px, 3.8vw, 50px)',
                                    fontWeight: 900,
                                    background: 'linear-gradient(135deg, #00e5ff 0%, #7b2fff 100%)',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent'
                                }}
                            >
                                se pregunta.
                            </motion.span>
                        </div>
                    </h2>

                    <motion.p
                        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                        animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.35 }}
                        style={{
                            fontSize: '15px', color: 'rgba(255,255,255,0.4)',
                            fontWeight: 400, lineHeight: 1.6,
                            marginBottom: 'clamp(32px, 5vh, 52px)'
                        }}
                    >
                        Las respuestas que necesitás antes de tomar la decisión.
                    </motion.p>

                    {/* Prueba Social — pill antes del FAQ */}
                    <motion.div
                        initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
                        animate={isHeaderInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.45 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: 'clamp(32px, 4vh, 48px)',
                            paddingBottom: 'clamp(24px, 3vh, 36px)',
                            borderBottom: '1px solid rgba(255,255,255,0.07)',
                        }}
                    >
                        {/* 3 avatares apilados */}
                        <div style={{ display: 'flex', flexShrink: 0 }}>
                            {['#00e5ff', '#7b2fff', '#0099cc'].map((c, i) => (
                                <div key={i} style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${c}, rgba(0,0,0,0.4))`,
                                    border: '2px solid #080810',
                                    marginLeft: i === 0 ? 0 : -10,
                                    position: 'relative', zIndex: 3 - i,
                                }} />
                            ))}
                        </div>

                        {/* Texto */}
                        <div>
                            <div style={{
                                fontSize: 13, fontWeight: 700, color: 'white',
                                lineHeight: 1.3,
                            }}>
                                +47 negocios de Tucumán y el NOA
                            </div>
                            <div style={{
                                fontSize: 11, color: 'rgba(255,255,255,0.35)',
                                letterSpacing: '0.04em', marginTop: 2,
                            }}>
                                ya tienen su Sucursal Digital activa
                            </div>
                        </div>

                        {/* Punto verde live */}
                        <div style={{
                            marginLeft: 'auto',
                            display: 'flex', alignItems: 'center', gap: 6,
                            flexShrink: 0,
                        }}>
                            <div style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: '#22c55e',
                                boxShadow: '0 0 6px rgba(34,197,94,0.7)',
                                animation: 'livePulse 2s ease-in-out infinite',
                            }} />
                            <span style={{
                                fontSize: 10, color: 'rgba(34,197,94,0.7)',
                                letterSpacing: '0.15em',
                            }}>ACTIVO</span>
                        </div>
                    </motion.div>
                </div>

                {/* FAQ Accordion */}
                <div className="flex flex-col mb-16">
                    {FAQ_ITEMS.map((item, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <motion.div
                                key={index}
                                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.45, delay: index * 0.06 }}
                                className="faq-wrapper"
                                style={{ borderBottomColor: isOpen ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.06)' }}
                            >
                                {/* BARRA LATERAL izquierda */}
                                <div style={{
                                    position: 'absolute',
                                    left: '-clamp(20px,5vw,40px)',
                                    top: 0, bottom: 0, width: '2px',
                                    background: 'linear-gradient(to bottom, #00e5ff, rgba(0,229,255,0.2))',
                                    opacity: isOpen ? 1 : 0,
                                    transition: 'opacity 300ms, height 300ms'
                                }} />

                                {/* FILA CLICKEABLE */}
                                <div
                                    onClick={() => toggleFaq(index)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: '20px',
                                        padding: 'clamp(20px,3vh,28px) 0',
                                        cursor: 'pointer',
                                        userSelect: 'none'
                                    }}
                                >
                                    <span style={{
                                        fontSize: 'clamp(15px, 1.8vw, 17px)',
                                        fontWeight: 600,
                                        lineHeight: 1.45,
                                        color: isOpen ? 'white' : 'rgba(255,255,255,0.75)',
                                        flex: 1,
                                        transition: 'color 250ms'
                                    }}>
                                        {item.question}
                                    </span>

                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '8px',
                                        background: isOpen ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${isOpen ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                        color: isOpen ? '#00e5ff' : 'rgba(255,255,255,0.4)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, marginTop: '2px',
                                        transition: 'all 250ms'
                                    }}>
                                        <svg viewBox="0 0 14 14" width="14" height="14" fill="currentColor">
                                            {isOpen ? (
                                                <rect x="2" y="6" width="10" height="2" rx="1" />
                                            ) : (
                                                <path d="M6 6V2a1 1 0 0 1 2 0v4h4a1 1 0 0 1 0 2H8v4a1 1 0 0 1-2 0V8H2a1 1 0 0 1 0-2h4z" />
                                            )}
                                        </svg>
                                    </div>
                                </div>

                                {/* PANEL DE RESPUESTA */}
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div style={{
                                                paddingBottom: 'clamp(16px, 2.5vh, 24px)',
                                                paddingRight: 'clamp(0px, 5vw, 48px)',
                                                paddingLeft: 0,
                                                fontSize: '14px',
                                                lineHeight: 1.8,
                                                color: 'rgba(255,255,255,0.5)',
                                                cursor: 'default'
                                            }} onClick={(e) => e.stopPropagation()}>
                                                {item.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Separador antes del CTA */}
                <div style={{
                    height: '1px',
                    margin: 'clamp(48px, 7vh, 80px) 0',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)'
                }} />

                {/* WRAPPER CTA */}
                <motion.div
                    ref={ctaRef}
                    style={{
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        padding: 'clamp(48px, 7vh, 80px) clamp(24px, 5vw, 80px)',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, rgba(0,229,255,0.04) 0%, rgba(123,47,255,0.03) 100%)',
                        border: '1px solid rgba(0,229,255,0.12)'
                    }}
                >
                    {/* Glow interno */}
                    <div aria-hidden="true" style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        background: 'radial-gradient(ellipse at 50% 0%, rgba(0,229,255,0.08) 0%, transparent 60%)',
                        zIndex: 0
                    }} />

                    {/* Shimmer en borde superior */}
                    <div aria-hidden="true" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, #00e5ff 30%, #7b2fff 70%, transparent)',
                        zIndex: 1
                    }} />

                    <div style={{ position: 'relative', zIndex: 2 }}>
                        {/* EYEBROW */}
                        <div style={{
                            fontSize: '11px',
                            letterSpacing: '0.35em',
                            color: 'rgba(255,255,255,0.3)',
                            marginBottom: '20px',
                            textTransform: 'uppercase'
                        }}>
                            ¿SEGUÍS VENDIENDO SOLO POR INSTAGRAM?
                        </div>

                        {/* H2 */}
                        <h2 style={{
                            fontSize: 'clamp(36px, 5.5vw, 72px)',
                            fontWeight: 900,
                            lineHeight: 1.1,
                            marginBottom: '16px'
                        }}>
                            <span style={{ color: 'white', display: 'block' }}>Tu sucursal digital</span>
                            <span style={{
                                background: 'linear-gradient(135deg, #00e5ff, #7b2fff)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                display: 'block'
                            }}>
                                lista en 4 semanas.
                            </span>
                        </h2>

                        {/* Subtítulo */}
                        <p style={{
                            fontSize: '16px',
                            color: 'rgba(255,255,255,0.5)',
                            lineHeight: 1.6,
                            maxWidth: '480px',
                            margin: '0 auto 40px'
                        }}>
                            Sin depender del algoritmo.<br />
                            Sin perder clientes a la madrugada.<br />
                            Con Google trabajando para vos las 24 horas.
                        </p>

                        {/* GARANTÍA PILL */}
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(34,197,94,0.08)',
                            border: '1px solid rgba(34,197,94,0.2)',
                            borderRadius: '100px',
                            padding: '6px 16px',
                            marginBottom: '32px'
                        }}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#22c55e" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                                Primer diseño gratis · Sin compromiso
                            </span>
                        </div>

                        {/* CTAs — JERARQUÍA */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            {/* CTA PRIMARIO — WhatsApp */}
                            <motion.a
                                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%20DevelOP%2C%20quiero%20construir%20mi%20sucursal%20digital`}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                className="cta-whatsapp"
                            >
                                <svg viewBox="0 0 24 24" fill="#ffffff" width="20" height="20">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.547a.5.5 0 00.609.61l5.765-1.458A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.814 9.814 0 01-5.032-1.384l-.361-.214-3.718.941.972-3.634-.235-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
                                </svg>
                                <span>🚀 CONSTRUIR MI SUCURSAL →</span>
                            </motion.a>

                            {/* CTA SECUNDARIO — Showcase */}
                            <a
                                href="#showcase"
                                className="cta-secondary"
                            >
                                Ver ejemplos primero →
                            </a>
                        </div>

                        {/* MICRO-COPY */}
                        <div style={{
                            marginTop: '20px',
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.25)',
                            letterSpacing: '0.05em'
                        }}>
                            Respondemos en menos de 2 horas en horario comercial
                        </div>
                    </div>
                </motion.div>

                {/* FOOTER FINAL */}
                <motion.div
                    ref={footerRef}
                    initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                    animate={isFooterInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6 }}
                    style={{
                        marginTop: 'clamp(60px, 9vh, 100px)',
                        paddingTop: 'clamp(24px, 4vh, 36px)',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}
                >
                    {/* IZQUIERDA — identidad */}
                    <div>
                        <div style={{
                            fontSize: '18px', fontWeight: 900,
                            background: 'linear-gradient(135deg,#00e5ff,#7b2fff)',
                            WebkitBackgroundClip: 'text', color: 'transparent'
                        }}>
                            DevelOP
                        </div>
                        <div style={{
                            fontSize: '10px', color: 'rgba(255,255,255,0.2)',
                            letterSpacing: '0.15em', marginTop: '3px'
                        }}>
                            Tucumán · Argentina · NOA
                        </div>
                    </div>

                    {/* CENTRO — links */}
                    <div className="hidden md:flex" style={{ display: 'flex', gap: '24px' }}>
                        {[
                            { name: 'Inicio', href: '/' },
                            { name: 'IA', href: '/ai-implementations' },
                            { name: 'Contacto', href: '#vault-section' }
                        ].map((link, i) => (
                            <a
                                key={i} href={link.href}
                                style={{
                                    fontSize: '12px', color: 'rgba(255,255,255,0.2)',
                                    textDecoration: 'none', transition: 'color 200ms'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* DERECHA — copyright */}
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)' }}>
                        © 2025 DevelOP.
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
