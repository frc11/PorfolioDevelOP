'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react'

/**
 * INTEGRACIONES AUTOMATION: "¿Se conecta con lo que yo uso?"
 * Muestra el ecosistema de herramientas compatibles con n8n con conexiones en vivo.
 */

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface AppIntegration {
  id: string
  name: string
  emoji: string
  category: string
  color: string
  colorRgb: string
  popular: boolean   // badge "MÁS USADO"
}

interface AppCategory {
  id: string
  label: string
  icon: string
  apps: AppIntegration[]
}

// ─── DATA ───────────────────────────────────────────────────────────────────

const categories: AppCategory[] = [
  {
    id: 'comunicacion',
    label: 'Comunicación',
    icon: '💬',
    apps: [
      { id:'whatsapp', name:'WhatsApp', emoji:'💬', category:'comunicacion', color:'#25d366', colorRgb:'37,211,102', popular:true },
      { id:'gmail', name:'Gmail', emoji:'📧', category:'comunicacion', color:'#ea4335', colorRgb:'234,67,53', popular:true },
      { id:'slack', name:'Slack', emoji:'📨', category:'comunicacion', color:'#e01e5a', colorRgb:'224,30,90', popular:false },
      { id:'telegram', name:'Telegram', emoji:'✈️', category:'comunicacion', color:'#2ca5e0', colorRgb:'44,165,224', popular:false },
    ],
  },
  {
    id: 'pagos',
    label: 'Pagos & Facturación',
    icon: '💳',
    apps: [
      { id:'mercadopago', name:'MercadoPago', emoji:'💳', category:'pagos', color:'#00b1ea', colorRgb:'0,177,234', popular:true },
      { id:'afip', name:'AFIP', emoji:'🧾', category:'pagos', color:'#f59e0b', colorRgb:'245,158,11', popular:true },
      { id:'stripe', name:'Stripe', emoji:'⚡', category:'pagos', color:'#635bff', colorRgb:'99,91,255', popular:false },
      { id:'paypal', name:'PayPal', emoji:'🔵', category:'pagos', color:'#003087', colorRgb:'0,48,135', popular:false },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing & Ventas',
    icon: '📣',
    apps: [
      { id:'meta', name:'Meta Ads', emoji:'📣', category:'marketing', color:'#1877f2', colorRgb:'24,119,242', popular:true },
      { id:'googleads', name:'Google Ads', emoji:'🎯', category:'marketing', color:'#4285f4', colorRgb:'66,133,244', popular:false },
      { id:'hubspot', name:'HubSpot', emoji:'🧲', category:'marketing', color:'#ff7a59', colorRgb:'255,122,89', popular:false },
      { id:'mailchimp', name:'Mailchimp', emoji:'🐒', category:'marketing', color:'#ffe01b', colorRgb:'255,224,27', popular:false },
    ],
  },
  {
    id: 'productividad',
    label: 'Productividad',
    icon: '📋',
    apps: [
      { id:'sheets', name:'Google Sheets', emoji:'📊', category:'productividad', color:'#34a853', colorRgb:'52,168,83', popular:true },
      { id:'notion', name:'Notion', emoji:'📋', category:'productividad', color:'#ffffff', colorRgb:'255,255,255', popular:true },
      { id:'drive', name:'Google Drive', emoji:'📁', category:'productividad', color:'#4285f4', colorRgb:'66,133,244', popular:false },
      { id:'airtable', name:'Airtable', emoji:'🗃', category:'productividad', color:'#18bfff', colorRgb:'24,191,255', popular:false },
    ],
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    icon: '🛒',
    apps: [
      { id:'tiendanube', name:'Tiendanube', emoji:'☁️', category:'ecommerce', color:'#7b2fff', colorRgb:'123,47,255', popular:true },
      { id:'woocommerce', name:'WooCommerce', emoji:'🛒', category:'ecommerce', color:'#96588a', colorRgb:'150,88,138', popular:false },
      { id:'shopify', name:'Shopify', emoji:'🏪', category:'ecommerce', color:'#96bf48', colorRgb:'150,191,72', popular:false },
      { id:'mercadolibre', name:'Mercado Libre', emoji:'🛍', category:'ecommerce', color:'#ffe600', colorRgb:'255,230,0', popular:true },
    ],
  },
  {
    id: 'gestion',
    label: 'Gestión Interna',
    icon: '⚙️',
    apps: [
      { id:'calendar', name:'Google Calendar', emoji:'📅', category:'gestion', color:'#4285f4', colorRgb:'66,133,244', popular:true },
      { id:'trello', name:'Trello', emoji:'📌', category:'gestion', color:'#0052cc', colorRgb:'0,82,204', popular:false },
      { id:'asana', name:'Asana', emoji:'✅', category:'gestion', color:'#f06a6a', colorRgb:'240,106,106', popular:false },
      { id:'monday', name:'Monday', emoji:'📆', category:'gestion', color:'#ff3d57', colorRgb:'255,61,87', popular:false },
    ],
  },
]

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function AtmosphereInteg() {
  return (
    <>
      <div 
        aria-hidden="true"
        style={{
          position:'absolute',
          top:'-40px', left:'50%',
          transform:'translateX(-50%)',
          width:'900px', height:'600px',
          background:'radial-gradient(ellipse, rgba(245,158,11,0.07) 0%, rgba(249,115,22,0.03) 40%, transparent 65%)',
          filter:'blur(100px)',
          pointerEvents:'none',
          zIndex:0,
        }}
      />
      <div 
        aria-hidden="true"
        style={{
          position:'absolute',
          bottom:'10%', left:'-5%',
          width:'400px', height:'400px',
          background:'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 60%)',
          filter:'blur(80px)',
          pointerEvents:'none',
          zIndex:0,
        }}
      />
      <div 
        aria-hidden="true"
        style={{
          position:'absolute',
          top:'20%', right:'-5%',
          width:'400px', height:'500px',
          background:'radial-gradient(ellipse, rgba(245,158,11,0.05) 0%, transparent 60%)',
          filter:'blur(80px)',
          pointerEvents:'none',
          zIndex:0,
        }}
      />
    </>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="mb-10 md:mb-14">
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex items-center gap-2 mb-4"
      >
        <span className="text-amber-500 font-mono text-[11px] font-bold tracking-[0.2em]">
          [ +400 INTEGRACIONES ]
        </span>
      </motion.div>

      <motion.h2
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1]"
      >
        Todo lo que ya usás.
        <br />
        <span className="text-amber-500">Ahora conectado.</span>
      </motion.h2>

      <motion.p
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-white/40 text-sm md:text-base mt-6 max-w-xl"
      >
        n8n se conecta con más de 400 herramientas del mercado.
        Buscá la tuya y visualizá cómo entra a tu nuevo ecosistema automatizado.
      </motion.p>
    </div>
  )
}

