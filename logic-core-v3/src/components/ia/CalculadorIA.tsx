'use client'

import React, { useState, useMemo, useRef, useEffect, CSSProperties } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface ResultadosIA {
  horasMes: number
  horasRecuperadas: number
  dineroRecuperado: number
  costoIA: number
  roiNeto: number
  roiPct: number
  diasROI: number
}

interface Preset {
  label: string
  icon: string
  horasAtencion: number
  diasTrabajo: number
  valorHora: number
  porcentajeAuto: number
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const presets: Preset[] = [
  {
    label: 'Restaurante',
    icon: '🍽',
    horasAtencion: 3,
    diasTrabajo: 7,
    valorHora: 2000,
    porcentajeAuto: 70,
  },
  {
    label: 'Comercio',
    icon: '🏪',
    horasAtencion: 5,
    diasTrabajo: 6,
    valorHora: 2500,
    porcentajeAuto: 65,
  },
  {
    label: 'Salud',
    icon: '🏥',
    horasAtencion: 2,
    diasTrabajo: 5,
    valorHora: 5000,
    porcentajeAuto: 55,
  },
  {
    label: 'Inmobiliaria',
    icon: '🏠',
    horasAtencion: 4,
    diasTrabajo: 6,
    valorHora: 4000,
    porcentajeAuto: 60,
  },
]

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

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

  useEffect(() => {
    if (reduced) {
      setDisplayed(value)
      return
    }

    const from = prevRef.current
    const to = value
    prevRef.current = value

    if (from === to) return

    const duration = 400
    const start = performance.now()

    function update(now: number) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayed(Math.round(from + (to - from) * eased))
      if (t < 1) requestAnimationFrame(update)
    }

    requestAnimationFrame(update)
  }, [value, reduced])

  return (
    <span style={style}>
      {prefix}
      {displayed.toLocaleString('es-AR')}
      {suffix}
    </span>
  )
}

