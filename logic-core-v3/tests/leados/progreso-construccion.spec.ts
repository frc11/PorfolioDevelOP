import { test, expect } from '@playwright/test'
import {
  createSetter,
  createLead,
  getDossier,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'
// Cadena REAL bajo prueba (NO se toca: se TESTEA). Ninguno arrastra next/headers.
// Se llama la LIB directa (no la action `guardarProgreso`): la action agrega
// requireSetter()/revalidate por-request, fuera del runner in-process — igual que
// selfcheck-anti-bypass testea saveOwnedSelfCheck, no la action.
import {
  saveOwnedProgreso,
  getOwnedDossier,
  transitionDossier,
} from '../../src/lib/leados/dossier'
import { parseProgreso } from '../../src/lib/leados/flow'
import { FASE_IDS } from '../../src/lib/leados/contracts'

/**
 * PERSISTENCIA DE LA CONSTRUCCIÓN EXPLOTADA (Sprint E.4 / el 5.4 diferido) — cubre
 * el comportamiento NUEVO que E.1 (persistencia) + E.2 (UI) trajeron al checklist
 * de construcción. NO re-verifica el gate del self-check (5.3, selfcheck-anti-bypass)
 * ni la mecánica de la transición/re-loop en sí (dossier-gates): asserta que el
 * PROGRESO auto-reportado
 *   1. persiste (tildar/des-tildar sobrevive un refresh, releído de progresoJson),
 *   2. sobrevive el re-loop RECHAZADA→CONSTRUCCION (la decisión adoptada), y
 *   3. está aislado por dueño en runtime (lo que el invariante progreso-isolation
 *      prueba puro; acá confirmado con dos setters).
 *
 * Se asserta por COMPORTAMIENTO (el progreso está/no está; la fase destacada = la
 * primera sin tildar, espejo de la derivación del componente), NUNCA por las
 * etiquetas internas de las fases: los fixtures se DERIVAN de FASE_IDS en vivo
 * (mismo criterio que el anti-bypass deriva de HARD_CHECKS). NINGÚN gate se relaja:
 * `saveOwnedProgreso` escribe SOLO progresoJson (stage-guarded a CONSTRUCCION) y la
 * transición se usa tal cual (idéntico al re-loop de 5.3).
 *
 * In-process (Prisma directo, sin browser/Next), datos namespaced + teardown por id
 * exacto. Mismo harness que dossier-gates / selfcheck-anti-bypass.
 */

const tracker: SmokeTracker = newTracker()
let setterId: string
let otroSetterId: string

test.beforeAll(async () => {
  const a = await createSetter(tracker, 'progreso-a')
  const b = await createSetter(tracker, 'progreso-b')
  setterId = a.id
  otroSetterId = b.id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

/**
 * Espejo de la derivación del componente (checklist-construccion.tsx): la fase
 * DESTACADA ("una a la vez") es la PRIMERA de FASE_IDS que todavía no está hecha.
 * `null` = todas hechas. Se afirma esta CONDUCTA derivada, no el titulo de la fase.
 */
function faseDestacada(completadas: readonly string[]): string | null {
  return FASE_IDS.find((id) => !completadas.includes(id)) ?? null
}

/** Lectura FRESCA del progreso (lo que hace el page loader en cada carga). */
async function progresoDe(leadId: string, ownerId: string) {
  const dossier = await getOwnedDossier(leadId, ownerId)
  return parseProgreso(dossier?.progresoJson ?? null)
}

test('el progreso persiste: tildar una fase sobrevive un refresh (releído de progresoJson)', async () => {
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'Progreso Persiste',
    stage: 'CONSTRUCCION',
  })

  // Arranque: checklist FRESCO (sin fases hechas) → la destacada es la primera.
  const inicial = parseProgreso((await getDossier(leadId))?.progresoJson ?? null)
  expect(inicial.completadas, 'arranca sin fases hechas').toEqual([])
  expect(faseDestacada(inicial.completadas), 'la destacada es la primera fase sin tildar').toBe(
    FASE_IDS[0],
  )

  // Tildar la primera fase (conducta del toggle: persiste el set completo de hechas).
  const primera = FASE_IDS[0]
  await saveOwnedProgreso(leadId, setterId, { completadas: [primera] })

  // "Refresh" = una LECTURA NUEVA desde la DB (no el retorno del write).
  const trasRefresh = await progresoDe(leadId, setterId)
  expect(trasRefresh.completadas, 'la fase tildada sobrevive el refresh').toContain(primera)
  // Conducta derivada: la destacada avanzó a la SIGUIENTE fase sin tildar.
  expect(faseDestacada(trasRefresh.completadas), 'la destacada avanza a la siguiente').toBe(
    FASE_IDS[1],
  )

  // Des-tildar también persiste (auto-reporte editable): vuelve a fresco.
  await saveOwnedProgreso(leadId, setterId, { completadas: [] })
  const trasDestildar = await progresoDe(leadId, setterId)
  expect(trasDestildar.completadas, 'des-tildar sobrevive el refresh (vuelve a vacío)').toEqual([])
  expect(faseDestacada(trasDestildar.completadas), 'la destacada vuelve a la primera').toBe(
    FASE_IDS[0],
  )
})

test('el re-loop RECHAZADA→CONSTRUCCION preserva el progreso (no se resetea)', async () => {
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'Progreso Re-loop',
    stage: 'CONSTRUCCION',
  })

  // Tildar 3 fases en orden NO lineal (fases 1/3/4) — auto-reporte editable.
  const marcadas = [FASE_IDS[0], FASE_IDS[2], FASE_IDS[3]]
  await saveOwnedProgreso(leadId, setterId, { completadas: marcadas })

  // Ciclo de rechazo por la máquina de stage (misma que 5.3; el gate del self-check
  // vive en la action, no acá — no se relaja nada): CONSTRUCCION → EN_REVISION →
  // RECHAZADA → CONSTRUCCION.
  await transitionDossier(leadId, { to: 'EN_REVISION' })
  await transitionDossier(leadId, { to: 'RECHAZADA', motivo: 'Faltan assets reales del negocio' })
  const reabierto = await transitionDossier(leadId, { to: 'CONSTRUCCION' })
  expect(reabierto.stage, 'reabrió en CONSTRUCCION').toBe('CONSTRUCCION')

  // Conducta: las 3 fases hechas SOBREVIVEN el re-loop (la transición no las resetea).
  const trasReloop = await progresoDe(leadId, setterId)
  expect([...trasReloop.completadas].sort(), 'el progreso sobrevive el re-loop').toEqual(
    [...marcadas].sort(),
  )
  // Y la fase destacada sigue siendo la primera sin tildar tras reabrir (fase 2).
  expect(faseDestacada(trasReloop.completadas), 'la destacada se mantiene coherente').toBe(
    FASE_IDS[1],
  )
})

