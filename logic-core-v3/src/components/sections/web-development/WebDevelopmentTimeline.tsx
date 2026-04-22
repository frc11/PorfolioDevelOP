'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
    motion,
    useInView,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useTransform,
} from 'framer-motion'
import { ArrowRight, CircleCheckBig, Search, Sparkles, Wrench, type LucideIcon } from 'lucide-react'

const ease = [0.16, 1, 0.3, 1] as const
const TITLE_CLOCK_MS = 1200
const TITLE_FOG_MS = 300
const TITLE_TOTAL_MS = 1800
const CLOCK_RADIUS = 66
const CLOCK_CIRCUMFERENCE = 2 * Math.PI * CLOCK_RADIUS
const CLOCK_CENTER = 80
const CLOCK_HAND_LENGTH = 52
const LAUNCH_ACTIVE_SCROLL_THRESHOLD = 0.72
const centerHoverBand = '-45% 0px -45% 0px'
const normalizeSvgCoord = (value: number) => Number(value.toFixed(6))
const CLOCK_TICKS = Array.from({ length: 60 }, (_, index) => {
    const angle = (index / 60) * Math.PI * 2 - Math.PI / 2
    const major = index % 5 === 0
    const innerRadius = major ? 53 : 57
    const outerRadius = 63

    return {
        index,
        major,
        x1: normalizeSvgCoord(CLOCK_CENTER + Math.cos(angle) * innerRadius),
        y1: normalizeSvgCoord(CLOCK_CENTER + Math.sin(angle) * innerRadius),
        x2: normalizeSvgCoord(CLOCK_CENTER + Math.cos(angle) * outerRadius),
        y2: normalizeSvgCoord(CLOCK_CENTER + Math.sin(angle) * outerRadius),
    }
})

type TitlePhase = 'idle' | 'clock' | 'fog' | 'title'

type Milestone = {
    step: string
    week: string
    title: string
    description: string
    deliverable: string
    side: 'left' | 'right'
    icon: LucideIcon
}
const milestones: Milestone[] = [
    {
        step: '01',
        week: 'Semana 01',
        title: 'Estrategia y diseno',
        description: 'Aterrizamos tu oferta, ordenamos el mensaje y definimos una experiencia qué se sienta seria desde el primer segundo.',
        deliverable: 'Diseno aprobado antes de construir',
        side: 'left',
        icon: Sparkles,
    },
    {
        step: '02',
        week: 'Semana 02',
        title: 'Construccion',
        description: 'Convertimos ese sistema en una web rapida, clara y solida para qué cada clic se sienta inmediato.',
        deliverable: 'Web funcional en entorno de prueba',
        side: 'right',
        icon: Wrench,
    },
    {
        step: '03',
        week: 'Semana 03',
        title: 'Posicionamiento Google',
        description: 'Ajustamos estructura, velocidad y senales locales para qué Google te entienda y te muestre donde importa.',
        deliverable: 'Search listo para salir a produccion',
        side: 'left',
        icon: Search,
    },
]

const launchChecks = [
    'Entrega completa y acceso total a tu web',
    'Base de posicionamiento lista para Google',
    'Soporte y acompanamiento durante el lanzamiento',
]

