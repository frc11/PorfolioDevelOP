/**
 * Chequeo de invariante del GATE DE ENVÍO de la demo (Sprint 5.3) — corre sin DB.
 *
 *   npm run check:invariant:gate-envio
 *
 * Cierra el hueco de gates en la capa invariante: verifica, de forma ejecutable
 * (no "es obvio"), que `gateEnvioDemo` es EXACTAMENTE la composición de sus tres
 * factores, sin colarse ninguno:
 *
 *     gateEnvioDemo  ⇔  stage === 'APROBADA'  ∧  finalUrl  ∧  gateBriefAbierto(status, caliente)
 *
 * Es la MISMA función pura que re-valida `enviarDemoAprobada` server-side (la UI
 * no ofrece el envío antes, pero la action no confía en la UI). El negativo fino
 * de e2e (`tests/leados/envio-demo-rechazo.spec.ts`) prueba el rechazo contra la
 * DB real; acá se fija la lógica de composición, barata y sin Neon.
 *
 * Importa `flow.ts` directo (relativo, con `.ts`): su árbol de runtime es
 * `@/`-free a propósito, así el harness ts-node lo carga sin tsconfig-paths —
 * mismo patrón que `flow.invariant.ts`.
 */
import assert from 'node:assert/strict'
import type { DossierStage, LeadStatus } from '@prisma/client'
import { gateEnvioDemo, gateBriefAbierto } from './flow.ts'

/** Combo base: los tres factores en verde (envío habilitado). */
type Params = Parameters<typeof gateEnvioDemo>[0]
const ABIERTO: Params = {
  status: 'RESPONDIO',
  caliente: false,
  stage: 'APROBADA',
  finalUrl: 'https://demo-final.example.com',
}

// ── 1. Los tres factores en verde → el envío se habilita ─────────────────────
assert.equal(gateEnvioDemo(ABIERTO), true, 'APROBADA + finalUrl + gate del brief abierto habilita el envío')

// ── 2. Cada factor es NECESARIO: tirar UNO solo cierra el gate ───────────────
// 2a. Sin APROBADA (cualquier otro stage) → cerrado, aunque todo lo demás esté.
const stagesNoAprobada: (DossierStage | null)[] = [
  'FICHA',
  'EVALUADA',
  'BRIEF',
  'CONSTRUCCION',
  'EN_REVISION',
  'RECHAZADA',
  'DESCARTADA',
  null,
]
for (const stage of stagesNoAprobada) {
  assert.equal(
    gateEnvioDemo({ ...ABIERTO, stage }),
    false,
    `stage ${stage} no es APROBADA: el envío NO se habilita aunque respondió y hay finalUrl`,
  )
}

// 2b. Sin finalUrl (null o vacío) → cerrado: no hay link permanente que mandar.
for (const finalUrl of [null, '']) {
  assert.equal(
    gateEnvioDemo({ ...ABIERTO, finalUrl }),
    false,
    `finalUrl ${JSON.stringify(finalUrl)}: sin link publicado el envío NO se habilita`,
  )
}

// 2c. Con el gate del brief CERRADO (no respondió y no caliente) → cerrado.
assert.equal(
  gateEnvioDemo({ ...ABIERTO, status: 'PROSPECTO', caliente: false }),
  false,
  'gate del brief cerrado (PROSPECTO, frío): APROBADA + finalUrl no alcanzan',
)

// ── 3. El tercer factor ES gateBriefAbierto — misma regla, sin drift ─────────
// Para APROBADA + finalUrl, el envío sigue 1:1 al gate del brief en TODO status.
const statuses: LeadStatus[] = [
  'PROSPECTO',
  'DEMO_ENVIADA',
  'VIO_VIDEO',
  'RESPONDIO',
  'CALL_AGENDADA',
  'CERRADO',
  'PERDIDO',
  'POSTERGADO',
]
for (const status of statuses) {
  for (const caliente of [false, true]) {
    assert.equal(
      gateEnvioDemo({ status, caliente, stage: 'APROBADA', finalUrl: ABIERTO.finalUrl }),
      gateBriefAbierto(status, caliente),
      `con APROBADA + finalUrl, el envío usa la MISMA regla que el brief (status=${status}, caliente=${caliente})`,
    )
  }
}

// ── 4. Las dos puertas del flujo invertido: responder O caliente lo abren ────
assert.equal(
  gateEnvioDemo({ status: 'RESPONDIO', caliente: false, stage: 'APROBADA', finalUrl: ABIERTO.finalUrl }),
  true,
  'el negocio respondió: se envía (camino natural)',
)
assert.equal(
  gateEnvioDemo({ status: 'PROSPECTO', caliente: true, stage: 'APROBADA', finalUrl: ABIERTO.finalUrl }),
  true,
  'lead caliente (campo de Franco): demo preventiva, se envía sin respuesta previa',
)

console.log(
  '✓ invariante OK: gateEnvioDemo es la composición exacta APROBADA ∧ finalUrl ∧ ' +
    'gateBriefAbierto — cada factor es necesario y el tercero es la MISMA regla que el ' +
    'gate del brief (sin drift server↔UI).',
)
