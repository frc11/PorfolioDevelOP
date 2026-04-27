'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Target, Zap, BarChart2 } from 'lucide-react'

interface GraphNode {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  phase: number
  pulseSpeed: number
}

interface StatCard {
  value: string
  label: string
  icon: 'target' | 'zap' | 'chart'
  colorRgb: string
}

const STAT_ICONS: Record<StatCard['icon'], React.ReactNode> = {
  target: <Target size={14} strokeWidth={1.6} />,
  zap: <Zap size={14} strokeWidth={1.6} />,
  chart: <BarChart2 size={14} strokeWidth={1.6} />,
}

const statCards: StatCard[] = [
  { value: '-80%', label: 'errores operativos', icon: 'target', colorRgb: '99,102,241' },
  { value: '1', label: 'sola pantalla', icon: 'zap', colorRgb: '123,47,255' },
  { value: '24/7', label: 'crece con vos', icon: 'chart', colorRgb: '139,92,246' },
]

function HeroStatsGrid() {
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false)
  const [centerActive, setCenterActive] = useState<boolean[]>(() => statCards.map(() => false))

  useEffect(() => {
    const updateViewportMode = () => {
      const widthMatch = window.matchMedia('(max-width: 1024px)').matches
      const coarseMatch = window.matchMedia('(hover: none), (pointer: coarse)').matches
      setIsMobileOrTablet(widthMatch || coarseMatch)
    }

    updateViewportMode()
    window.addEventListener('resize', updateViewportMode)
    return () => window.removeEventListener('resize', updateViewportMode)
  }, [])

  useEffect(() => {
    if (!isMobileOrTablet) return

    const observer = new IntersectionObserver(
      (entries) => {
        setCenterActive((prev) => {
          const next = [...prev]
          let changed = false

          for (const entry of entries) {
            const target = entry.target as HTMLElement
            const index = Number(target.dataset.statIndex)
            if (Number.isNaN(index)) continue

            if (next[index] !== entry.isIntersecting) {
              next[index] = entry.isIntersecting
              changed = true
            }
          }

          return changed ? next : prev
        })
      },
      {
        root: null,
        rootMargin: '-45% 0px -45% 0px',
        threshold: [0, 0.01, 0.5, 1],
      },
    )

    for (const element of cardRefs.current) {
      if (element) observer.observe(element)
    }

    return () => observer.disconnect()
  }, [isMobileOrTablet])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
      className="hero-stats-grid"
      style={{
        marginTop: 'clamp(18px,2.8vh,26px)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '10px',
        width: '100%',
        maxWidth: '760px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      {statCards.map((card, index) => (
        <div
          key={card.label}
          ref={(element) => {
            cardRefs.current[index] = element
          }}
          data-stat-index={index}
          className={`hero-stat-card${centerActive[index] ? ' is-active' : ''}`}
          style={{
            borderRadius: '14px',
            border: `1px solid rgba(${card.colorRgb},0.3)`,
            background: 'rgba(10, 8, 24, 0.62)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '12px 14px',
            boxShadow: '0 10px 24px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.06)',
            minWidth: 0,
            textAlign: 'left',
            transform: 'scale(1)',
            filter: 'brightness(1)',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: `rgb(${card.colorRgb})`, display: 'inline-flex', alignItems: 'center' }}>
              {STAT_ICONS[card.icon]}
            </span>
            <span style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1, color: `rgb(${card.colorRgb})`, fontFamily: 'monospace' }}>
              {card.value}
            </span>
          </div>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: '11px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.46)',
              lineHeight: 1.3,
            }}
          >
            {card.label}
          </p>
        </div>
      ))}
    </motion.div>
  )
}

