'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react'

// ─── TYPES ───────────────────────────────────────────────────────────────────

type StepId = 'rubro' | 'problema' | 'equipo'

type DiagnosticoId =
  | 'gestion-integral'
  | 'crm-ventas'
  | 'automatizacion-procesos'
  | 'sistema-stock'
  | 'portal-clientes'
  | 'erp-personalizado'

interface DiagnosticoOption {
  id: string
  label: string
  icon: string
  description?: string
}

interface DiagnosticoStep {
  id: StepId
  question: string
  subquestion: string
  options: DiagnosticoOption[]
  multiSelect: boolean
}

interface DiagnosticoResult {
  id: DiagnosticoId
  title: string
  subtitle: string
  description: string
  timeEstimate: string
  priceRange: string
  features: string[]
  color: string
  colorRgb: string
  icon: string
  ctaText: string
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const steps: DiagnosticoStep[] = [
  {
    id: 'rubro',
    question: '¿A qué se dedica tu empresa?',
    subquestion: 'Elegí el que más se parezca a tu negocio.',
    multiSelect: false,
    options: [
      { id: 'comercio', icon: '🏪', label: 'Comercio / Distribuidora', description: 'Venta de productos, stock, pedidos' },
      { id: 'salud', icon: '🏥', label: 'Salud / Clínica', description: 'Turnos, historias clínicas, facturación médica' },
      { id: 'servicios', icon: '⚙️', label: 'Servicios / Consultora', description: 'Proyectos, facturación, gestión de clientes' },
      { id: 'gastronomia', icon: '🍽', label: 'Gastronomía', description: 'Pedidos, stock, delivery, cajas' },
      { id: 'inmobiliaria', icon: '🏠', label: 'Inmobiliaria / Construcción', description: 'Propiedades, contratos, cobranzas' },
      { id: 'industria', icon: '🏭', label: 'Industria / Producción', description: 'Producción, insumos, control de calidad' },
    ],
  },
  {
    id: 'problema',
    question: '¿Cuál es tu mayor dolor hoy?',
    subquestion: 'Podés elegir más de uno. Sé honesto — nadie te juzga.',
    multiSelect: true,
    options: [
      { id: 'excel', icon: '📊', label: 'Vivimos en el Excel' },
      { id: 'errores', icon: '❌', label: 'Errores humanos constantes' },
      { id: 'info', icon: '🔍', label: 'No tengo info en tiempo real' },
      { id: 'procesos', icon: '🔄', label: 'Procesos manuales repetitivos' },
      { id: 'sistemas', icon: '🔌', label: 'Sistemas que no se hablan' },
      { id: 'clientes', icon: '👥', label: 'Pierdo clientes por falta de seguimiento' },
    ],
  },
  {
    id: 'equipo',
    question: '¿Cuántas personas trabajan en tu empresa?',
    subquestion: 'Esto nos ayuda a dimensionar la solución correcta.',
    multiSelect: false,
    options: [
      { id: 'solo', icon: '👤', label: 'Solo yo', description: 'Emprendedor o profesional independiente' },
      { id: 'pequeno', icon: '👥', label: '2 a 10 personas', description: 'Equipo pequeño, mucho sombrero puesto' },
      { id: 'mediano', icon: '🏢', label: '10 a 50 personas', description: 'Empresa en crecimiento, procesos a ordenar' },
      { id: 'grande', icon: '🏛', label: 'Más de 50 personas', description: 'Organización que necesita sistemas robustos' },
    ],
  },
]

const resultados: Record<DiagnosticoId, DiagnosticoResult> = {
  'gestion-integral': {
    id: 'gestion-integral',
    title: 'Sistema de Gestión Integral',
    subtitle: 'Tu empresa en una sola pantalla',
    description: 'Un sistema centralizado que conecta ventas, stock, clientes y reportes. Todos los datos en tiempo real. Sin Excel, sin WhatsApp como CRM.',
    timeEstimate: '6 a 10 semanas',
    priceRange: 'desde $2.800 USD',
    features: [
      'Dashboard en tiempo real',
      'Gestión de clientes y pedidos',
      'Control de stock automático',
      'Reportes automáticos',
      'Acceso desde cualquier dispositivo',
    ],
    color: '#6366f1',
    colorRgb: '99,102,241',
    icon: '🖥',
    ctaText: 'Quiero mi sistema de gestión',
  },
  'crm-ventas': {
    id: 'crm-ventas',
    title: 'CRM de Ventas Inteligente',
    subtitle: 'Nunca más un cliente sin seguimiento',
    description: 'Sistema de seguimiento de clientes y oportunidades de venta. Cada contacto, cada interacción, cada cierre — registrado y visible.',
    timeEstimate: '4 a 6 semanas',
    priceRange: 'desde $1.800 USD',
    features: [
      'Pipeline de ventas visual',
      'Seguimiento automático de leads',
      'Historial completo por cliente',
      'Alertas y recordatorios',
      'Integración con WhatsApp',
    ],
    color: '#7b2fff',
    colorRgb: '123,47,255',
    icon: '🎯',
    ctaText: 'Quiero mi CRM',
  },
  'automatizacion-procesos': {
    id: 'automatizacion-procesos',
    title: 'Motor de Automatización',
    subtitle: 'Los procesos repetitivos, en automático',
    description: 'Identificamos los procesos que más tiempo te roban y los automatizamos. Aprobaciones, notificaciones, reportes — sin intervención humana.',
    timeEstimate: '3 a 5 semanas',
    priceRange: 'desde $1.400 USD',
    features: [
      'Mapeo de procesos actuales',
      'Flujos automáticos digitales',
      'Notificaciones inteligentes',
      'Formularios digitales',
      'Auditoría de procesos',
    ],
    color: '#6366f1',
    colorRgb: '99,102,241',
    icon: '⚡',
    ctaText: 'Automatizar mis procesos',
  },
  'sistema-stock': {
    id: 'sistema-stock',
    title: 'Sistema de Stock e Inventario',
    subtitle: 'Nunca más quedarte sin stock sin saberlo',
    description: 'Control de inventario en tiempo real, alertas de stock mínimo, trazabilidad de productos y sincronización con ventas.',
    timeEstimate: '4 a 7 semanas',
    priceRange: 'desde $2.000 USD',
    features: [
      'Control de stock en tiempo real',
      'Alertas de stock mínimo',
      'Trazabilidad de productos',
      'Órdenes de compra automáticas',
      'Integración con ventas',
    ],
    color: '#7b2fff',
    colorRgb: '123,47,255',
    icon: '📦',
    ctaText: 'Quiero control de mi stock',
  },
  'portal-clientes': {
    id: 'portal-clientes',
    title: 'Portal de Clientes Self-Service',
    subtitle: 'Tus clientes gestionan sin llamarte',
    description: 'Una plataforma donde tus clientes consultan su estado, hacen pedidos, pagan y se comunican — sin intervención de tu equipo.',
    timeEstimate: '5 a 8 semanas',
    priceRange: 'desde $2.200 USD',
    features: [
      'Acceso seguro por cliente',
      'Estado de pedidos en tiempo real',
      'Pagos integrados',
      'Historial de transacciones',
      'Chat integrado',
    ],
    color: '#6366f1',
    colorRgb: '99,102,241',
    icon: '🔐',
    ctaText: 'Quiero mi portal',
  },
  'erp-personalizado': {
    id: 'erp-personalizado',
    title: 'ERP Personalizado',
    subtitle: 'El sistema nervioso central de tu empresa',
    description: 'Una solución completa que cubre todas las áreas de tu empresa: ventas, compras, stock, producción, RRHH, contabilidad y reportes ejecutivos.',
    timeEstimate: '12 a 20 semanas',
    priceRange: 'desde $6.000 USD',
    features: [
      'Módulos por área de negocio',
      'Reportes ejecutivos en tiempo real',
      'Gestión de usuarios y permisos',
      'Integraciones con sistemas externos',
      'Soporte y mantenimiento incluido',
    ],
    color: '#7b2fff',
    colorRgb: '123,47,255',
    icon: '🏛',
    ctaText: 'Quiero mi ERP',
  },
}

// ─── LOGIC ───────────────────────────────────────────────────────────────────

function calcularDiagnostico(
  rubro: string,
  problemas: string[],
  equipo: string,
): DiagnosticoId {
  if (equipo === 'grande') return 'erp-personalizado'
  if (problemas.includes('sistemas') && problemas.includes('procesos') && equipo !== 'solo') return 'erp-personalizado'

  if (rubro === 'comercio' || rubro === 'industria') {
    if (problemas.includes('excel') || problemas.includes('errores')) return 'sistema-stock'
    return 'gestion-integral'
  }

  if (rubro === 'salud') return 'gestion-integral'
  if (rubro === 'gastronomia') return 'automatizacion-procesos'

  if (rubro === 'inmobiliaria') {
    if (problemas.includes('clientes')) return 'crm-ventas'
    return 'portal-clientes'
  }

  if (problemas.includes('clientes')) return 'crm-ventas'
  if (problemas.includes('procesos')) return 'automatizacion-procesos'

  return 'gestion-integral'
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function AtmosphereDiag() {
  return (
    <>
      {/* Glow principal superior */}
      <div style={{ position:'absolute', top:'-80px', left:'50%', transform:'translateX(-50%)', width:'700px', height:'500px', background:'radial-gradient(ellipse, rgba(99,102,241,0.09) 0%, rgba(123,47,255,0.05) 40%, transparent 65%)', filter:'blur(100px)', pointerEvents:'none', zIndex:0, ariaHidden:'true' } as any}/>

      {/* Glow izquierda */}
      <div style={{ position:'absolute', top:'20%', left:'-10%', width:'400px', height:'500px', background:'radial-gradient(ellipse, rgba(99,102,241,0.05) 0%, transparent 60%)', filter:'blur(80px)', pointerEvents:'none', zIndex:0 } as any}/>

      {/* Glow derecha — violeta */}
      <div style={{ position:'absolute', top:'30%', right:'-10%', width:'400px', height:'400px', background:'radial-gradient(ellipse, rgba(123,47,255,0.06) 0%, transparent 60%)', filter:'blur(80px)', pointerEvents:'none', zIndex:0 } as any}/>

      {/* Grid de puntos */}
      <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)`, backgroundSize:'52px 52px', pointerEvents:'none', zIndex:0, maskImage:'radial-gradient(ellipse at 50% 40%, black 0%, transparent 70%)', WebkitMaskImage:'radial-gradient(ellipse at 50% 40%, black 0%, transparent 70%)' } as any}/>

      {/* Líneas horizontales sutiles */}
      {[20,50,80].map((top,i) => (
        <div key={i} style={{ position:'absolute', top:`${top}%`, left:0, right:0, height:'1px', background: 'rgba(255,255,255,0.018)', pointerEvents:'none', zIndex:0 }}/>
      ))}
    </>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  return (
    <div style={{ marginBottom: 'clamp(40px, 5vh, 56px)' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '100px', padding: '4px 14px', marginBottom: '20px', background: 'rgba(99,102,241,0.05)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.5, delay: 0.3 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px #6366f1' }} />
        <span style={{ fontSize: '10px', letterSpacing: '0.2em', color: '#6366f1', fontWeight: 700 }}>[ DIAGNÓSTICO GRATUITO ]</span>
      </motion.div>

      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }} style={{ fontSize: 'clamp(28px, 4.5vw, 56px)', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: '0 0 16px' }}>
        ¿Qué sistema necesita<br /><span style={{ color: '#6366f1' }}>tu empresa?</span>
      </motion.h2>

      <motion.p initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.6, delay: 0.2 }} style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
        3 preguntas. 30 segundos. Un diagnóstico hecho a medida.
      </motion.p>
    </div>
  )
}

function SocialProof({ isInView }: { isInView: boolean }) {
  return (
    <motion.div
      initial={{ opacity:0, y:10 }}
      animate={isInView ? { opacity:1, y:0 } : {}}
      transition={{ delay:0.45, duration:0.5 }}
      style={{
        display:'flex',
        alignItems:'center',
        gap:'12px',
        marginBottom:'28px',
        padding:'10px 16px',
        background:'rgba(99,102,241,0.05)',
        border:'1px solid rgba(99,102,241,0.12)',
        borderRadius:'10px',
        width:'fit-content',
      }}
    >
      <div style={{ display:'flex' }}>
        {['#6366f1','#7b2fff','#a855f7'].map((c,i) => (
          <div key={i} style={{ width:'24px', height:'24px', borderRadius:'50%', background:`linear-gradient(135deg, ${c}, rgba(0,0,0,0.3))`, border:'2px solid #06060f', marginLeft: i===0 ? 0 : '-6px', position:'relative', zIndex: 3-i }}/>
        ))}
      </div>
      <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', margin:0 }}>
        <strong style={{ color:'white', fontWeight:700 }}>+312 diagnósticos</strong> realizados este mes
      </p>
    </motion.div>
  )
}

function ProgressBar({ current, total }: { current: number, total: number }) {
  return (
    <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', position: 'relative' }}>
      <motion.div animate={{ width: `${((current + 1) / total) * 100}%` }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #7b2fff)', boxShadow: '0 0 12px rgba(99,102,241,0.5)' }} />
      <div style={{ position: 'absolute', top: '12px', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 clamp(28px, 4vw, 48px)' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: i <= current ? 'linear-gradient(135deg, #6366f1, #7b2fff)' : 'rgba(255,255,255,0.08)', border: i <= current ? 'none' : '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: i <= current ? 'white' : 'rgba(255,255,255,0.25)', transition: 'all 300ms' }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '10px', color: i <= current ? 'rgba(99,102,241,0.8)' : 'rgba(255,255,255,0.2)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {s.id === 'rubro' ? 'Rubro' : s.id === 'problema' ? 'Dolor' : 'Equipo'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StepContent({
  step,
  selections,
  setSelections,
}: {
  step: DiagnosticoStep
  selections: { rubro: string, problemas: string[], equipo: string }
  setSelections: (s: any) => void
}) {
  return (
    <div>
      <h3 style={{ fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 900, color: 'white', margin: '0 0 6px', lineHeight: 1.2 }}>{step.question}</h3>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', margin: '0 0 clamp(20px, 3vh, 32px)' }}>{step.subquestion}</p>

      <div className={`grid ${step.options.length === 4 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'} gap-[10px]`}>
        {step.options.map(option => {
          const isSelected = step.id === 'problema' ? selections.problemas.includes(option.id) : step.id === 'rubro' ? selections.rubro === option.id : selections.equipo === option.id
          
          const toggleSelection = () => {
            if (step.id === 'problema') {
              setSelections({ ...selections, problemas: isSelected ? selections.problemas.filter(p => p !== option.id) : [...selections.problemas, option.id] })
            } else if (step.id === 'rubro') {
              setSelections({ ...selections, rubro: option.id })
            } else {
              setSelections({ ...selections, equipo: option.id })
            }
          }

          return (
            <motion.button 
              key={option.id} 
              onClick={toggleSelection}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSelection(); } }}
              tabIndex={0}
              whileHover={{ scale: 1.02, y: -2 }} 
              whileTap={{ scale: 0.98 }} 
              transition={{ type: 'spring', stiffness: 400, damping: 20 }} 
              style={{ padding: 'clamp(12px, 1.5vw, 18px)', borderRadius: '14px', border: isSelected ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)', background: isSelected ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)', cursor: 'none', textAlign: 'left', transition: 'background 200ms, border 200ms', boxShadow: isSelected ? '0 0 20px rgba(99,102,241,0.12)' : 'none', position: 'relative', overflow: 'hidden' }}
            >
              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', top: '8px', right: '8px', width: '18px', height: '18px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: 700 }}>✓</motion.div>
              )}
              <span style={{ fontSize: '22px', display: 'block', marginBottom: '8px' }}>{option.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#6366f1' : 'white', display: 'block', marginBottom: option.description ? '4px' : '0', transition: 'color 200ms' }}>{option.label}</span>
              {option.description && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.4 }}>{option.description}</span>}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function StepNav({ canAdvance, isLast, onNext, onBack }: { canAdvance: boolean, isLast: boolean, onNext: () => void, onBack?: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'clamp(24px, 3vh, 36px)' }}>
      {onBack ? (
        <motion.button onClick={onBack} whileHover={{ x: -3 }} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '14px', cursor: 'none', padding: '10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>← Atrás</motion.button>
      ) : <div />}
      <motion.button 
        onClick={onNext} 
        onKeyDown={(e) => { if (e.key === 'Enter') onNext(); }}
        tabIndex={canAdvance ? 0 : -1}
        disabled={!canAdvance} 
        whileHover={canAdvance ? { scale: 1.04 } : {}} 
        whileTap={canAdvance ? { scale: 0.97 } : {}} 
        transition={{ type: 'spring', stiffness: 400, damping: 15 }} 
        style={{ background: canAdvance ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.06)', color: canAdvance ? 'white' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '100px', padding: '13px 28px', fontSize: '14px', fontWeight: 700, cursor: 'none', boxShadow: canAdvance ? '0 0 24px rgba(99,102,241,0.3)' : 'none', transition: 'background 200ms, box-shadow 200ms', letterSpacing: '0.04em' }}
      >
        {isLast ? 'Ver mi diagnóstico →' : 'Siguiente →'}
      </motion.button>
    </div>
  )
}

