import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  indicadorDeFase,
  rutaManual,
  type PantallaDef,
  type PosicionManual,
} from '@/lib/leados/manual'
import { ManualHeader, NavAtras, NavConstruccion } from './manual-nav'

/**
 * Zona-slot del layout-tipo. Con contenido lo enmarca; sin contenido muestra el
 * placeholder honesto del esqueleto (la pantalla real la llena al migrar) —
 * nunca una zona en blanco.
 */
function Zona({
  etiqueta,
  pendiente,
  children,
}: {
  etiqueta: string
  pendiente: string
  children?: ReactNode
}) {
  if (children) {
    return (
      <section
        aria-label={etiqueta}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
          {etiqueta}
        </p>
        <div className="mt-2">{children}</div>
      </section>
    )
  }
  return (
    <section
      aria-label={etiqueta}
      className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.015] p-4"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600">
        {etiqueta}
      </p>
      <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-zinc-600">{pendiente}</p>
    </section>
  )
}

type PantallaManualProps = {
  leadId: string
  businessName: string
  pantalla: PantallaDef
  posicion: PosicionManual
  /** Reentrada M-R: la nota de Franco va AL FRENTE, antes de la instrucción. */
  encabezado?: ReactNode
  /** Slots del layout-tipo — las pantallas reales los llenan al migrar. */
  contexto?: ReactNode
  municion?: ReactNode
  captura?: ReactNode
}

/**
 * El layout-tipo de pantalla del manual (Bloque 4): una pantalla = una tarea
 * atómica con su instrucción corta, su contexto re-servido, su munición
 * (bloque copiable / link externo), su captura y su avance. Indicador
 * "paso N de M" POR FASE — nunca global. Solo presentación: la posición viene
 * derivada del server y los gates reales viven en el motor.
 */
export function PantallaManual({
  leadId,
  businessName,
  pantalla,
  posicion,
  encabezado,
  contexto,
  municion,
  captura,
}: PantallaManualProps) {
  const esActual = pantalla.id === posicion.actual
  const completada = posicion.completadas.includes(pantalla.id)
  const indicador = indicadorDeFase(pantalla.id)
  const esConstruccion = pantalla.fase === 'construccion'
  // La reentrada (M-R) YA está migrada y no lleva munición ni registro propios
  // (el retrabajo va en las fases): sus zonas vacías se ocultan en vez de mostrar
  // el placeholder "sin migrar". Las pantallas 'manual' sin migrar sí lo muestran.
  const esReentrada = pantalla.tipo === 'reentrada'

  return (
    <div className="space-y-5">
      <ManualHeader leadId={leadId} businessName={businessName} />

      {encabezado}

      {/* La instrucción — protagonista. Marco cyan solo si es el paso de AHORA
          (disciplina B9: el cyan se reserva a lo accionable). */}
      <section
        aria-label="Instrucción de esta pantalla"
        className={cn(
          'relative overflow-hidden rounded-2xl border p-5',
          esActual
            ? 'border-cyan-400/25 bg-cyan-500/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
            : 'border-white/10 bg-white/[0.03]',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute inset-y-0 left-0 w-1',
            esActual ? 'bg-cyan-400/80' : 'bg-zinc-600/60',
          )}
        />
        <div className="flex flex-wrap items-center gap-2">
          {indicador && (
            <p
              className={cn(
                'text-[11px] font-medium uppercase tracking-[0.18em]',
                esActual ? 'text-cyan-300/80' : 'text-zinc-500',
              )}
            >
              {indicador.fase} — paso {indicador.n} de {indicador.m}
            </p>
          )}
          {pantalla.tipo === 'reentrada' && (
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-rose-300/80">
              Reentrada — correcciones de Franco
            </p>
          )}
          {esActual ? (
            <Badge tone="cyan" variant="soft">
              Tu paso ahora
            </Badge>
          ) : completada ? (
            <Badge tone="emerald" variant="soft">
              Completada
            </Badge>
          ) : (
            <Badge tone="zinc" variant="outline">
              Disponible
            </Badge>
          )}
        </div>

        <h1 className="mt-2 text-xl font-black leading-tight tracking-tight text-white sm:text-2xl">
          {pantalla.titulo}
        </h1>
        {pantalla.detalle && (
          <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-zinc-400">
            {pantalla.detalle}
          </p>
        )}
      </section>

      {/* Las tres zonas del layout-tipo — slots que las pantallas reales llenan.
          En la reentrada, solo las que tienen contenido (sin placeholders). */}
      {(contexto || !esReentrada) && (
        <Zona
          etiqueta="Contexto del lead"
          pendiente="Acá se re-sirve lo ya capturado que esta tarea necesita (ficha, evaluación o brief según la pantalla) — llega con la migración de esta pantalla."
        >
          {contexto}
        </Zona>
      )}
      {(municion || !esReentrada) && (
        <Zona
          etiqueta="Munición"
          pendiente="Acá va el bloque copiable o el link a la herramienta externa de esta tarea — llega con la migración de esta pantalla."
        >
          {municion}
        </Zona>
      )}
      {(captura || !esReentrada) && (
        <Zona
          etiqueta="Registro"
          pendiente="Acá se registra el resultado de la tarea (form, checks o tilde de avance) — mientras esta pantalla no migre, el registro sigue viviendo en el wizard del lead."
        >
          {captura}
        </Zona>
      )}

      {/* Avance: si no estás parado en tu paso, la salida corta es volver a él. */}
      {!esActual && (
        <section
          aria-label="Avance"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
        >
          <p className="text-xs leading-relaxed text-zinc-500">
            {completada
              ? 'Esta pantalla ya quedó hecha — mirala tranquilo, no se resetea nada.'
              : 'Esta pantalla está disponible — tu paso de ahora es otro.'}
          </p>
          <Link
            href={rutaManual(leadId, posicion.actual)}
            className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-medium text-cyan-200 transition-colors hover:bg-cyan-500/20"
          >
            Ir a tu paso actual
            <ArrowRight size={12} strokeWidth={1.5} aria-hidden />
          </Link>
        </section>
      )}

      {esConstruccion && (
        <NavConstruccion leadId={leadId} pasoActivo={pantalla.id} posicion={posicion} />
      )}

      <NavAtras leadId={leadId} pasoActivo={pantalla.id} posicion={posicion} />
    </div>
  )
}
