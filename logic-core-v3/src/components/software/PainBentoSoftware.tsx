'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useReducedMotion, AnimatePresence, useInView } from 'motion/react'
import {
  BarChart2, Zap, Smartphone, Target, FolderOpen,
  RefreshCw, XCircle, CheckCircle2, Clock, TrendingUp,
  Plug, Link2,
} from 'lucide-react'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface BentoPair {
  id: number
  size: 'large' | 'medium' | 'small'
  delay: number
  caos: {
    title: string
    description: string
    detail: string
    color: string
    colorRgb: string
  }
  orden: {
    title: string
    description: string
    detail: string
    color: string
    colorRgb: string
  }
}

// ─── ICON MAPS ───────────────────────────────────────────────────────────────

const CAOS_ICONS: Record<number, React.ReactNode> = {
  0: <BarChart2 size={18} strokeWidth={1.5} />,
  1: <Smartphone size={18} strokeWidth={1.5} />,
  2: <FolderOpen size={18} strokeWidth={1.5} />,
  3: <XCircle size={18} strokeWidth={1.5} />,
  4: <Clock size={18} strokeWidth={1.5} />,
  5: <Plug size={18} strokeWidth={1.5} />,
}

const ORDEN_ICONS: Record<number, React.ReactNode> = {
  0: <Zap size={18} strokeWidth={1.5} />,
  1: <Target size={18} strokeWidth={1.5} />,
  2: <RefreshCw size={18} strokeWidth={1.5} />,
  3: <CheckCircle2 size={18} strokeWidth={1.5} />,
  4: <TrendingUp size={18} strokeWidth={1.5} />,
  5: <Link2 size={18} strokeWidth={1.5} />,
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const bentoPairs: BentoPair[] = [
  {
    id: 0,
    size: 'large',
    delay: 0.25,
    caos: {
      title: 'Excel eterno',
      description: 'Planillas que se rompen, fórmulas que nadie entiende, versiones desactualizadas.',
      detail: '3-4 hs/día perdidas · Cliente: Distribuidora Andina',
      color: '#ef4444',
      colorRgb: '239,68,68',
    },
    orden: {
      title: 'Dashboard en tiempo real',
      description: 'Todos los datos de tu empresa en una pantalla. Actualizados al segundo. Sin fórmulas, sin errores.',
      detail: '< 2 segundos para ver cualquier dato',
      color: '#6366f1',
      colorRgb: '99,102,241',
    },
  },
  {
    id: 1,
    size: 'medium',
    delay: 0.32,
    caos: {
      title: 'WhatsApp como CRM',
      description: 'Pedidos perdidos entre mensajes. Sin historial. Sin seguimiento.',
      detail: '~40% pedidos sin respuesta · Cliente: Ferretería del Norte',
      color: '#ef4444',
      colorRgb: '239,68,68',
    },
    orden: {
      title: 'CRM integrado',
      description: 'Cada cliente, cada pedido, cada interacción — registrada y visible para todo el equipo.',
      detail: '100% de seguimiento automático',
      color: '#7b2fff',
      colorRgb: '123,47,255',
    },
  },
  {
    id: 2,
    size: 'medium',
    delay: 0.38,
    caos: {
      title: 'Procesos en papel',
      description: 'Formularios físicos, firmas manuales, archivos que nadie encuentra.',
      detail: '22 min/proceso manual · Cliente: Clínica Vélez',
      color: '#ef4444',
      colorRgb: '239,68,68',
    },
    orden: {
      title: 'Flujos digitales',
      description: 'Aprobaciones, formularios y documentos digitales. Trazables y auditables.',
      detail: '< 30 segundos por proceso',
      color: '#6366f1',
      colorRgb: '99,102,241',
    },
  },
  {
    id: 3,
    size: 'small',
    delay: 0.29,
    caos: {
      title: 'Error humano',
      description: 'El mismo dato cargado en 3 lugares distintos. Inconsistencias constantes.',
      detail: '1 de cada 5 ops con error · Cliente: Importadora NOA',
      color: '#ef4444',
      colorRgb: '239,68,68',
    },
    orden: {
      title: 'Fuente única de verdad',
      description: 'Un dato, un lugar. Sincronizado en tiempo real en toda la empresa.',
      detail: 'Cero inconsistencias de datos',
      color: '#7b2fff',
      colorRgb: '123,47,255',
    },
  },
  {
    id: 4,
    size: 'medium',
    delay: 0.44,
    caos: {
      title: 'Reportes manuales',
      description: 'El lunes a las 9AM alguien arma el reporte del fin de semana.',
      detail: '4-6 hs semanales en reportes · Cliente: Grupo TAFÍ',
      color: '#ef4444',
      colorRgb: '239,68,68',
    },
    orden: {
      title: 'Reportes automáticos',
      description: 'Los reportes se generan solos. Llegás el lunes y ya están en tu email.',
      detail: '0 horas en reportes manuales',
      color: '#6366f1',
      colorRgb: '99,102,241',
    },
  },
  {
    id: 5,
    size: 'medium',
    delay: 0.50,
    caos: {
      title: 'Sistemas desconectados',
      description: 'Ventas no habla con stock. Stock no habla con logística.',
      detail: '3 sistemas desconectados · Cliente: Agro del Norte',
      color: '#ef4444',
      colorRgb: '239,68,68',
    },
    orden: {
      title: 'Ecosistema integrado',
      description: 'Todos los sistemas conectados. Un cambio se propaga a todos.',
      detail: 'Integración total en 4 semanas',
      color: '#7b2fff',
      colorRgb: '123,47,255',
    },
  },
]

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function BentoFlipCard({
  pair,
  gridStyle,
  isInView,
  onFirstFlip,
  onFlipChange,
}: {
  pair: BentoPair
  gridStyle: React.CSSProperties
  isInView: boolean
  onFirstFlip: () => void
  onFlipChange: (flipped: boolean) => void
}) {
  const { caos, orden } = pair
  const violetRgb = '123,47,255'
  const [mounted, setMounted] = useState(false)
  const isReduced = useReducedMotion()
  const [flipped, setFlipped] = useState(false)
  const [everHovered, setEverHovered] = useState(false)
  const [hasBeenFlippedOnce, setHasBeenFlippedOnce] = useState(false)
  const [hoverStarted, setHoverStarted] = useState(false)
  const [loss, setLoss] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const effectiveIsReduced = mounted ? (isReduced ?? false) : false
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (pair.id !== 0) return
    if (!hoverStarted || flipped || effectiveIsReduced) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setLoss(prev => prev + 50)
    }, 100)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [hoverStarted, flipped, pair.id, effectiveIsReduced])

  const triggerFlip = useCallback((state: boolean) => {
    if (effectiveIsReduced) return
    setFlipped(state)
    onFlipChange(state)
    if (state && !hasBeenFlippedOnce) {
      setHasBeenFlippedOnce(true)
      onFirstFlip()
    }
    if (state) setEverHovered(true)
  }, [isReduced, hasBeenFlippedOnce, onFirstFlip, onFlipChange])

  const handleMouseEnter = () => {
    triggerFlip(true)
    setHoverStarted(true)
  }

  const handleMouseLeave = () => {
    triggerFlip(false)
    setHoverStarted(false)
    setLoss(0)
  }

  const handleToggle = () => {
    const newState = !flipped
    triggerFlip(newState)
    setHoverStarted(newState)
  }

  return (
    <motion.div
      style={{ ...gridStyle, perspective: '1200px', position: 'relative' }}
      initial={effectiveIsReduced ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 28, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.65,
        delay: isReduced ? 0 : pair.delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleToggle}
        style={{
          position: 'absolute',
          inset: '-4px',
          zIndex: 30,
          cursor: 'none',
        }}
      />

      <motion.div
        animate={{ rotateY: effectiveIsReduced ? 0 : (flipped ? 180 : 0) }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight:
            pair.id === 0 || pair.id === 5
              ? '252px'
              : pair.size === 'large'
                ? '220px'
                : pair.size === 'small'
                  ? '100%'
                  : '180px',
          transformStyle: 'preserve-3d',
          pointerEvents: 'none',
        }}
      >
        {/* CARA FRENTE — CAOS */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          borderRadius: '20px', overflow: 'hidden',
          background: `linear-gradient(135deg, rgba(${caos.colorRgb},0.06) 0%, rgba(255,255,255,0.02) 100%)`,
          border: `1px solid rgba(${caos.colorRgb},0.15)`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.4)',
          padding: 'clamp(18px,2.5vw,28px)',
          display: effectiveIsReduced && flipped ? 'none' : 'block',
        }}>
          {/* Noise Effect */}
          <div style={{
            position: 'absolute', inset: 0,
            opacity: 0.025, filter: 'url(#noise)',
            background: caos.color, pointerEvents: 'none',
            zIndex: 0, borderRadius: '20px',
          }}/>

          <div style={{ position: 'absolute', bottom: '-8px', right: '12px', fontSize: '88px', fontWeight: 900, lineHeight: 1, color: `rgba(${caos.colorRgb},0.04)`, userSelect: 'none', pointerEvents: 'none' }}>
            {String(pair.id + 1).padStart(2,'0')}
          </div>

          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, rgba(${caos.colorRgb},0.6) 40%, rgba(${caos.colorRgb},0.6) 60%, transparent)` }}/>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: `rgba(${caos.colorRgb},0.1)`,
                border: `1px solid rgba(${caos.colorRgb},0.2)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: `rgb(${caos.colorRgb})`,
              }}>
                {CAOS_ICONS[pair.id]}
              </div>
              <span style={{ fontSize: '9px', letterSpacing: '0.2em', color: `rgba(${caos.colorRgb},0.6)`, fontWeight: 700, border: `1px solid rgba(${caos.colorRgb},0.2)`, borderRadius: '100px', padding: '3px 8px' }}>HOY</span>
            </div>

            <h3 style={{ fontSize: pair.size === 'large' ? 'clamp(20px,2.5vw,28px)' : '18px', fontWeight: 900, color: 'white', margin: '0 0 8px' }}>{caos.title}</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: '0 0 16px', maxWidth: pair.size === 'large' ? '440px' : '100%' }}>{caos.description}</p>

            {pair.id === 0 && hoverStarted && !flipped && !effectiveIsReduced && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ marginBottom: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '100px' }}>
                <p style={{ fontSize: '10px', color: 'rgba(239,68,68,0.6)', margin: '0 0 4px', letterSpacing: '0.1em' }}>PERDIDO EN INEFICIENCIA HOY</p>
                <p style={{ fontSize: '28px', fontWeight: 900, color: '#ef4444', margin: 0, fontFamily: 'monospace' }}>${loss.toLocaleString('es-AR')}</p>
              </motion.div>
            )}

            <div style={{ display: 'inline-block', maxWidth: '100%', marginTop: 'auto', background: `rgba(${caos.colorRgb},0.08)`, border: `1px solid rgba(${caos.colorRgb},0.2)`, borderRadius: '8px', padding: '6px 12px' }}>
              <span style={{ display: 'block', fontSize: '11px', color: `rgba(${caos.colorRgb},0.9)`, fontWeight: 600, lineHeight: 1.4, whiteSpace: 'normal', wordBreak: 'break-word' }}>{caos.detail}</span>
            </div>
          </div>

          <AnimatePresence>
            {!everHovered && !effectiveIsReduced && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  right: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '9px',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.18)',
                  pointerEvents: 'none',
                  zIndex: 10,
                  fontWeight: 600,
                }}
              >
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  →
                </motion.span>
                HOVER
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CARA REVERSO — ORDEN */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: effectiveIsReduced ? 'none' : 'rotateY(180deg)',
          borderRadius: '20px', overflow: 'hidden',
          background: `linear-gradient(135deg, rgba(${violetRgb},0.1) 0%, rgba(255,255,255,0.03) 100%)`,
          border: `1px solid rgba(${violetRgb},0.25)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 0 40px rgba(${violetRgb},0.1), 0 8px 32px rgba(0,0,0,0.5)`,
          padding: 'clamp(18px,2.5vw,28px)',
          display: effectiveIsReduced && !flipped ? 'none' : 'block',
          zIndex: effectiveIsReduced && flipped ? 5 : undefined,
        }}>
          <div style={{ position: 'absolute', bottom: '-8px', right: '12px', fontSize: '88px', fontWeight: 900, lineHeight: 1, color: `rgba(${violetRgb},0.06)`, userSelect: 'none', pointerEvents: 'none' }}>
            {String(pair.id + 1).padStart(2,'0')}
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, rgba(${violetRgb},0.8) 40%, rgba(${violetRgb},0.8) 60%, transparent)` }}/>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', background: `linear-gradient(to bottom, rgba(${violetRgb},0.08), transparent)`, pointerEvents: 'none' }}/>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: `rgba(${violetRgb},0.15)`,
                border: `1px solid rgba(${violetRgb},0.3)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: `rgb(${violetRgb})`,
                boxShadow: `0 0 16px rgba(${violetRgb},0.2)`,
              }}>
                {ORDEN_ICONS[pair.id]}
              </div>
              <span style={{ fontSize: '9px', letterSpacing: '0.2em', color: `rgba(${violetRgb},0.8)`, fontWeight: 700, border: `1px solid rgba(${violetRgb},0.3)`, borderRadius: '100px', padding: '3px 8px', background: `rgba(${violetRgb},0.08)` }}>CON DEVELOP</span>
            </div>
            <h3 style={{ fontSize: pair.size === 'large' ? 'clamp(20px,2.5vw,28px)' : '18px', fontWeight: 900, color: 'white', margin: '0 0 8px' }}>{orden.title}</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 0 16px', maxWidth: pair.size === 'large' ? '440px' : '100%' }}>{orden.description}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', maxWidth: '100%', marginTop: 'auto', background: `rgba(${violetRgb},0.1)`, border: `1px solid rgba(${violetRgb},0.3)`, borderRadius: '8px', padding: '6px 12px' }}>
              <CheckCircle2 size={14} strokeWidth={2} style={{ color:'#4ade80', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: `rgba(${violetRgb},1)`, fontWeight: 700, whiteSpace: 'normal', wordBreak: 'break-word' }}>{orden.detail}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function PainBentoSoftware() {
  const [mounted, setMounted] = useState(false)
  const isReduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 })
  const [flipCount, setFlipCount] = useState(0)
  const [anyFlipped, setAnyFlipped] = useState(false)
  const flippedCountRef = useRef(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const effectiveIsReduced = mounted ? (isReduced ?? false) : false

  const handleFirstFlip = useCallback(() => {
    setFlipCount(prev => prev + 1)
  }, [])

  const handleFlipChange = useCallback((flipped: boolean) => {
    flippedCountRef.current += flipped ? 1 : -1
    setAnyFlipped(flippedCountRef.current > 0)
  }, [])

  return (
    <section ref={sectionRef} style={{ padding: 'clamp(80px,12vh,140px) clamp(20px,5vw,80px)', background: '#080810', position: 'relative', overflow: 'hidden' }}>

      {/* ATMÓSFERA — GLOWS */}
      <motion.div
        aria-hidden="true"
        animate={{
          background: anyFlipped
            ? 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 60%)'
            : 'radial-gradient(ellipse, rgba(239,68,68,0.04) 0%, transparent 60%)',
        }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '15%', left: '-8%', width: '500px', height: '400px', filter: 'blur(90px)', pointerEvents: 'none', zIndex: 0 }}
      />
      <div
        aria-hidden="true"
        style={{ position: 'absolute', top: '15%', right: '-8%', width: '600px', height: '500px', background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }}
      />
      <div
        aria-hidden="true"
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '300px', background: 'radial-gradient(ellipse, rgba(123,47,255,0.03) 0%, transparent 65%)', filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0 }}
      />

      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
      </svg>

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div initial={effectiveIsReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }} style={{ marginBottom: 'clamp(40px,6vh,60px)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '100px', padding: '4px 14px', marginBottom: '20px', background: 'rgba(239,68,68,0.05)' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#ef4444', fontWeight: 700 }}>[ DEL CAOS AL ORDEN ALGORÍTMICO ]</span>
          </div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: '0 0 16px' }}>Conocemos tu empresa<br/>porque vivimos en ella.</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', maxWidth: '500px', margin: 0 }}>Cada card es una conversación real con dueños de negocios del NOA. Pasá el mouse para ver cómo lo resolvemos.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px]">
          <BentoFlipCard pair={bentoPairs[0]} gridStyle={{ gridColumn: 'span 2' }} isInView={isInView} onFirstFlip={handleFirstFlip} onFlipChange={handleFlipChange} />
          <BentoFlipCard pair={bentoPairs[3]} gridStyle={{ gridRow: 'span 2' }} isInView={isInView} onFirstFlip={handleFirstFlip} onFlipChange={handleFlipChange} />
          <BentoFlipCard pair={bentoPairs[1]} gridStyle={{}} isInView={isInView} onFirstFlip={handleFirstFlip} onFlipChange={handleFlipChange} />
          <BentoFlipCard pair={bentoPairs[2]} gridStyle={{}} isInView={isInView} onFirstFlip={handleFirstFlip} onFlipChange={handleFlipChange} />
          <BentoFlipCard pair={bentoPairs[4]} gridStyle={{}} isInView={isInView} onFirstFlip={handleFirstFlip} onFlipChange={handleFlipChange} />
          <BentoFlipCard pair={bentoPairs[5]} gridStyle={{ gridColumn: 'span 2' }} isInView={isInView} onFirstFlip={handleFirstFlip} onFlipChange={handleFlipChange} />
        </div>

        <AnimatePresence>
          {flipCount >= 3 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '32px', textAlign: 'center', padding: '16px 24px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '14px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
              ¿Te identificás?{' '}<a href="#diagnostico" style={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none' }}>Diagnosticá tu empresa →</a>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ scaleX: 0 }} animate={isInView ? { scaleX: 1 } : {}} transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }} style={{ height: '1px', background: 'linear-gradient(90deg, rgba(239,68,68,0.2), transparent 30%, rgba(99,102,241,0.4) 50%, transparent 70%, rgba(123,47,255,0.2))', transformOrigin: 'left center', marginTop: 'clamp(40px,6vh,64px)' }}/>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .grid { grid-template-columns: 1fr !important; }
          .grid > div { grid-column: span 1 !important; grid-row: span 1 !important; }
        }
      `}</style>
    </section>
  )
}
