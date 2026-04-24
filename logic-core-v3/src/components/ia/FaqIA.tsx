"use client"

import React, { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Minus, Plus } from "lucide-react"

type FaqItem = {
    question: string
    answer: string
}

const FAQ_ITEMS: FaqItem[] = [
    {
        question: "Que diferencia hay entre un chatbot basico y un agente IA?",
        answer:
            "Un chatbot comun sigue respuestas fijas. Un agente IA entiende contexto, consulta tus datos y ejecuta acciones reales como cotizar, agendar, crear leads y actualizar tu CRM.",
    },
    {
        question: "Cuanto cuesta implementar IA en mi empresa?",
        answer:
            "Depende del alcance. Un flujo inicial de atencion y ventas suele arrancar con setup cerrado y luego mantenimiento opcional. Definimos costos y entregables desde el inicio para evitar sorpresas.",
    },
    {
        question: "En cuanto tiempo puede quedar funcionando?",
        answer:
            "Un primer agente operativo suele salir en 2 a 4 semanas. Si hay integraciones avanzadas con CRM, ERP o multiples canales, el tiempo se extiende segun complejidad.",
    },
    {
        question: "Necesito conocimientos tecnicos para usarla?",
        answer:
            "No. La operacion diaria queda pensada para negocio, no para programadores. Tu equipo usa paneles simples y nosotros nos ocupamos de la capa tecnica.",
    },
    {
        question: "La IA se conecta con mis sistemas actuales?",
        answer:
            "Si. Podemos integrar con WhatsApp, formularios web, CRM, Sheets, ERP y APIs propias. La idea es sumar IA sin romper tu operacion actual.",
    },
    {
        question: "Que pasa si la IA no sabe responder?",
        answer:
            "Se aplica una derivacion segura a humano con todo el contexto de la conversacion. El cliente no queda colgado y tu equipo retoma sin perder informacion.",
    },
    {
        question: "Como evitan respuestas inventadas o fuera de tono?",
        answer:
            "Trabajamos con reglas de negocio, base de conocimiento validada y guardrails por rubro. El agente responde sobre datos reales de tu empresa, no sobre suposiciones.",
    },
    {
        question: "Como miden si realmente mejora ventas y soporte?",
        answer:
            "Medimos tiempos de respuesta, volumen resuelto, conversion por canal y calidad de atencion. Cada etapa queda trazada para optimizar decisiones con datos.",
    },
]

const OBJECTION_ITEMS: FaqItem[] = [
    {
        question: "Y si despues quiero cambiar mensajes o flujos?",
        answer:
            "La implementacion queda modular para iterar. Podemos ajustar prompts, reglas y automatizaciones sin rehacer todo el sistema.",
    },
    {
        question: "Y si mi rubro es muy especifico?",
        answer:
            "Precisamente ahi mas valor aporta. Configuramos lenguaje, procesos y decisiones en base a tu negocio para que la IA responda con criterio real.",
    },
    {
        question: "Y si mi equipo no se adapta rapido?",
        answer:
            "Se implementa por etapas, con procesos simples y acompanamiento. El objetivo es liberar carga operativa desde la primera version, no complicar el dia a dia.",
    },
]

const springTransition = {
    type: "spring",
    stiffness: 190,
    damping: 24,
    mass: 0.85,
} as const

const ease = [0.16, 1, 0.3, 1] as const

