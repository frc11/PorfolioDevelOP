"use client"
import React, { useState, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const FAQ_ITEMS = [
    {
        question: "¿Por qué no usar Wix o TiendaNube?",
        answer: <>Para empezar están bien. Para escalar necesitás un <strong>activo digital propio</strong>. Las plantillas te limitan, son <strong>lentas</strong> y te hacen ver <strong>igual a tu competencia</strong>. Nosotros programamos <strong>desde cero</strong> para garantizar <strong>máxima velocidad</strong> y una marca inconfundible.</>
    },
    {
        question: "¿Tengo que pagar un alquiler mensual obligatorio?",
        answer: <>No. El setup es un <strong>pago único</strong>. La retención mensual es <strong>opcional</strong> e incluye actualizaciones, hosting premium, soporte técnico y mejoras continuas. Muchos clientes arrancan <strong>solo con el setup</strong>.</>
    },
    {
        question: "¿Cómo esto se traduce en ventas reales?",
        answer: <>Tu web aparece cuando alguien busca <strong>tu rubro en Google</strong>. A las 2AM, un domingo, <strong>sin que atiendas el teléfono</strong>. Cada visita es un <strong>cliente potencial</strong> que ya te está evaluando. <strong>La web cierra la venta por vos</strong>.</>
    },
    {
        question: "¿En cuánto tiempo está lista mi web?",
        answer: <>En <strong>4 semanas</strong>. Semana 1: auditoría y estrategia. Semana 2: diseño en Figma. Semana 3: desarrollo. Semana 4: <strong>lanzamiento con todo configurado</strong>.</>
    },
    {
        question: "¿Puedo ver ejemplos de trabajos anteriores?",
        answer: <>Sí. Podés ver nuestros proyectos <strong>más arriba en esta página</strong>, o escribirnos por WhatsApp y te mostramos <strong>casos específicos de tu rubro</strong>.</>
    }
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
                    color: white; font-weight: 700; border-radius: 100px;
                    padding: 16px 40px; font-size: 15px; letter-spacing: 0.05em;
                    box-shadow: 0 0 30px rgba(37,211,102,0.25), 0 8px 24px rgba(0,0,0,0.3);
                    cursor: pointer; width: fit-content; text-decoration: none;
                    transition: all 200ms;
                }
                .cta-whatsapp:hover {
                    filter: brightness(1.1);
                    transform: scale(1.02);
                    box-shadow: 0 0 40px rgba(37,211,102,0.4), 0 12px 30px rgba(0,0,0,0.4);
                }
                .cta-secondary {
                    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
                    background: transparent; border: 1px solid rgba(255,255,255,0.15);
                    color: rgba(255,255,255,0.7); border-radius: 100px; padding: 14px 32px;
                    font-size: 14px; cursor: pointer; width: fit-content;
                    transition: all 200ms;
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
                            ¿SEGUÍS PERDIENDO CLIENTES A LAS 2AM?
                        </div>

                        {/* H2 */}
                        <h2 style={{
                            fontSize: 'clamp(36px, 5.5vw, 72px)',
                            fontWeight: 900,
                            lineHeight: 1.1,
                            marginBottom: '16px'
                        }}>
                            <span style={{ color: 'white', display: 'block' }}>Tu Sucursal Digital</span>
                            <span style={{
                                background: 'linear-gradient(135deg, #00e5ff, #7b2fff)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                display: 'block'
                            }}>
                                te espera.
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
                            Sin contrato largo. Sin sorpresas.<br />
                            Con un activo digital que trabaja por vos.
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
                                Consulta inicial gratuita · Sin compromiso
                            </span>
                        </div>

                        {/* CTAs — JERARQUÍA */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            {/* CTA PRIMARIO — WhatsApp */}
                            <motion.a
                                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%20DevelOP%2C%20quiero%20saber%20m%C3%A1s%20sobre%20la%20Sucursal%20Digital`}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: 'linear-gradient(135deg, #25d366, #128c7e)',
                                    color: 'white',
                                    fontWeight: 700,
                                    borderRadius: '100px',
                                    padding: '16px 40px',
                                    fontSize: '15px',
                                    letterSpacing: '0.05em',
                                    boxShadow: '0 0 30px rgba(37,211,102,0.25), 0 8px 24px rgba(0,0,0,0.3)',
                                    cursor: 'pointer',
                                    width: 'fit-content',
                                    transition: 'box-shadow 200ms ease'
                                }}
                            >
                                <svg viewBox="0 0 24 24" fill="#ffffff" width="20" height="20">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.547a.5.5 0 00.609.61l5.765-1.458A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.814 9.814 0 01-5.032-1.384l-.361-.214-3.718.941.972-3.634-.235-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
                                </svg>
                                <span>Escribirnos por WhatsApp →</span>
                            </motion.a>

                            {/* CTA SECUNDARIO — Formulario */}
                            <button
                                onClick={() => setShowForm(!showForm)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    color: 'rgba(255,255,255,0.7)',
                                    borderRadius: '100px',
                                    padding: '14px 32px',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    width: 'fit-content',
                                    transition: 'all 200ms ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                                }}
                            >
                                {showForm ? 'Cerrar formulario ↑' : 'Completar formulario de contacto'}
                            </button>
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

                        {/* FORMULARIO DE CONTACTO (inline) */}
                        <div
                            id="contacto-form"
                            style={{
                                maxHeight: showForm ? '600px' : '0',
                                opacity: showForm ? 1 : 0,
                                overflow: 'hidden',
                                transition: 'all 500ms ease',
                                marginTop: showForm ? '32px' : '0'
                            }}
                        >
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    console.log('Form submitted');
                                }}
                                style={{
                                    width: '100%',
                                    maxWidth: '400px',
                                    margin: '0 auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    textAlign: 'left'
                                }}
                            >
                                <input type="text" placeholder="Tu nombre" className="contact-input" required />
                                <input type="tel" placeholder="Tu WhatsApp" className="contact-input" required />

                                <select
                                    className="contact-input"
                                    defaultValue=""
                                    style={{ appearance: 'none', cursor: 'pointer' }}
                                    required
                                >
                                    <option value="" disabled>Mi rubro...</option>
                                    <option value="gastronomia" style={{ color: '#080810' }}>Gastronomía</option>
                                    <option value="comercio" style={{ color: '#080810' }}>Comercio</option>
                                    <option value="servicios" style={{ color: '#080810' }}>Servicios</option>
                                    <option value="salud" style={{ color: '#080810' }}>Salud</option>
                                    <option value="inmobiliaria" style={{ color: '#080810' }}>Inmobiliaria</option>
                                    <option value="otro" style={{ color: '#080810' }}>Otro</option>
                                </select>

                                <textarea
                                    placeholder="Contanos brevemente tu negocio (opcional)"
                                    rows={3}
                                    className="contact-input"
                                    style={{ resize: 'none' }}
                                />

                                <button
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, #00e5ff, #7b2fff)',
                                        color: '#080810',
                                        fontWeight: 700,
                                        borderRadius: '10px',
                                        padding: '14px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        border: 'none',
                                        marginTop: '8px',
                                        transition: 'all 200ms ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                                >
                                    Enviar mensaje →
                                </button>
                            </form>
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
