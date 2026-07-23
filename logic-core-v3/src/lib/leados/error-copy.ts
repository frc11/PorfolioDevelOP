/**
 * LeadOS 4.1 — Traducción de los errores del MOTOR a copy operativo.
 *
 * `dossier.ts` habla en jerga de máquina de estados («Transición ilegal:
 * CONSTRUCCION → EN_REVISION», «self-check», «draft», «stage»). Eso NUNCA llega
 * al setter: las actions pasan el mensaje por acá antes de devolverlo.
 *
 * Reglas del mapa (no negociables):
 *   - `dossier.ts` NO se toca: sus mensajes son la CLAVE, el copy vive acá.
 *   - Traducción SOLO de lo conocido: cada entrada es un mensaje literal del
 *     motor. Lo que no matchea cae a `COPY_GENERICO` — honesto, jamás algo que
 *     suene a éxito, jamás un match por substring amplio.
 *   - El único match no-literal es el prefijo ANCLADO `Transición ilegal: `,
 *     porque ese mensaje lleva los stages interpolados. Es un error específico,
 *     no una familia difusa.
 *   - Copy = qué pasó + qué hacer, en el vocabulario canónico del manual
 *     (borrador, chequeo final, negocio, demo) — nunca draft/self-check/stage.
 */

/** Rebote por estado ya movido: casi siempre, otra pestaña abierta del mismo lead. */
const COPY_MULTITAB = 'Esto ya se actualizó en otra pestaña — recargá para ver el estado real.'

/** Fallback honesto para lo NO mapeado. Nunca suena a éxito. */
export const COPY_GENERICO =
  'Algo falló al guardar — probá de nuevo; si sigue, avisale a Franco.'

/** Prefijo del único mensaje del motor con datos interpolados. */
const PREFIJO_TRANSICION_ILEGAL = 'Transición ilegal: '

/**
 * Mensaje literal de `dossier.ts` → copy operativo. El orden es el del archivo
 * del motor, así el censo se re-verifica de un vistazo.
 */
const COPY_POR_MENSAJE: Readonly<Record<string, string>> = {
  'No existe dossier para ese lead':
    'Este lead todavía no tiene ficha arrancada — abrilo desde tu cartera y empezá por la ficha.',

  'Gate EVALUADA→BRIEF: el lead no respondió el primer contacto y no está marcado caliente':
    'Todavía no se puede pasar al brief: el negocio no respondió el primer contacto y Franco no lo marcó caliente. Seguí con el seguimiento.',

  'EVALUADA→DESCARTADA requiere motivoDescarte':
    'Para descartar el lead falta el motivo — escribí por qué no va.',

  'EVALUADA→DESCARTADA: evaluacionJson ausente o inválido — no debería pasar, EVALUADA lo exige':
    'La evaluación de este lead quedó incompleta — recargá y volvé a registrarla; si sigue, avisale a Franco.',

  'EN_REVISION→RECHAZADA requiere motivo':
    'Falta el motivo del rechazo — escribí qué hay que corregir.',

  'El dossier cambió de stage durante la transición — reintentar': COPY_MULTITAB,

  'El dossier desapareció durante la transición':
    'Se perdió el rastro de este lead mientras se guardaba — recargá; si sigue, avisale a Franco.',

  'La ficha solo se edita antes de registrar la evaluación':
    'La ficha ya no se edita: este lead tiene la evaluación registrada.',

  'El dossier cambió de stage durante el guardado — recargá': COPY_MULTITAB,

  'El draft se publica durante la construcción — arrancala primero':
    'El borrador se carga con la construcción arrancada — arrancala primero y volvé.',

  'El escalamiento es de la construcción en curso':
    'Solo se puede pedir ayuda mientras la construcción está en curso.',

  'El dossier cambió de stage durante el escalamiento — recargá': COPY_MULTITAB,

  'El self-check se completa durante la construcción':
    'El chequeo final se completa mientras la demo está en construcción.',

  'El progreso se registra durante la construcción':
    'El progreso se marca mientras la demo está en construcción.',

  'La demo se envía cuando Franco la aprobó':
    'Esta demo todavía no está aprobada por Franco — el envío se habilita cuando la aprueba.',

  'El brief se captura después de la evaluación':
    'El brief se captura después de registrar la evaluación.',
}

/**
 * Traduce un mensaje del motor a copy operativo. Devuelve `null` si NO está
 * mapeado — el caller decide (las actions usan `COPY_GENERICO`), así el
 * "no lo conozco" queda explícito y testeable.
 */
export function copyDeErrorDeMotor(mensaje: string): string | null {
  if (mensaje.startsWith(PREFIJO_TRANSICION_ILEGAL)) return COPY_MULTITAB
  return COPY_POR_MENSAJE[mensaje] ?? null
}

/** Lo que sale al cliente: copy operativo, o el genérico honesto. */
export function copyOperativo(mensaje: string): string {
  return copyDeErrorDeMotor(mensaje) ?? COPY_GENERICO
}