function LuminousAccordion({
    items,
    openIndex,
    onToggle,
    delayOffset = 0,
    tone = "emerald",
}: {
    items: FaqItem[]
    openIndex: number | null
    onToggle: (index: number) => void
    delayOffset?: number
    tone?: "emerald" | "teal"
}) {
    const accentRgb = tone === "emerald" ? "34,197,94" : "20,184,166"
    const accentText = tone === "emerald" ? "text-emerald-200" : "text-teal-200"

    return (
        <div className="space-y-3">
            {items.map((item, index) => {
                const isOpen = openIndex === index

                return (
                    <motion.article
                        key={item.question}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.5, delay: delayOffset + index * 0.05, ease }}
                        className="group/faq-item relative overflow-hidden rounded-2xl border backdrop-blur-[18px] transition-all duration-150"
                        style={{
                            borderColor: isOpen ? `rgba(${accentRgb},0.62)` : "rgba(255,255,255,0.18)",
                            background: isOpen
                                ? "linear-gradient(145deg, rgba(8,20,15,0.9) 0%, rgba(6,14,12,0.94) 62%, rgba(7,16,14,0.9) 100%)"
                                : "linear-gradient(145deg, rgba(8,14,16,0.74) 0%, rgba(7,12,15,0.68) 60%, rgba(8,14,16,0.72) 100%)",
                            boxShadow: isOpen
                                ? `0 0 0 1px rgba(${accentRgb},0.3), 0 0 30px rgba(${accentRgb},0.2), inset 0 0 20px rgba(${accentRgb},0.14)`
                                : "0 14px 42px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(255,255,255,0.05)",
                            WebkitBackdropFilter: "blur(18px) saturate(145%)",
                            backdropFilter: "blur(18px) saturate(145%)",
                        }}
                    >
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0"
                            style={{
                                opacity: isOpen ? 0.44 : 0.32,
                                background:
                                    "linear-gradient(140deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 24%, rgba(255,255,255,0.015) 62%, rgba(255,255,255,0.08) 100%)",
                            }}
                        />
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover/faq-item:opacity-100"
                            style={{
                                background:
                                    `radial-gradient(75% 85% at 0% 0%, rgba(${accentRgb},0.18) 0%, transparent 62%), ` +
                                    `radial-gradient(70% 80% at 100% 100%, rgba(${accentRgb},0.14) 0%, transparent 66%)`,
                            }}
                        />

                        <button
                            onClick={() => onToggle(index)}
                            aria-expanded={isOpen}
                            className="relative z-10 w-full px-5 py-6 text-left"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <span
                                    className="max-w-3xl text-[clamp(1rem,1.6vw,1.2rem)] font-semibold leading-relaxed text-white transition-colors duration-150"
                                    style={{ color: isOpen ? "rgba(241,245,249,0.98)" : "rgba(255,255,255,0.92)" }}
                                >
                                    {item.question}
                                </span>

                                <div
                                    className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-150"
                                    style={{
                                        borderColor: isOpen ? `rgba(${accentRgb},0.64)` : "rgba(255,255,255,0.16)",
                                        background: isOpen ? `rgba(${accentRgb},0.2)` : "rgba(255,255,255,0.04)",
                                        boxShadow: isOpen ? `0 0 18px rgba(${accentRgb},0.4)` : "none",
                                    }}
                                >
                                    {isOpen ? <Minus size={15} className={accentText} /> : <Plus size={15} className="text-white/70" />}
                                </div>
                            </div>
                        </button>

                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, y: -8 }}
                                    animate={{ height: "auto", opacity: 1, y: 0 }}
                                    exit={{ height: 0, opacity: 0, y: -6 }}
                                    transition={{
                                        height: springTransition,
                                        opacity: { duration: 0.2, ease },
                                        y: springTransition,
                                    }}
                                    className="overflow-hidden"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <motion.div
                                        initial={{ boxShadow: `0 0 0 rgba(${accentRgb},0)` }}
                                        animate={{ boxShadow: `0 0 0 1px rgba(${accentRgb},0.34), 0 0 30px rgba(${accentRgb},0.18)` }}
                                        transition={{ duration: 0.32, ease }}
                                        className="mx-5 mb-5 rounded-xl border border-white/12 bg-black/34 px-4 py-4 backdrop-blur-[14px] sm:px-5"
                                        style={{ borderColor: `rgba(${accentRgb},0.36)` }}
                                    >
                                        <p className="text-sm leading-8 text-zinc-300 md:text-[15px]">{item.answer}</p>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.article>
                )
            })}
        </div>
    )
}