function CategoryTabs({ 
  categories, 
  activeCategory, 
  setActiveCategory,
  isInView
}: { 
  categories: AppCategory[], 
  activeCategory: string | null, 
  setActiveCategory: (id: string | null) => void,
  isInView: boolean
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div 
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.35 }}
      className="flex gap-2.5 flex-wrap mb-10 md:mb-14"
    >
      <motion.button
        onClick={() => setActiveCategory(null)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all duration-300 border ${
          !activeCategory
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
            : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
        }`}
      >
        ✦ TODAS
      </motion.button>

      {categories.map(cat => (
        <motion.button
          key={cat.id}
          onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border ${
            activeCategory === cat.id
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
              : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
          }`}
        >
          <span className="text-sm leading-none">{cat.icon}</span>
          {cat.label.toUpperCase()}
        </motion.button>
      ))}
    </motion.div>
  )
}

function ConectorCanvas({
  hoveredApp,
  appRefs,
  centerRef,
}: {
  hoveredApp: string | null
  appRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
  centerRef: React.MutableRefObject<HTMLDivElement | null>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const progressRef = useRef(0)
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) return null

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const parent = canvas.parentElement
    if (!parent) return

    function resize() {
      if (!canvas || !parent) return
      const rect = parent.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    resize()

    if (!hoveredApp) {
      // Fade out progresivo
      function fadeOut() {
        if (!ctx || !canvas) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        progressRef.current = Math.max(0, progressRef.current - 0.05)
        if (progressRef.current > 0) {
          animRef.current = requestAnimationFrame(fadeOut)
        }
      }
      animRef.current = requestAnimationFrame(fadeOut)
      return
    }

    const appEl = appRefs.current[hoveredApp]
    const centerEl = centerRef.current
    if (!appEl || !centerEl) return

    const parentRect = parent.getBoundingClientRect()
    const appRect = appEl.getBoundingClientRect()
    const centerRect = centerEl.getBoundingClientRect()

    // Puntos de inicio y fin (coordenadas relativas al contenedor padre)
    const startX = appRect.left - parentRect.left + appRect.width / 2
    const startY = appRect.top - parentRect.top + appRect.height / 2
    const endX = centerRect.left - parentRect.left + centerRect.width / 2
    const endY = centerRect.top - parentRect.top + centerRect.height / 2

    function drawLine() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      progressRef.current = Math.min(1, progressRef.current + 0.04)
      const p = progressRef.current

      const currentX = startX + (endX - startX) * p
      const currentY = startY + (endY - startY) * p

      // Línea base (dashed)
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(currentX, currentY)
      ctx.strokeStyle = 'rgba(245,158,11,0.3)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 6])
      ctx.stroke()
      ctx.setLineDash([])

      // Línea brillante ajustable
      const grad = ctx.createLinearGradient(startX, startY, currentX, currentY)
      grad.addColorStop(0, 'rgba(245,158,11,0.8)')
      grad.addColorStop(0.5, 'rgba(255,200,80,1)')
      grad.addColorStop(1, 'rgba(249,115,22,0.6)')
      
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(currentX, currentY)
      ctx.strokeStyle = grad
      ctx.lineWidth = 2
      ctx.stroke()

      // Partícula en la punta
      if (p > 0.1) {
        const pg = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, 8)
        pg.addColorStop(0, 'rgba(255,220,100,0.9)')
        pg.addColorStop(1, 'rgba(245,158,11,0)')
        ctx.beginPath()
        ctx.arc(currentX, currentY, 8, 0, Math.PI * 2)
        ctx.fillStyle = pg
        ctx.fill()
      }

      if (p < 1 || hoveredApp) {
        animRef.current = requestAnimationFrame(drawLine)
      }
    }

    progressRef.current = 0
    animRef.current = requestAnimationFrame(drawLine)

    return () => cancelAnimationFrame(animRef.current)
  }, [hoveredApp, appRefs, centerRef])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:'absolute',
        inset:0,
        pointerEvents:'none',
        zIndex:5,
      }}
    />
  )
}

