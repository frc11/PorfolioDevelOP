'use server'

/**
 * LeadOS B3/B4 — Actions del dominio setter (pasos 1–6 del wizard).
 *
 * Invariantes (no negociables):
 *   - requireSetter() en TODAS — el middleware no alcanza.
 *   - Acceso a leads/dossiers SOLO vía getOwnedLead / getOwnedDossier /
 *     saveOwned* (ownership por assignedToId).
 *   - Cambios de stage SOLO vía transitionDossier.
 *   - El envío a revisión SOLO si los hard-blocks del self-check pasan —
 *     re-validado acá server-side con selfCheckAprobado, no se confía en la UI.
 *   - Acá NO existen transiciones de admin (EN_REVISION→APROBADA/RECHAZADA):
 *     son territorio de B5.
 */
import { revalidatePath } from 'next/cache'
import { requireSetter } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import { FichaSchema, type Brief } from '@/lib/leados/contracts'
import {
  DossierTransitionError,
  getOwnedDossier,
  marcarEscaladoOwned,
  saveOwnedBrief,
  saveOwnedDraftUrl,
  saveOwnedFicha,
  saveOwnedSelfCheck,
  transitionDossier,
} from '@/lib/leados/dossier'
import {
  buildSelfCheck,
  fichaFaltantes,
  gateBriefAbierto,
  parseFicha,
  parseSelfCheck,
  selfCheckAprobado,
} from '@/lib/leados/flow'
import {
  notificarEscalamientoConstruccion,
  notificarEvaluacionScoreAlto,
} from '@/lib/leados/notify'
import { SCORE_CALIENTE } from '@/lib/leados/revision'
import { getOwnedLead } from '@/lib/leados/ownership'
import {
  BriefInputSchema,
  DraftUrlInputSchema,
  EscalamientoInputSchema,
  EvaluacionInputSchema,
  LeadIdSchema,
  SelfCheckInputSchema,
} from './dossier.schemas'

function revalidarSetter(leadId: string) {
  revalidatePath('/setter')
  revalidatePath(`/setter/leads/${leadId}`)
}

/** B4: el envío a revisión también refresca la cola del admin (B5). */
function revalidarRevisionAdmin(leadId: string) {
  revalidatePath('/admin/leados')
  revalidatePath(`/admin/leados/${leadId}`)
}

function mapError(error: unknown, fallback: string): ActionResult<never> {
  if (error instanceof DossierTransitionError) {
    return fail(error.message)
  }
  if (error instanceof Error && error.message === 'Unauthorized') {
    return fail('No autorizado')
  }
  // Nunca exponer mensajes internos al cliente.
  return fail(fallback)
}

/**
 * Paso 1 — Guardado de la ficha (parcial o final: mismo action, la ficha es
 * toda opcional). Devuelve lo que falta para la señal mínima, así la UI dice
 * exactamente qué bloquea el paso de evaluación.
 */
export async function guardarFicha(
  leadIdRaw: unknown,
  inputRaw: unknown,
): Promise<ActionResult<{ faltantes: string[] }>> {
  try {
    const userId = await requireSetter()

    const leadId = LeadIdSchema.safeParse(leadIdRaw)
    if (!leadId.success) return fail('Lead inválido')

    const ficha = FichaSchema.safeParse(inputRaw)
    if (!ficha.success) return fail('Revisá los campos de la ficha')

    const dossier = await saveOwnedFicha(leadId.data, userId, ficha.data)
    if (!dossier) return fail('Lead no encontrado')

    revalidarSetter(leadId.data)
    return ok({ faltantes: fichaFaltantes(ficha.data) })
  } catch (error) {
    return mapError(error, 'No se pudo guardar la ficha')
  }
}

/**
 * Paso 2 — Transcripción de la evaluación externa. FICHA→EVALUADA siempre;
 * si el score es 1–2 encadena EVALUADA→DESCARTADA en el mismo flujo (el
 * setter no elige: el descarte honesto es trabajo bien hecho).
 */
