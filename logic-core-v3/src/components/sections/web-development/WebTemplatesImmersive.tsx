"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import {
    animate as motionAnimate,
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
    type MotionValue,
} from "framer-motion"
import { ArrowUpRight, Sparkles } from "lucide-react"

type TemplateItem = {
    slug: string
    name: string
    tagline: string
    description: string
    accent: string
    rgb: string
    url: string
}

const SOURCE_SET = "chatgpt"
const SNAP_IDLE_MS = 100

const TEMPLATES: TemplateItem[] = [
    {
        slug: "zero",
        name: "Zero Protocol",
        tagline: "Tech / High contrast terminal",
        description: "Impacto ciberpunk y lectura ultra rapida para marcas tecnicas con tono agresivo.",
        accent: "#00ff41",
        rgb: "0,255,65",
        url: "https://template-zero.netlify.app/",
    },
    {
        slug: "ethereal",
        name: "The Ethereal Resort",
        tagline: "Hospitality / Premium calm",
        description: "Composicion editorial elegante para experiencias premium de alto valor percibido.",
        accent: "#e5b582",
        rgb: "229,181,130",
        url: "https://template-ethernal.netlify.app/",
    },
    {
        slug: "noir",
        name: "Noir Dining in the Void",
        tagline: "Gastronomia / Dark immersive",
        description: "Narrativa sensorial oscura para propuestas de autor que necesitan presencia unica.",
        accent: "#d6bda0",
        rgb: "214,189,160",
        url: "https://template-noir.netlify.app/",
    },
    {
        slug: "skyline",
        name: "Skyline Estates",
        tagline: "Real estate / Clean modern",
        description: "Jerarquia limpia y estructura confiable para conversion directa en servicios premium.",
        accent: "#60a5fa",
        rgb: "96,165,250",
        url: "https://template-skyline.netlify.app/",
    },
    {
        slug: "bold",
        name: "NEXO Bold",
        tagline: "Agency / Brutalist creative",
        description: "Sistema visual extremo para marcas que compiten por atencion y diferenciacion.",
        accent: "#ff3cac",
        rgb: "255,60,172",
        url: "https://template-bold.netlify.app/",
    },
    {
        slug: "nebula",
        name: "YAKU Nebula",
        tagline: "SaaS / Neon performance",
        description: "Look futurista con claridad de producto para soluciones de crecimiento acelerado.",
        accent: "#00e5ff",
        rgb: "0,229,255",
        url: "https://template-nebula.netlify.app/",
    },
]

const clampIndex = (value: number) => Math.min(TEMPLATES.length - 1, Math.max(0, value))
const fallbackTemplatePreview = "/images/showcase/case-default.svg"


