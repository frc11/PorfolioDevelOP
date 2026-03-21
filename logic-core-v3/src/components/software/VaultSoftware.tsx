'use client'

import React, { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface FAQItem {
  question: string
  answer: string
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const faqItems: FAQItem[] = [
  {
    question: '¿Cuánto tiempo lleva estar usando el sistema?',
    answer:
      'En 30 días ya estás usando el módulo principal. Arrancamos con lo que más duele — ventas, stock o gestión de clientes — y de ahí expandimos. No esperás 6 meses para ver resultados. El primer mes ya notás la diferencia.',
  },
  {
    question: '¿Qué pasa si el sistema se cae?',
    answer:
      'Monitoreo activo las 24 horas. Si algo falla, nos enteramos antes que vos. Backups automáticos diarios para que nunca pierdas información. Los 30 días post-lanzamiento tienen soporte incluido con resolución en menos de 4 horas hábiles.',
  },
  {
    question: '¿Mis empleados van a poder usarlo sin capacitación?',
    answer:
      'Sí. Diseñamos interfaces para que cualquier persona las use desde el primer día — sin manuales técnicos. Igual incluimos una capacitación de 2-3 horas donde el equipo aprende todo lo necesario para operar solo.',
  },
  {
    question: '¿Se puede conectar con lo que ya uso (WhatsApp, MercadoPago, AFIP)?',
    answer:
      'Sí. Las integraciones más pedidas son exactamente esas. Un pedido nuevo puede notificar por WhatsApp, facturar en AFIP y cobrar por MercadoPago en la misma secuencia automática. Sin que nadie lo haga a mano.',
  },
  {
    question: '¿Qué pasa si necesito cambiar algo después del lanzamiento?',
    answer:
      'El mantenimiento mensual incluye ajustes y mejoras menores. Para funcionalidades nuevas importantes presupuestamos por separado. Tu sistema nunca queda congelado en la versión del lanzamiento.',
  },
  {
    question: '¿Es para empresas pequeñas o solo para las grandes?',
    answer:
      'Construimos sistemas para empresas de 3 a 200 personas. El punto de partida ideal es cuando los Excels ya no dan más y necesitás que la información esté centralizada. Si llegaste hasta acá, ya es el momento.',
  },
]

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function ROINumber({ value, prefix = '', suffix = '', style }: { value: number, prefix?: string, suffix?: string, style?: any }) {
  const shouldReduceMotion = useReducedMotion()
  const [displayed, setDisplayed] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayed(value)
      return
    }
    const from = prevRef.current
    const to = value
    prevRef.current = value
    if (from === to) return
    const dur = 350
    const start = performance.now()
    function upd(now: number) {
      const t = Math.min((now - start) / dur, 1)
      const e = 1 - Math.pow(1 - t, 3)
      setDisplayed(Math.round(from + (to - from) * e))
      if (t < 1) requestAnimationFrame(upd)
    }
    requestAnimationFrame(upd)
  }, [value, shouldReduceMotion])

  return (
    <span style={style}>
      {prefix}
      {displayed.toLocaleString('es-AR')}
      {suffix}
    </span>
  )
}

