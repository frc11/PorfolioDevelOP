'use client'

import React, { useEffect, useRef, CSSProperties } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

// --- TYPES ---

interface FloatingMetric {
  id: number
  value: string
  label: string
  icon: string
  color: string
  colorRgb: string
  position: Partial<CSSProperties>
  floatDelay: number
}

// --- DATA ---

const metrics: FloatingMetric[] = [
  {
    id: 0,
    value: '< 200ms',
    label: 'Respuesta promedio',
    icon: '⚡',
    color: '#00ff88',
    colorRgb: '0,255,136',
    position: {
      top: '15%',
      left: '-180px',
    },
    floatDelay: 0,
  },
  {
    id: 1,
    value: '99.9%',
    label: 'Uptime garantizado',
    icon: '🛡️',
    color: '#0fbf73',
    colorRgb: '15,191,115',
    position: {
      top: '15%',
      right: '-180px',
    },
    floatDelay: 0.8,
  },
  {
    id: 2,
    value: '24 / 7',
    label: 'Sin interrupciones',
    icon: '🕐',
    color: '#34f5c5',
    colorRgb: '52,245,197',
    position: {
      bottom: '20%',
      left: '-180px',
    },
    floatDelay: 1.5,
  },
  {
    id: 3,
    value: '∞',
    label: 'Conversaciones simultáneas',
    icon: '💬',
    color: '#65d46e',
    colorRgb: '245,158,11',
    position: {
      bottom: '20%',
      right: '-180px',
    },
    floatDelay: 2.2,
  },
]

// --- COMPONENTS ---

function AtmosphereGlows() {
  return (
    <>
      <div aria-hidden="true" style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(0,255,136,0.07) 0%, rgba(15,191,115,0.04) 40%, transparent 70%)',
        filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', top: '30%', left: '-10%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(52,245,197,0.04) 0%, transparent 65%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', top: '30%', right: '-10%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(15,191,115,0.05) 0%, transparent 65%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0
      }} />
      {[25, 50, 75].map((top, i) => (
        <div key={i} style={{
          position: 'absolute', top: `${top}%`, left: 0, right: 0, height: '1px',
          background: 'rgba(255,255,255,0.02)', pointerEvents: 'none', zIndex: 0
        }} />
      ))}
    </>
  )
}

function FloatingMetrics({ isInView }: { isInView: boolean }) {
  const reduced = useReducedMotion()

  return (
    <div className="hidden lg:block">
      {metrics.map(metric => (
        <motion.div
          key={metric.id}
          initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6, delay: 0.8 + metric.id * 0.12, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            ...metric.position,
            animation: isInView && !reduced ? `floatMetric 3.5s ${metric.floatDelay}s ease-in-out infinite alternate` : 'none',
            zIndex: 20,
            background: 'rgba(8,8,16,0.85)',
            border: `1px solid rgba(${metric.colorRgb}, 0.25)`,
            borderRadius: '14px', padding: '14px 16px', width: '160px',
            backdropFilter: 'blur(12px)',
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(${metric.colorRgb},0.08), inset 0 1px 0 rgba(255,255,255,0.06)`,
          }}
        >
          <div style={{ height: '2px', background: `linear-gradient(90deg, ${metric.color}, transparent)`, borderRadius: '100px', marginBottom: '10px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '16px' }}>{metric.icon}</span>
            <span style={{ fontSize: '22px', fontWeight: 900, color: metric.color, lineHeight: 1, fontFamily: 'monospace' }}>{metric.value}</span>
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.4 }}>{metric.label}</p>
          <div style={{
            position: 'absolute', top: '50%',
            ...(metric.position.left ? { right: '-40px', left: 'auto' } : { left: '-40px', right: 'auto' }),
            width: '40px', height: '1px',
            background: `linear-gradient(${metric.position.left ? '90deg' : '270deg'}, transparent, rgba(${metric.colorRgb},0.3))`,
            transform: 'translateY(-50%)',
          }} />
        </motion.div>
      ))}
    </div>
  )
}

function MobileMetrics({ isInView }: { isInView: boolean }) {
  const reduced = useReducedMotion()

  return (
    <div className="lg:hidden mt-12 grid grid-cols-2 gap-4">
      {metrics.map(metric => (
        <motion.div
          key={metric.id}
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 + metric.id * 0.1 }}
          style={{
            background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(${metric.colorRgb}, 0.15)`,
            borderRadius: '16px', padding: '16px', backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '14px' }}>{metric.icon}</span>
            <span style={{ fontSize: '18px', fontWeight: 900, color: metric.color, fontFamily: 'monospace' }}>{metric.value}</span>
          </div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.3 }}>{metric.label}</p>
        </motion.div>
      ))}
    </div>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  const reduced = useReducedMotion()
  
  return (
    <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vh, 64px)' }}>
      <motion.div
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          border: '1px solid rgba(0, 255, 136, 0.3)', color: '#00ff88',
          padding: '6px 16px', borderRadius: '100px', fontSize: '11px',
          letterSpacing: '0.25em', fontWeight: 600, marginBottom: '24px',
          background: 'rgba(0, 255, 136, 0.06)',
        }}
      >
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88', animation: 'pulse 1.5s infinite' }} />
        [ EN PRODUCCIÓN · DEMO REAL ]
      </motion.div>
      <motion.h2
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontSize: 'clamp(30px, 4.5vw, 58px)', fontWeight: 900, color: 'white', margin: '0 0 16px', lineHeight: 1.1 }}
      >
        No es magia.<br />
        <span style={{
          color: '#34d399',
                                textShadow: '0 0 16px rgba(52,211,153,0.22)',
        }}>Es ingeniería aplicada.</span>
      </motion.h2>
      <motion.p
        initial={reduced ? { opacity: 1 } : { opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.4)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}
      >
        Así se ve un agente IA trabajando en tiempo real. Cada respuesta, cada acción, cada integración - visible y auditable.
      </motion.p>
    </div>
  )
}

