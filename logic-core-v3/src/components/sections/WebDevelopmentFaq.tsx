"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

interface FaqItem {
    question: string
    answer: string
}

const FAQ_ITEMS: FaqItem[] = [
    {
        question: "¿Por qué no usar Wix, WordPress o TiendaNube?",
        answer: "Para empezar están bien. Para escalar te limitan. Las plantillas te hacen ver igual que tu competencia, son lentas y te cobran suscripción mensual por funciones básicas. Nosotros programamos desde cero en Next.js: máxima velocidad, marca inconfundible y el código es tuyo para siempre.",
    },
    {
        question: "¿Cuánto cuesta una página web profesional?",
        answer: "Nuestros proyectos arrancan desde $800 USD para un sitio institucional o portfolio. Una tienda online con carrito y pagos está entre $1.200 y $2.500 USD. El pago es único — sin alquiler mensual obligatorio. La retención mensual es opcional e incluye actualizaciones, hosting y soporte.",
    },
    {
        question: "¿En cuánto tiempo está lista mi web?",
        answer: "En 4 semanas. Semana 1: auditoría y estrategia de contenido. Semana 2: diseño en Figma con tu aprobación. Semana 3: desarrollo completo. Semana 4: integración SEO, pruebas de velocidad y lanzamiento. Tenés acceso a un link de preview desde la semana 2.",
    },
    {
        question: "¿Cómo esto se traduce en ventas reales para mi negocio?",
        answer: "Tu web aparece cuando alguien busca tu rubro en Google — a las 2AM, un domingo, sin que atiendas el teléfono. Cada visita es un cliente potencial que ya te está evaluando. Con formularios de contacto automáticos y WhatsApp integrado, la web cierra la venta por vos.",
    },
    {
        question: "¿Posicionan en Google (SEO)?",
        answer: "Sí, es parte del proceso estándar. Hacemos investigación de keywords para tu rubro en Tucumán y Argentina, optimizamos títulos, metadescripciones y estructura semántica, y generamos el sitemap. Nuestros clientes promedian 847 posiciones nuevas en Google en los primeros 90 días.",
    },
    {
        question: "¿Puedo ver ejemplos de trabajos anteriores de negocios como el mío?",
        answer: "Sí, tenemos un portfolio público en esta misma página con casos de gastronomía, comercio, servicios y salud. Además, si nos escribís por WhatsApp podemos mostrarte proyectos de tu rubro específico que no están en el portfolio público.",
    },
    {
        question: "¿Trabajan con negocios de otras provincias o solo Tucumán?",
        answer: "Todo el NOA y Argentina. Tenemos clientes en Salta, Jujuy, Catamarca, Buenos Aires y Mendoza. Siendo de Tucumán entendemos el contexto local del NOA, pero trabajamos 100% remoto para cualquier provincia. Las reuniones son por videollamada y las entregas por demo en vivo.",
    },
    {
        question: "¿Qué pasa después de la entrega? ¿Me dejan solo?",
        answer: "No. Ofrecemos un plan de soporte mensual que incluye hosting premium, actualizaciones de contenido, backups diarios y respuesta en menos de 4 horas ante cualquier problema. También podés contratar actualizaciones sueltas cuando querés agregar algo nuevo. Nunca quedás solo.",
    },
]

