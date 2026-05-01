"use client"

import React, { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'

type FaqItem = {
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

const OBJECTION_ITEMS: FaqItem[] = [
    {
        question: '"¿Y si algo falla en producción?"',
        answer: 'Cada flujo se monitorea 24/7 con alertas automáticas. Si algo se cae, lo sabés antes que tu cliente. Reintentos automáticos + log completo de cada ejecución. Soporte por WhatsApp con respuesta en menos de 4 horas hábiles.',
    },
    {
        question: '"¿Qué nivel de compromiso necesitamos?"',
        answer: 'Una reunión inicial de 1 hora para mapear procesos, validación rápida de los flujos diseñados (1 sesión) y capacitación final del equipo (1 hora). Después, vos seguís operando como siempre — el sistema corre solo.',
    },
    {
        question: '"¿Qué incluye exactamente el servicio?"',
        answer: 'Diseño, implementación, conexión con tus herramientas actuales, testing en ambiente real, capacitación del equipo, dashboard de monitoreo, manejo de errores, documentación técnica y 30 días de soporte post-lanzamiento incluidos.',
    },
]

const springTransition = {
    type: 'spring',
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
    tone = 'amber',
}: {
    items: FaqItem[]
    openIndex: number | null
    onToggle: (index: number) => void
    delayOffset?: number
    tone?: 'amber' | 'orange'
}) {
    const accentRgb = tone === 'amber' ? '245,158,11' : '249,115,22'
    const accentText = tone === 'amber' ? 'text-amber-400' : 'text-orange-400'

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
                            borderColor: isOpen ? `rgba(${accentRgb},0.62)` : 'rgba(255,255,255,0.18)',
                            background: isOpen
                                ? `linear-gradient(145deg, rgba(30,15,0,0.88) 0%, rgba(20,10,0,0.92) 62%, rgba(25,12,0,0.86) 100%)`
                                : 'linear-gradient(145deg, rgba(20,10,0,0.72) 0%, rgba(15,8,0,0.66) 60%, rgba(18,9,0,0.7) 100%)',
                            boxShadow: isOpen
                                ? `0 0 0 1px rgba(${accentRgb},0.3), 0 0 30px rgba(${accentRgb},0.2), inset 0 0 20px rgba(${accentRgb},0.14)`
                                : '0 14px 42px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(255,255,255,0.05)',
                            WebkitBackdropFilter: 'blur(18px) saturate(145%)',
                            backdropFilter: 'blur(18px) saturate(145%)',
                        }}
                    >
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0"
                            style={{
                                opacity: isOpen ? 0.44 : 0.32,
                                background:
                                    'linear-gradient(140deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 24%, rgba(255,255,255,0.015) 62%, rgba(255,255,255,0.08) 100%)',
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
                                    style={{ color: isOpen ? 'rgba(255,245,230,0.98)' : 'rgba(255,255,255,0.92)' }}
                                >
                                    {item.question}
                                </span>

                                <div
                                    className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-150"
                                    style={{
                                        borderColor: isOpen ? `rgba(${accentRgb},0.64)` : 'rgba(255,255,255,0.16)',
                                        background: isOpen ? `rgba(${accentRgb},0.2)` : 'rgba(255,255,255,0.04)',
                                        boxShadow: isOpen ? `0 0 18px rgba(${accentRgb},0.4)` : 'none',
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
                                    animate={{ height: 'auto', opacity: 1, y: 0 }}
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

export default function FaqAutomation() {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)
    const [openObjectionIndex, setOpenObjectionIndex] = useState<number | null>(0)
    const prefersReducedMotion = useReducedMotion()

    return (
        <section className="relative z-10 w-full overflow-hidden bg-[#070503] px-4 py-24 md:py-28">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(120% 86% at 50% 0%, rgba(180,83,9,0.26) 0%, rgba(7,5,3,0) 58%), radial-gradient(96% 74% at 82% 90%, rgba(245,158,11,0.2) 0%, rgba(7,5,3,0) 68%), radial-gradient(80% 62% at 12% 16%, rgba(249,115,22,0.12) 0%, rgba(7,5,3,0) 64%)',
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.16]"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, rgba(245,158,11,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(249,115,22,0.12) 1px, transparent 1px)',
                    backgroundSize: '7.2rem 7.2rem',
                    maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.9) 32%, transparent 92%)',
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.2]"
                style={{
                    background:
                        'linear-gradient(180deg, rgba(7,5,3,0) 0%, rgba(7,5,3,0.22) 38%, rgba(7,5,3,0.52) 100%)',
                }}
            />

            <motion.div
                aria-hidden="true"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, filter: 'blur(10px)' }}
                whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.22 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.9, ease }}
                className="pointer-events-none absolute left-1/2 top-0 z-[1] w-[156%] aspect-square -translate-x-1/2 md:top-1/2 md:-translate-y-1/2 sm:w-[152%] md:w-[148%] lg:w-[142%] xl:w-[136%] 2xl:w-[132%]"
            >
                <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
                    <defs>
                        <linearGradient id="faq-question-stroke" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(253,230,138,0.09)" />
                            <stop offset="100%" stopColor="rgba(253,230,138,0.12)" />
                        </linearGradient>
                        <linearGradient id="faq-question-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(245,158,11,0.1)" />
                            <stop offset="52%" stopColor="rgba(251,191,36,0.14)" />
                            <stop offset="100%" stopColor="rgba(245,158,11,0.08)" />
                        </linearGradient>
                        <pattern id="faq-question-lines" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(26)">
                            <rect width="26" height="26" fill="rgba(0,0,0,0)" />
                            <line x1="0" y1="0" x2="0" y2="26" stroke="rgba(253,230,138,0.16)" strokeWidth="2" />
                        </pattern>
                        <mask id="faq-question-mask">
                            <rect width="1000" height="1000" fill="black" />
                            <text
                                x="50%"
                                y="50%"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize="1260"
                                fontWeight="900"
                                fill="white"
                            >
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
                        stroke="url(#faq-question-stroke)"
                        strokeWidth="6"
                        opacity="0.5"
                    >
                        ?
                    </text>

                    <g mask="url(#faq-question-mask)" opacity="0.34">
                        <rect width="1000" height="1000" fill="url(#faq-question-fill)" />
                        <rect width="1000" height="1000" fill="url(#faq-question-lines)" />
                    </g>
                </svg>
            </motion.div>

            <motion.div
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.55, delay: prefersReducedMotion ? 0 : 0.42, ease }}
                className="relative z-10 mx-auto max-w-[90rem]"
            >
                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.65, delay: 0.08, ease }}
                    className="mb-16"
                >
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/[0.05] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-200/88 shadow-[0_0_20px_rgba(245,158,11,0.18)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.85)]" />
                        PREGUNTAS FRECUENTES
                    </div>

                    <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-black leading-[0.96] tracking-[-0.05em] text-white">
                        Todo lo que querés saber
                        <br />
                        <span className="bg-gradient-to-r from-[#f59e0b] via-[#f97316] to-[#fb923c] bg-clip-text text-transparent">
                            sobre automatización.
                        </span>
                    </h2>

                    <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300/75 md:text-lg">
                        Sin tecnicismos. Respondemos directamente lo que necesitás
                        saber para decidir si la automatización le sirve a tu empresa hoy.
                    </p>
                </motion.div>

                <LuminousAccordion
                    items={FAQ_ITEMS}
                    openIndex={openFaqIndex}
                    onToggle={(index) => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    tone="amber"
                />

                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: 0.08, ease }}
                    className="mt-14 mb-6"
                >
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/[0.06] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-orange-200/82">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500/90" />
                        ¿AÚN TENÉS DUDAS?
                    </div>
                    <p className="max-w-3xl text-sm leading-7 text-zinc-300/72 md:text-base">
                        Las objeciones más comunes, reunidas acá para que tengas claridad total en un solo bloque.
                    </p>
                </motion.div>

                <LuminousAccordion
                    items={OBJECTION_ITEMS}
                    openIndex={openObjectionIndex}
                    onToggle={(index) => setOpenObjectionIndex(openObjectionIndex === index ? null : index)}
                    delayOffset={0.12}
                    tone="orange"
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
                        borderColor: 'rgba(245,158,11,0.36)',
                        background:
                            'linear-gradient(145deg, rgba(245,158,11,0.12) 0%, rgba(249,115,22,0.12) 55%, rgba(194,65,12,0.14) 100%)',
                        boxShadow: '0 0 0 1px rgba(245,158,11,0.16), 0 14px 36px rgba(0,0,0,0.34)',
                    }}
                >
                    <p
                        style={{
                            fontSize: 'clamp(18px,2.2vw,24px)',
                            fontWeight: 700,
                            color: 'rgba(253,230,138,0.96)',
                            margin: 0,
                        }}
                    >
                        ¿Tenés otra pregunta?
                    </p>
                    <p
                        style={{
                            marginTop: '8px',
                            marginBottom: 0,
                            fontSize: '14px',
                            lineHeight: 1.6,
                            color: 'rgba(255,255,255,0.72)',
                        }}
                    >
                        Abrí el chatbot y preguntá lo que quieras — respondemos en segundos.
                    </p>
                </motion.button>
            </motion.div>
        </section>
    )
}
