/**
 * P2.B.2 — Invariante del schema de preferencias del reporte ejecutivo. Corre SIN DB ni server:
 *
 *   npm run check:invariant:executive-report-prefs
 *   (o: npx tsx "src/app/(protected)/dashboard/_actions/executive-report-prefs.invariant.ts")
 *
 * Verifica que ExecutiveReportPrefsSchema acepta EXACTAMENTE las 3 frecuencias
 * (WEEKLY/BIWEEKLY/DISABLED) cruzadas con las 3 cantidades que ofrece el Select
 * (3/5/10), y rechaza cualquier otro valor. El Select no puede producir un valor
 * fuera de ese set por construcción, pero la action es la última línea de
 * defensa server-side (defense-in-depth).
 */
import assert from 'node:assert/strict'
import { ExecutiveReportPrefsSchema } from './executive-report-prefs.schemas.ts'

// ── Combinaciones válidas: las 3 frecuencias × las 3 cantidades ───────────────
for (const frequency of ['WEEKLY', 'BIWEEKLY', 'DISABLED']) {
  for (const leadCount of [3, 5, 10]) {
    assert.equal(
      ExecutiveReportPrefsSchema.safeParse({ frequency, leadCount }).success,
      true,
      `${frequency} + ${leadCount} debe ser válido`,
    )
  }
}

// ── Frecuencia fuera del enum ──────────────────────────────────────────────────
assert.equal(
  ExecutiveReportPrefsSchema.safeParse({ frequency: 'MONTHLY', leadCount: 3 }).success,
  false,
  'frecuencia fuera del enum debe rechazarse',
)
assert.equal(
  ExecutiveReportPrefsSchema.safeParse({ frequency: 'weekly', leadCount: 3 }).success,
  false,
  'frecuencia en minúscula (case-sensitive) debe rechazarse',
)

// ── Cantidad fuera del set fijo — ni siquiera valores "razonables" como 7 valen ──
for (const leadCount of [0, 1, 2, 4, 7, 11, 50, -3]) {
  assert.equal(
    ExecutiveReportPrefsSchema.safeParse({ frequency: 'WEEKLY', leadCount }).success,
    false,
    `cantidad ${leadCount} debe rechazarse`,
  )
}

// ── Campos faltantes ───────────────────────────────────────────────────────────
assert.equal(ExecutiveReportPrefsSchema.safeParse({}).success, false, 'objeto vacío debe rechazarse')
assert.equal(
  ExecutiveReportPrefsSchema.safeParse({ frequency: 'WEEKLY' }).success,
  false,
  'sin leadCount debe rechazarse',
)
assert.equal(
  ExecutiveReportPrefsSchema.safeParse({ leadCount: 3 }).success,
  false,
  'sin frequency debe rechazarse',
)

console.log(
  '✓ invariante OK: ExecutiveReportPrefsSchema valida frecuencia + cantidad de ' +
    'leads y rechaza cualquier combinación fuera del set fijo.',
)