export default function FaqIA() {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)
    const [openObjectionIndex, setOpenObjectionIndex] = useState<number | null>(0)
    const prefersReducedMotion = useReducedMotion()

    return (
        <section className="relative z-10 w-full overflow-hidden bg-[#00010c] px-4 py-24 md:py-28">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(120% 86% at 50% 0%, rgba(16,185,129,0.24) 0%, rgba(0,1,12,0) 58%), radial-gradient(96% 74% at 82% 90%, rgba(34,197,94,0.2) 0%, rgba(0,1,12,0) 68%), radial-gradient(80% 62% at 12% 16%, rgba(20,184,166,0.13) 0%, rgba(0,1,12,0) 64%)",
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.16]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, rgba(16,185,129,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(20,184,166,0.11) 1px, transparent 1px)",
                    backgroundSize: "7.2rem 7.2rem",
                    maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 32%, transparent 92%)",
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.2]"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(0,1,12,0) 0%, rgba(0,1,12,0.22) 38%, rgba(0,1,12,0.52) 100%)",
                }}
            />

            <motion.div
                aria-hidden="true"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, filter: "blur(10px)" }}
                whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.22 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.9, ease }}
                className="pointer-events-none absolute left-1/2 top-0 z-[1] aspect-square w-[156%] -translate-x-1/2 sm:w-[152%] md:top-1/2 md:w-[148%] md:-translate-y-1/2 lg:w-[142%] xl:w-[136%] 2xl:w-[132%]"
            >
                <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
                    <defs>
                        <linearGradient id="faq-question-stroke-ai" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(110,231,183,0.09)" />
                            <stop offset="100%" stopColor="rgba(110,231,183,0.12)" />
                        </linearGradient>
                        <linearGradient id="faq-question-fill-ai" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(16,185,129,0.1)" />
                            <stop offset="52%" stopColor="rgba(52,211,153,0.14)" />
                            <stop offset="100%" stopColor="rgba(16,185,129,0.08)" />
                        </linearGradient>
                        <pattern
                            id="faq-question-lines-ai"
                            width="26"
                            height="26"
                            patternUnits="userSpaceOnUse"
                            patternTransform="rotate(26)"
                        >
                            <rect width="26" height="26" fill="rgba(0,0,0,0)" />
                            <line x1="0" y1="0" x2="0" y2="26" stroke="rgba(167,243,208,0.16)" strokeWidth="2" />
                        </pattern>
                        <mask id="faq-question-mask-ai">
                            <rect width="1000" height="1000" fill="black" />
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="1260" fontWeight="900" fill="white">
                                ?
                            </text>
                        </mask>
                    </defs>

                    <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="1260"
                        fontWeight="900"
                        fill="transparent"
                        stroke="url(#faq-question-stroke-ai)"
                        strokeWidth="6"
                        opacity="0.5"
                    >
                        ?
                    </text>

                    <g mask="url(#faq-question-mask-ai)" opacity="0.34">
                        <rect width="1000" height="1000" fill="url(#faq-question-fill-ai)" />
                        <rect width="1000" height="1000" fill="url(#faq-question-lines-ai)" />
                    </g>
                </svg>
            </motion.div>

            <motion.div
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.55, delay: prefersReducedMotion ? 0 : 0.42, ease }}
                className="relative z-10 mx-auto max-w-4xl"
            >
                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.65, delay: 0.08, ease }}
                    className="mb-16"
                >
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-100/88 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(34,197,94,0.88)]" />
                        Preguntas frecuentes
                    </div>

                    <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-black leading-[0.96] tracking-[-0.05em] text-white">
                        Lo que queres saber
                        <br />
                        <span className="bg-gradient-to-r from-emerald-200 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                            sobre IA en tu empresa.
                        </span>
                    </h2>

                    <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300/75 md:text-lg">
                        Respuestas directas para implementacion, tiempos, integraciones y como la IA impacta ventas, soporte y operacion real.
                    </p>
                </motion.div>

                <LuminousAccordion
                    items={FAQ_ITEMS}
                    openIndex={openFaqIndex}
                    onToggle={(index) => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    tone="emerald"
                />

                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: 0.08, ease }}
                    className="mb-6 mt-14"
                >
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/[0.06] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-100/82">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/90" />
                        Objeciones comunes
                    </div>
                    <p className="max-w-3xl text-sm leading-7 text-zinc-300/72 md:text-base">
                        Las dudas que mas frenan la decision de automatizar, reunidas en un solo bloque para que avances con claridad.
                    </p>
                </motion.div>

                <LuminousAccordion
                    items={OBJECTION_ITEMS}
                    openIndex={openObjectionIndex}
                    onToggle={(index) => setOpenObjectionIndex(openObjectionIndex === index ? null : index)}
                    delayOffset={0.12}
                    tone="teal"
                />

                <motion.button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent("open-mascot-chat"))}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.45, delay: 0.08, ease }}
                    className="mt-10 w-full rounded-2xl border px-6 py-5 text-left transition-all duration-200"
                    style={{
                        borderColor: "rgba(34,197,94,0.38)",
                        background:
                            "linear-gradient(145deg, rgba(34,197,94,0.13) 0%, rgba(16,185,129,0.12) 55%, rgba(20,184,166,0.14) 100%)",
                        boxShadow: "0 0 0 1px rgba(34,197,94,0.18), 0 14px 36px rgba(0,0,0,0.34)",
                    }}
                >
                    <p
                        style={{
                            fontSize: "clamp(18px,2.2vw,24px)",
                            fontWeight: 700,
                            color: "rgba(220,252,231,0.98)",
                            margin: 0,
                        }}
                    >
                        Tenes otra pregunta?
                    </p>
                    <p
                        style={{
                            marginTop: "8px",
                            marginBottom: 0,
                            fontSize: "14px",
                            lineHeight: 1.6,
                            color: "rgba(255,255,255,0.72)",
                        }}
                    >
                        Abri el chatbot y pregunta lo que quieras.
                    </p>
                </motion.button>
            </motion.div>
        </section>
    )
}
