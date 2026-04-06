'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react'

/**
 * VAULT AUTOMATION: "Todo claro antes de arrancar."
 * FAQ final que elimina objeciones + CTA final potente "DELEGÁ AL SISTEMA".
 */

// â”€â”€â”€ TYPES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface FAQItem {
  question: string
  answer: string
}

// â”€â”€â”€ DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const faqItems: FAQItem[] = [
  {
    question: '¿Mis empleados tienen que aprender algo nuevo?',
    answer: 'No. Las automatizaciones trabajan en el fondo — tus empleados siguen usando WhatsApp, Excel y las mismas herramientas de siempre. La diferencia es que el sistema mueve los datos solo entre ellas. Sin que nadie tenga que hacer nada distinto.',
  },
  {
    question: '¿Qué pasa si una automatización falla en producción?',
    answer: 'Tenemos monitoreo activo en todos los flujos. Si algo falla, recibimos alerta antes que vos y lo resolvemos. Además, ninguna automatización remplaza un proceso crítico sin tener un respaldo manual — si el robot falla, el proceso sigue funcionando de la forma tradicional mientras lo arreglamos.',
  },
  {
    question: '¿Cuánto tarda en estar funcionando?',
    answer: 'En 1 semana tenés los primeros flujos corriendo en producción. Empezamos con la tarea que más tiempo le roba a tu equipo — y desde el primer lunes ya notás la diferencia. Sin esperar meses para ver resultados.',
  },
  {
    question: '¿La automatización puede cobrar por MercadoPago?',
    answer: 'Sí. El flujo puede generar el link de pago, enviárselo al cliente por WhatsApp, verificar que se acreditó y emitir la factura AFIP automáticamente. Todo eso sin que ninguna persona intervenga.',
  },
  {
    question: '¿Funciona si mi empresa es chica?',
    answer: 'Especialmente para empresas chicas. Una pyme de 5 personas que automatiza las tareas repetitivas opera como si tuviera 10. El punto de partida ideal es cuando sentís que el equipo pasa más tiempo administrando que vendiendo o produciendo.',
  },
  {
    question: '¿Puedo empezar con un solo proceso y agregar más?',
    answer: 'Es la forma más inteligente. Empezamos con el flujo que más duele — facturación, seguimiento de leads, reportes — medimos el resultado y de ahí sumamos más. Sin compromiso de escala forzada ni contratos largos.',
  },
]

// â”€â”€â”€ SUB-COMPONENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
          cursor: 'none',
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