export async function registrarEvaluacion(
  leadIdRaw: unknown,
  inputRaw: unknown,
): Promise<ActionResult<{ descartado: boolean; gateAbierto: boolean }>> {
  try {
    const userId = await requireSetter()

    const leadId = LeadIdSchema.safeParse(leadIdRaw)
    if (!leadId.success) return fail('Lead inválido')

    const input = EvaluacionInputSchema.safeParse(inputRaw)
    if (!input.success) {
      return fail(input.error.issues[0]?.message ?? 'Revisá los campos de la evaluación')
    }

    const lead = await getOwnedLead(leadId.data, userId)
    if (!lead) return fail('Lead no encontrado')

    const dossier = await getOwnedDossier(leadId.data, userId)
    if (!dossier) return fail('Primero completá la ficha de este lead')
    if (dossier.stage !== 'FICHA') {
      return fail('Este lead ya tiene la evaluación registrada')
    }

    const faltantes = fichaFaltantes(parseFicha(dossier.fichaJson))
    if (faltantes.length > 0) {
      return fail(`A la ficha le falta señal mínima — ${faltantes[0]}`)
    }

    const { score, veredicto, razonamiento, motivoDescarte } = input.data
    await transitionDossier(leadId.data, {
      to: 'EVALUADA',
      evaluacion: { score, veredicto, razonamiento },
    })

    let descartado = false
    if (score <= 2 && motivoDescarte) {
      await transitionDossier(leadId.data, {
        to: 'DESCARTADA',
        motivoDescarte,
      })
      descartado = true
    }

    // admin-1c: evaluación con score ≥ 4 → aviso INFORMATIVO a Franco (el setter
    // evaluó alto). Fire-and-forget (la función nunca lanza) y una sola vez por
    // dossier. Es la lectura del SETTER (su score), señal para que Franco
    // CONSIDERE marcar caliente — NO determina el caliente operativo (campo de
    // Franco, admin-1b) ni abre gates: no pasa por esCaliente(), solo notifica.
    if (score >= SCORE_CALIENTE) {
      await notificarEvaluacionScoreAlto(leadId.data)
    }

    revalidarSetter(leadId.data)
    return ok({
      descartado,
      // admin-1b: el gate del brief sigue el campo caliente (lo marca Franco), no
      // el score recién registrado por el setter.
      gateAbierto: !descartado && gateBriefAbierto(lead.status, lead.caliente),
    })
  } catch (error) {
    return mapError(error, 'No se pudo registrar la evaluación')
  }
}

/**
 * Paso 3 — Captura del brief. En EVALUADA guarda y transiciona a BRIEF (el
 * gate del flujo invertido lo valida transitionDossier — acá no se duplica
 * la regla, solo se traduce el error). En BRIEF re-guarda (re-pegado tras el
 * sanity-check visual) sin transición.
 */
export async function guardarBrief(
  leadIdRaw: unknown,
  inputRaw: unknown,
): Promise<ActionResult<{ stage: 'BRIEF' }>> {
  try {
    const userId = await requireSetter()

    const leadId = LeadIdSchema.safeParse(leadIdRaw)
    if (!leadId.success) return fail('Lead inválido')

    const input = BriefInputSchema.safeParse(inputRaw)
    if (!input.success) {
      return fail(input.error.issues[0]?.message ?? 'Revisá los campos del brief')
    }

    const dossier = await getOwnedDossier(leadId.data, userId)
    if (!dossier) return fail('Lead no encontrado')

    const brief: Brief = input.data
    const saved = await saveOwnedBrief(leadId.data, userId, brief)
    if (!saved) return fail('Lead no encontrado')

    if (dossier.stage === 'EVALUADA') {
      await transitionDossier(leadId.data, { to: 'BRIEF' })
    }

    revalidarSetter(leadId.data)
    return ok({ stage: 'BRIEF' })
  } catch (error) {
    return mapError(error, 'No se pudo guardar el brief')
  }
}

