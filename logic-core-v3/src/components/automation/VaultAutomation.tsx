'use client'

import React, { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react'

/**
 * VAULT AUTOMATION: "Todo claro antes de arrancar."
 * FAQ final que elimina objeciones + CTA final potente "DELEGÁ AL SISTEMA".
 */

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface FAQItem {
  question: string
  answer: string
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const faqItems: FAQItem[] = [
  {
    question:
      '¿Mis empleados tienen que aprender algo nuevo?',
    answer:
      'No. Las automatizaciones trabajan en el fondo — tus empleados siguen usando WhatsApp, Excel y las mismas herramientas de siempre. La diferencia es que el sistema mueve los datos solo entre ellas. Sin que nadie tenga que hacer nada distinto.',
  },
  {
    question:
      '¿Qué pasa si una automatización falla en producción?',
    answer:
      'Tenemos monitoreo activo en todos los flujos. Si algo falla, recibimos alerta antes que vos y lo resolvemos. Además, ninguna automatización remplaza un proceso crítico sin tener un respaldo manual — si el robot falla, el proceso sigue funcionando de la forma tradicional mientras lo arreglamos.',
  },
  {
    question:
      '¿Cuánto tarda en estar funcionando?',
    answer:
      'En 1 semana tenés los primeros flujos corriendo en producción. Empezamos con la tarea que más tiempo le roba a tu equipo — y desde el primer lunes ya notás la diferencia. Sin esperar meses para ver resultados.',
  },
  {
    question:
      '¿La automatización puede cobrar por MercadoPago?',
    answer:
      'Sí. El flujo puede generar el link de pago, enviárselo al cliente por WhatsApp, verificar que se acreditó y emitir la factura AFIP automáticamente. Todo eso sin que ninguna persona intervenga.',
  },
  {
    question:
      '¿Funciona si mi empresa es chica?',
    answer:
      'Especialmente para empresas chicas. Una pyme de 5 personas que automatiza las tareas repetitivas opera como si tuviera 10. El punto de partida ideal es cuando sentís que el equipo pasa más tiempo administrando que vendiendo o produciendo.',
  },
  {
    question:
      '¿Puedo empezar con un solo proceso y agregar más?',
    answer:
      'Es la forma más inteligente. Empezamos con el flujo que más duele — facturación, seguimiento de leads, reportes — medimos el resultado y de ahí sumamos más. Sin compromiso de escala forzada ni contratos largos.',
  },
]

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function SliderMini({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  formatValue,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (val: number) => void
  formatValue?: (val: number) => string
}) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontFamily: 'monospace' }}>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
        <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
          {formatValue ? formatValue(value) : `${value} ${unit}`}
        </span>
      </div>
      <div style={{ position: 'relative', height: '24px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              width: `${pct}%`, 
              background: 'rgba(245,158,11,0.4)', 
              borderRadius: '100px',
              transition: 'width 100ms'
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: 'absolute',
            inset: '0',
            width: '100%',
            opacity: 0,
            cursor: 'pointer',
            zIndex: 10
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '14px',
            height: '14px',
            background: '#f59e0b',
            borderRadius: '50%',
            border: '2px solid #030308',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
            transition: 'left 100ms',
            left: `calc(${pct}% - 7px)`
          }}
        />
      </div>
    </div>
  )
}

function AtmosphereVault() {
  return (
    <>
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '-80px', left: '50%',
        transform: 'translateX(-50%)',
        width: '800px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(249,115,22,0.08) 0%, rgba(245,158,11,0.04) 40%, transparent 65%)',
        filter: 'blur(100px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div aria-hidden="true" style={{
        position: 'absolute',
        bottom: '-40px', left: '50%',
        transform: 'translateX(-50%)',
        width: '700px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 60%)',
        filter: 'blur(90px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

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
      marginBottom: '48px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.22em',
          color: '#f59e0b',
          marginBottom: '20px',
          textTransform: 'uppercase',
          background: 'rgba(245,158,11,0.07)',
          padding: '6px 18px',
          borderRadius: '100px',
          border: '1px solid rgba(245,158,11,0.25)',
          fontFamily: 'ui-monospace, monospace',
          boxShadow: '0 0 20px rgba(245,158,11,0.06)',
        }}
      >
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px rgba(245,158,11,0.9)', flexShrink: 0 }} />
        LO QUE QUERÉS SABER
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          fontSize: 'clamp(34px, 5.5vw, 60px)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          margin: '0 0 18px',
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
        Las preguntas que todos hacen — respondidas sin vueltas.
      </motion.p>
    </div>
  )
}