function CapsuleFrame({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) {
  const [videoError, setVideoError] = React.useState(false)
  const reduced = useReducedMotion()

  return (
    <div style={{
      position: 'relative', borderRadius: '28px', overflow: 'hidden', background: 'rgba(0, 0, 0, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.5), inset 1px 0 0 rgba(255,255,255,0.08), inset -1px 0 0 rgba(255,255,255,0.04), 0 0 0 1px rgba(0,255,136,0.08), 0 40px 80px rgba(0,0,0,0.7), 0 0 120px rgba(0,255,136,0.06)`,
    }}>
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 70%, transparent)', zIndex: 10, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '40%', background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)', zIndex: 10, pointerEvents: 'none', borderRadius: '28px 0 0 0' }} />
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', position: 'relative', zIndex: 5 }}>
        {['#34a853', '#86efac', '#28c840'].map((c, i) => (
          <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c, opacity: 0.8 }} />
        ))}
        <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.06)', borderRadius: '6px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '360px', margin: '0 auto' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px rgba(0, 255, 136, 0.8)', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.3)', fontFamily: 'monospace' }}>agente.develop.ar · En producción</span>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(0, 255, 136, 0.6)', background: 'rgba(0, 255, 136, 0.08)', border: '1px solid rgba(0, 255, 136, 0.15)', borderRadius: '100px', padding: '3px 10px', flexShrink: 0 }}>LIVE</span>
      </div>
      <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000', overflow: 'hidden' }}>
        {videoError ? (
           <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', fontSize: '14px', letterSpacing: '0.1em' }}>[ VIDEO EN PRODUCCIÓN ]</div>
        ) : (
          <video
            ref={videoRef}
            src="/videos/ia-ingenieria-aplicada-demo.mp4"
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: reduced ? 'none' : 'block' }}
          />
        )}
        {reduced && !videoError && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', fontSize: '14px', letterSpacing: '0.1em' }}>[ VIDEO PAUSADO POR PREFERENCIA ]</div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(3,3,8,0.4) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '10px',
            bottom: '10px',
            width: '92px',
            height: '34px',
            borderRadius: '10px',
            pointerEvents: 'none',
            zIndex: 3,
            background:
              'linear-gradient(180deg, rgba(6,10,18,0.9) 0%, rgba(4,8,14,0.96) 100%), radial-gradient(circle at 40% 30%, rgba(16,185,129,0.1), transparent 65%)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.45)',
            backdropFilter: 'blur(3px)',
          }}
        />
      </div>
      <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.2)', fontFamily: 'monospace' }}>latencia: 187ms · uptime: 99.98%</span>
      </div>
    </div>
  )
}