export default function HeroSoftware() {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)
  const isReduced = useReducedMotion()

  useEffect(() => {
    const canvas = bgCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const nodeCount = 28
    let frame = 0
    let rafId = 0
    let width = Math.max(canvas.offsetWidth, 1)
    let height = Math.max(canvas.offsetHeight, 1)

    const nodes: GraphNode[] = Array.from({ length: nodeCount }, () => {
      const speedX = 0.3 + Math.random() * 0.4
      const speedY = 0.3 + Math.random() * 0.4

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: speedX * (Math.random() < 0.5 ? -1 : 1),
        vy: speedY * (Math.random() < 0.5 ? -1 : 1),
        radius: 3 + Math.random() * 4,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
      }
    })

    const resizeCanvas = () => {
      const dpr = Math.max(window.devicePixelRatio || 1, 1)
      width = Math.max(canvas.offsetWidth, 1)
      height = Math.max(canvas.offsetHeight, 1)

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)

      for (const node of nodes) {
        node.x = Math.min(Math.max(node.x, node.radius), width - node.radius)
        node.y = Math.min(Math.max(node.y, node.radius), height - node.radius)
      }
    }

    const render = () => {
      frame += 1

      for (const node of nodes) {
        node.x += node.vx
        node.y += node.vy

        if (node.x <= node.radius || node.x >= width - node.radius) {
          node.vx *= -1
          node.x = Math.min(Math.max(node.x, node.radius), width - node.radius)
        }

        if (node.y <= node.radius || node.y >= height - node.radius) {
          node.vy *= -1
          node.y = Math.min(Math.max(node.y, node.radius), height - node.radius)
        }
      }

      ctx.clearRect(0, 0, width, height)

      ctx.fillStyle = '#0c0920'
      ctx.fillRect(0, 0, width, height)

      const glowGradient = ctx.createRadialGradient(
        width * 0.42,
        height * 0.5,
        10,
        width * 0.42,
        height * 0.5,
        width * 0.55,
      )
      glowGradient.addColorStop(0, 'rgba(88, 28, 220, 0.18)')
      glowGradient.addColorStop(1, 'rgba(12, 9, 32, 0)')
      ctx.fillStyle = glowGradient
      ctx.fillRect(0, 0, width, height)

      const connectionMaxDistance = width * 0.22
      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const first = nodes[i]
          const second = nodes[j]
          const dx = second.x - first.x
          const dy = second.y - first.y
          const distance = Math.hypot(dx, dy)

          if (distance < connectionMaxDistance) {
            const alpha = (1 - distance / connectionMaxDistance) * 0.55
            ctx.beginPath()
            ctx.moveTo(first.x, first.y)
            ctx.lineTo(second.x, second.y)
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      for (const node of nodes) {
        const pulse = (Math.sin(frame * node.pulseSpeed + node.phase) + 1) / 2
        const radius = node.radius * (0.85 + pulse * 0.3)
        const glowRadius = node.radius * (2 + pulse)

        ctx.beginPath()
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(139, 92, 246, ${0.07 + pulse * 0.1})`
        ctx.fill()

        ctx.beginPath()
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(167, 139, 250, ${0.45 + pulse * 0.45})`
        ctx.fill()
      }

      rafId = requestAnimationFrame(render)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <section
      className="hero-software-section"
      style={{
        position: 'relative',
        width: '100%',
        height: '100svh',
        background: 'radial-gradient(ellipse at 40% 50%, #1a0533 0%, #0c0920 55%, #07051a 100%)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: 'clamp(64px,8.5vh,88px) clamp(20px,5vw,80px) clamp(28px,4vh,44px)',
        boxSizing: 'border-box',
      }}
    >
      <canvas
        id="bg-sw"
        ref={bgCanvasRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <div className="hero-software-inner" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="hero-main-stack" style={{ textAlign: 'center', maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hero-kicker"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(99,102,241,0.35)',
              borderRadius: '100px',
              padding: '6px 18px',
              marginBottom: '24px',
              background: 'rgba(99,102,241,0.07)',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#6366f1',
                boxShadow: '0 0 8px rgba(99,102,241,0.9)',
                animation: 'pulseIA 1.8s ease-in-out infinite',
              }}
            />
            <span style={{ fontSize: '11px', letterSpacing: '0.25em', color: '#6366f1', fontWeight: 600 }}>
              TU EMPRESA, ORDENADA Y EN CONTROL
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="hero-title-wrap"
            style={{ position: 'relative', display: 'inline-block', marginBottom: 'clamp(14px,2.2vh,22px)' }}
          >
            <h1
              style={{
                fontSize: 'clamp(38px,6.4vw,88px)',
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: '-0.03em',
                margin: 0,
                color: 'white',
              }}
            >
              Terminá con el caos
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 40%, #7b2fff 70%, #6366f1 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: isReduced ? 'none' : 'gradientShift 4s ease-in-out infinite',
                }}
              >
                de los 5 Excels.
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hero-description"
            style={{
              fontSize: 'clamp(15px,1.8vw,19px)',
              color: 'rgba(255,255,255,0.42)',
              lineHeight: 1.65,
              maxWidth: '600px',
              margin: '0 auto clamp(22px,3.5vh,34px)',
            }}
          >
            Centralizamos toda la operación de tu empresa en una sola pantalla.
            Stock, ventas, clientes y finanzas, en tiempo real.
            <br />
            <span style={{ color: 'rgba(99,102,241,0.8)' }}>
              Sin depender de Excel. Sin depender de nadie.
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="hero-cta-row"
            style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <motion.a
              href="#diagnostico"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              style={{
                position: 'relative',
                overflow: 'hidden',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white',
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.04em',
                padding: '13px 28px',
                borderRadius: '12px',
                textDecoration: 'none',
                boxShadow: '0 0 32px rgba(99,102,241,0.3), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              <motion.span
                aria-hidden="true"
                animate={{ x: ['-140%', '260%'] }}
                transition={{ duration: 1.1, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4 }}
                style={{
                  position: 'absolute',
                  top: '-30%',
                  bottom: '-30%',
                  left: '-45%',
                  width: '42%',
                  transform: 'rotate(18deg)',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  pointerEvents: 'none',
                }}
              />
              Diagnosticar mi empresa {'→'}
            </motion.a>

            <motion.a
              href="#pipeline"
              whileHover={{
                scale: 1.02,
                backgroundColor: 'rgba(255,255,255,0.07)',
                borderColor: 'rgba(99,102,241,0.3)',
                color: '#a5b4fc',
              }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.5)',
                fontWeight: 500,
                fontSize: '13px',
                padding: '13px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                transition: 'all 200ms',
              }}
            >
              Ver cómo funciona
            </motion.a>
          </motion.div>

          <HeroStatsGrid />
        </div>
      </div>

      <style>{`
        @keyframes pulseIA {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 10px rgba(99,102,241,0.8); }
          50% { opacity: 0.5; transform: scale(0.9); box-shadow: 0 0 0 rgba(99,102,241,0); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .hero-stat-card {
          transition: none !important;
          will-change: transform, filter, box-shadow, border-color;
        }

        @media (hover: hover) and (pointer: fine) {
          .hero-stat-card:hover {
            transform: scale(1.035);
            filter: brightness(1.2);
            border-color: rgba(167,139,250,0.72) !important;
            box-shadow:
              0 0 28px rgba(123,47,255,0.35),
              0 14px 30px rgba(0,0,0,0.32),
              inset 0 1px 0 rgba(255,255,255,0.09) !important;
          }
        }

        .hero-stat-card.is-active {
          transform: scale(1.035);
          filter: brightness(1.2);
          border-color: rgba(167,139,250,0.72) !important;
          box-shadow:
            0 0 28px rgba(123,47,255,0.35),
            0 14px 30px rgba(0,0,0,0.32),
            inset 0 1px 0 rgba(255,255,255,0.09) !important;
        }

        @media (max-width: 900px) {
          .hero-stats-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 640px) {
          .hero-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (min-width: 361px) and (max-width: 430px) {
          .hero-stats-grid .hero-stat-card:nth-child(3) {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 360px) {
          .hero-software-section {
            padding: 52px 16px 36px !important;
          }

          .hero-main-stack {
            transform: translateY(-10px);
          }

          .hero-kicker {
            margin-bottom: 16px !important;
          }

          .hero-title-wrap {
            margin-bottom: 10px !important;
          }

          .hero-description {
            margin: 0 auto 16px !important;
            line-height: 1.52 !important;
          }

          .hero-cta-row {
            gap: 10px !important;
          }

          .hero-stats-grid {
            margin-top: 14px !important;
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }

          .hero-stats-grid .hero-stat-card {
            padding: 10px 12px !important;
          }
        }
      `}</style>
    </section>
  )
}
