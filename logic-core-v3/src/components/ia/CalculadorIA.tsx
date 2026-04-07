'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

// --- COMPONENTS ---

function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  style,
}: {
  value: number
  prefix?: string
  suffix?: string
  style?: React.CSSProperties
}) {
  const [displayed, setDisplayed] = useState(value)
  const prevRef = useRef(value)
  const reduced = useReducedMotion()
  const renderedValue = reduced ? value : displayed

  useEffect(() => {
    if (reduced) {
      prevRef.current = value
      return
    }

    const from = prevRef.current
    const to = value
    prevRef.current = value

    if (from === to) return

    const duration = 800
    const start = performance.now()

    function update(now: number) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 4) // Quart ease out
      setDisplayed(Math.round(from + (to - from) * eased))
      if (t < 1) requestAnimationFrame(update)
    }

    requestAnimationFrame(update)
  }, [value, reduced])

  return (
    <span style={style}>
      {prefix}
      {renderedValue.toLocaleString('es-AR')}
      {suffix}
    </span>
  )
}

// --- MAIN EXPORT ---

export default function CalculadorIA() {
  const [consultasDia, setConsultasDia] = useState(50)
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
  const reduced = useReducedMotion()

  // Formulas segun requerimiento
  // consultas/dia x dias habiles/mes (22) x 3 min promedio x 85% automatizable / 60 min
  const horasAhorradas = useMemo(() => 
    Math.round(consultasDia * 22 * 3 / 60 * 0.85), 
  [consultasDia])

  // $12 USD/hora costo promedio NOA
  const ahorroUSD = useMemo(() => horasAhorradas * 12, [horasAhorradas])

  const inversionInicialIA = 300 // USD setup inicial (pago unico)
  const mesesAmortizacion = 6
  const costoIA = Math.round(inversionInicialIA / mesesAmortizacion) // Costo mensual equivalente para comparar
  const roiPct = useMemo(() => 
    Math.round(((ahorroUSD - costoIA) / costoIA) * 100), 
  [ahorroUSD, costoIA])

  const colorROI = roiPct > 0 ? '#00ff88' : '#34a853'

  return (
    <section
      id="calculador"
      ref={sectionRef}
      style={{
        padding: 'clamp(80px, 12vh, 140px) clamp(20px, 5vw, 80px)',
        background: '#080810',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ATMOSPHERE GLOWS */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(0, 255, 136, 0.08) 0%, transparent 60%)',
        filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: '-10%', right: '-5%', width: '500px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(15, 191, 115, 0.05) 0%, transparent 60%)',
        filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Header */}
        <motion.div
           initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
           animate={isInView ? { opacity: 1, y: 0 } : {}}
           transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
           style={{ textAlign: 'center', marginBottom: 'clamp(40px,8vh,80px)' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88',
            padding: '6px 16px', borderRadius: '100px', fontSize: '11px',
            letterSpacing: '0.25em', fontWeight: 600, marginBottom: '24px',
            background: 'rgba(0,255,136,0.06)',
          }}>
            [ CALCULA TU ROI ]
          </div>
          <h2 style={{ fontSize: 'clamp(32px,5vw,64px)', fontWeight: 900, color: 'white', margin: '0 0 16px', lineHeight: 1.1 }}>
            Cuanto vale tu tiempo?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            Move el slider y mira cuanto recupera tu negocio cada mes.
          </p>
        </motion.div>

        {/* Input Area */}
        <motion.div
           initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
           animate={isInView ? { opacity: 1, scale: 1 } : {}}
           transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
           style={{
             background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
             borderRadius: '32px', padding: 'clamp(32px,5vw,64px)', marginBottom: '40px',
             textAlign: 'center', boxShadow: '0 32px 64px rgba(0,0,0,0.4)'
           }}
        >
          <label style={{ display: 'block', fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px', letterSpacing: '0.02em' }}>
            Consultas que recibe tu negocio por dia (WhatsApp, Instagram, web)
          </label>
          
          <div style={{ padding: '0 20px', marginBottom: '32px' }}>
            <AnimatedNumber
              value={consultasDia}
              style={{ fontSize: 'clamp(64px,10vw,110px)', fontWeight: 900, color: '#00ff88', fontFamily: 'monospace', lineHeight: 1 }}
            />
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ height: '6px', borderRadius: '100px', background: 'rgba(255,255,255,0.08)', position: 'relative' }}>
              <div style={{
                height: '100%', width: `${((consultasDia - 10) / 490) * 100}%`,
                background: 'linear-gradient(90deg, #00ff88, #0fbf73)',
                borderRadius: '100px', boxShadow: '0 0 15px rgba(0,255,136,0.4)'
              }} />
            </div>
            <input
              type="range" min="10" max="500" step="10"
              value={consultasDia}
              onChange={(e) => setConsultasDia(Number(e.target.value))}
              style={{
                position: 'absolute', top: '-10px', left: 0, width: '100%', height: '30px',
                opacity: 0, cursor: 'default'
              }}
            />
            {/* Custom Thumb */}
            <div style={{
              position: 'absolute', top: '50%', left: `calc(${((consultasDia - 10) / 490) * 100}% - 12px)`,
              transform: 'translateY(-50%)', width: '24px', height: '24px',
              borderRadius: '50%', background: '#00ff88', border: '5px solid #080810',
              boxShadow: '0 0 15px rgba(0,255,136,0.6)', pointerEvents: 'none'
            }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '600px', margin: '12px auto 0', padding: '0 4px' }}>
             <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>10 consultas</span>
             <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>500 consultas</span>
          </div>
        </motion.div>

        {/* Results Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '48px' }}>
          
          {/* Card 1: HORAS */}
          <motion.div
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            whileHover={{
              y: -3,
              scale: 1.01,
              backgroundColor: 'rgba(0,255,136,0.07)',
              borderColor: 'rgba(0,255,136,0.34)',
              boxShadow: '0 0 0 1px rgba(0,255,136,0.24), 0 14px 30px rgba(0,255,136,0.16)'
            }}
            transition={{
              duration: 0.6, delay: 0.5,
              y: { duration: 0.07, ease: 'linear' },
              scale: { duration: 0.07, ease: 'linear' },
              backgroundColor: { duration: 0.07, ease: 'linear' },
              borderColor: { duration: 0.07, ease: 'linear' },
              boxShadow: { duration: 0.08, ease: 'linear' },
            }}
            style={{
              background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.15)',
              borderRadius: '24px', padding: '32px', textAlign: 'center',
              cursor: 'default'
            }}
          >
            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(0,255,136,0.6)', marginBottom: '16px', textTransform: 'uppercase' }}>
              HORAS RECUPERADAS AL MES
            </p>
            <AnimatedNumber
              value={horasAhorradas} suffix=" hs"
              style={{ fontSize: 'clamp(40px,6vw,72px)', fontWeight: 900, color: '#00ff88', display: 'block', marginBottom: '8px' }}
            />
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Equivale a <strong style={{ color: 'white' }}>{Math.round(horasAhorradas / 8)}</strong> dias laborales libres
            </p>
          </motion.div>

          {/* Card 2: AHORRO */}
          <motion.div
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            whileHover={{
              y: -2,
              scale: 1.008,
              filter: 'brightness(1.1)',
              backgroundColor: 'rgba(15,191,115,0.08)',
              borderColor: 'rgba(15,191,115,0.35)',
              boxShadow: 'inset 0 0 0 1px rgba(15,191,115,0.18), 0 12px 24px rgba(15,191,115,0.14)'
            }}
            transition={{
              duration: 0.6, delay: 0.6,
              y: { duration: 0.07, ease: 'linear' },
              scale: { duration: 0.07, ease: 'linear' },
              filter: { duration: 0.07, ease: 'linear' },
              backgroundColor: { duration: 0.07, ease: 'linear' },
              borderColor: { duration: 0.07, ease: 'linear' },
              boxShadow: { duration: 0.08, ease: 'linear' },
            }}
            style={{
              background: 'rgba(15,191,115,0.04)', border: '1px solid rgba(15,191,115,0.15)',
              borderRadius: '24px', padding: '32px', textAlign: 'center',
              cursor: 'default'
            }}
          >
            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(15,191,115,0.6)', marginBottom: '16px', textTransform: 'uppercase' }}>
              AHORRO ESTIMADO
            </p>
            <AnimatedNumber
              value={ahorroUSD} prefix="$" suffix=" USD/mes"
              style={{ fontSize: '28px', fontWeight: 900, color: '#0fbf73', display: 'block', marginBottom: '8px' }}
            />
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Valor de mercado de tu tiempo
            </p>
          </motion.div>

          {/* Card 3: ROI */}
          <motion.div
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            whileHover={{
              y: -1,
              scale: 1.006,
              backgroundColor: `${colorROI}12`,
              borderColor: `${colorROI}66`,
              boxShadow: `0 0 0 1px ${colorROI}40, 0 0 24px ${colorROI}2E`
            }}
            transition={{
              duration: 0.6, delay: 0.7,
              y: { duration: 0.07, ease: 'linear' },
              scale: { duration: 0.07, ease: 'linear' },
              backgroundColor: { duration: 0.07, ease: 'linear' },
              borderColor: { duration: 0.07, ease: 'linear' },
              boxShadow: { duration: 0.08, ease: 'linear' },
            }}
            style={{
              background: `${colorROI}08`, border: `1px solid ${colorROI}26`,
              borderRadius: '24px', padding: '32px', textAlign: 'center',
              cursor: 'default'
            }}
          >
            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', color: `${colorROI}99`, marginBottom: '16px', textTransform: 'uppercase' }}>
              ROI MENSUAL
            </p>
            <AnimatedNumber
              value={roiPct} suffix="%"
              style={{ fontSize: '28px', fontWeight: 900, color: colorROI, display: 'block', marginBottom: '8px' }}
            />
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Retorno sobre inversion de IA
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', margin: '10px 0 0' }}>
              Basado en setup inicial USD {inversionInicialIA} amortizado en {mesesAmortizacion} meses
            </p>
          </motion.div>

        </div>

        {/* CTA */}
        <motion.div
           initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
           animate={isInView ? { opacity: 1, y: 0 } : {}}
           transition={{ duration: 0.6, delay: 0.8 }}
           style={{ textAlign: 'center' }}
        >
          <motion.a
            href={`https://wa.me/5493815674738?text=${encodeURIComponent(
              `Hola DevelOP, calcule que puedo ahorrar ${horasAhorradas} horas al mes automatizando las consultas de mi negocio. Quiero implementar IA.`
            )}`}
            target="_blank" rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              background: 'linear-gradient(135deg, #00ff88, #128c7e)', color: 'white',
              fontWeight: 800, fontSize: '18px', padding: '20px 40px', borderRadius: '100px',
              textDecoration: 'none', boxShadow: '0 0 40px rgba(0,255,136,0.3)',
              cursor: 'default'
            }}
          >
            {'\u{1F4AC}'} Quiero este ahorro {'\u2192'}
          </motion.a>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '20px', letterSpacing: '0.05em' }}>
            CONSULTA GRATIS - SIN COMPROMISO
          </p>
        </motion.div>

      </div>
    </section>
  )
}

