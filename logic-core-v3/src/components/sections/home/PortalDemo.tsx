'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LucideIcon,
  BarChart2, MessageSquare, CheckSquare,
  Shield, Zap, Brain, TrendingUp,
  ShoppingCart, Users, Layers, Globe,
} from 'lucide-react'

// ─── Paleta ────────────────────────────────────────────────────────────────

const CYAN = '#06b6d4'

// ─── Data ──────────────────────────────────────────────────────────────────

interface PortalFeature {
  id: string
  icon: LucideIcon
  label: string
  description: string
  color: string
  screen: string
}

interface PremiumModule {
  id: string
  icon: LucideIcon
  label: string
  description: string
  price: string
  color: string
}

const PORTAL_FEATURES: PortalFeature[] = [
  {
    id: 'metrics',
    icon: BarChart2,
    label: 'Métricas en tiempo real',
    description: 'Visitantes, posicionamiento en Google y ROI de tu inversión. Actualizado automáticamente, sin pedirlo.',
    color: '#06b6d4',
    screen: 'analytics',
  },
  {
    id: 'ai',
    icon: Brain,
    label: 'Resumen ejecutivo con IA',
    description: 'Cada semana, la IA analiza tus datos y te entrega un resumen ejecutivo de cómo está rindiendo tu negocio.',
    color: '#8b5cf6',
    screen: 'ai-brief',
  },
  {
    id: 'project',
    icon: CheckSquare,
    label: 'Estado de tu proyecto',
    description: 'Cada tarea, cada entrega. Ves el avance en tiempo real y aprobás cuando estés listo.',
    color: '#10b981',
    screen: 'project',
  },
  {
    id: 'messages',
    icon: MessageSquare,
    label: 'Comunicación directa',
    description: 'Hablá con el equipo develOP cuando quieras. Sin grupos de WhatsApp, sin mails perdidos.',
    color: '#f59e0b',
    screen: 'messages',
  },
  {
    id: 'vault',
    icon: Shield,
    label: 'Bóveda digital',
    description: 'Todos tus archivos, contraseñas y activos digitales en un solo lugar seguro y siempre accesible.',
    color: '#06b6d4',
    screen: 'vault',
  },
  {
    id: 'automation',
    icon: Zap,
    label: 'Automatizaciones activas',
    description: 'Ves en tiempo real cuántas automatizaciones están corriendo y cuánto trabajo están haciendo por vos.',
    color: '#10b981',
    screen: 'automation',
  },
]

const PREMIUM_MODULES: PremiumModule[] = [
  {
    id: 'whatsapp',
    icon: MessageSquare,
    label: 'WhatsApp Autopilot',
    description: 'Tu negocio responde consultas, califica leads y agenda turnos por WhatsApp. Solo.',
    price: '$150',
    color: '#25D366',
  },
  {
    id: 'seo',
    icon: TrendingUp,
    label: 'SEO Avanzado',
    description: 'Posicionamiento en Google con reportes mensuales y acciones concretas cada semana.',
    price: '$120',
    color: '#06b6d4',
  },
  {
    id: 'crm',
    icon: Users,
    label: 'Mini-CRM',
    description: 'Pipeline de ventas, seguimiento de leads y historial de cada cliente en un solo lugar.',
    price: '$80',
    color: '#8b5cf6',
  },
  {
    id: 'ecommerce',
    icon: ShoppingCart,
    label: 'E-commerce',
    description: 'Tienda online integrada a tu sitio con pagos, stock y gestión de pedidos.',
    price: '$300',
    color: '#f59e0b',
  },
]

// ─── Browser Mockup ────────────────────────────────────────────────────────

