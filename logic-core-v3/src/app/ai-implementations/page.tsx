"use client"

import React, { useEffect } from 'react'
import { motion } from 'motion/react'
import HeroIA from '@/components/ia/HeroIA'
import DemoIA from '@/components/ia/DemoIA'
import PipelineIA from '@/components/ia/PipelineIA'
import RubrosIA from '@/components/ia/RubrosIA'
import ComparadorIA from '@/components/ia/ComparadorIA'
import LiveChatIA from '@/components/ia/LiveChatIA'
import TestimoniosIA from '@/components/ia/TestimoniosIA'
import GarantiaIA from '@/components/ia/GarantiaIA'
import FaqIA from '@/components/ia/FaqIA'
import CtaIA from '@/components/ia/CtaIA'

const SectionReveal = ({
    children,
    delay = 0,
}: {
    children: React.ReactNode
    delay?: number
}) => (
    <motion.div
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-8%" }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
        {children}
    </motion.div>
)

const SectionDivider = () => (
    <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
            height: "1px",
            background:
                "linear-gradient(90deg, transparent, rgba(34,197,94,0.12) 25%, rgba(22,163,74,0.30) 50%, rgba(34,197,94,0.12) 75%, transparent)",
            transformOrigin: "center",
        }}
    />
)

const HERO_IA_BASE_BG = '#030308'
const RUBROS_HEX_PATTERN = `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 312'>
        <defs>
            <polygon id='h' points='30,4 90,4 120,56 90,108 30,108 0,56'/>
        </defs>
        <g stroke='#34f5c5' stroke-opacity='0.2' stroke-width='1.5' fill='none'>
            <use href='#h' x='0' y='0'/>
            <use href='#h' x='120' y='0'/>
            <use href='#h' x='240' y='0'/>
            <use href='#h' x='60' y='52'/>
            <use href='#h' x='180' y='52'/>
            <use href='#h' x='0' y='104'/>
            <use href='#h' x='120' y='104'/>
            <use href='#h' x='240' y='104'/>
            <use href='#h' x='60' y='156'/>
            <use href='#h' x='180' y='156'/>
        </g>
        <g fill='#0fbf73' fill-opacity='0.08' stroke='none'>
            <use href='#h' x='120' y='0'/>
            <use href='#h' x='60' y='156'/>
        </g>
        <g fill='#34f5c5' fill-opacity='0.06' stroke='none'>
            <use href='#h' x='0' y='104'/>
            <use href='#h' x='180' y='52'/>
        </g>
    </svg>`,
)}")`

type SectionToneKey =
    | 'demo'
    | 'garantia'
    | 'pipeline'
    | 'livechat'
    | 'rubros'
    | 'comparador'
    | 'testimonios'

