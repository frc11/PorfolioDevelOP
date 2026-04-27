'use client'

import React, { useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  rubro: string
  quote: string
  result: string      // el resultado concreto
  resultValue: string // el número
  color: string
  colorRgb: string
  initials: string
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const testimonials: Testimonial[] = [
  {
    id:0,
    name:'Roberto Álvarez',
    role:'Gerente General',
    company:'Distribuidora Álvarez e Hijos',
    rubro:'Distribuidora · Tucumán',
    quote:'Antes perdíamos pedidos todos los días porque el stock estaba desactualizado. Ahora el sistema lo maneja solo y yo me entero de cualquier problema antes que mis clientes.',
    result:'errores de stock',
    resultValue:'−80%',
    color:'#6366f1',
    colorRgb:'99,102,241',
    initials:'RA',
  },
  {
    id:1,
    name:'Dra. Valeria Sosa',
    role:'Directora Médica',
    company:'Centro Médico Integral Sosa',
    rubro:'Clínica · Tucumán',
    quote:'El sistema de turnos transformó nuestra operación. Las secretarias dejaron de pasar horas al teléfono y los pacientes pueden sacar turno a las 2AM si quieren.',
    result:'llamadas de turno',
    resultValue:'−70%',
    color:'#7b2fff',
    colorRgb:'123,47,255',
    initials:'VS',
  },
  {
    id:2,
    name:'Matías Herrera',
    role:'Dueño',
    company:'Herrera Mayorista',
    rubro:'Comercio Mayorista · Salta',
    quote:'Mis clientes mayoristas ahora hacen sus pedidos solos desde el portal. No tengo que estar tomando pedidos por WhatsApp a las 10PM. Eso solo ya pagó el sistema.',
    result:'pedidos por teléfono',
    resultValue:'0',
    color:'#6366f1',
    colorRgb:'99,102,241',
    initials:'MH',
  },
]

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function AtmosphereProof() {
  return (
    <>
      <div style={{
        position:'absolute',
        top:'-6%', left:'50%',
        transform:'translateX(-50%)',
        width:'920px', height:'520px',
        background:'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, rgba(123,47,255,0.08) 38%, transparent 72%)',
        filter:'blur(95px)',
        pointerEvents:'none',
        zIndex:0,
      }}/>
      <div style={{
        position:'absolute',
        top:'15%', left:'-14%',
        width:'520px', height:'520px',
        background:'conic-gradient(from 210deg, rgba(123,47,255,0.24), rgba(123,47,255,0.03), rgba(99,102,241,0.16), rgba(123,47,255,0.24))',
        filter:'blur(92px)',
        opacity:0.5,
        pointerEvents:'none',
        zIndex:0,
      }}/>
      <div style={{
        position:'absolute',
        top:'22%', right:'-14%',
        width:'500px', height:'500px',
        background:'radial-gradient(circle at 40% 40%, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0.04) 44%, transparent 74%)',
        filter:'blur(90px)',
        opacity:0.72,
        pointerEvents:'none',
        zIndex:0,
      }}/>
      <div style={{
        position:'absolute',
        inset:0,
        background:'linear-gradient(118deg, rgba(123,47,255,0.1) 0%, transparent 32%, rgba(99,102,241,0.12) 54%, transparent 86%)',
        mixBlendMode:'screen',
        opacity:0.75,
        pointerEvents:'none',
        zIndex:0,
      }}/>
    </>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  return (
    <div style={{
      textAlign: 'center',
      marginBottom: 'clamp(40px, 5vh, 56px)',
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
        [ CLIENTES DEL NOA ]
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
        Lo que dicen los que ya
        <br/>
        <span style={{ color:'#6366f1' }}>
          "lo tienen funcionando."
        </span>
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
        No son demos. Son sistemas en producción en empresas reales.
      </motion.p>
    </div>
  )
}

function TestimonialCard({
  t, isInView, delay,
}: {
  t: Testimonial
  isInView: boolean
  delay: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity:0, y:24 }}
      animate={isInView
        ? { opacity:1, y:0 } : {}}
      transition={{
        opacity: { duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] },
        y: { duration: 0 }
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -5, transition: { duration: 0 } }}
      style={{
        background:`linear-gradient(135deg, rgba(${t.colorRgb},0.06) 0%, rgba(255,255,255,0.02) 100%)`,
        border: `1px solid rgba(${t.colorRgb},${hovered ? 0.28 : 0.15})`,
        borderRadius:'20px',
        padding:'clamp(24px,3vw,36px)',
        position:'relative',
        overflow:'hidden',
        display:'flex',
        flexDirection:'column',
        gap:'20px',
        backdropFilter: 'blur(10px)',
        boxShadow: hovered
          ? `inset 0 -100px 120px rgba(${t.colorRgb},0.12), 0 18px 44px rgba(0,0,0,0.45)`
          : 'inset 0 -40px 60px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.28)',
        transition: 'none',
      }}
    >
      {/* Glow de fondo instantaneo */}
      <div style={{
        position:'absolute',
        left:'-10%',
        right:'-10%',
        bottom:'-30%',
        height:'65%',
        background:`radial-gradient(ellipse at 50% 100%, rgba(${t.colorRgb},${hovered ? 0.24 : 0}) 0%, transparent 70%)`,
        filter:'blur(26px)',
        opacity: hovered ? 1 : 0,
        transition:'none',
        pointerEvents:'none',
        zIndex:0,
      }}/>

      {/* Borde superior acento */}
      <div style={{
        position:'absolute',
        top:0, left:0, right:0,
        height:'2px',
        background:`linear-gradient(90deg, transparent, rgba(${t.colorRgb},0.7) 40%, rgba(${t.colorRgb},0.7) 60%, transparent)`,
      }}/>

      {/* Comillas decorativas */}
      <div style={{
        position:'absolute',
        top:'16px', right:'20px',
        fontSize:'80px',
        lineHeight:1,
        color:`rgba(${t.colorRgb},0.06)`,
        fontFamily:'Georgia, serif',
        fontWeight:900,
        userSelect:'none',
        pointerEvents:'none',
      }}>
        "
      </div>

      {/* Quote */}
      <p style={{
        fontSize:'clamp(14px,1.5vw,16px)',
        lineHeight:1.75,
        color:'rgba(255,255,255,0.65)',
        margin:0,
        fontStyle:'italic',
        position:'relative',
        zIndex:2,
      }}>
        "{t.quote}"
      </p>

      {/* Resultado destacado */}
      <div style={{
        display:'inline-flex',
        alignItems:'center',
        gap:'10px',
        background: `rgba(${t.colorRgb},0.08)`,
        border: `1px solid rgba(${t.colorRgb},0.2)`,
        borderRadius:'12px',
        padding:'10px 16px',
        alignSelf:'flex-start',
        position:'relative',
        zIndex:2,
      }}>
        <span style={{
          fontSize:'24px',
          fontWeight:900,
          color:t.color,
          fontFamily:'monospace',
        }}>
          {t.resultValue}
        </span>
        <span style={{
          fontSize:'12px',
          color:'rgba(255,255,255,0.45)',
        }}>
          {t.result}
        </span>
      </div>

      {/* Autor */}
      <div style={{
        display:'flex',
        alignItems:'center',
        gap:'12px',
        paddingTop:'16px',
        marginTop: 'auto',
        borderTop: `1px solid rgba(${t.colorRgb},0.1)`,
        position:'relative',
        zIndex:2,
      }}>
        {/* Avatar con iniciales */}
        <div style={{
          width:'44px', height:'44px',
          borderRadius:'50%',
          background:`linear-gradient(135deg, rgb(${t.colorRgb}), rgba(${t.colorRgb},0.5))`,
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          fontSize:'14px',
          fontWeight:800,
          color:'white',
          flexShrink:0,
          letterSpacing:'0.05em',
        }}>
          {t.initials}
        </div>
        <div>
          <p style={{
            fontSize:'14px',
            fontWeight:700,
            color:'white',
            margin:'0 0 2px',
          }}>
            {t.name}
          </p>
          <p style={{
            fontSize:'12px',
            color: `rgba(${t.colorRgb},0.7)`,
            margin:'0 0 1px',
          }}>
            {t.role} · {t.company}
          </p>
          <p style={{
            fontSize:'11px',
            color:'rgba(255,255,255,0.25)',
            margin:0,
          }}>
            {t.rubro}
          </p>
        </div>
      </div>

    </motion.div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function SocialProofSoftware() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, {
    once:true, amount:0.1,
  })

  return (
    <section
      ref={sectionRef}
      style={{
        padding:'clamp(80px,12vh,140px) clamp(20px,5vw,80px)',
        backgroundColor:'#060816',
        backgroundImage:`
          radial-gradient(120% 110% at 50% -20%, rgba(99,102,241,0.34) 0%, rgba(9,10,27,0.8) 52%, rgba(6,8,22,1) 100%),
          linear-gradient(122deg, rgba(123,47,255,0.16) 0%, transparent 34%, rgba(99,102,241,0.13) 56%, transparent 100%),
          repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 84px),
          repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 84px)
        `,
        position:'relative',
        overflow:'hidden',
      }}
    >
      <AtmosphereProof />
      <div style={{
        maxWidth:'1100px',
        margin:'0 auto',
        position:'relative',
        zIndex:1,
      }}>
        <Header isInView={isInView} />
        <div style={{
          display:'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap:'clamp(14px,2vw,20px)',
        }}>
          {testimonials.map((t,i) => (
            <TestimonialCard
              key={t.id}
              t={t}
              isInView={isInView}
              delay={0.25 + i*0.12}
            />
          ))}
        </div>

        {/* RATING GLOBAL */}
        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={isInView ? { opacity:1, y:0 } : {}}
          transition={{ duration:0.7, delay:0.7 }}
          className="rating-global-container"
          style={{
            marginTop:'clamp(32px,5vh,52px)',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            gap:'clamp(24px,4vw,48px)',
            padding:'clamp(20px,3vw,32px)',
            background:'rgba(255,255,255,0.02)',
            border:'1px solid rgba(255,255,255,0.06)',
            borderRadius:'16px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Estrellas */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
            <div style={{ display:'flex', gap:'3px' }}>
              {'★★★★★'.split('').map((s,i) => (
                <span key={i} style={{ fontSize:'24px', color:'#f59e0b' }}>{s}</span>
              ))}
            </div>
            <span style={{ fontSize:'28px', fontWeight:900, color:'white', lineHeight:1 }}>5.0</span>
            <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', letterSpacing:'0.1em' }}>SATISFACCIÓN PROMEDIO</span>
          </div>

          <div className="stat-divider" style={{ width:'1px', height:'60px', background:'rgba(255,255,255,0.08)' }}/>

          {/* Proyectos */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
            <span style={{ fontSize:'36px', fontWeight:900, color:'#6366f1', lineHeight:1, fontFamily:'monospace' }}>38+</span>
            <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', letterSpacing:'0.1em' }}>PROYECTOS ENTREGADOS</span>
          </div>

          <div className="stat-divider" style={{ width:'1px', height:'60px', background:'rgba(255,255,255,0.08)' }}/>

          {/* Años */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
            <span style={{ fontSize:'36px', fontWeight:900, color:'#7b2fff', lineHeight:1, fontFamily:'monospace' }}>4+</span>
            <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', letterSpacing:'0.1em' }}>AÑOS EN EL MERCADO NOA</span>
          </div>

          <div className="stat-divider" style={{ width:'1px', height:'60px', background:'rgba(255,255,255,0.08)' }}/>

          {/* Uptime */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
            <span style={{ fontSize:'36px', fontWeight:900, color:'#6366f1', lineHeight:1, fontFamily:'monospace' }}>99.9%</span>
            <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', letterSpacing:'0.1em' }}>UPTIME PROMEDIO</span>
          </div>
        </motion.div>

        {/* SEPARADOR FINAL */}
        <motion.div
          initial={{ scaleX:0 }}
          animate={isInView ? { scaleX:1 } : {}}
          transition={{ duration:1.2, delay:0.9 }}
          style={{
            height:'1px',
            background:'linear-gradient(90deg, transparent, rgba(99,102,241,0.3) 30%, rgba(123,47,255,0.4) 50%, rgba(99,102,241,0.3) 70%, transparent)',
            transformOrigin:'left center',
            marginTop:'clamp(48px,6vh,72px)',
          }}
        />
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .rating-global-container {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 24px !important;
          }
          .stat-divider {
            display: none !important;
          }
        }
      `}</style>
    </section>
  )
}
