'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'motion/react'

// ─── DATA & TYPES ───────────────────────────────────────────────────────────

interface AppNode {
  id: string
  label: string
  emoji: string
  x: number // % of canvas
  y: number
  vx: number
  vy: number
  phase: number
  size: number
  color: string
  colorRgb: string
  glowIntensity: number
}

const APP_NODES_DATA: Omit<AppNode, 'vx' | 'vy' | 'glowIntensity'>[] = [
  { id: 'whatsapp', label: 'WhatsApp', emoji: '💬', x: 0.15, y: 0.35, phase: 0, size: 36, color: '#25d366', colorRgb: '37,211,102' },
  { id: 'gmail', label: 'Gmail', emoji: '📧', x: 0.82, y: 0.28, phase: 1.2, size: 34, color: '#ea4335', colorRgb: '234,67,53' },
  { id: 'sheets', label: 'Sheets', emoji: '📊', x: 0.20, y: 0.72, phase: 2.4, size: 32, color: '#34a853', colorRgb: '52,168,83' },
  { id: 'mercadopago', label: 'MercadoPago', emoji: '💳', x: 0.78, y: 0.70, phase: 3.6, size: 34, color: '#00b1ea', colorRgb: '0,177,234' },
  { id: 'meta', label: 'Meta Ads', emoji: '📣', x: 0.50, y: 0.18, phase: 0.8, size: 32, color: '#1877f2', colorRgb: '24,119,242' },
  { id: 'slack', label: 'Slack', emoji: '📨', x: 0.88, y: 0.52, phase: 2.0, size: 30, color: '#e01e5a', colorRgb: '224,30,90' },
  { id: 'notion', label: 'Notion', emoji: '📋', x: 0.12, y: 0.55, phase: 3.0, size: 30, color: '#ffffff', colorRgb: '255,255,255' },
  { id: 'afip', label: 'AFIP', emoji: '🧾', x: 0.50, y: 0.82, phase: 4.2, size: 32, color: '#f59e0b', colorRgb: '245,158,11' },
  // CENTRAL ORCHESTRATOR
  {
    id: 'n8n',
    label: 'n8n · Automatización',
    emoji: '⚡',
    x: 0.50, y: 0.50,
    phase: 0,
    size: 52,
    color: '#f59e0b',
    colorRgb: '245,158,11'
  }
]

// ─── CANVAS SUB-COMPONENT ──────────────────────────────────────────────────

