'use client'

import { Bell, Bot, Calendar, CheckCircle2, DollarSign, Info, Loader2, Lock, Mail, MessageCircle, Receipt, ShoppingBag, Star, TrendingUp, Unlock, Users, type LucideIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

import { adminHoverCls } from '@/lib/hover'
import type { ShowroomState } from '@/lib/modules/showroom'

/**
 * [NOCTURNO] B · LA TARJETA DE UN MÓDULO — COPIA de `components/dashboard/PremiumModuleCard.tsx` (los tres estados de la
 * vitrina: Activo, Disponible, Próximamente; el ícono con su color, el nivel, la descripción, «Ver detalles» y el botón
 * que pasa de «idle» a «cargando» a «listo»). Lo que cambia, y por qué: sin el precio por mes (en la landing no hay
 * precios, ni de ejemplo) ni la fecha de lanzamiento escrita a mano; el pedido no llama a `requestUpsellAction` (server
 * action) ni navega a Mensajes: queda registrado en la demo, con su aviso.
 */
export const ICONOS: Readonly<Record<string, LucideIcon>> = { Bot, Calendar, DollarSign, Mail, MessageCircle, Receipt, ShoppingBag, Star, TrendingUp, Users }
export const NIVELES: Readonly<Record<string, string>> = { TIER_1_OPERATION: 'Operación', TIER_2_GROWTH: 'Crecimiento', TIER_3_VERTICAL: 'Vertical' }

export interface ModuloDeLaVitrina {
  readonly slug: string
  readonly name: string
  readonly shortDescription: string
  readonly longDescription: string
  readonly tier: string
  readonly iconName: string
  readonly accentColor: string
  readonly estado: ShowroomState
}

type Pedido = 'idle' | 'pending' | 'success'

function BotonDePedido({ pedido, alTocar, icono, idle, cargando, listo, interactivo }: { readonly pedido: Pedido; readonly alTocar: () => void; readonly icono: ReactNode; readonly idle: string; readonly cargando: string; readonly listo: string; readonly interactivo: boolean }): React.JSX.Element {
  const clase = ['flex min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl border py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-300', pedido === 'success' ? 'cursor-default border-emerald-500/25 bg-emerald-500/10 text-emerald-400' : 'border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50'].join(' ')
  const contenido = (
    <AnimatePresence mode="wait">
      {pedido === 'pending' ? (
        <motion.span key="loading" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center gap-2">
          <Loader2 size={11} className="animate-spin" aria-hidden />
          {cargando}
        </motion.span>
      ) : pedido === 'success' ? (
        <motion.span key="success" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
          <CheckCircle2 size={11} aria-hidden />
          {listo}
        </motion.span>
      ) : (
        <motion.span key="idle" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center gap-2">
          {icono}
          {idle}
        </motion.span>
      )}
    </AnimatePresence>
  )
  return interactivo ? (
    <motion.button type="button" onClick={alTocar} disabled={pedido !== 'idle'} whileTap={pedido === 'idle' ? { scale: 0.97 } : undefined} className={`${clase} cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400`}>
      {contenido}
    </motion.button>
  ) : (
    <span className={clase}>{contenido}</span>
  )
}

/** El pedido de un módulo: «cargando» un momento y «listo» (no se manda nada). */
export function usePedidoDeEjemplo(aviso: string, reducido: boolean): { readonly pedido: Pedido; readonly pedir: () => void } {
  const [pedido, setPedido] = useState<Pedido>('idle')
  const reloj = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(reloj.current), [])
  const pedir = (): void => {
    if (pedido !== 'idle') return
    setPedido('pending')
    reloj.current = window.setTimeout(() => {
      setPedido('success')
      toast.success(aviso)
    }, reducido ? 0 : 900)
  }
  return { pedido, pedir }
}