function TimelineStageVisual({
    step,
    active,
    reduced,
}: {
    step: string
    active: boolean
    reduced: boolean
}) {
    if (step === '01') {
        return (
            <div
                className="relative mb-6 h-[11.75rem] overflow-hidden rounded-[1.2rem] border border-white/10 bg-[linear-gradient(150deg,rgba(4,16,30,0.9),rgba(7,12,28,0.92))]"
                style={{ boxShadow: active ? '0 0 0 1px rgba(34,211,238,0.26), 0 0 24px rgba(34,211,238,0.22)' : 'none' }}
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(56,189,248,0.34),transparent_50%),radial-gradient(circle_at_82%_82%,rgba(167,139,250,0.2),transparent_46%)]" />
                <motion.div
                    className="absolute left-5 top-5 h-20 w-[44%] rounded-xl border border-cyan-200/30 bg-cyan-200/[0.08] p-3"
                    animate={reduced ? {} : { y: [0, -3, 0], opacity: [0.75, 1, 0.75] }}
                    transition={{ duration: reduced ? 0 : 2.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                >
                    {[0, 1, 2].map((line) => (
                        <motion.div
                            key={`wire-${line}`}
                            className="mb-2 h-1.5 rounded-full bg-cyan-100/60"
                            style={{ width: `${84 - line * 17}%` }}
                            animate={reduced ? {} : { opacity: [0.42, 0.95, 0.42], scaleX: [0.98, 1.03, 0.98] }}
                            transition={{ duration: reduced ? 0 : 1.5, delay: line * 0.14, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                        />
                    ))}
                </motion.div>
                <motion.div
                    className="absolute bottom-4 right-5 h-24 w-[46%] rounded-xl border border-violet-200/30 bg-violet-200/[0.08] p-3"
                    animate={reduced ? {} : { y: [0, 4, 0], opacity: [0.65, 0.92, 0.65] }}
                    transition={{ duration: reduced ? 0 : 3.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                >
                    {[0, 1, 2, 3].map((line) => (
                        <motion.div
                            key={`layout-${line}`}
                            className="mb-2 h-1.5 rounded-full bg-violet-100/55"
                            style={{ width: `${90 - line * 12}%` }}
                            animate={reduced ? {} : { opacity: [0.35, 0.9, 0.35] }}
                            transition={{ duration: reduced ? 0 : 1.8, delay: line * 0.12, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                        />
                    ))}
                </motion.div>
                <div className="pointer-events-none absolute inset-x-6 bottom-6 h-px bg-white/20" />
                <motion.div
                    className="absolute bottom-[18px] left-6 h-2.5 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,0.9)]"
                    animate={reduced ? {} : { x: [0, 220, 0] }}
                    transition={{ duration: reduced ? 0 : 3.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                />
            </div>
        )
    }

    if (step === '02') {
        return (
            <div
                className="relative mb-6 h-[11.75rem] overflow-hidden rounded-[1.2rem] border border-white/10 bg-[linear-gradient(140deg,rgba(8,15,28,0.92),rgba(6,10,24,0.95))]"
                style={{ boxShadow: active ? '0 0 0 1px rgba(34,211,238,0.24), 0 0 20px rgba(34,211,238,0.2)' : 'none' }}
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,rgba(56,189,248,0.24),transparent_40%),radial-gradient(circle_at_20%_86%,rgba(14,165,233,0.18),transparent_44%)]" />
                <div className="absolute left-5 right-5 top-5 h-8 rounded-md border border-cyan-200/24 bg-cyan-200/[0.05] px-2 py-2">
                    <motion.div
                        className="h-full rounded-sm bg-[linear-gradient(90deg,rgba(34,211,238,0.72),rgba(56,189,248,0.22))]"
                        animate={reduced ? {} : { scaleX: [0.24, 1, 0.24], opacity: [0.55, 1, 0.55] }}
                        transition={{ duration: reduced ? 0 : 3, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                        style={{ transformOrigin: 'left center' }}
                    />
                </div>
                <div className="absolute left-5 right-5 top-17 grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((col) => (
                        <div key={`col-${col}`} className="rounded-md border border-white/12 bg-white/[0.03] p-2">
                            {[0, 1, 2].map((line) => (
                                <motion.div
                                    key={`code-${col}-${line}`}
                                    className="mb-1.5 h-1 rounded-full bg-white/55"
                                    style={{ width: `${86 - line * 16}%` }}
                                    animate={reduced ? {} : { opacity: [0.3, 0.9, 0.3] }}
                                    transition={{
                                        duration: reduced ? 0 : 1.6,
                                        delay: col * 0.12 + line * 0.08,
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: 'easeInOut',
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
                {[0, 1, 2].map((dot) => (
                    <motion.div
                        key={`packet-${dot}`}
                        className="absolute top-[58%] h-2.5 w-2.5 rounded-full bg-cyan-200/90 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                        style={{ left: '8%' }}
                        animate={reduced ? {} : { x: [0, 300], opacity: [0, 1, 1, 0] }}
                        transition={{
                            duration: reduced ? 0 : 2.6,
                            delay: dot * 0.45,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'linear',
                        }}
                    />
                ))}
            </div>
        )
    }

    return (
        <div
            className="relative mb-6 h-[11.75rem] overflow-hidden rounded-[1.2rem] border border-white/10 bg-[linear-gradient(140deg,rgba(6,14,30,0.92),rgba(7,11,28,0.95))]"
            style={{ boxShadow: active ? '0 0 0 1px rgba(34,211,238,0.24), 0 0 22px rgba(34,211,238,0.2)' : 'none' }}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgba(34,211,238,0.24),transparent_44%),radial-gradient(circle_at_84%_80%,rgba(167,139,250,0.2),transparent_42%)]" />
            <div className="absolute left-5 right-5 top-5 flex items-center gap-2 rounded-full border border-cyan-200/26 bg-cyan-200/[0.06] px-3 py-2">
                <Search className="size-3.5 text-cyan-100/86" />
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                        className="h-full rounded-full bg-[linear-gradient(90deg,rgba(56,189,248,0.95),rgba(167,139,250,0.75))]"
                        animate={reduced ? {} : { x: ['-60%', '120%'] }}
                        transition={{ duration: reduced ? 0 : 2.4, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                        style={{ width: '45%' }}
                    />
                </div>
            </div>

            <div className="absolute bottom-5 left-5 right-5 flex items-end gap-2">
                {[28, 44, 62, 84, 72, 96].map((height, idx) => (
                    <motion.div
                        key={`rank-${idx}`}
                        className="w-full rounded-t-md bg-[linear-gradient(180deg,rgba(56,189,248,0.88),rgba(125,211,252,0.22))]"
                        style={{ height: `${height}%`, maxHeight: '92px' }}
                        animate={reduced ? {} : { scaleY: [0.7, 1, 0.76], opacity: [0.5, 1, 0.6] }}
                        transition={{
                            duration: reduced ? 0 : 2.1,
                            delay: idx * 0.12,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>

            <motion.svg
                viewBox="0 0 360 140"
                className="pointer-events-none absolute inset-x-3 bottom-3 h-[48%] w-[calc(100%-1.5rem)]"
                initial={false}
            >
                <motion.path
                    d="M10 120 C70 110, 80 80, 130 86 C180 92, 220 40, 290 46 C320 50, 340 34, 350 26"
                    fill="none"
                    stroke="rgba(224,242,254,0.92)"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    animate={reduced ? {} : { pathLength: [0.2, 1, 0.2], opacity: [0.3, 1, 0.4] }}
                    transition={{ duration: reduced ? 0 : 2.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                />
            </motion.svg>
        </div>
    )
}

function LaunchLoopVisual({ active, reduced }: { active: boolean; reduced: boolean }) {
    return (
        <div className="relative h-full min-h-[18rem] overflow-hidden bg-[linear-gradient(155deg,rgba(7,20,38,0.92),rgba(8,14,30,0.95))]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.22),transparent_44%),radial-gradient(circle_at_74%_72%,rgba(167,139,250,0.2),transparent_40%)]" />
            <motion.div
                className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/34"
                animate={reduced ? {} : { scale: [0.88, 1.1, 0.88], opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: reduced ? 0 : 3.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/16"
                animate={reduced ? {} : { rotate: [0, 360] }}
                transition={{ duration: reduced ? 0 : 14, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            />
            <div className="absolute inset-x-8 bottom-8 grid grid-cols-5 items-end gap-2">
                {[42, 65, 88, 72, 96].map((h, idx) => (
                    <motion.div
                        key={`launch-bar-${idx}`}
                        className="rounded-t-md bg-[linear-gradient(180deg,rgba(56,189,248,0.95),rgba(125,211,252,0.24))]"
                        style={{ height: `${h}px` }}
                        animate={reduced ? {} : { scaleY: [0.5, 1, 0.65], opacity: [0.5, 1, 0.7] }}
                        transition={{
                            duration: reduced ? 0 : 2.3,
                            delay: idx * 0.15,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>
            <motion.div
                className="absolute left-6 top-6 rounded-lg border border-cyan-200/25 bg-cyan-200/[0.08] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-cyan-100/90"
                animate={reduced ? {} : { y: [0, -4, 0], opacity: [0.62, 1, 0.62] }}
                transition={{ duration: reduced ? 0 : 2.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            >
                Tráfico activo
            </motion.div>
            <motion.div
                className="absolute right-6 top-16 rounded-lg border border-violet-200/25 bg-violet-200/[0.08] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-violet-100/90"
                animate={reduced ? {} : { y: [0, 4, 0], opacity: [0.58, 0.95, 0.58] }}
                transition={{ duration: reduced ? 0 : 2.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            >
                Leads entrando
            </motion.div>
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    boxShadow: active ? 'inset 0 0 32px rgba(34,211,238,0.22)' : 'inset 0 0 20px rgba(34,211,238,0.12)',
                }}
            />
        </div>
    )
}

function LaunchCheckPill({
    check,
    index,
    launchVisible,
    launchActive,
    prefersReduced,
    centerMode,
}: {
    check: string
    index: number
    launchVisible: boolean
    launchActive: boolean
    prefersReduced: boolean
    centerMode: boolean
}) {
    const checkRef = useRef<HTMLDivElement>(null)
    const centered = useInView(checkRef, { amount: 0, margin: centerHoverBand })
    const centerActive = centerMode && centered
    const defaultShadow = launchActive ? '0 0 18px rgba(34,211,238,0.1)' : 'none'

    return (
        <motion.div
            initial={{ opacity: 0, x: prefersReduced ? 0 : -12 }}
            animate={launchVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: prefersReduced ? 0 : -12 }}
            transition={{ duration: prefersReduced ? 0 : 0.45, delay: launchVisible ? 0.18 + index * 0.08 : 0, ease }}
        >
            <motion.div
                ref={checkRef}
                animate={
                    centerActive
                        ? {
                              scale: 1,
                              x: 0,
                              borderColor: 'rgba(103,232,249,0.42)',
                              backgroundColor: 'rgba(14,165,233,0.12)',
                              boxShadow: '0 0 0 1px rgba(34,211,238,0.28), 0 0 26px rgba(34,211,238,0.24), inset 0 0 18px rgba(34,211,238,0.14)',
                          }
                        : {
                              scale: 1,
                              x: 0,
                              borderColor: 'rgba(255,255,255,0.08)',
                              backgroundColor: 'rgba(255,255,255,0.02)',
                              boxShadow: defaultShadow,
                          }
                }
                whileHover={
                    prefersReduced || centerMode
                        ? {}
                        : {
                              scale: 1.013,
                              x: 3,
                              borderColor: 'rgba(103,232,249,0.42)',
                              backgroundColor: 'rgba(14,165,233,0.12)',
                              boxShadow: '0 0 0 1px rgba(34,211,238,0.28), 0 0 26px rgba(34,211,238,0.24), inset 0 0 18px rgba(34,211,238,0.14)',
                          }
                }
                whileTap={prefersReduced || centerMode ? {} : { scale: 0.995 }}
                transition={{ duration: prefersReduced ? 0 : 0.12, ease: 'easeOut' }}
                className="group/check flex items-center gap-3 rounded-full border px-4 py-3 text-sm text-white/62 max-[360px]:gap-2 max-[360px]:rounded-2xl max-[360px]:px-3.5 max-[360px]:py-2.5"
            >
                <CircleCheckBig className="size-4 text-cyan-200 transition-all duration-100 group-hover/check:scale-110 group-hover/check:text-cyan-100" />
                {check}
            </motion.div>
        </motion.div>
    )
}

function TimelineCard({
    item,
    index,
    visible,
    active,
    contentRef,
}: {
    item: Milestone
    index: number
    visible: boolean
    active: boolean
    contentRef?: (node: HTMLElement | null) => void
}) {
    const prefersReduced = !!useReducedMotion()
    const fromLeft = item.side === 'left'
    const Icon = item.icon
    const isVisible = prefersReduced || visible
    const isActive = isVisible && active

    return (
        <div
            className={`relative flex w-full items-center ${fromLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            style={{ marginBottom: index === milestones.length - 1 ? '0px' : 'clamp(42px, 6vh, 88px)' }}
        >
            <div className="hidden md:block md:w-[calc(50%-1.5rem)]" />

            <div className="relative z-20 hidden w-12 shrink-0 justify-center md:flex">
                <div className="relative flex h-12 w-12 items-center justify-center">
                    <div
                        className="absolute inset-0 rounded-full border transition-all duration-300"
                        style={{
                            borderColor: isActive ? 'rgba(34,211,238,0.52)' : isVisible ? 'rgba(34,211,238,0.22)' : 'rgba(255,255,255,0.08)',
                            background: isActive ? 'rgba(34,211,238,0.18)' : isVisible ? 'rgba(34,211,238,0.08)' : 'rgba(255,255,255,0.03)',
                            boxShadow: isActive ? '0 0 38px rgba(34,211,238,0.45), 0 0 80px rgba(139,92,246,0.22)' : 'none',
                        }}
                    />
                    <div
                        className="absolute h-3.5 w-3.5 rounded-full transition-all duration-300"
                        style={{
                            background: isActive
                                ? 'radial-gradient(circle, #ffffff 0%, #67e8f9 52%, #a78bfa 100%)'
                                : isVisible
                                  ? 'radial-gradient(circle, #cffafe 0%, #67e8f9 70%)'
                                  : 'rgba(255,255,255,0.22)',
                            boxShadow: isActive ? '0 0 26px rgba(34,211,238,0.88), 0 0 40px rgba(139,92,246,0.45)' : 'none',
                        }}
                    />
                </div>
            </div>

            <motion.article
                ref={contentRef}
                initial={{ opacity: 0, x: prefersReduced ? 0 : fromLeft ? -36 : 36, y: prefersReduced ? 0 : 18 }}
                animate={isVisible ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: prefersReduced ? 0 : fromLeft ? -36 : 36, y: prefersReduced ? 0 : 18 }}
                transition={{ duration: prefersReduced ? 0 : 0.75, delay: isVisible ? 0.08 : 0, ease }}
                whileHover={prefersReduced ? {} : { y: -6, scale: 1.006 }}
                className="group relative w-full md:w-[calc(50%-1.5rem)]"
            >
                <div
                    className="relative overflow-hidden rounded-[2rem] border p-8 backdrop-blur-md transition-[border-color,box-shadow,background] duration-200 md:p-10"
                    style={{
                        borderColor: isActive
                            ? 'rgba(34,211,238,0.44)'
                            : isVisible
                              ? 'rgba(255,255,255,0.12)'
                              : 'rgba(255,255,255,0.05)',
                        background: isActive
                            ? 'linear-gradient(150deg, rgba(6,22,38,0.85) 0%, rgba(9,11,26,0.9) 60%, rgba(24,8,44,0.84) 100%)'
                            : 'rgba(255,255,255,0.02)',
                        boxShadow: isActive
                            ? '0 0 0 1px rgba(34,211,238,0.25), 0 24px 92px rgba(0,0,0,0.42), 0 0 44px rgba(34,211,238,0.18)'
                            : '0 24px 80px rgba(0,0,0,0.35)',
                    }}
                >
                    <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),transparent_30%,transparent_72%,rgba(34,211,238,0.08))]" />
                    <div
                        className="pointer-events-none absolute -right-4 -top-10 text-[clamp(6rem,13vw,10rem)] font-black leading-none text-transparent opacity-90"
                        style={{ WebkitTextStroke: isActive ? '2px rgba(103,232,249,0.3)' : '2px rgba(255,255,255,0.14)' }}
                    >
                        {item.step}
                    </div>

                    <div className="relative z-10">
                        <div className="mb-6 flex items-center gap-4">
                            <div
                                className="grid h-12 w-12 place-items-center rounded-[1rem] border transition-all duration-150"
                                style={{
                                    borderColor: isActive ? 'rgba(103,232,249,0.45)' : 'rgba(255,255,255,0.1)',
                                    background: isActive ? 'rgba(8,52,73,0.75)' : 'rgba(255,255,255,0.03)',
                                    boxShadow: isActive ? '0 0 24px rgba(34,211,238,0.42)' : 'none',
                                }}
                            >
                                <Icon className="size-5 text-cyan-200/90 transition-transform duration-150 group-hover:scale-110" />
                            </div>
                            <div>
                                <div
                                    className="text-[11px] uppercase tracking-[0.34em]"
                                    style={{ color: isActive ? 'rgba(165,243,252,0.95)' : 'rgba(165,243,252,0.75)' }}
                                >
                                    {item.week}
                                </div>
                                <div className="mt-1 text-sm text-white/35">Proceso guiado, sin fricción</div>
                            </div>
                        </div>

                        <TimelineStageVisual step={item.step} active={isActive} reduced={prefersReduced} />

                        <h3
                            className="max-w-md text-[clamp(1.6rem,3vw,2.5rem)] font-black leading-[0.95] tracking-[-0.04em]"
                            style={{ color: isActive ? 'rgba(241,245,249,0.98)' : '#ffffff' }}
                        >
                            {item.title}
                        </h3>
                        <p className="mt-5 max-w-lg text-sm leading-7 text-white/55 md:text-base">
                            {item.description}
                        </p>

                        <div
                            className="mt-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.24em] transition-all duration-150"
                            style={{
                                borderColor: isActive ? 'rgba(34,211,238,0.42)' : 'rgba(34,211,238,0.2)',
                                background: isActive ? 'rgba(8,52,73,0.58)' : 'rgba(34,211,238,0.1)',
                                color: isActive ? 'rgba(224,242,254,0.95)' : 'rgba(207,250,254,0.8)',
                                boxShadow: isActive ? '0 0 22px rgba(34,211,238,0.3)' : 'none',
                            }}
                        >
                            <CircleCheckBig className="size-4" />
                            {item.deliverable}
                        </div>
                    </div>
                </div>
            </motion.article>
        </div>
    )
}

export function WebDevelopmentTimeline() {
    const prefersReduced = !!useReducedMotion()
    const sectionRef = useRef<HTMLElement>(null)
    const stepRefs = useRef<Array<HTMLElement | null>>([])
    const launchRef = useRef<HTMLDivElement>(null)
    const prevScrollYRef = useRef(typeof window === 'undefined' ? 0 : window.scrollY)
    const titleIntroRef = useRef<HTMLDivElement>(null)
    const titleInView = useInView(titleIntroRef, { once: true, amount: 0.6 })

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start 18%', 'end 82%'],
    })
    const { scrollY } = useScroll()

    const totalSteps = milestones.length + 1
    const [visibleStepCount, setVisibleStepCount] = useState(() => (prefersReduced ? totalSteps : 0))
    const [launchPersistentActive, setLaunchPersistentActive] = useState(() => prefersReduced)
    const [titlePhase, setTitlePhase] = useState<TitlePhase>(prefersReduced ? 'title' : 'idle')
    const [isBelowLg, setIsBelowLg] = useState(false)
    const [isLaunchBtnShineActive, setIsLaunchBtnShineActive] = useState(false)
    const hasPlayedTitleIntroRef = useRef(prefersReduced)

    useEffect(() => {
        const media = window.matchMedia('(max-width: 1023.98px)')
        const sync = () => setIsBelowLg(media.matches)
        sync()

        media.addEventListener('change', sync)
        return () => media.removeEventListener('change', sync)
    }, [])

    const enableLaunchBtnAutoHover = isBelowLg && !prefersReduced

    useEffect(() => {
        if (!enableLaunchBtnAutoHover) return

        let hideTimeoutId: number | undefined

        const triggerShinyCycle = () => {
            setIsLaunchBtnShineActive(true)
            if (hideTimeoutId) window.clearTimeout(hideTimeoutId)
            hideTimeoutId = window.setTimeout(() => {
                setIsLaunchBtnShineActive(false)
            }, 560)
        }

        triggerShinyCycle()
        const intervalId = window.setInterval(triggerShinyCycle, 2560)

        return () => {
            window.clearInterval(intervalId)
            if (hideTimeoutId) window.clearTimeout(hideTimeoutId)
        }
    }, [enableLaunchBtnAutoHover])

    useEffect(() => {
        if (prefersReduced) {
            hasPlayedTitleIntroRef.current = true
            return
        }

        if (!titleInView || hasPlayedTitleIntroRef.current) return
        hasPlayedTitleIntroRef.current = true

        const clockTimer = window.setTimeout(() => {
            setTitlePhase('clock')
        }, 0)
        const fogTimer = window.setTimeout(() => {
            setTitlePhase('fog')
        }, TITLE_CLOCK_MS)
        const titleTimer = window.setTimeout(() => {
            setTitlePhase('title')
        }, TITLE_CLOCK_MS + TITLE_FOG_MS)

        return () => {
            window.clearTimeout(clockTimer)
            window.clearTimeout(fogTimer)
            window.clearTimeout(titleTimer)
        }
    }, [prefersReduced, titleInView])

    useMotionValueEvent(scrollY, 'change', (latest) => {
        if (prefersReduced) return
        if (typeof window === 'undefined') return

        const viewportBottom = latest + window.innerHeight
        const section = sectionRef.current
        if (section) {
            const sectionRect = section.getBoundingClientRect()
            const stickyRange = Math.max(section.offsetHeight - window.innerHeight, 1)
            const traveled = Math.min(Math.max(-sectionRect.top, 0), stickyRange)
            const sectionProgress = traveled / stickyRange
            const shouldBeActive = sectionProgress >= LAUNCH_ACTIVE_SCROLL_THRESHOLD
            setLaunchPersistentActive((prev) => (prev === shouldBeActive ? prev : shouldBeActive))
        }

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
                    const top = rect.top + latest
                    const isMobileLOrBelow = window.innerWidth <= 425
                    const hideOffset = Math.min(
                        rect.height * (isMobileLOrBelow ? 0.24 : 0.3),
                        window.innerHeight * (isMobileLOrBelow ? 0.42 : 0.35)
                    )
                    const hideThreshold = top + hideOffset
                    if (viewportBottom <= hideThreshold) {
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
    const launchActive = launchVisible && (prefersReduced || launchPersistentActive)
    const activeStepIndex = launchActive ? -1 : Math.max(0, Math.min(milestones.length, effectiveVisibleStepCount) - 1)
    const titleVisible = prefersReduced || titlePhase === 'title'

    const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])
    const lineOpacity = useTransform(scrollYProgress, [0, 0.1, 1], [0.24, 0.64, 0.8])
    const lineBlurOpacity = useTransform(scrollYProgress, [0, 0.2, 0.6, 1], [0.1, 0.16, 0.34, 0.46])

    return (
        <section id="web-development-timeline" ref={sectionRef} className="relative z-10 w-full overflow-hidden bg-[#020312] px-4 py-32">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(120% 84% at 62% 0%, rgba(34,211,238,0.09) 0%, rgba(2,3,18,0) 58%), radial-gradient(94% 72% at 88% 46%, rgba(59,130,246,0.12) 0%, rgba(2,3,18,0) 68%), linear-gradient(180deg, rgba(4,8,30,0.92) 0%, rgba(2,3,18,1) 58%, rgba(1,2,12,1) 100%)',
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    opacity: 0.07,
                    backgroundImage:
                        'repeating-linear-gradient(120deg, rgba(56,189,248,0.42) 0 1px, transparent 1px 26px)',
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[8%] top-[11%] h-[13rem] w-[13rem] rounded-full blur-[56px] opacity-65"
                style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.24) 0%, rgba(34,211,238,0.08) 52%, transparent 78%)' }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background: 'linear-gradient(180deg, rgba(2,3,18,0.1) 0%, rgba(2,3,18,0.28) 42%, rgba(2,3,18,0.66) 100%)',
                }}
            />

            <div className="relative z-10 mx-auto max-w-6xl">
                <div ref={titleIntroRef} className="mx-auto mb-20 max-w-4xl text-center">
                    <motion.div
                        initial={false}
                        animate={titleVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                        transition={{ duration: prefersReduced ? 0 : 0.35, ease }}
                        className="mb-6 inline-flex rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-cyan-200/85 backdrop-blur-xl"
                    >
                        [ De cero a lanzamiento ]
                    </motion.div>

                    <div className="relative min-h-[clamp(11rem,24vw,16rem)]">
                        <motion.div
                            initial={false}
                            animate={{
                                opacity: titlePhase === 'clock' || titlePhase === 'fog' ? 1 : 0,
                                scale: titlePhase === 'fog' ? 1.08 : 1,
                                filter: titlePhase === 'fog' ? 'blur(18px)' : 'blur(0px)',
                            }}
                            transition={{ duration: titlePhase === 'fog' ? TITLE_FOG_MS / 1000 : 0.25, ease }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="relative h-[168px] w-[168px] rounded-full border border-cyan-300/35 bg-[radial-gradient(circle,rgba(34,211,238,0.14)_0%,rgba(3,0,20,0.15)_70%)] shadow-[0_0_44px_rgba(34,211,238,0.25)]">
                                <svg viewBox="0 0 160 160" className="h-full w-full">
                                    <circle cx="80" cy="80" r={CLOCK_RADIUS} stroke="rgba(255,255,255,0.12)" strokeWidth="8" fill="none" />
                                    <circle cx="80" cy="80" r="63" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" fill="none" />

                                    {CLOCK_TICKS.map((tick) => (
                                        <line
                                            key={`tick-${tick.index}`}
                                            x1={tick.x1}
                                            y1={tick.y1}
                                            x2={tick.x2}
                                            y2={tick.y2}
                                            stroke={tick.major ? "rgba(224,242,254,0.55)" : "rgba(224,242,254,0.2)"}
                                            strokeWidth={tick.major ? 1.8 : 1}
                                            strokeLinecap="round"
                                        />
                                    ))}

                                    <motion.circle
                                        cx="80"
                                        cy="80"
                                        r={CLOCK_RADIUS}
                                        stroke="url(#timelineClockGradient)"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        fill="none"
                                        strokeDasharray={CLOCK_CIRCUMFERENCE}
                                        initial={{ strokeDashoffset: 0 }}
                                        animate={{ strokeDashoffset: titlePhase === 'idle' ? 0 : CLOCK_CIRCUMFERENCE }}
                                        transition={{ duration: TITLE_CLOCK_MS / 1000, ease: 'linear' }}
                                        transform="rotate(-90 80 80)"
                                    />

                                    <motion.line
                                        x1={CLOCK_CENTER}
                                        y1={CLOCK_CENTER}
                                        initial={{
                                            x2: CLOCK_CENTER,
                                            y2: CLOCK_CENTER - CLOCK_HAND_LENGTH,
                                        }}
                                        animate={
                                            titlePhase === 'idle'
                                                ? {
                                                    x2: CLOCK_CENTER,
                                                    y2: CLOCK_CENTER - CLOCK_HAND_LENGTH,
                                                }
                                                : {
                                                    x2: [
                                                        CLOCK_CENTER,
                                                        CLOCK_CENTER + CLOCK_HAND_LENGTH,
                                                        CLOCK_CENTER,
                                                        CLOCK_CENTER - CLOCK_HAND_LENGTH,
                                                        CLOCK_CENTER,
                                                    ],
                                                    y2: [
                                                        CLOCK_CENTER - CLOCK_HAND_LENGTH,
                                                        CLOCK_CENTER,
                                                        CLOCK_CENTER + CLOCK_HAND_LENGTH,
                                                        CLOCK_CENTER,
                                                        CLOCK_CENTER - CLOCK_HAND_LENGTH,
                                                    ],
                                                }
                                        }
                                        transition={{
                                            duration: TITLE_CLOCK_MS / 1000,
                                            ease: 'linear',
                                            times: [0, 0.25, 0.5, 0.75, 1],
                                        }}
                                        stroke="rgba(224,242,254,0.96)"
                                        strokeWidth="4.8"
                                        strokeLinecap="round"
                                    />
                                    <line
                                        x1={CLOCK_CENTER}
                                        y1={CLOCK_CENTER}
                                        x2={CLOCK_CENTER}
                                        y2={CLOCK_CENTER - 30}
                                        stroke="rgba(224,242,254,0.34)"
                                        strokeWidth="2.2"
                                        strokeLinecap="round"
                                    />
                                    <circle cx="80" cy="80" r="6" fill="rgba(240,249,255,0.95)" />
                                    <defs>
                                        <linearGradient id="timelineClockGradient" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#67e8f9" />
                                            <stop offset="100%" stopColor="#a78bfa" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={false}
                            animate={titleVisible ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 16, filter: 'blur(8px)' }}
                            transition={{ duration: prefersReduced ? 0 : 0.34, ease }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.92] tracking-[-0.06em] text-white">
                                Cuatro semanas.
                                <br />
                                <span className="bg-gradient-to-r from-cyan-200 via-white to-violet-200 bg-clip-text text-transparent">
                                    Tu negocio, transformado.
                                </span>
                            </h2>
                        </motion.div>
                    </div>

                    <motion.p
                        initial={false}
                        animate={titleVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                        transition={{
                            duration: prefersReduced ? 0 : 0.4,
                            delay: titleVisible ? Math.max(0, (TITLE_TOTAL_MS - 1500) / 1000) : 0,
                            ease,
                        }}
                        className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/52 md:text-xl"
                    >
                        Un proceso corto, visible y concreto para pasar de una idea suelta a una presencia digital qué ya vende y posiciona.
                    </motion.p>
                </div>

                <div className="relative">
                    <div className="pointer-events-none absolute bottom-0 left-6 top-0 w-px md:left-1/2 md:-translate-x-1/2">
                        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.08)_8%,rgba(255,255,255,0.08)_92%,transparent)]" />
                        <motion.div
                            className="absolute inset-x-0 top-0 origin-top blur-[1.5px]"
                            style={{
                                scaleY: prefersReduced ? 1 : lineScale,
                                opacity: prefersReduced ? 0.24 : lineBlurOpacity,
                                height: '100%',
                                background:
                                    'linear-gradient(to bottom, rgba(125,211,252,0.52) 0%, rgba(34,211,238,0.62) 42%, rgba(125,211,252,0.52) 100%)',
                            }}
                        />
                        <motion.div
                            className="absolute inset-x-0 top-0 origin-top"
                            style={{
                                scaleY: prefersReduced ? 1 : lineScale,
                                opacity: prefersReduced ? 1 : lineOpacity,
                                height: '100%',
                                background:
                                    'linear-gradient(to bottom, rgba(125,211,252,0.86) 0%, rgba(34,211,238,0.94) 40%, rgba(125,211,252,0.86) 100%)',
                                boxShadow: '0 0 12px rgba(34,211,238,0.24)',
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
                                active={activeStepIndex === index}
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
                            <div className="pointer-events-none absolute left-6 top-0 hidden -translate-y-1/2 md:block md:left-1/2 md:-translate-x-1/2">
                                <div
                                    className="h-4 w-4 rounded-full border transition-all duration-300"
                                    style={{
                                        borderColor: launchActive ? 'rgba(103,232,249,0.75)' : 'rgba(255,255,255,0.24)',
                                        background: launchActive ? 'rgba(34,211,238,0.28)' : 'rgba(255,255,255,0.08)',
                                        boxShadow: launchActive ? '0 0 22px rgba(34,211,238,0.65), 0 0 38px rgba(139,92,246,0.4)' : 'none',
                                    }}
                                />
                            </div>

                            <div
                                className="overflow-hidden rounded-[2.2rem] border backdrop-blur-md transition-[border-color,box-shadow,background] duration-300"
                                style={{
                                    borderColor: launchActive ? 'rgba(34,211,238,0.44)' : 'rgba(255,255,255,0.05)',
                                    background: launchActive
                                        ? 'linear-gradient(145deg, rgba(6,22,38,0.8) 0%, rgba(9,11,26,0.88) 56%, rgba(24,8,44,0.76) 100%)'
                                        : 'rgba(255,255,255,0.02)',
                                    boxShadow: launchActive
                                        ? '0 0 0 1px rgba(34,211,238,0.24), 0 30px 90px rgba(0,0,0,0.42), 0 0 46px rgba(34,211,238,0.16)'
                                        : '0 30px 90px rgba(0,0,0,0.4)',
                                }}
                            >
                                <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
                                    <div className="relative p-7 max-[360px]:p-6 md:p-12">
                                        <div
                                            className="absolute -right-6 -top-10 text-[clamp(6.5rem,13vw,11rem)] font-black leading-none text-transparent opacity-90 max-[360px]:-right-3 max-[360px]:-top-8 max-[360px]:text-[5.6rem]"
                                            style={{ WebkitTextStroke: launchActive ? '2px rgba(103,232,249,0.32)' : '2px rgba(255,255,255,0.14)' }}
                                        >
                                            04
                                        </div>
                                        <div className="relative z-10">
                                            <div className="mb-5 text-[11px] uppercase tracking-[0.34em] text-cyan-200/75">Semana 04</div>
                                            <h3 className="text-[clamp(1.86rem,9.6vw,3.4rem)] font-black leading-[0.94] tracking-[-0.05em] text-white">
                                                Lanzamiento
                                                <br />
                                                <span className="bg-gradient-to-r from-cyan-200 to-violet-200 bg-clip-text text-transparent">
                                                    y ventas en produccion.
                                                </span>
                                            </h3>
                                            <p className="mt-5 max-w-xl text-sm leading-7 text-white/55 md:text-base">
                                                Publicamos, conectamos conversiones y dejamos todo listo para qué tu operación tenga una nueva sucursal activa desde el dia uno.
                                            </p>

                                            <div className="mt-8 space-y-3">
                                                {launchChecks.map((check, index) => (
                                                    <LaunchCheckPill
                                                        key={check}
                                                        check={check}
                                                        index={index}
                                                        launchVisible={launchVisible}
                                                        launchActive={launchActive}
                                                        prefersReduced={prefersReduced}
                                                        centerMode={isBelowLg}
                                                    />
                                                ))}
                                            </div>

                                            <motion.a
                                                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%20DevelOP%2C%20quiero%20iniciar%20la%20transformaci%C3%B3n%20de%20mi%20negocio`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                whileHover={enableLaunchBtnAutoHover || prefersReduced ? {} : { scale: 1.03, y: -1 }}
                                                whileTap={prefersReduced ? {} : { scale: 0.98 }}
                                                animate={
                                                    enableLaunchBtnAutoHover
                                                        ? { scale: isLaunchBtnShineActive ? 1.03 : 1, y: isLaunchBtnShineActive ? -1 : 0 }
                                                        : { scale: 1, y: 0 }
                                                }
                                                transition={enableLaunchBtnAutoHover ? { duration: 0.16, ease: 'linear' } : undefined}
                                                className="group/launch-btn relative mt-8 inline-flex items-center gap-3 overflow-hidden rounded-full border border-cyan-200/26 bg-[linear-gradient(135deg,rgba(14,19,38,0.92),rgba(13,23,44,0.96))] px-7 py-4 text-[13px] font-extrabold uppercase tracking-[0.24em] text-white backdrop-blur-sm max-[360px]:w-full max-[360px]:justify-between max-[360px]:gap-2 max-[360px]:px-5 max-[360px]:py-3.5 max-[360px]:text-[12px] max-[360px]:tracking-[0.16em]"
                                                style={{
                                                    boxShadow: '0 0 0 1px rgba(34,211,238,0.2), 0 10px 28px rgba(2,6,23,0.5), 0 0 28px rgba(34,211,238,0.14)',
                                                }}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className={`pointer-events-none absolute inset-0 transition-opacity duration-150 group-hover/launch-btn:opacity-100 ${enableLaunchBtnAutoHover && isLaunchBtnShineActive ? 'opacity-100' : 'opacity-0'}`}
                                                    style={{
                                                        background:
                                                            'radial-gradient(72% 120% at 50% 0%, rgba(103,232,249,0.32) 0%, rgba(14,165,233,0.08) 44%, transparent 74%), radial-gradient(120% 90% at 0% 100%, rgba(167,139,250,0.22) 0%, transparent 66%)',
                                                    }}
                                                />
                                                <span
                                                    aria-hidden="true"
                                                    className={`pointer-events-none absolute -bottom-8 top-[-2rem] w-16 rotate-[22deg] bg-[linear-gradient(90deg,rgba(125,211,252,0),rgba(224,242,254,0.92),rgba(196,181,253,0))] blur-[1px] transition-all duration-500 ease-out group-hover/launch-btn:left-[112%] group-hover/launch-btn:opacity-100 ${enableLaunchBtnAutoHover && isLaunchBtnShineActive ? 'left-[112%] opacity-100' : '-left-24 opacity-0'}`}
                                                />
                                                <span className="relative z-10 max-[360px]:max-w-[12ch] max-[360px]:leading-[1.05]">Iniciar transformacion</span>
                                                <ArrowRight className={`relative z-10 size-4 transition-transform duration-150 group-hover/launch-btn:translate-x-[2px] ${enableLaunchBtnAutoHover && isLaunchBtnShineActive ? 'translate-x-[2px]' : ''}`} />
                                            </motion.a>
                                        </div>
                                    </div>

                                    <motion.div
                                        whileHover={prefersReduced ? {} : { scale: 1.008 }}
                                        className="relative min-h-[18rem] border-t border-white/[0.05] md:min-h-full md:border-l md:border-t-0"
                                        style={{
                                            boxShadow: launchActive ? 'inset 0 0 34px rgba(34,211,238,0.16)' : 'none',
                                        }}
                                    >
                                        <LaunchLoopVisual active={launchActive} reduced={prefersReduced} />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
