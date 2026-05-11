"use client"

import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { motion } from 'framer-motion'
import { Environment, ContactShadows } from '@react-three/drei'
import { EffectComposer, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import { HeroArtifact } from '@/components/3d/HeroArtifact'
import { DotMatrixMesh } from '@/components/canvas/DotMatrix'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'
import { type PreloaderPhase, usePreloader } from '@/context/PreloaderContext'

const HERO_KEYWORDS = [
    "las 24 horas",
    "sin perder clientes",
    "mientras dorm\u00EDs",
    "en piloto autom\u00E1tico",
]

const HERO_REVEAL_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

const HERO_CONTENT_HIDDEN = { opacity: 0, y: 24 }
const HERO_CONTENT_VISIBLE = { opacity: 1, y: 0 }

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia(query)
        const updateMatches = () => setMatches(mediaQuery.matches)

        updateMatches()
        mediaQuery.addEventListener('change', updateMatches)

        return () => {
            mediaQuery.removeEventListener('change', updateMatches)
        }
    }, [query])

    return matches
}

function MobileInputHandler() {
    const { pointer } = useThree()
    const lastTouchRef = useRef(0)
    const orientationEnabledRef = useRef(false)

    useEffect(() => {
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                lastTouchRef.current = Date.now()
                const touch = e.touches[0]
                pointer.x = (touch.clientX / window.innerWidth) * 2 - 1
                pointer.y = -(touch.clientY / window.innerHeight) * 2 + 1
            }
        }

        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (Date.now() - lastTouchRef.current < 900) return
            const gamma = e.gamma ?? 0
            const beta = e.beta ?? 45
            pointer.x = Math.max(-1, Math.min(1, gamma / 28))
            pointer.y = Math.max(-1, Math.min(1, (beta - 45) / 34))
        }

        const enableOrientation = () => {
            if (orientationEnabledRef.current) return
            orientationEnabledRef.current = true
            window.addEventListener('deviceorientation', handleOrientation, { passive: true })
        }

        const requestOrientationPermission = () => {
            if (typeof window.DeviceOrientationEvent === 'undefined') return

            const orientationEvent = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
                requestPermission?: () => Promise<PermissionState>
            }

            if (typeof orientationEvent?.requestPermission !== 'function') {
                enableOrientation()
                return
            }

            void orientationEvent.requestPermission()
                .then((permission) => {
                    if (permission === 'granted') enableOrientation()
                })
                .catch(() => undefined)
        }

        window.addEventListener('touchmove', handleTouchMove, { passive: true })
        window.addEventListener('touchstart', requestOrientationPermission, { once: true, passive: true })
        window.addEventListener('pointerdown', requestOrientationPermission, { once: true, passive: true })
        requestOrientationPermission()

        return () => {
            window.removeEventListener('touchmove', handleTouchMove)
            window.removeEventListener('touchstart', requestOrientationPermission)
            window.removeEventListener('pointerdown', requestOrientationPermission)
            window.removeEventListener('deviceorientation', handleOrientation)
        }
    }, [pointer])

    return null
}

function HeroCanvasSizeSync({
    active,
    targetRef,
}: {
    active: boolean
    targetRef: RefObject<HTMLDivElement | null>
}) {
    const { invalidate, setSize } = useThree()

    useLayoutEffect(() => {
        if (!active) return

        const frameIds: number[] = []

        const syncSize = () => {
            const target = targetRef.current
            if (!target) return

            const rect = target.getBoundingClientRect()
            if (rect.width <= 0 || rect.height <= 0) return

            setSize(rect.width, rect.height, rect.top, rect.left)
            invalidate()
        }

        const syncAcrossFrames = () => {
            syncSize()
            const firstFrame = window.requestAnimationFrame(() => {
                syncSize()
                const secondFrame = window.requestAnimationFrame(syncSize)
                frameIds.push(secondFrame)
            })
            frameIds.push(firstFrame)
        }

        syncAcrossFrames()

        const resizeObserver =
            typeof ResizeObserver !== 'undefined' && targetRef.current
                ? new ResizeObserver(syncAcrossFrames)
                : null

        if (resizeObserver && targetRef.current) {
            resizeObserver.observe(targetRef.current)
        }

        window.addEventListener('resize', syncAcrossFrames)
        window.addEventListener('orientationchange', syncAcrossFrames)

        return () => {
            resizeObserver?.disconnect()
            frameIds.forEach((frameId) => window.cancelAnimationFrame(frameId))
            window.removeEventListener('resize', syncAcrossFrames)
            window.removeEventListener('orientationchange', syncAcrossFrames)
        }
    }, [active, invalidate, setSize, targetRef])

    return null
}