test('aislamiento cross-setter: el progreso se lee/escribe SOLO por el dueño', async () => {
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'Progreso Aislado',
    stage: 'CONSTRUCCION',
  })

  // El dueño tilda la primera fase.
  await saveOwnedProgreso(leadId, setterId, { completadas: [FASE_IDS[0]] })

  // Un NO-dueño NO puede ESCRIBIR: saveOwnedProgreso resuelve a otro dueño → null,
  // sin tocar el dossier ajeno (no lanza: devuelve null antes de escribir).
  const escrituraAjena = await saveOwnedProgreso(leadId, otroSetterId, {
    completadas: [FASE_IDS[1], FASE_IDS[2]],
  })
  expect(escrituraAjena, 'un no-dueño no escribe el progreso ajeno (null)').toBeNull()

  // Un NO-dueño NO puede LEER el dossier.
  expect(
    await getOwnedDossier(leadId, otroSetterId),
    'un no-dueño no lee el dossier ajeno',
  ).toBeNull()

  // El progreso del dueño quedó INTACTO: la escritura ajena no lo pisó.
  const delDueno = await progresoDe(leadId, setterId)
  expect(delDueno.completadas, 'la escritura ajena no alteró el progreso del dueño').toEqual([
    FASE_IDS[0],
  ])
})
