"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion"
import { ArrowRight, Clock3, Gem, ShieldCheck } from "lucide-react"

function MagneticButton({
    href,
    children,
    autoHover = false,
}: {
    href: string
    children: React.ReactNode
    autoHover?: boolean
}) {
    const buttonRef = useRef<HTMLAnchorElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const springX = useSpring(x, { stiffness: 210, damping: 18, mass: 0.52 })
    const springY = useSpring(y, { stiffness: 210, damping: 18, mass: 0.52 })
    const rotate = useTransform(springX, [-16, 16], [-2.8, 2.8])

    const handleMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
        const bounds = buttonRef.current?.getBoundingClientRect()
        if (!bounds) return

        const offsetX = event.clientX - (bounds.left + bounds.width / 2)
        const offsetY = event.clientY - (bounds.top + bounds.height / 2)
        const maxPull = 16

        x.set(Math.max(Math.min(offsetX * 0.2, maxPull), -maxPull))
        y.set(Math.max(Math.min(offsetY * 0.2, maxPull), -maxPull))
    }

    const reset = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.a
            ref={buttonRef}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onMouseMove={handleMove}
            onMouseLeave={reset}
            onBlur={reset}
            style={{ x: springX, y: springY, rotate }}
            animate={
                autoHover
                    ? {
                        scale: [1, 1.016, 1],
                        boxShadow: [
                            "0 14px 34px rgba(99,102,241,0.3)",
                            "0 0 0 1px rgba(165,180,252,0.38), 0 0 28px rgba(129,140,248,0.42), 0 14px 36px rgba(99,102,241,0.35)",
                            "0 14px 34px rgba(99,102,241,0.3)",
                        ],
                    }
                    : {
                        scale: 1,
                        boxShadow: "0 14px 34px rgba(99,102,241,0.3)",
                    }
            }
            transition={
                autoHover
                    ? {
                        duration: 1.25,
                        times: [0, 0.45, 1],
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 1.4,
                    }
                    : { duration: 0.2, ease: "easeOut" }
            }
            whileTap={{ scale: 0.98 }}
            className="group/cta-primary relative inline-flex h-14 w-full max-w-[19.5rem] items-center justify-center overflow-hidden rounded-full border border-indigo-200/35 bg-[linear-gradient(135deg,#6366f1,#4f46e5_38%,#7c3aed)] px-8 text-[12px] font-extrabold uppercase tracking-[0.22em] text-white shadow-[0_14px_34px_rgba(99,102,241,0.3)] max-[425px]:h-12 max-[425px]:max-w-[17.75rem] max-[425px]:px-6 max-[425px]:text-[11px] max-[425px]:tracking-[0.18em] max-[375px]:h-11 max-[375px]:max-w-[16.5rem] max-[375px]:px-5 max-[375px]:text-[10.5px] max-[375px]:tracking-[0.14em]"
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover/cta-primary:opacity-100"
                style={{
                    background:
                        "radial-gradient(70% 130% at 50% 0%, rgba(224,231,255,0.34) 0%, rgba(165,180,252,0.1) 45%, transparent 72%), linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.4), rgba(255,255,255,0))",
                }}
            />
            {autoHover ? (
                <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(70% 130% at 50% 0%, rgba(224,231,255,0.34) 0%, rgba(165,180,252,0.1) 45%, transparent 72%), linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.4), rgba(255,255,255,0))",
                    }}
                    animate={{ opacity: [0, 0.9, 0] }}
                    transition={{
                        duration: 1.25,
                        times: [0, 0.45, 1],
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 1.4,
                    }}
                />
            ) : null}
            <span className="relative z-10 inline-flex items-center gap-2">
                {children}
                <motion.span
                    animate={autoHover ? { x: [0, 2, 0] } : { x: 0 }}
                    transition={
                        autoHover
                            ? {
                                duration: 1.25,
                                times: [0, 0.45, 1],
                                ease: "easeInOut",
                                repeat: Infinity,
                                repeatDelay: 1.4,
                            }
                            : { duration: 0.2, ease: "easeOut" }
                    }
                >
                    <ArrowRight className="size-4 transition-transform duration-150 group-hover/cta-primary:translate-x-[2px]" />
                </motion.span>
            </span>
        </motion.a>
    )
}

