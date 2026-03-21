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
        question: "¿Qué diferencia hay entre un chatbot normal y un agente de IA?",
        answer: "Un chatbot responde con respuestas fijas predefinidas — es básicamente un árbol de decisiones disfrazado. Un agente de IA entiende lenguaje natural, aprende del contexto de la conversación, accede a tus datos en tiempo real (stock, precios, historial del cliente) y ejecuta acciones reales: crea pedidos, envía notificaciones y actualiza tu CRM. La diferencia en conversiones es del 340% en promedio.",
    },
    {
        question: "¿Cuánto cuesta implementar IA en mi empresa?",
        answer: "Un agente conversacional básico (atención y ventas por WhatsApp) arranca desde $1.800 USD. Un sistema multiagente con integraciones a CRM, ERP y análisis predictivo puede ir de $4.000 a $12.000 USD. El costo se recupera típicamente en 2-4 meses a través de reducción de costos operativos y aumento de conversiones.",
    },
    {
        question: "¿Necesito conocimientos técnicos para usar la IA que implementan?",
        answer: "No. Diseñamos los sistemas para que los uses desde interfaces simples: dashboards web, WhatsApp o tu sistema de gestión actual. Tu equipo no necesita saber programar. La parte técnica la manejamos nosotros — vos te enfocás en los resultados.",
    },
    {
        question: "¿La IA puede conectarse con mis sistemas actuales (CRM, ERP, facturación)?",
        answer: "Sí, eso es exactamente lo que hacemos. Integramos con los principales sistemas del mercado argentino: Odoo, Salesforce, Tango, Contanet, Google Sheets, WhatsApp Business API, Instagram y más. Si tu sistema tiene una API (o incluso solo exporta CSV), podemos conectarlo.",
    },
    {
        question: "¿Los datos de mis clientes están seguros?",
        answer: "Absolutamente. Trabajamos bajo protocolos de seguridad empresarial: datos cifrados en tránsito y en reposo, acceso con autenticación de dos factores, hosting en servidores certificados (AWS o equivalente), y nunca compartimos tus datos con terceros. Podemos firmar un NDA antes de comenzar si tu empresa lo requiere.",
    },
    {
        question: "¿Cuánto tiempo lleva implementar una solución de IA?",
        answer: "Un agente conversacional básico se lanza en 3-4 semanas. Sistemas más complejos con múltiples integraciones toman 8-12 semanas. El proceso es iterativo: en la semana 2 ya tenés una versión funcional para testear con clientes reales, y mejoramos en base al feedback antes del lanzamiento oficial.",
    },
    {
        question: "¿Funciona para pymes pequeñas o solo para grandes empresas?",
        answer: "Es especialmente valioso para PyMEs. Una empresa grande puede pagar 10 personas de atención al cliente. Una PyME no puede — y ahí la IA nivela el campo. Nuestros clientes más satisfechos son estudios profesionales, comercios y empresas de servicios de 5 a 50 empleados en Tucumán y el NOA.",
    },
    {
        question: "¿Qué pasa si el cliente pregunta algo que la IA no sabe responder?",
        answer: "La IA escala automáticamente al humano correcto con toda la conversación previa. El sistema detecta cuando no puede resolver algo con confianza y transfiere la conversación a tu equipo con un resumen del contexto. Nunca deja a un cliente sin respuesta — simplemente lo conecta con la persona adecuada.",
    },
]

export default function FaqIA() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <section className="relative py-32 w-full overflow-hidden bg-[#080810]">
            {/* Ambient glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] opacity-[0.05] z-0"
                style={{
                    background:
                        "radial-gradient(ellipse at center, rgba(139,92,246,0.8) 0%, rgba(168,85,247,0.3) 40%, transparent 70%)",
                }}
            />

            <div className="relative z-10 max-w-4xl mx-auto px-4 lg:px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-16"
                >
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
                        style={{
                            background: "rgba(139,92,246,0.08)",
                            border: "1px solid rgba(139,92,246,0.22)",
                        }}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                                background: "#8b5cf6",
                                boxShadow: "0 0 6px rgba(139,92,246,0.8)",
                            }}
                        />
                        <span
                            className="text-[10px] font-mono font-bold uppercase tracking-[0.22em]"
                            style={{ color: "rgba(139,92,246,0.9)" }}
                        >
                            PREGUNTAS FRECUENTES
                        </span>
                    </div>

                    <h2
                        className="font-black leading-[1.05] tracking-[-0.04em] mb-4"
                        style={{ fontSize: "clamp(32px, 4.5vw, 56px)" }}
                    >
                        <span className="text-white block">Lo que querés saber</span>
                        <span
                            style={{
                                background: "linear-gradient(135deg, #8b5cf6, #a78bfa, #c4b5fd)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            sobre IA en tu empresa.
                        </span>
                    </h2>

                    <p
                        className="text-base max-w-xl leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.42)" }}
                    >
                        Respondemos sin tecnicismos. La IA es poderosa solo cuando la entienden las personas
                        que la van a usar.
                    </p>
                </motion.div>

                {/* Accordion */}
                <div className="flex flex-col">
                    {FAQ_ITEMS.map((item, index) => {
                        const isOpen = openIndex === index

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.07,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="w-full text-left relative"
                                    style={{
                                        borderBottom: `1px solid ${isOpen ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.06)"}`,
                                        padding: "clamp(18px,2.5vh,28px) 0",
                                        transition: "border-color 200ms",
                                    }}
                                    aria-expanded={isOpen}
                                >
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
                                                    background:
                                                        "linear-gradient(to bottom, rgba(139,92,246,0.8), rgba(168,85,247,0.4), transparent)",
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
                                                color: isOpen ? "#c4b5fd" : "white",
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
                                                border: `1px solid ${isOpen ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.1)"}`,
                                                background: isOpen ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.04)",
                                                color: isOpen ? "#c4b5fd" : "rgba(255,255,255,0.5)",
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