function StepWizard({
  currentStep,
  setCurrentStep,
  selections,
  setSelections,
  onComplete,
  isInView,
}: {
  currentStep: number
  setCurrentStep: (n: number) => void
  selections: { rubro: string, problemas: string[], equipo: string }
  setSelections: (s: any) => void
  onComplete: (r: string, p: string[], e: string) => void
  isInView: boolean
}) {
  const step = steps[currentStep]
  const canAdvance = step.id === 'rubro' ? selections.rubro !== '' : step.id === 'problema' ? selections.problemas.length > 0 : selections.equipo !== ''
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div 
      initial={{ opacity: 0, y: 28 }} 
      animate={isInView ? { 
        opacity: 1, 
        y: 0,
        boxShadow: shouldReduceMotion ? 'none' : `
          0 0 0 1px rgba(99,102,241,0.2),
          0 0 40px rgba(99,102,241,0.06),
          inset 0 1px 0 rgba(255,255,255,0.06)
        ` 
      } : {}} 
      transition={{ 
        duration: 0.7, 
        delay: 0.35, 
        ease: [0.16, 1, 0.3, 1],
        boxShadow: { duration: 1.0, delay: 0.5 }
      }} 
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', overflow: 'hidden' }}
    >
      <ProgressBar current={currentStep} total={steps.length} />
      <div style={{ padding: 'clamp(40px, 5vw, 60px) clamp(28px, 4vw, 48px) clamp(28px, 4vw, 48px)' }}>
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
            <StepContent step={step} selections={selections} setSelections={setSelections} />
          </motion.div>
        </AnimatePresence>
        <StepNav canAdvance={canAdvance} isLast={currentStep === steps.length - 1} onNext={() => { if (currentStep < steps.length - 1) { setCurrentStep(currentStep + 1) } else { onComplete(selections.rubro, selections.problemas, selections.equipo) } }} onBack={currentStep > 0 ? () => setCurrentStep(currentStep - 1) : undefined} />
      </div>
    </motion.div>
  )
}

