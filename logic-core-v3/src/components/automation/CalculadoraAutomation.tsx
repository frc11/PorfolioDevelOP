'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react'

/** 
 * CALCULADORA AUTOMATION: "La Máquina del Tiempo"
 * Un componente que visualiza el ahorro de tiempo y dinero mediante automatización.
 */

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface ROIResultados {
  tareasMes: number
  horasManuales: number
  horasAhorradas: number
  ahorroUSD: number
  ahorroARS: number
  diasLibres: number
  costoAutomation: number
  roiNeto: number
  roiPct: number
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function AtmosphereCalc() {
  return (
    <>
      {/* Glow ámbar principal */}
      <div 
        aria-hidden="true"
        style={{
          position:'absolute',
          top:'-40px', left:'50%',
          transform:'translateX(-50%)',
          width:'900px', height:'600px',
          background:'radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, rgba(249,115,22,0.04) 40%, transparent 65%)',
          filter:'blur(100px)',
          pointerEvents:'none',
          zIndex:0,
        }}
      />

      {/* Glow naranja izquierda */}
      <div 
        aria-hidden="true"
        style={{
          position:'absolute',
          top:'20%', left:'-8%',
          width:'450px', height:'500px',
          background:'radial-gradient(ellipse, rgba(249,115,22,0.05) 0%, transparent 60%)',
          filter:'blur(90px)',
          pointerEvents:'none',
          zIndex:0,
        }}
      />

      {/* Glow ámbar derecha */}
      <div 
        aria-hidden="true"
        style={{
          position:'absolute',
          top:'30%', right:'-8%',
          width:'500px', height:'500px',
          background:'radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 60%)',
          filter:'blur(90px)',
          pointerEvents:'none',
          zIndex:0,
        }}
      />

      {/* Grid monospace de fondo */}
      <div 
        aria-hidden="true"
        style={{
          position:'absolute',
          inset:0,
          backgroundImage:`radial-gradient(circle, rgba(245,158,11,0.07) 1px, transparent 1px)`,
          backgroundSize:'52px 52px',
          pointerEvents:'none',
          zIndex:0,
          maskImage:'radial-gradient(ellipse at 50% 50%, black 0%, transparent 70%)',
          WebkitMaskImage:'radial-gradient(ellipse at 50% 50%, black 0%, transparent 70%)',
        }}
      />
    </>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="text-center mb-10 md:mb-16">
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="inline-flex items-center gap-2 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6 bg-amber-500/5"
      >
        <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] text-amber-500 font-bold">
          [ LA MÁQUINA DEL TIEMPO ]
        </span>
      </motion.div>

      <motion.h2
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4"
      >
        Automatizar no es un gasto.
        <br />
        <span className="bg-gradient-to-r from-[#f59e0b] to-[#f97316] bg-clip-text text-transparent">
          "Es comprar tiempo de vida."
        </span>
      </motion.h2>

      <motion.p
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.38 }}
        className="text-white/40 text-base md:text-lg max-w-xl mx-auto"
      >
        Mové el slider y mirá cuántas horas recupera tu equipo este mes.
      </motion.p>
    </div>
  )
}

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
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center text-[12px] font-mono">
        <span className="text-white/40">{label}</span>
        <span className="text-amber-500/80 font-bold">
          {formatValue ? formatValue(value) : `${value} ${unit}`}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-500/40 rounded-full transition-[width] duration-100"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-x-0 w-full opacity-0 cursor-pointer z-10"
        />
        <div
          className="absolute w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-[#070709] shadow-lg pointer-events-none transition-[left] duration-100"
          style={{ left: `calc(${pct}% - 7px)` }}
        />
      </div>
    </div>
  )
}