function TemplateStageCard({
    template,
    index,
    total,
    progress,
    reducedMotion,
    enableButtonAutoHover,
    isActive,
    cardRef,
}: {
    template: TemplateItem
    index: number
    total: number
    progress: MotionValue<number>
    reducedMotion: boolean
    enableButtonAutoHover: boolean
    isActive: boolean
    cardRef?: (node: HTMLElement | null) => void
}) {
    const [isTemplateBtnShineActive, setIsTemplateBtnShineActive] = useState(false)

    useEffect(() => {
        if (!enableButtonAutoHover || !isActive) return

        let hideTimeoutId: number | undefined

        const triggerShinyCycle = () => {
            setIsTemplateBtnShineActive(true)
            if (hideTimeoutId) window.clearTimeout(hideTimeoutId)
            hideTimeoutId = window.setTimeout(() => {
                setIsTemplateBtnShineActive(false)
            }, 560)
        }

        triggerShinyCycle()
        const intervalId = window.setInterval(triggerShinyCycle, 2560)

        return () => {
            window.clearInterval(intervalId)
            if (hideTimeoutId) window.clearTimeout(hideTimeoutId)
        }
    }, [enableButtonAutoHover, isActive])

    const templateBtnAutoActive = enableButtonAutoHover && isActive && isTemplateBtnShineActive

    const segments = Math.max(1, total - 1)
    const point = index / segments
    const spread = 1 / total
    const start = Math.max(0, point - spread * 0.72)
    const end = Math.min(1, point + spread * 0.9)
    const isFirst = index === 0
    const isLast = index === total - 1

    const opacityInput = isFirst ? [0, end] : isLast ? [start, 1] : [start, point, end]
    const opacityOutput = isFirst ? [1, 0] : isLast ? [0, 1] : [0, 1, 0]
    const opacity = useTransform(progress, opacityInput, opacityOutput, { clamp: true })

    const yInput = isFirst ? [0, end] : isLast ? [start, 1] : [start, point, end]
    const yOutput = isFirst
        ? reducedMotion
            ? [0, 0]
            : [0, -130]
        : isLast
            ? reducedMotion
                ? [0, 0]
                : [130, 0]
            : reducedMotion
                ? [0, 0, 0]
                : [130, 0, -130]
    const stageY = useTransform(progress, yInput, yOutput, { clamp: true })

    const scaleInput = isFirst ? [0, end] : isLast ? [start, 1] : [start, point, end]
    const scaleOutput = isFirst
        ? reducedMotion
            ? [1, 1]
            : [1, 0.97]
        : isLast
            ? reducedMotion
                ? [1, 1]
                : [0.94, 1]
            : reducedMotion
                ? [1, 1, 1]
                : [0.94, 1, 0.97]
    const stageScale = useTransform(progress, scaleInput, scaleOutput, { clamp: true })

    const rotInput = isFirst ? [0, end] : isLast ? [start, 1] : [start, point, end]
    const rotOutput = isFirst
        ? reducedMotion
            ? [0, 0]
            : [0, -4]
        : isLast
            ? reducedMotion
                ? [0, 0]
                : [5, 0]
            : reducedMotion
                ? [0, 0, 0]
                : [5, 0, -4]
    const stageRotateX = useTransform(progress, rotInput, rotOutput, { clamp: true })

    const imageScaleInput = isFirst ? [0, end] : isLast ? [start, 1] : [start, point, end]
    const imageScaleOutput = isFirst ? [1.04, 1] : isLast ? [1.12, 1.04] : [1.12, 1.04, 1]
    const imageScale = useTransform(progress, imageScaleInput, imageScaleOutput, { clamp: true })

    const imageYInput = isFirst ? [0, end] : isLast ? [start, 1] : [start, point, end]
    const imageYOutput = isFirst ? [0, -12] : isLast ? [18, 0] : [18, 0, -12]
    const imageY = useTransform(progress, imageYInput, imageYOutput, { clamp: true })

    const base = `/assets/templates/${SOURCE_SET}/${template.slug}`
    const localPreviewUrl = `${base}/mid.webp`
    const remotePreviewUrl = `https://image.thum.io/get/width/1800/noanimate/${template.url}`

    const handlePreviewError = (event: React.SyntheticEvent<HTMLImageElement>) => {
        const image = event.currentTarget
        const stage = image.dataset.fallbackStage ?? "local"

        if (stage === "local") {
            image.dataset.fallbackStage = "remote"
            image.src = remotePreviewUrl
            return
        }

        if (stage === "remote") {
            image.dataset.fallbackStage = "final"
            image.src = fallbackTemplatePreview
        }
    }

    return (
        <motion.article
            ref={cardRef}
            aria-hidden={!isActive}
            style={{
                opacity,
                y: stageY,
                scale: stageScale,
                rotateX: stageRotateX,
                transformPerspective: 1500,
                pointerEvents: isActive ? "auto" : "none",
                zIndex: isActive ? 3 : 1,
            }}
            className="absolute inset-0 flex items-center justify-center px-3 py-3 md:px-6 md:py-5"
        >
            <div className="w-full max-w-[1320px]">
                <div
                    className="grid h-[66vh] min-h-[420px] grid-rows-[1.03fr_0.97fr] overflow-hidden rounded-[28px] border md:h-[68vh] md:min-h-[500px] lg:h-[70vh] lg:min-h-[510px] lg:grid-cols-[0.42fr_0.58fr] lg:grid-rows-1"
                    style={{
                        borderColor: `rgba(${template.rgb},0.34)`,
                        background:
                            "linear-gradient(138deg, rgba(5,8,16,0.95) 0%, rgba(4,7,13,0.92) 58%, rgba(5,8,16,0.95) 100%)",
                        boxShadow: `0 24px 72px rgba(0,0,0,0.42), inset 0 0 0 1px rgba(${template.rgb},0.08)`,
                    }}
                >
                    <div className="relative flex min-h-0 flex-col justify-between border-b border-white/10 p-5 md:p-8 lg:h-full lg:border-b-0 lg:border-r">
                        <div
                            className="pointer-events-none absolute inset-x-0 top-0 h-28"
                            style={{
                                background: `linear-gradient(180deg, rgba(${template.rgb},0.14) 0%, rgba(${template.rgb},0) 100%)`,
                            }}
                        />

                        <div className="relative z-10">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5">
                                <Sparkles size={12} style={{ color: template.accent }} />
                                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-200">{template.tagline}</span>
                            </div>

                            <h3 className="mb-3 text-[clamp(28px,4.4vw,60px)] font-black leading-[0.92] tracking-[-0.034em] text-white">
                                {template.name}
                            </h3>

                            <p className="max-w-[44ch] text-xs leading-relaxed text-zinc-300/85 sm:text-sm md:text-base">{template.description}</p>
                        </div>

                        <div className="relative z-10 mb-3 mt-4 md:mb-5 md:mt-6 lg:mb-0">
                            <div className="mb-4 h-[2px] w-full overflow-hidden rounded-full bg-white/12">
                                <div
                                    className="h-full w-1/2 rounded-full"
                                    style={{ background: `linear-gradient(90deg, ${template.accent} 0%, rgba(${template.rgb},0.34) 100%)` }}
                                />
                            </div>

                            <a
                                href={template.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                tabIndex={isActive ? 0 : -1}
                                className={`group/template-btn relative inline-flex items-center gap-2 overflow-hidden rounded-full border px-5 py-2.5 text-xs uppercase text-[#09090f] transition-[transform,box-shadow,border-color,background-color,color] duration-200 hover:scale-[1.01] hover:border-cyan-300/70 hover:bg-white hover:text-[#02040a] hover:shadow-[0_0_0_1px_rgba(34,211,238,0.42),0_0_22px_rgba(34,211,238,0.34)] ${templateBtnAutoActive ? "scale-[1.01] border-cyan-300/70 bg-white text-[#02040a] shadow-[0_0_0_1px_rgba(34,211,238,0.42),0_0_22px_rgba(34,211,238,0.34)]" : "border-white/14 bg-white"}`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`pointer-events-none absolute inset-0 transition-opacity duration-150 group-hover/template-btn:opacity-100 ${templateBtnAutoActive ? "opacity-100" : "opacity-0"}`}
                                    style={{
                                        background:
                                            "radial-gradient(72% 130% at 50% 0%, rgba(224,242,254,0.42) 0%, rgba(186,230,253,0.18) 48%, transparent 76%)",
                                    }}
                                />
                                <span
                                    aria-hidden="true"
                                    className={`pointer-events-none absolute -bottom-8 top-[-2rem] w-14 rotate-[22deg] bg-[linear-gradient(90deg,rgba(125,211,252,0),rgba(224,242,254,0.95),rgba(196,181,253,0.18),rgba(125,211,252,0))] blur-[1px] transition-all duration-500 ease-out group-hover/template-btn:left-[112%] group-hover/template-btn:opacity-100 ${templateBtnAutoActive ? "left-[112%] opacity-100" : "-left-24 opacity-0"}`}
                                />
                                <span className={`relative z-10 tracking-[0.14em] transition-[font-weight,letter-spacing] duration-200 group-hover/template-btn:font-bold group-hover/template-btn:tracking-[0.16em] ${templateBtnAutoActive ? "font-bold tracking-[0.16em]" : "font-bold"}`}>
                                    Ver template
                                </span>
                                <ArrowUpRight size={14} className={`relative z-10 transition-transform duration-150 group-hover/template-btn:translate-x-[1px] group-hover/template-btn:-translate-y-[1px] ${templateBtnAutoActive ? "translate-x-[1px] -translate-y-[1px]" : ""}`} />
                            </a>
                        </div>
                    </div>

                    <div className="relative min-h-0 overflow-hidden lg:h-full lg:min-h-[320px]">
                        <motion.div style={{ scale: imageScale, y: imageY }} className="absolute inset-0">
                            <motion.img
                                src={localPreviewUrl}
                                data-fallback-stage="local"
                                onError={handlePreviewError}
                                alt={`${template.name} preview`}
                                className="h-full w-full object-cover object-top"
                                loading={index === 0 ? "eager" : "lazy"}
                            />
                        </motion.div>

                        <motion.div
                            style={{ scale: imageScale, y: imageY }}
                            className="pointer-events-none absolute inset-0"
                        >
                            <iframe
                                src={template.url}
                                title={`${template.name} live preview`}
                                loading={index === 0 ? "eager" : "lazy"}
                                className="pointer-events-none absolute -left-[22%] -top-[18%] h-[146%] w-[146%] border-0 md:-left-[16%] md:-top-[12%] md:h-[132%] md:w-[132%] lg:-left-[10%] lg:-top-[8%] lg:h-[120%] lg:w-[120%]"
                                referrerPolicy="no-referrer-when-downgrade"
                                aria-label={`${template.name} live preview`}
                            />
                        </motion.div>

                        <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(3,4,10,0.84)_0%,rgba(3,4,10,0.38)_38%,rgba(3,4,10,0.18)_68%,rgba(3,4,10,0.58)_100%)]" />
                        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(180deg,rgba(3,4,10,0)_0%,rgba(3,4,10,0.82)_100%)]" />

                        <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/10 bg-black/40 p-3">
                            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-300">
                                <span>Modo inmersivo</span>
                                <span style={{ color: template.accent }}>Live preview</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.article>
    )
}