/**
 * Paso 4 — Arranque de la construcción (BRIEF→CONSTRUCCION). A partir de acá
 * el setter trabaja en Claude Design con el shell guiado del panel.
 */
export async function iniciarConstruccion(
  leadIdRaw: unknown,
): Promise<ActionResult<{ stage: 'CONSTRUCCION' }>> {
  try {
    const userId = await requireSetter()

    const leadId = LeadIdSchema.safeParse(leadIdRaw)
    if (!leadId.success) return fail('Lead inválido')

    const dossier = await getOwnedDossier(leadId.data, userId)
    if (!dossier) return fail('Lead no encontrado')
    if (dossier.stage !== 'BRIEF') {
      return fail('La construcción arranca con el brief guardado')
    }

    await transitionDossier(leadId.data, { to: 'CONSTRUCCION' })

    revalidarSetter(leadId.data)
    return ok({ stage: 'CONSTRUCCION' })
  } catch (error) {
    return mapError(error, 'No se pudo arrancar la construcción')
  }
}

/**
 * Loop de rechazo — Reapertura desde RECHAZADA (RECHAZADA→CONSTRUCCION). El
 * historial de rechazos queda intacto (solo transitionDossier lo appendea);
 * el setter rehace y vuelve a pasar por draft + self-check antes de reenviar.
 */
export async function reabrirConstruccion(
  leadIdRaw: unknown,
): Promise<ActionResult<{ stage: 'CONSTRUCCION' }>> {
  try {
    const userId = await requireSetter()

    const leadId = LeadIdSchema.safeParse(leadIdRaw)
    if (!leadId.success) return fail('Lead inválido')

    const dossier = await getOwnedDossier(leadId.data, userId)
    if (!dossier) return fail('Lead no encontrado')
    if (dossier.stage !== 'RECHAZADA') {
      return fail('Este dossier no tiene correcciones pendientes')
    }

    await transitionDossier(leadId.data, { to: 'CONSTRUCCION' })

    revalidarSetter(leadId.data)
    return ok({ stage: 'CONSTRUCCION' })
  } catch (error) {
    return mapError(error, 'No se pudo reabrir la construcción')
  }
}

/**
 * Paso 5 — Guardado de la draftUrl publicada en Netlify Drop. La validación
 * de que el link carga es humana (checkbox), exigida también por el schema.
 */
export async function guardarDraftUrl(
  leadIdRaw: unknown,
  inputRaw: unknown,
): Promise<ActionResult<{ draftUrl: string }>> {
  try {
    const userId = await requireSetter()

    const leadId = LeadIdSchema.safeParse(leadIdRaw)
    if (!leadId.success) return fail('Lead inválido')

    const input = DraftUrlInputSchema.safeParse(inputRaw)
    if (!input.success) {
      return fail(input.error.issues[0]?.message ?? 'Revisá la URL del draft')
    }

    const dossier = await saveOwnedDraftUrl(leadId.data, userId, input.data.draftUrl)
    if (!dossier) return fail('Lead no encontrado')

    revalidarSetter(leadId.data)
    return ok({ draftUrl: input.data.draftUrl })
  } catch (error) {
    return mapError(error, 'No se pudo guardar el draft')
  }
}

/**
 * Paso 6 — Guardado del self-check (parcial o completo). El server arma el
 * blob con buildSelfCheck contra las listas vigentes de flow.ts: los nombres
 * que ve el admin en B5 nunca vienen del cliente. Devuelve si quedó aprobado
 * (todos los hard-blocks en verde).
 */