function SliderSide({
  tareasAlDia,
  setTareasAlDia,
  minutosPorTarea,
  setMinutosPorTarea,
  costoHoraUSD,
  setCostoHoraUSD,
  showAdvanced,
  setShowAdvanced,
  isInView,
}: {
  tareasAlDia: number
  setTareasAlDia: (v: number) => void
  minutosPorTarea: number
  setMinutosPorTarea: (v: number) => void
  costoHoraUSD: number
  setCostoHoraUSD: (v: number) => void
  showAdvanced: boolean
  setShowAdvanced: (v: boolean) => void
  isInView: boolean
}) {
  const mainPct = ((tareasAlDia - 5) / (200 - 5)) * 100
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div 
      initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.35 }}
      className="flex flex-col gap-9"
    >
      {/* Slider Principal - Grande */}
      <div className="group">
        <div className="flex justify-between items-end mb-6">
          <label className="text-sm md:text-base text-white/60 leading-relaxed max-w-[240px]">
            Tareas manuales que hace tu equipo por día
          </label>
          <motion.span
            key={tareasAlDia}
            initial={{ scale: 1.1, color: '#f59e0b' }}
            animate={{ scale: 1, color: '#ffffff' }}
            className="text-5xl md:text-6xl font-black font-mono leading-none tracking-tighter"
          >
            {tareasAlDia}
          </motion.span>
        </div>

        <div className="relative h-10 flex items-center">
          {/* Rail */}
          <div className="absolute h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-[width] duration-100"
              style={{ width: `${mainPct}%` }}
            />
          </div>
          {/* Input Invisible */}
          <input
            type="range"
            min={5}
            max={200}
            step={5}
            value={tareasAlDia}
            onChange={(e) => setTareasAlDia(Number(e.target.value))}
            className="absolute inset-x-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          {/* Thumb Custom */}
          <div
            className="absolute w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full border-[3px] border-[#070709] shadow-[0_0_20px_rgba(245,158,11,0.6),0_4px_10px_rgba(0,0,0,0.5)] pointer-events-none transition-[left] duration-100 z-20"
            style={{ left: `calc(${mainPct}% - 14px)` }}
          />
        </div>

        <div className="flex justify-between mt-4">
          <span className="text-[10px] font-mono text-white/20 tracking-wider">5 TAREAS/DÍA</span>
          <span className="text-[10px] font-mono text-white/20 tracking-wider">200 TAREAS/DÍA</span>
        </div>
      </div>

      {/* Ejemplos de Tareas */}
      <div className="p-4 bg-amber-500/[0.03] border border-amber-500/10 rounded-2xl">
        <p className="text-[10px] font-mono font-bold text-amber-500/60 tracking-[0.2em] mb-4 uppercase">
          Ejemplos de tareas automatizables
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {[
            '📧 Envíos de seguimiento',
            '🧾 Carga de facturas AFIP',
            '📊 Reportes de ventas',
            '💬 Respuesta a consultas',
          ].map((t, i) => (
            <p key={i} className="text-xs text-white/30 flex items-center gap-2">
              <span className="w-1 h-1 bg-amber-500/30 rounded-full" /> {t}
            </p>
          ))}
        </div>
      </div>

      {/* Controles Avanzados */}
      <div className="pt-2">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="group flex items-center gap-2 text-xs font-mono text-amber-500/50 hover:text-amber-500 transition-colors"
        >
          <motion.span
            animate={{ rotate: showAdvanced ? 90 : 0 }}
            className="inline-block"
          >
            ▶
          </motion.span>
          {showAdvanced ? 'OCULTAR PARÁMETROS' : 'PERSONALIZAR PARÁMETROS'}
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-6 pt-6 px-1">
                <SliderMini
                  label="Tiempo promedio por tarea"
                  value={minutosPorTarea}
                  min={2}
                  max={45}
                  step={1}
                  unit="min"
                  onChange={setMinutosPorTarea}
                />
                <SliderMini
                  label="Costo hora del equipo (estimado)"
                  value={costoHoraUSD}
                  min={5}
                  max={100}
                  step={5}
                  unit="USD"
                  formatValue={(v) => `$${v} USD/hs`}
                  onChange={setCostoHoraUSD}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function OdometerDigit({
  value,
  fontSize = '64px',
  color = '#f59e0b',
}: {
  value: number
  fontSize?: string
  color?: string
}) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isRolling, setIsRolling] = useState(false)
  const prevRef = useRef(value)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (value === prevRef.current) return

    if (shouldReduceMotion) {
      setDisplayValue(value)
      prevRef.current = value
      return
    }

    setIsRolling(true)
    const timer = setTimeout(() => {
      setDisplayValue(value)
      setIsRolling(false)
      prevRef.current = value
    }, 120)

    return () => clearTimeout(timer)
  }, [value, shouldReduceMotion])

  return (
    <div 
      className="overflow-hidden leading-none relative" 
      style={{ height: `calc(${fontSize} * 1.1)` }}
    >
      <motion.span
        animate={isRolling ? { y: '-110%', opacity: 0 } : { y: '0%', opacity: 1 }}
        transition={{ duration: 0.12, ease: 'easeIn' }}
        className="block font-black font-mono"
        style={{ fontSize, color, lineHeight: 1.1 }}
      >
        {displayValue.toLocaleString('es-AR')}
      </motion.span>

      {isRolling && (
        <motion.span
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: 0.12, ease: 'easeOut', delay: 0.1 }}
          className="block absolute top-0 left-0 font-black font-mono"
          style={{ fontSize, color, lineHeight: 1.1 }}
        >
          {value.toLocaleString('es-AR')}
        </motion.span>
      )}
    </div>
  )
}