function AtmosphereGlows() {
  return (
    <>
      {/* Glow principal — verde */}
      <div style={{
        position:'absolute',
        top:'0%', left:'50%',
        transform:'translateX(-50%)',
        width:'700px', height:'400px',
        background:'radial-gradient(ellipse, rgba(0,255,136,0.07) 0%, transparent 60%)',
        filter:'blur(100px)',
        pointerEvents:'none',
        zIndex:0,
      }}/>

      {/* Glow sliders — izquierda */}
      <div style={{
        position:'absolute',
        top:'30%', left:'-5%',
        width:'450px', height:'450px',
        background:'radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 65%)',
        filter:'blur(80px)',
        pointerEvents:'none',
        zIndex:0,
      }}/>

      {/* Glow resultados — derecha */}
      <div style={{
        position:'absolute',
        top:'20%', right:'-5%',
        width:'500px', height:'500px',
        background:'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 60%)',
        filter:'blur(90px)',
        pointerEvents:'none',
        zIndex:0,
      }}/>

      {/* Grid de puntos decorativo */}
      <div style={{
        position:'absolute',
        inset:0,
        backgroundImage:`radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize:'40px 40px',
        pointerEvents:'none',
        zIndex:0,
        maskImage:'radial-gradient(ellipse at center, black 0%, transparent 70%)',
        WebkitMaskImage:'radial-gradient(ellipse at center, black 0%, transparent 70%)',
      }}/>

      {/* Líneas de horizonte decorativas */}
      {[25, 50, 75].map((top, i) => (
        <div key={i} style={{
          position: 'absolute', top: `${top}%`, left: 0, right: 0, height: '1px',
          background: 'rgba(255,255,255,0.02)', pointerEvents: 'none', zIndex: 0,
        }} />
      ))}
    </>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  const reduced = useReducedMotion()

  return (
    <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 5vh, 60px)' }}>
      <motion.div
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          border: '1px solid #00ff88', color: '#00ff88',
          padding: '6px 16px', borderRadius: '100px', fontSize: '11px',
          letterSpacing: '0.25em', fontWeight: 600, marginBottom: '24px',
          background: 'rgba(0, 255, 136, 0.06)',
        }}
      >
        [ CALCULÁ TU ROI ]
      </motion.div>

      <motion.h2
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: 'white', margin: '0 0 16px', lineHeight: 1.1 }}
      >
        ¿Cuánto vale tu tiempo?<br />
        <span style={{ color: '#00ff88' }}>Calculalo en 30 segundos.</span>
      </motion.h2>

      <motion.p
        initial={reduced ? { opacity: 1 } : { opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.38 }}
        style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.4)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}
      >
        Mové los sliders según tu situación. El resultado es tuyo, no un promedio genérico.
      </motion.p>
    </div>
  )
}

function SliderItem({
  label, value, min, max, step, unit, onChange, color, colorRgb, formatValue,
}: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void; color: string; colorRgb: string; formatValue?: (v: number) => string;
}) {
  const displayValue = formatValue ? formatValue(value) : `${value} ${unit}`
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.4, flex: 1 }}>{label}</label>
        <motion.span
          key={value}
          initial={{ scale: 1.15, color: color }}
          animate={{ scale: 1, color: 'rgba(255,255,255,0.9)' }}
          transition={{ duration: 0.25 }}
          style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'monospace', color: 'white', flexShrink: 0, minWidth: '90px', textAlign: 'right' }}
        >
          {displayValue}
        </motion.span>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ height: '4px', borderRadius: '100px', background: 'rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}, rgba(${colorRgb},0.6))`,
            borderRadius: '100px', boxShadow: `0 0 8px rgba(${colorRgb},0.5)`, transition: 'width 150ms ease'
          }} />
        </div>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'absolute', inset: '-8px 0', width: '100%', opacity: 0, cursor: 'pointer', height: '20px' }}
        />
        <div style={{
          position: 'absolute', top: '50%', left: `calc(${pct}% - 10px)`, transform: 'translateY(-50%)',
          width: '20px', height: '20px', borderRadius: '50%', background: color, border: `3px solid #080810`,
          boxShadow: `0 0 12px rgba(${colorRgb},0.6), 0 2px 8px rgba(0,0,0,0.5)`, pointerEvents: 'none',
          transition: 'left 150ms ease', zIndex: 2
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>{formatValue ? formatValue(min) : `${min} ${unit}`}</span>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>{formatValue ? formatValue(max) : `${max} ${unit}`}</span>
      </div>
    </div>
  )
}

function MainResult({ resultados }: { resultados: ResultadosIA }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(0,255,136,0.08), rgba(123,47,255,0.05))',
      border: '1px solid rgba(0,255,136,0.2)', borderRadius: '20px',
      padding: 'clamp(24px, 3vw, 36px)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #00ff88 40%, #7b2fff 60%, transparent)' }} />
      <p style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(0,255,136,0.6)', fontWeight: 600, margin: '0 0 16px', textTransform: 'uppercase' }}>Recuperás al mes</p>
      
      <AnimatedNumber
        value={resultados.horasRecuperadas} suffix=" horas"
        style={{ fontSize: 'clamp(48px, 7vw, 80px)', fontWeight: 900, color: '#00ff88', lineHeight: 1, fontFamily: 'monospace', display: 'block', marginBottom: '8px' }}
      />

      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '0 0 20px' }}>
        de {resultados.horasMes} horas totales de atención
      </p>

      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${Math.round((resultados.horasRecuperadas / resultados.horasMes) * 100)}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: '100%', background: 'linear-gradient(90deg, #00ff88, #7b2fff)', borderRadius: '100px', boxShadow: '0 0 10px rgba(0,255,136,0.5)' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>0 hs</span>
        <span style={{ fontSize: '11px', color: 'rgba(0,255,136,0.5)' }}>{resultados.horasRecuperadas} hs automatizadas</span>
      </div>
    </div>
  )
}

