import Link from 'next/link'
import { ArrowRight, Hourglass } from 'lucide-react'
import { formatFechaCorta } from '@/lib/leados/flow'
import { rutaManual, type PosicionManual } from '@/lib/leados/manual'
import { ManualHeader, NavAtras } from './manual-nav'

type EstadoManualProps = {
  leadId: string
  businessName: string
  tipo: 'espera' | 'revision'
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
 */
export function EstadoManual({
  leadId,
  businessName,
  tipo,
  proximoToque,
  posicion,
}: EstadoManualProps) {
  const esEspera = tipo === 'espera'
  const detalle = esEspera
    ? proximoToque
      ? `Próximo toque el ${formatFechaCorta(proximoToque)} — el foco te lo trae cuando llegue.`
      : 'Sin próximo toque agendado — si el negocio responde, registralo y el flujo sigue solo.'
    : 'No hay nada que hacer ahora — te avisamos cuando la apruebe o pida cambios.'
  const puedeRegistrar = esEspera && posicion.habilitadas.includes('m5')

  return (
    <div className="space-y-5">
      <ManualHeader leadId={leadId} businessName={businessName} />

      <section
        aria-label={esEspera ? 'Esperando respuesta del negocio' : 'Demo en revisión'}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5"
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-zinc-500/60" />
        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
          <Hourglass size={13} strokeWidth={1.5} aria-hidden className="shrink-0" />
          {esEspera ? 'En espera' : 'En revisión'}
        </p>
        <h1 className="mt-2 text-xl font-black leading-tight tracking-tight text-zinc-100 sm:text-2xl">
          {esEspera ? 'Esperando respuesta del negocio' : 'Franco está revisando tu demo'}
        </h1>
        <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-zinc-400">{detalle}</p>

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
