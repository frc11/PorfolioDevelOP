'use client'
import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"

export default function StatementSection() {
    const sectionRef = useRef<HTMLElement>(null)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const section = sectionRef.current
            if (!section) return

            const rect = section.getBoundingClientRect()
            const windowH = window.innerHeight

            // El scroll empieza cuando la sección toca el fondo de la pantalla (rect.top = windowH)
            // y termina cuando la sección sale por arriba (rect.bottom = 0)
            const total = section.offsetHeight + windowH
            const traveled = windowH - rect.top
            const p = Math.min(Math.max(traveled / total, 0), 1)
            setProgress(p)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // calcular al montar
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <section
            ref={sectionRef}
            style={{
                height: '300vh',
                backgroundColor: '#080810',
                position: 'relative',
                zIndex: 0,
            }}
        >
            {/* Contenedor visible — fijo en el centro con JS */}
            <div style={{
                position: 'sticky',
                top: 0,
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#080810',
                opacity: 1,
            }}>
                <StatementContent progress={progress} />
            </div>
        </section>
    )
}

function StatementContent({ progress }: { progress: number }) {
    // Arranca cuando la sección ya cubre ~80% del viewport.
    // Con height: 300vh y el cálculo de progreso actual, eso corresponde a ~0.20.
    const revealStart = 0.20
    const revealProgress = Math.min(Math.max((progress - revealStart) / (1 - revealStart), 0), 1)

    // Función helper: devuelve opacity 0→1
    // según el progreso actual y el rango de la palabra
    function getOpacity(start: number, end: number): number {
        if (revealProgress <= start) return 0
        if (revealProgress >= end) return 1
        return (revealProgress - start) / (end - start)
    }

    function getBlur(start: number, end: number): string {
        if (revealProgress <= start) return 'blur(12px)'
        if (revealProgress >= end) return 'blur(0px)'
        const t = (revealProgress - start) / (end - start)
        return `blur(${12 * (1 - t)}px)`
    }

    function mixHexColor(from: string, to: string, t: number): string {
        const clamped = Math.min(Math.max(t, 0), 1)
        const f = from.replace('#', '')
        const tt = to.replace('#', '')

        const fr = parseInt(f.slice(0, 2), 16)
        const fg = parseInt(f.slice(2, 4), 16)
        const fb = parseInt(f.slice(4, 6), 16)

        const tr = parseInt(tt.slice(0, 2), 16)
        const tg = parseInt(tt.slice(2, 4), 16)
        const tb = parseInt(tt.slice(4, 6), 16)

        const r = Math.round(fr + (tr - fr) * clamped)
        const g = Math.round(fg + (tg - fg) * clamped)
        const b = Math.round(fb + (tb - fb) * clamped)

        return `rgb(${r}, ${g}, ${b})`
    }

    const words = [
        // Línea 1
        { text: 'El', s: 0.0, e: 0.06, color: 'white' },
        { text: 'diseño', s: 0.02, e: 0.08, color: 'white' },
        { text: 'no', s: 0.04, e: 0.10, color: 'white' },
        { text: 'es', s: 0.06, e: 0.12, color: 'white' },
        { text: 'cómo', s: 0.08, e: 0.14, color: 'white' },
        { text: 'se', s: 0.10, e: 0.16, color: 'white' },
        { text: 've.', s: 0.12, e: 0.18, color: 'white' },
        // Línea 2
        { text: 'Es', s: 0.28, e: 0.34, color: 'white' },
        { text: 'cómo', s: 0.30, e: 0.36, color: 'white' },
        { text: 'funciona.', s: 0.34, e: 0.44, color: 'cyan' },
        // Línea 3
        { text: 'Y', s: 0.52, e: 0.57, color: 'white' },
        { text: 'cómo', s: 0.54, e: 0.59, color: 'white' },
        { text: 'convierte.', s: 0.58, e: 0.72, color: 'gradient' },
    ]

    function renderWord(w: typeof words[0], i: number) {
        const op = getOpacity(w.s, w.e)
        const bl = getBlur(w.s, w.e)

        // Nueva: la palabra sube mientras aparece
        // Cuando op=0: translateY 16px (abajo)
        // Cuando op=1: translateY 0px (posición final)
        const ty = (1 - op) * 16

        const base: React.CSSProperties = {
            display: 'inline-block',
            marginRight: '0.22em',
            opacity: 0.24 + op * 0.76,
            filter: bl,
            transform: `translateY(${ty}px)`,
            transition: 'none',
            willChange: 'opacity, filter, transform',
        }

        const inactiveColor = '#3f3f46'
        const activeColor =
            w.color === 'cyan'
                ? '#22d3ee'
                : w.color === 'gradient'
                    ? '#a78bfa'
                    : '#ffffff'

        return (
            <span key={i} style={{
                ...base,
                color: mixHexColor(inactiveColor, activeColor, op),
            }}>
                {w.text}
            </span>
        )
    }

    const lineStyle: React.CSSProperties = {
        display: 'block',
        whiteSpace: 'nowrap',
    }

    const badgeOpacity = Math.min(Math.max((revealProgress - 0.72) / 0.10, 0), 1)
    const badgeY = (1 - badgeOpacity) * 20

    const scrollCueOpacity = revealProgress <= 0
        ? 1
        : Math.max(1 - (revealProgress / 0.12), 0)

    return (
        <div style={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
            padding: '0 20px',
            width: '100%',
        }}>
            <style>{`
                @keyframes stmtChevron {
                    0%, 100% { opacity: 0.3; transform: rotate(45deg) translateY(0px) }
                    50% { opacity: 1; transform: rotate(45deg) translateY(3px) }
                }
            `}</style>

            {/* Scroll Cue Indicator */}
            <div style={{
                position: 'absolute',
                bottom: 'clamp(32px, 5vh, 48px)',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                opacity: scrollCueOpacity,
                pointerEvents: 'none',
                zIndex: 10,
                padding: '8px 14px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(0,0,0,0.22)',
            }}>
                <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.3em',
                    color: 'rgba(228,228,231,0.88)',
                    textTransform: 'uppercase',
                }}>
                    scrolleá
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {[0, 1].map(i => (
                        <div key={i} style={{
                            width: '12px',
                            height: '12px',
                            borderRight: '1.5px solid rgba(228,228,231,0.75)',
                            borderBottom: '1.5px solid rgba(228,228,231,0.75)',
                            transform: 'rotate(45deg)',
                            animation: `stmtChevron 1.4s ease-in-out ${i * 0.15}s infinite`,
                        }} />
                    ))}
                </div>
            </div>

            <h2 className="text-[clamp(28px,6vw,108px)] md:text-[clamp(40px,7.5vw,108px)]"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    fontWeight: 900,
                    lineHeight: 1.15,
                    maxWidth: '95vw',
                    margin: '0 auto',
                }}>

                {/* Línea 1 */}
                <span style={lineStyle}>
                    {words.slice(0, 7).map((w, i) => renderWord(w, i))}
                </span>

                {/* Separador */}
                <span style={{ display: 'block', height: 'clamp(10px, 1.8vh, 24px)' }} />

                {/* Línea 2 */}
                <span style={lineStyle}>
                    {words.slice(7, 10).map((w, i) => renderWord(w, i + 7))}
                </span>

                {/* Separador */}
                <span style={{ display: 'block', height: 'clamp(10px, 1.8vh, 24px)' }} />

                {/* Línea 3 */}
                <span style={lineStyle}>
                    {words.slice(10).map((w, i) => renderWord(w, i + 10))}
                </span>

            </h2>

            {/* Identidad DevelOP */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                marginTop: 'clamp(32px, 5vh, 56px)',
                opacity: badgeOpacity,
                transform: `translateY(${badgeY}px)`,
                transition: 'none',
            }}>
                <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <Image
                        src="/logodevelOP.svg"
                        alt="DevelOP Logo"
                        fill
                        style={{
                            objectFit: 'contain',
                            padding: '10px',
                            filter: 'none',
                        }}
                    />
                </div>

                <p style={{
                    fontSize: '10px',
                    letterSpacing: '0.26em',
                    color: 'rgba(255,255,255,0.28)',
                    textTransform: 'uppercase',
                    margin: 0,
                }}>
                    DEVELOP · TUCUMÁN
                </p>

            </div>
        </div>
    )
}