function SecondaryResults({ resultados }: { resultados: ResultadosIA }) {
  const items = [
    { label: 'Valor recuperado', value: resultados.dineroRecuperado, prefix: '$', color: '#00ff88', colorRgb: '0,255,136', icon: '💰', description: 'Costo de oportunidad mensual' },
    { label: 'Costo del agente IA', value: resultados.costoIA, prefix: '$', color: '#7b2fff', colorRgb: '123,47,255', icon: '🤖', description: 'Implementación y mantenimiento' },
    { label: 'ROI neto mensual', value: resultados.roiNeto, prefix: '$', color: resultados.roiNeto > 0 ? '#00ff88' : '#ef4444', colorRgb: resultados.roiNeto > 0 ? '0,255,136' : '239,68,68', icon: '📈', description: 'Ganancia mensual real' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(${item.colorRgb},0.12)`, borderRadius: '14px' }}>
          <span style={{ fontSize: '22px' }}>{item.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0 0 2px' }}>{item.label}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', margin: 0 }}>{item.description}</p>
          </div>
          <AnimatedNumber value={item.value} prefix={item.prefix} style={{ fontSize: '20px', fontWeight: 900, color: item.color, fontFamily: 'monospace', flexShrink: 0 }} />
        </div>
      ))}
    </div>
  )
}

function ROIBadge({ resultados }: { resultados: ResultadosIA }) {
  const isPositive = resultados.roiPct > 0

  return (
    <div style={{
      background: isPositive ? 'rgba(0,255,136,0.06)' : 'rgba(239,68,68,0.06)',
      border: `1px solid ${isPositive ? 'rgba(0,255,136,0.2)' : 'rgba(239,68,68,0.2)'}`,
      borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px',
    }}>
      <div>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '0 0 4px' }}>ROI de tu inversión en IA</p>
        <AnimatedNumber value={resultados.roiPct} suffix="%" style={{ fontSize: '32px', fontWeight: 900, color: isPositive ? '#00ff88' : '#ef4444', fontFamily: 'monospace' }} />
      </div>
      <div style={{ flex: 1, fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
        Recuperás la inversión en <strong style={{ color: 'white', fontWeight: 700 }}>{resultados.diasROI} días</strong>
      </div>
    </div>
  )
}

function CTAResult() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <motion.a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%20DevelOP%2C%20calculé%20mi%20ROI%20y%20quiero%20implementar%20IA`}
        target="_blank"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          background: 'linear-gradient(135deg, #25d366, #128c7e)', color: 'white',
          fontWeight: 800, fontSize: '15px', padding: '16px 24px', borderRadius: '100px',
          textDecoration: 'none', boxShadow: '0 0 30px rgba(37,211,102,0.25), 0 8px 24px rgba(0,0,0,0.3)',
        }}
      >
        💬 Quiero implementar esto →
      </motion.a>
      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: 0, letterSpacing: '0.05em' }}>Consulta gratis · Sin compromiso</p>
    </div>
  )
}