function NodeCanvas({
  mouseRef,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const nodesRef = useRef<AppNode[]>(
    APP_NODES_DATA.map(n => ({ 
      ...n, 
      vx: 0, 
      vy: 0, 
      glowIntensity: n.id === 'n8n' ? 0.8 : 0 
    }))
  )
  const frameRef = useRef(0)
  const shouldReduceMotion = useReducedMotion()

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

    const CONNECTION_DIST = 0.38
    const MOUSE_ATTRACT_DIST = 0.25

    function draw() {
      if (!canvas || !ctx) return
      frameRef.current++
      const f = frameRef.current
      const W = canvas.width
      const H = canvas.height
      const mouse = mouseRef.current

      ctx.clearRect(0, 0, W, H)

      const nodes = nodesRef.current

      // ── MOVER NODOS ────────────────────────
      for (const n of nodes) {
        if (n.id === 'n8n') {
            // n8n is fixed at center but has subtle vibration
            const v = f * 0.001
            n.x = 0.5 + Math.sin(v) * 0.002
            n.y = 0.5 + Math.cos(v * 0.8) * 0.002
            continue
        }

        const t = f * 0.0008 + n.phase
        // Float orbital lento
        n.x += Math.sin(t) * 0.00015
        n.y += Math.cos(t * 0.7) * 0.0001

        // Clamp dentro del canvas
        n.x = Math.max(0.08, Math.min(0.92, n.x))
        n.y = Math.max(0.12, Math.min(0.88, n.y))

        // Atracción sutil hacia el mouse
        const mx = mouse.x / W
        const my = mouse.y / (H || 1)
        const dx = mx - n.x
        const dy = my - n.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < MOUSE_ATTRACT_DIST) {
          const force = ((MOUSE_ATTRACT_DIST - dist) / MOUSE_ATTRACT_DIST) * 0.00008
          n.x += dx * force
          n.y += dy * force
          n.glowIntensity = Math.min(n.glowIntensity + 0.05, 1)
        } else {
          n.glowIntensity = Math.max(n.glowIntensity - 0.02, 0)
        }
      }

      // ── CONEXIONES FORZADAS A n8n ───────────
      const n8nNode = nodes.find(n => n.id === 'n8n')!
      const cx1 = n8nNode.x * W
      const cy1 = n8nNode.y * H

      for (const app of nodes) {
        if (app.id === 'n8n') continue
        const cx2 = app.x * W
        const cy2 = app.y * H

        // Línea base tenue punteada
        ctx.beginPath()
        ctx.moveTo(cx1, cy1)
        ctx.lineTo(cx2, cy2)
        ctx.strokeStyle = 'rgba(245,158,11,0.06)'
        ctx.lineWidth = 1
        ctx.setLineDash([3, 8])
        ctx.stroke()
        ctx.setLineDash([])

        // Partícula viajando desde app -> n8n
        const particleSpeed = shouldReduceMotion ? 0.004 : 0.008
        const tP = ((f * particleSpeed + app.phase * 0.2) % 1)
        const px = cx2 + (cx1 - cx2) * tP
        const py = cy2 + (cy1 - cy2) * tP
        const pAlpha = Math.sin(tP * Math.PI) * 0.5

        const pg = ctx.createRadialGradient(px, py, 0, px, py, 4)
        pg.addColorStop(0, `rgba(245,158,11,${pAlpha})`)
        pg.addColorStop(1, 'rgba(245,158,11,0)')
        
        ctx.beginPath()
        ctx.arc(px, py, 4, 0, Math.PI * 2)
        ctx.fillStyle = pg
        ctx.fill()
      }

      // ── CONEXIONES DINÁMICAS (MOUSE) ────────
      const mx = mouse.x / W
      const my = mouse.y / (H || 1)

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          
          // Skip if both are not central and far from mouse? No, logic as prompt:
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          const midX = (a.x + b.x) / 2
          const midY = (a.y + b.y) / 2
          const mdx = mx - midX
          const mdy = my - midY
          const mouseDist = Math.sqrt(mdx * mdx + mdy * mdy)

          const shouldConnect = dist < CONNECTION_DIST && mouseDist < 0.3

          if (!shouldConnect) continue

          const proximity = 1 - mouseDist / 0.3
          const alpha = proximity * 0.7

          // Base line
          ctx.beginPath()
          ctx.moveTo(a.x * W, a.y * H)
          ctx.lineTo(b.x * W, b.y * H)
          ctx.strokeStyle = `rgba(245,158,11,${alpha * 0.3})`
          ctx.lineWidth = 1
          ctx.stroke()

          // Glow line
          const grad = ctx.createLinearGradient(a.x * W, a.y * H, b.x * W, b.y * H)
          grad.addColorStop(0, `rgba(245,158,11,${alpha})`)
          grad.addColorStop(0.5, `rgba(255,200,50,${alpha * 1.2})`)
          grad.addColorStop(1, `rgba(249,115,22,${alpha})`)

          ctx.beginPath()
          ctx.moveTo(a.x * W, a.y * H)
          ctx.lineTo(b.x * W, b.y * H)
          ctx.strokeStyle = grad
          ctx.lineWidth = 1.5
          ctx.stroke()

          // Particles along dynamic line
          if (!shouldReduceMotion && f % 4 === 0) {
            const tProgress = (f * 0.02) % 1
            const px = a.x * W + (b.x * W - a.x * W) * tProgress
            const py = a.y * H + (b.y * H - a.y * H) * tProgress
            const pg = ctx.createRadialGradient(px, py, 0, px, py, 6)
            pg.addColorStop(0, `rgba(255,220,100,${alpha})`)
            pg.addColorStop(1, 'rgba(245,158,11,0)')
            ctx.beginPath()
            ctx.arc(px, py, 6, 0, Math.PI * 2)
            ctx.fillStyle = pg
            ctx.fill()
          }
        }
      }

      // ── DIBUJAR NODOS ────────────────────────
      // Sort to draw n8n last (on top)
      const sortedNodes = [...nodes].sort((a,b) => a.id === 'n8n' ? 1 : b.id === 'n8n' ? -1 : 0)

      for (const n of sortedNodes) {
        const cx = n.x * W
        const cy = n.y * H
        const R = n.size
        const glow = n.glowIntensity

        if (n.id === 'n8n') {
            // Anillos pulsantes (3 anillos)
            for (let ring = 0; ring < 3; ring++) {
              const ringPhase = (f * 0.015 + ring * 0.33) % 1
              const ringR = R * (1 + ringPhase * 2.5)
              const ringAlpha = (1 - ringPhase) * 0.25

              ctx.beginPath()
              ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
              ctx.strokeStyle = `rgba(245,158,11,${ringAlpha})`
              ctx.lineWidth = 1.5
              ctx.stroke()
            }

            // Glow grande permanente
            const bigGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 5)
            bigGlow.addColorStop(0, 'rgba(245,158,11,0.25)')
            bigGlow.addColorStop(0.4, 'rgba(249,115,22,0.08)')
            bigGlow.addColorStop(1, 'rgba(245,158,11,0)')
            ctx.beginPath()
            ctx.arc(cx, cy, R * 5, 0, Math.PI * 2)
            ctx.fillStyle = bigGlow
            ctx.fill()

            // Borde doble y nucleo
            ctx.beginPath()
            ctx.arc(cx, cy, R, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(245,158,11,0.12)'
            ctx.fill()
            ctx.strokeStyle = 'rgba(245,158,11,0.8)'
            ctx.lineWidth = 2
            ctx.stroke()

            ctx.beginPath()
            ctx.arc(cx, cy, R + 6, 0, Math.PI * 2)
            ctx.strokeStyle = 'rgba(245,158,11,0.25)'
            ctx.lineWidth = 1
            ctx.stroke()

            // Emoji n8n
            ctx.font = `${R * 0.65}px serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = 'white'
            ctx.fillText(n.emoji, cx, cy)

            // Label n8n
            ctx.font = '700 11px ui-monospace, monospace'
            ctx.fillStyle = 'rgba(245,158,11,0.8)'
            ctx.fillText(n.label, cx, cy + R + 18)
            
            continue
        }

        // --- NODO NORMAL ---
        // Outer Glow
        const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 3.5)
        outerGlow.addColorStop(0, `rgba(245,158,11,${0.15 * glow})`)
        outerGlow.addColorStop(1, 'rgba(245,158,11,0)')
        ctx.beginPath()
        ctx.arc(cx, cy, R * 3.5, 0, Math.PI * 2)
        ctx.fillStyle = outerGlow
        ctx.fill()

        // Plate
        ctx.beginPath()
        ctx.arc(cx, cy, R, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${0.06 + glow * 0.06})`
        ctx.fill()

        // Border
        ctx.beginPath()
        ctx.arc(cx, cy, R, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(245,158,11,${0.3 + glow * 0.5})`
        ctx.lineWidth = glow > 0.3 ? 2 : 1
        ctx.stroke()

        // Emoji
        ctx.font = `${R * 0.9}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = 'white'
        ctx.fillText(n.emoji, cx, cy)

        // Label
        ctx.font = `600 11px ui-monospace, monospace`
        ctx.textAlign = 'center'
        ctx.fillStyle = `rgba(245,158,11,${0.4 + glow * 0.5})`
        ctx.fillText(n.label, cx, cy + R + 14)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [shouldReduceMotion])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  )
}

