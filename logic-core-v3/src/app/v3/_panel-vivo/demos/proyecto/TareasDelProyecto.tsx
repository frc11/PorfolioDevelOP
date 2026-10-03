'use client'

import { AlertCircle, AlertTriangle, ArrowRight, Calendar, Check, CheckCircle2, Clock, Loader2, MessageSquare, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useId, useState } from 'react'

import { Tabs, type ValueTabItem } from '@/components/ui/Tabs'
import { adminHoverCls } from '@/lib/hover'

import type { EstadoDeLaTarea, TareaDeEjemplo } from './datos'

/**
 * [NOCTURNO] B · LAS TAREAS DEL PROYECTO — COPIA de `components/dashboard/ProjectTaskTabs.tsx` (el aviso de las entregas
 * que esperan tu aprobación con su «Ver ahora», las pestañas En curso · Pendientes · Completadas con `Tabs` IMPORTADO de
 * `components/ui/Tabs.tsx`, las tareas con su estado, su impacto, su descripción al pasar y su vencimiento) y de
 * `TaskApprovalButtons.tsx` (aprobar con confirmación, pedir cambios con su texto). Lo que cambia, y por qué: aprobar y
 * pedir cambios llaman a server actions (acá, estado local con su aviso); «Hablar con el equipo» era un `<Link>` a
 * Mensajes (acá lleva a la demo del chat); el indicador de la pestaña usa un `layoutId` propio de esta demo (con el de
 * siempre volaría entre la miniatura y la grande).
 */
const IMPACT_MAP: Readonly<Record<string, string>> = {
  'Integración CMS': 'Podrás cargar y actualizar tu contenido sin depender del equipo técnico.',
  'Desarrollo frontend': 'La interfaz que tus clientes verán y usarán para interactuar con tu plataforma.',
  'Optimización SEO': 'Aumenta tu visibilidad en buscadores y atrae tráfico orgánico calificado.',
  Maquetación: 'Experiencia visual de alta gama que genera confianza inmediata en el usuario.',
}

const PESTANAS: readonly { readonly value: EstadoDeLaTarea; readonly label: string }[] = [
  { value: 'IN_PROGRESS', label: 'En curso' },
  { value: 'TODO', label: 'Pendientes' },
  { value: 'DONE', label: 'Completadas' },
]

export interface PropsDeLasTareas {
  readonly tareas: readonly TareaDeEjemplo[]
  readonly ahora: number
  readonly interactivo: boolean
  readonly alAprobar: (id: string) => void
  readonly alPedirCambios: (id: string, motivo: string) => void
  readonly alHablar?: () => void
}

export function TareasDelProyecto({ tareas, ahora, interactivo, alAprobar, alPedirCambios, alHablar }: PropsDeLasTareas): React.JSX.Element {
  const [pestana, setPestana] = useState<EstadoDeLaTarea>('IN_PROGRESS')
  const indicador = useId()
  const deLaPestana = (e: EstadoDeLaTarea): readonly TareaDeEjemplo[] => tareas.filter((t) => t.status === e)
  const pendientes = tareas.filter((t) => t.approvalStatus === 'PENDING_APPROVAL').length
  const conPendiente: EstadoDeLaTarea = (['DONE', 'IN_PROGRESS', 'TODO'] as const).find((e) => deLaPestana(e).some((t) => t.approvalStatus === 'PENDING_APPROVAL')) ?? 'DONE'
  const lista = deLaPestana(pestana)
  return (
    <div className="flex flex-col gap-5">
      <AnimatePresence>
        {pendientes > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 shadow-[0_0_30px_rgba(245,158,11,0.07)]">
            <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
                  <MessageSquare size={16} className="text-amber-400" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-300">
                    {pendientes} {pendientes === 1 ? 'entrega esperando' : 'entregas esperando'} tu aprobación
                  </p>
                  <p className="text-xs text-amber-500/70">El equipo no puede continuar hasta que apruebes. Revisá abajo.</p>
                </div>
              </div>
              {interactivo && (
                <button type="button" onClick={() => setPestana(conPendiente)} className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-400 transition-colors hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-amber-400">
                  Ver ahora
                  <ArrowRight size={11} aria-hidden />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Tabs layoutId={`tareas-${indicador}`} value={pestana} onValueChange={(v) => setPestana(v as EstadoDeLaTarea)} items={PESTANAS.map<ValueTabItem>((t) => ({ value: t.value, label: t.label, badge: deLaPestana(t.value).length }))} />
      <AnimatePresence mode="wait">
        <motion.div key={pestana} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }} className="flex flex-col gap-3">
          {lista.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-zinc-950/70 py-14 text-center">
              <CheckCircle2 size={28} className="text-zinc-700" aria-hidden />
              <p className="text-sm text-zinc-600">Sin tareas en esta categoría</p>
            </div>
          ) : (
            lista.map((t, i) => <Tarea key={t.id} tarea={t} indice={i} ahora={ahora} interactivo={interactivo} alAprobar={alAprobar} alPedirCambios={alPedirCambios} />)
          )}
        </motion.div>
      </AnimatePresence>
      {lista.length > 0 && alHablar && (
        <div className="flex justify-end">
          <button type="button" onClick={alHablar} className="flex cursor-pointer items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 transition-colors hover:text-cyan-400 focus-visible:outline-2 focus-visible:outline-cyan-400">
            Hablar con el equipo
            <ArrowRight size={10} aria-hidden />
          </button>
        </div>
      )}
    </div>
  )
}