const SECTION_TONE_CONFIG: Record<SectionToneKey, { backdrop: string; tint: string; patternOpacity: number }> = {
    demo: {
        backdrop:
            `linear-gradient(180deg, ${HERO_IA_BASE_BG} 0%, ${HERO_IA_BASE_BG} 22%, rgba(2,6,17,0.94) 44%, rgba(3,8,18,0.88) 66%, rgba(4,12,20,0.78) 82%, rgba(8,24,18,0.5) 100%), radial-gradient(132% 92% at 12% 18%, rgba(52,211,153,0.14) 0%, rgba(8,8,16,0) 62%), radial-gradient(98% 80% at 88% 100%, rgba(45,212,191,0.13) 0%, rgba(8,8,16,0) 64%)`,
        tint:
            'linear-gradient(180deg, rgba(3,3,8,0) 0%, rgba(2,6,17,0.14) 46%, rgba(2,6,17,0.16) 60%, rgba(16,185,129,0.045) 78%, rgba(34,197,94,0.08) 100%), radial-gradient(90% 64% at 50% 24%, rgba(74,222,128,0.045) 0%, transparent 70%), radial-gradient(84% 66% at 50% 110%, rgba(45,212,191,0.06) 0%, transparent 72%)',
        patternOpacity: 0.06,
    },
    garantia: {
        backdrop:
            'linear-gradient(160deg, rgba(5,17,22,0.62) 0%, rgba(8,8,16,0.16) 58%, rgba(8,8,16,0) 100%), radial-gradient(124% 88% at 82% 4%, rgba(16,185,129,0.30) 0%, rgba(8,8,16,0) 58%), radial-gradient(92% 74% at 8% 94%, rgba(34,197,94,0.20) 0%, rgba(8,8,16,0) 64%)',
        tint:
            'radial-gradient(90% 62% at 50% -8%, rgba(16,185,129,0.07) 0%, transparent 70%), radial-gradient(86% 64% at 50% 112%, rgba(34,197,94,0.05) 0%, transparent 72%)',
        patternOpacity: 0.07,
    },
    pipeline: {
        backdrop:
            'linear-gradient(178deg, rgba(4,14,24,0.62) 0%, rgba(8,8,16,0.14) 52%, rgba(8,8,16,0) 100%), repeating-linear-gradient(90deg, rgba(45,212,191,0.08) 0 1px, transparent 1px 86px), radial-gradient(126% 92% at 16% 6%, rgba(20,184,166,0.27) 0%, rgba(8,8,16,0) 56%), radial-gradient(94% 78% at 90% 94%, rgba(52,211,153,0.18) 0%, rgba(8,8,16,0) 62%)',
        tint:
            'radial-gradient(88% 62% at 50% -10%, rgba(45,212,191,0.075) 0%, transparent 70%), radial-gradient(84% 64% at 50% 110%, rgba(52,211,153,0.055) 0%, transparent 72%)',
        patternOpacity: 0.08,
    },
    livechat: {
        backdrop:
            'linear-gradient(168deg, rgba(4,22,16,0.66) 0%, rgba(8,8,16,0.14) 54%, rgba(8,8,16,0) 100%), repeating-linear-gradient(126deg, rgba(52,211,153,0.16) 0 2px, transparent 2px 40px), repeating-linear-gradient(126deg, rgba(94,234,212,0.1) 0 1px, transparent 1px 72px), radial-gradient(130% 94% at 14% 0%, rgba(0,255,136,0.28) 0%, rgba(8,8,16,0) 58%), radial-gradient(92% 78% at 86% 92%, rgba(15,191,115,0.22) 0%, rgba(8,8,16,0) 62%)',
        tint:
            'radial-gradient(90% 64% at 50% -8%, rgba(0,255,136,0.08) 0%, transparent 70%), radial-gradient(82% 62% at 50% 108%, rgba(15,191,115,0.06) 0%, transparent 72%)',
        patternOpacity: 0.11,
    },
    rubros: {
        backdrop:
            'linear-gradient(180deg, rgba(3,9,20,0.74) 0%, rgba(5,11,24,0.52) 38%, rgba(8,8,16,0.2) 72%, rgba(8,8,16,0) 100%), radial-gradient(128% 92% at 14% 6%, rgba(52,245,197,0.2) 0%, rgba(8,8,16,0) 58%), radial-gradient(108% 84% at 84% 92%, rgba(45,212,191,0.16) 0%, rgba(8,8,16,0) 62%)',
        tint:
            'radial-gradient(92% 66% at 50% -6%, rgba(52,245,197,0.07) 0%, transparent 72%), radial-gradient(88% 68% at 50% 112%, rgba(45,212,191,0.06) 0%, transparent 74%)',
        patternOpacity: 0.34,
    },
    comparador: {
        backdrop:
            'linear-gradient(180deg, rgba(6,24,20,0.64) 0%, rgba(8,8,16,0.14) 56%, rgba(8,8,16,0) 100%), radial-gradient(122% 86% at 78% 6%, rgba(52,245,197,0.24) 0%, rgba(8,8,16,0) 58%), radial-gradient(98% 78% at 8% 94%, rgba(16,185,129,0.22) 0%, rgba(8,8,16,0) 62%)',
        tint:
            'radial-gradient(90% 62% at 50% -10%, rgba(16,185,129,0.075) 0%, transparent 70%), radial-gradient(84% 64% at 50% 110%, rgba(52,245,197,0.06) 0%, transparent 72%)',
        patternOpacity: 0.08,
    },
    testimonios: {
        backdrop:
            'linear-gradient(182deg, rgba(5,18,15,0.58) 0%, rgba(8,8,16,0.14) 58%, rgba(8,8,16,0) 100%), radial-gradient(116% 82% at 20% 6%, rgba(34,197,94,0.24) 0%, rgba(8,8,16,0) 60%), radial-gradient(96% 76% at 84% 92%, rgba(16,185,129,0.18) 0%, rgba(8,8,16,0) 64%)',
        tint:
            'radial-gradient(90% 62% at 50% -10%, rgba(34,197,94,0.07) 0%, transparent 70%), radial-gradient(84% 64% at 50% 110%, rgba(16,185,129,0.055) 0%, transparent 72%)',
        patternOpacity: 0.07,
    },
}