// ─── RESULT PANEL COMPONENTS ──────────────────────────────────────────────────

function ResultHeader({ resultado }: { resultado: DiagnosticoResult }) {
  return (
    <div style={{ padding: 'clamp(28px,4vw,48px)', borderBottom: `1px solid rgba(${resultado.colorRgb},0.12)`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg, transparent, rgba(${resultado.colorRgb},0.8) 30%, rgba(${resultado.colorRgb},0.8) 70%, transparent)` }}/>
      <div style={{ position:'absolute', top:'-20px', left:'-20px', width:'200px', height:'200px', background:`radial-gradient(circle, rgba(${resultado.colorRgb},0.12) 0%, transparent 65%)`, filter:'blur(30px)', pointerEvents:'none' }}/>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) auto', gap:'20px', alignItems:'start', position:'relative', zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'20px', flexWrap:'nowrap', minWidth:0 }}>
          <div style={{ width:'72px', height:'72px', borderRadius:'20px', background:`rgba(${resultado.colorRgb},0.15)`, border:`1px solid rgba(${resultado.colorRgb},0.3)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', flexShrink:0, boxShadow:`0 0 30px rgba(${resultado.colorRgb},0.2)` }}>
            {resultado.icon}
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:'11px', letterSpacing:'0.25em', color:`rgba(${resultado.colorRgb},0.7)`, fontWeight:600, margin:'0 0 8px', textTransform:'uppercase' }}>Tu diagnóstico</p>
            <h2 style={{ fontSize:'clamp(22px,3vw,36px)', fontWeight:900, color:'white', margin:'0 0 6px', lineHeight:1.15 }}>{resultado.title}</h2>
            <p style={{ fontSize:'16px', color:`rgba(${resultado.colorRgb},0.8)`, fontWeight:600, margin:0 }}>{resultado.subtitle}</p>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'10px', width:'176px', flexShrink:0, alignSelf:'start' }}>
          <div style={{ background:`rgba(${resultado.colorRgb},0.08)`, border:`1px solid rgba(${resultado.colorRgb},0.2)`, borderRadius:'10px', padding:'8px 14px', textAlign:'right' }}>
            <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', margin:'0 0 2px', letterSpacing:'0.1em' }}>TIEMPO ESTIMADO</p>
            <p style={{ fontSize:'15px', fontWeight:800, color:'white', margin:0 }}>{resultado.timeEstimate}</p>
          </div>
          <div style={{ background:`rgba(${resultado.colorRgb},0.08)`, border:`1px solid rgba(${resultado.colorRgb},0.2)`, borderRadius:'10px', padding:'8px 14px', textAlign:'right' }}>
            <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', margin:'0 0 2px', letterSpacing:'0.1em' }}>INVERSIÓN</p>
            <p style={{ fontSize:'15px', fontWeight:800, color:resultado.color, margin:0 }}>{resultado.priceRange}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultBody({ resultado }: { resultado: DiagnosticoResult }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-9" style={{ padding:'clamp(24px,3vw,40px)' }}>
      <div>
        <h4 style={{ fontSize:'13px', fontWeight:700, letterSpacing:'0.15em', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', margin:'0 0 14px' }}>Qué incluye</h4>
        <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.6)', lineHeight:1.75, margin:0 }}>{resultado.description}</p>
      </div>
      <div>
        <h4 style={{ fontSize:'13px', fontWeight:700, letterSpacing:'0.15em', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', margin:'0 0 14px' }}>Funcionalidades clave</h4>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {resultado.features.map((f, i) => (
            <motion.div key={i} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3 + i * 0.08, duration:0.4, ease:[0.16,1,0.3,1] }} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:`rgba(${resultado.colorRgb},0.15)`, border:`1px solid rgba(${resultado.colorRgb},0.3)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', color:resultado.color, flexShrink:0 }}>✓</div>
              <span style={{ fontSize:'14px', color:'rgba(255,255,255,0.7)' }}>{f}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ResultCTA({ resultado, onReset }: { resultado: DiagnosticoResult, onReset: () => void }) {
  const [copied, setCopied] = useState(false)
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '543812223344'
  const whatsappMsg = `Hola DevelOP, hice el diagnóstico y necesito ${resultado.title}`
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`

  async function copyResult() {
    try {
      const text = `Mi diagnóstico DevelOP:\n${resultado.title}\n${resultado.description}\nTiempo: ${resultado.timeEstimate}\nInversión: ${resultado.priceRange}\ndevelop.ar/software-development`
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }

  return (
    <div style={{ padding:'clamp(20px,3vw,36px)', borderTop:`1px solid rgba(${resultado.colorRgb},0.1)`, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px', background:`rgba(${resultado.colorRgb},0.03)` }}>
      <div>
        <p style={{ fontSize:'15px', fontWeight:700, color:'white', margin:'0 0 4px' }}>¿Es lo que necesitás?</p>
        <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)', margin:0 }}>Hablamos sin compromiso para ajustar los detalles a tu caso.</p>
      </div>

      <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center' }}>
        <motion.button onClick={copyResult} whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.3)', borderRadius:'100px', padding:'8px 14px', fontSize:'12px', cursor: 'none', display:'flex', alignItems:'center', gap:'6px', transition:'all 200ms' }}>
          {copied ? '✓ Copiado' : '⎘ Compartir'}
        </motion.button>

        <motion.button onClick={onReset} whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.45)', borderRadius:'100px', padding:'12px 20px', fontSize:'13px', fontWeight:600, cursor: 'none', transition:'all 200ms' }}>
          ← Repetir diagnóstico
        </motion.button>

        <motion.a href={whatsappUrl} target="_blank" rel="noopener noreferrer" whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }} transition={{ type:'spring', stiffness:400, damping:15 }} style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:`linear-gradient(135deg, rgb(${resultado.colorRgb}), rgba(${resultado.colorRgb},0.7))`, color:'white', fontWeight:800, fontSize:'14px', padding:'13px 28px', borderRadius:'100px', textDecoration:'none', boxShadow:`0 0 28px rgba(${resultado.colorRgb},0.35)`, letterSpacing:'0.03em' }}>
          💬 {resultado.ctaText} →
        </motion.a>
      </div>
    </div>
  )
}