export function TarjetaDeModulo({ modulo, alVerDetalle, interactivo, reducido }: { readonly modulo: ModuloDeLaVitrina; readonly alVerDetalle?: (slug: string) => void; readonly interactivo: boolean; readonly reducido: boolean }): React.JSX.Element {
  const Icon = ICONOS[modulo.iconName] ?? Bot
  const { accentColor: acento } = modulo
  const esPropio = modulo.estado === 'owned'
  const proximamente = modulo.estado === 'coming_soon'
  const { pedido, pedir } = usePedidoDeEjemplo(proximamente ? `Te avisamos cuando esté ${modulo.name} (ejemplo)` : `Le avisamos al equipo que querés ${modulo.name} (ejemplo)`, reducido)
  const verDetalle =
    interactivo && alVerDetalle ? (
      <button type="button" onClick={() => alVerDetalle(modulo.slug)} aria-label={`Ver detalles de ${modulo.name}`} title="Ver detalles" className="flex w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-400">
        <Info size={15} strokeWidth={1.5} aria-hidden />
      </button>
    ) : (
      <span className="flex w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400">
        <Info size={15} strokeWidth={1.5} aria-hidden />
      </span>
    )
  const exito = pedido === 'success'
  return (
    <div className={['relative flex h-full min-h-[260px] flex-col gap-4 overflow-hidden rounded-[24px] border p-5', esPropio || (exito && !proximamente) ? 'border-emerald-500/25 bg-emerald-500/[0.03]' : proximamente ? (exito ? 'border-amber-400/25 bg-amber-500/[0.05]' : 'border-white/10 bg-black/20 opacity-90') : `border-white/10 bg-black/20 ${adminHoverCls}`].join(' ')}>
      {/* [PASADA FINAL] B3 · el brillo era un `blur-[50px]`: un degradé radial, sin filtro. */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-40" style={{ background: `radial-gradient(closest-side, ${acento}, transparent)` }} />
      <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: `${acento}1A`, border: `1px solid ${acento}33`, boxShadow: `0 0 16px ${acento}26`, color: acento }}>
            <Icon size={20} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">{NIVELES[modulo.tier]}</p>
            <h3 className="text-sm font-medium text-white">{modulo.name}</h3>
          </div>
        </div>
        {esPropio ? (
          <span className="flex w-fit shrink-0 items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Activo
          </span>
        ) : (
          <span className={['flex w-fit shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]', proximamente ? 'border-amber-400/20 bg-amber-500/10 text-amber-200' : 'border-white/10 bg-white/5 text-zinc-300'].join(' ')}>
            {proximamente ? null : <Lock size={9} aria-hidden />}
            {proximamente ? 'Próximamente' : 'Premium'}
          </span>
        )}
      </div>
      <p className="relative z-10 text-sm leading-6 text-zinc-400">{modulo.shortDescription}</p>
      {esPropio ? (
        <div className="relative z-10 mt-auto flex flex-col gap-2.5">
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] px-3.5 py-3 text-xs font-medium text-emerald-200/90">Ya lo tenés activo en tu cuenta.</div>
          {interactivo && alVerDetalle ? (
            <button type="button" onClick={() => alVerDetalle(modulo.slug)} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-300 transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-400">
              <Info size={11} strokeWidth={1.5} aria-hidden />
              Ver detalles
            </button>
          ) : null}
        </div>
      ) : proximamente ? (
        <div className="relative z-10 mt-auto flex flex-col gap-2.5">
          <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.05] px-3.5 py-3 text-xs font-medium text-amber-200">Todavía no está disponible para contratar. Dejanos tu interés y te avisamos apenas lo lancemos.</div>
          <div className="flex items-stretch gap-2.5">
            {verDetalle}
            <BotonDePedido pedido={pedido} alTocar={pedir} icono={<Bell size={11} aria-hidden />} idle="Avisame cuando esté" cargando="Registrando interés..." listo="Te avisamos" interactivo={interactivo} />
          </div>
        </div>
      ) : (
        <>
          <div className="relative z-10 mt-auto flex items-end justify-end gap-3">
            <div className="rounded-lg px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ background: `${acento}1A`, border: `1px solid ${acento}26`, color: acento }}>
              Disponible
            </div>
          </div>
          <div className="relative z-10 flex items-stretch gap-2.5">
            {verDetalle}
            <BotonDePedido pedido={pedido} alTocar={pedir} icono={<Unlock size={11} aria-hidden />} idle="Desbloquear Módulo" cargando="Enviando solicitud..." listo="Solicitud enviada" interactivo={interactivo} />
          </div>
        </>
      )}
    </div>
  )
}