function OdometerSide({ resultados, isInView }: { resultados: ROIResultados, isInView: boolean }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div 
      initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.45 }}
      className="flex flex-col gap-4"
    >
      {/* Card principal — HORAS */}
      <div className="relative group overflow-hidden p-6 md:p-9 rounded-[20px] border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-orange-600/5">
        {/* Shimmer top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/80 to-transparent" />

        <p className="text-[10px] md:text-[11px] font-mono font-bold text-amber-500/60 tracking-[0.2em] mb-2 uppercase">
          HORAS QUE RECUPERA TU EQUIPO
        </p>

        <div className="flex items-end gap-2">
          <OdometerDigit
            value={resultados.horasAhorradas}
            fontSize="clamp(52px, 7vw, 80px)"
            color="#f59e0b"
          />
          <span className="text-xl md:text-2xl text-amber-500/60 font-mono mb-2">hs/mes</span>
        </div>

        <p className="text-[13px] md:text-sm text-white/35 mt-2">
          Equivalente a <strong className="text-white font-bold">{resultados.diasLibres} días laborales</strong> libres
        </p>

        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-6">
          <motion.div
            animate={{ width: `${Math.min((resultados.horasAhorradas / 200) * 100, 100)}%` }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
          />
        </div>
      </div>

      {/* Grid 2 cards secundarias */}
      <div className="grid grid-cols-2 gap-3">
        {/* USD */}
        <div className="p-4 md:p-5 bg-white/[0.02] border border-amber-500/10 rounded-2xl">
          <p className="text-[10px] font-mono font-bold text-amber-500/50 tracking-wider mb-2 uppercase">
            AHORRO USD/MES
          </p>
          <div className="flex items-end gap-0.5">
            <span className="text-sm text-amber-500/60 mb-1">$</span>
            <OdometerDigit value={resultados.ahorroUSD} fontSize="24px" color="#f59e0b" />
            <span className="text-[10px] text-white/20 mb-1 ml-1 font-mono">USD</span>
          </div>
        </div>

        {/* ROI */}
        <div className={`p-4 md:p-5 border rounded-2xl transition-colors ${
          resultados.roiPct > 0 
            ? 'bg-emerald-500/5 border-emerald-500/20' 
            : 'bg-red-500/5 border-red-500/20'
        }`}>
          <p className={`text-[10px] font-mono font-bold tracking-wider mb-2 uppercase ${
            resultados.roiPct > 0 ? 'text-emerald-500/50' : 'text-red-500/50'
          }`}>
            ROI MENSUAL
          </p>
          <div className="flex items-end gap-0.5">
            <OdometerDigit 
              value={resultados.roiPct} 
              fontSize="24px" 
              color={resultados.roiPct > 0 ? '#10b981' : '#ef4444'} 
            />
            <span className={`text-sm mb-1 ${
              resultados.roiPct > 0 ? 'text-emerald-500/60' : 'text-red-500/60'
            }`}>%</span>
          </div>
        </div>
      </div>

      {/* CTA Integrado */}
      <motion.a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%20DevelOP%2C%20calculé%20que%20puedo%20ahorrar%20${resultados.horasAhorradas}%20horas%20al%20mes`}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-600 text-[#070709] font-black text-sm rounded-full shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all uppercase tracking-tight"
      >
        💬 Quiero ahorrar estas horas →
      </motion.a>

      <p className="text-[10px] font-mono text-white/15 text-center px-4 leading-relaxed">
        * Estimaciones basadas en tus valores. Automatización desde $280 USD/mes.
      </p>
    </motion.div>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function CalculadoraAutomation() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
  const shouldReduceMotion = useReducedMotion()

  // Estados
  const [tareasAlDia, setTareasAlDia] = useState(25)
  const [minutosPorTarea, setMinutosPorTarea] = useState(12)
  const [costoHoraUSD, setCostoHoraUSD] = useState(20)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Cálculos Automáticos
  const resultados = useMemo<ROIResultados>(() => {
    const tareasMes = tareasAlDia * 22
    const horasManuales = Math.round((tareasMes * minutosPorTarea) / 60)
    const horasAhorradas = Math.round(horasManuales * 0.88) // 88% de eficiencia n8n
    const ahorroUSD = Math.round(horasAhorradas * costoHoraUSD)
    const ahorroARS = ahorroUSD * 1100 // Cotización estimada
    const diasLibres = Math.round(horasAhorradas / 8)
    const costoAutomation = 240 // Suscripción y mantenimiento base
    const roiNeto = ahorroUSD - costoAutomation
    const roiPct = Math.round((roiNeto / costoAutomation) * 100)

    return {
      tareasMes,
      horasManuales,
      horasAhorradas,
      ahorroUSD,
      ahorroARS,
      diasLibres,
      costoAutomation,
      roiNeto,
      roiPct,
    }
  }, [tareasAlDia, minutosPorTarea, costoHoraUSD])

  return (
    <section
      id="calculadora"
      ref={sectionRef}
      className="relative w-full py-20 md:py-32 lg:py-40 px-6 sm:px-12 bg-[#070709] overflow-hidden z-[1]"
    >
      <AtmosphereCalc />

      <div className="relative max-w-6xl mx-auto z-10">
        <Header isInView={isInView} />

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-24 items-start">
          <SliderSide
            tareasAlDia={tareasAlDia}
            setTareasAlDia={setTareasAlDia}
            minutosPorTarea={minutosPorTarea}
            setMinutosPorTarea={setMinutosPorTarea}
            costoHoraUSD={costoHoraUSD}
            setCostoHoraUSD={setCostoHoraUSD}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            isInView={isInView}
          />

          <OdometerSide resultados={resultados} isInView={isInView} />
        </div>

        {/* Separador Final Ámbar */}
        <motion.div
          initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
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
