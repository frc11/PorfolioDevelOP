'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react'

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface RubroData {
  id: string
  icon: string
  label: string
  color: string
  colorRgb: string
  headline: string
  problema: string
  solucion: string
  resultado: string
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const rubros: RubroData[] = [
  {
    id: 'concesionaria',
    icon: '🚗',
    label: 'Concesionaria',
    color: '#6366f1',
    colorRgb: '99,102,241',
    headline: 'Tu concesionaria abierta los 365 días del año',
    problema: 'Clientes que buscan tu catálogo el domingo y no encuentran nada actualizado.',
    solucion: 'Web con catálogo completo, filtros de búsqueda y formulario de consulta que avisa por WhatsApp al instante.',
    resultado: 'Más consultas sin que nadie atienda el teléfono fuera de horario.',
  },
  {
    id: 'clinica',
    icon: '🏥',
    label: 'Clínica',
    color: '#22c55e',
    colorRgb: '34,197,94',
    headline: 'Tu clínica consigue pacientes mientras atendés',
    problema: 'Pacientes que no encuentran tu teléfono y sacan turno en el competidor.',
    solucion: 'Web que muestra horarios, especialidades y permite sacar turno online en cualquier momento.',
    resultado: 'Menos llamadas perdidas, más turnos confirmados.',
  },
  {
    id: 'gimnasio',
    icon: '💪',
    label: 'Gimnasio',
    color: '#f59e0b',
    colorRgb: '245,158,11',
    headline: 'Tu gimnasio capta alumnos mientras das clases',
    problema: 'Gente interesada que no sabe tus precios ni los horarios y se va sin inscribirse.',
    solucion: 'Web con horarios en tiempo real, precios claros y botón de inscripción directo.',
    resultado: 'Más alumnos que llegan decididos, menos tiempo explicando lo mismo.',
  },
  {
    id: 'restaurante',
    icon: '🍽',
    label: 'Restaurante',
    color: '#f97316',
    colorRgb: '249,115,22',
    headline: 'Tu restaurante llena mesas sin contestar el teléfono',
    problema: 'Clientes que buscan tu carta en Google y encuentran fotos viejas de terceros.',
    solucion: 'Web con carta actualizada, reservas online y ubicación fácil de encontrar.',
    resultado: 'Más reservas y menos clientes que llegan sin avisar.',
  },
  {
    id: 'inmobiliaria',
    icon: '🏢',
    label: 'Inmobiliaria',
    color: '#0ea5e9',
    colorRgb: '14,165,233',
    headline: 'Tu inmobiliaria trabaja mientras cerrás operaciones',
    problema: 'Propiedades que no se ven porque solo existen en Instagram.',
    solucion: 'Web con catálogo de propiedades, filtros y consulta directa por cada propiedad.',
    resultado: 'Más gente que te encuentra antes de llamar a la competencia.',
  },
]

// ─── MOCKUP COMPONENTS ────────────────────────────────────────────────────────

function MockupConcesionaria({ colorRgb }: { colorRgb: string }) {
  const cars = [
    { name: 'Toyota Hilux', year: '2024', km: '0 km' },
    { name: 'Ford Ranger', year: '2023', km: '18.000 km' },
    { name: 'VW Amarok', year: '2024', km: '0 km' },
    { name: 'Chevrolet S10', year: '2022', km: '45.000 km' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
      {cars.map((car, i) => (
        <div key={i} style={{
          background: `rgba(${colorRgb},0.06)`,
          border: `1px solid rgba(${colorRgb},0.18)`,
          borderRadius: '8px',
          padding: '10px 12px',
        }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🚗</div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'white', margin: '0 0 2px', lineHeight: 1.3 }}>{car.name}</p>
          <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', margin: '0 0 8px' }}>{car.year} · {car.km}</p>
          <div style={{
            fontSize: '9px', color: `rgb(${colorRgb})`, fontWeight: 600,
            background: `rgba(${colorRgb},0.1)`, borderRadius: '4px',
            padding: '3px 7px', display: 'inline-block',
          }}>Ver más →</div>
        </div>
      ))}
    </div>
  )
}

function MockupClinica({ colorRgb }: { colorRgb: string }) {
  const slots = ['09:00', '10:30', '14:00', '15:30', '17:00']
  return (
    <div>
      <div style={{
        background: `rgba(${colorRgb},0.08)`, border: `1px solid rgba(${colorRgb},0.2)`,
        borderRadius: '10px', padding: '12px 14px', marginBottom: '10px',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
          background: `rgba(${colorRgb},0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px',
        }}>👩‍⚕️</div>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'white', margin: 0 }}>Dra. García</p>
          <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Medicina General · Hoy disponible</p>
        </div>
      </div>
      <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', margin: '0 0 6px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Horarios disponibles</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
        {slots.map((s, i) => (
          <div key={i} style={{
            fontSize: '10px', fontWeight: 600, color: i === 1 ? `rgb(${colorRgb})` : 'rgba(255,255,255,0.5)',
            background: i === 1 ? `rgba(${colorRgb},0.15)` : 'rgba(255,255,255,0.04)',
            border: `1px solid ${i === 1 ? `rgba(${colorRgb},0.4)` : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '6px', padding: '4px 10px',
          }}>{s}</div>
        ))}
      </div>
      <div style={{
        background: `rgba(${colorRgb},0.15)`, border: `1px solid rgba(${colorRgb},0.35)`,
        borderRadius: '8px', padding: '9px', textAlign: 'center',
        fontSize: '11px', fontWeight: 700, color: `rgb(${colorRgb})`,
      }}>Confirmar turno →</div>
    </div>
  )
}

