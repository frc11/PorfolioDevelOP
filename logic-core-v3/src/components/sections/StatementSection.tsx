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
            const total = section.offsetHeight - windowH
            const scrolled = -rect.top

            const p = Math.min(Math.max(scrolled / total, 0), 1)
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
                height: '350vh',
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
                opacity: progress < 0.03
                    ? progress / 0.03
                    : progress > 0.96
                        ? 1 - ((progress - 0.96) / 0.04)
                        : 1,
            }}>
                <StatementContent progress={progress} />
            </div>
        </section>
    )
}

function StatementContent({ progress }: { progress: number }) {
    // Función helper: devuelve opacity 0→1
    // según el progreso actual y el rango de la palabra
    function getOpacity(start: number, end: number): number {
        if (progress <= start) return 0
        if (progress >= end) return 1
        return (progress - start) / (end - start)
    }

    function getBlur(start: number, end: number): string {
        if (progress <= start) return 'blur(12px)'
        if (progress >= end) return 'blur(0px)'
        const t = (progress - start) / (end - start)
        return `blur(${12 * (1 - t)}px)`
    }

    const words = [
        // Línea 1
        { text: 'El', s: 0.05, e: 0.11, color: 'white' },
        { text: 'diseño', s: 0.08, e: 0.14, color: 'white' },
        { text: 'no', s: 0.11, e: 0.17, color: 'white' },
        { text: 'es', s: 0.13, e: 0.19, color: 'white' },
        { text: 'cómo', s: 0.15, e: 0.21, color: 'white' },
        { text: 'se', s: 0.17, e: 0.23, color: 'white' },
        { text: 've.', s: 0.19, e: 0.26, color: 'white' },
        // Línea 2
        { text: 'Es', s: 0.40, e: 0.46, color: 'white' },
        { text: 'cómo', s: 0.42, e: 0.48, color: 'white' },
        { text: 'funciona.', s: 0.46, e: 0.56, color: 'cyan' },
        // Línea 3
        { text: 'Y', s: 0.66, e: 0.71, color: 'white' },
        { text: 'cómo', s: 0.68, e: 0.73, color: 'white' },
        { text: 'convierte.', s: 0.72, e: 0.85, color: 'gradient' },
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
            opacity: op,
            filter: bl,
            transform: `translateY(${ty}px)`,
            transition: 'none',
            willChange: 'opacity, filter, transform',
        }

        if (w.color === 'gradient') {
            return (
                <span key={i} style={{
                    ...base,
                    ...(w.text === 'convierte.' && op > 0.5 ? {
                        filter: `${bl} drop-shadow(0 0 ${op * 20}px rgba(0,229,255,${op * 0.4}))`
                    } : {})
                }}>
                    <span style={{
                        background: 'linear-gradient(135deg, #00e5ff 0%, #7b2fff 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        {w.text}
                    </span>
                </span>
            )
        }

        return (
            <span key={i} style={{
                ...base,
                color: w.color === 'cyan' ? '#00e5ff' : 'white',
                ...(w.text === 'funciona.' && op > 0.7 ? {
                    textShadow: `0 0 ${op * 40}px rgba(0,229,255,${op * 0.6})`
                } : {}),
            }}>
                {w.text}
            </span>
        )
    }

    const lineStyle: React.CSSProperties = {
        display: 'block',
        whiteSpace: 'nowrap',
    }

    // Detectar línea activa
    const activeLine =
        progress < 0.35 ? 1 :
            progress < 0.62 ? 2 : 3

    // Color según línea activa
    const glowColor = activeLine === 3
        ? 'rgba(123,47,255,0.09)'
        : 'rgba(0,229,255,0.07)'

    const badgeOpacity = Math.min(Math.max((progress - 0.85) / 0.10, 0), 1)
    const badgeY = (1 - badgeOpacity) * 20

    const scrollCueOpacity = Math.max(1 - (progress / 0.04), 0)

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
                gap: '8px',
                opacity: scrollCueOpacity,
                pointerEvents: 'none',
                zIndex: 10,
            }}>
                <span style={{
                    fontSize: '9px',
                    letterSpacing: '0.35em',
                    color: 'rgba(255,255,255,0.3)',
                    textTransform: 'uppercase',
                }}>
                    scrolleá
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {[0, 1].map(i => (
                        <div key={i} style={{
                            width: '10px',
                            height: '10px',
                            borderRight: '1px solid rgba(0,229,255,0.5)',
                            borderBottom: '1px solid rgba(0,229,255,0.5)',
                            transform: 'rotate(45deg)',
                            animation: `stmtChevron 1.4s ease-in-out ${i * 0.15}s infinite`,
                        }} />
                    ))}
                </div>
            </div>

            {/* Ambient Side Lines */}
            <div aria-hidden="true" style={{
                position: 'absolute',
                top: '15%',
                bottom: '15%',
                left: 'clamp(20px, 4vw, 60px)',
                width: '1px',
                background: 'linear-gradient(to bottom, transparent, rgba(0,229,255,0.15), transparent)',
                opacity: Math.min(progress * 5, 0.6),
                pointerEvents: 'none',
                zIndex: 0,
            }} />
            <div aria-hidden="true" style={{
                position: 'absolute',
                top: '15%',
                bottom: '15%',
                right: 'clamp(20px, 4vw, 60px)',
                width: '1px',
                background: 'linear-gradient(to bottom, transparent, rgba(0,229,255,0.15), transparent)',
                opacity: Math.min(progress * 5, 0.6),
                pointerEvents: 'none',
                zIndex: 0,
            }} />

            {/* Glow de fondo */}
            <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '800px', height: '400px',
                background: `radial-gradient(ellipse, 
                    ${glowColor} 0%, 
                    rgba(123,47,255,0.04) 40%, 
                    transparent 70%)`,
                filter: 'blur(100px)',
                pointerEvents: 'none',
                zIndex: 0,
                opacity: Math.min(progress * 4, 1),
                transition: 'background 800ms ease',
            }} />

            <h2 className="text-[clamp(28px,6vw,108px)] md:text-[clamp(40px,7.5vw,108px)] overflow-hidden"
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
                gap: '16px',
                marginTop: 'clamp(32px, 5vh, 56px)',
                opacity: badgeOpacity,
                transform: `translateY(${badgeY}px)`,
                transition: 'none',
            }}>

                {/* Línea decorativa que se dibuja */}
                <div style={{
                    width: `${badgeOpacity * 80}px`,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, #00e5ff, #7b2fff, transparent)',
                    transition: 'none',
                }} />

                {/* Badge DevelOP */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '100px',
                    padding: '8px 20px 8px 12px',
                }}>

                    {/* Logo/avatar: cuadrado con gradiente */}
                    <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #00e5ff 0%, #7b2fff 100%)',
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
                                padding: '4px',
                                filter: 'brightness(0)' // Hace que el logo sea negro puro sobre el gradiente
                            }}
                        />
                    </div>

                    {/* Texto */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: 'white',
                            letterSpacing: '0.05em',
                            lineHeight: 1,
                        }}>
                            DevelOP
                        </span>
                        <span style={{
                            fontSize: '9px',
                            color: 'rgba(255,255,255,0.35)',
                            letterSpacing: '0.2em',
                            lineHeight: 1,
                        }}>
                            TUCUMÁN · NOA
                        </span>
                    </div>

                </div>

                {/* Tagline debajo del badge */}
                <p style={{
                    fontSize: '11px',
                    letterSpacing: '0.25em',
                    color: 'rgba(255,255,255,0.2)',
                    textTransform: 'uppercase',
                    margin: 0,
                }}>
                    Agencia de desarrollo premium
                </p>

            </div>
        </div>
    )
}
