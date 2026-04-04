"use client"

import React, { useRef, useState } from "react"
import Image from "next/image"
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
    type MotionValue,
} from "framer-motion"
import { ExternalLink, Sparkles } from "lucide-react"

type SourceSet = "chatgpt" | "nano-banana"

type TemplateItem = {
    slug: string
    name: string
    tagline: string
    description: string
    accent: string
    rgb: string
    url: string
}

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

function TemplateStageCard({
    template,
    index,
    total,
    sourceSet,
    progress,
    mouseX,
    mouseY,
    reducedMotion,
}: {
    template: TemplateItem
    index: number
    total: number
    sourceSet: SourceSet
    progress: MotionValue<number>
    mouseX: MotionValue<number>
    mouseY: MotionValue<number>
    reducedMotion: boolean
}) {
    const step = 1 / total
    const start = Math.max(0, index * step - step * 0.52)
    const center = index * step + step * 0.45
    const end = Math.min(1, index * step + step * 1.35)

    const opacity = useTransform(progress, [start, center, end], [0, 1, 0], { clamp: true })
    const stageY = useTransform(progress, [start, center, end], reducedMotion ? [0, 0, 0] : [170, 0, -130], { clamp: true })
    const stageScale = useTransform(progress, [start, center, end], reducedMotion ? [1, 1, 1] : [0.9, 1.03, 0.94], { clamp: true })
    const stageBlur = useTransform(progress, [start, center, end], reducedMotion ? [0, 0, 0] : [16, 0, 12], { clamp: true })

    const rotatePointerX = useTransform(mouseY, [-1, 1], reducedMotion ? [0, 0] : [8, -8])
    const rotatePointerY = useTransform(mouseX, [-1, 1], reducedMotion ? [0, 0] : [-12, 12])

    const farX = useTransform(mouseX, [-1, 1], reducedMotion ? [0, 0] : [44, -44])
    const farY = useTransform(mouseY, [-1, 1], reducedMotion ? [0, 0] : [34, -34])
    const midX = useTransform(mouseX, [-1, 1], reducedMotion ? [0, 0] : [22, -22])
    const midY = useTransform(mouseY, [-1, 1], reducedMotion ? [0, 0] : [16, -16])
    const fgX = useTransform(mouseX, [-1, 1], reducedMotion ? [0, 0] : [-34, 34])
    const fgY = useTransform(mouseY, [-1, 1], reducedMotion ? [0, 0] : [-22, 22])
    const uiX = useTransform(mouseX, [-1, 1], reducedMotion ? [0, 0] : [-26, 26])
    const uiY = useTransform(mouseY, [-1, 1], reducedMotion ? [0, 0] : [-16, 16])

    const glareX = useTransform(mouseX, [-1, 1], [16, 84])
    const glareY = useTransform(mouseY, [-1, 1], [20, 78])

    const base = `/assets/templates/${sourceSet}/${template.slug}`
    const bgSrc = `${base}/bg.webp`
    const midSrc = `${base}/mid.webp`
    const fgSrc = `${base}/fg.png`

    return (
        <motion.article
            style={{
                opacity,
                y: stageY,
                scale: stageScale,
                filter: useMotionTemplate`blur(${stageBlur}px)`,
            }}
            className="absolute inset-0 flex items-center justify-center px-3 py-7 md:px-8 md:py-10"
        >
            <div className="h-full w-full max-w-[1320px]" style={{ perspective: "1900px" }}>
                <motion.div
                    style={{
                        rotateX: rotatePointerX,
                        rotateY: rotatePointerY,
                        transformStyle: "preserve-3d",
                    }}
                    className="relative h-full overflow-hidden rounded-[30px] border"
                    transition={{ type: "spring", stiffness: 120, damping: 26 }}
                    whileHover={reducedMotion ? {} : { scale: 1.006 }}
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            borderColor: `rgba(${template.rgb},0.35)`,
                            background: `linear-gradient(128deg, rgba(${template.rgb},0.2) 0%, rgba(6,9,24,0.9) 48%, rgba(3,5,14,0.96) 100%)`,
                            boxShadow: `0 36px 110px rgba(${template.rgb},0.22)`,
                        }}
                    />

                    <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-[14%]"
                        style={{
                            x: farX,
                            y: farY,
                            transform: "translateZ(-280px)",
                        }}
                    >
                        <Image src={bgSrc} alt="" fill className="object-cover" />
                    </motion.div>

                    <motion.div
                        className="absolute -inset-[4%]"
                        style={{
                            x: midX,
                            y: midY,
                            opacity: 0.84,
                            transform: "translateZ(-80px) scale(1.08)",
                        }}
                    >
                        <Image src={midSrc} alt={`${template.name} preview`} fill className="object-cover object-top" />
                    </motion.div>

                    <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-[2%]"
                        style={{
                            x: fgX,
                            y: fgY,
                            opacity: 0.62,
                            transform: "translateZ(120px) scale(1.03)",
                            mixBlendMode: "screen",
                        }}
                    >
                        <Image src={fgSrc} alt="" fill className="object-cover object-center" />
                    </motion.div>

                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,4,12,0.16)_0%,rgba(2,6,17,0.54)_58%,rgba(2,6,17,0.9)_100%)]" style={{ zIndex: 20 }} />
                    <div className="absolute inset-0 bg-[linear-gradient(102deg,rgba(2,6,17,0.92)_0%,rgba(2,6,17,0.72)_38%,rgba(2,6,17,0.22)_74%,rgba(2,6,17,0.12)_100%)]" style={{ zIndex: 22 }} />

                    <motion.div
                        className="absolute left-[5%] top-[12%] hidden w-[32%] min-w-[280px] overflow-hidden rounded-[18px] border lg:block"
                        style={{
                            x: uiX,
                            y: uiY,
                            borderColor: `rgba(${template.rgb},0.46)`,
                            background: `linear-gradient(150deg, rgba(${template.rgb},0.2), rgba(8,12,28,0.88))`,
                            boxShadow: `0 18px 42px rgba(${template.rgb},0.2)`,
                            backdropFilter: "blur(8px)",
                            zIndex: 200,
                        }}
                    >
                        <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: `rgba(${template.rgb},0.34)` }}>
                            <div className="h-2 w-2 rounded-full bg-white/65" />
                            <div className="h-2 w-2 rounded-full bg-white/38" />
                            <div className="h-2 w-2 rounded-full bg-white/24" />
                            <span className="ml-2 text-[10px] font-mono uppercase tracking-[0.18em] text-white/70">preview layer</span>
                        </div>
                        <div className="relative h-48 w-full">
                            <Image src={midSrc} alt={`${template.name} secondary preview`} fill className="object-cover object-top opacity-80" />
                        </div>
                    </motion.div>

                    <motion.div className="relative flex h-full flex-col justify-end p-6 md:p-10 lg:p-14" style={{ zIndex: 220, x: uiX }}>
                        <div className="max-w-[660px]">
                            <div
                                className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
                                style={{ borderColor: `rgba(${template.rgb},0.5)`, background: `rgba(${template.rgb},0.18)` }}
                            >
                                <Sparkles size={14} style={{ color: template.accent }} />
                                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/88">{template.tagline}</span>
                            </div>

                            <h3 className="mb-3 text-[clamp(30px,4.8vw,66px)] font-black leading-[0.93] tracking-[-0.035em] text-white">
                                {template.name}
                            </h3>

                            <p className="mb-7 max-w-[560px] text-sm leading-relaxed text-white/72 md:text-base">
                                {template.description}
                            </p>

                            <a
                                href={template.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:scale-[1.03]"
                                style={{ borderColor: `rgba(${template.rgb},0.54)`, background: `rgba(${template.rgb},0.24)` }}
                            >
                                Ver template
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </motion.div>

                    <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute h-44 w-44 rounded-full"
                        style={{
                            left: useMotionTemplate`${glareX}%`,
                            top: useMotionTemplate`${glareY}%`,
                            background: `radial-gradient(circle, rgba(${template.rgb},0.26) 0%, rgba(${template.rgb},0.06) 46%, transparent 72%)`,
                            filter: "blur(10px)",
                            zIndex: 240,
                        }}
                    />
                </motion.div>
            </div>
        </motion.article>
    )
}