const SectionTone = ({ tone, children }: { tone: SectionToneKey; children: React.ReactNode }) => {
    const config = SECTION_TONE_CONFIG[tone]
    const isHeroBlendTone = tone === 'demo'
    const isRubrosTone = tone === 'rubros'

    return (
        <div className="relative isolate">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" style={{ background: config.backdrop }} />
            {isHeroBlendTone && (
                <>
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[clamp(220px,28vh,320px)]"
                        style={{
                            background:
                                `linear-gradient(180deg, ${HERO_IA_BASE_BG} 0%, ${HERO_IA_BASE_BG} 38%, rgba(3,3,8,0.96) 58%, rgba(3,3,8,0.6) 78%, rgba(3,3,8,0) 100%)`,
                        }}
                    />
                </>
            )}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    opacity: config.patternOpacity,
                    backgroundImage: isRubrosTone
                        ? `${RUBROS_HEX_PATTERN}, ${RUBROS_HEX_PATTERN}, radial-gradient(118% 84% at 14% 4%, rgba(52,245,197,0.2) 0%, transparent 64%), radial-gradient(96% 82% at 84% 94%, rgba(45,212,191,0.18) 0%, transparent 68%)`
                        : 'repeating-linear-gradient(126deg, rgba(148,163,184,0.35) 0 1px, transparent 1px 46px), repeating-linear-gradient(0deg, rgba(74,222,128,0.24) 0 1px, transparent 1px 58px)',
                    backgroundSize: isRubrosTone ? '360px 312px, 360px 312px, auto, auto' : undefined,
                    backgroundPosition: isRubrosTone ? '0 0, 180px 156px, left top, right bottom' : undefined,
                    backgroundRepeat: isRubrosTone ? 'repeat, repeat, no-repeat, no-repeat' : undefined,
                    maskImage: isRubrosTone
                        ? 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0.92) 28%, rgba(0,0,0,0.28) 76%, transparent 100%)'
                        : 'radial-gradient(ellipse at center, rgba(0,0,0,0.76) 24%, transparent 90%)',
                }}
            />
            <div className="relative z-10">{children}</div>
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" style={{ background: config.tint }} />
        </div>
    )
}

const SHOW_TESTIMONIOS_SECTION = false

export default function AIImplementationsPage() {
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }, [])

    return (
        <main className="ai-impl-page relative min-h-screen w-full overflow-x-clip scroll-smooth bg-[#080810] text-white">
            <HeroIA />

            <div className="fixed inset-x-0 top-0 z-[20] h-32 pointer-events-none bg-gradient-to-b from-[#080810] to-transparent" aria-hidden="true" />

            <SectionReveal>
                <SectionTone tone="demo">
                    <DemoIA />
                </SectionTone>
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <SectionTone tone="garantia">
                    <GarantiaIA />
                </SectionTone>
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <SectionTone tone="pipeline">
                    <PipelineIA />
                </SectionTone>
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <SectionTone tone="livechat">
                    <LiveChatIA />
                </SectionTone>
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <SectionTone tone="rubros">
                    <RubrosIA />
                </SectionTone>
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <SectionTone tone="comparador">
                    <ComparadorIA />
                </SectionTone>
            </SectionReveal>

            {SHOW_TESTIMONIOS_SECTION && (
                <>
                    <SectionDivider />

                    <SectionReveal delay={0.05}>
                        <SectionTone tone="testimonios">
                            <TestimoniosIA />
                        </SectionTone>
                    </SectionReveal>
                </>
            )}

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <FaqIA />
            </SectionReveal>

            <SectionDivider />

            <SectionReveal delay={0.05}>
                <CtaIA />
            </SectionReveal>


        </main>
    )
}
