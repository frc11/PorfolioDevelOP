import Link from 'next/link'
import { ArrowRight, ExternalLink, Hourglass } from 'lucide-react'
import { cadenciaInfo, formatFechaCorta, PLANTILLAS_FOLLOW_UP } from '@/lib/leados/flow'
import { GUIA_ESPERA } from '@/lib/leados/guidance-content'
import { ofreceSalida, rutaManual, type PosicionManual } from '@/lib/leados/manual'
import { TEXTO_TURNO, TURNO_DE_CAUSA, type CausaEspera } from '@/lib/leados/turno'
import { LineaRicaText } from '@/app/(protected)/setter/_components/teach-panel'
import { ManualHeader, type CabeceraLead } from './manual-nav'
import { FranjaRecorrido } from './franja-recorrido'

type EstadoManualProps = {
  leadId: string
  /** El contexto de cabecera del lead (5.6) — badges, links, notas, asignación. */
  cabecera: CabeceraLead
  tipo: 'espera' | 'revision'
  /**
   * QUÉ se está esperando, derivado en el server con `causaDeEspera` (fuente
   * única). De acá sale TAMBIÉN el turno (`TURNO_DE_CAUSA`), así que el titular
   * y su porqué no pueden decir cosas distintas.
   *
   * NO es lo mismo que `tipo`: la pantalla de espera se muestra tanto cuando
   * falta que conteste el negocio como cuando Franco aprobó y todavía no cargó
   * el link — dos causas distintas en la MISMA pantalla, que es exactamente lo
   * que antes se decía con una sola frase.
   */
  causa: CausaEspera
  /** ISO del próximo toque agendado — solo lo usa el estado de espera. */
  proximoToque: string | null
  /**
   * Conteo de SIN_RESPUESTA (opener incluido) — el MISMO que alimenta `cadenciaInfo`
   * en m5. Vive acá porque «cuándo es el próximo toque» sin «en cuál vas» se lee
   * idéntico con cero toques y con dos: de ese número depende algo concreto —
   * cuántos le quedan antes de que el negocio se enfríe.
   */
  followUpCount: number
  /**
   * El borrador publicado (`dossier.draftUrl`). Es lo que Franco está mirando
   * mientras la espera dura: sin él, la pantalla decía a quién se espera pero no
   * sobre qué. `null` = todavía no se publicó nada.
   */
  draftUrl: string | null
  posicion: PosicionManual
}

/**
 * Las dos pantallas de ESTADO del mapa (espera de respuesta / en revisión). No
 * son pantallas del manual: sin checklist, sin captura — tono de espera (zinc,
 * sin cyan: la pelota no la tiene el setter). Desde acá la navegación hacia
 * atrás sigue libre (la franja del recorrido, P20), y en espera se puede saltar
 * a registrar un toque (m5) si algo pasa antes de la fecha.
 *
 * El titular dice DE QUIÉN ES EL TURNO y lo dice solo: el manual de usuario
 * tuvo que enseñar a leer la etiqueta de estado al lado del nombre del negocio
 * para saber si la espera era del negocio o de Franco (H-02). Una pantalla que
 * necesita esa lectura auxiliar no está diciendo lo que hace falta.
 *
 * Y debajo del turno, QUÉ se espera. El turno solo no alcanzaba: «Le toca a
 * Franco» cubría por igual la demo en su cola de revisión y la demo ya aprobada
 * a la que le falta su link permanente — una dura lo que dure una revisión, la
 * otra se destraba con un campo. El texto que las distingue ya existía en el
 * envío (m15) y en el pie del wizard; acá se REUSA, no se reescribe.
 */
export function EstadoManual({
  leadId,
  cabecera,
  tipo,
  causa,
  proximoToque,
  followUpCount,
  draftUrl,
  posicion,
}: EstadoManualProps) {
  const esEspera = tipo === 'espera'
  const texto = TEXTO_TURNO[TURNO_DE_CAUSA[causa]]
  // Las palabras de la causa salen de una TABLA indexada por el dato derivado —
  // no de un `if` sobre stage/finalUrl acá adentro. `null` = esta causa no tiene
  // frase propia porque ya la dice el turno, o porque la dice el dato (abajo).
  const palabrasDeLaCausa = GUIA_ESPERA[causa]

  // Lo que la cadencia sabe y el turno no: en cuál toque va y cuándo es el
  // próximo. La maquinaria la calcula (`cadenciaInfo`, la misma de m5); acá solo
  // se muestra. Clampado igual que m5 — nunca «4 de 3».
  const cadencia = cadenciaInfo(followUpCount)
  const toques =
    followUpCount > 0
      ? `Toques: ${Math.min(cadencia.toquesHechos, PLANTILLAS_FOLLOW_UP.length)} de ${PLANTILLAS_FOLLOW_UP.length}`
      : null
  const situacionDelNegocio = proximoToque
    ? `Próximo toque el ${formatFechaCorta(proximoToque)}${toques ? ` · ${toques}` : ''} — vuelve a tu cola de trabajo cuando llegue.`
    : cadencia.agotada
      ? `${toques ?? 'Sin toques registrados'} — la cadencia se completó: no queda otro toque para mandar. Si no respondió, el lead se enfría y el cierre lo decide Franco.`
      : `Sin próximo toque agendado${toques ? ` · ${toques}` : ''} — si contesta, registralo y el flujo sigue solo.`

  // P23: la condición vive en `ofreceSalida` — el bloque de avance de las otras
  // pantallas la lee para NO ofrecer la vuelta que cerraba el ciclo.
  const puedeRegistrar = esEspera && ofreceSalida('espera', 'm5', posicion)

  return (
    <div className="space-y-5">
      <ManualHeader cabecera={cabecera} />

      {/* P20 — la franja va en el MISMO lugar que en las pantallas de trabajo:
          entre la cabecera y el titular. Acá ningún paso queda marcado como el
          actual, y es la verdad: en una espera no hay paso del setter. Lo que sí
          se lee es cuánto quedó hecho y qué viene cuando la pelota vuelva. */}
      <FranjaRecorrido leadId={leadId} posicion={posicion} pantalla={tipo} />

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
        <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-zinc-400">{texto.detalle}</p>

        {/* Qué se está esperando. Frase propia de la causa, o —cuando la causa es
            el negocio— el estado real de la cadencia, que es más preciso. */}
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-zinc-400">
          {palabrasDeLaCausa ? (
            <LineaRicaText linea={palabrasDeLaCausa} />
          ) : (
            situacionDelNegocio
          )}
        </p>

        {/* Sobre QUÉ es la espera: el borrador que el setter publicó. */}
        {draftUrl && (
          <a
            href={draftUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-zinc-200"
          >
            <ExternalLink size={12} strokeWidth={1.5} aria-hidden className="shrink-0" />
            <span className="truncate">{draftUrl}</span>
          </a>
        )}

        {puedeRegistrar && (
          <Link
            href={rutaManual(leadId, 'm5')}
            className="mt-4 flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-zinc-100"
          >
            ¿Respondió o pasó algo antes? Registralo
            <ArrowRight size={12} strokeWidth={1.5} aria-hidden />
          </Link>
        )}
      </section>
    </div>
  )
}