export const SoftwareDevelopmentCta = () => {
    const [showForm, setShowForm] = useState(false)
    const [isBelowTablet, setIsBelowTablet] = useState(false)
    const [activeBenefitIndex, setActiveBenefitIndex] = useState(0)
    const [isFormShineActive, setIsFormShineActive] = useState(false)
    const prefersReducedMotion = useReducedMotion()

    useEffect(() => {
        if (typeof window === "undefined") return

        const mediaQuery = window.matchMedia("(max-width: 1023px)")
        const syncViewport = () => setIsBelowTablet(mediaQuery.matches)
        syncViewport()

        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", syncViewport)
            return () => mediaQuery.removeEventListener("change", syncViewport)
        }

        mediaQuery.addListener(syncViewport)
        return () => mediaQuery.removeListener(syncViewport)
    }, [])

    useEffect(() => {
        if (!isBelowTablet || prefersReducedMotion) return

        const intervalId = window.setInterval(() => {
            setActiveBenefitIndex((current) => (current + 1) % 3)
        }, 2200)

        return () => window.clearInterval(intervalId)
    }, [isBelowTablet, prefersReducedMotion])

    const enableAutoHover = isBelowTablet && !prefersReducedMotion

    useEffect(() => {
        if (!enableAutoHover) return

        let hideTimeoutId: number | undefined

        const triggerShinyCycle = () => {
            setIsFormShineActive(true)
            if (hideTimeoutId) window.clearTimeout(hideTimeoutId)
            hideTimeoutId = window.setTimeout(() => {
                setIsFormShineActive(false)
            }, 560)
        }

        triggerShinyCycle()
        const intervalId = window.setInterval(triggerShinyCycle, 2560)

        return () => {
            window.clearInterval(intervalId)
            if (hideTimeoutId) window.clearTimeout(hideTimeoutId)
        }
    }, [enableAutoHover])

    return (
        <section
            data-lenis-prevent-touch
            className="relative z-10 flex min-h-[100svh] w-full touch-pan-y items-start overflow-hidden bg-[#010314] px-3 py-5 sm:px-6 sm:py-8 md:items-center md:px-8 md:py-12"
        >
            <style>{`
                @keyframes ctaMeshDriftA {
                    0% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(-2.8%, 2.2%, 0) scale(1.04); }
                    100% { transform: translate3d(0, 0, 0) scale(1); }
                }
                @keyframes ctaMeshDriftB {
                    0% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(2.5%, -2%, 0) scale(1.03); }
                    100% { transform: translate3d(0, 0, 0) scale(1); }
                }
                @keyframes ctaAuraBreath {
                    0%, 100% { opacity: 0.52; transform: translate(-50%, -50%) scale(1); }
                    50% { opacity: 0.88; transform: translate(-50%, -50%) scale(1.12); }
                }
                @keyframes ctaPulseDot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.45; transform: scale(0.82); }
                }
                @keyframes ctaEdgeBreath {
                    0%, 100% { opacity: 0.38; transform: scale(1); }
                    44% { opacity: 0.78; transform: scale(1.016); }
                    60% { opacity: 0.54; transform: scale(1.008); }
                }
            `}</style>

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(120% 84% at 50% 0%, rgba(99,102,241,0.16) 0%, rgba(1,3,20,0) 58%), radial-gradient(92% 78% at 78% 92%, rgba(124,58,237,0.16) 0%, rgba(1,3,20,0) 70%), linear-gradient(180deg, rgba(1,3,20,0.96) 0%, rgba(1,2,16,1) 100%)",
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-[24%] -right-[24%]"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(28deg, rgba(129,140,248,0.14) 0 1px, transparent 1px 22px), repeating-linear-gradient(94deg, rgba(196,181,253,0.1) 0 1px, transparent 1px 26px), repeating-linear-gradient(152deg, rgba(124,58,237,0.14) 0 1px, transparent 1px 28px)",
                    opacity: 0.3,
                    filter: "blur(0.4px)",
                    mixBlendMode: "screen",
                    animation: prefersReducedMotion ? "none" : "ctaMeshDriftA 28s ease-in-out infinite",
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-[22%] -right-[22%]"
                style={{
                    backgroundImage:
                        "repeating-radial-gradient(circle at 32% 46%, rgba(129,140,248,0.22) 0 1px, transparent 1px 9px), repeating-radial-gradient(circle at 68% 58%, rgba(167,139,250,0.18) 0 1px, transparent 1px 11px)",
                    opacity: 0.22,
                    filter: "blur(0.25px)",
                    mixBlendMode: "screen",
                    animation: prefersReducedMotion ? "none" : "ctaMeshDriftB 32s ease-in-out infinite",
                }}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[48rem] w-[48rem]"
                style={{
                    background:
                        "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(124,58,237,0.1) 32%, rgba(6,10,30,0.04) 58%, transparent 76%)",
                    filter: "blur(72px)",
                    animation: prefersReducedMotion ? "none" : "ctaAuraBreath 10s ease-in-out infinite",
                }}
            />

            <div className="relative z-10 mx-auto flex w-full max-w-[90rem] items-center justify-center">
                <div className="relative isolate mx-auto w-full max-w-[20.75rem] max-[425px]:max-w-[19.25rem] max-[375px]:max-w-[16.75rem] sm:max-w-[29rem] md:max-w-[40rem] lg:max-w-[48rem] xl:max-w-[54rem]">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-0 rounded-[2rem]"
                        style={{
                            boxShadow: "0 0 0 1px rgba(129,140,248,0.24), 0 0 20px rgba(129,140,248,0.2), 0 0 40px rgba(124,58,237,0.18)",
                            opacity: 0.64,
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-0 rounded-[2rem] blur-[14px]"
                        style={{
                            background:
                                "radial-gradient(58% 74% at 50% 0%, rgba(129,140,248,0.46) 0%, rgba(129,140,248,0.16) 54%, transparent 78%), radial-gradient(58% 74% at 50% 100%, rgba(124,58,237,0.4) 0%, rgba(124,58,237,0.14) 54%, transparent 78%), radial-gradient(72% 56% at 0% 50%, rgba(196,181,253,0.34) 0%, transparent 74%), radial-gradient(72% 56% at 100% 50%, rgba(167,139,250,0.34) 0%, transparent 74%)",
                            animation: prefersReducedMotion ? "none" : "ctaEdgeBreath 5.6s ease-in-out infinite",
                            willChange: "opacity, transform",
                        }}
                    />
                    <motion.div
                        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.52, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full overflow-hidden rounded-[2rem] border border-indigo-300/18 bg-[linear-gradient(155deg,rgba(10,11,34,0.86)_0%,rgba(8,8,28,0.94)_58%,rgba(6,6,22,0.92)_100%)] px-[clamp(14px,3.2vw,56px)] py-[clamp(18px,3.4vh,44px)] text-center shadow-[0_28px_84px_rgba(0,0,0,0.54)] backdrop-blur-sm lg:backdrop-blur-none max-[425px]:px-4 max-[425px]:py-5 max-[375px]:px-3 max-[375px]:py-4"
                    >
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0"
                            style={{
                                background:
                                    "linear-gradient(145deg, rgba(255,255,255,0.05), transparent 36%, transparent 72%, rgba(129,140,248,0.08))",
                            }}
                        />
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(129,140,248,0.95),rgba(124,58,237,0.85),transparent)]"
                        />

                        <div className="relative z-10">
                            <div className="mb-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-indigo-300/24 bg-indigo-300/[0.08] px-3 py-1.5 max-[425px]:px-2.5 max-[425px]:py-1">
                                <span
                                    className="h-1.5 w-1.5 rounded-full bg-indigo-300 shadow-[0_0_10px_rgba(165,180,252,0.9)]"
                                    style={{ animation: "ctaPulseDot 2s ease-in-out infinite" }}
                                />
                                <span className="text-[10px] font-bold uppercase leading-[1.35] tracking-[0.18em] text-indigo-100/92 max-[425px]:text-[9px] max-[425px]:tracking-[0.14em] max-[375px]:text-[8.5px] max-[375px]:tracking-[0.1em]">
                                    Agenda limitada: 2 cupos de implementacion software esta semana
                                </span>
                            </div>

                            <div className="mb-2 text-[9px] uppercase tracking-[0.24em] text-indigo-100/36 max-[425px]:text-[8px] max-[425px]:tracking-[0.2em] max-[375px]:tracking-[0.15em]">
                                SI NO SISTEMATIZAS HOY, MANANA TU OPERACION SIGUE FRENADA
                            </div>

                            <h2 className="mx-auto max-w-4xl text-[clamp(1.82rem,5.1vw,4.45rem)] font-black leading-[0.9] tracking-[-0.045em] text-white max-[425px]:text-[clamp(1.66rem,8.8vw,2.5rem)] max-[425px]:tracking-[-0.038em] max-[375px]:text-[clamp(1.45rem,8.2vw,2.1rem)] max-[375px]:tracking-[-0.032em]">
                                Tu empresa con software propio
                                <br />
                                <span className="bg-gradient-to-r from-white via-indigo-200 to-violet-200 bg-clip-text text-transparent">
                                    operando en 30 dias.
                                </span>
                            </h2>

                            <p className="mx-auto mt-3 max-w-3xl text-[14px] leading-7 text-white/64 max-[425px]:text-[13px] max-[425px]:leading-[1.9] max-[375px]:text-[12.5px] max-[375px]:leading-7 md:text-base">
                                Arrancamos con un diagnostico de 45 minutos para detectar los 3 procesos donde tu CRM, ERP o sistema a medida puede generar impacto mas rapido en ventas y operacion.
                            </p>

                            <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-2.5">
                                <motion.div
                                    whileHover={
                                        prefersReducedMotion || enableAutoHover
                                            ? {}
                                            : {
                                                y: -1,
                                                scale: 1.012,
                                                borderColor: "rgba(165,180,252,0.42)",
                                                backgroundColor: "rgba(99,102,241,0.16)",
                                                boxShadow: "0 0 0 1px rgba(99,102,241,0.24), 0 0 20px rgba(99,102,241,0.2)",
                                            }
                                    }
                                    animate={
                                        enableAutoHover && activeBenefitIndex === 0
                                            ? {
                                                y: -1,
                                                scale: 1.012,
                                                borderColor: "rgba(165,180,252,0.42)",
                                                backgroundColor: "rgba(99,102,241,0.16)",
                                                boxShadow: "0 0 0 1px rgba(99,102,241,0.24), 0 0 20px rgba(99,102,241,0.2)",
                                            }
                                            : {
                                                y: 0,
                                                scale: 1,
                                                borderColor: "rgba(99,102,241,0.22)",
                                                backgroundColor: "rgba(99,102,241,0.08)",
                                                boxShadow: "none",
                                            }
                                    }
                                    transition={{ duration: enableAutoHover ? 0.7 : prefersReducedMotion ? 0 : 0.08, ease: "easeInOut" }}
                                    className="inline-flex w-full max-w-[18.5rem] items-center justify-center gap-2 rounded-full border border-indigo-300/22 bg-indigo-300/[0.08] px-3 py-1.5 text-center text-[11px] leading-[1.25] text-indigo-100/85 max-[425px]:max-w-[17rem] max-[375px]:max-w-[15.8rem] max-[375px]:text-[10.5px] sm:w-auto sm:max-w-none sm:px-4 sm:py-2 sm:text-[12px] sm:text-left"
                                >
                                    <ShieldCheck className="size-4 text-indigo-200" />
                                    Diagnostico inicial sin costo
                                </motion.div>
                                <motion.div
                                    whileHover={
                                        prefersReducedMotion || enableAutoHover
                                            ? {}
                                            : {
                                                y: -1,
                                                scale: 1.012,
                                                borderColor: "rgba(196,181,253,0.4)",
                                                backgroundColor: "rgba(124,58,237,0.15)",
                                                boxShadow: "0 0 0 1px rgba(167,139,250,0.22), 0 0 20px rgba(124,58,237,0.2)",
                                            }
                                    }
                                    animate={
                                        enableAutoHover && activeBenefitIndex === 1
                                            ? {
                                                y: -1,
                                                scale: 1.012,
                                                borderColor: "rgba(196,181,253,0.4)",
                                                backgroundColor: "rgba(124,58,237,0.15)",
                                                boxShadow: "0 0 0 1px rgba(167,139,250,0.22), 0 0 20px rgba(124,58,237,0.2)",
                                            }
                                            : {
                                                y: 0,
                                                scale: 1,
                                                borderColor: "rgba(196,181,253,0.2)",
                                                backgroundColor: "rgba(167,139,250,0.08)",
                                                boxShadow: "none",
                                            }
                                    }
                                    transition={{ duration: enableAutoHover ? 0.7 : prefersReducedMotion ? 0 : 0.08, ease: "easeInOut" }}
                                    className="inline-flex w-full max-w-[18.5rem] items-center justify-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/[0.08] px-3 py-1.5 text-center text-[11px] leading-[1.25] text-violet-100/84 max-[425px]:max-w-[17rem] max-[375px]:max-w-[15.8rem] max-[375px]:text-[10.5px] sm:w-auto sm:max-w-none sm:px-4 sm:py-2 sm:text-[12px] sm:text-left"
                                >
                                    <Gem className="size-4 text-violet-200" />
                                    Proyectos desde USD 1.500
                                </motion.div>
                                <motion.div
                                    whileHover={
                                        prefersReducedMotion || enableAutoHover
                                            ? {}
                                            : {
                                                y: -1,
                                                scale: 1.012,
                                                borderColor: "rgba(148,163,184,0.38)",
                                                backgroundColor: "rgba(255,255,255,0.12)",
                                                boxShadow: "0 0 0 1px rgba(148,163,184,0.2), 0 0 18px rgba(148,163,184,0.16)",
                                            }
                                    }
                                    animate={
                                        enableAutoHover && activeBenefitIndex === 2
                                            ? {
                                                y: -1,
                                                scale: 1.012,
                                                borderColor: "rgba(148,163,184,0.38)",
                                                backgroundColor: "rgba(255,255,255,0.12)",
                                                boxShadow: "0 0 0 1px rgba(148,163,184,0.2), 0 0 18px rgba(148,163,184,0.16)",
                                            }
                                            : {
                                                y: 0,
                                                scale: 1,
                                                borderColor: "rgba(255,255,255,0.14)",
                                                backgroundColor: "rgba(255,255,255,0.05)",
                                                boxShadow: "none",
                                            }
                                    }
                                    transition={{ duration: enableAutoHover ? 0.7 : prefersReducedMotion ? 0 : 0.08, ease: "easeInOut" }}
                                    className="inline-flex w-full max-w-[18.5rem] items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.05] px-3 py-1.5 text-center text-[11px] leading-[1.25] text-white/74 max-[425px]:max-w-[17rem] max-[375px]:max-w-[15.8rem] max-[375px]:text-[10.5px] sm:w-auto sm:max-w-none sm:px-4 sm:py-2 sm:text-[12px] sm:text-left"
                                >
                                    <Clock3 className="size-4 text-indigo-100/80" />
                                    Propuesta tecnica en 48 horas
                                </motion.div>
                            </div>

                            <div className="mt-6 flex flex-col items-center gap-2.5 sm:mt-7 sm:gap-3">
                                <MagneticButton
                                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5493816223508"}?text=Hola%20DevelOP%2C%20quiero%20agendar%20mi%20diagnostico%20de%20software%20a%20medida`}
                                    autoHover={enableAutoHover}
                                >
                                    Quiero mi diagnostico software ahora
                                </MagneticButton>

                                <div className="w-full max-w-[19rem] rounded-full border border-indigo-300/22 bg-indigo-300/[0.1] px-3 py-1.5 text-center text-[10px] font-semibold leading-[1.25] tracking-[0.03em] text-indigo-100/92 max-[425px]:max-w-[17.75rem] max-[375px]:max-w-[16.5rem] sm:w-auto sm:max-w-none sm:px-4 sm:text-[11px] sm:tracking-[0.04em]">
                                    Sin permanencia obligatoria - Arquitectura escalable por etapas
                                </div>

                                <button
                                    type="button"
                                    className={`group/cta-form-btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-white/12 bg-[linear-gradient(135deg,rgba(12,12,34,0.78),rgba(10,10,30,0.66))] px-6 py-3 text-sm text-white/72 transition-[border-color,color,box-shadow] duration-200 hover:border-indigo-200/40 hover:text-white hover:shadow-[0_0_20px_rgba(165,180,252,0.14)] ${enableAutoHover && isFormShineActive ? "border-indigo-200/40 text-white shadow-[0_0_20px_rgba(165,180,252,0.14)]" : ""}`}
                                    onClick={() => {
                                        setShowForm(true)
                                        setTimeout(() => {
                                            document.getElementById("contacto-form")?.scrollIntoView({ behavior: "smooth", block: "nearest" })
                                        }, 100)
                                    }}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none absolute inset-0 transition-opacity duration-200 group-hover/cta-form-btn:opacity-100 ${enableAutoHover && isFormShineActive ? "opacity-100" : "opacity-0"}`}
                                        style={{
                                            background:
                                                "radial-gradient(65% 100% at 50% 0%, rgba(224,231,255,0.18) 0%, rgba(165,180,252,0.08) 44%, transparent 72%)",
                                        }}
                                    />
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none absolute top-[-2rem] h-[220%] w-14 rotate-[24deg] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(224,231,255,0.9),rgba(196,181,253,0.35),rgba(255,255,255,0))] blur-[1px] transition-all duration-500 ease-out group-hover/cta-form-btn:left-[122%] group-hover/cta-form-btn:opacity-100 ${enableAutoHover && isFormShineActive ? "left-[122%] opacity-100" : "-left-24 opacity-0"}`}
                                    />
                                    <span className="relative z-10">Completar formulario de contacto</span>
                                </button>

                                <div className="text-[9px] tracking-[0.04em] text-white/34 max-[375px]:text-[8.5px] sm:text-[10px] sm:tracking-[0.05em]">
                                    Implementacion por etapas para reducir riesgo y acelerar resultados
                                </div>

                                <div
                                    id="contacto-form"
                                    style={{
                                        maxHeight: showForm ? 640 : 0,
                                        opacity: showForm ? 1 : 0,
                                        marginTop: showForm ? 22 : 0,
                                    }}
                                    className="w-full max-w-[440px] overflow-hidden rounded-[1.35rem] transition-all duration-500 ease-out"
                                >
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault()
                                        }}
                                        className="rounded-[1.35rem] border border-indigo-300/16 bg-black/28 p-4 shadow-[0_0_28px_rgba(99,102,241,0.12)]"
                                    >
                                        <div className="flex flex-col gap-3">
                                            <input
                                                type="text"
                                                placeholder="Tu nombre"
                                                required
                                                className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-indigo-300/40"
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Tu WhatsApp"
                                                required
                                                className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-indigo-300/40"
                                            />
                                            <select
                                                required
                                                defaultValue=""
                                                className="w-full appearance-none rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-indigo-300/40"
                                            >
                                                <option value="" disabled hidden style={{ color: "#080810" }}>
                                                    Tipo de proyecto...
                                                </option>
                                                <option value="crm" style={{ color: "#080810" }}>CRM a medida</option>
                                                <option value="erp" style={{ color: "#080810" }}>ERP interno</option>
                                                <option value="integraciones" style={{ color: "#080810" }}>Integraciones entre sistemas</option>
                                                <option value="portal" style={{ color: "#080810" }}>Portal para clientes</option>
                                                <option value="analytics" style={{ color: "#080810" }}>BI y reportes</option>
                                                <option value="otro" style={{ color: "#080810" }}>Otro</option>
                                            </select>
                                            <textarea
                                                rows={3}
                                                placeholder="Contanos brevemente tu objetivo (opcional)"
                                                className="w-full resize-none rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-indigo-300/40"
                                            />

                                            <button
                                                type="submit"
                                                className="mt-1 w-full rounded-xl border-0 bg-[linear-gradient(135deg,#6366f1,#4f46e5,#7c3aed)] px-4 py-3 text-sm font-bold text-white transition-[box-shadow,filter] duration-75 ease-out hover:brightness-110 hover:shadow-[0_0_0_1px_rgba(224,231,255,0.34),0_0_22px_rgba(129,140,248,0.44)]"
                                            >
                                                Enviar y reservar diagnostico software
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
