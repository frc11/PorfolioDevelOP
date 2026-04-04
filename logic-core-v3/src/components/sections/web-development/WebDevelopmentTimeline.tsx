'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, CircleCheckBig, Search, Sparkles, Wrench } from 'lucide-react'
import { VideoClimax } from './VideoClimax'

const ease = [0.16, 1, 0.3, 1] as const

const milestones = [
    {
        step: '01',
        week: 'Semana 01',
        title: 'Estrategia y diseño',
        description: 'Aterrizamos tu oferta, ordenamos el mensaje y definimos una experiencia que se sienta seria desde el primer segundo.',
        deliverable: 'Diseño aprobado antes de construir',
        side: 'left' as const,
        icon: Sparkles,
    },
    {
        step: '02',
        week: 'Semana 02',
        title: 'Construcción',
        description: 'Convertimos ese sistema en una web rápida, clara y sólida para que cada clic se sienta inmediato.',
        deliverable: 'Web funcional en entorno de prueba',
        side: 'right' as const,
        icon: Wrench,
    },
    {
        step: '03',
        week: 'Semana 03',
        title: 'Posicionamiento Google',
        description: 'Ajustamos estructura, velocidad y señales locales para que Google te entienda y te muestre donde importa.',
        deliverable: 'Search listo para salir a producción',
        side: 'left' as const,
        icon: Search,
    },
] as const

const launchChecks = [
    'Entrega completa y acceso total a tu web',
    'Base de posicionamiento lista para Google',
    'Soporte y acompañamiento durante el lanzamiento',
]