function MockupGimnasio({ colorRgb }: { colorRgb: string }) {
  const clases = [
    { name: 'CrossFit', time: 'Lun/Mié/Vie — 07:00', spots: '3 lugares libres' },
    { name: 'Funcional', time: 'Mar/Jue — 18:30', spots: '8 lugares libres' },
    { name: 'Pilates', time: 'Mié/Vie — 10:00', spots: 'Completo' },
    { name: 'Spinning', time: 'Todos los días — 07:30', spots: '5 lugares libres' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {clases.map((c, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '8px', padding: '8px 12px',
        }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'white', margin: 0 }}>{c.name}</p>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{c.time}</p>
          </div>
          <div style={{
            fontSize: '9px', fontWeight: 600,
            color: c.spots === 'Completo' ? 'rgba(239,68,68,0.7)' : `rgb(${colorRgb})`,
            background: c.spots === 'Completo' ? 'rgba(239,68,68,0.08)' : `rgba(${colorRgb},0.1)`,
            border: `1px solid ${c.spots === 'Completo' ? 'rgba(239,68,68,0.2)' : `rgba(${colorRgb},0.25)`}`,
            borderRadius: '5px', padding: '3px 8px', flexShrink: 0,
          }}>
            {c.spots === 'Completo' ? 'Completo' : 'Inscribirse'}
          </div>
        </div>
      ))}
    </div>
  )
}

function MockupRestaurante({ colorRgb }: { colorRgb: string }) {
  const platos = [
    { icon: '🥩', name: 'Bife de chorizo', desc: 'Con papas fritas', precio: '$6.800' },
    { icon: '🍝', name: 'Spaghetti Bolognesa', desc: 'Salsa casera', precio: '$4.200' },
    { icon: '🥗', name: 'Ensalada César', desc: 'Con pollo grillado', precio: '$3.500' },
  ]
  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        {['Entradas', 'Principales', 'Postres'].map((cat, i) => (
          <div key={i} style={{
            fontSize: '9px', fontWeight: 700,
            color: i === 1 ? `rgb(${colorRgb})` : 'rgba(255,255,255,0.35)',
            background: i === 1 ? `rgba(${colorRgb},0.12)` : 'transparent',
            border: `1px solid ${i === 1 ? `rgba(${colorRgb},0.3)` : 'rgba(255,255,255,0.07)'}`,
            borderRadius: '20px', padding: '4px 10px',
          }}>{cat}</div>
        ))}
      </div>
      {platos.map((p, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 0', borderBottom: i < platos.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}>
          <span style={{ fontSize: '20px' }}>{p.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'white', margin: 0 }}>{p.name}</p>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{p.desc}</p>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: `rgb(${colorRgb})` }}>{p.precio}</span>
        </div>
      ))}
      <div style={{
        marginTop: '10px', background: `rgba(${colorRgb},0.12)`,
        border: `1px solid rgba(${colorRgb},0.3)`, borderRadius: '8px',
        padding: '8px', textAlign: 'center', fontSize: '11px', fontWeight: 700,
        color: `rgb(${colorRgb})`,
      }}>Reservar mesa →</div>
    </div>
  )
}

