import type { Evaluacion, Ficha } from '@/lib/leados/contracts'
import { buildOpenerInputBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import { CanalSeguridad } from '@/app/(protected)/setter/_components/canal-seguridad'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'
import { OpenerForm, OpenerResumen } from '../../_components/opener-form'

/**
 * M4 — «Mandá el opener» (5.2, tramo Opener del patrón 4.2/5.1). El primer
 * mensaje del flujo invertido, presentado como una tarea del manual con el
 * registro COMPARTIDO del wizard (`OpenerForm`: mismo camino de escritura, mismo
 * hard-block de link EN VIVO Y server-side, misma action `registrarOpener`):
 *   - contexto: el bloque del Gem de outreach re-servido (ficha + evaluación) —
 *     el MISMO builder del wizard (`buildOpenerInputBlock`), listo para copiar;
 *   - munición: el link al Gem de outreach (fuente `herramientas.ts`, la misma
 *     pieza `ToolGuide` del wizard) — el arma para redactar el opener;
 *   - registro: el form compartido (armar + copiar + registrar «lo mandé»), o el
 *     «Enviado» de consulta si el primer contacto ya quedó.
 * El avance no se setea acá: registrar el opener saca el lead del foco solo — la
 * posición se RE-DERIVA al estado de espera en el próximo request (el motor).
 */

/** Instrucción propia de M4: el bloque re-servido es el input del Gem (la de
 * `GUIA_OPENER` habla del wizard). */
const INSTRUCCION_BLOQUE_M4 =
  'Ficha + evaluación empaquetadas para el Gem — copialas, pegalas ahí y que redacte el opener.'

/** Contexto: el bloque del Gem de outreach, re-servido y listo para copiar —
 * el MISMO paquete ficha+evaluación que arma el input del opener en el wizard. */
export function M4Contexto({
  lead,
  ficha,
  evaluacion,
}: {
  lead: CopyBlockLead
  ficha: Ficha | null
  evaluacion: Evaluacion | null
}) {
  if (!ficha || !evaluacion) {
    // Inalcanzable con la guardia del server (m4 exige EVALUADA con opener
    // pendiente) — vacío honesto por si el dato se pierde entre carga y render.
    return (
      <p className="text-xs leading-relaxed text-zinc-500">
        La ficha y la evaluación tienen que estar registradas antes de armar el opener.
      </p>
    )
  }
  return (
    <CopyBlock
      titulo="Bloque para el Gem de outreach"
      instruccion={INSTRUCCION_BLOQUE_M4}
      texto={buildOpenerInputBlock(lead, ficha, evaluacion)}
    />
  )
}

/** Munición: el Gem de outreach — link + qué es / qué le das (fuente
 * `herramientas.ts`) + el freno anti-spam del canal (5.6: `CanalSeguridad`,
 * la misma pieza que mostraba el paso del wizard antes de mandar el opener). */
export function M4Municion({ dmsHoy }: { dmsHoy: number }) {
  return (
    <div className="space-y-4">
      <ToolGuide id="gemOutreach" />
      <CanalSeguridad dmsHoy={dmsHoy} />
    </div>
  )
}

/** Registro: el form compartido del opener (vivo) o el «Enviado» (congelado al
 * volver desde el estado de espera). */
export function M4Registro({
  leadId,
  openerEnviado,
  ultimoContacto,
  proximoToque,
}: {
  leadId: string
  openerEnviado: boolean
  ultimoContacto: string | null
  proximoToque: string | null
}) {
  if (openerEnviado) {
    return <OpenerResumen ultimoContacto={ultimoContacto} proximoToque={proximoToque} />
  }
  // El form solo llega acá en el tramo editable real: la guardia del server no
  // habilita m4 sin opener pendiente, y con el primer contacto ya registrado
  // cae en el resumen.
  return <OpenerForm leadId={leadId} />
}
