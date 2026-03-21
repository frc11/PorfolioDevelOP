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
        question: "¿Qué procesos se pueden automatizar en mi empresa?",
        answer: "Cualquier tarea repetitiva que hoy hace un humano copiando datos, enviando correos, completando formularios o generando reportes. Los casos más comunes: onboarding de clientes, facturación y cobranzas, seguimiento de leads, reportes automáticos, notificaciones de stock y sincronización entre sistemas. Si tu equipo hace algo manual más de 3 veces por semana, probablemente se puede automatizar.",
    },
    {
        question: "¿Cuánto ahorro en tiempo y dinero con la automatización?",
        answer: "Nuestros clientes ahorran en promedio 22 horas semanales por empleado en tareas manuales. Eso equivale a recuperar el costo de implementación en 60-90 días. En términos de dinero: una PyME con 5 empleados que pasa de procesos manuales a automatizados ahorra entre $800 y $2.000 USD mensuales en tiempo productivo.",
    },
    {
        question: "¿Qué herramientas usan para automatizar? ¿Necesito licencias?",
        answer: "Usamos principalmente n8n (open source, sin licencia perpetua), junto con APIs nativas de los sistemas que ya usás. Para integraciones con Make o Zapier también tenemos experiencia. El 80% de nuestras soluciones no requieren suscripciones mensuales adicionales — corremos n8n en tu propio servidor o en la nube.",
    },
    {
        question: "¿Mis sistemas actuales son compatibles con la automatización?",
        answer: "En casi todos los casos sí. Trabajamos con sistemas que tienen API (la mayoría de los modernos) y también con sistemas legacy mediante web scraping o exportación de archivos. Conectamos con WhatsApp Business, Gmail, Google Sheets, Notion, Salesforce, Odoo, SAP, Tango, bases de datos PostgreSQL/MySQL y más de 400 servicios.",
    },
    {
        question: "¿Cuánto tiempo lleva implementar una automatización?",
        answer: "Un flujo de automatización simple (ej: notificación automática de nuevo cliente → CRM → WhatsApp) tarda 1-2 semanas. Un sistema completo con múltiples integraciones y lógica de negocio compleja puede tomar 4-8 semanas. La mayoría de nuestros proyectos tienen resultados visibles en las primeras 2 semanas de implementación.",
    },
    {
        question: "¿Qué pasa si algo falla en el proceso automatizado?",
        answer: "Cada automatización que construimos tiene manejo de errores incorporado: si un paso falla, el sistema lo registra, reintenta automáticamente y te notifica por WhatsApp o email. También tenés un dashboard donde podés ver el estado de todos los flujos en tiempo real. Y ante cualquier problema, respondemos en menos de 4 horas hábiles.",
    },
    {
        question: "¿Necesito un equipo técnico interno para mantener las automatizaciones?",
        answer: "No. Las automatizaciones que construimos son mantenidas por nosotros o son lo suficientemente simples como para que cualquier persona no técnica pueda modificar parámetros básicos (como textos de mensajes o destinatarios). Ofrecemos también un plan de mantenimiento mensual que incluye ajustes, monitoreo y mejoras continuas.",
    },
    {
        question: "¿Trabajan con empresas de todo Argentina o solo Tucumán?",
        answer: "Todo el país. Tenemos clientes automatizando procesos en Tucumán, Buenos Aires, Córdoba, Mendoza y Salta. El trabajo es 100% remoto — hacemos el relevamiento de procesos por videollamada y las entregas por demo en vivo. Siendo del NOA entendemos el contexto de las PyMEs regionales, pero trabajamos igual con empresas de cualquier provincia.",
    },
]

export default function FaqAutomation() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <section className="relative py-32 w-full overflow-hidden">
            {/* Ambient glow — amber */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] opacity-[0.05] z-0"
                style={{
                    background:
                        "radial-gradient(ellipse at center, rgba(245,158,11,0.6) 0%, rgba(249,115,22,0.25) 40%, transparent 70%)",
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
                            background: "rgba(245,158,11,0.08)",
                            border: "1px solid rgba(245,158,11,0.22)",
                        }}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                                background: "#f59e0b",
                                boxShadow: "0 0 6px rgba(245,158,11,0.8)",
                            }}
                        />
                        <span
                            className="text-[10px] font-mono font-bold uppercase tracking-[0.22em]"
                            style={{ color: "rgba(245,158,11,0.85)" }}
                        >
                            PREGUNTAS FRECUENTES
                        </span>
                    </div>

                    <h2
                        className="font-black leading-[1.05] tracking-[-0.04em] mb-4"
                        style={{ fontSize: "clamp(32px, 4.5vw, 56px)" }}
                    >
                        <span className="text-white block">Todo lo que querés saber</span>
                        <span
                            style={{
                                background: "linear-gradient(135deg, #f59e0b, #f97316, #fb923c)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            sobre automatización.
                        </span>
                    </h2>

                    <p
                        className="text-base max-w-xl leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.42)" }}
                    >
                        Sin tecnicismos. Respondemos directamente lo que necesitás saber para
                        decidir si la automatización le sirve a tu empresa ahora.
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
                                        borderBottom: `1px solid ${isOpen ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}`,
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
                                                        "linear-gradient(to bottom, rgba(245,158,11,0.8), rgba(249,115,22,0.4), transparent)",
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
                                                color: isOpen ? "#fbbf24" : "white",
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
                                                border: `1px solid ${isOpen ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.1)"}`,
                                                background: isOpen ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.04)",
                                                color: isOpen ? "#fbbf24" : "rgba(255,255,255,0.5)",
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
