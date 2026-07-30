"use client"

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, useTransform } from 'motion/react'
import { LogoStrokeOverlay } from '@/components/ui/LogoStrokeOverlay'
import { IntroLockupText } from '@/components/ui/IntroLockupText'
import { TypewriterText } from '@/components/ui/TypewriterText'
import { MagneticCta } from '@/components/ui/buttons/MagneticCta'
import { usePreloader } from '@/context/PreloaderContext'
import { useLenis } from '@/components/layout/SmoothScroll'

// Canvas 3D del hero en su propio módulo, cargado client-only: three, r3f, drei
// y postprocessing quedan FUERA del bundle inicial del home. Mismo logo, mismos
// efectos — solo cambia cuándo y de dónde carga.
const HeroCanvas = dynamic(() => import('@/components/layout/HeroCanvas'), { ssr: false })

const HERO_KEYWORDS = [
    "las 24 horas",
    "sin perder clientes",
    "mientras dormís",
    "en piloto automático",
]

const HERO_REVEAL_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

const HERO_CONTENT_HIDDEN = { opacity: 0, y: 24 }
const HERO_CONTENT_VISIBLE = { opacity: 1, y: 0 }

// R3 — colores del trazado 2D del logo en el HOME (fondo BLANCO del intro): el
// stroke/relleno son NEGROS; la mask = blanco (= el velo blanco → invisible, tapa
// el chrome asentado detrás hasta el crossfade). Tunables.
const HOME_MASK_COLOR = '#ffffff'
const HOME_STROKE_COLOR = '#09090b'

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

