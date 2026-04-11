"use client"

import React, { useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from 'framer-motion'
import HeroMetrics from '@/components/ui/HeroMetrics'
import { WebDevelopmentBento } from '@/components/sections/web-development/WebDevelopmentBento'
import { WebDevelopmentFaq } from '@/components/sections/web-development/WebDevelopmentFaq'
import { WebDevelopmentCta } from '@/components/sections/web-development/WebDevelopmentCta'
import { WebDevelopmentSeo } from '@/components/sections/web-development/WebDevelopmentSeo'
import StatementSection from '@/components/sections/web-development/StatementSection'
import { PricingSection } from '@/components/sections/web-development/PricingSection'
import { WebDevelopmentTimeline } from '@/components/sections/web-development/WebDevelopmentTimeline'
import ComparadorSection from '@/components/sections/web-development/ComparadorSection'
import WebDevelopmentByRubro from '@/components/sections/web-development/WebDevelopmentByRubro'
import WebTemplatesImmersive from '@/components/sections/web-development/WebTemplatesImmersive'
import { ChargeTraceButton } from '@/components/ui/buttons/ChargeTraceButton'
import { Portfolio } from '@/components/sections/home/Portfolio'

const HeroBackground = dynamic(() => import('@/components/canvas/HeroBackground'), { ssr: false })

const SectionReveal = ({
    children,
    delay = 0,
    className = '',
}: {
    children: React.ReactNode
    delay?: number
    className?: string
}) => (
    <motion.div
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
        className={className}
    >
        {children}
    </motion.div>
)

const SectionDivider = ({ color = 'cyan' }: { color?: 'cyan' | 'violet' }) => {
    const gradient =
        color === 'violet'
            ? 'linear-gradient(90deg, transparent, rgba(139,92,246,0.25) 30%, rgba(99,102,241,0.35) 50%, rgba(139,92,246,0.25) 70%, transparent)'
            : 'linear-gradient(90deg, transparent, rgba(0,229,255,0.12) 30%, rgba(6,182,212,0.25) 50%, rgba(0,229,255,0.12) 70%, transparent)'

    return (
        <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: '1px', background: gradient, transformOrigin: 'center', margin: '0 auto' }}
        />
    )
}

export default function WebDevelopmentPage() {
    const heroRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.965])

    return (
        <main className="relative min-h-screen w-full overflow-x-clip overflow-y-visible bg-[#020611] text-white">
            <div className="pointer-events-none absolute inset-0 z-[1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150" />

            <div
                aria-hidden="true"
                className="pointer-events-none fixed left-1/2 top-0 z-0 h-[620px] w-[900px] -translate-x-1/2 opacity-20"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,229,255,0.12) 0%, transparent 68%)' }}
            />

            <div ref={heroRef} className="pointer-events-none absolute left-0 top-0 z-0 h-screen w-full overflow-hidden">
                <HeroBackground />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,17,0.38)_0%,rgba(2,6,17,0.58)_30%,rgba(2,6,17,0.76)_65%,rgba(2,6,17,0.92)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(2,6,17,0.08)_0%,rgba(2,6,17,0.28)_42%,rgba(2,6,17,0.76)_100%)]" />
            </div>

            <motion.div
                style={{ opacity, scale }}
                className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1920px] flex-col items-center justify-center px-4 pb-10 pt-24 lg:grid lg:grid-cols-[minmax(0,70%)_1px_minmax(0,30%)] lg:items-center lg:gap-8 lg:px-10 lg:pb-0 lg:pt-0"
            >
                <div className="pointer-events-none absolute inset-x-4 inset-y-[6vh] rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(6,12,24,0.66)_0%,rgba(5,10,20,0.78)_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.26)] backdrop-blur-[5px] lg:inset-x-10 lg:inset-y-[7vh]" />

                <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="z-10 flex w-full flex-col items-center px-4 text-center lg:items-start lg:pl-[clamp(44px,5vw,86px)] lg:pr-4 lg:text-left"
                >
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.7 }}
                        className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/16 bg-black/28 px-5 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-md lg:mb-8"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/80" />
                        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-zinc-100/90 md:text-[10px]">
                            TU SUCURSAL MAS RENTABLE
                        </span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.7 }}
                        className="mb-5 flex flex-wrap justify-center gap-2 lg:justify-start"
                    >
                        {['Next.js', 'TypeScript', 'Lighthouse 100', 'Desde $800 USD', '4-6 semanas'].map((item) => (
                            <span
                                key={item}
                                className="rounded-full border border-white/10 bg-black/18 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-100/80 backdrop-blur-sm"
                                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
                            >
                                {item}
                            </span>
                        ))}
                    </motion.div>

                    <div className="pointer-events-none absolute left-1/2 top-[30%] z-0 h-[28%] w-[58%] -translate-x-1/2 bg-cyan-400/10 blur-[130px] lg:left-0 lg:w-[40%] lg:translate-x-0" />

                    <div className="relative z-10 w-full max-w-[1120px]">
                        <h1 className="text-center text-[12.8vw] font-black uppercase leading-[0.88] tracking-[-0.055em] lg:text-left lg:text-[6.1vw] xl:text-[5.9vw] 2xl:text-[5.6vw]">
                            <span className="block bg-gradient-to-r from-white via-zinc-100 to-cyan-200 bg-clip-text text-transparent lg:whitespace-nowrap">
                                Tu negocio, abierto
                            </span>
                            <span className="block bg-gradient-to-r from-cyan-300 via-cyan-400 to-sky-300 bg-clip-text text-transparent">
                                Las 24 horas
                                <span className="ml-[0.06em] inline-block text-cyan-300 [text-shadow:0_0_16px_rgba(34,211,238,0.78)]">.</span>
                            </span>
                        </h1>
                    </div>

                    <p className="mt-6 max-w-[540px] px-4 text-base font-medium leading-relaxed tracking-wide text-zinc-100/92 drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)] md:text-lg lg:mt-8 lg:px-0">
                        Transformamos tu Instagram y WhatsApp en un ecosistema que atrae clientes, cotiza y vende solo.
                        <br className="hidden md:block" />
                        <span className="font-bold text-cyan-300"> Sin que tengas que estar presente.</span>
                    </p>

                    <div className="mt-10 lg:mt-12">
                        <ChargeTraceButton
                            label="CONSTRUIR MI SUCURSAL"
                            onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="z-10 hidden h-[54%] w-[1px] origin-top justify-self-center lg:block"
                    style={{ background: 'linear-gradient(transparent, rgba(103,232,249,0.2), transparent)' }}
                />

                <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="z-10 mt-14 flex w-full flex-col items-center justify-center lg:mt-0 lg:w-full lg:items-stretch lg:justify-self-stretch lg:pr-[clamp(44px,5vw,86px)]"
                >
                    <HeroMetrics />
                </motion.div>
            </motion.div>

            <SectionReveal>
                <WebDevelopmentByRubro />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <WebDevelopmentBento />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <ComparadorSection />
            </SectionReveal>

            <SectionDivider color="violet" />

            <WebTemplatesImmersive />

            <StatementSection />

            <SectionDivider color="violet" />

            <SectionReveal delay={0.05}>
                <Portfolio />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <WebDevelopmentSeo />
            </SectionReveal>

            <SectionDivider color="violet" />

            <SectionReveal delay={0.05}>
                <WebDevelopmentTimeline />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <PricingSection />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <WebDevelopmentFaq />
            </SectionReveal>

            <SectionDivider color="violet" />

            <SectionReveal delay={0.05}>
                <WebDevelopmentCta />
            </SectionReveal>
        </main>
    )
}