function FAQItemComponent({ item, index, isOpen, onToggle, isInView }: {
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
        paddingLeft: isOpen ? '16px' : '0px',
        transition: 'padding 250ms ease',
      }}
    >
      {isOpen && (
        <div style={{
          position: 'absolute',
          left: 0, top: '8px', bottom: '8px',
          width: '2px',
          borderRadius: '2px',
          background: 'linear-gradient(to bottom, rgba(245,158,11,0.8), rgba(249,115,22,0.5))',
        }} />
      )}
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
          color: isOpen ? '#f59e0b' : 'rgba(255,255,255,0.75)',
          transition: 'color 200ms, text-shadow 200ms',
          lineHeight: 1.4,
          flex: 1,
          textShadow: isOpen ? '0 0 20px rgba(245,158,11,0.3)' : 'none',
        }}>
          {item.question}
        </span>

        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          style={{
            width: '32px', height: '32px',
            borderRadius: '50%',
            border: isOpen ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(255,255,255,0.1)',
            background: isOpen ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: isOpen ? '#f59e0b' : 'rgba(255,255,255,0.4)',
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
        <FAQItemComponent
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

export default function VaultAutomation() {
  const sectionRef = useRef<HTMLElement>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const isInView = useInView(sectionRef, {
    once: true, amount: 0.1,
  })
  const shouldReduceMotion = useReducedMotion()

  // Mini Calculador ROI
  const [tareasAlDia, setTareasAlDia] = useState(20)
  const horasAhorradas = useMemo(() => 
    Math.round(tareasAlDia * 22 * (8/60) * 0.85),
    [tareasAlDia]
  )

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

        {/* Mini Calculador */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'rgba(245,158,11,0.04)',
            border: '1px solid rgba(245,158,11,0.16)',
            borderRadius: '22px',
            padding: 'clamp(26px, 3.2vw, 44px)',
            marginBottom: 'clamp(40px, 6vh, 72px)',
            boxShadow: '0 0 0 1px rgba(245,158,11,0.04), 0 12px 36px rgba(0,0,0,0.25)',
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.02) 39px, rgba(255,255,255,0.02) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.02) 39px, rgba(255,255,255,0.02) 40px)`,
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.5) 50%, transparent)' }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '28px',
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#f59e0b', letterSpacing: '0.04em', fontFamily: 'ui-monospace, monospace', lineHeight: 1 }}>ROI</span>
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'white', margin: '0 0 3px', letterSpacing: '-0.01em' }}>
                Calculá tus horas recuperadas
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.05em' }}>
                Mové el slider y mirá el resultado
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
            {/* Slider */}
            <div>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '16px' }}>
                Tareas manuales por día en tu empresa
              </label>
              
              <SliderMini 
                label="" 
                value={tareasAlDia}
                min={5}
                max={100}
                step={5}
                unit="tareas/día"
                onChange={setTareasAlDia}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.2)',
                fontFamily: 'monospace',
              }}>
                <span>5/día</span>
                <span style={{ color: 'rgba(245,158,11,0.6)', fontWeight: 700 }}>
                  {tareasAlDia} tareas/día
                </span>
                <span>100/día</span>
              </div>
            </div>

            {/* Resultado */}
            <div style={{
              position: 'relative',
              overflow: 'hidden',
              textAlign: 'center',
              padding: '22px 32px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.22)',
              borderRadius: '18px',
              minWidth: '160px',
              boxShadow: '0 0 0 1px rgba(245,158,11,0.05), 0 8px 24px rgba(0,0,0,0.2)',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.7) 50%, transparent)' }} />
              <p style={{
                fontSize: '9px',
                letterSpacing: '0.22em',
                color: 'rgba(245,158,11,0.65)',
                margin: '0 0 8px',
                fontFamily: 'ui-monospace, monospace',
                textTransform: 'uppercase',
              }}>
                RECUPERÁS AL MES
              </p>
              <motion.p
                key={horasAhorradas}
                initial={shouldReduceMotion ? { scale: 1 } : { scale: 1.15, color: '#fbbf24' }}
                animate={{ scale: 1, color: '#f59e0b' }}
                transition={{ duration: 0.25 }}
                style={{
                  fontSize: '52px',
                  fontWeight: 900,
                  color: '#f59e0b',
                  margin: 0,
                  lineHeight: 1,
                  fontFamily: 'ui-monospace, monospace',
                  letterSpacing: '-0.03em',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {horasAhorradas}
              </motion.p>
              <p style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'rgba(245,158,11,0.55)',
                margin: '6px 0 0',
                fontFamily: 'ui-monospace, monospace',
              }}>
                horas/mes
              </p>
            </div>
          </div>
        </motion.div>

        <FAQSection
          items={faqItems}
          openIndex={openIndex}
          setOpenIndex={setOpenIndex}
          isInView={isInView}
        />

        {/* CTA FINAL */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.2, delay: 0.6 }}
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.3) 30%, rgba(249,115,22,0.3) 70%, transparent)',
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
            ¿TU EQUIPO SIGUE COPIANDO DATOS A MANO?
          </p>

          {/* H2 de cierre */}
          <h2 style={{
            fontSize: 'clamp(34px, 5.5vw, 72px)',
            fontWeight: 900,
            lineHeight: 1.05,
            margin: '0 0 22px',
            letterSpacing: '-0.04em',
          }}>
            <span style={{ color: 'white' }}>
              Delegá el trabajo robótico.
            </span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              El sistema trabaja. Vos decidís.
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
            En 1 semana, tus primeros flujos corriendo. Sin tecnicismos. Sin sorpresas. Con resultados medibles desde el primer mes.
          </p>

          {/* Garantía pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(245,158,11,0.07)',
            border: '1px solid rgba(245,158,11,0.22)',
            borderRadius: '100px',
            padding: '9px 20px',
            marginBottom: '32px',
            boxShadow: '0 0 20px rgba(245,158,11,0.06)',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.65)',
              letterSpacing: '0.02em',
            }}>
              Primera automatización sin costo · Sin compromiso
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
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%20DevelOP%2C%20quiero%20encender%20las%20automatizaciones%20en%20mi%20empresa`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={shouldReduceMotion ? {} : { scale: 1.04 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                color: '#070709',
                fontWeight: 900,
                fontSize: '15px',
                letterSpacing: '0.05em',
                padding: '16px 38px',
                borderRadius: '100px',
                textDecoration: 'none',
                boxShadow: '0 0 48px rgba(245,158,11,0.4), 0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              ENCENDER MI EMPRESA →
            </motion.a>

            <motion.a
              href="#flujo"
              whileHover={shouldReduceMotion ? {} : { scale: 1.02, borderColor: 'rgba(245,158,11,0.4)' }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: '1px solid rgba(245,158,11,0.12)',
                color: 'rgba(255,255,255,0.55)',
                fontWeight: 600,
                fontSize: '14px',
                padding: '16px 28px',
                borderRadius: '100px',
                textDecoration: 'none',
                transition: 'all 200ms',
              }}
            >
              Ver cómo funciona primero →
            </motion.a>
          </div>

          <p style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.15)',
            letterSpacing: '0.08em',
          }}>
            Respondemos en menos de 2 horas en horario comercial
          </p>

          {/* Footer elegante */}
          <div style={{
            marginTop: 'clamp(48px, 7vh, 80px)',
            paddingTop: '28px',
            position: 'relative',
          }}>
            {/* Línea separadora con gradiente */}
            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.2) 20%, rgba(249,115,22,0.15) 50%, rgba(245,158,11,0.2) 80%, transparent)',
              marginBottom: '28px',
            }} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px', height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="rgba(245,158,11,0.8)" />
                  </svg>
                </div>
                <div>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'block',
                    letterSpacing: '-0.01em',
                  }}>
                    DevelOP
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.18)',
                    letterSpacing: '0.15em',
                    fontFamily: 'ui-monospace, monospace',
                    textTransform: 'uppercase',
                  }}>
                    Tucumán · Argentina
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.06)' }} />
                <p style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.1)',
                  margin: 0,
                  letterSpacing: '0.04em',
                  fontFamily: 'ui-monospace, monospace',
                }}>
                  © 2025 DevelOP
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
