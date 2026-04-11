"use client"

import React, { useRef, useState } from "react"
import Image from "next/image"
import {
    motion,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
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
    progress,
    reducedMotion,
}: {
    template: TemplateItem
    index: number
    total: number
    progress: MotionValue<number>
    reducedMotion: boolean
}) {
    const segments = Math.max(1, total - 1)
    const point = index / segments
    const spread = 1 / total

    const start = Math.max(0, point - spread * 0.72)
    const end = Math.min(1, point + spread * 0.9)

    const opacity = useTransform(progress, [start, point, end], [0, 1, 0], { clamp: true })
    const stageY = useTransform(progress, [start, point, end], reducedMotion ? [0, 0, 0] : [130, 0, -130], { clamp: true })
    const stageScale = useTransform(progress, [start, point, end], reducedMotion ? [1, 1, 1] : [0.94, 1, 0.97], { clamp: true })
    const stageRotateX = useTransform(progress, [start, point, end], reducedMotion ? [0, 0, 0] : [5, 0, -4], { clamp: true })

    const imageScale = useTransform(progress, [start, point, end], [1.12, 1.04, 1], { clamp: true })
    const imageY = useTransform(progress, [start, point, end], [18, 0, -12], { clamp: true })

    const base = `/assets/templates/${SOURCE_SET}/${template.slug}`

    return (
        <motion.article
            style={{
                opacity,
                y: stageY,
                scale: stageScale,
                rotateX: stageRotateX,
                transformPerspective: 1500,
            }}
            className="absolute inset-0 flex items-center justify-center px-4 py-8 md:px-8 md:py-10"
        >
            <div className="w-full max-w-[1320px]">
                <div className="grid h-[78vh] min-h-[560px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0A0A0F] lg:grid-cols-[0.42fr_0.58fr]">
                    <div className="relative flex h-full flex-col justify-between border-b border-white/10 p-6 md:p-9 lg:border-b-0 lg:border-r">
                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                                <Sparkles size={12} style={{ color: template.accent }} />
                                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-300">{template.tagline}</span>
                            </div>

                            <h3 className="mb-3 text-[clamp(30px,4.5vw,64px)] font-black leading-[0.92] tracking-[-0.035em] text-white">
                                {template.name}
                            </h3>

                            <p className="max-w-[44ch] text-sm leading-relaxed text-zinc-400 md:text-base">
                                {template.description}
                            </p>
                        </div>

                        <div>
                            <div className="mb-4 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                                <div className="h-full w-1/2 rounded-full" style={{ backgroundColor: template.accent }} />
                            </div>

                            <a
                                href={template.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#09090f] transition-all duration-200 hover:scale-[1.01] hover:bg-zinc-200"
                            >
                                Ver template
                                <ArrowUpRight size={14} />
                            </a>
                        </div>
                    </div>

                    <div className="relative h-full min-h-[320px] overflow-hidden">
                        <motion.div
                            style={{ scale: imageScale, y: imageY }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={`${base}/mid.webp`}
                                alt={`${template.name} preview`}
                                fill
                                className="object-cover object-top"
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

function ImmersiveTemplatesSection() {
    const sectionRef = useRef<HTMLElement>(null)
    const reducedMotion = !!useReducedMotion()
    const [activeIndex, setActiveIndex] = useState(0)

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"],
    })

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 90,
        damping: 28,
        mass: 0.36,
    })

    useMotionValueEvent(smoothProgress, "change", (latest) => {
        const next = Math.min(TEMPLATES.length - 1, Math.max(0, Math.round(latest * (TEMPLATES.length - 1))))
        setActiveIndex((prev) => (prev === next ? prev : next))
    })

    return (
        <section
            ref={sectionRef}
            className="relative w-full bg-[#030014]"
            style={{ height: reducedMotion ? "auto" : `${TEMPLATES.length * 105}vh` }}
        >
            <div className="sticky top-0 h-screen overflow-hidden">
                <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col px-4 pb-7 pt-6 md:px-8 md:pt-8">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <div className="mb-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-300">Templates inmersivos</span>
                            </div>
                            <h2 className="text-[clamp(28px,4.2vw,54px)] font-black leading-[0.95] tracking-[-0.03em] text-white">
                                Explora cada concepto como si fuera un escenario real
                            </h2>
                        </div>

                        <div className="hidden items-center gap-3 md:flex">
                            <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">Scroll</span>
                            <span className="text-sm font-semibold text-zinc-200">
                                {String(activeIndex + 1).padStart(2, "0")} / {String(TEMPLATES.length).padStart(2, "0")}
                            </span>
                        </div>
                    </div>

                    <div className="relative mt-4 flex-1 md:mt-6">
                        {TEMPLATES.map((template, index) => (
                            <TemplateStageCard
                                key={template.slug}
                                template={template}
                                index={index}
                                total={TEMPLATES.length}
                                progress={smoothProgress}
                                reducedMotion={reducedMotion}
                            />
                        ))}
                    </div>

                    <div className="mx-auto mt-4 grid w-full max-w-[1080px] grid-cols-3 gap-2 md:grid-cols-6">
                        {TEMPLATES.map((item, idx) => (
                            <div
                                key={item.slug}
                                className="rounded-lg border px-2 py-2 text-center transition-colors duration-300"
                                style={{
                                    borderColor: idx === activeIndex ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                                    backgroundColor: idx === activeIndex ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                                }}
                            >
                                <span className="block truncate text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-300">
                                    {item.slug}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {reducedMotion && (
                <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-6 px-4 py-20 md:grid-cols-2 md:px-8">
                    {TEMPLATES.map((template) => {
                        const base = `/assets/templates/${SOURCE_SET}/${template.slug}`

                        return (
                            <a
                                key={`fallback-${template.slug}`}
                                href={template.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group overflow-hidden rounded-[18px] border border-white/10 bg-[#0A0A0F]"
                            >
                                <div className="relative h-52 w-full">
                                    <Image
                                        src={`${base}/mid.webp`}
                                        alt={template.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                </div>
                                <div className="p-4">
                                    <h4 className="text-lg font-bold text-white">{template.name}</h4>
                                    <p className="text-sm text-zinc-400">{template.tagline}</p>
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
    return <ImmersiveTemplatesSection />
}
