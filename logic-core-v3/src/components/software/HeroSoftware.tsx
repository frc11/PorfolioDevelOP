'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface AuroraBlob {
  x: number      // 0-1 relativo al canvas
  y: number
  rx: number     // radio x
  ry: number     // radio y
  rotation: number
  speed: number
  phase: number
  color1: string
  color2: string
  alpha: number
}

interface FloatCard {
  value: string
  label: string
  icon: string
  colorRgb: string
  position: React.CSSProperties
  floatDelay: number
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const tickerItems = [
  { label: 'Empresas sin Excel', value: '47+' },
  { label: 'Horas ahorradas al mes', value: '23.400' },
  { label: 'Sistemas en producción', value: '12+' },
  { label: 'Procesos automatizados', value: '847' },
  { label: 'Errores operativos eliminados', value: '99.9%' },
  { label: 'Datos en tiempo real', value: '100%' },
  { label: 'Usuarios activos', value: '340+' },
  { label: 'Años en el mercado NOA', value: '4+' },
]

const floatCards: FloatCard[] = [
  {
    value: '−80%',
    label: 'errores operativos',
    icon: '🎯',
    colorRgb: '99,102,241',
    position: { top: '20%', left: '-190px' },
    floatDelay: 0,
  },
  {
    value: '1',
    label: 'sola pantalla',
    icon: '⚡',
    colorRgb: '123,47,255',
    position: { top: '20%', right: '-190px' },
    floatDelay: 1.2,
  },
  {
    value: '∞',
    label: 'crece con vos',
    icon: '📊',
    colorRgb: '139,92,246',
    position: {
      bottom: '10%',
      left: '50%',
      transform: 'translateX(-50%) translateY(80px)',
    },
    floatDelay: 2.1,
  },
]

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function AuroraCanvas({
  mouseRef,
}: {
  mouseRef: React.MutableRefObject<{x:number,y:number}>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const blobs: AuroraBlob[] = [
      {
        x:0.2, y:0.3,
        rx:0.45, ry:0.35,
        rotation: -20,
        speed:0.0004, phase:0,
        color1:'rgba(99,102,241,0.35)',
        color2:'rgba(99,102,241,0)',
        alpha:1,
      },
      {
        x:0.75, y:0.25,
        rx:0.4, ry:0.3,
        rotation: 15,
        speed:0.0003, phase:1.2,
        color1:'rgba(123,47,255,0.3)',
        color2:'rgba(123,47,255,0)',
        alpha:1,
      },
      {
        x:0.5, y:0.65,
        rx:0.55, ry:0.25,
        rotation: 5,
        speed:0.0005, phase:2.4,
        color1:'rgba(139,92,246,0.2)',
        color2:'rgba(139,92,246,0)',
        alpha:1,
      },
      {
        x:0.1, y:0.7,
        rx:0.3, ry:0.4,
        rotation: -35,
        speed:0.0004, phase:3.6,
        color1:'rgba(79,70,229,0.25)',
        color2:'rgba(79,70,229,0)',
        alpha:1,
      },
      {
        x:0.85, y:0.7,
        rx:0.35, ry:0.3,
        rotation: 25,
        speed:0.0003, phase:4.8,
        color1:'rgba(167,139,250,0.18)',
        color2:'rgba(167,139,250,0)',
        alpha:1,
      },
    ]

    let frame = 0

    function draw() {
      if (!canvas || !ctx) return
      frame++
      ctx.clearRect(0,0,canvas.width,canvas.height)

      const mouse = mouseRef.current
      const W = canvas.width
      const H = canvas.height

      for (const blob of blobs) {
        const t = frame * blob.speed + blob.phase
        const baseX = blob.x + Math.sin(t) * 0.08
        const baseY = blob.y + Math.cos(t * 0.7) * 0.06

        const mx = (mouse.x - 0.5) * 0.06
        const my = (mouse.y - 0.5) * 0.04
        const cx = (baseX + mx) * W
        const cy = (baseY + my) * H

        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate((blob.rotation * Math.PI) / 180)

        const grad = ctx.createRadialGradient(
          0, 0, 0,
          0, 0, blob.rx * W
        )
        grad.addColorStop(0, blob.color1)
        grad.addColorStop(1, blob.color2)

        ctx.scale(1, blob.ry / blob.rx)
        ctx.beginPath()
        ctx.arc(0, 0, blob.rx * W, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
        ctx.restore()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [mouseRef])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        filter: 'blur(80px)',
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}

function GridOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(
          circle,
          rgba(99,102,241,0.12) 1px,
          transparent 1px
        )`,
        backgroundSize: '48px 48px',
        zIndex: 1,
        pointerEvents: 'none',
        maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%)',
      }}
    />
  )
}

function Vignette() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(
          ellipse at center,
          transparent 25%,
          rgba(6,6,15,0.5) 60%,
          rgba(6,6,15,0.92) 100%
        )`,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  )
}

function CapsuleVideo({
  videoRef,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>
}) {
  const isReduced = useReducedMotion()
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div style={{
      position: 'relative',
      marginTop: 'clamp(32px,5vh,60px)',
      maxWidth: '860px',
      margin: 'clamp(32px,5vh,60px) auto 0',
    }}>
      {/* MÉTRICAS FLOTANTES (Desktop) */}
      {isDesktop && floatCards.map((card, i) => (
        <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 1.0 + i * 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              position: 'absolute',
              ...card.position,
              zIndex: 20,
              background: 'rgba(6,6,15,0.88)',
              border: `1px solid rgba(${card.colorRgb},0.28)`,
              borderRadius: '16px',
              padding: '14px 18px',
              width: '168px',
              backdropFilter: 'blur(16px)',
              boxShadow: `
                0 8px 32px rgba(0,0,0,0.6),
                0 0 0 1px rgba(${card.colorRgb},0.08),
                inset 0 1px 0 rgba(255,255,255,0.07)
              `,
              animation: isReduced ? 'none' : `${card.position.bottom ? 'floatCardCenter' : 'floatCard'} 3.5s ${card.floatDelay}s ease-in-out infinite alternate`,
            }}
        >
          {/* Acento superior */}
          <div style={{ height: '2px', background: `linear-gradient(90deg, rgba(${card.colorRgb},1), transparent)`, borderRadius: '100px', marginBottom: '10px' }}/>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <span style={{ fontSize: '16px' }}>{card.icon}</span>
            <span style={{ fontSize: '22px', fontWeight: 900, color: `rgb(${card.colorRgb})`, fontFamily: 'monospace', lineHeight: 1 }}>{card.value}</span>
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.32)', margin: 0, lineHeight: 1.4 }}>{card.label}</p>

          {/* Conector */}
          <div style={{
            position: 'absolute',
            top: '50%',
            ...(card.position.left && !card.position.right ? { right: '-32px' } : card.position.right ? { left: '-32px' } : { display: 'none' }),
            width: '32px',
            height: '1px',
            background: `linear-gradient(${card.position.right ? '270deg' : '90deg'}, transparent, rgba(${card.colorRgb},0.35))`,
            transform: 'translateY(-50%)',
          }}/>
        </motion.div>
      ))}

      {/* Glow detrás de la cápsula */}
      <div style={{
        position: 'absolute',
        inset: '-30px',
        borderRadius: '40px',
        background: `radial-gradient(ellipse at 50% 60%,
          rgba(99,102,241,0.25) 0%,
          rgba(123,47,255,0.12) 40%,
          transparent 70%)`,
        filter: 'blur(40px)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      {/* La cápsula */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        borderRadius: '24px',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.15),
          inset 0 -1px 0 rgba(0,0,0,0.3),
          inset 1px 0 0 rgba(255,255,255,0.08),
          inset -1px 0 0 rgba(255,255,255,0.04),
          0 0 0 1px rgba(99,102,241,0.15),
          0 40px 80px rgba(0,0,0,0.7),
          0 0 100px rgba(99,102,241,0.1)
        `,
        backdropFilter: 'blur(12px)',
      }}>

        {/* Reflejos */}
        <div style={{
          position: 'absolute',
          top: 0, left: '8%', right: '8%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.5) 70%, transparent)',
          zIndex: 10,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '35%', height: '40%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)',
          zIndex: 10,
          pointerEvents: 'none',
          borderRadius: '24px 0 0 0',
        }} />

        {/* Barra de título macOS */}
        <div style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255,255,255,0.025)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
          zIndex: 5,
        }}>
          {['#ff5f57','#febc2e','#28c840'].map((c,i)=>(
            <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c, opacity: 0.85 }}/>
          ))}

          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '6px',
            padding: '5px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            maxWidth: '380px',
            margin: '0 auto',
          }}>
            <div style={{
              width: '7px', height: '7px',
              borderRadius: '50%',
              background: '#6366f1',
              boxShadow: '0 0 8px rgba(99,102,241,0.9)',
              animation: 'pulseIA 2s ease-in-out infinite',
              flexShrink: 0,
            }}/>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
              panel.tuempresa.ar · En línea
            </span>
          </div>

          <span style={{
            fontSize: '10px', fontWeight: 600,
            letterSpacing: '0.1em',
            color: 'rgba(99,102,241,0.8)',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '100px',
            padding: '3px 10px',
            flexShrink: 0,
          }}>
            LIVE
          </span>
        </div>

        {/* VIDEO */}
        <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000', overflow: 'hidden' }}>
          <video
            ref={videoRef}
            src="/videos/software-development-hero-intro.mp4"
            loop
            muted
            playsInline
            autoPlay
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 55%, rgba(6,6,15,0.5) 100%)', pointerEvents: 'none' }}/>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)`,
            pointerEvents: 'none',
            zIndex: 2,
          }}/>
        </div>

        {/* Footer de la cápsula */}
        <div style={{
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)', fontFamily: 'monospace' }}>
            uptime: 99.98% · último deploy: hace 2h
          </span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', animation: 'pulseIA 1.8s ease-in-out infinite' }}/>
            <span style={{ fontSize: '11px', color: 'rgba(99,102,241,0.6)' }}>Sistema operativo</span>
          </div>
        </div>

      </div>

      {/* MÉTRICAS (Móvil/Tablet Grid) */}
      {!isDesktop && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '32px', position: 'relative', zIndex: 10 }}>
          {floatCards.map((card, i) => (
            <div
                key={i}
                style={{
                  background: 'rgba(6,6,15,0.6)',
                  border: `1px solid rgba(${card.colorRgb},0.15)`,
                  borderRadius: '12px',
                  padding: '12px',
                  textAlign: 'center',
                }}
            >
              <div style={{ fontSize: '18px', fontWeight: 900, color: `rgb(${card.colorRgb})`, fontFamily: 'monospace', marginBottom: '2px' }}>{card.value}</div>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TickerSection() {
  const isReduced = useReducedMotion()
  const allItems = [...tickerItems, ...tickerItems]

  return (
    <div style={{
      position: 'relative',
      marginTop: '40px',
      overflow: 'hidden',
      width: '100%',
      maskImage: 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
    }}>
      <div style={{
        display: 'flex',
        gap: '0',
        animation: isReduced ? 'none' : 'ticker 40s linear infinite',
        width: 'max-content',
      }}>
        {allItems.map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0 32px',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#6366f1', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>{item.value}</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>{item.label}</span>
            <span style={{ fontSize: '16px', color: 'rgba(99,102,241,0.3)', marginLeft: '8px' }}>·</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export default function HeroSoftware() {
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const videoRef = useRef<HTMLVideoElement>(null)
  const isReduced = useReducedMotion()

  useEffect(() => {
    function onMove(e: MouseEvent) {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.play().catch(() => {})
    }
  }, [])

  return (
    <section style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      background: '#06060f',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: 'clamp(100px,14vh,160px) clamp(20px,5vw,80px) clamp(80px,10vh,120px)',
    }}>
      <AuroraCanvas mouseRef={mouseRef} />
      <GridOverlay />
      <Vignette />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* ── TextBlock ── */}
        <div style={{
          textAlign: 'center',
          maxWidth: '820px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
        }}>
          {/* BadgeSoftware */}
          <motion.div
            initial={{ opacity:0, y:-10 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.6, delay:0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(99,102,241,0.35)',
              borderRadius: '100px',
              padding: '6px 18px',
              marginBottom: '28px',
              background: 'rgba(99,102,241,0.07)',
              pointerEvents: 'none',
            }}
          >
            <div style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: '#6366f1',
              boxShadow: '0 0 8px rgba(99,102,241,0.9)',
              animation: 'pulseIA 1.8s ease-in-out infinite',
            }}/>
            <span style={{
              fontSize: '11px',
              letterSpacing: '0.25em',
              color: '#6366f1',
              fontWeight: 600,
            }}>
              TU EMPRESA, ORDENADA Y EN CONTROL
            </span>
          </motion.div>

          {/* TitleSoftware con efecto Escaneo */}
          <motion.div
            initial={{ opacity:0, y:24 }}
            animate={{ opacity:1, y:0 }}
            transition={{
              duration:0.9, delay:0.35,
              ease:[0.16,1,0.3,1]
            }}
            style={{
              position: 'relative',
              display: 'inline-block',
              marginBottom: 'clamp(16px,2.5vh,24px)',
            }}
          >
            <h1 style={{
              fontSize: 'clamp(40px,7vw,96px)',
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
              margin: 0,
              color: 'white',
            }}>
              Terminá con el caos
              <br/>
              <span style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 40%, #7b2fff 70%, #6366f1 100%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: isReduced ? 'none' : 'gradientShift 4s ease-in-out infinite',
              }}>
                de los 5 Excels.
              </span>
            </h1>

          </motion.div>

          {/* SubtitleSoftware */}
          <motion.p
            initial={{ opacity:0, y:16 }}
            animate={{ opacity:1, y:0 }}
            transition={{
              duration:0.8, delay:0.6,
              ease:[0.16,1,0.3,1]
            }}
            style={{
              fontSize: 'clamp(15px,1.8vw,19px)',
              color: 'rgba(255,255,255,0.42)',
              lineHeight: 1.7,
              maxWidth: '560px',
              margin: '0 auto clamp(28px,4vh,44px)',
            }}
          >
            Centralizamos toda la operación de tu empresa en una sola pantalla.
            Stock, ventas, clientes y finanzas, en tiempo real.
            <br/>
            <span style={{ color:'rgba(99,102,241,0.8)' }}>
              Sin depender de Excel. Sin depender de nadie.
            </span>
          </motion.p>

          {/* CTASoftware */}
          <motion.div
            initial={{ opacity:0, y:16 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.7, delay:0.8 }}
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <motion.a
              href="#diagnostico"
              whileHover={{ scale:1.04 }}
              whileTap={{ scale:0.97 }}
              transition={{ type:'spring', stiffness:400, damping:15 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white',
                fontWeight: 800,
                fontSize: '14px',
                letterSpacing: '0.05em',
                padding: '14px 32px',
                borderRadius: '100px',
                textDecoration: 'none',
                boxShadow: '0 0 40px rgba(99,102,241,0.35), 0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              Diagnosticar mi empresa →
            </motion.a>

            <motion.a
              href="#pipeline"
              whileHover={{
                scale:1.02,
                borderColor:'rgba(99,102,241,0.5)',
                color:'#6366f1',
              }}
              whileTap={{ scale:0.97 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.55)',
                fontWeight: 600,
                fontSize: '14px',
                padding: '14px 28px',
                borderRadius: '100px',
                textDecoration: 'none',
                transition: 'all 200ms',
              }}
            >
              Ver cómo funciona
            </motion.a>
          </motion.div>
        </div>

        <CapsuleVideo videoRef={videoRef} />
        <TickerSection />

        {/* Línea separadora inferior */}
        <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.4, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4) 20%, rgba(123,47,255,0.5) 50%, rgba(99,102,241,0.4) 80%, transparent)',
              transformOrigin: 'center',
              marginTop: '48px',
            }}
        />
      </div>

      {/* Scroll Cue */}
      <motion.div
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        transition={{ delay:1.6, duration:0.8 }}
        style={{
          position: 'absolute',
          bottom: 'clamp(24px,4vh,40px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <span style={{
          fontSize: '9px',
          letterSpacing: '0.35em',
          color: 'rgba(99,102,241,0.4)',
          textTransform: 'uppercase',
        }}>
          explorar
        </span>
        {[0,1].map(i => (
          <div key={i} style={{
            width: '8px', height: '8px',
            borderRight: '1px solid rgba(99,102,241,0.5)',
            borderBottom: '1px solid rgba(99,102,241,0.5)',
            transform: 'rotate(45deg)',
            animation: isReduced ? 'none' : `chevronSoft 1.4s ease-in-out ${i * 0.18}s infinite`,
          }}/>
        ))}
      </motion.div>

      <style>{`
        @keyframes pulseIA {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 10px rgba(99,102,241,0.8); }
          50% { opacity: 0.5; transform: scale(0.9); box-shadow: 0 0 0px rgba(99,102,241,0); }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes floatCard {
          0% { transform: translateY(0); }
          100% { transform: translateY(-10px); }
        }
        @keyframes floatCardCenter {
          0% { transform: translateX(-50%) translateY(80px); }
          100% { transform: translateX(-50%) translateY(70px); }
        }
        @keyframes gradientShift {
          0%,100% { background-position: 0% 50% }
          50%     { background-position: 100% 50% }
        }
        @keyframes chevronSoft {
          0%,100% { opacity:0.3; transform:rotate(45deg) translateY(0) }
          50%     { opacity:1; transform:rotate(45deg) translateY(4px) }
        }
      `}</style>
    </section>
  )
}
