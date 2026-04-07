"use client"

import React, { useRef } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import { Check, ClipboardList, Palette, RefreshCw, ShieldCheck, type LucideIcon } from "lucide-react"

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
    const prefersReduced = useReducedMotion()
    const shouldReveal = prefersReduced || isInView

    return (
        <section ref={sectionRef} className="relative overflow-hidden bg-[#020611] px-4 py-24 lg:px-8">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(34,211,238,0.08) 0%, transparent 65%)" }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[-120px] top-20 h-[340px] w-[340px] rounded-full blur-[120px]"
                style={{ background: "radial-gradient(circle, rgba(123,47,255,0.16), transparent 70%)" }}
            />

            <div className="relative z-10 mx-auto w-full max-w-6xl">
                <div className="mb-14 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/22 bg-cyan-300/10 px-4 py-1.5"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-cyan-100/90">
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
                        <span className="block bg-gradient-to-r from-cyan-200 to-violet-200 bg-clip-text text-transparent">
                            todo claro por escrito.
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ duration: 0.5, delay: 0.14, ease }}
                        className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/52 md:text-lg"
                    >
                        Esta seccion responde las dudas que frenan la decision en negocios reales, sin esperar al FAQ final.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {objections.map((item, index) => {
                        const Icon = item.icon
                        return (
                            <motion.article
                                key={item.question}
                                initial={{ opacity: 0, y: 26 }}
                                animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
                                transition={{ duration: 0.55, delay: 0.16 + index * 0.08, ease }}
                                className="rounded-[20px] border p-6"
                                style={{
                                    borderColor: "rgba(255,255,255,0.1)",
                                    background: "linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                                }}
                            >
                                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-cyan-300/25 bg-cyan-300/10">
                                    <Icon className="h-5 w-5 text-cyan-200" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold leading-tight text-white">{item.question}</h3>
                                <p className="text-sm leading-7 text-white/58">{item.answer}</p>
                            </motion.article>
                        )
                    })}
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                        transition={{ duration: 0.6, delay: 0.42, ease }}
                        className="rounded-[22px] border p-6 md:p-7"
                        style={{
                            borderColor: "rgba(34,197,94,0.28)",
                            background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(255,255,255,0.02))",
                        }}
                    >
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5">
                            <ShieldCheck className="h-4 w-4 text-emerald-300" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200/90">
                                Garantia explicita
                            </span>
                        </div>

                        <h3 className="text-[clamp(22px,3.1vw,34px)] font-black leading-[1.02] tracking-[-0.03em] text-white">
                            No avanzamos sin tu ok.
                        </h3>

                        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62 md:text-base">
                            Alcance, entregables y tiempos quedan definidos desde el dia 1. Cada hito se aprueba antes de pasar al siguiente.
                        </p>

                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 py-1.5 text-[12px] text-emerald-100/88">
                            <Check className="h-3.5 w-3.5" />
                            Sin sorpresas en mitad del proyecto
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                        transition={{ duration: 0.6, delay: 0.5, ease }}
                        className="rounded-[22px] border p-6 md:p-7"
                        style={{
                            borderColor: "rgba(0,229,255,0.24)",
                            background: "linear-gradient(145deg, rgba(0,229,255,0.07), rgba(255,255,255,0.02))",
                        }}
                    >
                        <h3 className="mb-4 text-lg font-bold text-cyan-100">Incluye exactamente</h3>
                        <div className="grid gap-2.5">
                            {includes.map((item) => (
                                <div key={item} className="flex items-start gap-2 text-sm leading-6 text-white/66">
                                    <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full border border-cyan-300/22 bg-cyan-300/10">
                                        <Check className="h-3 w-3 text-cyan-200" />
                                    </span>
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

