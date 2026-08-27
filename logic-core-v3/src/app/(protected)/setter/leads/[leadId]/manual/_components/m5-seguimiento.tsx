import { CalendarClock, MessageSquareText, Phone } from 'lucide-react'
import type { ActivityResult, LeadStatus } from '@prisma/client'
import { Badge } from '@/components/ui'
import { buildObjecionInputBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import {
  cadenciaInfo,
  formatFechaCorta,
  leadRespondio,
  PLANTILLAS_FOLLOW_UP,
  STATUS_LABELS,
} from '@/lib/leados/flow'
import { GUIA_SEGUIMIENTO } from '@/lib/leados/guidance-content'
import { CanalSeguridad } from '@/app/(protected)/setter/_components/canal-seguridad'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { GuardrailRol } from '@/app/(protected)/setter/_components/guardrail-rol'
import { LineaRicaText, TeachPanel } from '@/app/(protected)/setter/_components/teach-panel'
import {
  HerramientaLauncher,
  SalidaLinkPendiente,
} from '@/app/(protected)/setter/_components/tool-guide'
import { resultadoEtiqueta, resultadoTono } from '../../_components/lead-timeline.helpers'
import { SeguimientoForm } from './seguimiento-form'

/**
 * M5 — «Registrá lo que pasó» (5.5, tramo Seguimiento). PRESENTACIÓN del toque
 * de la conversación: la cadencia (+2/+2/+3-stop) la calcula `follow-up.ts` y la
 * lee `cadenciaInfo` (flow.ts) — el manual solo la muestra, jamás la re-calcula.
 *   - contexto: el estado de la cadencia (toques hechos, próximo toque, cadencia
 *     agotada) + el teléfono a mano (A-14) + el estado del lead;
 *   - munición: el mensaje base del próximo toque (templado, sin link), o —cuando
 *     la cadencia se agotó— la nota de cierre (no se ofrece un «no respondió» más);
 *   - registro: el form compartido del write-path (`registrarResultado`).
 * La estructura de cadencia agotada (al tercer toque sin respuesta, encausa al
 * cierre) es la del 2.x: `cadencia.agotada` ⇒ sin próximo toque; el cierre a
 * PERDIDO lo decide Franco desde admin, no el manual.
 */

/** Contexto: el estado de la cadencia (la maquinaria la calcula; acá solo se
 * muestra) + el teléfono re-servido + el estado del lead. */
export function M5Contexto({
  status,
  followUpCount,
  proximoToque,
  reactivateAt,
  leadPhone,
}: {
  status: LeadStatus
  followUpCount: number
  proximoToque: string | null
  reactivateAt: string | null
  leadPhone: string | null
}) {
  const respondio = leadRespondio(status)
  const cadencia = cadenciaInfo(followUpCount)
  // P3#5: el toque agendado ya pasó — mismo criterio de reloj request-time
  // que `followUpVencido` en `_data.ts` (server component, sin hidratación).
  const toqueVencido =
    Boolean(proximoToque) &&
    new Date(proximoToque as string).getTime() <= Date.now() &&
    !respondio &&
    status !== 'POSTERGADO'

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* A-14: el teléfono a mano mientras seguís la conversación. */}
        {leadPhone ? (
          <p className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Phone size={12} strokeWidth={1.5} className="shrink-0" />
            {leadPhone}
          </p>
        ) : (
          <p className="text-xs text-zinc-600">Sin teléfono cargado en la ficha.</p>
        )}
        <Badge tone="zinc" variant="outline">
          {STATUS_LABELS[status]}
        </Badge>
      </div>

      {/* El recuadro de cadencia: la calcula la maquinaria, acá solo se muestra. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <CalendarClock size={13} strokeWidth={1.5} />
          Toques:{' '}
          <span className="font-semibold text-zinc-300">
            {Math.min(cadencia.toquesHechos, PLANTILLAS_FOLLOW_UP.length)} de{' '}
            {PLANTILLAS_FOLLOW_UP.length}
          </span>
        </span>
        {status === 'POSTERGADO' && reactivateAt ? (
          <span>
            Postergado — se retoma el{' '}
            <span className="font-semibold text-zinc-300">{formatFechaCorta(reactivateAt)}</span>
          </span>
        ) : toqueVencido ? (
          <span className="text-amber-300/90">
            Toque vencido — era para el{' '}
            <span className="font-semibold">{formatFechaCorta(proximoToque as string)}</span>
          </span>
        ) : proximoToque && !respondio ? (
          <span>
            Próximo toque:{' '}
            <span className="font-semibold text-zinc-300">{formatFechaCorta(proximoToque)}</span>
          </span>
        ) : null}
        {/* Cadencia agotada (estructura de cierre del 2.x): sin más toques. El
            cierre lo cubre esta línea ámbar — no se repite abajo. */}
        {cadencia.agotada && !respondio && status !== 'POSTERGADO' && (
          <span className="w-full text-amber-300/90">
            Cadencia completa — sin más toques: si no respondió, el lead se enfría solo. El cierre
            lo decide Franco.
          </span>
        )}
        {/* El ritmo de la cadencia (3.6): mientras hay toques por delante. */}
        {!respondio && status !== 'POSTERGADO' && !cadencia.agotada && (
          <span className="w-full leading-relaxed text-zinc-500">
            <LineaRicaText
              linea={GUIA_SEGUIMIENTO.cadencia}
              emphasisClassName="font-semibold text-zinc-400"
            />
          </span>
        )}
      </div>
    </div>
  )
}