function MockupInmobiliaria({ colorRgb }: { colorRgb: string }) {
  const props = [
    { icon: '🏠', tipo: 'Casa en venta', loc: 'Palermo, CABA', precio: 'USD 185.000', m2: '120 m²' },
    { icon: '🏢', tipo: 'Dpto en alquiler', loc: 'Belgrano, CABA', precio: '$450.000/mes', m2: '65 m²' },
  ]
  return (
    <div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        {['Todas', 'Venta', 'Alquiler', 'Casas'].map((f, i) => (
          <div key={i} style={{
            fontSize: '9px', fontWeight: 600,
            color: i === 0 ? `rgb(${colorRgb})` : 'rgba(255,255,255,0.35)',
            background: i === 0 ? `rgba(${colorRgb},0.1)` : 'transparent',
            border: `1px solid ${i === 0 ? `rgba(${colorRgb},0.25)` : 'rgba(255,255,255,0.07)'}`,
            borderRadius: '20px', padding: '3px 9px',
          }}>{f}</div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {props.map((p, i) => (
          <div key={i} style={{
            background: `rgba(${colorRgb},0.05)`,
            border: `1px solid rgba(${colorRgb},0.15)`,
            borderRadius: '10px', padding: '12px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '8px', flexShrink: 0,
              background: `rgba(${colorRgb},0.15)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px',
            }}>{p.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'white', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.tipo}</p>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', margin: '0 0 4px' }}>{p.loc} · {p.m2}</p>
              <p style={{ fontSize: '11px', fontWeight: 700, color: `rgb(${colorRgb})`, margin: 0 }}>{p.precio}</p>
            </div>
            <div style={{
              fontSize: '9px', fontWeight: 600, color: `rgb(${colorRgb})`,
              background: `rgba(${colorRgb},0.1)`, border: `1px solid rgba(${colorRgb},0.25)`,
              borderRadius: '6px', padding: '4px 8px', flexShrink: 0,
            }}>Ver →</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RubroMockup({ rubro }: { rubro: RubroData }) {
  const mockups: Record<string, React.ReactNode> = {
    concesionaria: <MockupConcesionaria colorRgb={rubro.colorRgb} />,
    clinica: <MockupClinica colorRgb={rubro.colorRgb} />,
    gimnasio: <MockupGimnasio colorRgb={rubro.colorRgb} />,
    restaurante: <MockupRestaurante colorRgb={rubro.colorRgb} />,
    inmobiliaria: <MockupInmobiliaria colorRgb={rubro.colorRgb} />,
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(${rubro.colorRgb},0.08)`,
    }}>
      {/* macOS bar */}
      <div style={{
        padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'rgba(255,255,255,0.025)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
          <div key={i} style={{ width: '9px', height: '9px', borderRadius: '50%', background: c, opacity: 0.7 }} />
        ))}
        <div style={{
          flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '4px',
          padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '6px',
          maxWidth: '260px', margin: '0 auto',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: rubro.color, flexShrink: 0 }} />
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
            tu{rubro.id}.com.ar
          </span>
        </div>
      </div>
      {/* Content */}
      <div style={{ padding: '16px' }}>
        {mockups[rubro.id]}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function WebDevelopmentByRubro() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 })
  const shouldReduceMotion = useReducedMotion()
  const [activeRubro, setActiveRubro] = useState(0)

  const rubro = rubros[activeRubro]

  return (
    <section
      ref={sectionRef}
      style={{
        padding: 'clamp(80px, 12vh, 140px) clamp(20px, 5vw, 80px)',
        background: '#070709',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Atmosphere */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(0,229,255,0.05) 0%, transparent 65%)',
        filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 'clamp(40px, 5vh, 60px)' }}>
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              border: '1px solid rgba(0,229,255,0.25)', borderRadius: '100px',
              padding: '4px 14px', marginBottom: '20px', background: 'rgba(0,229,255,0.05)',
            }}
          >
            <span style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#00e5ff', fontWeight: 700 }}>
              [ TU WEB, TU INDUSTRIA ]
            </span>
          </motion.div>

          <motion.h2
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            style={{
              fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900,
              color: 'white', lineHeight: 1.1, margin: '0 0 16px',
            }}
          >
            Una web que trabaja<br />
            <span style={{ color: '#00e5ff' }}>para tu negocio específico.</span>
          </motion.h2>

          <motion.p
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.38 }}
            style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', margin: 0, maxWidth: '560px' }}
          >
            Elegí tu rubro y mirá cómo solucionamos el problema concreto de tu industria.
          </motion.p>
        </div>

        {/* Rubro Tabs */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 'clamp(32px, 4vh, 48px)' }}
        >
          {rubros.map((r, i) => {
            const isActive = activeRubro === i
            return (
              <motion.button
                key={r.id}
                onClick={() => setActiveRubro(i)}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 18px', borderRadius: '100px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 700,
                  transition: 'all 250ms ease',
                  background: isActive ? `rgba(${r.colorRgb},0.15)` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isActive ? `rgba(${r.colorRgb},0.45)` : 'rgba(255,255,255,0.1)'}`,
                  color: isActive ? r.color : 'rgba(255,255,255,0.4)',
                  boxShadow: isActive ? `0 0 20px rgba(${r.colorRgb},0.15)` : 'none',
                } as React.CSSProperties}
              >
                <span>{r.icon}</span>
                <span>{r.label}</span>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Content Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRubro}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: 'clamp(28px, 4vw, 64px)',
              alignItems: 'center',
            }}
          >
            {/* Left — Copy */}
            <div>
              {/* Tag */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: `rgba(${rubro.colorRgb},0.1)`,
                border: `1px solid rgba(${rubro.colorRgb},0.3)`,
                borderRadius: '100px', padding: '4px 14px', marginBottom: '20px',
              }}>
                <span style={{ fontSize: '14px' }}>{rubro.icon}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: rubro.color, letterSpacing: '0.15em' }}>
                  {rubro.label.toUpperCase()}
                </span>
              </div>

              {/* Headline */}
              <h3 style={{
                fontSize: 'clamp(22px, 3vw, 36px)',
                fontWeight: 900, color: 'white', lineHeight: 1.15,
                margin: '0 0 clamp(20px, 2.5vh, 28px)',
              }}>
                {rubro.headline}
              </h3>

              {/* Problema */}
              <div style={{
                display: 'flex', gap: '10px', alignItems: 'flex-start',
                padding: '12px 14px', borderRadius: '10px', marginBottom: '14px',
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
              }}>
                <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>😓</span>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(239,68,68,0.7)', letterSpacing: '0.15em', margin: '0 0 4px', textTransform: 'uppercase' }}>
                    El problema
                  </p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.55 }}>
                    {rubro.problema}
                  </p>
                </div>
              </div>

              {/* Solución */}
              <div style={{
                display: 'flex', gap: '10px', alignItems: 'flex-start',
                padding: '12px 14px', borderRadius: '10px', marginBottom: '14px',
                background: `rgba(${rubro.colorRgb},0.06)`, border: `1px solid rgba(${rubro.colorRgb},0.18)`,
              }}>
                <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✅</span>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: rubro.color, letterSpacing: '0.15em', margin: '0 0 4px', textTransform: 'uppercase' }}>
                    La solución
                  </p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.55 }}>
                    {rubro.solucion}
                  </p>
                </div>
              </div>

              {/* Resultado */}
              <div style={{
                display: 'flex', gap: '8px', alignItems: 'center',
                padding: '10px 14px', borderRadius: '10px', marginBottom: '28px',
                background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
              }}>
                <span style={{ fontSize: '14px' }}>📈</span>
                <p style={{ fontSize: '13px', color: 'rgba(34,197,94,0.85)', fontWeight: 600, margin: 0 }}>
                  {rubro.resultado}
                </p>
              </div>

              {/* CTA */}
              <motion.a
                href="#vault-section"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: `rgba(${rubro.colorRgb},0.15)`,
                  border: `1px solid rgba(${rubro.colorRgb},0.4)`,
                  color: rubro.color,
                  fontWeight: 700, fontSize: '13px',
                  padding: '12px 24px', borderRadius: '100px',
                  textDecoration: 'none',
                  transition: 'all 200ms',
                }}
              >
                Quiero mi web de {rubro.label.toLowerCase()} →
              </motion.a>
            </div>

            {/* Right — Mockup */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <RubroMockup rubro={rubro} />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Final Separator */}
        <motion.div
          initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.25) 30%, rgba(0,229,255,0.35) 50%, rgba(0,229,255,0.25) 70%, transparent)',
            transformOrigin: 'left center',
            marginTop: 'clamp(48px, 7vh, 80px)',
          }}
        />
      </div>
    </section>
  )
}