function BrowserMockup({ activeFeature }: { activeFeature: number }) {
  const feature = PORTAL_FEATURES[activeFeature]

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)`,
        background: '#080a0c',
        willChange: 'transform',
      }}
    >
      {/* Chrome del browser */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#0d0f11',
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(239,68,68,0.7)' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(251,191,36,0.7)' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(52,211,153,0.7)' }} />
        <div
          style={{
            flex: 1,
            marginLeft: 8,
            borderRadius: 6,
            padding: '4px 12px',
            background: '#1a1c1f',
            fontSize: 11,
            color: 'rgba(255,255,255,0.25)',
            fontFamily: 'monospace',
          }}
        >
          portal.develop.com.ar
        </div>
      </div>

      {/* Sidebar + contenido */}
      <div style={{ display: 'flex', minHeight: 340 }}>
        {/* Sidebar */}
        <div
          style={{
            width: 52,
            borderRight: '1px solid rgba(255,255,255,0.05)',
            background: '#0a0c0e',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 0',
            gap: 12,
          }}
        >
          {PORTAL_FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={f.id}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: i === activeFeature ? `${f.color}18` : 'transparent',
                  border: i === activeFeature ? `1px solid ${f.color}40` : '1px solid transparent',
                  transition: 'all 0.3s ease',
                }}
              >
                <Icon
                  size={13}
                  strokeWidth={1.5}
                  style={{ color: i === activeFeature ? f.color : 'rgba(255,255,255,0.2)' }}
                />
              </div>
            )
          })}
        </div>

        {/* Área de contenido */}
        <div style={{ flex: 1, padding: 20, position: 'relative', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Header de pantalla */}
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <feature.icon size={13} strokeWidth={1.5} style={{ color: feature.color }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>
                  {feature.label}
                </span>
              </div>

              {/* Contenido simulado */}
              <MockScreenContent featureId={feature.id} color={feature.color} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

function MockScreenContent({ featureId, color }: { featureId: string; color: string }) {
  if (featureId === 'metrics') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {[
            { label: 'Visitas', value: '1.842' },
            { label: 'Posición', value: '#3' },
            { label: 'ROI', value: '4.2x' },
          ].map(c => (
            <div key={c.label} style={glassCard}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.label}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>{c.value}</span>
            </div>
          ))}
        </div>
        <div style={{ ...glassCard, padding: '10px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
            <span>Tráfico esta semana</span>
            <span style={{ color }}>+24%</span>
          </div>
          <div style={{ height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '72%' }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: 9999, background: `linear-gradient(90deg, ${color}, ${color}99)` }}
            />
          </div>
        </div>
        <SkeletonRows count={2} color={color} />
      </div>
    )
  }

  if (featureId === 'ai') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ ...glassCard, borderColor: `${color}30` }}>
          <div style={{ fontSize: 9, color, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resumen IA — semana 16</div>
          <SkeletonRows count={3} color={color} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={glassCard}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Oportunidad</span>
            <SkeletonRow width="80%" color={color} />
          </div>
          <div style={glassCard}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Riesgo</span>
            <SkeletonRow width="60%" color="rgba(239,68,68,0.6)" />
          </div>
        </div>
      </div>
    )
  }

  if (featureId === 'project') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Diseño aprobado', pct: 100, done: true },
          { label: 'Desarrollo frontend', pct: 68, done: false },
          { label: 'Integraciones', pct: 20, done: false },
        ].map(t => (
          <div key={t.label} style={{ ...glassCard, padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.55)', marginBottom: 5 }}>
              <span>{t.label}</span>
              <span style={{ color: t.done ? color : 'rgba(255,255,255,0.4)' }}>{t.pct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 9999, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${t.pct}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: 9999, background: t.done ? color : `${color}80` }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (featureId === 'messages') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { from: 'Franco', msg: 'El catálogo está casi listo, revisalo cuando puedas ', mine: false },
          { from: 'Vos', msg: 'Perfecto! Cuando esté lo revisamos juntos ', mine: true },
          { from: 'Franco', msg: 'Subí los cambios al portal para que los apruebes.', mine: false },
        ].map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.mine ? 'flex-end' : 'flex-start' }}>
            <div
              style={{
                maxWidth: '80%',
                padding: '7px 11px',
                borderRadius: m.mine ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                background: m.mine ? `${color}20` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${m.mine ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {!m.mine && <div style={{ fontSize: 9, color, marginBottom: 2, fontWeight: 600 }}>{m.from}</div>}
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>{m.msg}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (featureId === 'vault') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { name: 'Accesos hosting', type: 'Credencial' },
          { name: 'Logo oficial 2024', type: 'Archivo' },
          { name: 'Contrato firmado', type: 'Documento' },
        ].map(item => (
          <div key={item.name} style={{ ...glassCard, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px' }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{item.name}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{item.type}</div>
            </div>
            <Shield size={13} strokeWidth={1.5} style={{ color }} />
          </div>
        ))}
      </div>
    )
  }

  if (featureId === 'automation') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={glassCard}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Activas</span>
            <span style={{ fontSize: 18, fontWeight: 700, color }}>4</span>
          </div>
          <div style={glassCard}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Acciones hoy</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>127</span>
          </div>
        </div>
        {[
          { name: 'Respuesta WhatsApp', status: 'Activa' },
          { name: 'Follow-up leads', status: 'Activa' },
          { name: 'Reporte semanal', status: 'Activa' },
        ].map(a => (
          <div key={a.name} style={{ ...glassCard, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{a.name}</span>
            <span style={{ fontSize: 9, color, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 9999, padding: '2px 8px' }}>{a.status}</span>
          </div>
        ))}
      </div>
    )
  }

  return <SkeletonRows count={4} color={color} />
}

// ─── Helpers UI ────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 10,
  padding: 12,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}

function SkeletonRow({ width = '100%', color = 'rgba(255,255,255,0.07)' }: { width?: string; color?: string }) {
  return (
    <div style={{ height: 7, borderRadius: 9999, background: color, opacity: 0.6, width, marginTop: 4 }} />
  )
}

function SkeletonRows({ count, color }: { count: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} width={i % 2 === 0 ? '100%' : '75%'} color={`${color}30`} />
      ))}
    </div>
  )
}

// ─── Screen Components ────────────────────────────────────────────────────

function ScreenAnalytics() {
  return (
    <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginBottom: 2 }}>
            RESUMEN GENERAL
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>
            Concesionaria San Miguel
          </div>
        </div>
        <div style={{ fontSize: 10, color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 100, padding: '3px 8px' }}>
          ● En vivo
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { label: 'VISITAS', value: '1.842', trend: '+12%', color: '#06b6d4' },
          { label: 'POSICIÓN', value: '#3', trend: '↑2', color: '#10b981' },
          { label: 'CONSULTAS', value: '47', trend: '+8%', color: '#8b5cf6' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              background: `${kpi.color}08`,
              border: `1px solid ${kpi.color}18`,
              borderRadius: 10,
              padding: '10px 12px',
            }}
          >
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', marginBottom: 4 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: kpi.color, lineHeight: 1 }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 9, color: '#10b981', marginTop: 3 }}>
              ↑ {kpi.trend}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mini gráfico */}
      <div style={{
        flex: 1,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10,
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>
          VISITAS ÚLTIMOS 30 DÍAS
        </div>
        <svg viewBox="0 0 300 80" style={{ flex: 1, width: '100%' }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,65 C30,60 50,40 80,45 C110,50 130,30 160,25 C190,20 210,35 240,20 C265,10 280,15 300,8 L300,80 L0,80 Z"
            fill="url(#areaGrad)"
          />
          <path
            d="M0,65 C30,60 50,40 80,45 C110,50 130,30 160,25 C190,20 210,35 240,20 C265,10 280,15 300,8"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <motion.circle
            cx="300"
            cy="8"
            r="4"
            fill="#06b6d4"
            animate={{ r: [3, 5, 3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </svg>
      </div>
    </div>
  )
}

function ScreenAI() {
  const [typed, setTyped] = useState('')
  const fullText = 'Esta semana tu negocio recibió 47 consultas, un 12% más que la semana anterior. El martes fue el día con más actividad. Se detectaron 3 oportunidades de mejora en tu posicionamiento local.'

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setTyped(fullText.slice(0, i))
      i++
      if (i > fullText.length) clearInterval(interval)
    }, 18)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: 'rgba(139,92,246,0.15)',
          border: '1px solid rgba(139,92,246,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Brain size={15} color="#8b5cf6" strokeWidth={1.5} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>Resumen Ejecutivo IA</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Generado hace 2 horas</div>
        </div>
      </div>

      {/* Texto generado por IA */}
      <div style={{
        flex: 1,
        background: 'rgba(139,92,246,0.05)',
        border: '1px solid rgba(139,92,246,0.15)',
        borderRadius: 10,
        padding: 16,
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 1.65,
      }}>
        {typed}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{ borderRight: '1.5px solid #8b5cf6', marginLeft: 2 }}
        >
          &nbsp;
        </motion.span>
      </div>

      {/* Métricas rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { label: 'Consultas', value: '47', icon: '' },
          { label: 'vs semana ant.', value: '+12%', icon: '' },
          { label: 'Oportunidades', value: '3', icon: '' },
        ].map((m, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8,
            padding: '8px 10px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, marginBottom: 2 }}>{m.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6' }}>{m.value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScreenProject() {
  const tasks = [
    { label: 'Diseño de home page', status: 'done', date: 'Hace 3 días' },
    { label: 'Desarrollo del catálogo', status: 'progress', progress: 68, date: 'En progreso' },
    { label: 'Integración WhatsApp', status: 'pending', date: 'Próxima semana' },
    { label: 'Capacitación al equipo', status: 'pending', date: 'Al finalizar' },
  ]

  return (
    <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Mi Proyecto</div>
        <div style={{
          fontSize: 10,
          color: '#10b981',
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 100,
          padding: '3px 8px',
          fontWeight: 600,
        }}>
          68% completado
        </div>
      </div>

      {/* Barra de progreso general */}
      <div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '68%' }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            style={{ height: '100%', background: '#10b981', borderRadius: 100 }}
          />
        </div>
      </div>

      {/* Lista de tareas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {tasks.map((task, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              background: task.status === 'progress'
                ? 'rgba(6,182,212,0.06)'
                : 'rgba(255,255,255,0.02)',
              border: `1px solid ${task.status === 'progress'
                ? 'rgba(6,182,212,0.2)'
                : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 10,
            }}
          >
            {/* Status indicator */}
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: task.status === 'done'
                ? '#10b981'
                : task.status === 'progress'
                  ? 'rgba(6,182,212,0.2)'
                  : 'rgba(255,255,255,0.06)',
              border: task.status !== 'done'
                ? `1px solid ${task.status === 'progress' ? '#06b6d4' : 'rgba(255,255,255,0.15)'}`
                : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {task.status === 'done' && (
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M2 5l2.5 2.5L8 3" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 500,
                color: task.status === 'done'
                  ? 'rgba(255,255,255,0.35)'
                  : 'rgba(255,255,255,0.8)',
                textDecoration: task.status === 'done' ? 'line-through' : 'none',
                marginBottom: task.status === 'progress' ? 4 : 0,
              }}>
                {task.label}
              </div>
              {task.status === 'progress' && (
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${task.progress}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ height: '100%', background: '#06b6d4', borderRadius: 100 }}
                  />
                </div>
              )}
            </div>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>
              {task.date}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ScreenMessages() {
  const messages = [
    { from: 'Franco', text: 'El catálogo está casi listo, revisalo cuando puedas ', time: 'hace 2h', isTeam: true },
    { from: 'Vos', text: 'Perfecto! Lo veo mañana. Gracias', time: 'hace 1h', isTeam: false },
    { from: 'Franco', text: 'Cuando apruebes, lo subimos al sitio en el día', time: 'hace 58min', isTeam: true },
  ]

  return (
    <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Mensajes con develOP</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'flex-end' }}>
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            style={{
              alignSelf: msg.isTeam ? 'flex-start' : 'flex-end',
              maxWidth: '78%',
            }}
          >
            {msg.isTeam && (
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 3, paddingLeft: 4 }}>
                {msg.from} · develOP
              </div>
            )}
            <div style={{
              background: msg.isTeam
                ? 'rgba(6,182,212,0.1)'
                : 'rgba(255,255,255,0.07)',
              border: `1px solid ${msg.isTeam ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: msg.isTeam ? '12px 12px 12px 3px' : '12px 12px 3px 12px',
              padding: '9px 12px',
              fontSize: 12,
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.45,
            }}>
              {msg.text}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 3, textAlign: msg.isTeam ? 'left' : 'right', padding: '0 4px' }}>
              {msg.time}
            </div>
          </motion.div>
        ))}

        {/* Input de mensaje */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
        }}>
          <span style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            Escribí un mensaje...
          </span>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'rgba(6,182,212,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M2 5h6M6 3l2 2-2 2" stroke="#06b6d4" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScreenVault() {
  const files = [
    { name: 'Accesos Google Ads', type: 'KEY', color: '#f59e0b' },
    { name: 'Logo oficial (todos los formatos)', type: 'ZIP', color: '#06b6d4' },
    { name: 'Manual de marca', type: 'PDF', color: '#8b5cf6' },
    { name: 'Contrato develOP', type: 'DOC', color: '#10b981' },
  ]

  return (
    <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Bóveda Digital</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>4 archivos</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {files.map((file, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10,
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${file.color}15`,
              border: `1px solid ${file.color}25`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 8,
              fontWeight: 700,
              color: file.color,
              letterSpacing: '0.05em',
            }}>
              {file.type}
            </div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', flex: 1 }}>
              {file.name}
            </span>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>↓</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ScreenAutomation() {
  const automations = [
    { name: 'Respuesta WhatsApp', runs: 147, status: 'active', color: '#25D366' },
    { name: 'Reporte semanal', runs: 4, status: 'active', color: '#06b6d4' },
    { name: 'Follow-up leads', runs: 23, status: 'active', color: '#8b5cf6' },
  ]

  return (
    <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Automatizaciones activas</div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontSize: 10, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
          3 activas
        </motion.div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {automations.map((auto, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              background: `${auto.color}08`,
              border: `1px solid ${auto.color}20`,
              borderRadius: 10,
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: auto.color,
                boxShadow: `0 0 8px ${auto.color}`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
                {auto.name}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: auto.color, lineHeight: 1 }}>
                {auto.runs}
              </div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>ejecuciones hoy</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stat total */}
      <div style={{
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          Horas ahorradas esta semana
        </span>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>14hs</span>
      </div>
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────

export function PortalDemo() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.3 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isInView) return
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % PORTAL_FEATURES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isInView])

  const active = PORTAL_FEATURES[activeFeature]

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#080a0c',
        padding: '120px 0',
      }}
    >
      {/* ──────── FONDO DECORATIVO ──────── */}

      {/* Glow central cyan */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80vw',
          height: '60vw',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 65%)`,
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Grid de puntos de fondo */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Línea superior decorativa */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${CYAN}40, transparent)`,
          pointerEvents: 'none',
        }}
      />

      {/* ──────── CONTENIDO PRINCIPAL ──────── */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px, 5vw, 32px)' }}>

        {/* ── Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: `1px solid ${CYAN}40`,
            borderRadius: 9999,
            padding: '6px 16px',
            background: `${CYAN}14`,
            marginBottom: 32,
          }}
        >
          <Layers size={12} color={CYAN} strokeWidth={1.5} />
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: CYAN,
            }}
          >
            Incluido en todos los proyectos
          </span>
        </motion.div>

        {/* ── Headline ── */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            margin: '0 0 20px',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>
            Tu negocio,{' '}
          </span>
          <span style={{ color: 'white' }}>
            bajo control total.
          </span>
        </motion.h2>

        {/* ── Subtítulo ── */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            fontSize: 17,
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.4)',
            maxWidth: 560,
            margin: '0 0 64px',
          }}
        >
          Cada cliente de develOP tiene su propio panel de control.
          Métricas, proyectos, mensajes y automatizaciones.
          <strong style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
            {' '}Todo en un solo lugar, desde el celular.
          </strong>
        </motion.p>

        {/* ── Grid principal: features izquierda + mockup derecha ── */}
        {/* Mobile: 1 columna (padding 16px) | Desktop: 2 columnas (padding 32px) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 48,
            alignItems: 'start',
          }}
        >
          {/* ── COLUMNA IZQUIERDA — Feature tabs ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PORTAL_FEATURES.map((feature, i) => {
              const isActive = i === activeFeature
              const IconComp = feature.icon
              return (
                <motion.button
                  key={feature.id}
                  onClick={() => setActiveFeature(i)}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: '14px 16px',
                    background: isActive ? `${feature.color}10` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isActive ? `${feature.color}30` : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 14,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 250ms ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Barra izquierda de acento */}
                  {isActive && (
                    <motion.div
                      layoutId="activeBar"
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: feature.color,
                        borderRadius: '3px 0 0 3px',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  {/* Ícono */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: isActive ? `${feature.color}20` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isActive ? `${feature.color}30` : 'rgba(255,255,255,0.08)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 250ms ease',
                    }}
                  >
                    <IconComp
                      size={16}
                      color={isActive ? feature.color : 'rgba(255,255,255,0.3)'}
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* Texto */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                        marginBottom: 4,
                        transition: 'color 250ms',
                      }}
                    >
                      {feature.label}
                    </div>
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              color: 'rgba(255,255,255,0.4)',
                              lineHeight: 1.5,
                              paddingTop: 2,
                            }}
                          >
                            {feature.description}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Progress bar en el tab activo */}
                  {isActive && isInView && (
                    <motion.div
                      key={`progress-${activeFeature}`}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: 2,
                        background: feature.color,
                        borderRadius: '0 2px 2px 0',
                      }}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 4, ease: 'linear' }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* ── COLUMNA DERECHA — Browser mockup ── */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}
          >
            {/* Browser header — barra macOS */}
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {/* Traffic lights */}
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ff5f57', '#ffbd2e', '#28c840'].map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: c,
                      opacity: 0.8,
                    }}
                  />
                ))}
              </div>
              {/* URL bar */}
              <div
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 6,
                  padding: '4px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 4px #10b981',
                  }}
                />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                  portal.develop.com.ar · Concesionaria San Miguel
                </span>
              </div>
            </div>

            {/* Contenido del portal — cambia según activeFeature */}
            <div style={{ height: 420, overflow: 'hidden', position: 'relative' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ height: '100%' }}
                >
                  {PORTAL_FEATURES[activeFeature].screen === 'analytics' && <ScreenAnalytics />}
                  {PORTAL_FEATURES[activeFeature].screen === 'ai-brief' && <ScreenAI />}
                  {PORTAL_FEATURES[activeFeature].screen === 'project' && <ScreenProject />}
                  {PORTAL_FEATURES[activeFeature].screen === 'messages' && <ScreenMessages />}
                  {PORTAL_FEATURES[activeFeature].screen === 'vault' && <ScreenVault />}
                  {PORTAL_FEATURES[activeFeature].screen === 'automation' && <ScreenAutomation />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ── SECCIÓN MÓDULOS PREMIUM ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ marginTop: 80 }}
        >
          {/* ── Header de módulos ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 32,
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <div>
              <div style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.3)',
                marginBottom: 8,
              }}>
                MÓDULOS ADICIONALES
              </div>
              <h3 style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'white',
                margin: 0,
                lineHeight: 1.1,
              }}>
                Desbloqueás lo que necesitás,
                <span style={{ color: CYAN }}> cuando lo necesitás.</span>
              </h3>
            </div>
            <div style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.3)',
              maxWidth: 260,
              lineHeight: 1.5,
            }}>
              9 módulos disponibles. Activás desde el panel, sin llamadas ni contratos.
            </div>
          </div>

          {/* ── Grid de módulos ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: 12,
          }}>
            {PREMIUM_MODULES.map((mod, i) => {
              const IconComp = mod.icon
              return (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'default',
                    transition: 'box-shadow 300ms',
                  }}
                  onHoverStart={(e) => {
                    const elem = e.target as HTMLElement
                    elem.style.boxShadow = `0 0 32px ${mod.color}15`
                    elem.style.borderColor = `${mod.color}25`
                  }}
                  onHoverEnd={(e) => {
                    const elem = e.target as HTMLElement
                    elem.style.boxShadow = 'none'
                    elem.style.borderColor = 'rgba(255,255,255,0.08)'
                  }}
                >
                  {/* ── Glow de fondo ── */}
                  <div style={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: mod.color,
                    opacity: 0.05,
                    filter: 'blur(20px)',
                    pointerEvents: 'none',
                  }}/>

                  {/* ── Ícono + precio ── */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: `${mod.color}15`,
                      border: `1px solid ${mod.color}25`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <IconComp size={18} color={mod.color} strokeWidth={1.5}/>
                    </div>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: mod.color,
                      background: `${mod.color}10`,
                      border: `1px solid ${mod.color}20`,
                      borderRadius: 100,
                      padding: '3px 8px',
                    }}>
                      {mod.price}<span style={{ fontWeight: 400, opacity: 0.7 }}>/mes</span>
                    </div>
                  </div>

                  {/* ── Label y descripción ── */}
                  <div>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.85)',
                      marginBottom: 6,
                      lineHeight: 1.3,
                    }}>
                      {mod.label}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.4)',
                      lineHeight: 1.5,
                    }}>
                      {mod.description}
                    </div>
                  </div>

                  {/* ── Badge "desbloqueable" ── */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.25)',
                    letterSpacing: '0.06em',
                  }}>
                    <div style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      border: '1px solid rgba(255,255,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <svg width="7" height="7" viewBox="0 0 7 7">
                        <rect x="1" y="3" width="5" height="4" rx="1" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" fill="none"/>
                        <path d="M2 3V2a1.5 1.5 0 013 0v1" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" fill="none"/>
                      </svg>
                    </div>
                    ACTIVABLE DESDE TU PANEL
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* ── Más módulos disponibles ── */}
          <div style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: 12,
            color: 'rgba(255,255,255,0.25)',
          }}>
            +5 módulos más disponibles — Agenda Inteligente, Social Media Hub, E-commerce y más
          </div>
        </motion.div>

        {/* ── CTA FINAL ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{
            marginTop: 80,
            padding: 'clamp(28px, 5vw, 48px) clamp(20px, 5vw, 40px)',
            background: `linear-gradient(135deg, rgba(6,182,212,0.08), rgba(6,182,212,0.03))`,
            border: '1px solid rgba(6,182,212,0.15)',
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 32,
            flexWrap: 'wrap',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* ── Glow decorativo ── */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '40%',
            height: '200%',
            background: `radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 60%)`,
            pointerEvents: 'none',
          }}/>

          {/* ── Texto izquierda ── */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.15em',
              color: CYAN,
              marginBottom: 12,
            }}>
              DEMO EN VIVO
            </div>
            <h3 style={{
              fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'white',
              margin: '0 0 10px',
              lineHeight: 1.15,
            }}>
              ¿Querés ver cómo quedaría para tu negocio?
            </h3>
            <p style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.4)',
              margin: 0,
              lineHeight: 1.5,
            }}>
              Acceso inmediato · Sin registrarte · Sin costo
            </p>
          </div>

          {/* ── CTAs derecha ── */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            flexShrink: 0,
            position: 'relative',
            zIndex: 1,
          }}>
            {/* ── CTA principal — demo en vivo ── */}
            <motion.a
              href="/login"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 28px',
                background: `linear-gradient(135deg, ${CYAN}, #0891b2)`,
                borderRadius: 12,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 700,
                color: 'white',
                letterSpacing: '0.04em',
                boxShadow: `0 0 32px rgba(6,182,212,0.3)`,
                whiteSpace: 'nowrap',
              }}
            >
              <Globe size={16} strokeWidth={1.5}/>
              Ver demo en vivo →
            </motion.a>

            {/* ── CTA secundario — WhatsApp ── */}
            <motion.a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola! Quiero ver cómo funcionaría el portal para mi negocio.')}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '11px 24px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                textDecoration: 'none',
                fontSize: 12,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.55)',
                whiteSpace: 'nowrap',
              }}
            >
              <MessageSquare size={14} strokeWidth={1.5}/>
              Preguntar por WhatsApp
            </motion.a>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