/** Munición: el mensaje base del próximo toque (templado, sin link) cuando hay
 * uno pendiente; cuando la cadencia se agotó (o el negocio respondió / está
 * postergado) no hay nada que mandar — se dice por qué, encausando al cierre.
 * Debajo, los guardrails del canal que el corte 5.6 trae del wizard: el freno
 * anti-spam (`CanalSeguridad`), el límite de rol (`GuardrailRol`) y el flujo de
 * objeciones (el Gem deflecta a reunión: nunca cotiza). */
export function M5Municion({
  status,
  followUpCount,
  lead,
  dmsHoy,
}: {
  status: LeadStatus
  followUpCount: number
  lead: CopyBlockLead
  dmsHoy: number
}) {
  const respondio = leadRespondio(status)
  const cadencia = cadenciaInfo(followUpCount)

  const mensajeToque = respondio ? (
    <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
      El negocio respondió: la cadencia se frenó. De acá el objetivo es uno solo — la reunión, que
      se agenda en «Agendá la reunión».
    </p>
  ) : status === 'POSTERGADO' ? (
    <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
      Contacto postergado — el panel lo retoma en la fecha que marcaste. No hay toque para mandar
      hasta entonces.
    </p>
  ) : cadencia.agotada || cadencia.proximoToque === null ? (
    // Cadencia agotada: sin próximo toque. NO se ofrece un «no respondió» más — el
    // lead se enfría y el cierre lo decide Franco (estructura de cierre del 2.x).
    <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
      La cadencia se completó: no queda un próximo toque para mandar. Si no respondió, el lead se
      enfría — el cierre lo decide Franco.
    </p>
  ) : (
    <CopyBlock
      titulo={`Mensaje base del toque ${cadencia.proximoToque} de ${PLANTILLAS_FOLLOW_UP.length}`}
      instruccion="Adaptalo al negocio antes de mandarlo — templado, sin link y sin precio."
      texto={PLANTILLAS_FOLLOW_UP[cadencia.proximoToque - 1]}
    />
  )

  return (
    <div className="space-y-4">
      {mensajeToque}

      <CanalSeguridad dmsHoy={dmsHoy} />

      <GuardrailRol />

      <details>
        <summary className="cursor-pointer text-xs font-medium text-zinc-500 hover:text-zinc-300">
          ¿Te tiraron una objeción? Armá el input del Gem
        </summary>
        <div className="mt-3 space-y-3">
          <TeachPanel id="objeciones" collapsible={false} />
          <CopyBlock
            titulo="Bloque para el Gem de outreach — objeciones"
            instruccion="Pegale la objeción al final. El Gem deflecta a reunión: nunca cotiza."
            texto={buildObjecionInputBlock(lead)}
          />
          {/* La misma salida que m4 da al lado de su píldora. Acá faltaba, y es
              el peor momento para chocar mudo contra «Link pendiente»: al setter
              le acaban de tirar una objeción. La píldora vive dentro de este
              plegable —la objeción es un caso, no el estado normal del toque—,
              así que la salida va a su lado: nunca más adentro que la pared que
              destraba. */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-600">Abrí el Gem para pegarlo:</span>
              <HerramientaLauncher id="gemOutreach" />
            </div>
            <SalidaLinkPendiente id="gemOutreach" />
          </div>
        </div>
      </details>
    </div>
  )
}

/** «Lo último de la charla» (5.1, B-10): el último toque comercial a la vista,
 * sin abrir el historial completo. Compacto, arriba del form — sin acordeón
 * nuevo. Si no hay actividades (lead recién entrado a seguimiento) no se
 * renderiza nada. */
function UltimaCharla({
  ultimoToque,
}: {
  ultimoToque: { fecha: string; resultado: ActivityResult; nota: string | null } | null
}) {
  if (!ultimoToque) return null

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-zinc-500">
      <p className="flex items-center gap-1.5 font-medium uppercase tracking-[0.14em] text-zinc-600">
        <MessageSquareText size={12} strokeWidth={1.5} />
        Lo último de la charla
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-zinc-400">{formatFechaCorta(ultimoToque.fecha)}</span>
        <Badge tone={resultadoTono(ultimoToque.resultado)} variant="soft">
          {resultadoEtiqueta(ultimoToque.resultado)}
        </Badge>
      </div>
      {ultimoToque.nota && <p className="mt-2 leading-relaxed text-zinc-400">{ultimoToque.nota}</p>}
    </div>
  )
}

/** Registro: el form compartido del write-path (misma action y schema que el
 * seguimiento del wizard). Con la cadencia agotada, «No respondió» deja de
 * ofrecerse — la deriva `cadenciaInfo` (la misma maquinaria del contexto), no
 * un cálculo propio. */
export function M5Registro({
  leadId,
  followUpCount,
  ultimoToque,
}: {
  leadId: string
  followUpCount: number
  ultimoToque: { fecha: string; resultado: ActivityResult; nota: string | null } | null
}) {
  const cadenciaAgotada = cadenciaInfo(followUpCount).agotada
  return (
    <div className="space-y-4">
      <UltimaCharla ultimoToque={ultimoToque} />
      <SeguimientoForm leadId={leadId} cadenciaAgotada={cadenciaAgotada} />
    </div>
  )
}