function ImmersiveTemplatesSection({
    sourceSet,
    title,
    subtitle,
}: {
    sourceSet: SourceSet
    title: string
    subtitle: string
}) {
    const sectionRef = useRef<HTMLElement>(null)
    const reducedMotion = !!useReducedMotion()
    const [activeIndex, setActiveIndex] = useState(0)

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"],
    })

    const smoothProgress = useSpring(scrollYProgress, { stiffness: 85, damping: 26, mass: 0.32 })

    useMotionValueEvent(smoothProgress, "change", (latest) => {
        const next = Math.min(TEMPLATES.length - 1, Math.max(0, Math.floor(latest * TEMPLATES.length)))
        setActiveIndex((prev) => (prev === next ? prev : next))
    })

    const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
        if (reducedMotion || !sectionRef.current) return
        const rect = sectionRef.current.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width
        const y = (event.clientY - rect.top) / rect.height
        mouseX.set((x - 0.5) * 2)
        mouseY.set((y - 0.5) * 2)
    }

    const handleMouseLeave = () => {
        mouseX.set(0)
        mouseY.set(0)
    }

    return (
        <section
            ref={sectionRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full bg-[#030014]"
            style={{ height: reducedMotion ? "auto" : `${TEMPLATES.length * 90}vh` }}
        >
            <div className="sticky top-0 h-screen overflow-hidden">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse at 50% 0%, rgba(0,229,255,0.12) 0%, rgba(2,6,17,0.52) 54%, rgba(2,6,17,0.94) 100%)",
                    }}
                />

                <div className="absolute left-1/2 top-6 z-30 w-full max-w-[1380px] -translate-x-1/2 px-4 md:top-8 md:px-8">
                    <div className="inline-flex flex-col items-start gap-1 rounded-2xl border border-cyan-300/28 bg-cyan-300/10 px-4 py-2">
                        <span className="inline-flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)]" />
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-200/88">{title}</span>
                        </span>
                        <span className="text-[11px] font-medium text-white/72">{subtitle}</span>
                    </div>
                </div>

                <div className="pointer-events-none absolute right-5 top-1/2 z-30 hidden -translate-y-1/2 lg:flex lg:flex-col lg:gap-2">
                    {TEMPLATES.map((item, idx) => (
                        <div
                            key={`${sourceSet}-${item.slug}`}
                            className="h-9 w-1 rounded-full transition-all duration-300"
                            style={{
                                background:
                                    idx === activeIndex
                                        ? `linear-gradient(180deg, ${item.accent}, rgba(255,255,255,0.84))`
                                        : "rgba(255,255,255,0.22)",
                                opacity: idx === activeIndex ? 1 : 0.45,
                            }}
                        />
                    ))}
                </div>

                <div className="relative mx-auto h-full w-full">
                    {TEMPLATES.map((template, index) => (
                        <TemplateStageCard
                            key={`${sourceSet}-${template.slug}`}
                            template={template}
                            index={index}
                            total={TEMPLATES.length}
                            sourceSet={sourceSet}
                            progress={smoothProgress}
                            mouseX={mouseX}
                            mouseY={mouseY}
                            reducedMotion={reducedMotion}
                        />
                    ))}
                </div>
            </div>

            {reducedMotion && (
                <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-6 px-4 py-20 md:grid-cols-2 md:px-8">
                    {TEMPLATES.map((template) => {
                        const base = `/assets/templates/${sourceSet}/${template.slug}`
                        return (
                            <a
                                key={`fallback-${sourceSet}-${template.slug}`}
                                href={template.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group overflow-hidden rounded-[18px] border bg-[#060a1b]"
                                style={{ borderColor: `rgba(${template.rgb},0.24)` }}
                            >
                                <div className="relative h-52 w-full">
                                    <Image src={`${base}/mid.webp`} alt={template.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                                </div>
                                <div className="p-4">
                                    <h4 className="text-lg font-bold text-white">{template.name}</h4>
                                    <p className="text-sm text-white/65">{template.tagline}</p>
                                </div>
                            </a>
                        )
                    })}
                </div>
            )}
        </section>
    )
}

export default function WebTemplatesImmersive() {
    return (
        <>
            <ImmersiveTemplatesSection
                sourceSet="chatgpt"
                title="templates set / chatgpt"
                subtitle="Compara composicion, iluminacion y presencia de marca"
            />

            <div className="mx-auto h-px w-[min(1320px,94vw)] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" />

            <ImmersiveTemplatesSection
                sourceSet="nano-banana"
                title="templates set / nano banana"
                subtitle="Misma experiencia inmersiva, segunda fuente visual"
            />
        </>
    )
}