export async function guardarSelfCheck(
  leadIdRaw: unknown,
  inputRaw: unknown,
): Promise<ActionResult<{ aprobado: boolean }>> {
  try {
    const userId = await requireSetter()

    const leadId = LeadIdSchema.safeParse(leadIdRaw)
    if (!leadId.success) return fail('Lead inválido')

    const input = SelfCheckInputSchema.safeParse(inputRaw)
    if (!input.success) return fail('Revisá los puntos del self-check')

    const selfCheck = buildSelfCheck(input.data.duros, input.data.softIds)
    const dossier = await saveOwnedSelfCheck(leadId.data, userId, selfCheck)
    if (!dossier) return fail('Lead no encontrado')

    revalidarSetter(leadId.data)
    return ok({ aprobado: selfCheckAprobado(selfCheck) })
  } catch (error) {
    return mapError(error, 'No se pudo guardar el self-check')
  }
}

/**
 * Paso 6 — Envío a revisión (CONSTRUCCION→EN_REVISION). LA única forma de que
 * un dossier llegue a la cola del admin por flujo real. Gate con dientes:
 * draft publicado + self-check GUARDADO con todos los hard-blocks vigentes en
 * verde, re-validado acá contra la DB — llamar la action con un hard-block en
 * falla (devtools mediante) rebota igual.
 */
export async function enviarARevision(
  leadIdRaw: unknown,
): Promise<ActionResult<{ stage: 'EN_REVISION' }>> {
  try {
    const userId = await requireSetter()

    const leadId = LeadIdSchema.safeParse(leadIdRaw)
    if (!leadId.success) return fail('Lead inválido')

    const dossier = await getOwnedDossier(leadId.data, userId)
    if (!dossier) return fail('Lead no encontrado')
    if (dossier.stage !== 'CONSTRUCCION') {
      return fail('Solo se envía a revisión una demo en construcción')
    }
    if (!dossier.draftUrl) {
      return fail('Falta publicar el draft (Paso 5) antes de enviar a revisión')
    }
    const selfCheck = parseSelfCheck(dossier.selfCheckJson)
    if (!selfCheckAprobado(selfCheck)) {
      return fail(
        'El self-check no está aprobado: guardalo con todos los puntos obligatorios en verde',
      )
    }

    await transitionDossier(leadId.data, { to: 'EN_REVISION' })

    revalidarSetter(leadId.data)
    revalidarRevisionAdmin(leadId.data)
    return ok({ stage: 'EN_REVISION' })
  } catch (error) {
    return mapError(error, 'No se pudo enviar a revisión')
  }
}

/**
 * Capa "si se traba" — Escalamiento del setter. Persiste la marca en el dossier
 * (B-beta: `escaladoAt`/`escaladoNota` vía `marcarEscaladoOwned`) Y empuja un
 * Telegram a Franco. El registro durable es la DB: si Telegram falla, el flujo
 * no se rompe, el escalamiento ya quedó visible en el panel del admin y la UI le
 * dice al setter que escriba directo.
 */
export async function escalarConstruccion(
  leadIdRaw: unknown,
  inputRaw: unknown,
): Promise<ActionResult<{ enviado: boolean }>> {
  try {
    const userId = await requireSetter()

    const leadId = LeadIdSchema.safeParse(leadIdRaw)
    if (!leadId.success) return fail('Lead inválido')

    const input = EscalamientoInputSchema.safeParse(inputRaw)
    if (!input.success) {
      return fail(input.error.issues[0]?.message ?? 'Contá qué te trabó')
    }

    // Persistir PRIMERO: el escalamiento queda marcado en el dossier (Franco lo
    // ve en el panel) AUNQUE Telegram falle. marcarEscaladoOwned hace ownership
    // (nunca se escala ni se leakea un lead ajeno) + guard de stage adentro.
    const dossier = await marcarEscaladoOwned(leadId.data, userId, input.data.descripcion)
    if (!dossier) return fail('Lead no encontrado')

    // Push opcional a Franco. Ya está persistido: el boolean solo decide el copy
    // del toast (aviso instantáneo vs "escribile directo").
    const enviado = await notificarEscalamientoConstruccion({
      leadId: leadId.data,
      descripcion: input.data.descripcion,
    })

    return ok({ enviado })
  } catch (error) {
    return mapError(error, 'No se pudo escalar el problema')
  }
}