function ResponsiveHeroArtifact({
    phase,
    isSplitLayout,
}: {
    phase: PreloaderPhase
    isSplitLayout: boolean
}) {
    const { size } = useThree()
    const aspect = size.width / Math.max(size.height, 1)
    const scale = isSplitLayout
        ? aspect < 0.8
            ? Math.max(0.52, aspect * 0.96)
            : Math.min(1.12, aspect * 1.02)
        : Math.min(1.28, Math.max(1.02, aspect * 0.78))
    const y = isSplitLayout ? 0.08 : 0.02

    return (
        <group scale={scale} position={[0, y, 0]}>
            <HeroArtifact phase={phase} />
        </group>
    )
}

export function Hero() {
    const { phase, setHeroCanvasRect, setPhase } = usePreloader()
    const canvasWrapperRef = useRef<HTMLDivElement>(null)
    const isSplitLayout = useMediaQuery('(min-width: 768px)')

    const canvasVisible = phase === 'swapping' || phase === 'done'
    const isSwapping = phase === 'swapping'
    const textVisible = phase === 'done'

    useEffect(() => {
        const reportRect = () => {
            if (canvasWrapperRef.current) {
                const originalTransform = canvasWrapperRef.current.style.transform
                canvasWrapperRef.current.style.transform = 'none'
                const rect = canvasWrapperRef.current.getBoundingClientRect()
                canvasWrapperRef.current.style.transform = originalTransform
                setHeroCanvasRect(rect)
            }
        }

        const reportAcrossFrames = () => {
            reportRect()
            const firstFrame = window.requestAnimationFrame(() => {
                reportRect()
                window.requestAnimationFrame(reportRect)
            })

            return firstFrame
        }

        reportRect()
        const frameId = reportAcrossFrames()
        const resizeObserver =
            typeof ResizeObserver !== 'undefined' && canvasWrapperRef.current
                ? new ResizeObserver(reportRect)
                : null

        if (resizeObserver && canvasWrapperRef.current) {
            resizeObserver.observe(canvasWrapperRef.current)
        }

        window.addEventListener('resize', reportRect)
        window.addEventListener('orientationchange', reportAcrossFrames)

        return () => {
            window.cancelAnimationFrame(frameId)
            resizeObserver?.disconnect()
            window.removeEventListener('resize', reportRect)
            window.removeEventListener('orientationchange', reportAcrossFrames)
        }
    }, [canvasVisible, isSplitLayout, phase, setHeroCanvasRect])

    useEffect(() => {
        if (!canvasVisible) return

        const frameId = window.requestAnimationFrame(() => {
            window.dispatchEvent(new Event('resize'))
        })

        return () => {
            window.cancelAnimationFrame(frameId)
        }
    }, [canvasVisible, isSplitLayout, phase])

    useEffect(() => {
        const safety = window.setTimeout(() => {
            if (phase !== 'done') {
                console.warn('Preloader safety timeout triggered')
                setPhase('done')
            }
        }, 6000)

        return () => {
            window.clearTimeout(safety)
        }
    }, [phase, setPhase])

    return (
        <motion.section
            className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#f1f2f4] pb-12 pt-5 md:grid md:min-h-screen md:grid-cols-2 md:items-stretch md:pb-0 md:pt-0"
            id="inicio"
            initial={false}
            animate={{ opacity: canvasVisible ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    background:
                        'radial-gradient(circle at 16% 10%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 28%, rgba(241,242,244,0) 58%), radial-gradient(ellipse at 86% 16%, rgba(212,212,216,0.58) 0%, rgba(241,242,244,0) 48%), linear-gradient(180deg, rgba(255,255,255,0.48) 0%, rgba(244,244,245,0.2) 42%, rgba(161,161,170,0.18) 100%)',
                }}
            />

            <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 pointer-events-none z-0 w-full md:w-[58%]"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, rgba(9,9,11,0.11) 1px, transparent 1px), linear-gradient(to bottom, rgba(9,9,11,0.095) 1px, transparent 1px), radial-gradient(circle at 16% 42%, rgba(24,24,27,0.13) 0%, rgba(24,24,27,0.045) 18%, transparent 43%)',
                    backgroundSize: '2rem 2rem, 2rem 2rem, 100% 100%',
                    maskImage:
                        'linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.58) 62%, transparent 100%)',
                    WebkitMaskImage:
                        'linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.58) 62%, transparent 100%)',
                    opacity: 0.48,
                }}
            />

            <motion.div
                animate={phase === 'done' ? { translateY: [0, 64] } : { translateY: 0 }}
                transition={phase === 'done' ? { duration: 10, repeat: Infinity, ease: "linear" } : { duration: 0 }}
                className="absolute inset-y-0 left-0 w-full md:w-1/2 pointer-events-none z-0"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, rgba(24,24,27,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(24,24,27,0.075) 1px, transparent 1px)',
                    backgroundSize: '4rem 4rem',
                    maskImage:
                        'radial-gradient(ellipse 96% 72% at 45% 8%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.68) 58%, transparent 100%)',
                    WebkitMaskImage:
                        'radial-gradient(ellipse 96% 72% at 45% 8%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.68) 58%, transparent 100%)',
                }}
            />

            <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-full md:w-1/2 pointer-events-none z-0"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, rgba(24,24,27,0.18) 1px, transparent 1.5px), linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.76) 24%, transparent 42%, transparent 100%)',
                    backgroundSize: '4rem 4rem, 100% 100%',
                    backgroundPosition: '0.8rem 0.8rem, 0 0',
                    opacity: 0.42,
                    maskImage:
                        'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.28) 100%)',
                    WebkitMaskImage:
                        'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.28) 100%)',
                }}
            />

            <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-full md:w-1/2 pointer-events-none z-0"
                style={{
                    background:
                        'linear-gradient(90deg, rgba(9,9,11,0.055) 0%, transparent 22%, transparent 72%, rgba(9,9,11,0.06) 100%), linear-gradient(180deg, transparent 0%, transparent 58%, rgba(9,9,11,0.11) 100%)',
                }}
            />

            <div
                aria-hidden="true"
                className="absolute left-[clamp(2rem,5vw,6rem)] top-[21%] z-0 hidden h-[48%] w-[min(42rem,44vw)] pointer-events-none md:block"
                style={{
                    background:
                        'radial-gradient(ellipse at 28% 34%, rgba(255,255,255,0.54) 0%, rgba(255,255,255,0.24) 34%, rgba(255,255,255,0) 72%)',
                    filter: 'blur(34px)',
                }}
            />

            <div className="contents md:relative md:z-10 md:col-start-1 md:row-start-1 md:flex md:min-h-screen md:flex-col md:justify-center md:px-[clamp(2.25rem,4.6vw,6rem)] md:pb-[clamp(6rem,11vh,9rem)] md:pt-[clamp(4.75rem,9vh,7.5rem)]">
                {/* INTRO */}
                <div className="relative z-10 order-1 px-6 text-center text-zinc-900 sm:px-8 md:px-0 md:text-left">
                    <div className="space-y-4 md:space-y-8">
                        {/* Badge */}
                        <motion.div
                            initial={HERO_CONTENT_HIDDEN}
                            animate={textVisible ? HERO_CONTENT_VISIBLE : HERO_CONTENT_HIDDEN}
                            transition={{ duration: 0.7, delay: 0, ease: HERO_REVEAL_EASE }}
                            className="flex max-w-full items-center justify-center gap-2 font-mono text-[8px] uppercase leading-relaxed tracking-[0.28em] text-zinc-700 sm:text-[9px] sm:tracking-[0.34em] md:justify-start md:text-[10px] md:tracking-[0.46em]"
                        >
                            <span className="w-1 h-1 bg-zinc-900 rounded-full shadow-[0_0_8px_rgba(24,24,27,0.4)]" />
                            {"\u2726"} AGENCIA DIGITAL {"\u2014"} {"TUCUM\u00C1N, ARGENTINA"}
                        </motion.div>

                        {/* H1 Metallic Upgrade with Reveal Animation */}
                        <h1 className="mx-auto max-w-full py-1 text-[clamp(2rem,9.6vw,3rem)] font-black leading-[1.02] tracking-tighter md:mx-0 md:max-w-none md:py-2 md:text-[clamp(2.15rem,3.7vw,4.5rem)] md:leading-[1.04] lg:max-w-3xl lg:text-[clamp(2.3rem,4vw,4.5rem)]">
                            <motion.div
                                initial={HERO_CONTENT_HIDDEN}
                                animate={textVisible ? HERO_CONTENT_VISIBLE : HERO_CONTENT_HIDDEN}
                                transition={{ duration: 0.7, delay: 0.08, ease: HERO_REVEAL_EASE }}
                                className="overflow-visible"
                            >
                                <span className="inline-block pb-[0.14em] pr-[0.12em] text-transparent bg-clip-text bg-gradient-to-b from-zinc-500 via-zinc-600 to-zinc-800 drop-shadow-[0_2px_12px_rgba(255,255,255,0.26)]">
                                    Tu negocio abierto
                                </span>
                            </motion.div>
                            <motion.div
                                initial={HERO_CONTENT_HIDDEN}
                                animate={textVisible ? HERO_CONTENT_VISIBLE : HERO_CONTENT_HIDDEN}
                                transition={{ duration: 0.7, delay: 0.16, ease: HERO_REVEAL_EASE }}
                                className="overflow-visible"
                            >
                                <span className="block min-h-[2.12em] px-[0.42em] pb-[0.12em] leading-[1.02] text-center [filter:none] [text-shadow:none] md:min-h-[2.16em] md:px-0 md:pr-[0.7em] md:text-left md:leading-[1.04] xl:min-h-[1.2em]">
                                    {textVisible ? (
                                        <TypewriterText
                                            words={HERO_KEYWORDS}
                                            typingSpeed={70}
                                            deletingSpeed={40}
                                            pauseDuration={2000}
                                            className="inline max-w-full whitespace-normal bg-gradient-to-b from-zinc-700 via-zinc-800 to-black bg-clip-text pb-[0.12em] pr-[0.12em] text-transparent [filter:none] [text-shadow:none]"
                                            cursorClassName="text-zinc-900"
                                        />
                                    ) : null}
                                </span>
                            </motion.div>
                        </h1>

                    </div>
                </div>

                {/* DETAILS */}
                <div className="relative z-10 order-3 mt-2 px-6 text-center text-zinc-900 sm:px-8 md:mt-8 md:px-0 md:text-left xl:mt-10">
                    <div className="space-y-4 md:space-y-5 xl:space-y-7">
                        <motion.p
                            initial={HERO_CONTENT_HIDDEN}
                            animate={textVisible ? HERO_CONTENT_VISIBLE : HERO_CONTENT_HIDDEN}
                            transition={{ duration: 0.7, delay: 0.28, ease: HERO_REVEAL_EASE }}
                            className="mx-auto max-w-md text-[0.95rem] font-light leading-[1.48] tracking-wide text-zinc-500 sm:text-lg md:mx-0 md:max-w-xl md:text-base md:leading-relaxed lg:text-lg xl:text-xl"
                        >
                            Hacemos que tu negocio <strong className="text-zinc-900 font-semibold">venda, atienda y crezca solo</strong>.
                            Sitios web, <span className="text-zinc-900 font-semibold drop-shadow-[0_1px_10px_rgba(24,24,27,0.12)]">automatizaciones</span>{' '}
                            e <span className="text-zinc-900 font-semibold drop-shadow-[0_1px_10px_rgba(24,24,27,0.12)]">inteligencia artificial</span> para empresas de cualquier rubro.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={HERO_CONTENT_HIDDEN}
                            animate={textVisible ? HERO_CONTENT_VISIBLE : HERO_CONTENT_HIDDEN}
                            transition={{ duration: 0.7, delay: 0.42, ease: HERO_REVEAL_EASE }}
                            className="mx-auto flex w-full max-w-md flex-col gap-3 pt-0 md:mx-0 md:w-auto md:max-w-none md:gap-2 md:pt-2 lg:flex-row xl:gap-4 xl:pt-4"
                        >
                            <MagneticCta className="w-full px-8 py-3.5 text-[9px] md:w-fit md:px-8 md:py-4 md:text-[9px] xl:px-14 xl:py-6 xl:text-[10px]">
                                Quiero una demo gratis
                            </MagneticCta>
                            <MagneticCta className="w-full px-8 py-3.5 text-[9px] md:w-fit md:px-8 md:py-4 md:text-[9px] xl:px-14 xl:py-6 xl:text-[10px]">
                                Ver nuestros trabajos
                            </MagneticCta>
                        </motion.div>

                        {/* Micro-copy */}
                        <motion.p
                            initial={HERO_CONTENT_HIDDEN}
                            animate={textVisible ? HERO_CONTENT_VISIBLE : HERO_CONTENT_HIDDEN}
                            transition={{ duration: 0.7, delay: 0.56, ease: HERO_REVEAL_EASE }}
                            className="mx-auto max-w-md text-[11px] tracking-wide text-zinc-500 md:mx-0 md:max-w-none md:text-xs"
                        >
                            {"\u2726"} Primera consulta sin costo {"\u2014"} respondemos en menos de 24hs
                        </motion.p>
                    </div>
                </div>
            </div>

            {/* COLUMN RIGHT: 3D ARTIFACT */}
            <motion.div
                ref={canvasWrapperRef}
                animate={{
                    opacity: canvasVisible ? 1 : 0,
                    scale: isSwapping ? 1.035 : canvasVisible ? 1 : 0.88,
                    y: isSwapping ? 10 : canvasVisible ? 0 : 28,
                    filter: canvasVisible ? 'blur(0px)' : 'blur(12px)',
                }}
                transition={{
                    duration: 0.7,
                    ease: HERO_REVEAL_EASE,
                    filter: { duration: 0.5 },
                }}
                className="relative z-10 order-2 mx-auto mt-1 flex h-[clamp(12rem,32svh,18rem)] w-[calc(100%-3rem)] max-w-[28rem] items-center justify-center overflow-visible bg-transparent sm:w-[calc(100%-4rem)] md:col-start-2 md:row-start-1 md:m-0 md:h-screen md:w-full md:max-w-none md:overflow-hidden md:bg-zinc-50"
            >
                <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 z-0 hidden h-[58%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.84)_0%,rgba(228,228,231,0.34)_38%,rgba(244,244,245,0)_72%)] blur-3xl pointer-events-none md:block"
                />
                <div
                    aria-hidden="true"
                    className="absolute bottom-[18%] left-1/2 z-0 h-10 w-[74%] -translate-x-1/2 rounded-full bg-black/20 blur-2xl pointer-events-none md:hidden"
                />
                <Canvas className="relative z-10 h-full w-full" camera={{ position: [0, 0, isSplitLayout ? 15 : 13], fov: isSplitLayout ? 35 : 30 }} gl={{ alpha: true, powerPreference: "high-performance", antialias: false, stencil: false, depth: true }} dpr={[1, 1.5]}>
                    <HeroCanvasSizeSync active={canvasVisible} targetRef={canvasWrapperRef} />
                    <MobileInputHandler />
                    <Suspense fallback={null}>
                        {/* Background Dot Matrix */}
                        {isSplitLayout ? <DotMatrixMesh /> : null}

                        {/* Lighting Setup */}
                        <ambientLight intensity={1.5} />
                        <Environment preset="studio" />

                        {/* 3D Logo (Front) */}
                        <ResponsiveHeroArtifact phase={phase} isSplitLayout={isSplitLayout} />

                        {/* Contact Shadows for depth */}
                        {isSplitLayout ? (
                            <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={15} blur={2} far={4} color="#000000" />
                        ) : null}

                        {/* Post-Processing Effects */}
                        <EffectComposer enableNormalPass={false}>
                            <ChromaticAberration offset={[0.0015, 0.0015]} />
                            <Noise opacity={0.05} premultiply />
                            <Vignette eskil={false} offset={0.1} darkness={0.5} />
                        </EffectComposer>
                    </Suspense>
                </Canvas>
            </motion.div>

            {/* Bottom Fade (Integration with Dark Section) */}
            <div
                className="absolute bottom-0 left-0 z-20 h-44 w-full pointer-events-none md:h-80"
                style={{ background: 'linear-gradient(to top, rgb(9,9,11) 0%, rgba(24,24,27,0.7) 35%, rgba(24,24,27,0.28) 58%, transparent 100%)' }}
            />
        </motion.section>
    )
}