function AppsGrid({ 
  visibleApps, 
  hoveredApp, 
  setHoveredApp,
  appRefs,
  isInView
}: { 
  visibleApps: AppIntegration[], 
  hoveredApp: string | null, 
  setHoveredApp: (id: string | null) => void,
  appRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>,
  isInView: boolean
}) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.7, delay: 0.45 }}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 min-h-[400px]"
    >
      <AnimatePresence mode="popLayout">
        {visibleApps.map((app, i) => (
          <motion.div
            key={app.id}
            ref={(el) => { if (el) appRefs.current[app.id] = el }}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              duration: 0.4, 
              delay: i * 0.02,
              ease: [0.16, 1, 0.3, 1] 
            }}
            onMouseEnter={() => setHoveredApp(app.id)}
            onMouseLeave={() => setHoveredApp(null)}
            className={`relative p-5 rounded-2xl border transition-all duration-500 flex flex-col items-center gap-3 overflow-hidden ${
              hoveredApp === app.id
                ? `border-[rgba(${app.colorRgb},0.4)] bg-[rgba(${app.colorRgb},0.08)] shadow-[0_10px_25px_rgba(${app.colorRgb},0.1)]`
                : 'border-white/10 bg-white/[0.02]'
            }`}
          >
            {/* Pop Badge */}
            {app.popular && (
              <div className="absolute top-2 right-2 flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg z-10">
                <span className="text-[10px] text-[#070709] font-bold">✓</span>
              </div>
            )}

            {/* Hover Glow */}
            {hoveredApp === app.id && (
              <motion.div
                layoutId="glow"
                className="absolute inset-x-0 top-0 h-1/2 opacity-20 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 0%, rgba(${app.colorRgb},1) 0%, transparent 80%)`
                }}
              />
            )}

            <span className={`text-4xl transition-all duration-300 ${
              hoveredApp === app.id ? 'scale-110' : 'grayscale-[40%] opacity-50'
            }`}>
              {app.emoji}
            </span>

            <span className={`text-[11px] font-bold text-center leading-tight tracking-wide transition-colors duration-300 ${
              hoveredApp === app.id ? 'text-white' : 'text-white/30'
            }`}>
              {app.name.toUpperCase()}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function IntegracionesAutomation() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 })
  const shouldReduceMotion = useReducedMotion()

  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [hoveredApp, setHoveredApp] = useState<string | null>(null)

  const appRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const centerRef = useRef<HTMLDivElement>(null)

  const visibleApps = activeCategory
    ? categories.find(c => c.id === activeCategory)?.apps ?? []
    : categories.flatMap(c => c.apps)

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 md:py-32 lg:py-40 px-6 sm:px-12 bg-[#070709] overflow-hidden z-[1]"
    >
      <AtmosphereInteg />

      <div className="relative max-w-6xl mx-auto z-10">
        <Header isInView={isInView} />
        
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          isInView={isInView}
        />

        <div className="relative">
          <ConectorCanvas 
            hoveredApp={hoveredApp}
            appRefs={appRefs}
            centerRef={centerRef}
          />
          
          <AppsGrid
            visibleApps={visibleApps}
            hoveredApp={hoveredApp}
            setHoveredApp={setHoveredApp}
            appRefs={appRefs}
            isInView={isInView}
          />
        </div>

        {/* Nodo central n8n */}
        <div className="flex flex-col items-center mt-12 md:mt-20">
          <div className="relative">
            <motion.div
              ref={centerRef}
              initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex flex-col items-center justify-center shadow-[0_0_80px_rgba(245,158,11,0.15)] overflow-visible"
            >
              {/* Anillos pulsantes */}
              {[1, 2, 3].map(ring => (
                <div 
                  key={ring} 
                  className="absolute pointer-events-none rounded-full border border-amber-500/15"
                  style={{
                    inset: `${-ring * 14}px`,
                    animation: `ringPulseAmber 3s ${ring * 0.4}s ease-in-out infinite`
                  }}
                />
              ))}

              <span className="text-4xl md:text-5xl mb-1">⚡</span>
              <span className="text-[11px] font-black text-amber-500 tracking-[0.1em] font-mono leading-none">n8n</span>
              <span className="text-[8px] text-amber-500/50 font-mono tracking-widest mt-1">ORQUESTADOR</span>
            </motion.div>
          </div>

          <p className="text-center mt-10 md:mt-12 text-[10px] md:text-[11px] text-white/20 tracking-[0.2em] font-mono uppercase">
            Mostrando {visibleApps.length} de 400+ integraciones
          </p>
        </div>

        {/* Separador Final */}
        <motion.div
          initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.35) 30%, rgba(249,115,22,0.4) 50%, rgba(245,158,11,0.35) 70%, transparent)',
            transformOrigin: 'left center',
            marginTop: 'clamp(48px, 7vh, 80px)',
          }}
        />
      </div>
    </section>
  )
}