function FloatingStat({ 
  label, 
  value, 
  pos, 
  delay 
}: { 
  label: string; 
  value: string; 
  pos: React.CSSProperties; 
  delay: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'absolute',
        ...pos,
        zIndex: 5,
        pointerEvents: 'none',
      }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.5 }}
        style={{
          background: 'rgba(7, 7, 9, 0.55)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '16px',
          padding: '14px 22px',
          boxShadow: '0 0 0 1px rgba(245,158,11,0.08), 0 16px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(245,158,11,0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.6) 50%, transparent)',
        }}/>
        <p style={{ fontSize: '9px', color: 'rgba(245, 158, 11, 0.65)', fontWeight: 700, letterSpacing: '0.18em', margin: '0 0 5px', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace' }}>
          {label}
        </p>
        <p style={{ fontSize: '18px', color: 'white', fontWeight: 900, margin: 0, letterSpacing: '-0.01em' }}>
          {value}
        </p>
      </motion.div>
    </motion.div>
  )
}

// ─── MAIN HERO COMPONENT ────────────────────────────────────────────────────

export default function HeroAutomation() {
  const mouseRef = useRef({ x: 0, y: 0 })
  const [showHint, setShowHint] = useState(false)
  const [mouseMoved, setMouseMoved] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) return
    const t = setTimeout(() => setShowHint(true), 2000)
    return () => clearTimeout(t)
  }, [shouldReduceMotion])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      if (!mouseMoved) {
        setMouseMoved(true)
        setShowHint(false)
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [mouseMoved])

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: '#070709',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
      }}
    >
      <style>{`
        @keyframes moveHand {
          0%, 100% { transform: translateX(0) }
          50% { transform: translateX(6px) }
        }
        @keyframes amberShift {
          0%, 100% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(245,158,11,0.9), 0 0 16px rgba(245,158,11,0.4) }
          50% { opacity: 0.75; box-shadow: 0 0 16px rgba(245,158,11,1), 0 0 32px rgba(245,158,11,0.6) }
        }
        @keyframes chevronAmber {
          0%, 100% { opacity: 0.25; transform: rotate(45deg) }
          50% { opacity: 0.7; transform: rotate(45deg) translateY(2px) }
        }
        @keyframes ringPulseAmber {
          0%, 100% { transform: scale(1); opacity: 0.15 }
          50% { transform: scale(1.08); opacity: 0.05 }
        }
      `}</style>

      {/* Background Auroras */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        {/* Aurora ámbar central */}
        <div style={{
          position: 'absolute',
          top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px', height: '500px',
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, rgba(249,115,22,0.04) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }} />

        {/* Aurora naranja izquierda */}
        <div style={{
          position: 'absolute',
          top: '20%', left: '-10%',
          width: '500px', height: '600px',
          background: 'radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 60%)',
          filter: 'blur(100px)',
        }} />

        {/* Aurora ámbar derecha */}
        <div style={{
          position: 'absolute',
          top: '40%', right: '-10%',
          width: '500px', height: '500px',
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 60%)',
          filter: 'blur(90px)',
        }} />
      </div>

      <NodeCanvas mouseRef={mouseRef} />

      {/* Vignette */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 20%, rgba(7,7,9,0.5) 60%, rgba(7,7,9,0.92) 100%)`,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Content Slot */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: '860px',
          padding: '0 clamp(20px, 5vw, 60px)',
          pointerEvents: 'none',
        }}
      >
        {/* BadgeAuto */}
        <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.2 }}
           style={{
             display: 'inline-flex',
             alignItems: 'center',
             gap: '8px',
             border: '1px solid rgba(245,158,11,0.3)',
             borderRadius: '100px',
             padding: '7px 20px',
             marginBottom: '32px',
             background: 'rgba(245,158,11,0.07)',
             boxShadow: '0 0 20px rgba(245,158,11,0.08)',
             pointerEvents: 'none',
           }}
        >
          <div style={{
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: '#f59e0b',
            boxShadow: '0 0 8px rgba(245,158,11,0.9)',
            animation: 'pulse 1.8s ease-in-out infinite',
            flexShrink: 0,
          }}/>
          <span style={{
            fontSize: '11px',
            letterSpacing: '0.22em',
            color: '#f59e0b',
            fontWeight: 700,
            fontFamily: 'ui-monospace, monospace',
          }}>
            TU EMPRESA, EN PILOTO AUTOMÁTICO
          </span>
        </motion.div>

        {/* TitleAuto */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'clamp(42px, 7.5vw, 104px)',
            fontWeight: 900,
            lineHeight: 0.97,
            letterSpacing: '-0.04em',
            margin: '0 0 clamp(18px, 2.5vh, 28px)',
            pointerEvents: 'none',
          }}
        >
          <span style={{ color: 'white' }}>
            Eliminá el trabajo
          </span>
          <br/>
          <span style={{
            background: shouldReduceMotion
                ? 'none'
                : 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 35%, #f97316 65%, #f59e0b 100%)',
            backgroundSize: '300% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: shouldReduceMotion ? '#f59e0b' : 'transparent',
            backgroundClip: 'text',
            animation: shouldReduceMotion ? 'none' : 'amberShift 5s ease-in-out infinite',
            display: 'inline-block',
            color: shouldReduceMotion ? '#f59e0b' : 'inherit',
          }}>
            robótico para siempre.
          </span>
        </motion.h1>

        {/* SubtitleAuto */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'clamp(15px, 1.8vw, 19px)',
            color: 'rgba(255,255,255,0.74)',
            lineHeight: 1.7,
            maxWidth: '560px',
            margin: '0 auto clamp(28px, 4vh, 44px)',
            background: 'linear-gradient(180deg, rgba(7,7,9,0.74) 0%, rgba(7,7,9,0.58) 100%)',
            border: '1px solid rgba(245,158,11,0.12)',
            borderRadius: '16px',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            boxShadow: '0 18px 48px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.04)',
            padding: 'clamp(14px, 1.8vw, 20px) clamp(16px, 2.2vw, 24px)',
            textShadow: '0 1px 10px rgba(0,0,0,0.45)',
            pointerEvents: 'none',
          }}
        >
          Hacemos que WhatsApp, MercadoPago, AFIP y Excel se hablen solos.
          <br/>
          Tu equipo deja de copiar y pegar datos 
          <span style={{ color: 'rgba(245,158,11,0.95)' }}>
            y empieza a generar valor real.
          </span>
        </motion.p>

        {/* CTAAuto */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            pointerEvents: 'auto',
          }}
        >
          <motion.a
            href="#calculadora"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              color: '#070709',
              fontWeight: 800,
              fontSize: '14px',
              letterSpacing: '0.05em',
              padding: '14px 32px',
              borderRadius: '100px',
              textDecoration: 'none',
              boxShadow: `0 0 40px rgba(245,158,11,0.4), 0 8px 24px rgba(0,0,0,0.4)`,
            }}
          >
            ENCENDER MI EMPRESA →
          </motion.a>

          <motion.a
            href="#flujo"
            whileHover={{
              scale: 1.02,
              borderColor: 'rgba(245,158,11,0.5)',
              color: '#f59e0b',
            }}
            whileTap={{ scale: 0.97 }}
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

        {/* Corporate Marquee */}
        <div style={{
          marginTop: 'clamp(40px, 6vh, 64px)',
          position: 'relative',
          width: '100vw',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          overflow: 'hidden',
          padding: '18px 0',
          background: 'rgba(245,158,11,0.025)',
          borderTop: '1px solid rgba(245,158,11,0.12)',
          borderBottom: '1px solid rgba(245,158,11,0.06)',
          maskImage: 'linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)',
        }}>
          <motion.div
            style={{
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              width: 'max-content',
            }}
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 45,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {[
              { color:'#25d366', label:'WHATSAPP API' },
              { color:'#1877f2', label:'META ADS' },
              { color:'#00b1ea', label:'MERCADO PAGO' },
              { color:'#ffe600', label:'MERCADO LIBRE' },
              { color:'#f59e0b', label:'AFIP' },
              { color:'#34a853', label:'GOOGLE SHEETS' },
              { color:'#ea4335', label:'GMAIL' },
              { color:'#4285f4', label:'GOOGLE CALENDAR' },
              { color:'#7b2fff', label:'TIENDANUBE' },
              { color:'#e8e8e8', label:'NOTION' },
              { color:'#e01e5a', label:'SLACK' },
              { color:'#1798c1', label:'SALESFORCE' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '0 clamp(20px, 3vw, 40px)',
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '1px', background: item.color, flexShrink: 0 }} />
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.3)',
                  fontFamily: 'ui-monospace, monospace',
                  letterSpacing: '0.15em',
                }}>
                  {item.label}
                </span>
              </div>
            ))}
            {/* Duplicado para loop infinito */}
            {[
              { color:'#25d366', label:'WHATSAPP API' },
              { color:'#1877f2', label:'META ADS' },
              { color:'#00b1ea', label:'MERCADO PAGO' },
              { color:'#ffe600', label:'MERCADO LIBRE' },
              { color:'#f59e0b', label:'AFIP' },
              { color:'#34a853', label:'GOOGLE SHEETS' },
              { color:'#ea4335', label:'GMAIL' },
              { color:'#4285f4', label:'GOOGLE CALENDAR' },
              { color:'#7b2fff', label:'TIENDANUBE' },
              { color:'#e8e8e8', label:'NOTION' },
              { color:'#e01e5a', label:'SLACK' },
              { color:'#1798c1', label:'SALESFORCE' },
            ].map((item, i) => (
              <div
                key={`dup-${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '0 clamp(20px, 3vw, 40px)',
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '1px', background: item.color, flexShrink: 0 }} />
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.3)',
                  fontFamily: 'ui-monospace, monospace',
                  letterSpacing: '0.15em',
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        <p style={{
          fontSize: '11px',
          color: 'rgba(245,158,11,0.5)',
          fontWeight: 900,
          letterSpacing: '0.25em',
          textAlign: 'center',
          marginTop: '16px',
          pointerEvents: 'none',
          textTransform: 'uppercase',
        }}>
          CONECTAMOS LO QUE YA USÁS
        </p>
      </div>

      {/* Floating Stats */}
      {!shouldReduceMotion && (
        <>
          <FloatingStat 
            label="0% trabajo manual" 
            value="Garantizado" 
            pos={{ top: '22%', left: '12%' }} 
            delay={1.4}
          />
          <FloatingStat 
            label="24/7" 
            value="Operando solo" 
            pos={{ top: '65%', right: '10%' }} 
            delay={1.6}
          />
          <FloatingStat 
            label="<10%" 
            value="del costo de un sueldo" 
            pos={{ bottom: '20%', left: '15%' }} 
            delay={1.8}
          />
        </>
      )}

      {/* Mouse Interaction Hint */}
      <AnimatePresence>
        {showHint && !mouseMoved && !shouldReduceMotion && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              bottom: 'clamp(60px, 10vh, 90px)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: '100px',
              padding: '8px 18px',
              pointerEvents: 'none',
            }}
          >
            <svg
              width="12" height="18" viewBox="0 0 12 18" fill="none"
              style={{ animation: 'moveHand 1.2s ease-in-out infinite', flexShrink: 0 }}
            >
              <rect x="1" y="1" width="10" height="16" rx="5" stroke="rgba(245,158,11,0.7)" strokeWidth="1.4"/>
              <line x1="6" y1="4" x2="6" y2="7" stroke="rgba(245,158,11,0.7)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: '12px', color: 'rgba(245,158,11,0.7)', letterSpacing: '0.1em' }}>
              Mové el mouse para ver la magia
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
