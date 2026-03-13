"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const FAQ_ITEMS = [
    {
        question: "¿Por qué no usar Wix o TiendaNube?",
        answer: "Para empezar están bien. Para escalar necesitás un activo digital propio. Las plantillas te limitan, son lentas y te hacen ver igual a tu competencia. Nosotros programamos desde cero para garantizar máxima velocidad y una marca inconfundible."
    },
    {
        question: "¿Tengo que pagar un alquiler mensual obligatorio?",
        answer: "No. El setup es un pago único. La retención mensual es opcional e incluye actualizaciones, hosting premium, soporte técnico y mejoras continuas. Muchos clientes arrancan solo con el setup."
    },
    {
        question: "¿Cómo esto se traduce en ventas reales?",
        answer: "Tu web aparece cuando alguien busca tu rubro en Google. A las 2AM, un domingo, sin que atiendas el teléfono. Cada visita es un cliente potencial que ya te está evaluando. La web cierra la venta por vos."
    },
    {
        question: "¿En cuánto tiempo está lista mi web?",
        answer: "En 4 semanas. Semana 1: auditoría y estrategia. Semana 2: diseño en Figma. Semana 3: desarrollo. Semana 4: lanzamiento con todo configurado."
    },
    {
        question: "¿Puedo ver ejemplos de trabajos anteriores?",
        answer: "Sí. Podés ver nuestros proyectos más arriba en esta página, o escribirnos por WhatsApp y te mostramos casos específicos de tu rubro."
    }
]

export const WebDevelopmentFaq = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-32 w-full bg-[#030014] relative z-10 px-4">
            <style>{`
                .faq-wrapper {
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                    padding: clamp(18px,2.5vh,28px) 0;
                    cursor: pointer;
                    position: relative;
                    transition: border-bottom-color 200ms;
                }
                .faq-wrapper:hover {
                    border-bottom-color: rgba(0,229,255,0.15);
                }
                @keyframes pulse-live {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.85); }
                }
            `}</style>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div style={{
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
                        marginBottom: '24px'
                    }}>
                        [ PREGUNTAS FRECUENTES ]
                    </div>

                    <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 60px)', fontWeight: 900, lineHeight: 1.1 }}>
                        <span style={{ color: 'white', display: 'block' }}>Lo que todo dueño</span>
                        <span style={{ color: 'white' }}>de negocio </span>
                        <span style={{ color: '#00e5ff' }}>pregunta.</span>
                    </h2>

                    {/* Prueba Social — contador animado */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'rgba(0,229,255,0.06)',
                        border: '1px solid rgba(0,229,255,0.15)',
                        borderRadius: '100px',
                        padding: '10px 20px',
                        margin: 'clamp(24px,4vh,40px) 0',
                    }}>
                        {/* Avatares apilados (3 círculos) */}
                        <div style={{ display: 'flex', marginRight: '4px' }}>
                            {['#00e5ff', '#7b2fff', '#00b8cc'].map((color, i) => (
                                <div key={i} style={{
                                    width: '28px', height: '28px',
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${color}, rgba(0,0,0,0.3))`,
                                    border: '2px solid #080810',
                                    marginLeft: i === 0 ? 0 : '-8px',
                                    zIndex: 3 - i,
                                    position: 'relative',
                                }} />
                            ))}
                        </div>

                        {/* Texto */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            <span style={{
                                fontSize: '13px', fontWeight: 700, color: 'white',
                            }}>
                                +47 negocios de Tucumán
                            </span>
                            <span style={{
                                fontSize: '10px',
                                color: 'rgba(255,255,255,0.4)',
                                letterSpacing: '0.05em',
                            }}>
                                ya tienen su Sucursal Digital activa
                            </span>
                        </div>

                        {/* Punto verde "live" */}
                        <div style={{
                            width: '7px', height: '7px',
                            borderRadius: '50%',
                            background: '#22c55e',
                            boxShadow: '0 0 8px rgba(34,197,94,0.6)',
                            animation: 'pulse-live 2s ease-in-out infinite',
                            flexShrink: 0,
                        }} />
                    </div>
                </motion.div>

                {/* FAQ Accordion */}
                <div className="flex flex-col">
                    {FAQ_ITEMS.map((item, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="faq-wrapper"
                                onClick={() => toggleFaq(index)}
                            >
                                {/* Left Accent cuando abierto */}
                                {isOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        left: '-1px',
                                        top: 0,
                                        bottom: 0,
                                        width: '2px',
                                        background: 'linear-gradient(to bottom, rgba(0,229,255,0.5), transparent)'
                                    }} />
                                )}

                                {/* Question Row */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '16px'
                                }}>
                                    <span style={{
                                        fontSize: 'clamp(15px,1.8vw,18px)',
                                        fontWeight: 600,
                                        color: isOpen ? '#00e5ff' : 'white',
                                        transition: 'color 250ms'
                                    }}>
                                        {item.question}
                                    </span>

                                    {/* Icon +/- */}
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        border: `1px solid ${isOpen ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                        background: isOpen ? 'rgba(0,229,255,0.08)' : 'rgba(255,255,255,0.04)',
                                        color: isOpen ? '#00e5ff' : 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                        transition: 'all 250ms'
                                    }}>
                                        {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                                    </div>
                                </div>

                                {/* Answer Expandable */}
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden cursor-default"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div style={{
                                                fontSize: '14px',
                                                lineHeight: 1.75,
                                                color: 'rgba(255,255,255,0.55)',
                                                paddingTop: '14px',
                                                paddingRight: '48px',
                                                maxWidth: '680px'
                                            }}>
                                                {item.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
