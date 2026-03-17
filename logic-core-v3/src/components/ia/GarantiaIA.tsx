'use client'

import React, { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

/**
 * GARANTIA IA: "Inteligencia Controlada"
 * Sección táctica para eliminar el miedo a las alucinaciones y falta de control.
 */

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface GuardrailFeature {
  icon: string
  title: string
  description: string
}

// ─── DATA ───────────────────────────────────────────────────────────────────

const features: GuardrailFeature[] = [
  {
    icon: '📚',
    title: 'Solo responde lo que vos definís',
    description: 'La IA solo conoce lo que le enseñás: tus precios, tus productos, tus políticas. No puede inventar información que no existe en tu negocio.',
  },
  {
    icon: '🔀',
    title: 'Deriva automática a humanos',
    description: 'Si la consulta supera su conocimiento, transfiere la conversación a tu equipo al instante. Sin que el cliente note la diferencia.',
  },
  {
    icon: '📋',
    title: 'Todo queda registrado',
    description: 'Cada conversación queda guardada. Podés revisar qué dijo la IA en cualquier momento y corregir si algo no está bien.',
  },
  {
    icon: '🔧',
    title: 'Control total en tus manos',
    description: 'Actualizás los datos de tu negocio cuando quieras y la IA incorpora los cambios en minutos. Vos decidís qué sabe y qué no.',
  },
]

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function AtmosphereGarantia() {
  return (
    <>
      <div 
        aria-hidden="true"
        style={{
          position:'absolute',
          top:'10%', left:'50%',
          transform:'translateX(-50%)',
          width:'700px', height:'400px',
          background:'radial-gradient(ellipse, rgba(0,255,136,0.05) 0%, rgba(123,47,255,0.03) 40%, transparent 65%)',
          filter:'blur(90px)',
          pointerEvents:'none',
          zIndex:0,
        }}
      />
      <div 
        aria-hidden="true"
        style={{
          position:'absolute',
          top:'20%', right:'-5%',
          width:'350px', height:'400px',
          background:'radial-gradient(ellipse, rgba(123,47,255,0.05) 0%, transparent 60%)',
          filter:'blur(80px)',
          pointerEvents:'none',
          zIndex:0,
        }}
      />
    </>
  )
}

function LeftPanel({ isInView }: { isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity:0, x:-32 }}
      animate={isInView ? { opacity:1, x:0 } : {}}
      transition={{ duration:0.8, delay:0.2, ease:[0.16,1,0.3,1] }}
    >
      {/* Badge */}
      <motion.div
        initial={{ opacity:0, y:-10 }}
        animate={isInView ? { opacity:1, y:0 } : {}}
        transition={{ delay:0.1 }}
        style={{
          display:'inline-flex',
          alignItems:'center',
          gap:'8px',
          border:'1px solid rgba(0,255,136,0.3)',
          borderRadius:'100px',
          padding:'6px 16px',
          marginBottom:'24px',
          background:'rgba(0,255,136,0.06)',
        }}
      >
        <div style={{
          width:'6px', height:'6px',
          borderRadius:'50%',
          background:'#00ff88',
          boxShadow:'0 0 8px rgba(0,255,136,0.8)',
        }}/>
        <span style={{
          fontSize:'11px',
          letterSpacing:'0.25em',
          color:'#00ff88',
          fontWeight:600,
        }}>
          INTELIGENCIA CONTROLADA
        </span>
      </motion.div>

      {/* Título */}
      <h2 style={{
        fontSize:'clamp(28px,4vw,52px)',
        fontWeight:900,
        lineHeight:1.1,
        letterSpacing:'-0.02em',
        margin:'0 0 16px',
      }}>
        <span style={{ color:'white' }}>Cero alucinaciones.</span>
        <br/>
        <span style={{
          background: 'linear-gradient(135deg, #00ff88, #7b2fff)',
          WebkitBackgroundClip:'text',
          WebkitTextFillColor:'transparent',
          backgroundClip:'text',
        }}>
          Control total.
        </span>
      </h2>

      {/* Descripción */}
      <p style={{
        fontSize:'clamp(14px,1.6vw,17px)',
        color:'rgba(255,255,255,0.5)',
        lineHeight:1.75,
        margin:'0 0 clamp(28px,4vh,40px)',
        maxWidth:'480px',
      }}>
        Nuestros agentes no inventan respuestas. Los encapsulamos con reglas estrictas 
        para que solo hablen en base a{' '}
        <span style={{ color:'white' }}>tus manuales, tus precios y tus políticas.</span>
        {' '}Nada más.
      </p>

      {/* Features list */}
      <div style={{
        display:'flex',
        flexDirection:'column',
        gap:'16px',
      }}>
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity:0, x:-16 }}
            animate={isInView ? { opacity:1, x:0 } : {}}
            transition={{
              delay:0.35 + i*0.09,
              duration:0.5,
              ease:[0.16,1,0.3,1],
            }}
            style={{
              display:'flex',
              gap:'14px',
              alignItems:'flex-start',
            }}
          >
            {/* Ícono */}
            <div style={{
              width:'40px', height:'40px',
              borderRadius:'10px',
              background: 'rgba(0,255,136,0.08)',
              border: '1px solid rgba(0,255,136,0.18)',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              fontSize:'18px',
              flexShrink:0,
            }}>
              {f.icon}
            </div>

            <div>
              <p style={{
                fontSize:'14px',
                fontWeight:700,
                color:'white',
                margin:'0 0 3px',
              }}>
                {f.title}
              </p>
              <p style={{
                fontSize:'13px',
                color:'rgba(255,255,255,0.4)',
                margin:0,
                lineHeight:1.55,
              }}>
                {f.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function RightPanel({ isInView }: { isInView: boolean }) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity:0, scale:0.9 }}
      animate={isInView ? { opacity:1, scale:1 } : {}}
      transition={{ duration:0.9, delay:0.3, ease:[0.16,1,0.3,1] }}
      style={{
        position:'relative',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        minHeight:'420px',
      }}
    >
      {/* Glow central */}
      <div style={{
        position:'absolute',
        width:'300px', height:'300px',
        borderRadius:'50%',
        background:'radial-gradient(circle, rgba(0,255,136,0.12) 0%, rgba(123,47,255,0.06) 50%, transparent 70%)',
        filter:'blur(30px)',
        zIndex:0,
      }}/>

      {/* SVG del escudo */}
      <svg
        width="320" height="320"
        viewBox="0 0 320 320"
        style={{
          position:'relative',
          zIndex:1,
          overflow:'visible',
        }}
      >
        {/* Anillos concéntricos */}
        {[140, 110, 80].map((r, i) => (
          <circle
            key={i}
            cx="160" cy="160"
            r={r}
            fill="none"
            stroke={`rgba(0,255,136,${0.08 - i*0.02})`}
            strokeWidth="1"
            strokeDasharray="4 8"
            style={{
              animation: reduced ? 'none' : `rotateSlow ${20 + i*8}s linear infinite ${i%2===0 ? '' : 'reverse'}`,
              transformOrigin: 'center',
            }}
          />
        ))}

        {/* Círculo principal del escudo */}
        <circle
          cx="160" cy="160" r="64"
          fill="rgba(0,255,136,0.06)"
          stroke="rgba(0,255,136,0.35)"
          strokeWidth="1.5"
        />

        {/* Glow del círculo */}
        <circle
          cx="160" cy="160" r="64"
          fill="none"
          stroke="rgba(0,255,136,0.15)"
          strokeWidth="8"
          style={{ filter:'blur(4px)' }}
        />

        {/* Candado SVG en el centro */}
        <g transform="translate(136, 134)">
          <rect
            x="4" y="22" width="40" height="30"
            rx="4"
            fill="rgba(0,255,136,0.15)"
            stroke="rgba(0,255,136,0.7)"
            strokeWidth="2"
          />
          <path
            d="M12 22 V16 A12 12 0 0 1 36 16 V22"
            fill="none"
            stroke="rgba(0,255,136,0.7)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle
            cx="24" cy="33"
            r="5"
            fill="rgba(0,255,136,0.3)"
            stroke="rgba(0,255,136,0.8)"
            strokeWidth="1.5"
          />
          <line
            x1="24" y1="38"
            x2="24" y2="44"
            stroke="rgba(0,255,136,0.8)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Puntos en los anillos */}
        {[0, 72, 144, 216, 288].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const x = 160 + 110 * Math.cos(rad)
          const y = 160 + 110 * Math.sin(rad)
          return (
            <circle
              key={i}
              cx={x} cy={y} r="4"
              fill="rgba(0,255,136,0.6)"
              style={{
                filter: 'drop-shadow(0 0 4px rgba(0,255,136,0.8))',
              }}
            />
          )
        })}
      </svg>

      {/* Labels flotantes */}
      {[
        { text:'Tus reglas', top:'10%', left:'5%' },
        { text:'Tus precios', top:'10%', right:'5%' },
        { text:'Sin inventar', bottom:'15%', left:'5%' },
        { text:'Deriva a humanos', bottom:'15%', right:'5%' },
      ].map((label, i) => (
        <motion.div
          key={i}
          initial={{ opacity:0, scale:0.8 }}
          animate={isInView ? { opacity:1, scale:1 } : {}}
          transition={{ delay:0.6 + i*0.1, duration:0.4 }}
          style={{
            position:'absolute',
            top: label.top,
            bottom: label.bottom,
            left: label.left,
            right: label.right,
            background: 'rgba(0,0,0,0.7)',
            border: '1px solid rgba(0,255,136,0.2)',
            borderRadius:'100px',
            padding:'5px 12px',
            fontSize:'11px',
            fontWeight:600,
            color:'rgba(0,255,136,0.8)',
            backdropFilter:'blur(8px)',
            animation: reduced ? 'none' : `floatLabel ${3+i*0.5}s ease-in-out ${i*0.3}s infinite alternate`,
          }}
        >
          ✓ {label.text}
        </motion.div>
      ))}
    </motion.div>
  )
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export default function GarantiaIA() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

  return (
    <section
      ref={sectionRef}
      style={{
        padding: 'clamp(80px,12vh,140px) clamp(20px,5vw,80px)',
        background: '#080810',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      <AtmosphereGarantia />
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Layout 2 columnas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(40px,6vw,80px)',
          alignItems: 'center',
        }}>
          <LeftPanel isInView={isInView} />
          <RightPanel isInView={isInView} />
        </div>
      </div>
    </section>
  )
}