function Tarea({ tarea: t, indice, ahora, interactivo, alAprobar, alPedirCambios }: { readonly tarea: TareaDeEjemplo; readonly indice: number; readonly ahora: number; readonly interactivo: boolean; readonly alAprobar: (id: string) => void; readonly alPedirCambios: (id: string, motivo: string) => void }): React.JSX.Element {
  const hecha = t.status === 'DONE'
  const pendiente = t.approvalStatus === 'PENDING_APPROVAL'
  const urgente = t.venceEnDias !== null && t.venceEnDias >= 0 && t.venceEnDias <= 3
  const impacto = IMPACT_MAP[t.title]
  const Icono = hecha ? CheckCircle2 : t.status === 'IN_PROGRESS' ? Loader2 : Clock
  return (
    <div className={`grid rounded-[24px] ${adminHoverCls}`}>
      <motion.div initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 26, delay: indice * 0.04 }} className={['group relative rounded-[24px] border border-white/10 bg-black/20 px-5 py-5 transition-colors sm:px-6', urgente && !hecha ? 'border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.06)]' : '', pendiente ? 'border-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.06)]' : ''].join(' ')}>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Icono size={16} aria-hidden className={`shrink-0 ${hecha ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : t.status === 'IN_PROGRESS' ? 'animate-spin text-blue-400 motion-reduce:animate-none' : 'text-zinc-600'}`} />
              <p className={`text-sm font-semibold tracking-tight transition-colors ${hecha ? 'text-zinc-500 line-through decoration-zinc-700/80' : 'text-zinc-100 group-hover:text-white'}`}>{t.title}</p>
              {pendiente && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400 motion-reduce:animate-none" />
                  Requiere aprobación
                </span>
              )}
              {t.approvalStatus === 'APPROVED' && <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200">✓ Aprobado</span>}
            </div>
            {impacto && <p className="mt-1 max-w-lg pl-6 text-xs italic leading-relaxed text-zinc-600">{impacto}</p>}
            {t.description && (
              <div className="max-h-0 overflow-hidden transition-all duration-500 group-hover:mt-3 group-hover:max-h-32 group-focus-within:mt-3 group-focus-within:max-h-32">
                <div className="border-t border-white/5 pt-3 pl-6">
                  <p className="max-w-2xl text-[11px] leading-relaxed text-zinc-500">{t.description}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
            {t.venceEnDias !== null && (
              <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium ${urgente && !hecha ? 'border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.12)]' : 'border-white/10 bg-black/20 text-zinc-400'}`}>
                {urgente && !hecha ? <AlertTriangle size={11} className="shrink-0" aria-hidden /> : <Calendar size={11} className="shrink-0" aria-hidden />}
                <span>{new Date(ahora + t.venceEnDias * 86_400_000).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>
                {urgente && !hecha && <span className="font-semibold">· {t.venceEnDias <= 0 ? 'Hoy' : `${String(t.venceEnDias)}d`}</span>}
              </div>
            )}
            {pendiente && interactivo && <Aprobacion alAprobar={() => alAprobar(t.id)} alPedirCambios={(motivo) => alPedirCambios(t.id, motivo)} />}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/** Aprobar o pedir cambios (COPIA de `TaskApprovalButtons.tsx`, sin las server actions). */
function Aprobacion({ alAprobar, alPedirCambios }: { readonly alAprobar: () => void; readonly alPedirCambios: (motivo: string) => void }): React.JSX.Element {
  const [modo, setModo] = useState<'idle' | 'approve-confirm' | 'reject-form'>('idle')
  const [motivo, setMotivo] = useState('')
  const campo = useId()
  const boton = 'cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400'
  return (
    <div className="mt-4 overflow-hidden">
      <AnimatePresence mode="wait">
        {modo === 'approve-confirm' && (
          <motion.div key="approve-confirm" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden />
              <p className="text-xs font-medium text-zinc-300">¿Confirmás que la entrega está ok?</p>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setModo('idle')} className={`rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300 ${boton}`}>
                Cancelar
              </button>
              <button type="button" onClick={alAprobar} className={`flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/25 ${boton}`}>
                <Check size={12} aria-hidden />
                Sí, confirmar
              </button>
            </div>
          </motion.div>
        )}
        {modo === 'reject-form' && (
          <motion.div key="reject-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-zinc-900/40 p-3">
            <label htmlFor={campo} className="text-xs font-medium text-zinc-400">
              ¿Qué cambios necesitás?
            </label>
            <textarea id={campo} value={motivo} onChange={(e) => setMotivo(e.target.value)} className="min-h-[72px] w-full resize-none rounded-lg border border-white/5 bg-black/20 p-2.5 text-sm text-zinc-200 outline-none transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50" placeholder="Ej: Faltan agregar dos secciones en la página de inicio..." />
            <div className="mt-1 flex justify-end gap-2">
              <button type="button" onClick={() => { setModo('idle'); setMotivo('') }} className={`rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300 ${boton}`}>
                Cancelar
              </button>
              <button type="button" disabled={!motivo.trim()} onClick={() => { alPedirCambios(motivo.trim()); setModo('idle'); setMotivo('') }} className={`flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-500 transition-all hover:bg-amber-500/20 disabled:opacity-50 ${boton}`}>
                Enviar solicitud
              </button>
            </div>
          </motion.div>
        )}
        {modo === 'idle' && (
          <motion.div key="buttons" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center gap-3">
            <button type="button" onClick={() => setModo('approve-confirm')} className={`flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold tracking-wide text-emerald-400 transition-all hover:bg-emerald-500/20 hover:text-emerald-300 ${boton}`}>
              <Check size={14} aria-hidden />
              Aprobar entrega
            </button>
            <button type="button" onClick={() => setModo('reject-form')} className={`flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-xs font-medium text-amber-500/80 transition-all hover:bg-amber-500/10 hover:text-amber-400 ${boton}`}>
              <X size={14} aria-hidden />
              Solicitar cambios
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
