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
import { ManualHeader, NavAtras, NavConstruccion, type CabeceraLead } from './manual-nav'

/**
 * Zona-slot del layout-tipo. Todas las pantallas del manual están migradas
 * (corte 5.6): las tres zonas siempre llegan con contenido real, así que acá
 * solo se enmarca — sin contenido no se renderiza nada (mismo criterio que ya
 * usaba la reentrada para sus zonas vacías, P3#10).
 */
function Zona({ etiqueta, children }: { etiqueta: string; children?: ReactNode }) {
  if (!children) return null
  return (
    <section aria-label={etiqueta} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
        {etiqueta}
      </p>
      <div className="mt-2">{children}</div>
    </section>
  )
}

type PantallaManualProps = {
  leadId: string
  /** El contexto de cabecera del lead (5.6) — badges, links, notas, asignación. */
  cabecera: CabeceraLead
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
 * (bloque copiable / link externo), su captura y su avance. El indicador es POR
 * FASE —nunca global— y solo cuenta pantallas donde hay más de una (P9). Solo
 * presentación: la posición viene derivada del server y los gates reales viven
 * en el motor.
 */
export function PantallaManual({
  leadId,
  cabecera,
  pantalla,
  posicion,
  encabezado,
  contexto,
  municion,
  captura,
}: PantallaManualProps) {
  const esActual = pantalla.id === posicion.actual
  // C-17: el cyan "Tu paso ahora" se reserva a lo accionable (disciplina B9). Un
  // `actual` con `habilitadas` vacía es una pantalla terminal (DESCARTADA en m2,
  // agendada en m16): sigue siendo la actual (para el guard de la página y la
  // salida "Ir a tu paso"), pero NO es un paso para trabajar → tono zinc, sin cyan.
  const esPasoActivo = esActual && posicion.habilitadas.length > 0
  const completada = posicion.completadas.includes(pantalla.id)
  const indicador = indicadorDeFase(pantalla.id)
  const esConstruccion = pantalla.fase === 'construccion'

  return (
    <div className="space-y-5">
      <ManualHeader cabecera={cabecera} />

      {encabezado}

      {/* La instrucción — protagonista. Marco cyan solo si es el paso de AHORA
          (disciplina B9: el cyan se reserva a lo accionable). */}
      <section
        aria-label="Instrucción de esta pantalla"
        className={cn(
          'relative overflow-hidden rounded-2xl border p-5',
          esPasoActivo
            ? 'border-cyan-400/25 bg-cyan-500/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
            : 'border-white/10 bg-white/[0.03]',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute inset-y-0 left-0 w-1',
            esPasoActivo ? 'bg-cyan-400/80' : 'bg-zinc-600/60',
          )}
        />
        <div className="flex flex-wrap items-center gap-2">
          {indicador && (
            <p
              className={cn(
                'text-[11px] font-medium uppercase tracking-[0.18em]',
                esPasoActivo ? 'text-cyan-300/80' : 'text-zinc-500',
              )}
            >
              {/* P9 — el contador solo aparece donde la fase tiene más de una
                  pantalla. Con el colapso de Construcción (P6-B) nueve de las
                  diez fases quedaron con una sola, y «paso 1 de 1» no informa
                  nada: ahí se lee el nombre de la fase, y listo. */}
              {indicador.fase}
              {indicador.m > 1 && ` — paso ${indicador.n} de ${indicador.m}`}
            </p>
          )}
          {pantalla.tipo === 'reentrada' && (
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-rose-300/80">
              Reentrada — correcciones de Franco
            </p>
          )}
          {esPasoActivo ? (
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

        {/* h2: con el corte 5.6 el h1 de la página es el negocio (cabecera). */}
        <h2 className="mt-2 text-xl font-black leading-tight tracking-tight text-white sm:text-2xl">
          {pantalla.titulo}
        </h2>
        {pantalla.detalle && (
          <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-zinc-400">
            {pantalla.detalle}
          </p>
        )}
      </section>

      {/* Las tres zonas del layout-tipo — slots que las pantallas reales llenan.
          Zona no renderiza nada sin contenido (reentrada y cualquier slot vacío). */}
      <Zona etiqueta="Contexto del lead">{contexto}</Zona>
      <Zona etiqueta="Munición">{municion}</Zona>
      <Zona etiqueta="Registro">{captura}</Zona>

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