export default function WebTemplatesImmersive() {
    const sectionRef = useRef<HTMLElement>(null)
    const reducedMotion = !!useReducedMotion()
    const [isBelowLg, setIsBelowLg] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const activeIndexRef = useRef(0)
    const snapTimerRef = useRef<number | null>(null)
    const snapAnimationRef = useRef<ReturnType<typeof motionAnimate> | null>(null)
    const isSnappingRef = useRef(false)

    const stepProgress = useMotionValue(0)

    const smoothProgress = useSpring(stepProgress, {
        stiffness: 90,
        damping: 28,
        mass: 0.36,
    })
    const progressScale = useTransform(smoothProgress, [0, 1], [0, 1])

    const activeTemplate = useMemo(() => TEMPLATES[activeIndex], [activeIndex])
    const maxSteps = Math.max(1, TEMPLATES.length - 1)
    const enableTemplateButtonAutoHover = isBelowLg && !reducedMotion

    useEffect(() => {
        const media = window.matchMedia("(max-width: 1023.98px)")
        const sync = () => setIsBelowLg(media.matches)
        sync()

        media.addEventListener("change", sync)
        return () => media.removeEventListener("change", sync)
    }, [])

    useEffect(() => {
        activeIndexRef.current = activeIndex
    }, [activeIndex])

    useEffect(() => {
        return () => {
            if (snapTimerRef.current !== null) {
                window.clearTimeout(snapTimerRef.current)
                snapTimerRef.current = null
            }
            snapAnimationRef.current?.stop()
        }
    }, [])

    useEffect(() => {
        const clearSnapTimer = () => {
            if (snapTimerRef.current !== null) {
                window.clearTimeout(snapTimerRef.current)
                snapTimerRef.current = null
            }
        }

        const stopSnapAnimation = () => {
            snapAnimationRef.current?.stop()
            snapAnimationRef.current = null
            isSnappingRef.current = false
        }

        const getSectionMetrics = () => {
            const section = sectionRef.current
            if (!section) return null

            const rect = section.getBoundingClientRect()
            const sectionStart = window.scrollY + rect.top
            const sectionEnd = sectionStart + section.offsetHeight
            const lockEnd = sectionEnd - window.innerHeight
            const range = Math.max(lockEnd - sectionStart, 1)
            return { sectionStart, lockEnd, range }
        }

        const startSnapToNearest = () => {
            const metrics = getSectionMetrics()
            if (!metrics) return

            const currentY = window.scrollY
            if (currentY < metrics.sectionStart || currentY > metrics.lockEnd) return

            const nearestIndex = clampIndex(Math.round(((currentY - metrics.sectionStart) / metrics.range) * maxSteps))
            const targetY = metrics.sectionStart + nearestIndex * window.innerHeight
            if (Math.abs(targetY - currentY) < 2) return

            stopSnapAnimation()
            isSnappingRef.current = true

            if (reducedMotion) {
                window.scrollTo({ top: targetY, behavior: "auto" })
                isSnappingRef.current = false
                return
            }

            const fromY = currentY
            const distance = targetY - fromY
            const duration = Math.min(0.95, Math.max(0.48, Math.abs(distance) / 1300))

            snapAnimationRef.current = motionAnimate(0, 1, {
                duration,
                ease: [0.16, 1, 0.3, 1],
                onUpdate: (latest) => {
                    window.scrollTo({ top: fromY + distance * latest, behavior: "auto" })
                },
                onComplete: () => {
                    isSnappingRef.current = false
                    snapAnimationRef.current = null
                },
            })
        }

        const scheduleSnap = () => {
            if (reducedMotion) return
            clearSnapTimer()
            snapTimerRef.current = window.setTimeout(() => {
                startSnapToNearest()
            }, SNAP_IDLE_MS)
        }

        const syncFromScroll = () => {
            const metrics = getSectionMetrics()
            if (!metrics) return

            const y = window.scrollY
            if (y <= metrics.sectionStart) {
                stepProgress.set(0)
                if (activeIndexRef.current !== 0) setActiveIndex(0)
                clearSnapTimer()
                return
            }

            if (y >= metrics.lockEnd) {
                stepProgress.set(1)
                const last = clampIndex(maxSteps)
                if (activeIndexRef.current !== last) setActiveIndex(last)
                clearSnapTimer()
                return
            }

            const progress = (y - metrics.sectionStart) / metrics.range
            stepProgress.set(progress)

            const nearest = clampIndex(Math.round(progress * maxSteps))
            if (nearest !== activeIndexRef.current) {
                setActiveIndex(nearest)
            }

            if (!isSnappingRef.current) {
                scheduleSnap()
            }
        }

        const interruptSnap = () => {
            if (!isSnappingRef.current) return
            stopSnapAnimation()
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (
                event.key === "ArrowDown" ||
                event.key === "ArrowUp" ||
                event.key === "PageDown" ||
                event.key === "PageUp" ||
                event.key === "Home" ||
                event.key === "End" ||
                event.key === " "
            ) {
                interruptSnap()
            }
        }

        window.addEventListener("scroll", syncFromScroll, { passive: true })
        window.addEventListener("wheel", interruptSnap, { passive: true })
        window.addEventListener("touchstart", interruptSnap, { passive: true })
        window.addEventListener("keydown", onKeyDown)

        syncFromScroll()

        return () => {
            clearSnapTimer()
            stopSnapAnimation()
            window.removeEventListener("scroll", syncFromScroll)
            window.removeEventListener("wheel", interruptSnap)
            window.removeEventListener("touchstart", interruptSnap)
            window.removeEventListener("keydown", onKeyDown)
        }
    }, [maxSteps, reducedMotion, stepProgress])

    return (
        <section
            ref={sectionRef}
            className="relative isolate w-full bg-[#02030d]"
            style={{ height: `${TEMPLATES.length * 100}vh` }}
        >
            <div className="sticky top-0 h-screen overflow-hidden">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(120%_75%_at_50%_-18%,rgba(0,229,255,0.15)_0%,rgba(2,3,12,0)_72%)]" />
                    <motion.div
                        className="absolute -left-[14%] top-[12%] h-[44%] w-[34%] rounded-full blur-[76px]"
                        animate={{ x: [0, 56, 0], y: [0, -16, 0], opacity: [0.24, 0.44, 0.24] }}
                        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
                        style={{ background: "radial-gradient(circle, rgba(0,229,255,0.28) 0%, transparent 72%)" }}
                    />
                    <motion.div
                        className="absolute right-[-10%] top-[18%] h-[50%] w-[36%] rounded-full blur-[92px]"
                        animate={{ x: [0, -50, 0], y: [0, 20, 0], opacity: [0.2, 0.34, 0.2] }}
                        transition={{ duration: 15.5, repeat: Infinity, ease: "easeInOut" }}
                        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.24) 0%, transparent 74%)" }}
                    />
                    <motion.div
                        className="absolute inset-0 opacity-[0.18]"
                        animate={{ backgroundPositionY: ["0px", "84px"] }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        style={{
                            backgroundImage:
                                "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
                            backgroundSize: "4rem 4rem",
                            maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 22%, transparent 80%)",
                        }}
                    />
                </div>

                <div className="relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col px-4 pb-6 pt-6 md:px-8 md:pt-8">
                    <header className="shrink-0">
                        <div className="mb-2 inline-flex items-center rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5">
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-200">Templates inmersivos</span>
                        </div>

                        <div className="flex items-end justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-[clamp(16px,4.6vw,46px)] font-black leading-[1.04] tracking-[-0.03em] text-white [text-wrap:balance]">
                                    Explora cada concepto como si fuera un{" "}
                                    <span className="whitespace-nowrap">escenario real</span>
                                </h2>

                                <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/12">
                                    <motion.div
                                        className="h-full origin-left"
                                        style={{
                                            scaleX: progressScale,
                                            background: `linear-gradient(90deg, ${activeTemplate.accent} 0%, rgba(${activeTemplate.rgb},0.34) 100%)`,
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="hidden items-center gap-3 md:flex">
                                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400">Scroll continuo + auto-centro</span>
                                <span className="text-sm font-semibold text-zinc-100">
                                    {String(activeIndex + 1).padStart(2, "0")} / {String(TEMPLATES.length).padStart(2, "0")}
                                </span>
                            </div>
                        </div>
                    </header>

                    <div className="relative mt-4 min-h-0 flex-1">
                        {TEMPLATES.map((template, idx) => (
                            <TemplateStageCard
                                key={template.slug}
                                template={template}
                                index={idx}
                                total={TEMPLATES.length}
                                progress={smoothProgress}
                                reducedMotion={reducedMotion}
                                enableButtonAutoHover={enableTemplateButtonAutoHover}
                                isActive={idx === activeIndex}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