function ResultsPanel({ resultados, isInView }: { resultados: ResultadosIA; isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}
    >
      <MainResult resultados={resultados} />
      <SecondaryResults resultados={resultados} />
      <ROIBadge resultados={resultados} />
      <CTAResult />
    </motion.div>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export default function CalculadorIA() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
  const reduced = useReducedMotion()

  // Inputs
  const [horasAtencion, setHorasAtencion] = useState(4)
  const [diasTrabajo, setDiasTrabajo] = useState(6)
  const [valorHora, setValorHora] = useState(2500)
  const [porcentajeAuto, setPorcentajeAuto] = useState(60)
  const [activePreset, setActivePreset] = useState<number | null>(null)

  function applyPreset(preset: Preset, index: number) {
    setActivePreset(index)
    setHorasAtencion(preset.horasAtencion)
    setDiasTrabajo(preset.diasTrabajo)
    setValorHora(preset.valorHora)
    setPorcentajeAuto(preset.porcentajeAuto)
  }

  // Cálculos
  const resultados = useMemo<ResultadosIA>(() => {
    const horasMes = horasAtencion * diasTrabajo * 4.3
    const horasRecuperadas = Math.round(horasMes * (porcentajeAuto / 100))
    const dineroRecuperado = Math.round(horasRecuperadas * valorHora)
    const costoIA = 35000 // ARS/mes fijo
    const roiNeto = dineroRecuperado - costoIA
    const roiPct = Math.round((roiNeto / costoIA) * 100)
    
    const gananciaDiaria = dineroRecuperado / 30
    const diasROI = gananciaDiaria > 0 ? Math.round(costoIA / gananciaDiaria) : 0

    return {
      horasMes: Math.round(horasMes),
      horasRecuperadas,
      dineroRecuperado,
      costoIA,
      roiNeto,
      roiPct,
      diasROI,
    }
  }, [horasAtencion, diasTrabajo, valorHora, porcentajeAuto])

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
      <AtmosphereGlows />
      
      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Header isInView={isInView} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[clamp(24px,3vw,48px)] items-start">
          
          <div className="order-last md:order-first">
            {/* Presets UI */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginRight: '4px' }}>
                Cargar ejemplo:
              </span>
              {presets.map((preset, i) => (
                <motion.button
                  key={i}
                  onClick={() => applyPreset(preset, i)}
                  whileHover={reduced ? {} : { scale: 1.05 }}
                  whileTap={reduced ? {} : { scale: 0.95 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '100px',
                    border: activePreset === i ? '1px solid rgba(0,255,136,0.5)' : '1px solid rgba(255,255,255,0.1)',
                    background: activePreset === i ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.04)',
                    color: activePreset === i ? '#00ff88' : 'rgba(255,255,255,0.45)',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 200ms',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{preset.icon}</span>
                  {preset.label}
                </motion.button>
              ))}
            </div>

            <motion.div
              initial={reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px', padding: 'clamp(24px, 3vw, 40px)', display: 'flex', flexDirection: 'column',
                gap: 'clamp(28px, 3.5vh, 40px)'
              }}
            >
              <SliderItem
                label="Horas al día en atención al cliente"
                value={horasAtencion} min={1} max={12} step={1} unit="hs/día"
                onChange={(v) => { setActivePreset(null); setHorasAtencion(v); }} 
                color="#00ff88" colorRgb="0,255,136"
              />
              <SliderItem
                label="Días por semana que trabajás"
                value={diasTrabajo} min={1} max={7} step={1} unit="días/sem"
                onChange={(v) => { setActivePreset(null); setDiasTrabajo(v); }} 
                color="#00e5ff" colorRgb="0,229,255"
              />
              <SliderItem
                label="Valor de tu hora de trabajo"
                value={valorHora} min={500} max={10000} step={500} unit="ARS/hora"
                onChange={(v) => { setActivePreset(null); setValorHora(v); }} 
                color="#7b2fff" colorRgb="123,47,255"
                formatValue={(v) => `$${v.toLocaleString('es-AR')}`}
              />
              <SliderItem
                label="¿Cuánto de tu atención puede automatizar la IA?"
                value={porcentajeAuto} min={20} max={90} step={5} unit="%"
                onChange={(v) => { setActivePreset(null); setPorcentajeAuto(v); }} 
                color="#f59e0b" colorRgb="245,158,11"
              />
            </motion.div>

            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)', marginTop: '20px', lineHeight: 1.6, textAlign: 'center' }}>
              * Los cálculos son estimativos basados en los valores que ingresaste. Los resultados reales varían según el negocio.
              Costo del agente IA: desde $35.000 ARS/mes.
            </p>
          </div>
          
          <div className="order-first md:order-last">
             <ResultsPanel resultados={resultados} isInView={isInView} />
          </div>
        </div>
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