export function Hero() {
    const {
        phase,
        setPhase,
        introProgress,
        canvasReveal,
        logoStrokeProgress,
        logoFillProgress,
        logoLayerOpacity,
        dotsReveal,
        textReveal,
        markLogoReady,
    } = usePreloader()
    const sectionRef = useRef<HTMLElement>(null)
    const canvasWrapperRef = useRef<HTMLDivElement>(null)
    const fullBleedRef = useRef<HTMLDivElement>(null)
    // Gate de viewport del render loop del canvas. Sin `frameloop`, R3F usa 'always':
    // los 3 useFrame (HeroLogo, HeroLogoShadow, DesktopPointerSync) y los 3 pases del
    // EffectComposer seguían corriendo con el hero fuera de pantalla. Arranca en true
    // para no arriesgar la coreografía de intro, que corre siempre con el hero visible
    // y el scroll bloqueado; el observer solo puede apagarlo al scrollear.
    const [isHeroInView, setIsHeroInView] = useState(true)
    // Tamaño real del canvas in-box de mobile: la overlay lo necesita para que el SVG
    // matchee el footprint del 3D (window.innerHeight daría un SVG mucho más grande).
    const [mobileCanvasPx, setMobileCanvasPx] = useState<{ w: number; h: number } | null>(null)
    const isSplitLayout = useMediaQuery('(min-width: 768px)')
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
    const lenis = useLenis()

    // El contenido (izquierda) y el bottom-fade entran al comprimir (swapping||done).
    const contentVisible = phase === 'swapping' || phase === 'done'
    // Capa intro blanca: comprime de full-screen a mitad derecha con introProgress.
    const whiteScaleX = useTransform(introProgress, [0, 1], [1, 0.5])

    // GUARD: si el hero se monta/queda con phase ya en 'done' (fin del intro,
    // nav-in desde otra página, o skip de automation), forzar el estado FINAL
    // visible — canvas a opacidad 1, logo a la derecha, dots densos. Nunca en blanco.
    useEffect(() => {
        if (phase === 'done') {
            introProgress.set(1)
            canvasReveal.set(1)
            // R3: estado final del reveal (overlay ausente + puntos visibles), por si
            // el hero queda en 'done' sin pasar por el reveal (automation, nav-in, safety).
            logoStrokeProgress.set(1)
            logoFillProgress.set(1)
            logoLayerOpacity.set(0)
            dotsReveal.set(1)
            textReveal.set(0) // hero final SIN texto del lockup (es solo del intro)
        }
    }, [phase, introProgress, canvasReveal, logoStrokeProgress, logoFillProgress, logoLayerOpacity, dotsReveal, textReveal])

    // Medir el canvas wrapper mobile para que la LogoStrokeOverlay sepa sus dimensiones
    // reales (window.innerHeight daría un SVG ~3× más grande que el logo in-box).
    useEffect(() => {
        if (isSplitLayout) return
        const ref = canvasWrapperRef.current
        if (!ref) return
        const r = ref.getBoundingClientRect()
        if (r.width > 0 && r.height > 0) {
            setMobileCanvasPx({ w: r.width, h: r.height })
        }
    }, [isSplitLayout])

    // Scroll lock REAL durante todo el intro: html + body overflow hidden + lenis.stop().
    // Se libera SOLO en 'done'. El Hero es home-only y vive dentro de SmoothScroll, así
    // que es el dueño del lock. No se reinicia por fase: stop() en toda fase != done,
    // start() solo en done.
    useEffect(() => {
        const html = document.documentElement
        const body = document.body
        if (phase === 'done') {
            html.style.overflow = ''
            body.style.overflow = ''
            lenis?.start()
        } else {
            html.style.overflow = 'hidden'
            body.style.overflow = 'hidden'
            lenis?.stop()
        }
    }, [lenis, phase])

    // Pausa el render loop del canvas cuando el hero sale del viewport.
    useEffect(() => {
        const node = sectionRef.current
        if (!node || typeof IntersectionObserver === 'undefined') return

        const observer = new IntersectionObserver(
            ([entry]) => setIsHeroInView(entry.isIntersecting),
            { rootMargin: '120px' },
        )
        observer.observe(node)

        return () => observer.disconnect()
    }, [])

    // Si el Hero se desmonta a mitad del intro (navegación), liberar el scroll.
    useEffect(() => {
        return () => {
            document.documentElement.style.overflow = ''
            document.body.style.overflow = ''
        }
    }, [])

    // Red de seguridad: nunca dejar al usuario varado en el intro si el timeline cuelga.
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
        <section
            ref={sectionRef}
            className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#f1f2f4] pb-12 pt-5 md:grid md:min-h-screen md:grid-cols-2 md:items-stretch md:pb-0 md:pt-0"
            id="inicio"
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

            {/* DESKTOP: capa intro blanca (debajo del canvas) que comprime full-screen → mitad derecha */}
            {isSplitLayout ? (
                <motion.div
                    aria-hidden="true"
                    className="absolute inset-0 z-[5] origin-right bg-white pointer-events-none"
                    style={{ scaleX: whiteScaleX }}
                    initial={false}
                    animate={{ opacity: phase === 'done' ? 0 : 1 }}
                    transition={{ duration: 0.5, ease: HERO_REVEAL_EASE }}
                />
            ) : null}

            {/* DESKTOP: canvas full-bleed (logo + puntos), pointer-events:none, debajo del contenido */}
            {isSplitLayout ? (
                <motion.div
                    ref={fullBleedRef}
                    className="absolute inset-0 z-[6] pointer-events-none"
                    style={{ opacity: canvasReveal }}
                >
                    <HeroCanvas
                        active
                        isSplitLayout
                        targetRef={fullBleedRef}
                        introProgress={introProgress}
                        layerOpacity={logoLayerOpacity}
                        dotsReveal={dotsReveal}
                        prefersReducedMotion={prefersReducedMotion}
                        onLogoReady={markLogoReady}
                        frameloop={isHeroInView ? 'always' : 'demand'}
                    />
                </motion.div>
            ) : null}

            {/* DESKTOP: trazado 2D del logo (NEGRO) sobre el canvas full-bleed. Se
                dibuja → rellena negro → crossfade al chrome (R3). Client-only
                (se auto-gatea); centrado (introProgress=0 durante el reveal). */}
            {isSplitLayout && !prefersReducedMotion ? (
                <div aria-hidden="true" className="absolute inset-0 z-[7] pointer-events-none">
                    <LogoStrokeOverlay
                        isSplitLayout
                        strokeColor={HOME_STROKE_COLOR}
                        maskColor={HOME_MASK_COLOR}
                        strokeProgress={logoStrokeProgress}
                        fillProgress={logoFillProgress}
                        layerOpacity={logoLayerOpacity}
                    />
                </div>
            ) : null}

            {/* DESKTOP: lockup de texto del intro ("develOP" + slogan, NEGRO) sobre
                el logo. Se escribe junto al dibujado y se BORRA antes del flying
                (no sigue al logo). Mismo footprint → centrado sobre la marca. */}
            {isSplitLayout && !prefersReducedMotion ? (
                <div className="absolute inset-0 z-[8] pointer-events-none">
                    <IntroLockupText
                        isSplitLayout
                        color={HOME_STROKE_COLOR}
                        reveal={textReveal}
                    />
                </div>
            ) : null}

            <div className="contents md:relative md:z-10 md:col-start-1 md:row-start-1 md:flex md:min-h-screen md:flex-col md:justify-center md:px-[clamp(2.25rem,4.6vw,6rem)] md:pb-[clamp(6rem,11vh,9rem)] md:pt-[clamp(4.75rem,9vh,7.5rem)]">
                {/* INTRO */}
                <div className="relative z-10 order-1 px-6 text-center text-zinc-900 sm:px-8 md:px-0 md:text-left">
                    <div className="space-y-4 md:space-y-8">
                        {/* Badge */}
                        <motion.div
                            initial={HERO_CONTENT_HIDDEN}
                            animate={contentVisible ? HERO_CONTENT_VISIBLE : HERO_CONTENT_HIDDEN}
                            transition={{ duration: 0.7, delay: 0, ease: HERO_REVEAL_EASE }}
                            className="flex max-w-full items-center justify-center gap-2 font-mono text-[8px] uppercase leading-relaxed tracking-[0.28em] text-zinc-700 sm:text-[9px] sm:tracking-[0.34em] md:justify-start md:text-[10px] md:tracking-[0.46em]"
                        >
                            <span className="w-1 h-1 bg-zinc-900 rounded-full shadow-[0_0_8px_rgba(24,24,27,0.4)]" />
                            {"✦"} AGENCIA DIGITAL {"—"} {"TUCUMÁN, ARGENTINA"}
                        </motion.div>

                        {/* H1 Metallic Upgrade with Reveal Animation */}
                        <h1 className="mx-auto max-w-full py-1 text-[clamp(2rem,9.6vw,3rem)] font-black leading-[1.02] tracking-tighter md:mx-0 md:max-w-none md:py-2 md:text-[clamp(2.15rem,3.7vw,4.5rem)] md:leading-[1.04] lg:max-w-3xl lg:text-[clamp(2.3rem,4vw,4.5rem)]">
                            <motion.div
                                initial={HERO_CONTENT_HIDDEN}
                                animate={contentVisible ? HERO_CONTENT_VISIBLE : HERO_CONTENT_HIDDEN}
                                transition={{ duration: 0.7, delay: 0.08, ease: HERO_REVEAL_EASE }}
                                className="overflow-visible"
                            >
                                <span className="inline-block pb-[0.14em] pr-[0.12em] text-transparent bg-clip-text bg-gradient-to-b from-zinc-500 via-zinc-600 to-zinc-800 drop-shadow-[0_2px_12px_rgba(255,255,255,0.26)]">
                                    Tu negocio abierto
                                </span>
                            </motion.div>
                            <motion.div
                                initial={HERO_CONTENT_HIDDEN}
                                animate={contentVisible ? HERO_CONTENT_VISIBLE : HERO_CONTENT_HIDDEN}
                                transition={{ duration: 0.7, delay: 0.16, ease: HERO_REVEAL_EASE }}
                                className="overflow-visible"
                            >
                                <span className="block min-h-[2.12em] px-[0.42em] pb-[0.12em] leading-[1.02] text-center [filter:none] [text-shadow:none] md:min-h-[2.16em] md:px-0 md:pr-[0.7em] md:text-left md:leading-[1.04] xl:min-h-[1.2em]">
                                    {contentVisible ? (
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
                            animate={contentVisible ? HERO_CONTENT_VISIBLE : HERO_CONTENT_HIDDEN}
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
                            animate={contentVisible ? HERO_CONTENT_VISIBLE : HERO_CONTENT_HIDDEN}
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
                            animate={contentVisible ? HERO_CONTENT_VISIBLE : HERO_CONTENT_HIDDEN}
                            transition={{ duration: 0.7, delay: 0.56, ease: HERO_REVEAL_EASE }}
                            className="mx-auto max-w-md text-[11px] tracking-wide text-zinc-500 md:mx-0 md:max-w-none md:text-xs"
                        >
                            {"✦"} Primera consulta sin costo {"—"} respondemos en menos de 24hs
                        </motion.p>
                    </div>
                </div>
            </div>

            {/* COLUMN RIGHT: panel bg-zinc-50 (+ canvas in-box en mobile). El canvas
                desktop es full-bleed (arriba); este panel queda DEBAJO del canvas
                (z-0) y se revela cuando la capa blanca hace fade-out en 'done'. */}
            <div
                ref={canvasWrapperRef}
                className="relative z-0 order-2 mx-auto mt-1 flex h-[clamp(12rem,32svh,18rem)] w-[calc(100%-3rem)] max-w-[28rem] items-center justify-center overflow-visible bg-transparent sm:w-[calc(100%-4rem)] md:col-start-2 md:row-start-1 md:m-0 md:h-screen md:w-full md:max-w-none md:overflow-hidden md:bg-zinc-50"
            >
                <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 z-0 hidden h-[58%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.84)_0%,rgba(228,228,231,0.34)_38%,rgba(244,244,245,0)_72%)] blur-3xl pointer-events-none md:block"
                />
                <div
                    aria-hidden="true"
                    className="absolute bottom-[18%] left-1/2 z-0 h-10 w-[74%] -translate-x-1/2 rounded-full bg-black/20 blur-2xl pointer-events-none md:hidden"
                />
                {!isSplitLayout ? (
                    <motion.div className="absolute inset-0" style={{ opacity: canvasReveal }}>
                        <HeroCanvas
                            active
                            isSplitLayout={false}
                            targetRef={canvasWrapperRef}
                            introProgress={introProgress}
                            layerOpacity={logoLayerOpacity}
                            dotsReveal={dotsReveal}
                            prefersReducedMotion={prefersReducedMotion}
                            onLogoReady={markLogoReady}
                            frameloop={isHeroInView ? 'always' : 'demand'}
                        />
                    </motion.div>
                ) : null}

                {/* MOBILE: overlay 2D del pintado (NEGRO). Se monta cuando se conoce
                    el tamaño del canvas in-box (mobileCanvasPx). La overlay tapa el 3D
                    hasta el crossfade instantáneo → chrome + contenido aparecen juntos. */}
                {!isSplitLayout && !prefersReducedMotion && mobileCanvasPx ? (
                    <div aria-hidden="true" className="absolute inset-0 z-10 pointer-events-none">
                        <LogoStrokeOverlay
                            isSplitLayout={false}
                            strokeColor={HOME_STROKE_COLOR}
                            maskColor={HOME_MASK_COLOR}
                            strokeProgress={logoStrokeProgress}
                            fillProgress={logoFillProgress}
                            layerOpacity={logoLayerOpacity}
                            canvasSizePx={mobileCanvasPx}
                        />
                    </div>
                ) : null}

                {/* MOBILE: lockup de texto del intro ("develOP" + slogan, NEGRO).
                    El wrapper es overflow-visible → el texto sobresale del box del
                    logo sin desbordar la pantalla. Se borra antes del swap (no
                    persiste sobre el hero real). */}
                {!isSplitLayout && !prefersReducedMotion && mobileCanvasPx ? (
                    <div className="absolute inset-0 z-20 pointer-events-none">
                        <IntroLockupText
                            isSplitLayout={false}
                            color={HOME_STROKE_COLOR}
                            reveal={textReveal}
                            canvasSizePx={mobileCanvasPx}
                        />
                    </div>
                ) : null}
            </div>

            {/* Bottom Fade (Integration with Dark Section) — entra con el contenido */}
            <motion.div
                aria-hidden="true"
                className="absolute bottom-0 left-0 z-20 h-44 w-full pointer-events-none md:h-80"
                style={{ background: 'linear-gradient(to top, rgb(9,9,11) 0%, rgba(24,24,27,0.7) 35%, rgba(24,24,27,0.28) 58%, transparent 100%)' }}
                initial={false}
                animate={{ opacity: contentVisible ? 1 : 0 }}
                transition={{ duration: 0.5, ease: HERO_REVEAL_EASE }}
            />
        </section>
    )
}
