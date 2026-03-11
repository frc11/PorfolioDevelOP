'use client'
import React, { useEffect, useRef, useState } from "react"

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

        const base: React.CSSProperties = {
            display: 'inline-block',
            marginRight: '0.22em',
            opacity: op,
            filter: bl,
            transition: 'none',
        }

        if (w.color === 'gradient') {
            return (
                <span key={i} style={base}>
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
                ...(w.color === 'cyan' && op > 0.5 ? {
                    textShadow: '0 0 30px rgba(0,229,255,0.5)'
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

    return (
        <div style={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
            padding: '0 20px',
            width: '100%',
        }}>
            {/* Glow de fondo */}
            <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '800px', height: '400px',
                background: 'radial-gradient(ellipse, rgba(0,229,255,0.07) 0%, rgba(123,47,255,0.04) 40%, transparent 70%)',
                filter: 'blur(100px)',
                pointerEvents: 'none',
                zIndex: 0,
                opacity: Math.min(progress * 3, 1),
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

            {/* Línea decorativa */}
            <div style={{
                width: `${Math.min(Math.max((progress - 0.83) / 0.1, 0), 1) * 120}px`,
                height: '1px',
                background: 'linear-gradient(90deg, #00e5ff, #7b2fff)',
                margin: 'clamp(24px, 4vh, 40px) auto 0',
                transition: 'none',
            }} />

            {/* Firma */}
            <p style={{
                fontSize: '13px',
                letterSpacing: '0.2em',
                color: 'rgba(255,255,255,0.2)',
                fontStyle: 'italic',
                marginTop: 'clamp(12px, 2vh, 20px)',
                opacity: Math.min(Math.max((progress - 0.88) / 0.08, 0), 1),
            }}>
                — DevelOP, Tucumán
            </p>
        </div>
    )
}