// â”€â”€â”€ MAIN COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function VaultAutomation() {
  const sectionRef = useRef<HTMLElement>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const isInView = useInView(sectionRef, {
    once: true, amount: 0.1,
  })
  const shouldReduceMotion = useReducedMotion()

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

        {/* PRICING TIERS */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 'clamp(48px, 7vh, 80px)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
            <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(245,158,11,0.4)', fontFamily: 'monospace', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>PLANES</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
            {[
              {
                name: 'Básico',
                price: '$199',
                unit: 'USD/mes',
                desc: '1 automatización activa. Ideal para empezar con el flujo que más duele.',
                items: ['WhatsApp + 1 app', 'Flujo configurado y lanzado', 'Monitoreo incluido', 'Soporte por WhatsApp'],
                audience: 'Pymes que quieren validar rápido',
                setup: '4-7 días',
                roi: '60-90 días',
                accentRgb: '245,158,11',
              },
              {
                name: 'Crecimiento',
                price: '$499',
                unit: 'USD/mes',
                desc: '3 o más integraciones activas. Para empresas que quieren automatizar en serio.',
                items: ['3+ integraciones', 'Claude AI conversacional', 'Reportes automáticos', 'Soporte prioritario'],
                audience: 'Equipos con operaciones diarias intensas',
                setup: '7-14 días',
                roi: '45-75 días',
                accentRgb: '249,115,22',
                highlight: true,
              },
              {
                name: 'Escala',
                price: 'A medida',
                unit: '',
                desc: 'Grandes volúmenes, múltiples equipos o flujos complejos. Presupuesto personalizado.',
                items: ['Flujos ilimitados', 'SLA garantizado', 'Integración con ERP/CRM', 'Account manager dedicado'],
                audience: 'Empresas multi-sede o alto volumen',
                setup: '2-5 semanas',
                roi: 'ROI proyectado por flujo',
                accentRgb: '251,146,60',
              },
            ].map((tier) => (
              <motion.div
                key={tier.name}
                whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.012 }}
                transition={{ duration: 0.1, ease: 'linear' }}
                style={{
                  borderRadius: '20px',
                  padding: 'clamp(22px, 2.3vw, 32px)',
                  background: tier.highlight
                    ? `linear-gradient(135deg, rgba(${tier.accentRgb},0.16) 0%, rgba(${tier.accentRgb},0.06) 48%, rgba(96,65,255,0.08) 100%)`
                    : `linear-gradient(145deg, rgba(${tier.accentRgb},0.085) 0%, rgba(${tier.accentRgb},0.03) 55%, rgba(255,255,255,0.01) 100%)`,
                  border: `1px solid rgba(${tier.accentRgb},${tier.highlight ? 0.34 : 0.22})`,
                  boxShadow: tier.highlight
                    ? `0 0 0 1px rgba(${tier.accentRgb},0.22), 0 0 42px rgba(${tier.accentRgb},0.18), 0 14px 32px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.11)`
                    : `0 0 0 1px rgba(${tier.accentRgb},0.1), 0 0 26px rgba(${tier.accentRgb},0.1), 0 10px 26px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)`,
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '430px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  cursor: 'none',
                  transition: 'background 90ms linear, border-color 90ms linear, box-shadow 90ms linear',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: '-35%',
                    background: `conic-gradient(from 240deg at 65% 30%, transparent 0deg, rgba(${tier.accentRgb},0.26) 70deg, transparent 145deg, rgba(114,84,255,0.24) 220deg, transparent 360deg)`,
                    opacity: tier.highlight ? 0.88 : 0.58,
                    filter: 'blur(34px)',
                    pointerEvents: 'none',
                  }}
                />

                {tier.highlight && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, rgba(${tier.accentRgb},1), transparent)` }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', position: 'relative', zIndex: 1 }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: `rgba(${tier.accentRgb},0.86)`, letterSpacing: '0.15em', margin: 0, textTransform: 'uppercase', fontFamily: 'monospace' }}>{tier.name}</p>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: tier.highlight ? '#ffd79a' : 'rgba(255,255,255,0.58)',
                    border: `1px solid rgba(${tier.accentRgb},0.32)`,
                    background: `rgba(${tier.accentRgb},0.12)`,
                    borderRadius: '100px',
                    padding: '3px 9px',
                    textTransform: 'uppercase',
                    fontFamily: 'monospace',
                  }}>
                    {tier.highlight ? 'Recomendado' : 'Plan estable'}
                  </span>
                </div>

                <div style={{ marginBottom: '2px', position: 'relative', zIndex: 1 }}>
                  <span style={{ fontSize: 'clamp(30px, 3.6vw, 44px)', fontWeight: 900, color: 'white', letterSpacing: '-0.035em', fontFamily: 'monospace', lineHeight: 1 }}>{tier.price}</span>
                  {tier.unit && <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginLeft: '7px' }}>{tier.unit}</span>}
                </div>

                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.58)', lineHeight: 1.65, margin: 0, position: 'relative', zIndex: 1 }}>{tier.desc}</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '2px', position: 'relative', zIndex: 1 }}>
                  <div style={{ border: `1px solid rgba(${tier.accentRgb},0.28)`, background: `rgba(${tier.accentRgb},0.13)`, borderRadius: '10px', padding: '8px 10px' }}>
                    <p style={{ margin: '0 0 3px', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', fontFamily: 'monospace' }}>Setup</p>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: `rgba(${tier.accentRgb},0.95)` }}>{tier.setup}</p>
                  </div>
                  <div style={{ border: `1px solid rgba(${tier.accentRgb},0.28)`, background: `rgba(${tier.accentRgb},0.13)`, borderRadius: '10px', padding: '8px 10px' }}>
                    <p style={{ margin: '0 0 3px', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', fontFamily: 'monospace' }}>Retorno</p>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: `rgba(${tier.accentRgb},0.95)` }}>{tier.roi}</p>
                  </div>
                </div>

                <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.36)', fontFamily: 'monospace', position: 'relative', zIndex: 1 }}>
                  Ideal para: <span style={{ color: `rgba(${tier.accentRgb},0.78)` }}>{tier.audience}</span>
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '2px 0 0', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, position: 'relative', zIndex: 1 }}>
                  {tier.items.map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '13px', color: 'rgba(255,255,255,0.67)', lineHeight: 1.45 }}>
                      <span style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, rgba(${tier.accentRgb},0.9), rgba(${tier.accentRgb},0.25))`,
                        boxShadow: `0 0 10px rgba(${tier.accentRgb},0.35)`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#070709',
                        fontSize: '10px',
                        fontWeight: 900,
                        flexShrink: 0,
                      }}>v</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <a
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%20DevelOP%2C%20quiero%20consultar%20el%20plan%20${encodeURIComponent(tier.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      textDecoration: 'none',
                      padding: '11px 14px',
                      borderRadius: '11px',
                      border: `1px solid rgba(${tier.accentRgb},0.36)`,
                      background: `linear-gradient(135deg, rgba(${tier.accentRgb},0.2), rgba(${tier.accentRgb},0.08))`,
                      color: tier.highlight ? '#ffd79a' : `rgba(${tier.accentRgb},0.95)`,
                      fontSize: '11px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      cursor: 'none',
                    }}
                  >
                    Quiero este alcance
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '14px' }}>
            Primera automatización sin costo · Sin contrato largo
          </p>
        </motion.div>

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


