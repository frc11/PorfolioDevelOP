"use client"

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'

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
        answer: "Nuestros proyectos arrancan desde $800 USD para un sitio institucional o portfolio. Una tienda online con carrito y pagos está entre $1.200 y $2.500 USD. El pago es único, sin alquiler mensual obligatorio. La retención mensual es opcional e incluye actualizaciones, hosting y soporte.",
    },
    {
        question: "¿En cuánto tiempo está lista mi web?",
        answer: "En 4 semanas. Semana 1: auditoría y estrategia de contenido. Semana 2: diseño en Figma con tu aprobación. Semana 3: desarrollo completo. Semana 4: integración SEO, pruebas de velocidad y lanzamiento. Tenés acceso a un link de preview desde la semana 2.",
    },
    {
        question: "¿Cómo esto se traduce en ventas reales para mi negocio?",
        answer: "Tu web aparece cuando alguien busca tu rubro en Google, a las 2AM, un domingo, sin que atiendas el teléfono. Cada visita es un cliente potencial que ya te está evaluando. Con formularios automáticos y WhatsApp integrado, la web empuja la conversación incluso cuando vos no estás disponible.",
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

const springTransition = {
    type: 'spring',
    stiffness: 180,
    damping: 24,
    mass: 0.9,
} as const

export const WebDevelopmentFaq = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <section className="relative z-10 w-full bg-[#030014] px-4 py-32">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[54rem] -translate-x-1/2 blur-[120px]"
                style={{ background: 'radial-gradient(ellipse at center top, rgba(34,211,238,0.07) 0%, rgba(139,92,246,0.05) 42%, transparent 72%)' }}
            />

            <div className="relative mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-16"
                >
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
                        Preguntas frecuentes
                    </div>

                    <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-black leading-[0.96] tracking-[-0.05em] text-white">
                        Lo que todo dueño
                        <br />
                        <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">de negocio pregunta.</span>
                    </h2>

                    <p className="mt-6 max-w-2xl text-base leading-8 text-white/45 md:text-lg">
                        Respuestas directas para entender tiempos, inversión, soporte y cómo esta web termina convirtiéndose en una herramienta real de ventas.
                    </p>
                </motion.div>

                <div className="border-t border-white/10">
                    {FAQ_ITEMS.map((item, index) => {
                        const isOpen = openIndex === index

                        return (
                            <motion.div
                                key={item.question}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                className="border-t border-white/10 first:border-t-0"
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    aria-expanded={isOpen}
                                    className="group w-full py-7 text-left"
                                >
                                    <div className="flex items-start justify-between gap-5">
                                        <span className="max-w-3xl text-[clamp(1rem,1.6vw,1.2rem)] font-semibold leading-relaxed text-white transition-all duration-300 group-hover:text-white group-hover:[text-shadow:0_0_18px_rgba(255,255,255,0.14)]">
                                            {item.question}
                                        </span>

                                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/55 transition-all duration-300 group-hover:border-white/20 group-hover:text-white">
                                            {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                                        </div>
                                    </div>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0, y: -8 }}
                                                animate={{ height: 'auto', opacity: 1, y: 0 }}
                                                exit={{ height: 0, opacity: 0, y: -6 }}
                                                transition={{
                                                    height: springTransition,
                                                    opacity: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                                                    y: springTransition,
                                                }}
                                                className="overflow-hidden"
                                                onClick={(event) => event.stopPropagation()}
                                            >
                                                <div className="max-w-3xl pt-4 pr-10">
                                                    <p className="text-sm leading-8 text-white/52 md:text-[15px]">
                                                        {item.answer}
                                                    </p>
                                                </div>
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
