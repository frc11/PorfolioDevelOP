'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter'
import { AnimatedProgressBar } from '@/components/dashboard/AnimatedProgressBar'
import { adminHoverCls } from '@/lib/hover'

import { MarcoDelPanel } from '../../MarcoDelPanel'
import { usePasos } from '../../reproduccion'
import { AVANCES_DE_EJEMPLO, PROYECTO_DE_EJEMPLO, RITMO_DEL_PROYECTO, TAREAS_DE_EJEMPLO, type Aprobacion } from './datos'
import { TareasDelProyecto } from './TareasDelProyecto'

/**
 * [NOCTURNO] B · FEATURE 6 — «Mirá el resumen de tu proyecto». Mi proyecto del panel (`/dashboard/project`): el
 * encabezado con el estado, la tarjeta del avance (el porcentaje con `AnimatedCounter` y la barra con
 * `AnimatedProgressBar`, IMPORTADOS), las fichas del proyecto y las tareas (COPIA, `TareasDelProyecto.tsx`). El marcado
 * de la página es COPIA de `app/(protected)/dashboard/project/page.tsx` (una página de servidor), sin «Monto acordado»
 * (en la landing no hay precios). El equipo termina una tarea y entrega otra para aprobar; el visitante la aprueba (o
 * pide cambios) y el avance se mueve.
 */
export default function Proyecto(): React.JSX.Element {
  const [ahora] = useState(() => Date.now())
  const { paso } = usePasos(AVANCES_DE_EJEMPLO.length, RITMO_DEL_PROYECTO.pasoMs)
  const [decisiones, setDecisiones] = useState<Readonly<Record<string, Aprobacion>>>({})
  const tareas = TAREAS_DE_EJEMPLO.map((t) => {
    const avance = AVANCES_DE_EJEMPLO.slice(0, paso).find((a) => a.id === t.id)
    const conAvance = avance === undefined ? t : { ...t, status: avance.status, approvalStatus: avance.approvalStatus }
    const decision = decisiones[t.id]
    return decision === undefined ? conAvance : { ...conAvance, approvalStatus: decision }
  })
  const hechas = tareas.filter((t) => t.status === 'DONE').length
  const avance = Math.round((hechas / tareas.length) * 100)
  const fecha = (semanas: number): string => new Date(ahora + semanas * 7 * 86_400_000).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
  const fichas = [
    { label: 'Tipo', value: PROYECTO_DE_EJEMPLO.tipo },
    { label: 'Inicio', value: fecha(-PROYECTO_DE_EJEMPLO.inicioHaceSemanas) },
    { label: 'Entrega estimada', value: fecha(PROYECTO_DE_EJEMPLO.entregaEnSemanas) },
  ]

  return (
    <MarcoDelPanel item="proyecto" conPausa>
      <div className="flex flex-col gap-8">
        <header className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs tracking-tight text-zinc-500">Tablero</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Mi proyecto</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">Estado actual y hoja de ruta estratégica</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-200">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
              </span>
              En Curso
            </span>
          </div>
        </header>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold tracking-tight text-white">{PROYECTO_DE_EJEMPLO.nombre}</h3>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-400">{PROYECTO_DE_EJEMPLO.descripcion}</p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
              <div className="flex items-baseline gap-1" aria-label={`${String(avance)} % del proyecto completado`}>
                <AnimatedCounter value={avance} className="text-3xl font-semibold tracking-tight text-white" />
                <span className="text-xl font-semibold text-zinc-500">%</span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                {hechas}/{tareas.length} tareas completadas
              </p>
            </div>
          </div>
          <AnimatedProgressBar progressPct={avance} />
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
            {fichas.map((f) => (
              <div key={f.label} className={`rounded-2xl border border-white/10 bg-black/20 p-4 ${adminHoverCls}`}>
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">{f.label}</p>
                <p className="mt-2 text-sm text-white">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
        <TareasDelProyecto
          tareas={tareas}
          ahora={ahora}
          interactivo
          alAprobar={(id) => {
            setDecisiones((d) => ({ ...d, [id]: 'APPROVED' }))
            toast.success('Entregable aprobado correctamente (ejemplo)')
          }}
          alPedirCambios={(id) => {
            setDecisiones((d) => ({ ...d, [id]: 'REJECTED' }))
            toast.success('Cambios solicitados enviados a develOP (ejemplo)')
          }}
        />
      </div>
    </MarcoDelPanel>
  )
}