function ResultPanel({ resultado, onReset }: { resultado: DiagnosticoResult, onReset: () => void }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="result"
        initial={{ opacity:0, scale:0.96, y:20 }}
        animate={{ opacity:1, scale:1, y:0 }}
        transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}
        style={{
          background: `linear-gradient(135deg, rgba(${resultado.colorRgb},0.08) 0%, rgba(255,255,255,0.02) 100%)`,
          border: `1px solid rgba(${resultado.colorRgb},0.25)`,
          borderRadius: '24px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <ResultHeader resultado={resultado} />
        <ResultBody resultado={resultado} />
        <ResultCTA resultado={resultado} onReset={onReset} />
      </motion.div>
    </AnimatePresence>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function DiagnosticoSoftware() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 })

  const [currentStep, setCurrentStep] = useState<number>(0)
  const [selections, setSelections] = useState<{ rubro: string, problemas: string[], equipo: string }>({ rubro: '', problemas: [], equipo: '' })
  const [showResult, setShowResult] = useState(false)
  const [resultado, setResultado] = useState<DiagnosticoResult | null>(null)

  return (
    <section id="diagnostico" ref={sectionRef} style={{ padding: 'clamp(80px, 12vh, 140px) clamp(20px, 5vw, 80px)', background: '#06060f', position: 'relative', overflow: 'hidden' }}>
      <AtmosphereDiag />
      <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Header isInView={isInView} />
        <SocialProof isInView={isInView} />

        {!showResult ? (
          <StepWizard 
            currentStep={currentStep} 
            setCurrentStep={setCurrentStep} 
            selections={selections} 
            setSelections={setSelections} 
            onComplete={(rubro, problemas, equipo) => { 
              const diagId = calcularDiagnostico(rubro, problemas, equipo); 
              setResultado(resultados[diagId]); 
              setShowResult(true) 
            }}
            isInView={isInView}
          />
        ) : (
          <ResultPanel 
            resultado={resultado!} 
            onReset={() => { 
              setShowResult(false); 
              setCurrentStep(0); 
              setSelections({ rubro: '', problemas: [], equipo: '' }); 
              setResultado(null) 
            }} 
          />
        )}
      </div>
    </section>
  )
}

