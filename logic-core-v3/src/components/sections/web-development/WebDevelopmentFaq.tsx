"use client"

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'

type FaqItem = {
    question: string
    answer: string
}

const FAQ_ITEMS: FaqItem[] = [
    {
        question: '¿Por qué no usar Wix, WordPress o TiendaNube?',
        answer:
            'Para empezar están bien. Para escalar te limitan. Las plantillas te hacen ver igual que tu competencia, son lentas y te cobran suscripción mensual por funciones básicas. Nosotros programamos desde cero en Next.js: máxima velocidad, marca inconfundible y el código es tuyo para siempre.',
    },
    {
        question: '¿Cuánto cuesta una página web profesional?',
        answer:
            'Nuestros proyectos arrancan desde $800 USD para un sitio institucional o portfolio. Una tienda online con carrito y pagos está entre $1.200 y $2.500 USD. El pago es único, sin alquiler mensual obligatorio. La retención mensual es opcional e incluye actualizaciones, hosting y soporte.',
    },
    {
        question: '¿En cuánto tiempo está lista mi web?',
        answer:
            'En 4 semanas. Semana 1: auditoría y estrategia de contenido. Semana 2: diseño en Figma con tu aprobación. Semana 3: desarrollo completo. Semana 4: integración SEO, pruebas de velocidad y lanzamiento. Tenés acceso a un link de preview desde la semana 2.',
    },
    {
        question: '¿Cómo esto se traduce en ventas reales para mi negocio?',
        answer:
            'Tu web aparece cuando alguien busca tu rubro en Google, a las 2AM, un domingo, sin que atiendas el teléfono. Cada visita es un cliente potencial que ya te está evaluando. Con formularios automáticos y WhatsApp integrado, la web empuja la conversación incluso cuando vos no estás disponible.',
    },
    {
        question: '¿Posicionan en Google (SEO)?',
        answer:
            'Sí, es parte del proceso estándar. Hacemos investigación de keywords para tu rubro en Tucumán y Argentina, optimizamos títulos, metadescripciones y estructura semántica, y generamos el sitemap. Nuestros clientes promedian 847 posiciones nuevas en Google en los primeros 90 días.',
    },
    {
        question: '¿Puedo ver ejemplos de trabajos anteriores de negocios como el mío?',
        answer:
            'Sí, tenemos un portfolio público en esta misma página con casos de gastronomía, comercio, servicios y salud. Además, si nos escribís por WhatsApp podemos mostrarte proyectos de tu rubro específico que no están en el portfolio público.',
    },
    {
        question: '¿Trabajan con negocios de otras provincias o solo Tucumán?',
        answer:
            'Todo el NOA y Argentina. Tenemos clientes en Salta, Jujuy, Catamarca, Buenos Aires y Mendoza. Siendo de Tucumán entendemos el contexto local del NOA, pero trabajamos 100% remoto para cualquier provincia. Las reuniones son por videollamada y las entregas por demo en vivo.',
    },
    {
        question: '¿Qué pasa después de la entrega? ¿Me dejan solo?',
        answer:
            'No. Ofrecemos un plan de soporte mensual que incluye hosting premium, actualizaciones de contenido, backups diarios y respuesta en menos de 4 horas ante cualquier problema. También podés contratar actualizaciones sueltas cuando querés agregar algo nuevo. Nunca quedás solo.',
    },
]

const OBJECTION_ITEMS: FaqItem[] = [
    {
        question: '¿Y si no me gusta cómo queda?',
        answer:
            'No avanzamos a desarrollo final sin tu aprobación visual. Validamos dirección, estilo y estructura por etapas.',
    },
    {
        question: '¿Qué pasa si quiero cambiar algo después?',
        answer:
            'La web queda preparada para iterar. Definimos ajustes post-lanzamiento y mejoras sin rehacer todo desde cero.',
    },
    {
        question: '¿Qué incluye exactamente?',
        answer:
            'Trabajás con alcance y entregables claros desde el inicio. Sin zonas grises ni costos sorpresa en mitad del proceso.',
    },
]

const springTransition = {
    type: 'spring',
    stiffness: 180,
    damping: 24,
    mass: 0.9,
} as const

function MatteAccordion({
    items,
    openIndex,
    onToggle,
    delayOffset = 0,
}: {
    items: FaqItem[]
    openIndex: number | null
    onToggle: (index: number) => void
    delayOffset?: number
}) {
    return (
        <div className="border-t border-white/5">
            {items.map((item, index) => {
                const isOpen = openIndex === index

                return (
                    <motion.div
                        key={item.question}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.45, delay: delayOffset + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                        className={`border-b border-white/5 transition-colors duration-200 ${
                            isOpen ? 'border-l-2 border-l-violet-500 bg-[#0A0A0F]' : 'bg-transparent hover:bg-white/[0.02]'
                        }`}
                    >
                        <button
                            onClick={() => onToggle(index)}
                            aria-expanded={isOpen}
                            className="group w-full px-5 py-7 text-left"
                        >
                            <div className="flex items-start justify-between gap-5">
                                <span className="max-w-3xl text-[clamp(1rem,1.6vw,1.2rem)] font-semibold leading-relaxed text-white transition-colors duration-200 group-hover:text-zinc-100">
                                    {item.question}
                                </span>

                                <div
                                    className={`mt-1 shrink-0 transition-colors duration-200 ${
                                        isOpen ? 'text-violet-400' : 'text-zinc-400 group-hover:text-zinc-200'
                                    }`}
                                >
                                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
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
                                            <p className="text-sm leading-8 text-zinc-400 md:text-[15px]">{item.answer}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </motion.div>
                )
            })}
        </div>
    )
}

export const WebDevelopmentFaq = () => {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)
    const [openObjectionIndex, setOpenObjectionIndex] = useState<number | null>(0)

    return (
        <section className="relative z-10 w-full bg-[#030014] px-4 py-32">
            <div className="relative mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-16"
                >
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                        Preguntas frecuentes
                    </div>

                    <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-black leading-[0.96] tracking-[-0.05em] text-white">
                        Lo que todo dueño
                        <br />
                        <span className="text-violet-400">de negocio pregunta.</span>
                    </h2>

                    <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 md:text-lg">
                        Respuestas directas para entender tiempos, inversión, soporte y cómo esta web termina convirtiéndose en una herramienta real de ventas.
                    </p>
                </motion.div>

                <MatteAccordion
                    items={FAQ_ITEMS}
                    openIndex={openFaqIndex}
                    onToggle={(index) => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                />

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-14 mb-6"
                >
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                        Objeciones comunes
                    </div>
                    <p className="max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
                        Las dudas que más frenan la decisión, unificadas acá para que tengas todo claro en un mismo lugar.
                    </p>
                </motion.div>

                <MatteAccordion
                    items={OBJECTION_ITEMS}
                    openIndex={openObjectionIndex}
                    onToggle={(index) => setOpenObjectionIndex(openObjectionIndex === index ? null : index)}
                    delayOffset={0.08}
                />
            </div>
        </section>
    )
}