function CapsuleBorderGlow() {
  return (
    <>
      <div style={{ position: 'absolute', inset: '-20px', borderRadius: '40px', zIndex: -1, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 100%, rgba(0,255,136,0.12) 0%, rgba(15,191,115,0.06) 40%, transparent 70%)', filter: 'blur(30px)' }} />
      <div style={{ position: 'absolute', inset: '-20px', borderRadius: '40px', zIndex: -1, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 60%)', filter: 'blur(20px)' }} />
    </>
  )
}

function BottomCopy({ isInView }: { isInView: boolean }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        marginTop: 'clamp(40px, 6vh, 72px)', display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'clamp(16px, 2vw, 28px)',
      }}
    >
      {[
        { icon: '🔍', title: 'Auditable', description: 'Cada decisión de la IA queda registrada. Ves exactamente qué respondió y por qué.' },
        { icon: '🔧', title: 'Personalizable', description: 'El agente aprende sobre tu negocio: precios, productos, políticas, tono de voz.' },
        { icon: '🔌', title: 'Integrable', description: 'Se conecta con lo que ya usás: WhatsApp, Gmail, tu CRM, Google Sheets.' },
      ].map((item, i) => (
        <motion.div
          key={i} initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          whileHover={
            reduced
              ? undefined
              : i === 0
                ? {
                    y: -5,
                    borderColor: 'rgba(52,211,153,0.35)',
                    boxShadow: '0 16px 34px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(52,211,153,0.2)',
                    background: 'rgba(16,185,129,0.08)',
                  }
                : i === 1
                  ? {
                      y: -5,
                      rotateX: 1.8,
                      borderColor: 'rgba(45,212,191,0.33)',
                      boxShadow: '0 16px 34px rgba(0,0,0,0.4), 0 0 24px rgba(45,212,191,0.14)',
                      background: 'rgba(20,184,166,0.08)',
                    }
                  : {
                      y: -5,
                      rotateY: -1.8,
                      borderColor: 'rgba(34,197,94,0.32)',
                      boxShadow: '0 16px 34px rgba(0,0,0,0.4), 0 0 24px rgba(34,197,94,0.12)',
                      background: 'rgba(21,128,61,0.1)',
                    }
          }
          transition={{
            delay: 1.3 + i * 0.1,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
            y: { duration: 0.14 },
            borderColor: { duration: 0.14 },
            boxShadow: { duration: 0.14 },
            background: { duration: 0.14 },
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            padding: 'clamp(18px, 2.5vw, 28px)',
            transformStyle: 'preserve-3d',
          }}
        >
          <motion.div
            aria-hidden="true"
            initial={{ x: '-130%' }}
            whileHover={reduced ? undefined : { x: '130%' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.11) 50%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <motion.span
            whileHover={reduced ? undefined : { scale: 1.12, rotate: i === 1 ? 8 : i === 2 ? -8 : 6 }}
            transition={{ duration: 0.14 }}
            style={{ fontSize: '28px', display: 'block', marginBottom: '12px' }}
          >
            {item.icon}
          </motion.span>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'white', margin: '0 0 8px' }}>{item.title}</h4>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, margin: 0 }}>{item.description}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}

// --- MAIN EXPORT ---

export default function DemoIA() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (isInView && videoRef.current && !reduced) {
      videoRef.current.play().catch(() => {})
    }
  }, [isInView, reduced])

  return (
    <section
      ref={sectionRef} id="demo-ia"
      style={{ padding: 'clamp(80px, 12vh, 140px) clamp(20px, 5vw, 80px)', background: '#080810', position: 'relative', overflow: 'hidden' }}
    >
      <AtmosphereGlows />
      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Header isInView={isInView} />
        <div style={{ position: 'relative', margin: 'clamp(40px, 6vh, 72px) auto', maxWidth: '860px' }}>
          <motion.div
             initial={reduced ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.96 }}
             animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
             transition={{ duration: 1.0, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
             style={{ position: 'relative', zIndex: 10 }}
          >
            <CapsuleFrame videoRef={videoRef} />
            <CapsuleBorderGlow />
          </motion.div>
          <FloatingMetrics isInView={isInView} />
        </div>
        <MobileMetrics isInView={isInView} />
        <BottomCopy isInView={isInView} />
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }
      `}</style>
    </section>
  )
}