export const WebDevelopmentFaq = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <section className="py-32 w-full bg-[#030014] relative z-10 px-4">
            <style>{`
                @keyframes pulse-live {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.85); }
                }
            `}</style>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-16"
                >
                    <div
                        style={{
                            display: "inline-flex",
                            padding: "4px 14px",
                            borderRadius: "100px",
                            background: "rgba(0,229,255,0.08)",
                            border: "1px solid rgba(0,229,255,0.22)",
                            color: "#00e5ff",
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "0.22em",
                            textTransform: "uppercase" as const,
                            marginBottom: "24px",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <span
                            style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: "#00e5ff",
                                boxShadow: "0 0 6px rgba(0,229,255,0.8)",
                                flexShrink: 0,
                            }}
                        />
                        PREGUNTAS FRECUENTES
                    </div>

                    <h2
                        style={{
                            fontSize: "clamp(32px, 4.5vw, 56px)",
                            fontWeight: 900,
                            lineHeight: 1.05,
                            letterSpacing: "-0.04em",
                        }}
                    >
                        <span style={{ color: "white", display: "block" }}>Lo que todo dueño</span>
                        <span style={{ color: "white" }}>de negocio </span>
                        <span style={{ color: "#00e5ff" }}>pregunta.</span>
                    </h2>

                    {/* Social proof pill */}
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "12px",
                            background: "rgba(0,229,255,0.05)",
                            border: "1px solid rgba(0,229,255,0.15)",
                            borderRadius: "100px",
                            padding: "10px 20px",
                            margin: "clamp(24px,4vh,40px) 0",
                        }}
                    >
                        <div style={{ display: "flex" }}>
                            {["#00e5ff", "#7b2fff", "#00b8cc"].map((color, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: "28px",
                                        height: "28px",
                                        borderRadius: "50%",
                                        background: `linear-gradient(135deg, ${color}, rgba(0,0,0,0.3))`,
                                        border: "2px solid #030014",
                                        marginLeft: i === 0 ? 0 : "-8px",
                                        zIndex: 3 - i,
                                        position: "relative",
                                    }}
                                />
                            ))}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>
                                +47 negocios del NOA
                            </span>
                            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}>
                                ya tienen su Sucursal Digital activa
                            </span>
                        </div>
                        <div
                            style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: "#22c55e",
                                boxShadow: "0 0 8px rgba(34,197,94,0.6)",
                                animation: "pulse-live 2s ease-in-out infinite",
                                flexShrink: 0,
                            }}
                        />
                    </div>
                </motion.div>

                {/* FAQ Accordion */}
                <div className="flex flex-col">
                    {FAQ_ITEMS.map((item, index) => {
                        const isOpen = openIndex === index

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="w-full text-left relative"
                                    style={{
                                        borderBottom: `1px solid ${isOpen ? "rgba(0,229,255,0.15)" : "rgba(255,255,255,0.07)"}`,
                                        padding: "clamp(18px,2.5vh,28px) 0",
                                        transition: "border-color 200ms",
                                    }}
                                    aria-expanded={isOpen}
                                >
                                    {/* Left accent line */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ scaleY: 0 }}
                                                animate={{ scaleY: 1 }}
                                                exit={{ scaleY: 0 }}
                                                style={{
                                                    position: "absolute",
                                                    left: "-1px",
                                                    top: 0,
                                                    bottom: 0,
                                                    width: "2px",
                                                    background: "linear-gradient(to bottom, rgba(0,229,255,0.6), rgba(123,47,255,0.3), transparent)",
                                                    transformOrigin: "top",
                                                }}
                                            />
                                        )}
                                    </AnimatePresence>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                                        <span
                                            style={{
                                                fontSize: "clamp(14px,1.6vw,17px)",
                                                fontWeight: 600,
                                                color: isOpen ? "#00e5ff" : "white",
                                                transition: "color 250ms",
                                            }}
                                        >
                                            {item.question}
                                        </span>

                                        <div
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                                borderRadius: "50%",
                                                border: `1px solid ${isOpen ? "rgba(0,229,255,0.3)" : "rgba(255,255,255,0.1)"}`,
                                                background: isOpen ? "rgba(0,229,255,0.08)" : "rgba(255,255,255,0.04)",
                                                color: isOpen ? "#00e5ff" : "rgba(255,255,255,0.5)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                                transition: "all 250ms",
                                            }}
                                        >
                                            {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.28, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <p
                                                    style={{
                                                        fontSize: "14px",
                                                        lineHeight: 1.75,
                                                        color: "rgba(255,255,255,0.52)",
                                                        paddingTop: "14px",
                                                        paddingRight: "48px",
                                                        maxWidth: "680px",
                                                    }}
                                                >
                                                    {item.answer}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