function TimelineCard({
    item,
    index,
    visible,
    contentRef,
}: {
    item: (typeof milestones)[number]
    index: number
    visible: boolean
    contentRef?: (node: HTMLElement | null) => void
}) {
    const prefersReduced = useReducedMotion()
    const fromLeft = item.side === 'left'
    const Icon = item.icon
    const isVisible = prefersReduced || visible

    return (
        <div
            className={`relative flex w-full items-center ${fromLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            style={{ marginBottom: index === milestones.length - 1 ? '0px' : 'clamp(42px, 6vh, 88px)' }}
        >
            <div className="hidden md:block md:w-[calc(50%-1.5rem)]" />

            <div className="relative z-20 hidden w-12 shrink-0 justify-center md:flex">
                <div className="relative flex h-12 w-12 items-center justify-center">
                    <div
                        className="absolute inset-0 rounded-full border transition-all duration-500"
                        style={{
                            borderColor: isVisible ? 'rgba(34,211,238,0.35)' : 'rgba(255,255,255,0.08)',
                            background: isVisible ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.03)',
                            boxShadow: isVisible ? '0 0 28px rgba(34,211,238,0.18)' : 'none',
                        }}
                    />
                    <div
                        className="absolute h-3.5 w-3.5 rounded-full transition-all duration-500"
                        style={{
                            background: isVisible ? 'radial-gradient(circle, #ffffff 0%, #67e8f9 65%)' : 'rgba(255,255,255,0.22)',
                            boxShadow: isVisible ? '0 0 18px rgba(34,211,238,0.8)' : 'none',
                        }}
                    />
                </div>
            </div>

            <motion.article
                ref={contentRef}
                initial={{ opacity: 0, x: prefersReduced ? 0 : fromLeft ? -36 : 36, y: prefersReduced ? 0 : 18 }}
                animate={isVisible ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: prefersReduced ? 0 : fromLeft ? -36 : 36, y: prefersReduced ? 0 : 18 }}
                transition={{ duration: prefersReduced ? 0 : 0.75, delay: isVisible ? 0.08 : 0, ease }}
                whileHover={prefersReduced ? {} : { y: -4 }}
                className="relative w-full md:w-[calc(50%-1.5rem)]"
            >
                <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.05] bg-white/[0.02] p-8 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-10">
                    <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),transparent_30%,transparent_72%,rgba(34,211,238,0.08))]" />
                    <div
                        className="pointer-events-none absolute -right-4 -top-10 text-[clamp(6rem,13vw,10rem)] font-black leading-none text-transparent opacity-90"
                        style={{ WebkitTextStroke: '2px rgba(255,255,255,0.14)' }}
                    >
                        {item.step}
                    </div>

                    <div className="relative z-10">
                        <div className="mb-6 flex items-center gap-4">
                            <div className="grid h-12 w-12 place-items-center rounded-[1rem] border border-white/10 bg-white/[0.03]">
                                <Icon className="size-5 animate-[float_3s_ease-in-out_infinite] text-cyan-200/90" />
                            </div>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.34em] text-cyan-200/75">{item.week}</div>
                                <div className="mt-1 text-sm text-white/35">Proceso guiado, sin fricción</div>
                            </div>
                        </div>

                        <h3 className="max-w-md text-[clamp(1.6rem,3vw,2.5rem)] font-black leading-[0.95] tracking-[-0.04em] text-white">
                            {item.title}
                        </h3>
                        <p className="mt-5 max-w-lg text-sm leading-7 text-white/55 md:text-base">
                            {item.description}
                        </p>

                        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-cyan-100/80">
                            <CircleCheckBig className="size-4 animate-[float_3s_ease-in-out_infinite]" />
                            {item.deliverable}
                        </div>
                    </div>
                </div>
            </motion.article>
        </div>
    )
}

export function WebDevelopmentTimeline() {
    const prefersReduced = useReducedMotion()
    const sectionRef = useRef<HTMLElement>(null)
    const stepRefs = useRef<Array<HTMLElement | null>>([])
    const launchRef = useRef<HTMLDivElement>(null)
    const prevScrollYRef = useRef(typeof window === 'undefined' ? 0 : window.scrollY)

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start 18%', 'end 82%'],
    })
    const { scrollY } = useScroll()

    const totalSteps = milestones.length + 1
    const [visibleStepCount, setVisibleStepCount] = useState(() => (prefersReduced ? totalSteps : 0))

    useMotionValueEvent(scrollY, 'change', (latest) => {
        if (prefersReduced) return
        if (typeof window === 'undefined') return

        const viewportBottom = latest + window.innerHeight
        const blocks = [...stepRefs.current, launchRef.current]
        const prevScrollY = prevScrollYRef.current
        const isScrollingDown = latest >= prevScrollY
        prevScrollYRef.current = latest

        setVisibleStepCount((prev) => {
            let next = prev

            if (isScrollingDown) {
                while (next < blocks.length) {
                    const block = blocks[next]
                    if (!block) break
                    const rect = block.getBoundingClientRect()
                    const top = rect.top + latest
                    if (viewportBottom >= top) {
                        next += 1
                        continue
                    }
                    break
                }
            } else {
                while (next > 0) {
                    const block = blocks[next - 1]
                    if (!block) break
                    const rect = block.getBoundingClientRect()
                    const bottom = rect.bottom + latest
                    if (viewportBottom <= bottom) {
                        next -= 1
                        continue
                    }
                    break
                }
            }

            return next === prev ? prev : next
        })
    })

    const effectiveVisibleStepCount = prefersReduced ? totalSteps : visibleStepCount
    const launchVisible = effectiveVisibleStepCount >= totalSteps

    const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])
    const lineOpacity = useTransform(scrollYProgress, [0, 0.08, 1], [0.35, 0.85, 1])

    return (
        <section id="web-development-timeline" ref={sectionRef} className="relative z-10 w-full overflow-hidden bg-[#030014] px-4 py-32">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-7px); }
                }
            `}</style>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 h-[34rem] w-[60rem] -translate-x-1/2 blur-[120px]"
                style={{ background: 'radial-gradient(ellipse at center top, rgba(34,211,238,0.08) 0%, rgba(139,92,246,0.08) 38%, transparent 72%)' }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-24 top-1/3 h-[26rem] w-[26rem] rounded-full blur-[120px]"
                style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 72%)' }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 top-[46%] h-[28rem] w-[28rem] rounded-full blur-[140px]"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 72%)' }}
            />

            <div className="relative z-10 mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: prefersReduced ? 0 : 0.7, ease }}
                    className="mx-auto mb-20 max-w-4xl text-center"
                >
                    <div className="mb-6 inline-flex rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-cyan-200/85 backdrop-blur-xl">
                        [ De cero a lanzamiento ]
                    </div>
                    <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.92] tracking-[-0.06em] text-white">
                        Cuatro semanas.
                        <br />
                        <span className="bg-gradient-to-r from-cyan-200 via-white to-violet-200 bg-clip-text text-transparent">
                            Tu negocio, transformado.
                        </span>
                    </h2>
                    <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/52 md:text-xl">
                        Un proceso corto, visible y concreto para pasar de una idea suelta a una presencia digital que ya vende y posiciona.
                    </p>
                </motion.div>

                <div className="relative">
                    <div className="pointer-events-none absolute bottom-0 left-6 top-0 w-px md:left-1/2 md:-translate-x-1/2">
                        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.08)_8%,rgba(255,255,255,0.08)_92%,transparent)]" />
                        <motion.div
                            className="absolute inset-x-0 top-0 origin-top"
                            style={{
                                scaleY: prefersReduced ? 1 : lineScale,
                                opacity: prefersReduced ? 1 : lineOpacity,
                                height: '100%',
                                background: 'linear-gradient(to bottom, rgba(103,232,249,0.95) 0%, rgba(34,211,238,1) 40%, rgba(103,232,249,0.95) 100%)',
                                boxShadow: '0 0 20px rgba(34,211,238,0.45), 0 0 48px rgba(34,211,238,0.2)',
                            }}
                        />
                    </div>

                    <div className="relative z-10">
                        {milestones.map((item, index) => (
                            <TimelineCard
                                key={item.step}
                                item={item}
                                index={index}
                                visible={effectiveVisibleStepCount >= index + 1}
                                contentRef={(node) => {
                                    stepRefs.current[index] = node
                                }}
                            />
                        ))}

                        <motion.div
                            ref={launchRef}
                            initial={{ opacity: 0, y: prefersReduced ? 0 : 30 }}
                            animate={launchVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: prefersReduced ? 0 : 30 }}
                            transition={{ duration: prefersReduced ? 0 : 0.8, ease }}
                            className="relative mt-14"
                        >
                            <div className="overflow-hidden rounded-[2.2rem] border border-white/[0.05] bg-white/[0.02] backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.4)]">
                                <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
                                    <div className="relative p-8 md:p-12">
                                        <div
                                            className="absolute -right-6 -top-10 text-[clamp(6.5rem,13vw,11rem)] font-black leading-none text-transparent opacity-90"
                                            style={{ WebkitTextStroke: '2px rgba(255,255,255,0.14)' }}
                                        >
                                            04
                                        </div>
                                        <div className="relative z-10">
                                            <div className="mb-5 text-[11px] uppercase tracking-[0.34em] text-cyan-200/75">Semana 04</div>
                                            <h3 className="text-[clamp(2rem,4vw,3.4rem)] font-black leading-[0.94] tracking-[-0.05em] text-white">
                                                Lanzamiento
                                                <br />
                                                <span className="bg-gradient-to-r from-cyan-200 to-violet-200 bg-clip-text text-transparent">
                                                    y ventas en producción.
                                                </span>
                                            </h3>
                                            <p className="mt-5 max-w-xl text-sm leading-7 text-white/55 md:text-base">
                                                Publicamos, conectamos conversiones y dejamos todo listo para que tu operación tenga una nueva sucursal activa desde el día uno.
                                            </p>

                                            <div className="mt-8 space-y-3">
                                                {launchChecks.map((check, index) => (
                                                    <motion.div
                                                        key={check}
                                                        initial={{ opacity: 0, x: prefersReduced ? 0 : -12 }}
                                                        animate={launchVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: prefersReduced ? 0 : -12 }}
                                                        transition={{ duration: prefersReduced ? 0 : 0.45, delay: launchVisible ? 0.18 + index * 0.08 : 0, ease }}
                                                        className="flex items-center gap-3 rounded-full border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-sm text-white/62"
                                                    >
                                                        <CircleCheckBig className="size-4 animate-[float_3s_ease-in-out_infinite] text-cyan-200" />
                                                        {check}
                                                    </motion.div>
                                                ))}
                                            </div>

                                            <motion.a
                                                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%20DevelOP%2C%20quiero%20iniciar%20la%20transformaci%C3%B3n%20de%20mi%20negocio`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                whileHover={prefersReduced ? {} : { scale: 1.03 }}
                                                whileTap={prefersReduced ? {} : { scale: 0.98 }}
                                                className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-7 py-4 text-[13px] font-extrabold uppercase tracking-[0.24em] text-white backdrop-blur-xl"
                                            >
                                                Iniciar transformación
                                                <ArrowRight className="size-4 animate-[float_3s_ease-in-out_infinite]" />
                                            </motion.a>
                                        </div>
                                    </div>

                                    <div className="relative min-h-[18rem] border-t border-white/[0.05] md:min-h-full md:border-l md:border-t-0">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.18),transparent_40%)]" />
                                        <VideoClimax />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
