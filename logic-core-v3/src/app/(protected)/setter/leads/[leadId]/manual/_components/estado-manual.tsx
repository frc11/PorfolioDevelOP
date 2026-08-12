import Link from 'next/link'
import { ArrowRight, Hourglass } from 'lucide-react'
import { formatFechaCorta } from '@/lib/leados/flow'
import { rutaManual, type PosicionManual } from '@/lib/leados/manual'
import { TEXTO_TURNO, type Turno } from '@/lib/leados/turno'
import { ManualHeader, NavAtras, type CabeceraLead } from './manual-nav'

type EstadoManualProps = {
  leadId: string
  /** El contexto de cabecera del lead (5.6) — badges, links, notas, asignación. */
  cabecera: CabeceraLead
  tipo: 'espera' | 'revision'
  /**
   * De quién es el turno, derivado en el server con `turnoDelLead` (fuente
   * única). NO es lo mismo que `tipo`: la pantalla de espera se muestra tanto
   * cuando falta que conteste el negocio como cuando Franco aprobó y todavía no
   * cargó el link — dos turnos distintos en la MISMA pantalla, que es
   * exactamente lo que antes se decía con una sola frase.
   */
  turno: Turno
  /** ISO del próximo toque agendado — solo lo usa el estado de espera. */
  proximoToque: string | null
  posicion: PosicionManual
}

/**
 * Las dos pantallas de ESTADO del mapa (espera de respuesta / en revisión). No
 * son pantallas del manual: sin checklist, sin indicador de fase, sin captura —
 * tono de espera (zinc, sin cyan: la pelota no la tiene el setter). Desde acá
 * la navegación hacia atrás sigue libre, y en espera se puede saltar a
 * registrar un toque (m5) si algo pasa antes de la fecha.
 *
 * El titular dice DE QUIÉN ES EL TURNO y lo dice solo: el manual de usuario
 * tuvo que enseñar a leer la etiqueta de estado al lado del nombre del negocio
 * para saber si la espera era del negocio o de Franco (H-02). Una pantalla que
 * necesita esa lectura auxiliar no está diciendo lo que hace falta.
 */
export function EstadoManual({
  leadId,
  cabecera,
  tipo,
  turno,
  proximoToque,
  posicion,
}: EstadoManualProps) {
  const esEspera = tipo === 'espera'
  const texto = TEXTO_TURNO[turno]
  // Lo que está pasando, además del turno. Con el turno de Franco la causa es él
  // (revisa la demo, o le falta cargar el link) y su texto ya lo cubre.
  const situacion =
    turno !== 'negocio'
      ? null
      : proximoToque
        ? `Próximo toque el ${formatFechaCorta(proximoToque)} — el foco te lo trae cuando llegue.`
        : 'Sin próximo toque agendado — si contesta, registralo y el flujo sigue solo.'
  const puedeRegistrar = esEspera && posicion.habilitadas.includes('m5')

  return (
    <div className="space-y-5">
      <ManualHeader cabecera={cabecera} />

      <section
        aria-label={texto.titulo}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5"
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-zinc-500/60" />
        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
          <Hourglass size={13} strokeWidth={1.5} aria-hidden className="shrink-0" />
          {esEspera ? 'En espera' : 'En revisión'}
        </p>
        {/* h2: con el corte 5.6 el h1 de la página es el negocio (cabecera). */}
        <h2 className="mt-2 text-xl font-black leading-tight tracking-tight text-zinc-100 sm:text-2xl">
          {texto.titulo}
        </h2>
        <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-zinc-400">
          {texto.detalle}
          {situacion ? ` ${situacion}` : ''}
        </p>

        {puedeRegistrar && (
          <Link
            href={rutaManual(leadId, 'm5')}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-zinc-100"
          >
            ¿Respondió o pasó algo antes? Registralo
            <ArrowRight size={12} strokeWidth={1.5} aria-hidden />
          </Link>
        )}
      </section>

      <NavAtras leadId={leadId} pasoActivo={tipo} posicion={posicion} />
    </div>
  )
}
