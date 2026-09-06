/**
 * LeadOS B-beta — Primitivas PURAS del escalamiento "me trabé" del setter.
 *
 * Sin Prisma ni 'use server' (mismo criterio que flow.ts / pipeline.ts /
 * revision.ts): son las reglas que el chequeo de invariante
 * (`escalamiento.invariant.ts`) verifica en frío y que comparten la action del
 * setter (persistencia) y el panorama del admin (marcador).
 *
 * Decisión de dueño: el escalamiento vive en el DOSSIER, no en el meta privado
 * por `setterId` (OsLeadSetterMeta). Es una señal OPERATIVA que el admin DEBE
 * ver y que sobrevive a una reasignación del lead — no es organización personal
 * del setter. Por eso su patch jamás lleva `setterId`: no toca el aislamiento.
 */
// `Prisma` como VALOR (no `import type`): RELOOP_RESET necesita `Prisma.DbNull`
// para limpiar un campo `Json?` (el cliente tipado no acepta `null` literal ahí).
// `DossierStage` sigue type-only (modificador inline, como en tests/helpers/setter-db).
import { Prisma, type DossierStage } from '@prisma/client'
// El GRAFO, para no volver a escribir una arista que ya está escrita. Import
// relativo con extensión, como el resto de este árbol: así lo cargan los
// invariantes con ts-node, sin tsconfig-paths. `dossier-stage.ts` no tiene un
// solo import de valor (solo `import type`), así que traerlo acá NO agrega
// nada al árbol de runtime — la corrida sin DB de los invariantes sigue igual.
import { LEGAL_TRANSITIONS } from './dossier-stage.ts'

/** Tope de la nota persistida — espejo del max de `EscalamientoInputSchema`. */
export const ESCALADO_NOTA_MAX = 1000

/**
 * Lo que se escribe en el dossier al escalar. Invariante de tipo: NUNCA incluye
 * `stage` ni `setterId` — persistir el escalamiento no es una transición ni
 * toca el dato privado del setter.
 */
export type EscaladoPatch = {
  escaladoAt: Date
  escaladoNota: string | null
}

/**
 * Patch puro del escalamiento: estampa la marca + guarda el contexto del setter
 * (trim + cap). `ahora` se inyecta para que sea testeable sin reloj oculto.
 */
export function buildEscaladoPatch(descripcion: string, ahora: Date): EscaladoPatch {
  const nota = descripcion.trim().slice(0, ESCALADO_NOTA_MAX)
  return { escaladoAt: ahora, escaladoNota: nota.length > 0 ? nota : null }
}

/**
 * Reset del escalamiento. Se mergea en TODA transición de stage
 * (`transitionDossier`): el pedido de ayuda es de la CONSTRUCCION vigente, así
 * que cualquier movida de stage lo resuelve/invalida — y un re-loop
 * RECHAZADA→CONSTRUCCION arranca limpio, sin arrastrar una marca vieja.
 */
export const ESCALADO_RESET = { escaladoAt: null, escaladoNota: null } as const

/**
 * El ÚNICO loop-back de la máquina de producción: reabrir un rechazo para
 * retrabajar la demo (RECHAZADA→CONSTRUCCION). Predicado puro compartido por
 * `transitionDossier` (que aplica el reset del re-loop) y el chequeo de
 * invariante (`reloop-selfcheck-reset.invariant.ts`) — una sola copia de "qué
 * cuenta como re-loop", server e invariante no pueden divergir.
 *
 * ── Por qué LEE el grafo (P8, caso 2) ───────────────────────────────────────
 * El destino salía de un literal `to === 'CONSTRUCCION'`: la arista
 * RECHAZADA→CONSTRUCCION estaba escrita DOS veces —acá y en `LEGAL_TRANSITIONS`—
 * sin nada que las atara. El invariante del grafo que C1c construyó no ve esta
 * copia: si el grafo cambiaba y la copia no, este predicado seguía diciendo que
 * sí a una arista que ya no existía, y `transitionDossier` aplicaba el
 * `RELOOP_RESET` sobre una transición ilegal — todo con la suite en verde.
 *
 * Ahora el destino sale del grafo. Lo que queda literal es el ORIGEN, que es el
 * concepto que esta función nombra («re-loop de RECHAZO»), no una arista.
 *
 * La arity de las salidas de RECHAZADA la vigila
 * `reloop-selfcheck-reset.invariant.ts`: si mañana RECHAZADA gana una segunda
 * salida, el reset del re-loop NO debe extenderse sola a ella — el invariante se
 * cae y obliga a decidir.
 */
export function esReloopRechazo(from: DossierStage, to: DossierStage): boolean {
  return from === 'RECHAZADA' && LEGAL_TRANSITIONS.RECHAZADA.includes(to)
}

/**
 * B6.2 — Reset ADICIONAL del re-loop RECHAZADA→CONSTRUCCION: limpia el self-check.
 *
 * El self-check es un GATE, no un auto-reporte: `selfCheckAprobado` lo lee para
 * habilitar el envío a revisión. Arrastrarlo al reabrir un rechazo dejaría
 * reenviar SIN corregir nada (los 6 hard-checks quedarían en verde de la vuelta
 * anterior). Limpiarlo hace que `selfCheckAprobado` vuelva a false → el setter
 * RE-verifica antes de reenviar. `Json?` en null se setea con `Prisma.DbNull`
 * (el cliente tipado no acepta `null` literal — mismo criterio que `agendaJson`
 * en agenda.ts).
 *
 * A propósito NO se mergea en `ESCALADO_RESET` (que corre en CADA transición): en
 * CONSTRUCCION→EN_REVISION el self-check DEBE sobrevivir — el admin lo lee en la
 * superficie de revisión (`SelfCheckPanel`, exigible en EN_REVISION/APROBADA). Por
 * eso `transitionDossier` lo aplica SOLO cuando `esReloopRechazo(from, to)`.
 *
 * PRESERVA el resto del progreso del re-loop: NO toca `progresoJson` (checklist de
 * fases, auto-reporte — decisión que se mantiene) ni `draftUrl` (la demo, que el
 * setter actualiza si corresponde). Solo `selfCheckJson`.
 */
export const RELOOP_RESET = { selfCheckJson: Prisma.DbNull } as const

/** Estado mínimo para evaluar el marcador (desacoplado de la fila Prisma). */
export type EscaladoState = {
  stage: DossierStage
  escaladoAt: Date | null
}

/**
 * El marcador del admin: hay un pedido de ayuda VIGENTE solo mientras la demo
 * sigue en construcción. Segundo cinturón sobre `ESCALADO_RESET` — aunque una
 * marca vieja sobreviviera, el gate por stage no la muestra fuera de CONSTRUCCION.
 */
export function estaEscalado(d: EscaladoState): boolean {
  return d.stage === 'CONSTRUCCION' && d.escaladoAt !== null
}
