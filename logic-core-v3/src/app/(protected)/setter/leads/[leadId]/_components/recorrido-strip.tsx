'use client'

import { useMemo, useRef, type Ref } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, Layers } from 'lucide-react'
import { zIndex } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import type { RecorridoVecino, RecorridoView } from '@/lib/leados/recorrido'
import { ShortcutsHelp, type Atajo } from '@/app/(protected)/setter/_components/shortcuts-help'
import {
  useKeyboardShortcuts,
  type ShortcutMap,
} from '@/app/(protected)/setter/_components/use-keyboard-shortcuts'

/** Href que preserva el contexto de cola para que prev/next sigan recorriendo. */
function colaHref(leadId: string, cola: string): string {
  return `/setter/leads/${leadId}?cola=${cola}`
}

const ATAJOS_RECORRIDO: Atajo[] = [
  { accion: 'Siguiente lead', teclas: ['j', '→'] },
  { accion: 'Lead anterior', teclas: ['k', '←'] },
  { accion: 'Volver a la cartera', teclas: ['b'] },
  { accion: 'Esta ayuda', teclas: ['?'] },
]

type NavBtnProps = {
  vecino: RecorridoVecino
  cola: string
  direccion: 'anterior' | 'siguiente'
  linkRef?: Ref<HTMLAnchorElement>
}

function NavBtn({ vecino, cola, direccion, linkRef }: NavBtnProps) {
  const esSiguiente = direccion === 'siguiente'
  const Icon = esSiguiente ? ArrowRight : ArrowLeft
  const texto = esSiguiente ? 'Siguiente' : 'Anterior'

  const contenido = (
    <>
      {!esSiguiente && <Icon size={14} strokeWidth={1.5} className="shrink-0" />}
      <span className="hidden sm:inline">{texto}</span>
      {esSiguiente && <Icon size={14} strokeWidth={1.5} className="shrink-0" />}
    </>
  )

  if (!vecino) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-white/[0.06] px-2.5 py-1.5 text-xs font-medium text-zinc-600"
      >
        {contenido}
      </span>
    )
  }

  return (
    <Link
      ref={linkRef}
      href={colaHref(vecino.id, cola)}
      aria-label={`${texto}: ${vecino.businessName}`}
      title={vecino.businessName}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-zinc-300 outline-none transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400/40"
    >
      {contenido}
    </Link>
  )
}

/**
 * Barra de recorrido (sticky) del detalle de lead. Aparece SOLO cuando se entró
 * desde una cola (`?cola=…`): prev/next encadenan los leads de esa cola sin
 * volver al home. No acciona nada — cada lead abre su wizard con sus gates.
 *
 * Atajos de teclado: `j`/`→` siguiente, `k`/`←` anterior, `b` volver. NO saltean
 * nada — disparan exactamente el mismo `<Link>` que el click (vía `.click()`
 * sobre el ancla ya renderizada), así el teclado hace LO MISMO que el mouse.
 */
export function RecorridoStrip({ recorrido }: { recorrido: RecorridoView }) {
  const { cola, label, total, posicion, anterior, siguiente } = recorrido
  const enCola = posicion !== null
  const colaVacia = !enCola && siguiente === null

  const anteriorRef = useRef<HTMLAnchorElement>(null)
  const siguienteRef = useRef<HTMLAnchorElement>(null)
  const volverRef = useRef<HTMLAnchorElement>(null)

  const bindings = useMemo<ShortcutMap>(() => {
    const irSiguiente = () => siguienteRef.current?.click()
    const irAnterior = () => anteriorRef.current?.click()
    const volver = () => volverRef.current?.click()
    return {
      j: irSiguiente,
      n: irSiguiente,
      ArrowRight: irSiguiente,
      k: irAnterior,
      p: irAnterior,
      ArrowLeft: irAnterior,
      b: volver,
    }
  }, [])
  useKeyboardShortcuts(bindings)

  return (
    <>
      {/* Ancla oculta para el atajo `b` — el "Volver" visible vive en el header. */}
      <Link ref={volverRef} href="/setter" hidden aria-hidden tabIndex={-1} />

      <nav
        aria-label={`Recorrido de la cola ${label}`}
        style={{ zIndex: zIndex.sticky }}
        className={cn(
          'sticky top-0 -mx-1 flex items-center justify-between gap-3 rounded-xl px-3 py-2',
          'border border-white/[0.08] bg-[var(--color-void)]/80 backdrop-blur-[20px] backdrop-saturate-[180%]',
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {colaVacia ? (
            <CheckCircle2 size={15} strokeWidth={1.5} className="shrink-0 text-emerald-400" />
          ) : (
            <Layers size={15} strokeWidth={1.5} className="shrink-0 text-cyan-400" />
          )}
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-zinc-200">{label}</p>
            <p className="truncate text-[11px] text-zinc-500">
              {enCola
                ? `Lead ${posicion} de ${total}`
                : colaVacia
                  ? 'Cola completa — no queda nada por trabajar'
                  : 'Listo en esta cola — seguí con el siguiente'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {colaVacia ? (
            <Link
              href="/setter"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-zinc-300 outline-none transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400/40"
            >
              <ArrowLeft size={14} strokeWidth={1.5} />
              Volver a tu cartera
            </Link>
          ) : (
            <>
              <NavBtn vecino={anterior} cola={cola} direccion="anterior" linkRef={anteriorRef} />
              <NavBtn vecino={siguiente} cola={cola} direccion="siguiente" linkRef={siguienteRef} />
            </>
          )}
        </div>
      </nav>

      <ShortcutsHelp atajos={ATAJOS_RECORRIDO} />
    </>
  )
}