function SliderROI({ label, value, min, max, step, unit, onChange, color, colorRgb, formatValue }: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
  color: string
  colorRgb: string
  formatValue?: (v: number) => string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{label}</span>
        <span style={{ fontSize: '15px', fontWeight: 800, color: 'white', fontFamily: 'monospace' }}>
          {formatValue ? formatValue(value) : value} <small style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>{unit}</small>
        </span>
      </div>
      <div style={{ position: 'relative', height: '6px', display: 'flex', alignItems: 'center' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '4px',
            appearance: 'none',
            background: `rgba(${colorRgb}, 0.1)`,
            borderRadius: '2px',
            outline: 'none',
            cursor: 'pointer',
            zIndex: 2,
            position: 'relative'
          }}
        />
        <div style={{
          position: 'absolute',
          left: 0,
          height: '4px',
          width: `${((value - min) / (max - min)) * 100}%`,
          background: `linear-gradient(90deg, rgba(${colorRgb},0.2), ${color})`,
          borderRadius: '2px',
          zIndex: 1
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-4px' }}>
        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>{min}</span>
        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>{max}</span>
      </div>
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          border: 2px solid ${color};
          box-shadow: 0 0 10px rgba(${colorRgb}, 0.3);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

function AtmosphereVault() {
  return (
    <>
      {/* Glow superior */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '-80px', left: '50%',
        transform: 'translateX(-50%)',
        width: '800px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(123,47,255,0.09) 0%, rgba(99,102,241,0.05) 40%, transparent 65%)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Glow CTA inferior */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        bottom: '-40px', left: '50%',
        transform: 'translateX(-50%)',
        width: '700px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 60%)',
        filter: 'blur(90px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Líneas decorativas */}
      {[20, 50, 80].map((top, i) => (
        <div key={i} aria-hidden="true" style={{
          position: 'absolute',
          top: `${top}%`,
          left: 0, right: 0,
          height: '1px',
          background: 'rgba(255,255,255,0.015)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      ))}
    </>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  return (
    <div style={{
      textAlign: 'center',
      marginBottom: '32px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        style={{
          display: 'inline-block',
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '0.25em',
          color: '#6366f1',
          marginBottom: '16px',
          textTransform: 'uppercase',
          background: 'rgba(99,102,241,0.1)',
          padding: '4px 12px',
          borderRadius: '4px',
          border: '1px solid rgba(99,102,241,0.2)'
        }}
      >
        [ LO QUE QUERÉS SABER ]
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: '0 0 16px',
          color: 'white',
        }}
      >
        Todo claro antes de arrancar.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          fontSize: 'clamp(15px, 1.8vw, 19px)',
          color: 'rgba(255,255,255,0.42)',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        Las preguntas que todos hacen — sin blablá corporativo.
      </motion.p>
    </div>
  )
}

function FAQItem({ item, index, isOpen, onToggle, isInView }: {
  item: FAQItem
  index: number
  isOpen: boolean
  onToggle: () => void
  isInView: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: 0.35 + index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        ...(isOpen && {
          borderLeft: '2px solid rgba(99,102,241,0.4)',
          paddingLeft: '12px',
        }),
        transition: 'border 200ms, padding 200ms',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: 'clamp(16px, 2.5vh, 22px) 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: 'clamp(14px, 1.6vw, 17px)',
          fontWeight: 600,
          color: isOpen ? '#6366f1' : 'rgba(255,255,255,0.75)',
          transition: 'color 200ms',
          lineHeight: 1.4,
          flex: 1,
        }}>
          {item.question}
        </span>

        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          style={{
            width: '32px', height: '32px',
            borderRadius: '50%',
            border: isOpen ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.1)',
            background: isOpen ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: isOpen ? '#6366f1' : 'rgba(255,255,255,0.4)',
            flexShrink: 0,
            transition: 'background 200ms, border 200ms',
          }}
        >
          +
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              fontSize: '14px',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.5)',
              margin: '0 48px 20px 0',
            }}>
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FAQSection({ items, openIndex, setOpenIndex, isInView }: {
  items: FAQItem[]
  openIndex: number | null
  setOpenIndex: (i: number | null) => void
  isInView: boolean
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      marginBottom: 'clamp(48px, 7vh, 80px)',
    }}>
      {items.map((item, i) => (
        <FAQItem
          key={i}
          item={item}
          index={i}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          isInView={isInView}
        />
      ))}
    </div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function VaultSoftware() {
  const sectionRef = useRef<HTMLElement>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const isInView = useInView(sectionRef, {
    once: true, amount: 0.1,
  })
  const shouldReduceMotion = useReducedMotion()

  // ROI Calculator State
  const [empleados, setEmpleados] = useState(5)
  const [horasProcesos, setHorasProcesos] = useState(3)
  const [erroresMes, setErroresMes] = useState(8)
  const [costoHora, setCostoHora] = useState(1800)

  const resultados = useMemo(() => {
    // Horas perdidas en procesos manuales
    const horasMes = horasProcesos * empleados * 4.3 * 22
    // Costo de procesos manuales
    const costoProcesosMes = Math.round(horasMes * costoHora)
    // Costo de errores humanos (estimado $15.000 por error promedio)
    const costoErroresMes = erroresMes * 15000
    // Costo total del problema
    const costoTotal = costoProcesosMes + costoErroresMes
    // Inversión estimada en software amortizada
    const inversionMensual = 145000
    // Ahorro mensual (el sistema elimina el 70% del costo)
    const ahorroMensual = Math.round(costoTotal * 0.7)
    // ROI neto
    const roiNeto = ahorroMensual - inversionMensual
    // ROI %
    const roiPct = Math.round((roiNeto / inversionMensual) * 100)
    // Payback en meses
    const paybackMeses = Math.ceil(inversionMensual / (ahorroMensual / 30) / 30)

    return {
      horasMes: Math.round(horasMes),
      costoProcesosMes,
      costoErroresMes,
      costoTotal,
      inversionMensual,
      ahorroMensual,
      roiNeto,
      roiPct,
      paybackMeses: Math.min(paybackMeses, 12),
    }
  }, [empleados, horasProcesos, erroresMes, costoHora])

  return (
    <section
      ref={sectionRef}
      style={{
        padding: 'clamp(80px, 12vh, 140px) clamp(20px, 5vw, 80px)',
        background: '#030308',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AtmosphereVault />
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}>
        <Header isInView={isInView} />
        <FAQSection
          items={faqItems}
          openIndex={openIndex}
          setOpenIndex={setOpenIndex}
          isInView={isInView}
        />

        {/* ROI CALCULATOR */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="roi-calculator-container"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: '24px',
            overflow: 'hidden',
            marginBottom: 'clamp(48px, 7vh, 80px)',
          }}
        >
          {/* Header del calculador */}
          <div style={{
            padding: 'clamp(20px, 2.5vw, 32px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(99,102,241,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{ fontSize: '24px' }}>🧮</span>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'white', margin: '0 0 3px' }}>Calculadora de ROI</h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Cuánto cuesta NO tener un sistema</p>
            </div>
          </div>

          {/* Body — 2 columnas */}
          <div className="roi-calculator-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
            {/* Sliders */}
            <div className="roi-sliders-column" style={{
              padding: 'clamp(20px, 2.5vw, 32px)',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(20px, 3vh, 28px)',
            }}>
              <SliderROI
                label="Empleados en el equipo"
                value={empleados}
                min={1} max={50} step={1}
                unit="personas"
                onChange={setEmpleados}
                color="#6366f1"
                colorRgb="99,102,241"
              />
              <SliderROI
                label="Horas/día en procesos manuales"
                value={horasProcesos}
                min={0.5} max={8} step={0.5}
                unit="hs/día"
                onChange={setHorasProcesos}
                color="#7b2fff"
                colorRgb="123,47,255"
                formatValue={v => `${v}hs`}
              />
              <SliderROI
                label="Errores operativos por mes"
                value={erroresMes}
                min={0} max={50} step={1}
                unit="errores/mes"
                onChange={setErroresMes}
                color="#6366f1"
                colorRgb="99,102,241"
              />
              <SliderROI
                label="Costo promedio por hora de trabajo"
                value={costoHora}
                min={500} max={8000} step={500}
                unit="ARS/hora"
                onChange={setCostoHora}
                color="#7b2fff"
                colorRgb="123,47,255"
                formatValue={v => `$${v.toLocaleString('es-AR')}`}
              />
            </div>

            {/* Resultados */}
            <div style={{ padding: 'clamp(20px, 2.5vw, 32px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Costo del problema */}
              <div style={{ padding: '16px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '14px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(239,68,68,0.6)', margin: '0 0 6px', fontWeight: 700 }}>LO QUE PERDÉS CADA MES</p>
                <ROINumber value={resultados.costoTotal} prefix="$" style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, color: '#ef4444', fontFamily: 'monospace' }} />
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>en procesos manuales + errores</p>
              </div>

              {/* Ahorro con sistema */}
              <div style={{ padding: '16px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: '14px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(99,102,241,0.6)', margin: '0 0 6px', fontWeight: 700 }}>AHORRO MENSUAL CON SISTEMA</p>
                <ROINumber value={resultados.ahorroMensual} prefix="$" style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, color: '#6366f1', fontFamily: 'monospace' }} />
              </div>

              {/* ROI */}
              <div style={{
                padding: '16px',
                background: resultados.roiPct > 0 ? 'rgba(74,222,128,0.06)' : 'rgba(239,68,68,0.06)',
                border: `1px solid ${resultados.roiPct > 0 ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)'}`,
                borderRadius: '14px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: '0 0 4px' }}>ROI</p>
                  <ROINumber value={resultados.roiPct} suffix="%" style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'monospace', color: resultados.roiPct > 0 ? '#4ade80' : '#ef4444' }} />
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, flex: 1 }}> Payback en <strong style={{ color: 'white' }}>{resultados.paybackMeses} meses</strong> </p>
              </div>

              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)', textAlign: 'center', margin: '4px 0 0', lineHeight: 1.5 }}> * Estimaciones basadas en tus valores. Inversión promedio: $145.000 ARS/mes. </p>
            </div>
          </div>
        </motion.div>

        {/* PRICING TIERS */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 'clamp(48px, 7vh, 80px)' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '28px',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
            <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>INVERSIÓN</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }} className="pricing-grid-software">
            {[
              {
                name: 'Sistema Base',
                price: '$2.500',
                unit: 'USD · pago único',
                desc: 'Módulo principal adaptado a tu proceso clave. Incluye capacitación y 30 días de soporte.',
                items: ['1 módulo central', 'Panel administrativo', 'Capacitación incluida', '30 días de soporte'],
                color: '#6366f1',
                colorRgb: '99,102,241',
              },
              {
                name: 'Integraciones',
                price: '$500',
                unit: 'USD c/u',
                desc: 'Cada conexión con un sistema externo. WhatsApp, MercadoPago, AFIP, Google Sheets y más.',
                items: ['API configurable', 'Flujos automáticos', 'Sincronización en tiempo real', 'Sin límite de transacciones'],
                color: '#7b2fff',
                colorRgb: '123,47,255',
                highlight: true,
              },
              {
                name: 'Hosting & Mantenimiento',
                price: '$80',
                unit: 'USD/mes',
                desc: 'Servidor dedicado, backups diarios, actualizaciones de seguridad y soporte continuo.',
                items: ['Uptime garantizado 99.8%', 'Backups automáticos', 'Actualizaciones de seguridad', 'Soporte por WhatsApp'],
                color: '#818cf8',
                colorRgb: '129,140,248',
              },
            ].map((tier) => (
              <div
                key={tier.name}
                style={{
                  borderRadius: '18px',
                  padding: 'clamp(18px, 2vw, 28px)',
                  background: tier.highlight
                    ? `linear-gradient(135deg, rgba(${tier.colorRgb},0.1) 0%, rgba(255,255,255,0.03) 100%)`
                    : `rgba(${tier.colorRgb},0.04)`,
                  border: `1px solid rgba(${tier.colorRgb},${tier.highlight ? '0.3' : '0.15'})`,
                  boxShadow: tier.highlight ? `0 0 30px rgba(${tier.colorRgb},0.1)` : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {tier.highlight && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, rgba(${tier.colorRgb},0.9), transparent)` }} />
                )}
                <p style={{ fontSize: '11px', fontWeight: 700, color: `rgba(${tier.colorRgb},0.8)`, letterSpacing: '0.15em', margin: '0 0 10px', textTransform: 'uppercase', fontFamily: 'monospace' }}>{tier.name}</p>
                <div style={{ marginBottom: '14px' }}>
                  <span style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', fontFamily: 'monospace' }}>{tier.price}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginLeft: '6px' }}>{tier.unit}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: '0 0 16px' }}>{tier.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tier.items.map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                      <span style={{ color: `rgba(${tier.colorRgb},0.9)`, fontWeight: 700, fontSize: '10px' }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '16px' }}>
            Presupuesto personalizado después del diagnóstico · Sin compromiso
          </p>
        </motion.div>

        {/* CTA FINAL */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Separador */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.2, delay: 0.5 }}
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3) 30%, rgba(139,92,246,0.3) 70%, transparent)',
              transformOrigin: 'center',
              marginBottom: 'clamp(48px, 7vh, 80px)',
            }}
          />

          {/* Eyebrow */}
          <p style={{
            fontSize: '11px',
            letterSpacing: '0.35em',
            color: 'rgba(255,255,255,0.2)',
            textTransform: 'uppercase',
            margin: '0 0 20px',
          }}>
            ¿SEGUÍS MANEJANDO TODO A MANO?
          </p>

          {/* H2 de cierre */}
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 68px)',
            fontWeight: 900,
            lineHeight: 1.1,
            margin: '0 0 20px',
            letterSpacing: '-0.02em',
          }}>
            <span style={{ color: 'white' }}>
              Tu sistema a medida,
            </span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #6366f1, #7b2fff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              listo en 8 semanas.
            </span>
          </h2>

          {/* Subtítulo */}
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.4)',
            maxWidth: '480px',
            margin: '0 auto clamp(28px, 4vh, 44px)',
            lineHeight: 1.65,
          }}>
            Sin papeles, sin Excel, sin WhatsApp como CRM. Con un sistema que trabaja mientras vos tomás decisiones.
          </p>

          {/* Garantía pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '100px',
            padding: '8px 18px',
            marginBottom: '28px',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.6)',
            }}>
              Primera reunión gratuita · Presupuesto sin compromiso
            </span>
          </div>

          {/* CTAs */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 'clamp(20px, 3vh, 32px)',
          }}>
            <motion.a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%20DevelOP%2C%20quiero%20auditar%20mis%20procesos%20y%20ver%20qué%20sistema%20necesito`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={shouldReduceMotion ? {} : { scale: 1.04 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white',
                fontWeight: 800,
                fontSize: '15px',
                letterSpacing: '0.04em',
                padding: '16px 36px',
                borderRadius: '100px',
                textDecoration: 'none',
                boxShadow: '0 0 40px rgba(99,102,241,0.35), 0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              💬 Auditar mis procesos →
            </motion.a>

            <motion.a
              href="#diagnostico"
              whileHover={shouldReduceMotion ? {} : { scale: 1.02, borderColor: 'rgba(99,102,241,0.4)' }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.55)',
                fontWeight: 600,
                fontSize: '14px',
                padding: '16px 28px',
                borderRadius: '100px',
                textDecoration: 'none',
                transition: 'all 200ms',
              }}
            >
              Ver diagnóstico primero
            </motion.a>
          </div>

          <p style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.15)',
            letterSpacing: '0.08em',
          }}>
            Respondemos en menos de 2 horas en horario comercial
          </p>

          {/* Footer mínimo */}
          <div style={{
            marginTop: 'clamp(48px, 7vh, 80px)',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{
                fontSize: '18px',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #6366f1, #7b2fff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'block',
              }}>
                DevelOP
              </span>
              <span style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.15)',
                letterSpacing: '0.1em',
              }}>
                TUCUMÁN · ARGENTINA
              </span>
            </div>
            <p style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.12)',
              margin: 0,
            }}>
              © 2025 DevelOP. Todos los derechos reservados.
            </p>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .roi-calculator-body {
            grid-template-columns: 1fr !important;
          }
          .roi-sliders-column {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.06) !important;
          }
          .pricing-grid-software {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
