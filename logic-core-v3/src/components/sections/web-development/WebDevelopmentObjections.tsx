"use client"

import React, { useRef, useState } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { Check, ChevronDown, ClipboardList, Palette, RefreshCw, ShieldCheck, type LucideIcon } from "lucide-react"

type ObjectionItem = {
    icon: LucideIcon
    question: string
    answer: string
}

const objections: ObjectionItem[] = [
    {
        icon: Palette,
        question: "Y si no me gusta como queda?",
        answer: "No avanzamos a desarrollo final sin tu aprobacion visual. Validamos direccion, estilo y estructura por etapas.",
    },
    {
        icon: RefreshCw,
        question: "Que pasa si quiero cambiar algo despues?",
        answer: "La web queda preparada para iterar. Definimos ajustes post-lanzamiento y mejoras sin rehacer todo desde cero.",
    },
    {
        icon: ClipboardList,
        question: "Que incluye exactamente?",
        answer: "Trabajas con alcance y entregables claros desde el inicio. Sin zonas grises ni costos sorpresa en mitad del proceso.",
    },
]

const includes = [
    "Arquitectura y copy de conversion",
    "Diseno UI responsive",
    "Desarrollo en Next.js",
    "SEO tecnico base",
    "Integracion de formularios y WhatsApp",
    "Analytics y handoff final",
]

const ease = [0.16, 1, 0.3, 1] as const

export function WebDevelopmentObjections() {
    const sectionRef = useRef<HTMLElement>(null)
    const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
    const prefersReduced = !!useReducedMotion()
    const shouldReveal = prefersReduced || isInView
    const [openIndex, setOpenIndex] = useState(0)

    return (
        <section ref={sectionRef} className="relative overflow-hidden bg-[#020611] px-4 py-24 lg:px-8">
            <div className="relative z-10 mx-auto w-full max-w-6xl">
                <div className="mb-14 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="mb-6 inline-flex items-center gap-2 rounded-sm border border-white/10 bg-white/5 px-4 py-1.5"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500/80" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-zinc-400">
                            OBJECIONES RESPONDIDAS
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                        transition={{ duration: 0.65, delay: 0.06, ease }}
                        className="text-[clamp(30px,5vw,58px)] font-black leading-[0.94] tracking-[-0.05em]"
                    >
                        <span className="block text-white">Antes de decidir,</span>
                        <span className="block text-white">
                            todo claro por escrito.
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ duration: 0.5, delay: 0.14, ease }}
                        className="mx-auto mt-6 max-w-3xl text-base leading-8 text-zinc-400 md:text-lg"
                    >
                        Esta seccion responde las dudas que frenan la decision en negocios reales, sin esperar al FAQ final.
                    </motion.p>
                </div>

                <div className="overflow-hidden rounded-[20px] border border-white/10 bg-zinc-950/30">
                    {objections.map((item, index) => {
                        const Icon = item.icon
                        const isOpen = openIndex === index
                        return (
                            <motion.article
                                key={item.question}
                                initial={{ opacity: 0, y: 26 }}
                                animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
                                transition={{ duration: 0.55, delay: 0.16 + index * 0.08, ease }}
                                className={`transition-colors duration-300 ${isOpen ? "bg-[#0A0A0A]" : "bg-transparent"} ${index !== objections.length - 1 ? "border-b border-white/5" : ""}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                                    aria-expanded={isOpen}
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <Icon className={`h-5 w-5 shrink-0 ${isOpen ? "text-zinc-200" : "text-zinc-400"}`} />
                                        <h3 className={`text-lg font-bold leading-tight ${isOpen ? "text-white" : "text-zinc-200"}`}>{item.question}</h3>
                                    </div>
                                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-zinc-300" : "text-zinc-500"}`} />
                                </button>
                                <motion.div
                                    initial={false}
                                    animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                                    transition={{ duration: prefersReduced ? 0 : 0.24, ease: "easeOut" }}
                                    className="overflow-hidden"
                                >
                                    <p className="px-6 pb-5 pl-[3.35rem] text-sm leading-7 text-zinc-400">{item.answer}</p>
                                </motion.div>
                            </motion.article>
                        )
                    })}
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                        transition={{ duration: 0.6, delay: 0.42, ease }}
                        className="rounded-[22px] border border-white/10 bg-zinc-950/30 p-6 md:p-7"
                    >
                        <div className="mb-4 inline-flex items-center gap-2 rounded-sm border border-white/10 bg-white/5 px-3 py-1.5">
                            <ShieldCheck className="h-4 w-4 text-zinc-300" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-300">
                                Garantia explicita
                            </span>
                        </div>

                        <h3 className="text-[clamp(22px,3.1vw,34px)] font-black leading-[1.02] tracking-[-0.03em] text-white">
                            No avanzamos sin tu ok.
                        </h3>

                        <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                            Alcance, entregables y tiempos quedan definidos desde el dia 1. Cada hito se aprueba antes de pasar al siguiente.
                        </p>

                        <div className="mt-5 inline-flex items-center gap-2 rounded-sm border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] text-zinc-300">
                            <Check className="h-3.5 w-3.5 text-zinc-300" />
                            Sin sorpresas en mitad del proyecto
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                        transition={{ duration: 0.6, delay: 0.5, ease }}
                        className="rounded-[22px] border border-white/10 bg-zinc-950/30 p-6 md:p-7"
                    >
                        <h3 className="mb-4 text-lg font-bold text-white">Incluye exactamente</h3>
                        <div className="grid gap-2.5">
                            {includes.map((item) => (
                                <div key={item} className="flex items-start gap-2 text-sm leading-6 text-zinc-400">
                                    <Check className="mt-[2px] h-4 w-4 shrink-0 text-zinc-300" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
